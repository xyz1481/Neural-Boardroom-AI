"""
Base payout helpers for ERC-20 USDC transfers and wallet balance reads.

This module is designed to work in two modes:
- live on-chain mode when BASE_RPC_URL + BASE_TREASURY_PRIVATE_KEY are configured
- demo mode when those secrets are not available yet
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from eth_account import Account
from web3 import Web3

from config import BASE_CHAIN_ID, BASE_RPC_URL, BASE_TREASURY_PRIVATE_KEY, BASE_USDC_ADDRESS

USDC_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": False,
        "stateMutability": "view",
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "payable": False,
        "stateMutability": "view",
        "type": "function",
    },
    {
        "constant": False,
        "inputs": [
            {"name": "recipient", "type": "address"},
            {"name": "amount", "type": "uint256"},
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


def is_live_base_enabled() -> bool:
    return bool(BASE_RPC_URL and BASE_TREASURY_PRIVATE_KEY and BASE_USDC_ADDRESS)


def get_web3() -> Web3 | None:
    if not BASE_RPC_URL:
        return None

    return Web3(Web3.HTTPProvider(BASE_RPC_URL, request_kwargs={"timeout": 20}))


def get_usdc_contract(web3: Web3):
    return web3.eth.contract(address=Web3.to_checksum_address(BASE_USDC_ADDRESS), abi=USDC_ABI)


def _amount_to_units(amount: float, decimals: int) -> int:
    return int(round(amount * (10**decimals)))


def _read_usdc_balance(web3: Web3, wallet_address: str) -> float:
    contract = get_usdc_contract(web3)
    decimals = contract.functions.decimals().call()
    raw_balance = contract.functions.balanceOf(Web3.to_checksum_address(wallet_address)).call()
    return float(raw_balance) / float(10**decimals)


def fetch_treasury_snapshot(platform_wallet: str, agent_wallets: dict[str, str]) -> dict[str, Any]:
    web3 = get_web3()
    snapshot_mode = "demo-ledger"

    if web3 and web3.is_connected() and is_live_base_enabled():
        try:
            treasury_wallet = Web3.to_checksum_address(platform_wallet)
            platform_balance = _read_usdc_balance(web3, treasury_wallet)
            agent_wallet_rows = [
                {
                    "agent": agent_key.upper(),
                    "wallet": wallet,
                    "balance": _read_usdc_balance(web3, wallet),
                }
                for agent_key, wallet in agent_wallets.items()
            ]
            return {
                "platform_wallet": treasury_wallet,
                "platform_balance": round(platform_balance, 6),
                "agent_wallets": agent_wallet_rows,
                "last_payouts": [],
                "mode": "base-onchain",
                "chain_id": BASE_CHAIN_ID,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }
        except Exception:
            snapshot_mode = "demo-ledger"

    return {
        "platform_wallet": platform_wallet,
        "platform_balance": 0.0,
        "agent_wallets": [
            {"agent": agent_key.upper(), "wallet": wallet, "balance": 0.0}
            for agent_key, wallet in agent_wallets.items()
        ],
        "last_payouts": [],
        "mode": snapshot_mode,
        "chain_id": BASE_CHAIN_ID,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


def execute_usdc_payouts(
    payouts: list[dict[str, Any]],
    treasury_wallet: str,
) -> dict[str, Any]:
    """Send live Base USDC transfers when configured, otherwise return a dry-run payload."""

    if not is_live_base_enabled():
        return {
            "mode": "demo-ledger",
            "tx_hashes": [],
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "treasury_wallet": treasury_wallet,
            "status": "dry-run",
        }

    web3 = get_web3()
    if not web3 or not web3.is_connected():
        raise RuntimeError("Base RPC is unavailable.")

    treasury_checksum = Web3.to_checksum_address(treasury_wallet)
    account = Account.from_key(BASE_TREASURY_PRIVATE_KEY)
    if account.address.lower() != treasury_checksum.lower():
        raise RuntimeError("BASE_TREASURY_PRIVATE_KEY does not match BASE_PLATFORM_TREASURY_WALLET.")

    contract = get_usdc_contract(web3)
    decimals = contract.functions.decimals().call()
    current_nonce = web3.eth.get_transaction_count(treasury_checksum, block_identifier="pending")
    gas_price = web3.eth.gas_price
    tx_hashes: list[str] = []

    for index, payout in enumerate(payouts):
        recipient = Web3.to_checksum_address(payout["wallet"])
        amount = float(payout["amount"])
        amount_units = _amount_to_units(amount, decimals)

        built_tx = contract.functions.transfer(recipient, amount_units).build_transaction(
            {
                "from": treasury_checksum,
                "chainId": BASE_CHAIN_ID,
                "nonce": current_nonce + index,
            }
        )
        estimated_gas = web3.eth.estimate_gas(built_tx)
        built_tx["gas"] = int(estimated_gas * 1.2)
        built_tx["maxFeePerGas"] = int(gas_price * 2)
        built_tx["maxPriorityFeePerGas"] = int(max(gas_price * 0.1, 1))

        signed_tx = web3.eth.account.sign_transaction(built_tx, BASE_TREASURY_PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_hashes.append(tx_hash.hex())

    return {
        "mode": "base-onchain",
        "tx_hashes": tx_hashes,
        "executed_at": datetime.now(timezone.utc).isoformat(),
        "treasury_wallet": treasury_wallet,
        "status": "submitted",
    }
