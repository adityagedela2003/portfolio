# InlineDoubt AI Privacy Notice

Last updated: October 7, 2026

InlineDoubt AI lets you request an explanation of text you select on a webpage. This notice describes the data flow in the current prototype.

## Data processed

When you check the in-extension consent box and submit a question, InlineDoubt processes:

- The text you selected.
- The question you typed.
- Your network address temporarily, to apply request-rate limits.

The extension does not intentionally send the webpage URL, browsing history, or the rest of the page to the backend. The selected text remains visible in the inline box while it is open.

## How data is used and shared

The selected text and question are sent over HTTPS to the InlineDoubt API hosted by Render. The API forwards them to Google's Gemini API to generate the requested explanation, then returns the answer to the extension. Render and Google process data under their applicable terms and privacy practices. Gemini API data treatment can vary by service tier; review [Google's Gemini API terms](https://ai.google.dev/gemini-api/terms) and [pricing/data-use details](https://ai.google.dev/gemini-api/docs/pricing).

The current backend does not save questions or answers to a database. The source code keeps request-rate counters in memory; those counters are cleared when the backend process restarts. Hosting and model providers may process technical service data under their own policies.

## Retention and control

InlineDoubt does not keep a conversation history. Closing the inline box or page removes the visible answer from that page. Do not submit passwords, financial or health details, confidential work, or other sensitive text.

You can decline to send data by leaving the consent checkbox unchecked or by closing the inline box.

## Chrome Web Store Limited Use

InlineDoubt AI's use of information received from Chrome is limited to providing the extension's single purpose—explaining text selected by the user—and related service security and reliability. It does not sell user data, use it for advertising, or use it to determine creditworthiness.

## Contact

For privacy questions, contact [adityagedela2003@gmail.com](mailto:adityagedela2003@gmail.com).
