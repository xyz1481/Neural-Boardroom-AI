"""
graph/workflow.py — Builds and compiles the LangGraph StateGraph.

Relative import (.state) is used because this module is inside the graph/ package.
All agent imports are absolute from the backend/ root (cwd when running uvicorn).
"""
from langgraph.graph import StateGraph, END
from .state import StartupState          # relative — sibling inside graph/
from agents.cfo import cfo_node          # absolute from backend/ root
from agents.cto import cto_node
from agents.cmo import cmo_node
from agents.ceo import ceo_node
from agents.researcher import researcher_node


def build_workflow():
    """Builds and compiles the LangGraph state graph."""

    workflow = StateGraph(StartupState)

    # ── Nodes ─────────────────────────────────────────────────
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("cfo", cfo_node)
    workflow.add_node("cto", cto_node)
    workflow.add_node("cmo", cmo_node)
    workflow.add_node("ceo", ceo_node)

    # ── Edges ─────────────────────────────────────────────────
    workflow.set_entry_point("researcher")

    # Researcher → CFO
    workflow.add_edge("researcher", "cfo")

    # CFO → CTO and CMO (fan-out)
    workflow.add_edge("cfo", "cto")
    workflow.add_edge("cfo", "cmo")

    # CTO + CMO → CEO (fan-in)
    workflow.add_edge("cto", "ceo")
    workflow.add_edge("cmo", "ceo")

    # CEO → END
    workflow.add_edge("ceo", END)

    return workflow.compile()


# Module-level compiled graph — imported by main.py
app = build_workflow()
