import { searchTextbook } from './TextbookService';

const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

const TIMEOUT_MS = 15000;

function truncate(text, maxChars) {
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '…';
}

export async function askGemini(userQuestion, contextResults, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('No Gemini API key configured. Please add one in your Profile.');
  }

  // Curated Q&A pair, if any — short and reliably on-topic.
  const top = contextResults[0];
  const qaText = top
    ? `[${top.paperCode} · ${top.unitTitle}]\nQ: ${truncate(top.question, 80)}\nA: ${truncate(top.answer, 160)}`
    : 'No curated Q&A match found.';

  // Actual textbook passage — this is the real knowledge base grounding the
  // answer, not just the curated Q&A pairs.
  const textbookHit = searchTextbook(userQuestion, 1)[0];
  const textbookText = textbookHit
    ? `[Textbook ${textbookHit.paperCode}, page ${textbookHit.page}]\n${truncate(textbookHit.text, 500)}`
    : 'No matching textbook passage found.';

  const prompt =
    `You are a friendly MA History tutor telling a student the story behind their syllabus, not reciting a definition.\n` +
    `Using the material below, explain the answer as a short, easy-to-follow narrative (3-5 sentences) — ` +
    `set the scene, walk through what happened or what the concept means, and land on why it matters. ` +
    `Write plainly, like you're explaining it to a friend, not quoting a textbook. ` +
    `If the material doesn't cover the question, say so plainly in one line instead of guessing.\n\n` +
    `CURATED NOTES:\n${qaText}\n\nTEXTBOOK PASSAGE:\n${textbookText}\n\n` +
    `STUDENT'S QUESTION: ${userQuestion}\n\nYOUR NARRATIVE ANSWER:`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 320 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `Gemini API error (${res.status})`;
      if (res.status === 400) throw new Error('Invalid API key. Check it in your Profile.');
      if (res.status === 429) throw new Error('Too many requests. Please wait a moment and try again.');
      if (res.status === 403) throw new Error('API key does not have permission. Check your Google AI Studio key.');
      throw new Error(msg);
    }

    const data = await res.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'No response generated.';

    return {
      text,
      textbookSource: textbookHit
        ? { type: 'textbook', label: `${textbookHit.paperCode} · Page ${textbookHit.page}`, paperCode: textbookHit.paperCode, page: textbookHit.page }
        : null,
    };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check your internet connection and try again.');
    }
    throw err;
  }
}
