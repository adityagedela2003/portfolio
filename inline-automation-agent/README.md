# InlineDoubt AI

InlineDoubt AI is a Chrome extension that lets you select text on a webpage, ask a question about it, and see an AI explanation inline without losing your place.

![InlineDoubt AI answering a question beside the selected passage](<inline ai chat draft.jpg>)

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

## Try the hosted prototype

1. Download this repository folder (or clone the repository) and extract it.
2. In Chrome, open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the `inline-automation-agent` folder.
3. Open a page with ordinary text, select a short passage, choose **Ask Doubt**, check the first-use consent box, and submit a question. Later questions on that device do not ask for consent again.

The backend may take about a minute to wake after inactivity. This is an unpacked prototype, not a Chrome Web Store listing; Chrome may show a developer-mode notice. Do not submit private or sensitive text.

To use a local backend instead, change `BACKEND_URL` in `background.js` to `http://localhost:8000/api/doubt` and set the matching `host_permissions` entry in `manifest.json` to `http://localhost/*` before loading the extension.

## Privacy note

Before the first request, the extension asks you to agree to send the selected text and question to the hosted backend and Google Gemini. It stores that consent choice in Chrome extension storage on your device. Read [PRIVACY.md](PRIVACY.md) for details, including the prototype rate-limit limitations. Do not submit private or sensitive text. This remains a small demo, not a production service.

## License

No license has been added yet. All rights are reserved unless a license is added.
