"""
config.py — loads .env from the backend directory and exposes API keys.
Run from: c:\\...\\startup\\backend\\   (uvicorn main:fastapi_app)
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load the .env that sits right next to this file (i.e. backend/.env)
_env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
TAVILY_API_KEY: str = os.environ.get("TAVILY_API_KEY", "")
GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Create backend/.env with your key (copy from .env.example)."
    )
