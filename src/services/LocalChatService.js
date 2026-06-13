import Fuse from 'fuse.js';
import { getAllQuestions } from '../data';

let _fuse = null;
let _questions = null;

function init() {
  if (_fuse) return;
  _questions = getAllQuestions();
  _fuse = new Fuse(_questions, {
    keys: [
      { name: 'question',   weight: 4 },
      { name: 'unitTitle',  weight: 2.5 },
      { name: 'answer',     weight: 1.5 },
      { name: 'paperTitle', weight: 1 },
    ],
    threshold: 0.38,
    minMatchCharLength: 3,
    includeScore: true,
    ignoreLocation: true,   // don't penalise matches deep inside long answer text
    useExtendedSearch: false,
  });
}

// Split a query into individual keywords so multi-word phrases get better coverage
function keywordsOf(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'the', 'and', 'for', 'are', 'was', 'were', 'did', 'does', 'about',
  'with', 'that', 'this', 'from', 'have', 'had', 'has', 'its', 'their',
  'write', 'explain', 'discuss', 'describe', 'define', 'give', 'note',
  'briefly', 'short', 'long', 'marks', 'mark', 'question', 'answer',
]);

export function searchLocal(query, limit = 5) {
  init();
  const q = query.trim();
  const scoreMap = new Map(); // id → best Fuse score

  // 1. Full-phrase search
  for (const r of _fuse.search(q, { limit: 20 })) {
    const cur = scoreMap.get(r.item.id) ?? Infinity;
    if (r.score < cur) scoreMap.set(r.item.id, r.score);
  }

  // 2. Per-keyword search — boosts results that match multiple terms
  const kws = keywordsOf(q);
  for (const kw of kws) {
    for (const r of _fuse.search(kw, { limit: 15 })) {
      const cur = scoreMap.get(r.item.id) ?? Infinity;
      // Discount per-keyword score slightly so full-phrase always wins
      const adjusted = r.score + 0.05;
      if (adjusted < cur) scoreMap.set(r.item.id, adjusted);
    }
  }

  // 3. Filter by minimum relevance and sort
  const SCORE_CUTOFF = 0.52;
  const byId = new Map(_questions.map(q => [q.id, q]));

  const ranked = [...scoreMap.entries()]
    .filter(([, s]) => s <= SCORE_CUTOFF)
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit * 2)
    .map(([id]) => byId.get(id))
    .filter(Boolean);

  // 4. Deduplicate by unit — prefer breadth over depth
  const seenUnit = new Set();
  const results = [];
  for (const item of ranked) {
    const unitKey = `${item.paperCode}|${item.unitTitle}`;
    if (!seenUnit.has(unitKey) || results.length < 2) {
      seenUnit.add(unitKey);
      results.push(item);
    }
    if (results.length >= limit) break;
  }

  return results;
}

function excerpt(text, maxWords = 75) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '…';
}

export function buildLocalResponse(results) {
  if (!results.length) {
    return {
      text:
        "I couldn't find a close match in the study material.\n\n" +
        "Try asking about a specific topic, e.g.:\n" +
        "• \"Harappan Civilization\"\n" +
        "• \"Bhakti movement\"\n" +
        "• \"Drain of Wealth\"\n" +
        "• \"Battle of Talikota\"\n\n" +
        "Or add a Gemini API key in Profile for AI-powered answers.",
      sources: [],
    };
  }

  const top = results[0];
  const topLabel = `${top.paperCode} › ${top.unitTitle}`;

  let text = '';

  // Header: where this answer comes from
  text += `📖  ${topLabel}\n`;
  text += `Question: ${top.question}\n\n`;

  // Answer body — full for short answers, excerpt for long ones
  const isShort = top.answer.trim().split(/\s+/).length <= 80;
  text += isShort ? top.answer.trim() : excerpt(top.answer);

  if (!isShort) {
    text += '\n\n(Open the Paper › Unit to read the complete answer.)';
  }

  // Secondary result from a different unit
  const secondary = results.find(
    r => r.paperCode !== top.paperCode || r.unitTitle !== top.unitTitle
  );
  if (secondary) {
    const secLabel = `${secondary.paperCode} › ${secondary.unitTitle}`;
    text += `\n\n─────────────────\n`;
    text += `Also relevant — ${secLabel}:\n`;
    text += excerpt(secondary.answer, 45);
  }

  const sources = results.slice(0, 3).map(r => `${r.paperCode} · ${r.unitTitle}`);
  return { text, sources };
}
