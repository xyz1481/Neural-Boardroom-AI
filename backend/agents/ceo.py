import json
from langchain_google_genai import ChatGoogleGenerativeAI
from config import GEMINI_MODEL, GEMINI_API_KEY
from tools.web_search import web_search
from graph.state import StartupState

def ceo_node(state: StartupState) -> dict:
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.5
    )
    
    # Optional search for similar startups
    search_results = web_search.invoke(f"Competitors and similar startups doing: {state['idea']}")

    system_prompt = (
        "You are the Chief Executive Officer (CEO) of a new startup. "
        "You receive the financial, technical, and marketing plans from your C-suite. "
        "Review these plans along with data on similar startups, and synthesize a final strategic decision. "
        "Output your response strictly as valid JSON, with no markdown formatting or backticks, with the following structure:\n"
        "{\n"
        "  \"final_decision\": \"string detailing the overall strategic conclusion and next steps\",\n"
        "  \"summary_text\": \"A brief 1-sentence quote for the boardroom meeting\",\n"
        "  \"hologram_decision\": {\n"
        "    \"summary\": \"A short 3-5 word capitalized summary (e.g., LAUNCH B2B MVP)\",\n"
        "    \"tradeoffs\": [\"+ Pro 1\", \"- Con 1\", \"+ Pro 2\"],\n"
        "    \"actionPlan\": \"A brief 1-sentence actionable plan\"\n"
        "  }\n"
        "}"
    )

    prompt = (
        f"{system_prompt}\n\n"
        f"Idea: {state['idea']}\n"
        f"Financial Plan: {state.get('financial_plan', 'N/A')}\n"
        f"Tech Plan: {state.get('tech_plan', 'N/A')}\n"
        f"Marketing Plan: {state.get('marketing_plan', 'N/A')}\n"
        f"Competitor Data (Simple Search):\n{search_results}\n"
        f"Deep Market Research (CrewAI):\n{state.get('research_data', 'N/A')}"
    )

    try:
        response = llm.invoke(prompt)
        raw = response.content
        text_content = (raw if isinstance(raw, str) else "".join(
            p if isinstance(p, str) else p.get("text", "") for p in raw
        )).strip()
        print(f"\n{'='*50}\n[CEO] Raw LLM Response:\n{text_content}\n{'='*50}")
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]

        data = json.loads(text_content)
        print(f"[CEO] Parsed → Decision: {data.get('final_decision', '')[:200]}...")

        step_log = {
            "agent": "CEO",
            "type": "resolution",
            "text": f"{data.get('summary_text', '')}\n\n{data.get('final_decision', '')}"
        }

        # We encode the hologram data right in the decision to pass to frontend easily
        decision_payload = json.dumps(data.get("hologram_decision", {
            "summary": "PROCEED WITH LAUNCH",
            "tradeoffs": ["+ Validated Idea"],
            "actionPlan": "Execute the compiled plan immediately."
        }))

        return {
            "final_decision": decision_payload,
            "steps": [step_log]
        }
    except Exception as e:
        print(f"CEO Error: {e}")
        step_log = {
            "agent": "CEO",
            "type": "resolution",
            "text": "Decision logged: Proceed with the established plan."
        }

        fallback_hologram = {
            "summary": "PROCEED WITH LAUNCH",
            "tradeoffs": ["+ Team aligned", "- High risk"],
            "actionPlan": "Execute baseline objectives across departments."
        }

        return {
            "final_decision": json.dumps(fallback_hologram),
            "steps": [step_log]
        }
