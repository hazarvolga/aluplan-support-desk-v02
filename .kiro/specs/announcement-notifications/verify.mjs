#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src');
const FE = join(REPO, 'apps/frontend/src');
const SCHEMA = join(REPO, 'packages/database/prisma/schema.prisma');
const EN = join(REPO, 'apps/frontend/messages/en.json');
const TR = join(REPO, 'apps/frontend/messages/tr.json');
const DE = join(REPO, 'apps/frontend/messages/de.json');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const exists = (p) => existsSync(p);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };
const loadJson = (p) => { try { return JSON.parse(read(p) || 'null'); } catch { return null; } };
const dig = (o, ...ks) => ks.reduce((x, k) => (x == null ? null : x[k]), o);

const ANNC_SVC = join(BE, 'announcements/announcements.service.ts');
const ANNC_CTL = join(BE, 'announcements/announcements.controller.ts');
const ANNC_MOD = join(BE, 'announcements/announcements.module.ts');

const checks = [
  { id: '1', desc: 'schema.prisma AnnouncementLog readAt alanı var',
    check: () => has(SCHEMA, 'readAt') },
  { id: '2', desc: 'AnnouncementsService: generateExcerpt, getMyAnnouncements, markLogRead, getMyUnreadCount var',
    check: () => has(ANNC_SVC, 'generateExcerpt', 'getMyAnnouncements', 'markLogRead', 'getMyUnreadCount') },
  { id: '3', desc: 'NotificationsModule AnnouncementsModule\'e import edilmiş ve ANNOUNCEMENT_RECEIVED emit var',
    check: () => has(ANNC_MOD, 'NotificationsModule')
              && has(ANNC_SVC, 'ANNOUNCEMENT_RECEIVED') },
  { id: '4', desc: 'GET /announcements/my, unread-count, PATCH mark-read endpoint\'leri var',
    check: () => has(ANNC_CTL, 'getMyAnnouncements', 'markLogRead') },
  { id: '5', desc: 'Backend testler checkpoint',
    check: () => has(ANNC_SVC, 'generateExcerpt') && has(ANNC_MOD, 'NotificationsModule') },
  { id: '6', desc: 'announcement-store.ts var, api.ts getUnreadCount var',
    check: () => exists(join(FE, 'stores/announcement-store.ts'))
              && has(join(FE, 'lib/api.ts'), 'getUnreadCount') },
  { id: '7', desc: 'GlobalAnnouncementNotification bileşeni var ve layout\'a eklenmiş',
    check: () => exists(join(FE, 'components/global-announcement-notification.tsx')) },
  { id: '8', desc: 'Sidebar bell ve unread badge var',
    check: () => has(join(FE, 'components/sidebar.tsx'), 'isAnnouncementBell') },
  { id: '9', desc: 'AnnouncementArchiveDrawer var',
    check: () => exists(join(FE, 'components/announcement-archive-drawer.tsx')) },
  { id: '10', desc: 'i18n: en/tr/de announcements.toast_view var',
    check: () => dig(loadJson(EN), 'announcements', 'toast_view') != null
              && dig(loadJson(TR), 'announcements', 'toast_view') != null
              && dig(loadJson(DE), 'announcements', 'toast_view') != null },
  { id: '11', desc: 'Final checkpoint: tüm kritik dosyalar mevcut',
    check: () => exists(join(FE, 'stores/announcement-store.ts'))
              && exists(join(FE, 'components/announcement-archive-drawer.tsx'))
              && has(ANNC_SVC, 'generateExcerpt') },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: announcement-notifications\n' + RST);

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
