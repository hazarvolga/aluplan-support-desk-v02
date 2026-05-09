#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src');
const SCHEMA = join(REPO, 'packages/database/prisma/schema.prisma');
const ENV_EXAMPLE = join(REPO, '.env.example');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const exists = (p) => existsSync(p);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };
const hasNone = (p, ...terms) => { const c = read(p); return c == null ? true : terms.every(t => !c.includes(t)); };
const occurrences = (p, re) => { const c = read(p); return c == null ? 0 : (c.match(re) || []).length; };

const checks = [
  { id: '1', desc: 'VertexAI kaldırıldı: ai.service.ts + ai.module.ts + dosya silindi',
    check: () => !exists(join(BE, 'ai/vertex-ai.service.ts'))
              && hasNone(join(BE, 'ai/ai.service.ts'), 'VertexAiService')
              && hasNone(join(BE, 'ai/ai.module.ts'), 'VertexAiService') },
  { id: '2', desc: 'langfuse.service.ts addEvent() metodu var',
    check: () => has(join(BE, 'ai/langfuse.service.ts'), 'addEvent') },
  { id: '3', desc: 'schema.prisma AiShiftDetection modeli var',
    check: () => has(SCHEMA, 'AiShiftDetection') },
  { id: '4', desc: 'ai-query.service.ts shift detection bloğu var (isProblemShift)',
    check: () => has(join(BE, 'ai/ai-query.service.ts'), 'isProblemShift') },
  { id: '5', desc: 'ai-copilot.service.ts shift sonrası messages kırpma var',
    check: () => has(join(BE, 'ai/ai-copilot.service.ts'), 'isProblemShift') },
  { id: '6', desc: 'ai.controller.ts JwtAuthGuard ile güvenli ve NotFoundException var',
    check: () => has(join(BE, 'ai/ai.controller.ts'), 'JwtAuthGuard', 'NotFoundException') },
  { id: '7', desc: 'ai-query.processor.ts BullMQ rate limiter var (AI_QUEUE_RATE_MAX)',
    check: () => has(join(BE, 'ai/ai-query.processor.ts'), 'AI_QUEUE_RATE_MAX') },
  { id: '8', desc: '.env.example AI_QUEUE_RATE_MAX ve AI_QUEUE_RATE_DURATION_MS var',
    check: () => has(ENV_EXAMPLE, 'AI_QUEUE_RATE_MAX', 'AI_QUEUE_RATE_DURATION_MS') },
  { id: '9', desc: 'Checkpoint: tüm önceki adımlar tamamlandı',
    check: () => !exists(join(BE, 'ai/vertex-ai.service.ts'))
              && has(join(BE, 'ai/langfuse.service.ts'), 'addEvent')
              && has(SCHEMA, 'AiShiftDetection') },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: ai-pipeline-optimization\n' + RST);

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
