# InlineDoubt AI

InlineDoubt AI is a Chrome extension that lets you select text on a webpage, ask a question about it, and see an AI explanation inline without losing your place.

## Current status

The extension sends requests through its service worker to the FastAPI backend hosted at `https://inlinedoubt-api.onrender.com`. The Render free service may take about a minute to wake after idle periods. The backend is currently an early demo and does not yet have request-rate limits.

## Project structure

- `manifest.json`, `content.js`, `background.js`, `styles.css`: Chrome Manifest V3 extension.
- `backend/main.py`: FastAPI API that sends the selected passage and question to Gemini.
- `backend/requirements.txt`: Python backend dependencies.

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

When you submit a question, the selected text and question are sent to the hosted backend and then to the Gemini API to generate an answer. Do not submit private or sensitive text. Request-rate limits and Chrome Web Store privacy disclosures still need to be added before broad public distribution.

## License

No license has been added yet. All rights are reserved unless a license is added.
