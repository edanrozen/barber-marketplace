#!/usr/bin/env node
//
// CI gate (E6 T6.1.3): fail on hard-coded user-facing strings in client UI.
// Scans .tsx files under apps for JSX text nodes containing letters. All user-facing
// text must come from the i18n catalog via t(); expressions like {t('key')} are ignored.
//
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['apps'];
const TEXT_NODE = />(\s*[^<>{}\n]*[A-Za-z\u0590-\u05FF][^<>{}\n]*)</g;
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) scan(p);
  }
}
function scan(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    TEXT_NODE.lastIndex = 0;
    let m;
    while ((m = TEXT_NODE.exec(line)) !== null) {
      const text = m[1].trim();
      if (text.length > 0) violations.push(`${file}:${i + 1}: hard-coded UI text "${text}"`);
    }
  });
}

for (const r of ROOTS) {
  try { walk(r); } catch { /* root may not exist yet */ }
}
if (violations.length > 0) {
  console.error('FAIL: hard-coded user-facing strings found - use t() + the i18n catalog:');
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
console.log(`OK: no hard-coded user-facing strings in ${ROOTS.join(', ')}`);
