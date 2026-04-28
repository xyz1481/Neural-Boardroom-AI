import json
from langchain_google_genai import ChatGoogleGenerativeAI
from config import GEMINI_MODEL, GEMINI_API_KEY
from tools.web_search import web_search
from graph.state import StartupState

def cmo_node(state: StartupState) -> dict:
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.7
    )
    
    marketing_budget = state.get("budget_allocation", {}).get("marketing", 0)
    
    # Simple use of the tool before calling LLM
    search_results = web_search.invoke(f"Marketing trends and strategies for: {state['idea']}")

    system_prompt = (
        "You are the Chief Marketing Officer (CMO) of a new startup. "
        "Given the startup idea, your marketing budget, and recent market trends, "
        "propose a marketing strategy, growth plan, and prospective brand collaborations. "
        "Output your response strictly as valid JSON, with no markdown formatting or backticks, with the following structure:\n"
        "{\n"
        "  \"marketing_plan\": \"string detailing the go-to-market strategy\",\n"
        "  \"summary_text\": \"A brief 1-sentence quote for the boardroom meeting\"\n"
        "}"
    )

    prompt = (
        f"{system_prompt}\n\n"
        f"Idea: {state['idea']}\n"
        f"Marketing Budget: ${marketing_budget}\n"
        f"Market Trends Data:\n{search_results}"
    )

    try:
        response = llm.invoke(prompt)
        raw = response.content
        text_content = (raw if isinstance(raw, str) else "".join(
            p if isinstance(p, str) else p.get("text", "") for p in raw
        )).strip()
        print(f"\n{'='*50}\n[CMO] Raw LLM Response:\n{text_content}\n{'='*50}")
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]

        data = json.loads(text_content)
        print(f"[CMO] Parsed → Marketing Plan: {data.get('marketing_plan', '')[:200]}...")

        step_log = {
            "agent": "CMO",
            "type": "propose",
            "text": data.get("summary_text", "I've devised a go-to-market strategy leveraging current trends.")
        }

        return {
            "marketing_plan": data.get("marketing_plan", ""),
            "steps": [step_log]
        }
    except Exception as e:
        print(f"CMO Error: {e}")
        step_log = {
            "agent": "CMO",
            "type": "critique",
            "text": "The market is crowded. We need a strong guerrilla marketing campaign to stand out."
        }

        return {
            "marketing_plan": "Content marketing, influencer partnerships, and targeted ads.",
            "steps": [step_log]
        }
