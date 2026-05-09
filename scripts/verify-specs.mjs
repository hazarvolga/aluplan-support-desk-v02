#!/usr/bin/env node
// Generic spec doğrulayıcı — .kiro/specs/*/verify.mjs dosyalarını otomatik keşfeder ve çalıştırır.
//
// Politika:
//   - Spec'in verify.mjs'i yoksa: WARN (uyarı verir, ama exit kırmızı yapmaz)
//   - Spec'in verify.mjs'i mismatch döndürürse (exit != 0): FAIL
//   - Ortam değişkeni SPEC_VERIFY_STRICT=1: missing verify.mjs de FAIL sayılır
//
// CI'da çalıştırma:  node scripts/verify-specs.mjs
// Lokal:             pnpm spec:verify

import { readdirSync, existsSync, statSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const SPECS_DIR = join(REPO, '.kiro/specs');
const STRICT = process.env.SPEC_VERIFY_STRICT === '1';
const SUMMARY_FILE = process.env.GITHUB_STEP_SUMMARY || null;

const RED = '\x1b[31m';
const GRN = '\x1b[32m';
const YLW = '\x1b[33m';
const RST = '\x1b[0m';
const BLD = '\x1b[1m';

const summary = (md) => {
  if (SUMMARY_FILE) appendFileSync(SUMMARY_FILE, md + '\n');
};

if (!existsSync(SPECS_DIR)) {
  console.log(`${YLW}.kiro/specs/ bulunamadı, atlanıyor.${RST}`);
  process.exit(0);
}

const specs = readdirSync(SPECS_DIR)
  .filter((n) => !n.startsWith('.'))
  .filter((n) => statSync(join(SPECS_DIR, n)).isDirectory())
  .sort();

if (specs.length === 0) {
  console.log(`${YLW}Hiç spec bulunamadı.${RST}`);
  process.exit(0);
}

console.log(BLD + `\nSpec doğrulama başlatıldı (${specs.length} spec, strict=${STRICT})\n` + RST);
summary(`# Spec doğrulama (${specs.length} spec)\n`);
summary(`| Spec | Durum |`);
summary(`|------|-------|`);

let passed = 0;
let failed = 0;
let missing = 0;
const failures = [];

for (const spec of specs) {
  const verifier = join(SPECS_DIR, spec, 'verify.mjs');
  if (!existsSync(verifier)) {
    const tag = STRICT ? `${RED}MISSING${RST}` : `${YLW}MISSING${RST}`;
    console.log(`  ${spec.padEnd(40)} ${tag} (verify.mjs yok)`);
    summary(`| \`${spec}\` | ${STRICT ? 'FAIL' : 'WARN'} — verify.mjs yok |`);
    if (STRICT) failed++;
    else missing++;
    if (STRICT) failures.push(`${spec}: verify.mjs eksik`);
    continue;
  }
  console.log(BLD + `\n▶ ${spec}` + RST);
  const r = spawnSync('node', [verifier], { stdio: 'inherit', cwd: REPO });
  if (r.status === 0) {
    passed++;
    summary(`| \`${spec}\` | ✅ OK |`);
  } else {
    failed++;
    failures.push(`${spec}: tasks.md ↔ kod uyumsuz (exit=${r.status})`);
    summary(`| \`${spec}\` | ❌ FAIL — tasks.md ↔ kod uyumsuz |`);
  }
}

const total = specs.length;
console.log(
  BLD +
    `\n=== Özet: ${passed}/${total} OK, ${failed} fail` +
    (missing > 0 ? `, ${missing} verify.mjs eksik (warn)` : '') +
    ` ===` +
    RST,
);

if (failures.length > 0) {
  console.log(RED + '\nHatalar:' + RST);
  for (const f of failures) console.log(`  - ${f}`);
  summary(`\n## Hatalar\n` + failures.map((f) => `- ${f}`).join('\n'));
}

if (missing > 0 && !STRICT) {
  console.log(
    YLW +
      `\nNot: ${missing} spec için verify.mjs yok. Production'da SPEC_VERIFY_STRICT=1 ile bu uyumsuzluk fail'e dönüşür.` +
      RST,
  );
}

process.exit(failed > 0 ? 1 : 0);
