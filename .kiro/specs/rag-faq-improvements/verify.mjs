#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src');
const SCHEMA = join(REPO, 'packages/database/prisma/schema.prisma');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };
const hasNone = (p, ...terms) => { const c = read(p); return c == null ? true : terms.every(t => !c.includes(t)); };

const checks = [
  { id: '1', desc: 'schema.prisma KnowledgePoolEmbedding parentId + FaqEntry questionEmbedding var',
    check: () => has(SCHEMA, 'parentId') && has(SCHEMA, 'questionEmbedding') },
  { id: '2', desc: 'prompt-context-builder.service.ts kbContent düzeltildi + APPROVED KNOWLEDGE SOURCE var',
    check: () => has(join(BE, 'ai/prompt-context-builder.service.ts'), 'kbContent', 'APPROVED KNOWLEDGE SOURCE') },
  { id: '3', desc: 'ai-query.service.ts streamQuery LOW_CONFIDENCE / NO_MATCH kontrolü var',
    check: () => has(join(BE, 'ai/ai-query.service.ts'), 'NO_MATCH') || has(join(BE, 'ai/ai-query.service.ts'), 'LOW_CONFIDENCE') },
  { id: '4', desc: 'embedding.service.ts hierarchicalChunk kullanıyor',
    check: () => has(join(BE, 'ai/embedding.service.ts'), 'hierarchicalChunk') },
  { id: '5', desc: 'embedding.service.ts search() child→parent JOIN pattern var',
    check: () => has(join(BE, 'ai/embedding.service.ts'), 'parentId') },
  { id: '6', desc: 'faq.service.ts embedText + semantik deduplication pipeline var',
    check: () => has(join(BE, 'faq/faq.service.ts'), 'embedText') || has(join(BE, 'faq/faq.service.ts'), 'dedup') || has(join(BE, 'ai/embedding.service.ts'), 'embedText') },
  { id: '7', desc: 'ai-auto-resolver.service.ts faqEntry.create() kaldırıldı',
    check: () => hasNone(join(BE, 'ai/ai-auto-resolver.service.ts'), 'faqEntry.create') },
  { id: '8', desc: 'kb-summarizer.processor.ts duplicate/idempotency koruması var',
    check: () => has(join(BE, 'faq/kb-summarizer.processor.ts'), 'knowledgeBaseAdded') },
  { id: '9', desc: 'Property testler var (fast-check import, .pbt.spec.ts)',
    check: () => has(join(BE, 'ai/ai-query.service.pbt.spec.ts'), 'fast-check')
              || has(join(BE, 'faq/faq.service.pbt.spec.ts'), 'fast-check')
              || has(join(BE, 'ai/prompt-context-builder.service.pbt.spec.ts'), 'fast-check')
              || has(join(BE, 'ai/embedding.service.pbt.spec.ts'), 'fast-check') },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: rag-faq-improvements\n' + RST);

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
