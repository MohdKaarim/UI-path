import Fuse from 'fuse.js';
import sphs101Chunks from '../data/textbook/SPHS101.json';
import sphs102Chunks from '../data/textbook/SPHS102.json';
import sphs103Chunks from '../data/textbook/SPHS103.json';
import sphs104Chunks from '../data/textbook/SPHS104.json';
import sphs105Chunks from '../data/textbook/SPHS105.json';

const PAPER_TITLES = {
  SPHS101: 'Cultural Heritage of India',
  SPHS102: 'History of Tamil Nadu',
  SPHS103: 'History of World Civilizations',
  SPHS104: 'Economic History of India',
  SPHS105: 'Tourism Principles & Practices',
};

const CHUNKS_BY_PAPER = {
  SPHS101: sphs101Chunks,
  SPHS102: sphs102Chunks,
  SPHS103: sphs103Chunks,
  SPHS104: sphs104Chunks,
  SPHS105: sphs105Chunks,
};

// Flatten every paper's chunks into one searchable corpus, tagged with paperCode.
const _allChunks = Object.entries(CHUNKS_BY_PAPER).flatMap(([paperCode, chunks]) =>
  chunks.map((c, i) => ({ id: `${paperCode}_${i}`, paperCode, page: c.page, text: c.text }))
);

const _fuse = new Fuse(_allChunks, {
  keys: ['text'],
  threshold: 0.34,
  minMatchCharLength: 4,
  includeScore: true,
  ignoreLocation: true,
});

// Search the actual textbook text (not the curated Q&A pairs) for passages
// relevant to a query. This is the raw knowledge base behind narrative answers.
export function searchTextbook(query, limit = 3) {
  const q = query.trim();
  if (!q) return [];
  return _fuse
    .search(q, { limit })
    .map(r => ({ ...r.item, score: r.score }));
}

export function paperTitle(paperCode) {
  return PAPER_TITLES[paperCode] || paperCode;
}
