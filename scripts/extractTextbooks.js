const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const REF_DIR = path.join(__dirname, '..', 'src', 'data', 'Reference');
const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'textbook');
const PAPERS = ['SPHS101', 'SPHS102', 'SPHS103', 'SPHS104', 'SPHS105'];

function cleanText(raw) {
  return raw
    .replace(/\r/g, '')
    .replace(/-\n(?=[a-z])/g, '')       // de-hyphenate line-wrapped words
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

// Split a page's text into ~900-char chunks on paragraph/sentence boundaries.
function chunkPage(text, maxLen = 900) {
  const chunks = [];
  let buf = '';
  for (const line of text.split('\n')) {
    if ((buf + '\n' + line).length > maxLen && buf) {
      chunks.push(buf.trim());
      buf = line;
    } else {
      buf = buf ? buf + '\n' + line : line;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

(async () => {
  for (const code of PAPERS) {
    const pdfPath = path.join(REF_DIR, `${code}.pdf`);
    console.log(`Extracting ${code}...`);
    const buf = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    await parser.destroy();

    const chunks = [];
    for (const page of result.pages) {
      const cleaned = cleanText(page.text);
      if (!cleaned || cleaned.length < 20) continue;
      for (const chunk of chunkPage(cleaned)) {
        if (chunk.length < 40) continue; // skip near-empty fragments (headers/page numbers)
        chunks.push({ page: page.num, text: chunk });
      }
    }

    const outPath = path.join(OUT_DIR, `${code}.json`);
    fs.writeFileSync(outPath, JSON.stringify(chunks));
    console.log(`  -> ${chunks.length} chunks from ${result.pages.length} pages, ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
  }
})();
