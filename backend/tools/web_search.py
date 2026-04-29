"""
tools/web_search.py — Tavily web search tool with mock fallback.

config is imported first so that .env is loaded before we read TAVILY_API_KEY.
"""
import os
import config  # loads .env as a side-effect
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool

# Build Tavily client only when the key is present (loaded from .env by config)
_tavily_key = os.environ.get("TAVILY_API_KEY", "")
_tavily_tool = TavilySearchResults(max_results=3) if _tavily_key else None


@tool
def web_search(query: str) -> str:
    """
    Search the web for real-time information about market trends or competition.
    Returns a formatted summary of the top results.
    """
    if _tavily_tool:
        try:
            results = _tavily_tool.invoke({"query": query})
            formatted = "\n\n".join(
                f"Source: {r.get('url', 'Unknown')}\nContent: {r.get('content', '')}"
                for r in results
            )
            return formatted or "No relevant search results found."
        except Exception as exc:
            return f"Search failed: {exc}"
    else:
        # Fallback mock when Tavily key is absent
        return (
            f"[MOCK SEARCH for '{query}']\n"
            "1. Market is growing at 15 % YoY.\n"
            "2. Top competitors are pivoting to enterprise B2B.\n"
            "3. Customer acquisition costs rose 20 % in the last 6 months."
        )
