#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src/customers');
const FE = join(REPO, 'apps/frontend/src');
const SCHEMA = join(REPO, 'packages/database/prisma/schema.prisma');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };

const CUST_PAGE = join(FE, 'app/[locale]/(dashboard)/customers/page.tsx');
const IMPORT_PAGE = join(FE, 'app/[locale]/(dashboard)/customers/import/page.tsx');
const EN = join(REPO, 'apps/frontend/messages/en.json');
const TR = join(REPO, 'apps/frontend/messages/tr.json');
const loadJson = (p) => { try { return JSON.parse(read(p) || 'null'); } catch { return null; } };
const dig = (o, ...ks) => ks.reduce((x, k) => (x == null ? null : x[k]), o);

// NOTE: tasks.md has these all as [ ] but code evidence shows some are already done.
// The verifier will catch the mismatch.

const checks = [
  // Phase 1: Database
  { id: '1.1', desc: 'schema.prisma CustomerProfile subscriptionModel alanı var',
    check: () => has(SCHEMA, 'subscriptionModel') },
  { id: '1.2', desc: 'Migration oluşturuldu (schema\'da alan mevcut)',
    check: () => has(SCHEMA, 'subscriptionModel') },
  // Phase 2: Backend
  { id: '2.1', desc: 'import-customers.dto.ts subscriptionModel var',
    check: () => has(join(BE, 'dto/import-customers.dto.ts'), 'subscriptionModel') },
  { id: '2.2', desc: 'customers.service.ts importCustomers subscriptionModel handle ediyor',
    check: () => has(join(BE, 'customers.service.ts'), 'subscriptionModel') },
  { id: '2.3', desc: 'Backend birim testleri (subscriptionModel)',
    check: () => false }, // manual verification only
  // Phase 3: Frontend
  { id: '3.1', desc: 'customers/page.tsx CustomerItem subscriptionModel alanı var',
    check: () => has(CUST_PAGE, 'subscriptionModel') },
  { id: '3.2', desc: 'customers/page.tsx subscriptionModel sütunu var',
    check: () => has(CUST_PAGE, 'subscriptionModel') },
  { id: '3.3', desc: 'Sort logic subscriptionModel case\'i var',
    check: () => has(CUST_PAGE, 'subscriptionModel') },
  { id: '3.4', desc: 'Search filter subscriptionModel dahil',
    check: () => has(CUST_PAGE, 'subscriptionModel') },
  { id: '3.5', desc: 'CSV import subscriptionModel mapping var',
    check: () => has(IMPORT_PAGE, 'subscriptionModel') || has(IMPORT_PAGE, 'Abonelik') },
  { id: '3.6', desc: 'i18n: subscriptionModel key\'i en/tr\'de var',
    check: () => {
      const en = loadJson(EN); const tr = loadJson(TR);
      return dig(en, 'customers', 'subscriptionModel') != null || dig(en, 'table', 'subscriptionModel') != null
          || dig(tr, 'customers', 'subscriptionModel') != null;
    } },
  { id: '3.7', desc: 'Frontend birim testleri',
    check: () => false }, // manual
  // Phase 4-8: property tests / E2E / manual / deployment / cleanup — all [ ]
  { id: '4.1', desc: 'Property test setup (fast-check)',
    check: () => false },
  { id: '4.2', desc: 'Property testler yazıldı',
    check: () => false },
  { id: '5.1', desc: 'E2E testler var',
    check: () => false },
  { id: '5.2', desc: 'API integration testler var',
    check: () => false },
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }

// customer-list uses flat heading format (### 1.1) not checkbox format for phases
// Also has checkbox format for some items - collect all
const markers = {};
for (const m of tasksMd.matchAll(/- \[([ x])\] (\w+(?:\.\w+)*)/g)) {
  const id = m[2].replace(/^Phase\s+/, '');
  markers[id] = m[1];
}
// Also try standard format
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: customer-list-missing-columns\n' + RST);

for (const c of checks) {
  const actual = (() => { try { return !!c.check(); } catch { return false; } })();
  const marker = markers[c.id] ?? ' '; // default [ ] if not found
  const markedDone = marker === 'x';
  let status, color;
  if (actual === markedDone) { status = actual ? 'OK    [x]' : 'OK    [ ]'; color = GRN; }
  else if (actual && !markedDone) { status = `STALE [${marker}] ama YAPILMIŞ — [x] olmalı`; color = YLW; mismatches++; }
  else { status = `WRONG [${marker}] ama YAPILMAMIŞ`; color = RED; mismatches++; }
  console.log(`  ${c.id.padEnd(6)} ${color}${status}${RST}  ${c.desc}`);
}

console.log(`\nÖzet: ${checks.length - mismatches}/${checks.length} OK, ${mismatches} uyumsuz\n`);
process.exit(mismatches > 0 ? 1 : 0);
