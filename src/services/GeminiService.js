const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Ask Gemini a question using syllabus material as context.
 * Requires a personal Google AI Studio API key (from aistudio.google.com/app/apikey).
 */
export async function askGemini(userQuestion, contextResults, apiKey) {
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please add one in your Profile.');
  }

  const contextText = contextResults
    .slice(0, 3)
    .map(
      r =>
        `[${r.paperCode} – ${r.paperTitle}, ${r.unitTitle}]\nQ: ${r.question}\nA: ${r.answer}`
    )
    .join('\n\n---\n\n');

  const prompt = `You are a helpful AI study assistant for MA History students at Madras University.
Answer the student's question using ONLY the study material provided below.
Keep the answer clear, accurate, and under 250 words. Mention the source paper/unit.

STUDY MATERIAL:
${contextText}

STUDENT'S QUESTION: ${userQuestion}

Answer:`;

  const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Gemini API error ${res.status}`;
    if (res.status === 400 && msg.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check the key in your Profile.');
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    'No response generated.'
  );
}
