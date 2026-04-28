import json
from langchain_google_genai import ChatGoogleGenerativeAI
from config import GEMINI_MODEL, GEMINI_API_KEY
from graph.state import StartupState

def cto_node(state: StartupState) -> dict:
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.3
    )
    
    tech_budget = state.get("budget_allocation", {}).get("tech", 0)

    system_prompt = (
        "You are the Chief Technology Officer (CTO) of a new startup. "
        "Given the startup idea and your tech budget, propose a technology stack, "
        "architecture, and deployment steps. "
        "Output your response strictly as valid JSON, with no markdown formatting or backticks, with the following structure:\n"
        "{\n"
        "  \"tech_plan\": \"string detailing the stack and architecture\",\n"
        "  \"summary_text\": \"A brief 1-sentence quote for the boardroom meeting\"\n"
        "}"
    )

    prompt = (
        f"{system_prompt}\n\n"
        f"Idea: {state['idea']}\n"
        f"Tech Budget: ${tech_budget}"
    )

    try:
        response = llm.invoke(prompt)
        raw = response.content
        text_content = (raw if isinstance(raw, str) else "".join(
            p if isinstance(p, str) else p.get("text", "") for p in raw
        )).strip()
        print(f"\n{'='*50}\n[CTO] Raw LLM Response:\n{text_content}\n{'='*50}")
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]

        data = json.loads(text_content)
        print(f"[CTO] Parsed → Tech Plan: {data.get('tech_plan', '')[:200]}...")

        step_log = {
            "agent": "CTO",
            "type": "propose",
            "text": data.get("summary_text", "I've structured a scalable tech stack for our MVP.")
        }

        return {
            "tech_plan": data.get("tech_plan", ""),
            "steps": [step_log]
        }
    except Exception as e:
        print(f"CTO Error: {e}")
        step_log = {
            "agent": "CTO",
            "type": "critique",
            "text": "We need to rely on proven open-source solutions to stay within budget."
        }

        return {
            "tech_plan": "React Frontend, Node.js/Python Backend, Serverless DB.",
            "steps": [step_log]
        }
