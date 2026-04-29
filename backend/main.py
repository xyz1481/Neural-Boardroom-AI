from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import json
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

from agents.researcher import researcher_node
from agents.cfo import cfo_node
from agents.cto import cto_node
from agents.cmo import cmo_node
from agents.ceo import ceo_node
from tools.base_payouts import execute_usdc_payouts, fetch_treasury_snapshot

app = FastAPI(title="Startup Simulator API")

AGENT_PRICE_USDC = 0.5
PLATFORM_SPLIT = 0.2
AGENT_SPLIT = 0.8
AGENT_SEQUENCE = [
    ("researcher", "Researcher", researcher_node),
    ("cfo", "CFO", cfo_node),
    ("cto", "CTO", cto_node),
    ("cmo", "CMO", cmo_node),
    ("ceo", "CEO", ceo_node),
]
AGENT_LABELS = {key: label for key, label, _ in AGENT_SEQUENCE}
DEFAULT_SELECTED_AGENTS = [key for key, _, _ in AGENT_SEQUENCE]
AGENT_WALLETS = {
    "researcher": os.getenv("BASE_RESEARCHER_WALLET", "0x1111111111111111111111111111111111111111"),
    "cfo": os.getenv("BASE_CFO_WALLET", "0x2222222222222222222222222222222222222222"),
    "cto": os.getenv("BASE_CTO_WALLET", "0x3333333333333333333333333333333333333333"),
    "cmo": os.getenv("BASE_CMO_WALLET", "0x4444444444444444444444444444444444444444"),
    "ceo": os.getenv("BASE_CEO_WALLET", "0x5555555555555555555555555555555555555555"),
}
PLATFORM_TREASURY_WALLET = os.getenv("BASE_PLATFORM_TREASURY_WALLET", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")


TREASURY_STATE = {
    "platform_balance": 0.0,
    "agent_balances": {agent_key: 0.0 for agent_key in AGENT_WALLETS},
    "last_payouts": [],
    "last_payout_result": {},
}


def normalize_selected_agents(selected_agents: list[str] | None) -> list[str]:
    if not selected_agents:
        return DEFAULT_SELECTED_AGENTS.copy()

    normalized = []
    for agent in selected_agents:
        agent_key = str(agent).strip().lower()
        if agent_key in AGENT_LABELS and agent_key not in normalized:
            normalized.append(agent_key)

    return normalized or DEFAULT_SELECTED_AGENTS.copy()


def calculate_checkout_amount(selected_agents: list[str]) -> float:
    return round(len(selected_agents) * AGENT_PRICE_USDC, 2)


def build_payout_plan(selected_agents: list[str], amount: float) -> dict[str, object]:
    platform_share = round(amount * PLATFORM_SPLIT, 2)
    agent_pool = round(amount * AGENT_SPLIT, 2)
    per_agent_share = round(agent_pool / max(1, len(selected_agents)), 2)

    payouts = [
        {
            "recipient": "platform",
            "wallet": PLATFORM_TREASURY_WALLET,
            "amount": platform_share,
        }
    ]

    for agent_key in selected_agents:
        payouts.append(
            {
                "recipient": AGENT_LABELS[agent_key],
                "wallet": AGENT_WALLETS[agent_key],
                "amount": per_agent_share,
            }
        )

    return {
        "platform_share": platform_share,
        "agent_pool": agent_pool,
        "per_agent_share": per_agent_share,
        "payouts": payouts,
    }


def record_payouts(payout_plan: dict[str, object]) -> None:
    TREASURY_STATE["platform_balance"] += float(payout_plan["platform_share"])
    for payout in payout_plan["payouts"]:
        if payout["recipient"] == "platform":
            continue
        agent_key = next(
            (key for key, label in AGENT_LABELS.items() if label == payout["recipient"]),
            None,
        )
        if agent_key:
            TREASURY_STATE["agent_balances"][agent_key] += float(payout["amount"])

    TREASURY_STATE["last_payouts"] = payout_plan["payouts"]


def execute_payouts(payout_plan: dict[str, object]) -> dict[str, object]:
    payout_result = execute_usdc_payouts(payout_plan["payouts"], PLATFORM_TREASURY_WALLET)
    TREASURY_STATE["last_payout_result"] = payout_result
    if payout_result.get("mode") != "base-onchain":
        record_payouts(payout_plan)
    return payout_result


@app.get("/treasury/summary")
async def treasury_summary():
    snapshot = fetch_treasury_snapshot(PLATFORM_TREASURY_WALLET, AGENT_WALLETS)
    if snapshot.get("mode") == "demo-ledger":
        snapshot["platform_balance"] = round(TREASURY_STATE["platform_balance"], 2)
        snapshot["agent_wallets"] = [
            {
                "agent": AGENT_LABELS[agent_key],
                "wallet": wallet,
                "balance": round(TREASURY_STATE["agent_balances"][agent_key], 2),
            }
            for agent_key, wallet in AGENT_WALLETS.items()
        ]
        snapshot["last_payouts"] = TREASURY_STATE["last_payouts"]
        snapshot["last_payout_result"] = TREASURY_STATE["last_payout_result"]
    return snapshot

# Setup CORS for production and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartupRequest(BaseModel):
    objective: str
    selected_agents: list[str] = Field(default_factory=list)

@app.post("/create-checkout")
async def create_checkout(request: StartupRequest):
    locus_api_url = os.getenv("LOCUS_API_URL")
    locus_api_key = os.getenv("LOCUS_API_KEY")
    selected_agents = normalize_selected_agents(request.selected_agents)
    checkout_amount = calculate_checkout_amount(selected_agents)
    
    if locus_api_key == "claw_dev_REPLACE_ME":
        # Fallback for testing if key not set
        return {
            "sessionId": "test_session_" + request.objective[:10],
            "amount": checkout_amount,
            "selectedAgents": selected_agents,
        }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{locus_api_url}/checkout/sessions",
                headers={
                    "Authorization": f"Bearer {locus_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "amount": f"{checkout_amount:.2f}",
                    "currency": "USDC",
                    "description": f"Boardroom Simulation: {request.objective}",
                    "successUrl": "http://localhost:5173/?success=true",
                    "cancelUrl": "http://localhost:5173/?cancel=true",
                    "metadata": {
                        "objective": request.objective,
                        "selected_agents": selected_agents,
                        "agent_count": len(selected_agents),
                        "amount": checkout_amount,
                    }
                }
            )
            if response.status_code not in [200, 201]:
                print(f"Locus API Error: {response.status_code} - {response.text}")
                return {"error": response.text, "sessionId": None, "amount": checkout_amount}
            locus_data = response.json()
            session_id = locus_data.get("data", {}).get("id")
            return {
                "sessionId": session_id,
                "amount": checkout_amount,
                "selectedAgents": selected_agents,
            }
        except Exception as e:
            print(f"Internal Error calling Locus: {str(e)}")
            return {"error": str(e), "sessionId": None, "amount": checkout_amount}

@app.post("/simulate")
async def run_startup(request: StartupRequest):
    selected_agents = normalize_selected_agents(request.selected_agents)
    payout_plan = build_payout_plan(selected_agents, calculate_checkout_amount(selected_agents))
    initial_state = {
        "idea": request.objective,
        "total_budget": 100000.0,
        "steps": [],
        "selected_agents": selected_agents,
    }
    
    async def event_generator():
        try:
            state = initial_state.copy()

            for node_name, agent_label, node_function in AGENT_SEQUENCE:
                if node_name not in selected_agents:
                    continue

                state_update = node_function(state)
                state.update(state_update)

                if "steps" in state_update:
                    for step in state_update["steps"]:
                        if isinstance(step, dict):
                            agent_name = step.get("agent", agent_label)
                            text_content = step.get("text", "Deliberating...")

                            event_data = {
                                "type": "step",
                                "agent": agent_name,
                                "text": text_content,
                            }
                            yield f"data: {json.dumps(event_data)}\n\n"

                            if agent_name in AGENT_LABELS.values():
                                payout_amount = payout_plan["per_agent_share"]
                                payout_event = {
                                    "type": "payout",
                                    "agent": agent_name,
                                    "amount": payout_amount,
                                    "wallet": AGENT_WALLETS.get(
                                        next(
                                            key for key, label in AGENT_LABELS.items() if label == agent_name
                                        ),
                                        None,
                                    ),
                                }
                                yield f"data: {json.dumps(payout_event)}\n\n"
                        else:
                            event_data = {
                                "type": "step",
                                "agent": agent_label,
                                "text": str(step),
                            }
                            yield f"data: {json.dumps(event_data)}\n\n"

            payout_result = execute_payouts(payout_plan)
            if payout_result.get("tx_hashes"):
                yield f"data: {json.dumps({'type': 'payout_result', 'result': payout_result})}\n\n"

            yield f"data: {json.dumps({'type': 'final'})}\n\n"
            
        except Exception as e:
            error_data = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
