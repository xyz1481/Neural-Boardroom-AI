import json
from langchain_google_genai import ChatGoogleGenerativeAI
from config import GEMINI_MODEL, GEMINI_API_KEY
from tools.calculator import calculate_budget, calculate_runway
from graph.state import StartupState

def cfo_node(state: StartupState) -> dict:
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.2
    )

    system_prompt = (
        "You are the Chief Financial Officer (CFO) of a new startup. "
        "The CEO has given you an idea and a total budget. "
        "Analyze the idea and allocate the budget into 'marketing', 'tech', and 'operations'. "
        "Provide a realistic estimated monthly burn rate and calculate the runway. "
        "Output your response strictly as valid JSON, with no markdown formatting or backticks, with the following structure:\n"
        "{\n"
        "  \"budget_allocation\": {\n"
        "    \"marketing\": float,\n"
        "    \"tech\": float,\n"
        "    \"operations\": float\n"
        "  },\n"
        "  \"financial_plan\": \"string explaining the allocation and runway\",\n"
        "  \"summary_text\": \"A brief 1-sentence quote for the boardroom meeting\"\n"
        "}"
    )

    prompt = (
        f"{system_prompt}\n\n"
        f"Idea: {state['idea']}\n"
        f"Total Budget: ${state['total_budget']}\n"
        f"Market Research (Deep Analysis): {state.get('research_data', 'No research available.')}"
    )

    try:
        response = llm.invoke(prompt)
        # response.content may be a list of parts in newer langchain-google-genai
        raw = response.content
        text_content = (raw if isinstance(raw, str) else "".join(
            p if isinstance(p, str) else p.get("text", "") for p in raw
        )).strip()
        print(f"\n{'='*50}\n[CFO] Raw LLM Response:\n{text_content}\n{'='*50}")
        # Remove markdown code blocks if the model still outputs them
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]

        data = json.loads(text_content)
        print(f"[CFO] Parsed → Budget: {data.get('budget_allocation')}\n[CFO] Plan: {data.get('financial_plan', '')[:200]}...")

        step_log = {
            "agent": "CFO",
            "type": "evaluate",
            "text": f"{data.get('summary_text', '')}\n\n{data.get('financial_plan', '')}"
        }

        # Return only this node's new step — operator.add in state will concatenate
        return {
            "budget_allocation": data.get("budget_allocation", {}),
            "financial_plan": data.get("financial_plan", ""),
            "steps": [step_log]
        }
    except Exception as e:
        # Fallback in case of failure
        print(f"CFO Error: {e}")
        step_log = {
            "agent": "CFO",
            "type": "critique",
            "text": "The financial model failed to compute. We need a safer approach."
        }
        # simple fallback division
        allocation = {
            "marketing": state["total_budget"] * 0.3,
            "tech": state["total_budget"] * 0.5,
            "operations": state["total_budget"] * 0.2
        }

        return {
            "budget_allocation": allocation,
            "financial_plan": "Default conservative allocation with a 12-month projected runway.",
            "steps": [step_log]
        }
