import Fuse from 'fuse.js';
import { getAllQuestions } from '../data';

const _questions = getAllQuestions();
const _fuse = new Fuse(_questions, {
  keys: [
    { name: 'question',   weight: 4 },
    { name: 'unitTitle',  weight: 2.5 },
    { name: 'answer',     weight: 1.5 },
    { name: 'paperTitle', weight: 1 },
  ],
  threshold: 0.38,
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: true,
  useExtendedSearch: false,
});
const _byId = new Map(_questions.map(item => [item.id, item]));

const STOP_WORDS = new Set([
  'what','when','where','which','who','whom','whose','why','how',
  'the','and','for','are','was','were','did','does','about',
  'with','that','this','from','have','had','has','its','their',
  'write','explain','discuss','describe','define','give','note',
  'briefly','short','long','marks','mark','question','answer',
]);

function keywordsOf(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
    .slice(0, 3);
}

export function searchLocal(query, limit = 5) {
  const q = query.trim();
  const scoreMap = new Map();

  for (const r of _fuse.search(q, { limit: 10 })) {
    const cur = scoreMap.get(r.item.id) ?? Infinity;
    if (r.score < cur) scoreMap.set(r.item.id, r.score);
  }

  for (const kw of keywordsOf(q)) {
    for (const r of _fuse.search(kw, { limit: 8 })) {
      const cur = scoreMap.get(r.item.id) ?? Infinity;
      const adjusted = r.score + 0.05;
      if (adjusted < cur) scoreMap.set(r.item.id, adjusted);
    }
  }

  const SCORE_CUTOFF = 0.52;

  const ranked = [...scoreMap.entries()]
    .filter(([, s]) => s <= SCORE_CUTOFF)
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit * 2)
    .map(([id]) => _byId.get(id))
    .filter(Boolean);

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

function firstSentences(text, max = 2) {
  const clean = text.replace(/\n+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  return sentences.slice(0, max).join(' ').trim();
}

// Build a source chip object for navigation
function toSourceChip(r) {
  return {
    label: `${r.paperCode} · ${r.unitTitle} (${r.markType}M)`,
    questionId: r.id,
    paperCode: r.paperCode,
    unitId: r.unitId,
    markType: r.markType,
  };
}

export function buildLocalResponse(results) {
  if (!results.length) {
    return {
      text:
        "I couldn't find that in the syllabus. Try asking about a specific topic — for example:\n" +
        "• Harappan Civilization\n• Bhakti movement\n• Drain of Wealth\n• Battle of Talikota",
      sources: [],
    };
  }

  const top = results[0];
  let text = firstSentences(top.answer, 2);

  const other = results.find(
    r => r.paperCode !== top.paperCode || r.unitTitle !== top.unitTitle
  );
  if (other) {
    text += `\n\nRelated (${other.paperCode} · ${other.unitTitle}): ${firstSentences(other.answer, 1)}`;
  }

  return {
    text,
    sources: results.slice(0, 2).map(toSourceChip),
  };
}

// Build source chips from raw result items (used by Gemini path in ChatScreen)
export function toSourceChips(results) {
  return results.slice(0, 1).map(toSourceChip);
}
