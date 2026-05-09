#!/usr/bin/env node
// help-docs-redesign spec doğrulayıcı.
// tasks.md işaretlerini gerçek kod/dosya/JSON durumuyla karşılaştırır.
// Çıkış kodu: 0 = tutarlı, 1 = uyumsuzluk var.
//
// Kullanım:  node .kiro/specs/help-docs-redesign/verify.mjs

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const FE = join(REPO, 'apps/frontend');

const HELP_PAGE = join(FE, 'src/app/[locale]/(dashboard)/help/page.tsx');
const EN_JSON = join(FE, 'messages/en.json');
const TR_JSON = join(FE, 'messages/tr.json');
const HELP_DIR = join(FE, 'src/components/help');
const ACCORDION = join(FE, 'src/components/ui/accordion.tsx');
const TASKS_MD = join(__dirname, 'tasks.md');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const exists = (p) => existsSync(p);
const has = (p, ...terms) => {
  const c = read(p);
  return c != null && terms.every((t) => c.includes(t));
};
const hasNone = (p, ...terms) => {
  const c = read(p);
  return c == null ? true : terms.every((t) => !c.includes(t));
};
const occurrences = (p, re) => {
  const c = read(p);
  return c == null ? 0 : (c.match(re) || []).length;
};
const loadJson = (p) => {
  try {
    return JSON.parse(read(p) || 'null');
  } catch {
    return null;
  }
};
const dig = (obj, ...parts) => parts.reduce((o, k) => (o == null ? null : o[k]), obj);

const allLeafKeys = (o, prefix = '') => {
  if (o == null || typeof o !== 'object') return [prefix];
  return Object.entries(o).flatMap(([k, v]) =>
    allLeafKeys(v, prefix ? `${prefix}.${k}` : k),
  );
};

// Atomik görevler
const checks = [
  // 1. i18n Key Düzeltmeleri
  {
    id: '1.1',
    desc: 'page.tsx admin_guide.guide.* referansları kaldırıldı',
    check: () => occurrences(HELP_PAGE, /admin_guide\.guide\./g) === 0,
  },
  {
    id: '1.2',
    desc: 'en.json/tr.json typo key’leri düzeltildi',
    check: () =>
      hasNone(EN_JSON, 'card2_item22', 'item2_desc3', 'card2_desc4') &&
      hasNone(TR_JSON, 'card2_item22', 'item2_desc3', 'card2_desc4'),
  },
  {
    id: '1.3',
    desc: 'page.tsx’te duplicate render satırları yok',
    check: () =>
      occurrences(HELP_PAGE, /card1_item1_label/g) === 1 &&
      occurrences(HELP_PAGE, /item1_way1_label/g) === 1 &&
      occurrences(HELP_PAGE, /card1_rule_label/g) === 1,
  },

  // 2. Tip ve Veri Modelleri
  {
    id: '2.1',
    desc: 'components/help/types.ts var, DocNode/DocTree/BreadcrumbItem export ediyor',
    check: () =>
      has(join(HELP_DIR, 'types.ts'), 'DocNode', 'DocTree', 'BreadcrumbItem'),
  },
  {
    id: '2.2',
    desc: 'doc-tree.ts CUSTOMER_TREE ve ADMIN_TREE içeriyor',
    check: () => has(join(HELP_DIR, 'doc-tree.ts'), 'CUSTOMER_TREE', 'ADMIN_TREE'),
  },
  {
    id: '2.3',
    desc: 'doc-tree.ts yardımcı fonksiyonları içeriyor',
    check: () =>
      has(
        join(HELP_DIR, 'doc-tree.ts'),
        'findNode',
        'getBreadcrumbPath',
        'buildDocTree',
        'isAdminOrAgent',
      ),
  },

  // 3. UI Bileşenleri
  {
    id: '3.1',
    desc: 'TipBox.tsx 3 varyant (tip/warning/info) içeriyor',
    check: () =>
      has(join(HELP_DIR, 'TipBox.tsx'), "'tip'", "'warning'", "'info'"),
  },
  {
    id: '3.2',
    desc: 'CodeBlock.tsx inline modunu destekliyor',
    check: () => has(join(HELP_DIR, 'CodeBlock.tsx'), 'inline'),
  },
  {
    id: '3.3',
    desc: 'ui/accordion.tsx @radix-ui/react-accordion üzerine kurulu',
    check: () => has(ACCORDION, '@radix-ui/react-accordion'),
  },
  {
    id: '3.4',
    desc: 'DocAccordion.tsx mevcut',
    check: () => exists(join(HELP_DIR, 'DocAccordion.tsx')),
  },

  // 4. Sidebar
  {
    id: '4.1',
    desc: 'HelpDocsSidebar.tsx mevcut',
    check: () => exists(join(HELP_DIR, 'HelpDocsSidebar.tsx')),
  },
  {
    id: '4.2',
    desc: 'Sidebar klavye navigasyonu (onKeyDown) içeriyor',
    check: () => has(join(HELP_DIR, 'HelpDocsSidebar.tsx'), 'onKeyDown'),
  },
  {
    id: '4.3',
    desc: 'Sidebar erişilebilirlik nitelikleri (aria-current/aria-label/role) içeriyor',
    check: () =>
      has(
        join(HELP_DIR, 'HelpDocsSidebar.tsx'),
        'aria-current',
        'aria-label',
        'role=',
      ),
  },
  {
    id: '4.4',
    desc: 'Mobil toggle (MobileSidebarToggle) mevcut',
    check: () => exists(join(HELP_DIR, 'MobileSidebarToggle.tsx')),
  },

  // 5. İçerik Paneli
  {
    id: '5.1',
    desc: 'DocBreadcrumb.tsx mevcut',
    check: () => exists(join(HELP_DIR, 'DocBreadcrumb.tsx')),
  },
  {
    id: '5.2',
    desc: 'HelpDocsContent.tsx mevcut',
    check: () => exists(join(HELP_DIR, 'HelpDocsContent.tsx')),
  },
  {
    id: '5.3',
    desc: 'doc-tree’de 7 customer + 13 admin contentKey leaf var',
    check: () => {
      const c = read(join(HELP_DIR, 'doc-tree.ts'));
      if (!c) return false;
      const cust = (c.match(/contentKey:\s*['"]help\.docs\.customer\./g) || []).length;
      const adm = (c.match(/contentKey:\s*['"]help\.docs\.admin\./g) || []).length;
      return cust >= 7 && adm >= 13;
    },
  },

  // 6. Ana Sayfa Yeniden Yazımı
  {
    id: '6.1',
    desc: 'page.tsx HelpDocsSidebar + HelpDocsContent kullanıyor',
    check: () => has(HELP_PAGE, 'HelpDocsSidebar', 'HelpDocsContent'),
  },
  {
    id: '6.2',
    desc: 'page.tsx next/dynamic ile lazy loading kullanıyor',
    check: () => has(HELP_PAGE, 'next/dynamic'),
  },
  {
    id: '6.3',
    desc: 'page.tsx isAdminOrAgent ile rol bazlı varsayılan node seçiyor',
    check: () => has(HELP_PAGE, 'isAdminOrAgent'),
  },

  // 7. i18n Genişletme
  {
    id: '7.1',
    desc: 'en.json help.docs.nav.customer mevcut',
    check: () => dig(loadJson(EN_JSON), 'help', 'docs', 'nav', 'customer') != null,
  },
  {
    id: '7.2',
    desc: 'en.json help.docs.nav.admin mevcut',
    check: () => dig(loadJson(EN_JSON), 'help', 'docs', 'nav', 'admin') != null,
  },
  {
    id: '7.3',
    desc: 'en.json help.docs.customer mevcut',
    check: () => dig(loadJson(EN_JSON), 'help', 'docs', 'customer') != null,
  },
  {
    id: '7.4',
    desc: 'en.json help.docs.admin mevcut',
    check: () => dig(loadJson(EN_JSON), 'help', 'docs', 'admin') != null,
  },
  {
    id: '7.5',
    desc: 'tr.json help.docs.* key’leri en.json ile simetrik',
    check: () => {
      const en = dig(loadJson(EN_JSON), 'help', 'docs');
      const tr = dig(loadJson(TR_JSON), 'help', 'docs');
      if (en == null || tr == null) return false;
      const enKeys = allLeafKeys(en);
      const trKeys = new Set(allLeafKeys(tr));
      return enKeys.every((k) => trKeys.has(k));
    },
  },

  // 8. Testler
  {
    id: '8.1',
    desc: 'doc-tree birim testi mevcut',
    check: () =>
      exists(join(HELP_DIR, 'doc-tree.spec.ts')) ||
      exists(join(HELP_DIR, 'doc-tree.spec.tsx')),
  },
  {
    id: '8.2',
    desc: 'TipBox birim testi mevcut',
    check: () => exists(join(HELP_DIR, 'TipBox.spec.tsx')),
  },
  {
    id: '8.3',
    desc: 'DocBreadcrumb birim testi mevcut',
    check: () => exists(join(HELP_DIR, 'DocBreadcrumb.spec.tsx')),
  },
  {
    id: '8.4',
    desc: 'HelpDocsSidebar rol testleri mevcut',
    check: () => exists(join(HELP_DIR, 'HelpDocsSidebar.spec.tsx')),
  },
  {
    id: '8.5',
    desc: 'i18n simetri property-based test mevcut',
    check: () => exists(join(HELP_DIR, 'i18n-symmetry.pbt.spec.ts')),
  },
  {
    id: '8.6',
    desc: 'Doc_Node içerik eşleşmesi pbt testi mevcut',
    check: () => exists(join(HELP_DIR, 'doc-node-content.pbt.spec.tsx')),
  },
  {
    id: '8.7',
    desc: 'Breadcrumb yol doğruluğu pbt testi mevcut',
    check: () => exists(join(HELP_DIR, 'breadcrumb-path.pbt.spec.ts')),
  },
  {
    id: '8.8',
    desc: 'TipBox varyant pbt testi mevcut',
    check: () => exists(join(HELP_DIR, 'TipBox.pbt.spec.tsx')),
  },
  {
    id: '8.9',
    desc: 'Sidebar aria-expanded pbt testi mevcut',
    check: () => exists(join(HELP_DIR, 'sidebar-aria.pbt.spec.tsx')),
  },
];

// tasks.md işaretlerini parse et
const tasksMd = read(TASKS_MD);
if (tasksMd == null) {
  console.error('tasks.md bulunamadı:', TASKS_MD);
  process.exit(2);
}
const taskMarkers = {};
// Atomik: "- [x] 1.1 Title"
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+\.\d+)\s/g)) {
  taskMarkers[m[2]] = m[1];
}
// Parent: "- [x] 1. Title"
for (const m of tasksMd.matchAll(/-\s+\[([ x\-~])\]\s+(\d+)\.\s/g)) {
  taskMarkers[m[2]] = m[1];
}

// Atomik görevleri çalıştır
const results = checks.map((c) => {
  let actual = false;
  try {
    actual = !!c.check();
  } catch {
    actual = false;
  }
  return { ...c, actual, marker: taskMarkers[c.id] ?? '?' };
});

// Parent görev beklentisi: tüm child'lar [x] → [x], hiçbiri [x] değil → [ ], aksi → [-]
const parents = [...new Set(results.map((r) => r.id.split('.')[0]))].map((pid) => {
  const children = results.filter((r) => r.id.startsWith(pid + '.'));
  const all = children.length > 0 && children.every((r) => r.actual);
  const some = children.some((r) => r.actual);
  const expected = all ? 'x' : some ? '-' : ' ';
  return { id: pid, expected, marker: taskMarkers[pid] ?? '?' };
});

// Çıktı
const RED = '\x1b[31m';
const GRN = '\x1b[32m';
const YLW = '\x1b[33m';
const RST = '\x1b[0m';
const BLD = '\x1b[1m';

let mismatches = 0;
console.log(BLD + '\nSpec: help-docs-redesign — tasks.md ↔ kod tutarlılığı\n' + RST);
console.log(BLD + 'Atomik görevler:' + RST);
for (const r of results) {
  const markedDone = r.marker === 'x';
  let status, color;
  if (r.actual === markedDone) {
    status = r.actual ? 'OK    [x] yapılmış' : 'OK    [ ] yapılmamış';
    color = GRN;
  } else if (r.actual && !markedDone) {
    status = `STALE [${r.marker}] ama YAPILMIŞ — [x] olmalı`;
    color = YLW;
    mismatches++;
  } else {
    status = `WRONG [${r.marker}] ama YAPILMAMIŞ — [ ] olmalı`;
    color = RED;
    mismatches++;
  }
  console.log(`  ${r.id.padEnd(4)} ${color}${status}${RST}  ${r.desc}`);
}

console.log(BLD + '\nParent görevler:' + RST);
for (const p of parents) {
  const ok = p.expected === p.marker;
  if (!ok) mismatches++;
  const color = ok ? GRN : YLW;
  const tag = ok ? 'OK   ' : 'STALE';
  console.log(
    `  ${p.id.padEnd(4)} ${color}${tag}${RST} beklenen [${p.expected}], mevcut [${p.marker}]`,
  );
}

const total = results.length + parents.length;
console.log(
  `\nÖzet: ${total - mismatches}/${total} OK, ${mismatches} uyumsuz\n`,
);
process.exit(mismatches > 0 ? 1 : 0);
