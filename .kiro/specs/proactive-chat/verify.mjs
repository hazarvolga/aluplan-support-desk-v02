#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src');
const FE = join(REPO, 'apps/frontend/src');
const SCHEMA = join(REPO, 'packages/database/prisma/schema.prisma');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const exists = (p) => existsSync(p);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };

const PC = join(BE, 'proactive-chat');
const PC_FE = join(FE, 'components/proactive-chat');

const checks = [
  { id: '1', desc: 'schema.prisma ProactiveChatSession + ProactiveChatMessage modelleri var',
    check: () => has(SCHEMA, 'ProactiveChatSession', 'ProactiveChatMessage') },
  { id: '2', desc: 'proactive-chat module/controller/service/processor dosyaları var',
    check: () => exists(join(PC, 'proactive-chat.module.ts'))
              && exists(join(PC, 'proactive-chat.controller.ts'))
              && exists(join(PC, 'proactive-chat.service.ts'))
              && exists(join(PC, 'proactive-chat-timeout.processor.ts')) },
  { id: '3', desc: 'ProactiveChatService oturum CRUD metodları var',
    check: () => has(join(PC, 'proactive-chat.service.ts'), 'createSession', 'acceptSession', 'declineSession', 'endSession') },
  { id: '4', desc: 'ProactiveChatService mesajlaşma metodları var',
    check: () => has(join(PC, 'proactive-chat.service.ts'), 'sendMessage', 'getMessages') },
  { id: '5', desc: 'Timeout processor pending-timeout ve disconnect-timeout handler\'ları var',
    check: () => has(join(PC, 'proactive-chat-timeout.processor.ts'), 'pending-timeout') },
  { id: '6', desc: 'convertToTicket metodu var',
    check: () => has(join(PC, 'proactive-chat.service.ts'), 'convertToTicket') },
  { id: '7', desc: 'Yetkilendirme: RbacGuard var',
    check: () => has(join(PC, 'proactive-chat.controller.ts'), 'RbacGuard') },
  { id: '8', desc: 'Backend testler var (spec dosyası)',
    check: () => exists(join(PC, 'proactive-chat.service.spec.ts'))
              || exists(join(PC, 'proactive-chat.spec.ts'))
              || exists(join(PC, '__tests__/proactive-chat.service.spec.ts'))
              || exists(join(PC, '__tests__/proactive-chat.spec.ts')) },
  { id: '9', desc: 'api.ts proactiveChat namespace var',
    check: () => has(join(FE, 'lib/api.ts'), 'proactiveChat') },
  { id: '10', desc: 'ProactiveChatInvite bileşeni var',
    check: () => exists(join(PC_FE, 'ProactiveChatInvite.tsx')) },
  { id: '11', desc: 'ProactiveChatWindow bileşeni var',
    check: () => exists(join(PC_FE, 'ProactiveChatWindow.tsx')) },
  { id: '12', desc: 'ProactiveChatPendingBadge bileşeni var',
    check: () => exists(join(PC_FE, 'ProactiveChatPendingBadge.tsx')) },
  { id: '13', desc: 'ActiveSessionsPanel bileşeni var',
    check: () => exists(join(PC_FE, 'ActiveSessionsPanel.tsx')) },
  { id: '14', desc: 'customers/page.tsx Proaktif Chat butonu var',
    check: () => has(join(FE, 'app/[locale]/(dashboard)/customers/page.tsx'), 'proactiveChat') || has(join(FE, 'app/[locale]/(dashboard)/customers/page.tsx'), 'createSession') },
  { id: '15', desc: 'Global WS entegrasyonu: layout\'a ProactiveChatInvite eklenmiş',
    check: () => has(join(FE, 'app/[locale]/(dashboard)/layout.tsx'), 'ProactiveChatInvite') || has(join(FE, 'app/[locale]/(dashboard)/layout.tsx'), 'proactive') },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: proactive-chat\n' + RST);

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
