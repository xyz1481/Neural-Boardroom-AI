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

# Base / on-chain payouts
BASE_RPC_URL: str = os.environ.get("BASE_RPC_URL", "")
BASE_CHAIN_ID: int = int(os.environ.get("BASE_CHAIN_ID", "8453"))
BASE_TREASURY_PRIVATE_KEY: str = os.environ.get("BASE_TREASURY_PRIVATE_KEY", "")
BASE_USDC_ADDRESS: str = os.environ.get(
    "BASE_USDC_ADDRESS",
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
)
BASE_PLATFORM_TREASURY_WALLET: str = os.environ.get("BASE_PLATFORM_TREASURY_WALLET", "")

# Groq
GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL: str = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Create backend/.env with your key."
    )
