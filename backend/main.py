from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

from graph.workflow import app as langgraph_app

app = FastAPI(title="Startup Simulator API")

# Setup CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartupRequest(BaseModel):
    objective: str

@app.post("/create-checkout")
async def create_checkout(request: StartupRequest):
    locus_api_url = os.getenv("LOCUS_API_URL")
    locus_api_key = os.getenv("LOCUS_API_KEY")
    
    if locus_api_key == "claw_dev_REPLACE_ME":
        # Fallback for testing if key not set
        return {"sessionId": "test_session_" + request.objective[:10]}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{locus_api_url}/checkout/sessions",
                headers={
                    "Authorization": f"Bearer {locus_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "amount": "5",
                    "currency": "USDC",
                    "description": f"Boardroom Simulation: {request.objective}",
                    "successUrl": "http://localhost:5173/?success=true",
                    "cancelUrl": "http://localhost:5173/?cancel=true",
                    "metadata": {
                        "objective": request.objective
                    }
                }
            )
            if response.status_code not in [200, 201]:
                print(f"Locus API Error: {response.status_code} - {response.text}")
                return {"error": response.text, "sessionId": None}
            locus_data = response.json()
            session_id = locus_data.get("data", {}).get("id")
            return {"sessionId": session_id}
        except Exception as e:
            print(f"Internal Error calling Locus: {str(e)}")
            return {"error": str(e), "sessionId": None}

@app.post("/simulate")
async def run_startup(request: StartupRequest):
    initial_state = {
        "idea": request.objective,
        "total_budget": 100000.0,
        "steps": []
    }
    
    async def event_generator():
        try:
            # We track which steps we've already sent to avoid duplicates 
            # (since LangGraph sends the cumulative state sometimes)
            sent_step_indices = set()
            
            async for output in langgraph_app.astream(initial_state):
                for node_name, state_update in output.items():
                    # Map node names to Agent titles for the UI
                    agent_map = {
                        "ceo": "CEO",
                        "cto": "CTO",
                        "cfo": "CFO",
                        "cmo": "CMO",
                        "researcher": "Researcher"
                    }
                    
                    # 1. Check for specific node reports in the state_update
                    # 2. Check for the 'steps' list which contains the boardroom deliberation
                    
                    if "steps" in state_update:
                        for step in state_update["steps"]:
                            # If step is a dict, extract fields
                            if isinstance(step, dict):
                                agent_name = step.get("agent", agent_map.get(node_name, "Agent"))
                                text_content = step.get("text", "Deliberating...")
                                
                                event_data = {
                                    "type": "step",
                                    "agent": agent_name,
                                    "text": text_content
                                }
                                yield f"data: {json.dumps(event_data)}\n\n"
                            else:
                                # Fallback for plain string steps
                                event_data = {
                                    "type": "step",
                                    "agent": agent_map.get(node_name, "Agent"),
                                    "text": str(step)
                                }
                                yield f"data: {json.dumps(event_data)}\n\n"

            yield f"data: {json.dumps({'type': 'final'})}\n\n"
            
        except Exception as e:
            error_data = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
