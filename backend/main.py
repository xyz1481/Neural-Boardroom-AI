from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import os
from .agents.ceo import run_startup_simulation

app = FastAPI(title="Neural Boardroom AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ObjectiveRequest(BaseModel):
    objective: str

@app.post("/simulate")
async def simulate(request: ObjectiveRequest):
    async def event_generator():
        try:
            # We simulate a "streaming" feel by sending agent initialization events
            agents = ["Market Researcher", "CTO", "CFO", "CMO", "CEO"]
            for agent in agents:
                yield f"data: {json.dumps({'type': 'step', 'agent': agent, 'text': f'Initializing strategic modules for {request.objective}...'})}\n\n"
                await asyncio.sleep(1)

            # Kickoff the actual CrewAI simulation
            # Note: In a production app, you'd capture the CrewAI logs and stream them.
            # For this cinematic demo, we trigger the logic and return the resolution.
            result = run_startup_simulation(request.objective)
            
            yield f"data: {json.dumps({'type': 'final', 'decision': {'resolution': result}})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
