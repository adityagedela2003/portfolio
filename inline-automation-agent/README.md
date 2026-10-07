# InlineDoubt AI

InlineDoubt AI is a Chrome extension that lets you select text on a webpage, ask a question about it, and see an AI explanation inline without losing your place.

## Current status

The extension and FastAPI backend work locally. The extension sends API requests through its service worker, and the backend URL is currently `http://localhost:8000`. Other people cannot use the AI feature yet. Before public use, deploy the backend over HTTPS and update `background.js` plus the matching `host_permissions` entry in `manifest.json` with the deployed hostname.

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

## Privacy note

When you submit a question, the selected text and question are sent to the configured backend and then to the Gemini API to generate an answer. Do not submit private or sensitive text. This local development version has no hosted service, public-user protections, or Chrome Web Store privacy disclosures yet.

## License

No license has been added yet. All rights are reserved unless a license is added.
