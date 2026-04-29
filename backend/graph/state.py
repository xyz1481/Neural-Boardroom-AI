"""
graph/state.py — Shared TypedDict flowing through every LangGraph node.
"""
from __future__ import annotations
import operator
from typing import Annotated, Any
from typing_extensions import TypedDict


class StartupState(TypedDict, total=False):
    # ── Inputs ────────────────────────────────────────────────
    idea: str
    total_budget: float
    selected_agents: list[str]

    # ── CFO outputs ───────────────────────────────────────────
    budget_allocation: dict[str, Any]   # { marketing, tech, operations }
    financial_plan: str
    research_data: str

    # ── CTO output ────────────────────────────────────────────
    tech_plan: str

    # ── CMO output ────────────────────────────────────────────
    marketing_plan: str

    # ── CEO output ────────────────────────────────────────────
    final_decision: str

    # ── Workflow metadata ─────────────────────────────────────
    messages_history: list[dict[str, str]]
    # Annotated with operator.add so concurrent nodes (CTO + CMO) can both
    # append their step logs without LangGraph raising INVALID_CONCURRENT_GRAPH_UPDATE
    steps: Annotated[list[dict[str, str]], operator.add]
    iteration: int
