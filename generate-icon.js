/**
 * Generates 3D book icon PNG files for the MA History app.
 * Run: node generate-icon.js
 * Requires: npm install sharp
 */

const path = require('path');
const fs = require('fs');

// ─── SVG DESIGN ────────────────────────────────────────────────────────────────
// 3D perspective book viewed from slightly above-left.
// Faces: spine (left), top (parallelogram), front (main), right side.
// Front face: decorative border, stylized MH monogram, gold bookmark.

function buildSVG(transparent) {
  const bg = transparent
    ? '' // Transparent bg for adaptive-icon (background comes from app.json #1565C0)
    : `
  <!-- Rich blue background gradient -->
  <rect width="1024" height="1024" rx="196" fill="url(#bgGrad)"/>
  <!-- Radial glow overlay -->
  <radialGradient id="bgGlow" cx="50%" cy="42%" r="55%">
    <stop offset="0%" stop-color="#42A5F5" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#0D47A1" stop-opacity="0"/>
  </radialGradient>
  <rect width="1024" height="1024" rx="196" fill="url(#bgGlow)"/>
  <!-- Subtle ring -->
  <circle cx="512" cy="512" r="438" fill="none" stroke="white" stroke-width="1" opacity="0.08"/>
  <!-- Corner light leaks -->
  <circle cx="160" cy="160" r="220" fill="white" opacity="0.035"/>
  <circle cx="864" cy="864" r="220" fill="white" opacity="0.035"/>
`;

  return `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E88E5"/>
      <stop offset="100%" stop-color="#0A3880"/>
    </linearGradient>

    <!-- Book faces -->
    <linearGradient id="frontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#DEEEFF"/>
    </linearGradient>
    <linearGradient id="topGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7EC8F8"/>
      <stop offset="100%" stop-color="#D6EEFF"/>
    </linearGradient>
    <linearGradient id="rightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1A5EB8"/>
      <stop offset="100%" stop-color="#0D3B80"/>
    </linearGradient>
    <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#082860"/>
      <stop offset="100%" stop-color="#1565C0"/>
    </linearGradient>

    <!-- Bookmark -->
    <linearGradient id="bmarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF8F00"/>
    </linearGradient>

    <!-- Book drop shadow -->
    <filter id="bookShadow" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="4" dy="14" stdDeviation="18"
        flood-color="#000000" flood-opacity="0.55"/>
    </filter>

    <!-- Front face subtle inner glow -->
    <filter id="faceGlow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="0" stdDeviation="6"
        flood-color="#1565C0" flood-opacity="0.15"/>
    </filter>
  </defs>

  ${bg}

  <!-- ─── GROUND SHADOW ──────────────────────────────────────────────── -->
  <ellipse cx="528" cy="770" rx="265" ry="22" fill="black" opacity="0.28"/>

  <!-- ─── 3D BOOK ────────────────────────────────────────────────────── -->
  <g filter="url(#bookShadow)">

    <!-- LEFT SPINE / PAGE EDGES
         Narrow block on far left — shows the stacked page thickness -->
    <polygon points="
      290,448  338,410
      338,668  290,706
    " fill="url(#spineGrad)"/>

    <!-- Page-edge detail lines -->
    <line x1="296" y1="450" x2="296" y2="702" stroke="#5BA3E8" stroke-width="2"   opacity="0.45"/>
    <line x1="304" y1="447" x2="304" y2="705" stroke="#5BA3E8" stroke-width="1.5" opacity="0.28"/>
    <line x1="310" y1="445" x2="310" y2="706" stroke="white"   stroke-width="1"   opacity="0.14"/>
    <line x1="316" y1="443" x2="316" y2="707" stroke="white"   stroke-width="1"   opacity="0.08"/>

    <!-- TOP FACE  (parallelogram — bird's eye perspective) -->
    <polygon points="
      338,410  724,410
      766,370  382,370
    " fill="url(#topGrad)"/>

    <!-- Top-face specular highlight (front-left quadrant) -->
    <polygon points="
      338,410  552,410  592,370  382,370
    " fill="white" opacity="0.52"/>

    <!-- FRONT FACE  (main rectangle) -->
    <rect x="338" y="410" width="386" height="258"
      fill="url(#frontGrad)" filter="url(#faceGlow)"/>

    <!-- Fresnel sheen at top of front face -->
    <rect x="338" y="410" width="386" height="52"
      fill="white" opacity="0.22" rx="0"/>

    <!-- RIGHT SIDE FACE -->
    <polygon points="
      724,410  766,370
      766,628  724,668
    " fill="url(#rightGrad)"/>

    <!-- Deeper shadow at bottom-right corner for extra depth -->
    <polygon points="
      724,540  766,502
      766,628  724,668
    " fill="#071F50" opacity="0.45"/>

  </g>

  <!-- ─── FRONT FACE ARTWORK ─────────────────────────────────────────── -->

  <!-- Double border frame -->
  <rect x="356" y="428" width="350" height="222"
    fill="none" stroke="#A8D0F5" stroke-width="3" rx="4"/>
  <rect x="364" y="436" width="334" height="206"
    fill="none" stroke="#A8D0F5" stroke-width="1" rx="3" opacity="0.4"/>

  <!-- Thin ruled lines (like a history book page) -->
  <line x1="372" y1="476" x2="704" y2="476" stroke="#BFD9F2" stroke-width="2" opacity="0.65"/>
  <line x1="372" y1="574" x2="704" y2="574" stroke="#BFD9F2" stroke-width="2" opacity="0.65"/>

  <!-- ── MH MONOGRAM (path-drawn, no font dependency) ── -->
  <!-- Outer badge circle -->
  <circle cx="521" cy="520" r="76" fill="none" stroke="#8EC6F0" stroke-width="2.5" opacity="0.6"/>
  <circle cx="521" cy="520" r="64" fill="#1565C0" opacity="0.10"/>

  <!-- Letter M  (drawn as filled polygon) -->
  <polygon points="
    468,491  481,491  521,533  561,491  574,491
    574,553  560,553  560,514  521,554  482,514
    482,553  468,553
  " fill="#1565C0"/>

  <!-- Letter H  (right side, smaller, offset) — optional accent
       — here I use it as a small underline-dot row instead -->
  <!-- Small gold dots — academic star motif -->
  <circle cx="521" cy="456" r="6"   fill="#FFB300"/>
  <circle cx="521" cy="584" r="6"   fill="#FFB300"/>
  <circle cx="457" cy="520" r="4.5" fill="#FFB300" opacity="0.75"/>
  <circle cx="585" cy="520" r="4.5" fill="#FFB300" opacity="0.75"/>
  <!-- Diagonal micro dots -->
  <circle cx="475" cy="472" r="3" fill="#FFB300" opacity="0.5"/>
  <circle cx="567" cy="568" r="3" fill="#FFB300" opacity="0.5"/>
  <circle cx="567" cy="472" r="3" fill="#FFB300" opacity="0.5"/>
  <circle cx="475" cy="568" r="3" fill="#FFB300" opacity="0.5"/>

  <!-- ─── GOLDEN BOOKMARK RIBBON ─────────────────────────────────────── -->
  <!-- Body -->
  <rect x="654" y="400" width="30" height="88" fill="url(#bmarkGrad)" rx="3"/>
  <!-- Pennant notch -->
  <polygon points="654,488  669,506  684,488" fill="#E65100"/>
  <!-- Bookmark inner shine strip -->
  <rect x="654" y="400" width="11" height="88" fill="white" opacity="0.28" rx="1"/>

  <!-- ─── SPINE DECORATION ────────────────────────────────────────────── -->
  <circle cx="314" cy="472" r="4"   fill="white" opacity="0.35"/>
  <circle cx="314" cy="490" r="3"   fill="white" opacity="0.22"/>
  <circle cx="314" cy="688" r="4"   fill="white" opacity="0.35"/>

  <!-- Top edge highlight line -->
  <line x1="338" y1="410" x2="724" y2="410" stroke="white" stroke-width="2" opacity="0.28"/>

</svg>`;
}

// ─── CONVERSION ────────────────────────────────────────────────────────────────
async function run() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Error: "sharp" not found.\nRun:  npm install sharp --save-dev\nThen: node generate-icon.js');
    process.exit(1);
  }

  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

  // icon.png — full icon with rich background (used by iOS, web, older Android)
  await sharp(Buffer.from(buildSVG(false)))
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✓  assets/icon.png');

  // adaptive-icon.png — foreground only, transparent bg
  //   Android composites this over the #1565C0 background from app.json
  await sharp(Buffer.from(buildSVG(true)))
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('✓  assets/adaptive-icon.png');

  // favicon.png — small version for web
  await sharp(Buffer.from(buildSVG(false)))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✓  assets/favicon.png');

  console.log('\nDone! Run: npx expo prebuild --platform android --clean  then rebuild APK.');
}

run();
