#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const BE = join(REPO, 'apps/backend/src');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const exists = (p) => existsSync(p);
const has = (p, ...terms) => { const c = read(p); return c != null && terms.every(t => c.includes(t)); };

const checks = [
  // [x] tasks
  { id: '1', desc: 'crm-email-validator.service.ts var, ICrmEmailValidator interface var',
    check: () => has(join(BE, 'crm/crm-email-validator.service.ts'), 'ICrmEmailValidator') },
  { id: '2', desc: 'crm.service.ts findContactByEmail metodu var',
    check: () => has(join(BE, 'crm/crm.service.ts'), 'findContactByEmail') },
  { id: '3', desc: 'Redis caching crm-email-validator içinde var',
    check: () => has(join(BE, 'crm/crm-email-validator.service.ts'), 'redis') || has(join(BE, 'crm/crm-email-validator.service.ts'), 'cache') },
  // [ ] tasks — notdone yet
  { id: '4', desc: 'Checkpoint görev (4) — tüm önceki adımlar geçiyor',
    check: () => false }, // checkpoint task always [ ]
  { id: '5', desc: 'customers.service.ts registerCustomer CRM doğrulaması var',
    check: () => has(join(BE, 'customers/customers.service.ts'), 'CrmEmailValidatorService') },
  { id: '6', desc: 'Rate limiting ve güvenlik implementasyonu var',
    check: () => has(join(BE, 'crm/crm-email-validator.service.ts'), 'rateLimit') || has(join(BE, 'crm/crm-email-validator.service.ts'), 'RateLimit') },
  { id: '7', desc: 'Feature flag konfigürasyon sistemi var',
    check: () => has(join(BE, 'crm/crm-email-validator.service.ts'), 'featureFlag') || has(join(BE, 'crm/crm-email-validator.service.ts'), 'enabled') },
  { id: '8', desc: 'Güvenlik checkpoint (8)',
    check: () => false }, // checkpoint task always [ ]
  { id: '9', desc: 'Monitoring ve health check endpoint\'leri var',
    check: () => has(join(BE, 'crm/crm-email-validator.service.ts'), 'health') || has(join(BE, 'crm/crm.controller.ts'), 'health') },
  { id: '10', desc: 'E2E entegrasyon: CrmEmailValidatorService customers/auth servislerine bağlı',
    check: () => has(join(BE, 'customers/customers.service.ts'), 'CrmEmailValidatorService') },
  { id: '11', desc: 'Performance testleri var',
    check: () => false }, // not implemented
  { id: '12', desc: 'Final checkpoint (12)',
    check: () => false }, // checkpoint task always [ ]
];

const tasksMd = read(TASKS_MD);
if (!tasksMd) { console.error('tasks.md bulunamadı'); process.exit(2); }
const markers = {};
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) markers[m[2]] = m[1];
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) markers[m[2]] = m[1];

const RED = '\x1b[31m', GRN = '\x1b[32m', YLW = '\x1b[33m', RST = '\x1b[0m', BLD = '\x1b[1m';
let mismatches = 0;
console.log(BLD + '\nSpec: crm-only-registration\n' + RST);

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
