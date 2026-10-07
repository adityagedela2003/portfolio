import os
import sys
import logging
import math
from collections import deque
from threading import Lock
from time import monotonic

# Add local backend_libs directory to sys.path
libs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend_libs"))
if libs_dir not in sys.path:
    sys.path.insert(0, libs_dir)

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from google import genai
import dotenv

# Load .env file automatically
dotenv.load_dotenv()
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


app = FastAPI(title="InlineDoubt AI Backend Proxy")
logger = logging.getLogger(__name__)

RATE_LIMITS = ((60, 10), (3_600, 60))
request_times: dict[str, deque[float]] = {}
rate_limit_lock = Lock()

# Initialize Gemini Client using API key from environment variable
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

class DoubtReq(BaseModel):
    snippet: str = Field(min_length=1, max_length=8_000)
    question: str = Field(min_length=1, max_length=2_000)


@app.middleware("http")
async def rate_limit_doubt_requests(request: Request, call_next):
    if request.url.path != "/api/doubt" or request.method != "POST":
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = monotonic()
    retry_after = None

    with rate_limit_lock:
        if len(request_times) > 2_000:
            cutoff = now - RATE_LIMITS[-1][0]
            for known_ip, timestamps in list(request_times.items()):
                while timestamps and timestamps[0] <= cutoff:
                    timestamps.popleft()
                if not timestamps:
                    request_times.pop(known_ip, None)

        if client_ip not in request_times and len(request_times) >= 5_000:
            return JSONResponse(
                status_code=503,
                content={"detail": "The service is temporarily busy. Please try again later."},
                headers={"Retry-After": "60"},
            )

        timestamps = request_times.setdefault(client_ip, deque())
        while timestamps and timestamps[0] <= now - RATE_LIMITS[-1][0]:
            timestamps.popleft()

        for window_seconds, max_requests in RATE_LIMITS:
            in_window = [stamp for stamp in timestamps if stamp > now - window_seconds]
            if len(in_window) >= max_requests:
                retry_after = max(1, math.ceil(window_seconds - (now - in_window[0])))
                break

        if retry_after is None:
            timestamps.append(now)

    if retry_after is not None:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please wait before trying again."},
            headers={"Retry-After": str(retry_after)},
        )

    return await call_next(request)

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
    except Exception:
        logger.exception("Gemini API request failed")
        raise HTTPException(status_code=502, detail="The AI provider could not answer right now. Please try again.")
