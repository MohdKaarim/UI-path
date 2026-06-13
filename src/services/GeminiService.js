const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

const TIMEOUT_MS = 10000;

function truncate(text, maxChars) {
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '…';
}

export async function askGemini(userQuestion, contextResults, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('No Gemini API key configured. Please add one in your Profile.');
  }

  // Only top 1 result, very short — less input = faster first token
  const top = contextResults[0];
  const contextText = top
    ? `[${top.paperCode} · ${top.unitTitle}]\nQ: ${truncate(top.question, 80)}\nA: ${truncate(top.answer, 120)}`
    : 'No relevant material found.';

  const prompt = `MA History tutor. Reply in 2–3 sentences max. End with "📚 ${top ? top.paperCode + ' · ' + top.unitTitle : 'Source unknown'}". If not covered, say so in one line.\n\nMATERIAL: ${contextText}\n\nQ: ${userQuestion}\nA:`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 120 },
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
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'No response generated.'
    );
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check your internet connection and try again.');
    }
    throw err;
  }
}
