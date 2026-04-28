from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

from graph.workflow import app as langgraph_app

app = FastAPI(title="Startup Simulator API")

# Setup CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartupRequest(BaseModel):
    idea: str
    budget: float = 100000.0

@app.post("/api/run-startup")
async def run_startup(request: StartupRequest):
    # Initialize the state
    initial_state = {
        "idea": request.idea,
        "total_budget": request.budget,
        "steps": []
    }
    
    try:
        # Run the workflow
        # .invoke runs the graph synchronously which is totally fine for this use case.
        final_state = langgraph_app.invoke(initial_state)
        
        # Extract and parse the decision payload
        decision = {}
        if "final_decision" in final_state:
            try:
                decision = json.loads(final_state["final_decision"])
            except:
                pass

        return {
            "success": True,
            "data": {
                "steps": final_state.get("steps", []),
                "decision": decision,
                "financial_plan": final_state.get("financial_plan"),
                "tech_plan": final_state.get("tech_plan"),
                "marketing_plan": final_state.get("marketing_plan"),
                "final_decision": final_state.get("final_decision")
            }
        }
    except Exception as e:
        print(f"Workflow error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
