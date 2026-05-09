#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src/ai');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const exists = (p) => existsSync(p);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };

const checks = [
  { id: '1', desc: 'map-parts-to-openai.ts var, OpenAiContentBlock + mapPartsToOpenAi export ediyor',
    check: () => has(join(BE, 'utils/map-parts-to-openai.ts'), 'OpenAiContentBlock', 'mapPartsToOpenAi') },
  { id: '2', desc: 'AiProvider interface JSDoc güncellendi',
    check: () => has(join(BE, 'interfaces/ai-provider.interface.ts'), 'inlineData') },
  { id: '3', desc: 'OpenAiService mapPartsToOpenAi kullanıyor',
    check: () => has(join(BE, 'openai.service.ts'), 'mapPartsToOpenAi') },
  { id: '4', desc: 'LlmApiService mapPartsToOpenAi kullanıyor',
    check: () => has(join(BE, 'llm-api.service.ts'), 'mapPartsToOpenAi') },
  { id: '5', desc: 'GenericOpenAiService mapPartsToOpenAi kullanıyor',
    check: () => has(join(BE, 'generic-openai.service.ts'), 'mapPartsToOpenAi') },
  { id: '6', desc: 'AiQueryService normalizeImageAttachments var ve StorageService inject edilmiş',
    check: () => has(join(BE, 'ai-query.service.ts'), 'normalizeImageAttachments', 'StorageService') },
  { id: '7', desc: 'AiService reformat() text-only retry (graceful degradation) var',
    check: () => has(join(BE, 'ai.service.ts'), 'textOnlyAttachments') },
  { id: '8', desc: 'Checkpoint: tüm provider\'lar güncellendi',
    check: () => has(join(BE, 'openai.service.ts'), 'mapPartsToOpenAi')
              && has(join(BE, 'llm-api.service.ts'), 'mapPartsToOpenAi')
              && has(join(BE, 'generic-openai.service.ts'), 'mapPartsToOpenAi') },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: attachment-vision-support\n' + RST);

for (const c of checks) {
  const actual = (() => { try { return !!c.check(); } catch { return false; } })();
  const marker = markers[c.id] ?? '?';
  const markedDone = marker === 'x';
  let status, color;
  if (actual === markedDone) { status = actual ? 'OK    [x]' : 'OK    [ ]'; color = GRN; }
  else if (actual && !markedDone) { status = `STALE [${marker}] ama YAPILMIŞ`; color = YLW; mismatches++; }
  else { status = `WRONG [${marker}] ama YAPILMAMIŞ`; color = RED; mismatches++; }
  console.log(`  ${c.id.padEnd(4)} ${color}${status}${RST}  ${c.desc}`);
}

console.log(`\nÖzet: ${checks.length - mismatches}/${checks.length} OK, ${mismatches} uyumsuz\n`);
process.exit(mismatches > 0 ? 1 : 0);
