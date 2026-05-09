#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src/crm');
const FE = join(REPO, 'apps/frontend/src');
const SCHEMA = join(REPO, 'packages/database/prisma/schema.prisma');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };

const ADAPTER = join(BE, 'adapters/dynamics365.adapter.ts');
const CRM_SVC = join(BE, 'crm.service.ts');
const CRM_PAGE = join(FE, 'app/[locale]/(dashboard)/customers/crm/page.tsx');

const checks = [
  { id: '1',   desc: 'schema.prisma CrmAccount customerNo alanı var',
    check: () => has(SCHEMA, 'customerNo') },
  { id: '2.1', desc: 'dynamics365.adapter.ts upsert customerNo içeriyor',
    check: () => has(ADAPTER, 'customerNo') },
  { id: '2.2', desc: '(opsiyonel) customerNo round-trip property testi',
    check: () => false }, // optional — never done
  { id: '3.1', desc: 'resolveField FormattedValue önceliği var',
    check: () => has(ADAPTER, 'FormattedValue') },
  { id: '3.2', desc: '(opsiyonel) FormattedValue property testi',
    check: () => false },
  { id: '3.3', desc: '(opsiyonel) resolveField birim testleri',
    check: () => false },
  { id: '4.1', desc: 'fetchEntityMetadata EntityDefinitions endpoint kullanıyor',
    check: () => has(ADAPTER, 'EntityDefinitions') },
  { id: '4.2', desc: '(opsiyonel) fetchEntityMetadata birim testi',
    check: () => false },
  { id: '4.3', desc: '(opsiyonel) Discovery alan yapısı property testi',
    check: () => false },
  { id: '5.1', desc: 'crm.service.ts SyncDetails arayüzü ve buildSyncDetails var',
    check: () => has(CRM_SVC, 'SyncDetails') || has(CRM_SVC, 'buildSyncDetails') || has(CRM_SVC, 'failedRecords') },
  { id: '5.2', desc: 'crm.service.ts executeSyncProcess details alanına sahip',
    check: () => has(CRM_SVC, 'details') },
  { id: '5.3', desc: '(opsiyonel) hata log yapısı property testi',
    check: () => false },
  { id: '6.1', desc: 'syncContacts skippedLinks loglama var',
    check: () => has(ADAPTER, 'skippedLinks') },
  { id: '6.2', desc: '(opsiyonel) senkronizasyon sırası property testi',
    check: () => false },
  { id: '6.3', desc: '(opsiyonel) executeSyncProcess birim testi',
    check: () => false },
  { id: '7',   desc: 'Checkpoint — testler geçiyor',
    check: () => has(ADAPTER, 'FormattedValue') && has(ADAPTER, 'EntityDefinitions') },
  { id: '8',   desc: 'Frontend SyncLog arayüzü details alanını içeriyor',
    check: () => has(CRM_PAGE, 'details') },
  { id: '9.1', desc: 'SyncLogRow bileşeni genişletilebilir hata detayı paneli var',
    check: () => has(CRM_PAGE, 'details-button') || has(CRM_PAGE, 'SyncLogRow') || has(CRM_PAGE, 'expandedLogId') },
  { id: '9.2', desc: '(opsiyonel) Detaylar butonu property testi',
    check: () => false },
  { id: '9.3', desc: '(opsiyonel) SyncLogRow birim testi',
    check: () => false },
  { id: '10',  desc: 'Son checkpoint — kritik dosyalar tamamlandı',
    check: () => has(ADAPTER, 'customerNo') && has(ADAPTER, 'FormattedValue') && has(CRM_SVC, 'details') },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];
// optional marker: *
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s*\*?\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: crm-sync-improvements\n' + RST);

for (const c of checks) {
  const actual = (() => { try { return !!c.check(); } catch { return false; } })();
  const marker = markers[c.id] ?? '?';
  const markedDone = marker === 'x';
  let status, color;
  if (actual === markedDone) { status = actual ? 'OK    [x]' : 'OK    [ ]'; color = GRN; }
  else if (actual && !markedDone) { status = `STALE [${marker}] ama YAPILMIŞ`; color = YLW; mismatches++; }
  else { status = `WRONG [${marker}] ama YAPILMAMIŞ`; color = RED; mismatches++; }
  console.log(`  ${c.id.padEnd(6)} ${color}${status}${RST}  ${c.desc}`);
}

console.log(`\nÖzet: ${checks.length - mismatches}/${checks.length} OK, ${mismatches} uyumsuz\n`);
process.exit(mismatches > 0 ? 1 : 0);
