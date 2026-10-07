# InlineDoubt AI

InlineDoubt AI is a Chrome extension that lets you select text on a webpage, ask a question about it, and see an AI explanation inline without losing your place.

## Current status

The extension sends requests through its service worker to the FastAPI backend hosted at `https://inlinedoubt-api.onrender.com`. The Render free service may take about a minute to wake after idle periods. The backend applies best-effort per-IP limits of 10 requests per minute and 60 per hour; these in-memory counters reset when the service restarts and are intended for a small demo.

## Project structure

- `manifest.json`, `content.js`, `background.js`, `styles.css`: Chrome Manifest V3 extension.
- `backend/main.py`: FastAPI API that sends the selected passage and question to Gemini.
- `backend/requirements.txt`: Python backend dependencies.
- `PRIVACY.md`: Data-flow and privacy notice.

## Run locally

1. Create `backend/.env` from `.env.example` and add your own Gemini API key. Never commit this file.
2. From this directory, install dependencies and start the backend:

   ```powershell
   py -3 -m pip install -r backend/requirements.txt
   py -3 -m uvicorn backend.main:app --reload --port 8000
   ```

3. In Chrome, open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose this project folder.
4. Select text on a webpage, click **Ask Doubt**, enter a question, and submit it.

To use a local backend instead, change `BACKEND_URL` in `background.js` to `http://localhost:8000/api/doubt` and set the matching `host_permissions` entry in `manifest.json` to `http://localhost/*` before loading the extension.

## Privacy note

Before sending, the extension asks you to agree to send the selected text and question to the hosted backend and Google Gemini. Read [PRIVACY.md](PRIVACY.md) for details, including the prototype rate-limit limitations. Do not submit private or sensitive text. This remains a small demo, not a production service.

## License

No license has been added yet. All rights are reserved unless a license is added.
