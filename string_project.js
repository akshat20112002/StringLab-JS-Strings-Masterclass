/*
  StringLab — single-file interactive tutorial
  Author: ChatGPT (Javascript specialist)
  - All code complete and included in this file.
  - Modern features used with graceful fallbacks.
*/

// --- Utilities and helpers ---
const el = id => document.getElementById(id);
const escapeHtml = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Safe JSON parse
function safeJsonParse(txt){
  try { return JSON.parse(txt); } catch(e){ return null; }
}

// Safe nested lookup (path like 'user.name.first')
function resolvePath(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((acc, prop) => (acc && acc[prop] !== undefined) ? acc[prop] : undefined, obj);
}

// base64 encode/decode for Unicode using TextEncoder/TextDecoder
function base64EncodeUnicode(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  // convert bytes to binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64DecodeUnicode(b64) {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array([...binary].map(ch => ch.charCodeAt(0)));
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch(e) {
    return null;
  }
}

// Grapheme cluster counter (Intl.Segmenter if available)
function graphemeCount(str) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const seg = new Intl.Segmenter(undefined, {granularity: 'grapheme'});
      let count = 0;
      for (const _ of seg.segment(str)) count++;
      return count;
    } catch(e) { /* fallthrough */ }
  }
  // Fallback: approximate by using Array.from (counts code points, not graphemes)
  return Array.from(str).length;
}

// Title-case (simple, uses code point-aware slicing)
function titleCase(str) {
  return str.replace(/(\p{L}\S*)/gu, (word) => {
    const first = Array.from(word)[0] || '';
    const rest = Array.from(word).slice(1).join('');
    return first.toLocaleUpperCase() + rest.toLocaleLowerCase();
  });
}

// swap case
function swapCase(str){
  return Array.from(str).map(ch => {
    const up = ch.toLocaleUpperCase();
    const low = ch.toLocaleLowerCase();
    return ch === up ? low : up;
  }).join('');
}

// slugify
function slugify(str) {
  if (!str) return '';
  // normalize -> decompose accents, remove diacritics, lower, remove invalid chars
  let s = str.normalize('NFD').replace(/\p{M}/gu, ''); // remove marks
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9\s-]/g, '-'); // replace non-alnum with dash
  s = s.replace(/\s+/g, '-'); // spaces to dash
  s = s.replace(/-+/g, '-'); // collapse dashes
  s = s.replace(/^-|-$/g, '');
  return s;
}

// linkify mentions and hashtags
function linkify(text) {
  return escapeHtml(text)
    .replace(/@([a-z0-9_]+)/ig, '<a class="link" href="https://example.com/user/$1">@$1</a>')
    .replace(/#([a-z0-9_]+)/ig, '<a class="link" href="https://example.com/tag/$1">#$1</a>');
}

// --- DOM references ---
const input = el('input');
const lenEl = el('len');
const codepointsEl = el('codepoints');
const graphEl = el('graphemes');
const utf8El = el('utf8bytes');
const wordsEl = el('words');
const linesEl = el('lines');
const unitTableBody = el('unitTable').querySelector('tbody');
const pointTableBody = el('pointTable').querySelector('tbody');
const lastTransformEl = el('lastTransform');
const sliceStart = el('sliceStart'); const sliceEnd = el('sliceEnd');
const sliceResult = el('sliceResult');
const findText = el('findText'), replaceText = el('replaceText'), useRegex = el('useRegex'), regexFlags = el('regexFlags');
const preview = el('preview');
const codes = el('codes');
const base64input = el('base64');
const tpl = el('tpl'), vars = el('vars'), tplOut = el('tplOut');
const utilOut = el('utilOut');
const perfResult = el('perfResult');

// sample initial content
const SAMPLE = `Hello, world! 👋🏽
This is StringLab — a single-project deep dive into JavaScript strings.
Accented words: café, naïve, résumé.
Combining sequence: a\u0301 (a + U+0301)
Emoji family: 👨‍👩‍👧‍👦 and skin-tones 👋🏽
URL sample: https://example.com?q=héllo&lang=fr
Mentions: @alice @bob #javascript
`;

// Initialize
input.value = SAMPLE;
let lastTransform = '';

// --- Core update function: recompute stats and previews ---
function updateAll() {
  const s = input.value;
  lenEl.textContent = s.length;
  const cpCount = Array.from(s).length; // counts code points
  codepointsEl.textContent = cpCount;
  graphEl.textContent = graphemeCount(s);
  const encoder = new TextEncoder();
  utf8El.textContent = encoder.encode(s).length;
  wordsEl.textContent = (s.trim().length === 0) ? 0 : s.trim().split(/\s+/).length;
  linesEl.textContent = s.split(/\r\n|\r|\n/).length;

  // UTF-16 units table
  unitTableBody.innerHTML = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    const code = s.charCodeAt(i);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i}</td><td>U+${code.toString(16).toUpperCase().padStart(4,'0')}</td><td>${escapeHtml(ch)}</td><td>${code}</td>`;
    unitTableBody.appendChild(tr);
  }

  // code points table
  pointTableBody.innerHTML = '';
  let idx = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    const hex = 'U+' + cp.toString(16).toUpperCase();
    const row = document.createElement('tr');
    row.innerHTML = `<td>${++idx}</td><td>${escapeHtml(ch)}</td><td>${cp}</td><td>${hex}</td>`;
    pointTableBody.appendChild(row);
  }

  // preview (escaped) default
  preview.innerHTML = escapeHtml(s);

  // keep last result area synced if empty
  if (!lastTransform) lastTransformEl.textContent = '';
}

// --- Button behaviors and transformations ---

// quick actions
el('preset-sample').addEventListener('click', ()=>{ input.value = SAMPLE; updateAll(); });
el('reset').addEventListener('click', ()=>{ input.value = ''; updateAll(); });
el('copy').addEventListener('click', ()=>{ navigator.clipboard?.writeText(input.value).then(()=>alert('Copied!')).catch(()=>alert('Copy failed')); });

// Presets
document.querySelectorAll('[data-preset]').forEach(btn=>{
  btn.addEventListener('click', () => {
    const p = btn.getAttribute('data-preset');
    if (p === 'short') input.value = 'Hello JS';
    if (p === 'emoji') input.value = '🏳️‍🌈 👨‍👩‍👦‍👦 🤝 👩🏽‍💻';
    if (p === 'accent') input.value = 'Café naïve coöperate résumé A\u0301';
    if (p === 'url') input.value = 'Visit https://example.com?q=héllo @alice #fun';
    updateAll();
  });
});

// Immutable demo buttons
el('make-upper').addEventListener('click', ()=> {
  lastTransform = input.value.toUpperCase();
  lastTransformEl.textContent = lastTransform;
});
el('make-lower').addEventListener('click', ()=> {
  lastTransform = input.value.toLowerCase();
  lastTransformEl.textContent = lastTransform;
});
el('trim-collapse').addEventListener('click', ()=> {
  lastTransform = input.value.trim().replace(/\s+/g, ' ');
  lastTransformEl.textContent = lastTransform;
});
el('title-case').addEventListener('click', ()=> {
  lastTransform = titleCase(input.value);
  lastTransformEl.textContent = lastTransform;
});
el('swap-case').addEventListener('click', ()=> {
  lastTransform = swapCase(input.value);
  lastTransformEl.textContent = lastTransform;
});
el('repeat-3').addEventListener('click', ()=> {
  lastTransform = input.value.repeat(3);
  lastTransformEl.textContent = lastTransform;
});
el('apply-last').addEventListener('click', ()=> {
  if (!lastTransform) { alert('No last transform to apply — use transformations first.'); return; }
  input.value = lastTransform;
  updateAll();
});

// Slicing
el('doSlice').addEventListener('click', ()=> {
  const s = input.value;
  const start = parseInt(sliceStart.value || 0, 10);
  const end = sliceEnd.value === '' ? undefined : parseInt(sliceEnd.value, 10);
  const res = s.slice(start, end);
  sliceResult.textContent = res;
  lastTransform = res;
  lastTransformEl.textContent = lastTransform;
});
el('doSubstring').addEventListener('click', ()=> {
  const s = input.value;
  const start = parseInt(sliceStart.value || 0, 10);
  const end = sliceEnd.value === '' ? undefined : parseInt(sliceEnd.value, 10);
  const res = (end === undefined) ? s.substring(start) : s.substring(start, end);
  sliceResult.textContent = res;
  lastTransform = res;
  lastTransformEl.textContent = lastTransform;
});
el('doSubstr').addEventListener('click', ()=> {
  const s = input.value;
  const start = parseInt(sliceStart.value || 0, 10);
  // substr uses length as second parameter
  const len = sliceEnd.value === '' ? undefined : Math.max(0, parseInt(sliceEnd.value, 10) - start);
  const res = (len === undefined) ? s.substr(start) : s.substr(start, len);
  sliceResult.textContent = res;
  lastTransform = res;
  lastTransformEl.textContent = lastTransform;
});

// Replace & regex
el('doReplace').addEventListener('click', ()=> applyReplace(false));
el('replaceAll').addEventListener('click', ()=> applyReplace(true));
el('linkify').addEventListener('click', ()=> {
  const out = linkify(input.value);
  preview.innerHTML = out.replace(/\n/g, '<br>');
  lastTransform = input.value; // linkify was only previewed
  lastTransformEl.textContent = '(preview only) linkify';
});

function applyReplace(forceAll) {
  const s = input.value;
  const find = findText.value;
  const repl = replaceText.value;
  const useRx = useRegex.checked;
  const flags = regexFlags.value || '';
  try {
    let rx;
    if (useRx) rx = new RegExp(find, flags + (flags.indexOf('g') === -1 && forceAll ? 'g' : ''));
    else rx = new RegExp(escapeRegExp(find), forceAll ? 'g' : '');
    const res = s.replace(rx, repl);
    // preview with highlights
    const highlighted = escapeHtml(res).replace(/\n/g, '<br>').replace(
      useRx ? rx : new RegExp(escapeRegExp(repl), 'g'),
      m => `<mark>${m}</mark>`
    );
    preview.innerHTML = escapeHtml(res).replace(/\n/g, '<br>');
    lastTransform = res;
    lastTransformEl.textContent = lastTransform;
  } catch (err) {
    alert('Regex error: ' + err.message);
  }
}

// Preview updates: highlight search query live when typing findText
findText.addEventListener('input', ()=> {
  const s = input.value;
  const q = findText.value;
  if (!q) { preview.innerHTML = escapeHtml(s); return; }
  try {
    const rx = useRegex.checked ? new RegExp(q, regexFlags.value || 'g') : new RegExp(escapeRegExp(q), 'g');
    preview.innerHTML = escapeHtml(s).replace(rx, m => `<mark>${escapeHtml(m)}</mark>`).replace(/\n/g, '<br>');
  } catch(e) {
    preview.innerHTML = escapeHtml(s);
  }
});
useRegex.addEventListener('change', ()=> findText.dispatchEvent(new Event('input')));
regexFlags.addEventListener('input', ()=> findText.dispatchEvent(new Event('input')));

// Unicode and emoji helpers
el('showCharCodes').addEventListener('click', ()=>{
  const s = input.value;
  const parts = Array.from(s).slice(0,20).map(ch => {
    return `${escapeHtml(ch)} → codePoint: ${ch.codePointAt(0)} (0x${ch.codePointAt(0).toString(16)})`;
  }).join('\n');
  codes.textContent = parts || '(empty)';
});
el('countGraphemes').addEventListener('click', ()=> {
  codes.textContent = 'Grapheme clusters: ' + graphemeCount(input.value);
});

// Base64
el('encodeBase64').addEventListener('click', ()=> {
  base64input.value = base64EncodeUnicode(input.value);
});
el('decodeBase64').addEventListener('click', ()=> {
  const dec = base64DecodeUnicode(base64input.value.trim());
  if (dec === null) { alert('Invalid base64'); return; }
  input.value = dec;
  updateAll();
});

// Template literals (safe interpolation)
el('interp').addEventListener('click', ()=> {
  const template = tpl.value;
  const variables = safeJsonParse(vars.value) || {};
  const out = template.replace(/\$\{([^}]+)\}/g, (_, path) => {
    const val = resolvePath(variables, path.trim());
    return val === undefined ? '' : String(val);
  });
  tplOut.textContent = out;
  lastTransform = out;
  lastTransformEl.textContent = lastTransform;
});

// Tagged template: HTML-escaping tag
function escapeValuesTag(strings, ...values) {
  // join strings and escaped values
  return strings.reduce((acc, s, i) => acc + s + (i < values.length ? escapeHtml(String(values[i])) : ''), '');
}
el('tagged').addEventListener('click', ()=> {
  const template = tpl.value;
  // Basic parse of ${...} - don't evaluate expressions, only look up variables
  const variables = safeJsonParse(vars.value) || {};
  // We'll build arrays like tagged`...${val}...${val2}...`
  // Split into strings and values by regex:
  const parts = template.split(/\$\{([^}]+)\}/g);
  const strings = [];
  const values = [];
  for (let i=0;i<parts.length;i++){
    if (i % 2 === 0) strings.push(parts[i]); else {
      values.push(resolvePath(variables, parts[i].trim()) || '');
    }
  }
  try {
    const result = escapeValuesTag(strings, ...values);
    tplOut.textContent = result;
    lastTransform = result;
    lastTransformEl.textContent = lastTransform;
  } catch(e) {
    alert('Tagged template error: ' + e.message);
  }
});

// String.raw demo
el('rawdemo').addEventListener('click', ()=> {
  const s = String.raw`${tpl.value}`;
  tplOut.textContent = s;
});

// Utilities
el('slugifyBtn').addEventListener('click', ()=> {
  utilOut.textContent = slugify(input.value);
});
el('escapeHtmlBtn').addEventListener('click', ()=> {
  utilOut.textContent = escapeHtml(input.value);
});
el('padStartBtn').addEventListener('click', ()=> {
  const count = Number(el('padCount').value) || 0;
  const ch = el('padChar').value || ' ';
  utilOut.textContent = input.value.padStart(count, ch);
});
el('padEndBtn').addEventListener('click', ()=> {
  const count = Number(el('padCount').value) || 0;
  const ch = el('padChar').value || ' ';
  utilOut.textContent = input.value.padEnd(count, ch);
});

// Perf test: concat vs join
el('perfRun').addEventListener('click', async ()=> {
  const n = Number(el('perfCount').value) || 10000;
  perfResult.textContent = 'Running...';
  await new Promise(r => setTimeout(r, 20));
  // concat
  const t0 = performance.now();
  let s = '';
  for (let i=0;i<n;i++) s += 'x';
  const t1 = performance.now();
  // join
  const t2 = performance.now();
  const arr = new Array(n).fill('x');
  const j = arr.join('');
  const t3 = performance.now();
  perfResult.textContent = `concat: ${(t1-t0).toFixed(2)} ms\njoin: ${(t3-t2).toFixed(2)} ms\nlengths: concat=${s.length}, join=${j.length}`;
});

// keep UI in sync
input.addEventListener('input', ()=> {
  updateAll();
  // force preview update for find highlighting
  findText.dispatchEvent(new Event('input'));
});

// initial render
updateAll();
findText.dispatchEvent(new Event('input'));

/* End of StringLab */
