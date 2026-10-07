'use strict';

const BACKEND_URL = 'https://inlinedoubt-api.onrender.com/api/doubt';
const MAX_SNIPPET_LENGTH = 8_000;
const MAX_QUESTION_LENGTH = 2_000;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'inline-doubt-ask') return;
  if (sender.id !== chrome.runtime.id || !sender.tab) {
    sendResponse({ ok: false, error: 'Invalid request source' });
    return;
  }

  const snippet = typeof message.snippet === 'string' ? message.snippet.trim() : '';
  const question = typeof message.question === 'string' ? message.question.trim() : '';
  if (!snippet || !question || snippet.length > MAX_SNIPPET_LENGTH || question.length > MAX_QUESTION_LENGTH) {
    sendResponse({ ok: false, error: 'The selected text or question is empty or too long.' });
    return;
  }

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snippet, question })
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Server error ${response.status}`);
      }
      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The AI service returned an empty answer.');
      }
      return data.answer;
    })
    .then((answer) => sendResponse({ ok: true, answer }))
    .catch((error) => sendResponse({ ok: false, error: error.message || 'Failed to connect to backend' }));

  return true;
});
