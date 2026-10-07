import sys
import os

# Add local backend_libs directory to sys.path
libs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend_libs"))
if libs_dir not in sys.path:
    sys.path.insert(0, libs_dir)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from google import genai
import dotenv

# Load .env file automatically
dotenv.load_dotenv()
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


app = FastAPI(title="InlineDoubt AI Backend Proxy")

# Initialize Gemini Client using API key from environment variable
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

class DoubtReq(BaseModel):
    snippet: str = Field(min_length=1, max_length=8_000)
    question: str = Field(min_length=1, max_length=2_000)

@app.get("/")
def read_root():
    return {"status": "online", "message": "InlineDoubt AI Backend Proxy Running"}

@app.post("/api/doubt")
def answer_doubt(req: DoubtReq):
    # Always reload .env to catch updated API keys without server restarts
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    dotenv.load_dotenv(env_file, override=True)

    current_api_key = os.getenv("GEMINI_API_KEY")
    if not current_api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is not set in backend/.env"
        )

    try:
        active_client = genai.Client(api_key=current_api_key)
        prompt = f"""
        You are an expert inline tutor. A user is reading an AI response and has a specific doubt.
        Target Context Snippet: "{req.snippet}"
        User's Doubt: "{req.question}"

        Provide a concise, direct explanation clearing up the confusion relative to the snippet.
        """
        response = active_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
