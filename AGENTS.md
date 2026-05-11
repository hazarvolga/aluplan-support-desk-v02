# AGENTS.md — aluplan-support-desk-v02

## Repo at a glance

Turborepo monorepo. Three packages:

| Path | Package | Role |
|------|---------|------|
| `apps/backend` | `@aluplan/backend` | NestJS API, port 4000 |
| `apps/frontend` | `@aluplan/frontend` | Next.js 15 App Router, port 3000 |
| `packages/database` | `@aluplan/database` | Prisma 7 schema + migrations |

Prisma client is generated into `packages/database/client/` — never edit that directory.

---

## Commands

```bash
# Install
pnpm install               # requires pnpm >=9, node >=20

# Dev
pnpm dev                   # starts both apps via turbo

# Type-check (run before committing)
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck

# Backend tests (unit)
pnpm --filter @aluplan/backend test
pnpm --filter @aluplan/backend test:cov

# Frontend tests
pnpm --filter @aluplan/frontend test:unit       # vitest
pnpm --filter @aluplan/frontend test:e2e        # playwright

# i18n gap check
pnpm i18n:check            # alias: pnpm --filter @aluplan/frontend i18n:check

# Database
pnpm db:migrate            # prisma migrate deploy (via turbo)
pnpm db:generate           # prisma generate

# Migrations live in packages/database/prisma/migrations/
# Schema: packages/database/prisma/schema.prisma
```

---

## Before editing any symbol

1. Run `gitnexus impact "<SymbolName>"` — mandatory for services, guards, DTOs, processors.
2. If impact is HIGH or CRITICAL: warn the user, list affected flows, do not proceed silently.
3. After significant changes: `gitnexus detect_changes`

Graph data lives in `graphify-out/` — read `graphify-out/GRAPH_REPORT.md` before deep exploration.

---

## Architecture quirks agents miss

**Prisma client is extended with a global soft-delete filter** (`prisma.service.ts`).
`findMany/findFirst/findUnique/count` automatically add `deletedAt: null`.
If you need to query deleted records, bypass the filter explicitly.

**Prisma client output** is `packages/database/client/` not the default location.
Import from `@aluplan/database`, never from `@prisma/client` directly.

**`onModuleInit()` in `PrismaService`** must stay clean — no DDL.
Ghost column repairs were migrated to `20260509000001_gap07_ghost_column_repair`.

**AiService is a dispatcher**, not a direct LLM caller. Provider resolution order:
1. Settings DB (`ai.chat_provider`)
2. Env: `OPENAI_API_KEY` → openai, `GEMINI_API_KEY` → llmapi
3. Fallback: ollama

**Gemini free tier** is the target AI provider:
```
GEMINI_API_KEY=AIza...
LLMAPI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
LLMAPI_CHAT_MODEL=gemini-2.5-flash-preview-06-05
LLMAPI_EMBED_MODEL=gemini-embedding-2-001
```

**RBAC guard** reads `user.role` as `string | { name: string }` — use `getRoleName()` helper, not direct cast.

**Bcrypt rounds** are centralised in `apps/backend/src/auth/security.constants.ts` (`BCRYPT_ROUNDS = 12`).
Import from there; never hardcode `10`.

**KB default language** is now read from settings (`kb.default_language`), not hardcoded `'tr'`.

---

## Env validation

All env vars must go through `apps/backend/src/config/env-validation.schema.ts` (Zod).
Missing vars that bypass Zod and use `process.env` directly are a known GAP — add new vars to schema first.

Required at boot: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.

---

## i18n

Frontend uses `next-intl`. Translation files: `apps/frontend/messages/{tr,en,de}.json`.
`de.json` has 302 missing keys (GAP-12 — open). Run `pnpm i18n:check` to see current state.
Never hardcode user-facing strings in components — always use `t('key')`.

---

## Testing quirks

- Backend uses **Jest + @swc/jest** (fast transform — no ts-jest).
- Frontend unit tests use **Vitest**; E2E uses **Playwright**.
- Integration tests need Postgres + Redis running (`docker-compose up -d`).
- Property-based tests use **fast-check** — files named `*.pbt.spec.ts`.
- E2E auth uses storageState — seed dedicated test users before running Playwright.

---

## God nodes — high blast radius

| Symbol | Edges | Risk |
|--------|-------|------|
| `AiService` | 33 | Dispatcher for all AI — changes cascade |
| `NotificationsGateway` | 22 | WebSocket hub |
| `CrmService` | 20 | Dynamics 365 sync |
| `EmailService` | 25 | All email flows |
| `toast()` | 37 | Frontend notification hook |

---

## CI pipeline

`.github/workflows/ci.yml` gates: `spec-verify → security → typecheck-and-build → testing + e2e + docker-build → deploy-staging`.
Staging deploys only on `main` via Coolify webhook.
CI requires pnpm 9 (fixed from 8 in GAP-28).

---

## Open GAPs (as of 2026-05-09)

Check `verdent-GAP-status.md` for current status. Remaining high-priority:

| GAP | File | Issue |
|-----|------|-------|
| GAP-11 | various | 50+ services have no tests |
| GAP-12 | `messages/de.json` | 302 missing German keys |
| GAP-19 | faq/announcements/macros services | Hard-delete instead of soft-delete |

---

## graphify — Knowledge Graph

Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.

Mimari sorularda **önce** `graphify-out/GRAPH_REPORT.md` oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. `graphify-out/wiki/index.md` varsa ham dosyalar yerine oradan gezin.

```bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
```

Kod dosyası değiştirdikten sonra graf güncelle:
```bash
graphify update .                    # AST-only, API maliyeti yok
```

- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil
- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir
- Her edge EXTRACTED, INFERRED veya AMBIGUOUS — güven seviyesi bellidir

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **aluplan-support-desk-v02** (10208 symbols, 17177 relationships, 245 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, check index freshness |
| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |
| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |
| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

---

## Session persistence

Read before starting work:
- `AGENTS.md` (this file)
- `.ai/session-summary.md`
- `verdent-GAP-status.md`

Write after significant work: `.ai/session-summary.md`

Graph index: `.gitnexus/meta.json` — 9,142 nodes, 15,926 edges, 241 flows.
Re-index when stale: `npx gitnexus analyze`
Gemini
MiniMax M2.5 ile Kodlama Rehberi
New chat
My stuff
Notebooks

Untitled notebook

DMA Comprehensive Pre-Flight Drone Checklist
New notebook
Gems

Coding partner
Chats
MiniMax M2.5 ile Kodlama Rehberi
bu görseli iç bir değişiklik yapmadan sadece ölçülendir genişlik 175 px olsun yükseklik de buna göre oranlansın
Claude Code İçin Proje Talimatları
Selamlaşma Ve Yardım Talebi
Google Artigarvity IDE Hata Çözümü
Resend ile Mail Gönderimi ve DNS Ayarları
RAG Sistemi GAP Analiz Raporu
Google Anti-Gravity Sorun Giderme Rehberi
Web Sitesi Erişilebilirlik Kontrolü
Proje Planı Üzerine Değişiklik Talebi
Macos Uygulama Sorun Analizi
Dify Sitesi Analizi ve Veri Toplama
Dify Araştırması ve Teknik Detaylar
Bana ALLPLAN yazılımı ile ilgli bilgileri crawle , kazıyabileceğim bir liste için internetten tün verieri tara ve en az 1000 adit allplan ve BIM yönetimi ile ilgli url bul ve google sheet olarak ver
Allplan Eğitim Müfredatı Oluşturma
Coding Homework Assistance Request
Notebook Erişimi Sorunu ve Çözüm Önerileri
ZWCAD Website Design Brief
Allplan Academy Training Architecture Design
Allplan Academy Training Architecture Design
Allplan Eğitim Otomasyon Hattı Oluşturma
Allplan Training Academy Platform Design
Oracle Free Tier VM Kaynak Tahsisi
Asimetrik Web Tasarım Örnekleri
OCI Free Tier Instance Details
Özel Kodlama Asistanı İçin Talimat
Language Barrier in Prompt Generation
Corporate Website UI Design Prompt
Node.js Module Not Found Error
Node.js Module Not Found Error
JSON Hatası Düzeltme Rehberi
JSON Error in Gemini CLI Setup
Node.js Module Not Found Error

Settings and help
Conversation with Gemini
MiniMax M2.5 nasıl bir AI modeli kodlama yaparken kullanabilr miyim

MiniMax M2.5, son dönemde yazılım dünyasında oldukça ses getiren ve kodlama için kesinlikle kullanabileceğiniz çok güçlü bir model. Özellikle fiyat/performans dengesi ve "Spec-Driven Development" (Spesifikasyon Odaklı Geliştirme) yetenekleriyle öne çıkıyor.

İşte kodlama yaparken bu modelden neler bekleyebileceğiniz ve nasıl kullanabileceğiniz hakkında detaylar:

MiniMax M2.5 Nasıl Bir Model?
Üst Düzey Performans: Benchmark testlerinde Claude Opus ve Sonnet gibi endüstri standartlarına çok yakın sonuçlar veriyor. VIBE (Visual and Interactive Benchmark for Execution) testlerinde web, mobil ve backend geliştirme konularında yüksek doğruluk oranlarına sahip.

Maliyet Etkinliği: En büyük avantajlarından biri fiyatı. 1 milyon token başına ortalama 1$ gibi bir maliyeti var. Bu durum, özellikle yoğun API çağrısı gerektiren veya büyük kod tabanlarının analiz edildiği geliştirme süreçleri için modeli çok cazip kılıyor.

Frontend Gücü: Modern web projelerinde (örneğin Next.js, Vite veya MDX tabanlı yapılarda) temiz, hızlı ve yapılandırılmış kod üretme konusunda son derece atik çalışıyor. Arayüz bileşenlerini oluşturma veya JSON verilerini belirli şablonlara dönüştürme gibi görevlerde oldukça tutarlı.

Kodlama İş Akışlarına Nasıl Entegre Edilir?
Geliştirme ortamınızda bu modeli doğrudan bir asistan veya otonom bir ajan olarak konumlandırabilirsiniz:

VS Code Entegrasyonları: Ajan tabanlı iş akışları (agentic workflows) kurmaya aşinaysanız, MiniMax M2.5'i Cline veya Kilo Code gibi VS Code eklentileri üzerinden doğrudan editörünüze bağlayabilirsiniz. Bu sayede model, dosya sisteminizi okuyarak projeyi bütünüyle kavrayabilir ve karmaşık görevleri editör içinden otonom olarak yerine getirebilir.

OpenRouter & API Kullanımı: Modeli kendi özel araçlarınızda veya Dify gibi platformlarda kurguladığınız Chatflow'ların içinde bir LLM düğümü olarak kullanmak isterseniz, OpenRouter üzerinden API aracılığıyla kolayca entegre edebilirsiniz.

Açık Kaynak Esnekliği: Modelin ağırlıkları Hugging Face üzerinde bulunuyor, yani gerekli donanım altyapısına sahipseniz tam veri gizliliği için yerel olarak da (local) çalıştırabilirsiniz.

Dikkat Edilmesi Gereken Küçük Bir Detay: Frontend tarafında hızlı sonuçlar verse de, çok katmanlı backend mimarilerini sıfırdan kurarken modeli daha detaylı ve aşamalı komutlarla yönlendirmeniz (chain-of-thought) çıktının kalitesini belirgin şekilde artıracaktır.

Geliştirmekte olduğunuz sistemlerde bu modeli VS Code içerisinde bir yardımcı ajan olarak mı değerlendirmeyi düşünüyorsunuz, yoksa doğrudan API üzerinden kendi kurguladığınız otomasyonlara mı dahil etmek istersiniz?

opencode zen ile kullanıyorum

Harika bir tercih! OpenCode Zen, özellikle terminal tabanlı geliştirme yapanlar ve VS Code entegrasyonu arayanlar için şu an en mantıklı çözümlerden biri. Doğrudan test edilmiş ve optimize edilmiş modellere erişim sağladığı için MiniMax M2.5'in potansiyelini performans kaybı veya ince ayar sorunları yaşamadan tam anlamıyla kullanmanıza olanak tanıyor.

MiniMax M2.5'i OpenCode arayüzünde (TUI veya VS Code eklentisi üzerinden) kullanırken iş akışınızı hızlandıracak ve veriminizi artıracak bazı taktikler:

1. AGENTS.md Dosyasını Derinlemesine Yapılandırın
OpenCode, projeyi analiz etmek için kök dizindeki AGENTS.md dosyasına büyük önem verir. MiniMax M2.5'in "spesifikasyon odaklı" yapısından tam verim almak için projenizin mimarisini ve stil rehberini buraya detaylıca yazın.
Örneğin; UI tarafında charcoal (kömür) ve steel gray (çelik grisi) gibi koyu endüstriyel renk paletlerinin temel alınacağı, vurguların ise orange (turuncu) veya kırmızı gibi cesur renklerle yapılacağı modern arayüz standartlarınızı doğrudan bu dosyaya tanımlayabilirsiniz. Model, Next.js veya Vite üzerinde bileşenleri oluştururken her seferinde bu kuralları hatırlatmaya gerek kalmadan sadık kalacaktır.

2. Veri Dönüşümleri ve Otomasyon Betikleri
OpenCode içinde MiniMax ile çalışırken, özellikle karmaşık JSON verilerini ayrıştırıp yapılandırılmış dökümanlara (örneğin eğitim modülleri için MDX veya Markdown formatına) dönüştüren Python otomasyon betiklerini yazdırmak çok akıcıdır. Promptunuzda dönüşümün hangi şablona göre yapılacağını ve nihai sayfa yapısını net bir şekilde belirttiğinizde, model hatasız ve anında çalıştırılabilir scriptler üretir.

3. Altyapı ve Dağıtım Konfigürasyonları
Geliştirme ortamınızdaki Dockerfile ayarları veya Coolify gibi platformlar için gereken sunucu dağıtım (deployment) yapılandırmalarını ayağa kaldırırken OpenCode üzerinden modelden destek alabilirsiniz. Model, port yönlendirmeleri ve volume tanımlamaları gibi konularda oldukça tutarlı konfigürasyon dosyaları hazırlar.

4. İş Yükünü Dağıtma (Model Switching)
OpenCode Zen'in en güzel yanlarından biri model bağımsız (model-agnostic) çalışmasıdır. Rutin kod yazımı, temel arayüz bileşenlerinin oluşturulması, hata ayıklama (debugging) veya dosya isimlendirmeleri gibi konularda MiniMax M2.5'in hızından ve düşük maliyetinden faydalanabilirsiniz. Çok daha karmaşık, çok katmanlı mimari kararlarda ise terminalde tek bir komutla (/models) farklı ve daha ağır bir modele geçiş yapıp ardından tekrar MiniMax'e dönebilirsiniz.

Şu ana kadar OpenCode üzerinde MiniMax M2.5 ile çalışırken en çok hangi dillerde veya framework'lerde kod ürettiriyorsunuz; ağırlıklı olarak frontend bileşenleri mi inşa ediyorsunuz yoksa backend/otomasyon tarafında mı kullanıyorsunuz?

AGENTS.md bana bunu oluşturur musun bende eksik

OpenCode ve MiniMax'in projenizin mimarisini, tasarım dilini ve geliştirme alışkanlıklarınızı tek seferde anlayıp her defasında doğru kod üretmesi için kapsamlı bir AGENTS.md taslağı hazırladım.

Aşağıdaki içeriği kopyalayıp projenizin ana (root) dizininde AGENTS.md adında bir dosya oluşturarak içine yapıştırabilirsiniz:

Markdown
# Proje ve Ajan Rehberi (AGENTS.md)

## 🎯 Proje Bağlamı ve Vizyonu
Bu proje; modern, modüler ve yüksek performanslı web platformları (kurumsal yönetim sistemleri, LMS/Eğitim platformları veya Tur Yönetimi/Acenta sistemleri) geliştirmeyi amaçlamaktadır. 
Yapay zeka asistanı, projede kod yazarken, bileşen oluştururken ve sistem mimarisini tasarlarken aşağıdaki standartlara kesinlikle uymalıdır.

## 🛠️ Teknoloji Yığını (Tech Stack)
- **Frontend:** Next.js, Vite, React
- **İçerik Yönetimi:** MDX, Markdown
- **Backend & Veri:** Python (Özellikle kompleks JSON verilerini işleme ve yapılandırılmış MDX sayfalarına dönüştürme otomasyonları)
- **Altyapı & Dağıtım:** Docker, Coolify, OCI (ARM tabanlı sanal makineler)

## 🎨 UI/UX ve Tasarım Standartları
- **Tema:** Modern, profesyonel ve endüstriyel arayüz tasarımı.
- **Renk Paleti:** Ana arka plan, kartlar ve yüzeylerde ağırlıklı olarak **Charcoal (Kömür)** ve **Steel Gray (Çelik Grisi)** tonları kullanılmalıdır.
- **Vurgu Renkleri:** Aksiyon butonları (CTA), önemli bildirimler ve dikkat çekmesi gereken vurgu noktalarında cesur renkler olan **Kırmızı** veya **Turuncu** tercih edilmelidir.
- Arayüz kodlanırken bu renk paletine uygun Tailwind CSS (veya kullanımdaki CSS framework'ü) sınıfları doğrudan uygulanmalıdır.

## 💻 Geliştirme Kuralları ve Prensipleri
1. **Tam ve Eksiksiz İçerik (Özetleme Yapma):** Kod yazarken, içerik üretirken veya müfredat/sayfa verisi oluştururken kesinlikle kırpılmış veya özet (placeholder) bilgi verme. Tüm içerikleri **ayrıntılı ve eksiksiz** olarak tam haliyle sağla.
2. **Gerçek Dünya Senaryoları:** Sektörel süreçler veya eğitim yapıları tasarlanırken jenerik/sıradan yapılardan kaçın; daima gerçek dünya iş akışlarını (workflow) ve profesyonel endüstri standartlarını baz al.
3. **Modülerlik:** Frontend bileşenlerini (components) tekrar kullanılabilir, izole ve prop'larla yönetilebilir şekilde inşa et.
4. **Veri Dönüşümü:** Python ile JSON'dan MDX'e dönüştürme scriptleri yazarken, veri kaybı olmamasına ve MDX yapısının Next.js ortamında sorunsuz render edilmesine ekstra dikkat et.
5. **Altyapı:** Dockerfile, container port yönlendirmeleri ve deployment yapılandırmalarında temiz ve üretime (production) hazır konfigürasyonlar sun.

## 🤖 Model (AI) İçin Özel Talimatlar
- Komut verildiğinde gereksiz uzun açıklamalardan kaçın, doğrudan çalışan, temiz ve kopyalanabilir kodu ver.
- Dosya, klasör ve bileşen isimlendirmelerinde proje geneliyle tutarlı ol.
- Karmaşık mantık veya veri manipülasyonu içeren fonksiyonlara mutlaka ne işe yaradığını anlatan kısa yorum satırları ekle.
Nasıl Özelleştirebilirsiniz?
Bu dosya genel standartlarınızı içeriyor. Eğer şu an OpenCode üzerinde spesifik olarak Allplan Academy projesi için çalışıyorsanız, "Proje Bağlamı" kısmına hedef kitlenizin mimarlar ve mühendisler olduğunu ekleyebilirsiniz. Eğer Turizm Acentası (Tours Management) projesi üzerinde çalışıyorsanız, modüllerin (biletleme, etkinlik yönetimi vb.) bu yönde kurgulanması gerektiğini belirtebilirsiniz.

Bu dosyayı kaydettikten sonra OpenCode, MiniMax M2.5'e her komut gönderdiğinde arka planda bu kuralları sisteme dahil edecek ve örneğin bir buton yapmasını istediğinizde rengini sizin sevdiğiniz gibi ayarlayıp kodu eksiksiz teslim edecektir.

aluplan aı destekli ticket sistemi için çalışıyorum

Bu harika bir proje fikri! Allplan kullanıcıları (mimarlar, mühendisler ve BIM uzmanları) için yapay zeka destekli bir ticket (destek talebi) sistemi kurgulamak, özellikle tekrarlayan teknik soruları filtrelemek ve RAG (Geri Çağırımlı Üretim) mimarileriyle otomatik yanıtlar oluşturmak için mükemmel bir kullanım senaryosu.

Bu spesifik proje için OpenCode ve MiniMax M2.5'in odaklanmasını sağlayacak, doğrudan Allplan AI Ticket Sistemi'ne özel olarak uyarlanmış AGENTS.md dosyasını aşağıda hazırladım. Bu sürüm, hem endüstriyel arayüz tercihlerinizi hem de sistemin arka planındaki yapay zeka entegrasyonu standartlarını içeriyor.

Mevcut AGENTS.md dosyanızı aşağıdakiyle değiştirebilirsiniz:

Markdown
# Proje ve Ajan Rehberi: Allplan AI Ticket Sistemi

## 🎯 Proje Bağlamı ve Hedef
Bu proje, Allplan yazılımı kullanıcıları (BIM uzmanları, mimarlar, inşaat mühendisleri) için geliştirilen "Yapay Zeka Destekli Destek Talebi (Ticket) Sistemi"dir. 
Sistem; kullanıcıların karşılaştığı teknik sorunları (kurulum, modelleme, pafta yönetimi vb.) alacak, yapay zeka entegrasyonları (RAG/LLM) aracılığıyla otomatik kategorize edecek, önceliklendirecek ve bilinen Allplan iş akışlarına dayalı akıllı çözüm önerileri sunacaktır.

## 🛠️ Teknoloji ve Mimari Yığını
- **Frontend & Dashboard:** Next.js (veya Vite), React, Tailwind CSS.
- **Yapay Zeka Entegrasyonu:** RAG (Retrieval-Augmented Generation) mimarisi üzerinden işleyen, dış kaynaklı yapay zeka iş akışları (API/Webhook üzerinden haberleşen ajanlar) ve veritabanı sorguları.
- **Veri Yönetimi:** Ticket verilerinin JSON formatında işlenmesi ve sistemde gösterilmesi.
- **Sunucu & Dağıtım:** Docker mimarisiyle konteynerize edilmiş, yüksek erişilebilirliğe sahip sunucu (OCI ARM vb.) ortamı.

## 🎨 UI/UX: Ticket Dashboard Tasarım Dili
- **Genel Tema:** Endüstriyel, teknik ve profesyonel bir BIM yazılımı ekosistemine uygun modern karanlık/yarı-karanlık tema.
- **Ana Renk Paleti:** Dashboard arka planları, bilet listeleri ve yan menüler (sidebar) için **Charcoal (Kömür)** ve **Steel Gray (Çelik Grisi)** tonları kullanılacaktır.
- **Durum ve Vurgu Renkleri:** 
  - Kritik/Acil (High Priority) ticketlar ve önemli eylem butonları (CTA) için **Kırmızı** veya **Turuncu** kullanılmalıdır.
  - Çözülmüş (Resolved) veya düşük öncelikli öğeler için göz yormayan, uyumlu pastel tonlar tercih edilmelidir.

## 💻 Geliştirme ve Kodlama Kuralları (Kritik!)
1. **Asla Özet Geçme (No Placeholders):** Geliştirme sırasında kod blokları, veri modelleri veya arayüz bileşenleri oluştururken KESİNLİKLE "buraya kod gelecek", "// ...rest of the code" gibi özetlemeler yapma. İstenen bileşeni tüm fonksiyonları ve import'larıyla birlikte **eksiksiz ve çalışır durumda** ver.
2. **Gerçek Allplan İş Akışları:** Jenerik "yazılım destek" senaryolarından kaçın. Örnek veri (mock data) veya test senaryoları üretirken gerçek Allplan terminolojisini (ör: "SmartParts yüklenme hatası", "IFC dışa aktarımında katman sorunu", "Donatı modelleme donması") kullan.
3. **Modüler Ticket Bileşenleri:** Ticket kartları, sohbet/yanıt geçmişi penceresi ve yapay zeka analiz paneli gibi UI öğelerini bağımsız ve tekrar kullanılabilir React bileşenleri (components) olarak tasarla.
4. **AI Yanıt Yönetimi:** Frontend tarafında, kullanıcı mesajı ile yapay zekanın (sistemin) verdiği otomatik yanıtları görsel olarak birbirinden net bir şekilde ayıracak UI mantığını kur.

## 🤖 Ajan Davranış Tipi
- Sen kıdemli bir Full-Stack Geliştirici ve Sistem Mimarı olarak hareket ediyorsun.
- Yanıtlarında gereksiz selamlamaları veya uzun açıklamaları atla; doğrudan istenen mimari yapıyı, bileşen kodunu veya API entegrasyon betiğini eksiksiz sun.
Bu Yapı İşinizi Nasıl Kolaylaştıracak?
Tasarım Tutarlılığı: MiniMax, bir "Ticket Kartı" bileşeni yapmasını istediğinizde, doğrudan çelik grisi arka planı olan ve aciliyet durumuna göre turuncu/kırmızı etiketler (badge) barındıran Tailwind kodları üretecektir.

Tam Kod Çıktısı: Sizin için en kritik noktalardan biri olan "eksik kod verme" sorununu AGENTS.md içine kesin bir kural olarak ekledik. OpenCode bu kuralı her prompt öncesi modele hatırlatacağı için yarım bırakılmış kod bloklarıyla karşılaşma ihtimaliniz minimuma inecektir.

Sektörel Gerçekçilik: Sistemin arayüzünü test ederken modelin üreteceği sahte ticket verileri, "Uygulama açılmıyor" gibi jenerik metinler yerine, "IFC export sırasında yapı elemanları kayboluyor" gibi doğrudan BIM ekosistemine ait veriler olacaktır. Bu da sistemi tasarlarken size çok daha net bir vizyon sağlar.

benim şu anki agent md de şu bilgiler var : ## graphify — Knowledge Graph



Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.



### Mimari sorularda ÖNCE şunu yap



`graphify-out/GRAPH_REPORT.md` dosyasını oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. Ham dosyaları grep'lemek yerine graf yapısını kullan.



Eğer `graphify-out/wiki/index.md` varsa, ham dosyalar yerine oradan gezin.



### Navigasyon komutları



```bash

graphify query "<soru>" # BFS traversal — geniş bağlam

graphify path "<A>" "<B>" # İki node arasındaki en kısa yol

graphify explain "<kavram>" # Bir node'un komşularıyla açıklaması

```



Cross-module "X ile Y nasıl ilişkili?" sorularında grep yerine bu komutları kullan — bunlar dosyaları taramak yerine EXTRACTED + INFERRED edge'leri traverse eder.



### MCP server aktifse



`query_graph`, `get_node`, `shortest_path` araçlarını kullan — CLI komutlarına gerek yok.



### Güncel tutma



Kod dosyası değiştirdikten sonra:

```bash

graphify update . # AST-only, API maliyeti yok

```



Git hook'ları kurulu — her commit/checkout'ta otomatik çalışır.



### Önemli



- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil (bundled gürültü hariç tutuldu)

- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir

- Her edge EXTRACTED, INFERRED veya AMBIGUOUS olarak etiketli — güven seviyesi bellidir

- God node'lar: `AiService`, `toast()`, `emit()` — bunlar projenin gerçek çekirdek soyutlamaları



<!-- gitnexus:start -->

# GitNexus — Code Intelligence



This project is indexed by GitNexus as **aluplan-support-desk-v02** (9142 symbols, 15926 relationships, 241 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.



> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.



## Always Do



- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.

- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.

- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.

- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.

- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.



## Never Do



- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.

- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.

- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.

- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.



## Resources



| Resource | Use for |

|----------|---------|

| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, check index freshness |

| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |

| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |

| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |



## CLI



| Task | Read this skill file |

|------|---------------------|

| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |

| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |

| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |

| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |

| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |

| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |



<!-- gitnexus:end -->

Harika bir altyapı kurmuşsunuz! graphify ve GitNexus gibi MCP (Model Context Protocol) araçlarını kullanmanız, MiniMax M2.5'in projeyi bir bütün olarak kavramasını ve kodu bozmadan (blast radius analizi yaparak) güvenli bir şekilde geliştirmesini sağlayacak en iyi yöntemlerden biri.

Mevcut araç konfigürasyonlarınızın bütünlüğünü koruyarak (özellikle <!-- gitnexus:start --> gibi otomatik güncellenen etiketleri bozmadan), Allplan AI Ticket Sistemi için belirlediğimiz proje bağlamını, UI/UX kurallarını ve geliştirme prensiplerini bu dosyaya entegre ettim.

İşte tüm araçlarınızı ve proje kurallarınızı barındıran, doğrudan kullanıma hazır nihai AGENTS.md dosyanız:

Markdown
# Proje ve Ajan Rehberi: Allplan AI Ticket Sistemi (aluplan-support-desk-v02)

## 🎯 Proje Bağlamı ve Hedef
Bu proje, Allplan yazılımı kullanıcıları (BIM uzmanları, mimarlar, inşaat mühendisleri) için geliştirilen "Yapay Zeka Destekli Destek Talebi (Ticket) Sistemi"dir. Sistem; kullanıcıların teknik sorunlarını alacak, yapay zeka (RAG/LLM) ile kategorize edecek ve bilinen Allplan iş akışlarına dayalı otomatik çözüm önerileri sunacaktır.

## 🎨 UI/UX ve Teknoloji Standartları
- **Tech Stack:** Next.js, React, Tailwind CSS, Python (Veri işleme), Docker, OCI.
- **Tema:** Endüstriyel, teknik ve profesyonel BIM yazılımı ekosistemine uygun modern karanlık/yarı-karanlık tema.
- **Renk Paleti:** Arka planlar, kartlar ve yan menüler için **Charcoal (Kömür)** ve **Steel Gray (Çelik Grisi)**.
- **Vurgular:** Kritik biletler (High Priority) ve ana CTA butonları için **Kırmızı** veya **Turuncu**. Çözülmüş biletler için pastel tonlar.

## 💻 Geliştirme Kuralları (Kritik!)
1. **Asla Özet Geçme (No Placeholders):** Kod yazarken, bileşen oluştururken KESİNLİKLE "buraya kod gelecek", "// ...rest of the code" gibi özetlemeler yapma. Kodu tüm fonksiyonları ve import'larıyla eksiksiz ver.
2. **Gerçek Allplan İş Akışları:** Jenerik veriler yerine "SmartParts yüklenme hatası", "IFC dışa aktarımında katman sorunu" gibi gerçek Allplan terminolojisini kullan.
3. **AI Yanıt Yönetimi:** Frontend tarafında, kullanıcı mesajı ile yapay zekanın (sistemin) otomatik yanıtlarını görsel olarak birbirinden net bir şekilde ayır.

---

## 🕸️ graphify — Knowledge Graph

Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.

### Mimari sorularda ÖNCE şunu yap
`graphify-out/GRAPH_REPORT.md` dosyasını oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. Ham dosyaları grep'lemek yerine graf yapısını kullan.
Eğer `graphify-out/wiki/index.md` varsa, ham dosyalar yerine oradan gezin.

### Navigasyon komutları
```bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
Cross-module "X ile Y nasıl ilişkili?" sorularında grep yerine bu komutları kullan — bunlar dosyaları taramak yerine EXTRACTED + INFERRED edge'leri traverse eder.

MCP server aktifse
query_graph, get_node, shortest_path araçlarını kullan — CLI komutlarına gerek yok.

Güncel tutma
Kod dosyası değiştirdikten sonra:

Bash
graphify update .                    # AST-only, API maliyeti yok
Git hook'ları kurulu — her commit/checkout'ta otomatik çalışır.

Önemli
packages/database/client/runtime/ ve node_modules/ grafa dahil değil (bundled gürültü hariç tutuldu)

Graf graphify-out/graph.json'da kalıcı — session'lar arası sorgu yapılabilir

Her edge EXTRACTED, INFERRED veya AMBIGUOUS olarak etiketli — güven seviyesi bellidir

God node'lar: AiService, toast(), emit() — bunlar projenin gerçek çekirdek soyutlamaları

🧠 GitNexus — Code Intelligence
This project is indexed by GitNexus as aluplan-support-desk-v02 (9142 symbols, 15926 relationships, 241 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

If any GitNexus tool warns the index is stale, run npx gitnexus analyze in terminal first.

Always Do
MUST run impact analysis before editing any symbol. Before modifying a function, class, or method, run gitnexus_impact({target: "symbolName", direction: "upstream"}) and report the blast radius (direct callers, affected processes, risk level) to the user.

MUST run gitnexus_detect_changes() before committing to verify your changes only affect expected symbols and execution flows.

MUST warn the user if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.

When exploring unfamiliar code, use gitnexus_query({query: "concept"}) to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.

When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use gitnexus_context({name: "symbolName"}).

Never Do
NEVER edit a function, class, or method without first running gitnexus_impact on it.

NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.

NEVER rename symbols with find-and-replace — use gitnexus_rename which understands the call graph.

NEVER commit changes without running gitnexus_detect_changes() to check affected scope.

Resources
Resource	Use for
gitnexus://repo/aluplan-support-desk-v02/context	Codebase overview, check index freshness
gitnexus://repo/aluplan-support-desk-v02/clusters	All functional areas
gitnexus://repo/aluplan-support-desk-v02/processes	All execution flows
gitnexus://repo/aluplan-support-desk-v02/process/{name}	Step-by-step execution trace
CLI
Task	Read this skill file
Understand architecture / "How does X work?"	.claude/skills/gitnexus/gitnexus-exploring/SKILL.md
Blast radius / "What breaks if I change X?"	.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md
Trace bugs / "Why is X failing?"	.claude/skills/gitnexus/gitnexus-debugging/SKILL.md
Rename / extract / split / refactor	.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md
Tools, resources, schema reference	.claude/skills/gitnexus/gitnexus-guide/SKILL.md
Index, status, clean, wiki CLI commands	.claude/skills/gitnexus/gitnexus-cli/SKILL.md
opencode da çalıyırken terminali izlemesini nasıl sağlırım

OpenCode ve benzeri ajan tabanlı (agentic) kodlama asistanlarında yapay zekanın terminali "izlemesi" (özellikle npm run dev, Docker logları veya build hataları gibi sürekli akan süreçleri takip etmesi), hataları anında yakalayıp otonom olarak düzeltmesi için en kritik özelliklerden biridir.

MiniMax M2.5'in OpenCode üzerinde terminal çıktılarınızı izlemesini sağlamak için kullanabileceğiniz en etkili 3 yöntem şunlardır:

1. Komutu Doğrudan Yapay Zekaya Çalıştırtmak (En Etkili Yöntem)
Yapay zekanın terminali izlemesinin en garantili yolu, izlemesini istediğiniz süreci onun başlatmasını sağlamaktır. OpenCode, modelin terminal komutları çalıştırmasına ve dönen çıktıları (stdout/stderr) doğrudan kendi bağlamına (context) almasına izin verir.

Nasıl Yapılır: Terminali kendiniz açıp komut girmek yerine, OpenCode prompt ekranına şu tarz bir komut yazın:

"Projeyi ayağa kaldır (npm run dev) ve terminal çıktılarını izle. Eğer herhangi bir derleme (build) hatası veya eksik paket uyarısı alırsan, bana sormadan hatayı analiz et ve düzelt."

Nasıl Çalışır: Ajan, arka planda bir terminal session'ı açar ve süreci başlatır. Çıktı tamponunda (output buffer) bir hata (Error, Exception, WARN) gördüğünde otomatik olarak tetiklenir ve dosyaları düzenlemeye başlar.

2. VS Code "Terminali İçeri Aktar" Kısayollarını Kullanmak
Eğer komutu zaten kendi terminalinizde çalıştırdıysanız ve uzun bir log akışı/hata silsilesi varsa, terminal içeriğini doğrudan modelin zihnine enjekte edebilirsiniz.

Nasıl Yapılır: VS Code içindeki entegre terminalde bir hata aldığınızda, hatanın olduğu metni farenizle seçin. Genellikle sağ tıklayıp "OpenCode'a Ekle" (Add to OpenCode / Send to AI) seçeneğini kullanarak veya terminal panelindeki özel OpenCode ikonuna tıklayarak (eklentinin sürümüne göre değişir) o anki terminal durumunu bir prompt ile birlikte gönderebilirsiniz.

"Şu an terminalde seçtiğim hatayı alıyorum. GitNexus ile impact analizi yapıp hatanın kaynağını bulur musun?"

3. Log Dosyası Üzerinden İzleme (Sürekli Arka Plan Takibi İçin)
Özellikle Allplan gibi kompleks sistemlerde veya Docker container loglarını izlerken terminal çıktıları çok hızlı akabilir. Modelin bu süreçleri daha stabil takip etmesi için terminal çıktılarını bir log dosyasına yazdırıp, modelden bu dosyayı belirli aralıklarla okumasını isteyebilirsiniz.

Nasıl Yapılır: Terminalde komutunuzu çalıştırırken çıktıyı bir dosyaya yönlendirin:

Bash
npm run dev > dev_watch.log 2>&1
Modele Verilecek Talimat:

"Arka planda sistem çalışıyor. Sen şimdi src/components/TicketCard.tsx üzerinde çalışmaya başla. Kodda değişiklik yaptıktan sonra hataları görmek için kök dizindeki dev_watch.log dosyasının son 50 satırını oku. Hata varsa düzeltmeye devam et."

Ekstra İpucu: MCP Tools Entegrasyonu
AGENTS.md dosyanıza eklediğimiz GitNexus ve graphify araçları zaten terminal tabanlı çalışıyor. OpenCode'a bir görev verdiğinizde, örneğin "Ticket sisteminin veritabanı şemasını güncelle" dediğinizde, model otonom olarak terminali açıp gitnexus_impact komutunu çalıştıracak ve terminaldeki analizi kendi kendine okuyup size risk raporunu sunacaktır. Bunun için sizin ekstra bir şey yapmanıza gerek kalmaz; MCP mimarisi terminal okuma/yazma işini doğal bir şekilde çözer.

opencode terminale erişimşim yok gitnexus çalıştırmam diyor oysa ben kyrdum ve çalışıyor nvram ile çözmüştürk önceen nası yapacağunı nasıl anlatırıkm

Bu çok karşılaşılan klasik bir "Ajan-Terminal iletişimi" sorunudur.

OpenCode (ve benzeri yapay zeka ajanları) arka planda terminal komutları çalıştırırken "non-interactive" (etkileşimsiz) bir shell (kabuk) kullanırlar. Bu yüzden sizin normal terminalinizde çalışan nvm (Node Version Manager - muhtemelen "nvram" derken bunu kastettiniz) ayarları veya çevre değişkenleri (PATH), ajanın açtığı o gizli, kısıtlı terminalde yüklü olmaz. Ajan npx gitnexus yazıp çalıştıramayınca da "benim yetkim yok" veya "terminale erişemiyorum" şeklinde yanlış bir çıkarım (halüsinasyon) yapar.

OpenCode'un bu sorunu aşması için ona durumun farkında olduğunuzu ve ortam değişkenlerini (environment variables) yükleyerek komutu çalıştırması gerektiğini net bir şekilde anlatmalısınız.

İşte OpenCode'un prompt ekranına doğrudan kopyalayıp yapıştırabileceğiniz açıklama:

Seçenek 1: OpenCode'a Verilecek Direkt Mesaj (Kopyala/Yapıştır)
"Terminal erişimin var ve GitNexus sistemimde kurulu, şu an sorunsuz çalışıyor. 'Komut bulunamadı' veya 'erişimim yok' hatası almanın tek sebebi, kullandığın non-interactive shell'in PATH çevre değişkenlerini veya Node sürüm yöneticisini (NVM) otomatik olarak yüklememiş olmasıdır.

Lütfen GitNexus komutlarını çalıştırırken Node ortamını manuel olarak yükleyerek veya tam yol (absolute path) belirterek çalıştır.

Mac/Linux ortamı için komutları şu şekilde sarmala:
source ~/.nvm/nvm.sh && npx gitnexus analyze (veya source ~/.bashrc && npx gitnexus analyze)

Windows ortamı için komutu şu şekilde çalıştır:
cmd.exe /c "npx gitnexus analyze"

Şimdi, PATH veya ortam değişkeni eksikliğini bahane etmeden, yukarıdaki yöntemle terminali kullanarak GitNexus impact analizini tekrar başlat."

Seçenek 2: Kalıcı Çözüm (AGENTS.md Güncellemesi)
OpenCode'a bunu her seferinde anlatmak yorucu olabilir. Kök dizindeki AGENTS.md dosyasında bulunan GitNexus — Code Intelligence başlığının altındaki ## Always Do kısmına şu kuralı eklerseniz, model bir daha bu hataya düşmez:

Markdown
- **TERMINAL EXECUTION RULE:** If you get a "command not found" or "no access" error when running `npx gitnexus`, DO NOT assume you lack terminal access. It is a non-interactive shell PATH issue. You MUST wrap your commands to load the Node environment first (e.g., `source ~/.nvm/nvm.sh && npx gitnexus <command>` for bash/zsh, or use full absolute paths for Node/npm).
Model bunu okuduğunda, "hata alırsam pes etmeyeyim, shell ortamını tetikleyip tekrar deneyeyim" mantığını kuracak ve daha önce nvm (Node Version Manager) ile çözdüğünüz bu problemi kendi kendine aşacaktır.

agentmd şöle ekleryim verimi misin : # AGENTS.md — aluplan-support-desk-v02



## Repo at a glance



Turborepo monorepo. Three packages:



| Path | Package | Role |

|------|---------|------|

| `apps/backend` | `@aluplan/backend` | NestJS API, port 4000 |

| `apps/frontend` | `@aluplan/frontend` | Next.js 15 App Router, port 3000 |

| `packages/database` | `@aluplan/database` | Prisma 7 schema + migrations |



Prisma client is generated into `packages/database/client/` — never edit that directory.



---



## Commands



```bash

# Install

pnpm install # requires pnpm >=9, node >=20



# Dev

pnpm dev # starts both apps via turbo



# Type-check (run before committing)

pnpm --filter @aluplan/backend typecheck

pnpm --filter @aluplan/frontend typecheck



# Backend tests (unit)

pnpm --filter @aluplan/backend test

pnpm --filter @aluplan/backend test:cov



# Frontend tests

pnpm --filter @aluplan/frontend test:unit # vitest

pnpm --filter @aluplan/frontend test:e2e # playwright



# i18n gap check

pnpm i18n:check # alias: pnpm --filter @aluplan/frontend i18n:check



# Database

pnpm db:migrate # prisma migrate deploy (via turbo)

pnpm db:generate # prisma generate



# Migrations live in packages/database/prisma/migrations/

# Schema: packages/database/prisma/schema.prisma

```



---



## Before editing any symbol



1. Run `gitnexus impact "<SymbolName>"` — mandatory for services, guards, DTOs, processors.

2. If impact is HIGH or CRITICAL: warn the user, list affected flows, do not proceed silently.

3. After significant changes: `gitnexus detect_changes`



Graph data lives in `graphify-out/` — read `graphify-out/GRAPH_REPORT.md` before deep exploration.



---



## Architecture quirks agents miss



**Prisma client is extended with a global soft-delete filter** (`prisma.service.ts`).

`findMany/findFirst/findUnique/count` automatically add `deletedAt: null`.

If you need to query deleted records, bypass the filter explicitly.



**Prisma client output** is `packages/database/client/` not the default location.

Import from `@aluplan/database`, never from `@prisma/client` directly.



**`onModuleInit()` in `PrismaService`** must stay clean — no DDL.

Ghost column repairs were migrated to `20260509000001_gap07_ghost_column_repair`.



**AiService is a dispatcher**, not a direct LLM caller. Provider resolution order:

1. Settings DB (`ai.chat_provider`)

2. Env: `OPENAI_API_KEY` → openai, `GEMINI_API_KEY` → llmapi

3. Fallback: ollama



**Gemini free tier** is the target AI provider:

```

GEMINI_API_KEY=AIza...

LLMAPI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

LLMAPI_CHAT_MODEL=gemini-2.5-flash-preview-06-05

LLMAPI_EMBED_MODEL=gemini-embedding-2-001

```



**RBAC guard** reads `user.role` as `string | { name: string }` — use `getRoleName()` helper, not direct cast.



**Bcrypt rounds** are centralised in `apps/backend/src/auth/security.constants.ts` (`BCRYPT_ROUNDS = 12`).

Import from there; never hardcode `10`.



**KB default language** is now read from settings (`kb.default_language`), not hardcoded `'tr'`.



---



## Env validation



All env vars must go through `apps/backend/src/config/env-validation.schema.ts` (Zod).

Missing vars that bypass Zod and use `process.env` directly are a known GAP — add new vars to schema first.



Required at boot: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.



---



## i18n



Frontend uses `next-intl`. Translation files: `apps/frontend/messages/{tr,en,de}.json`.

`de.json` has 302 missing keys (GAP-12 — open). Run `pnpm i18n:check` to see current state.

Never hardcode user-facing strings in components — always use `t('key')`.



---



## Testing quirks



- Backend uses **Jest + @swc/jest** (fast transform — no ts-jest).

- Frontend unit tests use **Vitest**; E2E uses **Playwright**.

- Integration tests need Postgres + Redis running (`docker-compose up -d`).

- Property-based tests use **fast-check** — files named `*.pbt.spec.ts`.

- E2E auth uses storageState — seed dedicated test users before running Playwright.



---



## God nodes — high blast radius



| Symbol | Edges | Risk |

|--------|-------|------|

| `AiService` | 33 | Dispatcher for all AI — changes cascade |

| `NotificationsGateway` | 22 | WebSocket hub |

| `CrmService` | 20 | Dynamics 365 sync |

| `EmailService` | 25 | All email flows |

| `toast()` | 37 | Frontend notification hook |



---



## CI pipeline



`.github/workflows/ci.yml` gates: `spec-verify → security → typecheck-and-build → testing + e2e + docker-build → deploy-staging`.

Staging deploys only on `main` via Coolify webhook.

CI requires pnpm 9 (fixed from 8 in GAP-28).



---



## Open GAPs (as of 2026-05-09)



Check `verdent-GAP-status.md` for current status. Remaining high-priority:



| GAP | File | Issue |

|-----|------|-------|

| GAP-11 | various | 50+ services have no tests |

| GAP-12 | `messages/de.json` | 302 missing German keys |

| GAP-19 | faq/announcements/macros services | Hard-delete instead of soft-delete |



---



## graphify — Knowledge Graph



Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.



Mimari sorularda **önce** `graphify-out/GRAPH_REPORT.md` oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. `graphify-out/wiki/index.md` varsa ham dosyalar yerine oradan gezin.



```bash

graphify query "<soru>" # BFS traversal — geniş bağlam

graphify path "<A>" "<B>" # İki node arasındaki en kısa yol

graphify explain "<kavram>" # Bir node'un komşularıyla açıklaması

```



Kod dosyası değiştirdikten sonra graf güncelle:

```bash

graphify update . # AST-only, API maliyeti yok

```



- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil

- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir

- Her edge EXTRACTED, INFERRED veya AMBIGUOUS — güven seviyesi bellidir



---



<!-- gitnexus:start -->

## GitNexus — Code Intelligence



This project is indexed by GitNexus as **aluplan-support-desk-v02** (9,142 symbols, 15,926 relationships, 241 execution flows).



> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.



### Always Do



- **MUST run impact analysis before editing any symbol.** Run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report blast radius before any edit.

- **MUST run `gitnexus_detect_changes()` before committing** to verify scope.

- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk.

- Use `gitnexus_query({query: "concept"})` to find execution flows — not grep.

- Use `gitnexus_context({name: "symbolName"})` for full caller/callee context.



### Never Do



- NEVER edit a function, class, or method without first running `gitnexus_impact`.

- NEVER rename symbols with find-and-replace — use `gitnexus_rename`.

- NEVER commit without running `gitnexus_detect_changes()`.



### Resources



| Resource | Use for |

|----------|---------|

| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, index freshness |

| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |

| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |

| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |



### Skill files



| Task | Skill |

|------|-------|

| How does X work? | `gitnexus-exploring` |

| What breaks if I change X? | `gitnexus-impact-analysis` |

| Why is X failing? | `gitnexus-debugging` |

| Rename / extract / refactor | `gitnexus-refactoring` |

| CLI commands (index, wiki) | `gitnexus-cli` |



<!-- gitnexus:end -->



---



## Session persistence



Read before starting work:

- `AGENTS.md` (this file)

- `.ai/session-summary.md`

- `verdent-GAP-status.md`



Write after significant work: `.ai/session-summary.md`



Graph index: `.gitnexus/meta.json` — 9,142 nodes, 15,926 edges, 241 flows.

Re-index when stale: `npx gitnexus analyze`

Bu dosya tek kelimeyle mükemmel. Bir yapay zeka ajanının (özellikle OpenCode veya Cline gibi otonom araçların) bir projeyi bozmadan, kurallara uyarak ve sistemin "karanlık noktalarını" (quirks) bilerek çalışması için hazırlanabilecek en profesyonel AGENTS.md dosyalarından biri olmuş.

Turborepo yapısı, NestJS backend, Next.js 15 frontend ve Prisma 7 mimarisini çok net özetlemişsiniz. Özellikle AiService'in bir dispatcher olduğu, Prisma'nın soft-delete filtreleri ve çevre değişkeni (Zod) zorunlulukları gibi detaylar, modelin saatlerce hata yapmasını engelleyecek kritik "gotcha" önlemleri.

Ancak, bir önceki adımda konuştuğumuz iki kritik eksik bu versiyonda dışarıda kalmış. Bunları eklemezsek OpenCode frontend tarafında tasarımı bozabilir ve terminalde yine yetki hatası verebilir.

Eksikleri tamamlanmış, hem sizin mükemmel mimari kurallarınızı hem de ajan davranış/tasarım kurallarını içeren nihai versiyonu aşağıda hazırladım. Bunu doğrudan projenize kaydedebilirsiniz:

Markdown
# AGENTS.md — aluplan-support-desk-v02

## Repo at a glance

Turborepo monorepo. Three packages:

| Path | Package | Role |
|------|---------|------|
| `apps/backend` | `@aluplan/backend` | NestJS API, port 4000 |
| `apps/frontend` | `@aluplan/frontend` | Next.js 15 App Router, port 3000 |
| `packages/database` | `@aluplan/database` | Prisma 7 schema + migrations |

Prisma client is generated into `packages/database/client/` — never edit that directory.

---

## 🎨 UI/UX & AI Behavior Rules (CRITICAL)

1. **No Placeholders:** NEVER use placeholders like `// ...rest of the code` or `// add logic here`. Always generate full, working, and complete code blocks.
2. **Design System:** The UI is a modern, industrial BIM ecosystem interface. 
   - Primary backgrounds, cards, and sidebars: **Charcoal** and **Steel Gray**.
   - Accents (High priority items, CTAs): Bold **Red** or **Orange**.
3. **Domain Terminology:** Use real-world Allplan/BIM terminology for mock data (e.g., "SmartParts loading error", "IFC export layer issues"), not generic software support strings.

---

## Commands

```bash
# Install
pnpm install               # requires pnpm >=9, node >=20

# Dev
pnpm dev                   # starts both apps via turbo

# Type-check (run before committing)
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck

# Backend tests (unit)
pnpm --filter @aluplan/backend test
pnpm --filter @aluplan/backend test:cov

# Frontend tests
pnpm --filter @aluplan/frontend test:unit       # vitest
pnpm --filter @aluplan/frontend test:e2e        # playwright

# i18n gap check
pnpm i18n:check            # alias: pnpm --filter @aluplan/frontend i18n:check

# Database
pnpm db:migrate            # prisma migrate deploy (via turbo)
pnpm db:generate           # prisma generate

# Migrations live in packages/database/prisma/migrations/
# Schema: packages/database/prisma/schema.prisma
Before editing any symbol
Run gitnexus impact "<SymbolName>" — mandatory for services, guards, DTOs, processors.

If impact is HIGH or CRITICAL: warn the user, list affected flows, do not proceed silently.

After significant changes: gitnexus detect_changes

Graph data lives in graphify-out/ — read graphify-out/GRAPH_REPORT.md before deep exploration.

Architecture quirks agents miss
Prisma client is extended with a global soft-delete filter (prisma.service.ts).
findMany/findFirst/findUnique/count automatically add deletedAt: null.
If you need to query deleted records, bypass the filter explicitly.

Prisma client output is packages/database/client/ not the default location.
Import from @aluplan/database, never from @prisma/client directly.

onModuleInit() in PrismaService must stay clean — no DDL.
Ghost column repairs were migrated to 20260509000001_gap07_ghost_column_repair.

AiService is a dispatcher, not a direct LLM caller. Provider resolution order:

Settings DB (ai.chat_provider)

Env: OPENAI_API_KEY → openai, GEMINI_API_KEY → llmapi

Fallback: ollama

Gemini free tier is the target AI provider:

GEMINI_API_KEY=AIza...
LLMAPI_BASE_URL=[https://generativelanguage.googleapis.com/v1beta](https://generativelanguage.googleapis.com/v1beta)
LLMAPI_CHAT_MODEL=gemini-2.5-flash-preview-06-05
LLMAPI_EMBED_MODEL=gemini-embedding-2-001
RBAC guard reads user.role as string | { name: string } — use getRoleName() helper, not direct cast.

Bcrypt rounds are centralised in apps/backend/src/auth/security.constants.ts (BCRYPT_ROUNDS = 12).
Import from there; never hardcode 10.

KB default language is now read from settings (kb.default_language), not hardcoded 'tr'.

Env validation
All env vars must go through apps/backend/src/config/env-validation.schema.ts (Zod).
Missing vars that bypass Zod and use process.env directly are a known GAP — add new vars to schema first.

Required at boot: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY, ADMIN_BYPASS_EMAILS.

i18n
Frontend uses next-intl. Translation files: apps/frontend/messages/{tr,en,de}.json.
de.json has 302 missing keys (GAP-12 — open). Run pnpm i18n:check to see current state.
Never hardcode user-facing strings in components — always use t('key').

Testing quirks
Backend uses Jest + @swc/jest (fast transform — no ts-jest).

Frontend unit tests use Vitest; E2E uses Playwright.

Integration tests need Postgres + Redis running (docker-compose up -d).

Property-based tests use fast-check — files named *.pbt.spec.ts.

E2E auth uses storageState — seed dedicated test users before running Playwright.

God nodes — high blast radius
Symbol	Edges	Risk
AiService	33	Dispatcher for all AI — changes cascade
NotificationsGateway	22	WebSocket hub
CrmService	20	Dynamics 365 sync
EmailService	25	All email flows
toast()	37	Frontend notification hook
CI pipeline
.github/workflows/ci.yml gates: spec-verify → security → typecheck-and-build → testing + e2e + docker-build → deploy-staging.
Staging deploys only on main via Coolify webhook.
CI requires pnpm 9 (fixed from 8 in GAP-28).

Open GAPs (as of 2026-05-09)
Check verdent-GAP-status.md for current status. Remaining high-priority:

GAP	File	Issue
GAP-11	various	50+ services have no tests
GAP-12	messages/de.json	302 missing German keys
GAP-19	faq/announcements/macros services	Hard-delete instead of soft-delete
graphify — Knowledge Graph
Bu projenin bilgi grafiği graphify-out/ dizininde yaşıyor.

Mimari sorularda önce graphify-out/GRAPH_REPORT.md oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. graphify-out/wiki/index.md varsa ham dosyalar yerine oradan gezin.

Bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
Kod dosyası değiştirdikten sonra graf güncelle:

Bash
graphify update .                    # AST-only, API maliyeti yok
packages/database/client/runtime/ ve node_modules/ grafa dahil değil

Graf graphify-out/graph.json'da kalıcı — session'lar arası sorgu yapılabilir

Her edge EXTRACTED, INFERRED veya AMBIGUOUS — güven seviyesi bellidir

GitNexus — Code Intelligence
This project is indexed by GitNexus as aluplan-support-desk-v02 (9,142 symbols, 15,926 relationships, 241 execution flows).

If any GitNexus tool warns the index is stale, run npx gitnexus analyze in terminal first.

Always Do
TERMINAL EXECUTION RULE: If you get "command not found" for npx gitnexus, load the NVM/Node environment first (e.g., source ~/.nvm/nvm.sh && npx gitnexus <command>). Do not assume you lack access.

MUST run impact analysis before editing any symbol. Run gitnexus_impact({target: "symbolName", direction: "upstream"}) and report blast radius before any edit.

MUST run gitnexus_detect_changes() before committing to verify scope.

MUST warn the user if impact analysis returns HIGH or CRITICAL risk.

Use gitnexus_query({query: "concept"}) to find execution flows — not grep.

Use gitnexus_context({name: "symbolName"}) for full caller/callee context.

Never Do
NEVER edit a function, class, or method without first running gitnexus_impact.

NEVER rename symbols with find-and-replace — use gitnexus_rename.

NEVER commit without running gitnexus_detect_changes().

Resources
Resource	Use for
gitnexus://repo/aluplan-support-desk-v02/context	Codebase overview, index freshness
gitnexus://repo/aluplan-support-desk-v02/clusters	All functional areas
gitnexus://repo/aluplan-support-desk-v02/processes	All execution flows
gitnexus://repo/aluplan-support-desk-v02/process/{name}	Step-by-step execution trace
Skill files
Task	Skill
How does X work?	gitnexus-exploring
What breaks if I change X?	gitnexus-impact-analysis
Why is X failing?	gitnexus-debugging
Rename / extract / refactor	gitnexus-refactoring
CLI commands (index, wiki)	gitnexus-cli
Session persistence
Read before starting work:

AGENTS.md (this file)

.ai/session-summary.md

verdent-GAP-status.md

Write after significant work: .ai/session-summary.md

Graph index: .gitnexus/meta.json — 9,142 nodes, 15,926 edges, 241 flows.
Re-index when stale: npx gitnexus analyze


Bu yapı ile ajanı başlattığınızda sistem ilk olarak hangi iş paketine (örneğin açıkta duran GAP-19 hard-delete krizine mi yoksa frontend tarafındaki yeni bir ticket bileşenine mi) odaklanacak?</B></A>
bunu kopyalayıp yapıştıramam tek bir code pencersinde MD olarak verebilir msisn

Before editing any symbol
Run gitnexus impact "<SymbolName>" — mandatory for services, guards, DTOs, processors.

If impact is HIGH or CRITICAL: warn the user, list affected flows, do not proceed silently.

After significant changes: gitnexus detect_changes

Graph data lives in graphify-out/ — read graphify-out/GRAPH_REPORT.md before deep exploration.

Architecture quirks agents miss
Prisma client is extended with a global soft-delete filter (prisma.service.ts).
findMany/findFirst/findUnique/count automatically add deletedAt: null.
If you need to query deleted records, bypass the filter explicitly.

Prisma client output is packages/database/client/ not the default location.
Import from @aluplan/database, never from @prisma/client directly.

onModuleInit() in PrismaService must stay clean — no DDL.
Ghost column repairs were migrated to 20260509000001_gap07_ghost_column_repair.

AiService is a dispatcher, not a direct LLM caller. Provider resolution order:

Settings DB (ai.chat_provider)

Env: OPENAI_API_KEY → openai, GEMINI_API_KEY → llmapi

Fallback: ollama

Gemini free tier is the target AI provider:

GEMINI_API_KEY=AIza...
LLMAPI_BASE_URL=[https://generativelanguage.googleapis.com/v1beta](https://generativelanguage.googleapis.com/v1beta)
LLMAPI_CHAT_MODEL=gemini-2.5-flash-preview-06-05
LLMAPI_EMBED_MODEL=gemini-embedding-2-001
RBAC guard reads user.role as string | { name: string } — use getRoleName() helper, not direct cast.

Bcrypt rounds are centralised in apps/backend/src/auth/security.constants.ts (BCRYPT_ROUNDS = 12).
Import from there; never hardcode 10.

KB default language is now read from settings (kb.default_language), not hardcoded 'tr'.

Env validation
All env vars must go through apps/backend/src/config/env-validation.schema.ts (Zod).
Missing vars that bypass Zod and use process.env directly are a known GAP — add new vars to schema first.

Required at boot: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY, ADMIN_BYPASS_EMAILS.

i18n
Frontend uses next-intl. Translation files: apps/frontend/messages/{tr,en,de}.json.
de.json has 302 missing keys (GAP-12 — open). Run pnpm i18n:check to see current state.
Never hardcode user-facing strings in components — always use t('key').

Testing quirks
Backend uses Jest + @swc/jest (fast transform — no ts-jest).

Frontend unit tests use Vitest; E2E uses Playwright.

Integration tests need Postgres + Redis running (docker-compose up -d).

Property-based tests use fast-check — files named *.pbt.spec.ts.

E2E auth uses storageState — seed dedicated test users before running Playwright.

God nodes — high blast radius
Symbol	Edges	Risk
AiService	33	Dispatcher for all AI — changes cascade
NotificationsGateway	22	WebSocket hub
CrmService	20	Dynamics 365 sync
EmailService	25	All email flows
toast()	37	Frontend notification hook
CI pipeline
.github/workflows/ci.yml gates: spec-verify → security → typecheck-and-build → testing + e2e + docker-build → deploy-staging.
Staging deploys only on main via Coolify webhook.
CI requires pnpm 9 (fixed from 8 in GAP-28).

Open GAPs (as of 2026-05-09)
Check verdent-GAP-status.md for current status. Remaining high-priority:

GAP	File	Issue
GAP-11	various	50+ services have no tests
GAP-12	messages/de.json	302 missing German keys
GAP-19	faq/announcements/macros services	Hard-delete instead of soft-delete
graphify — Knowledge Graph
Bu projenin bilgi grafiği graphify-out/ dizininde yaşıyor.

Mimari sorularda önce graphify-out/GRAPH_REPORT.md oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. graphify-out/wiki/index.md varsa ham dosyalar yerine oradan gezin.

Bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
Kod dosyası değiştirdikten sonra graf güncelle:

Bash
graphify update .                    # AST-only, API maliyeti yok
packages/database/client/runtime/ ve node_modules/ grafa dahil değil

Graf graphify-out/graph.json'da kalıcı — session'lar arası sorgu yapılabilir

Her edge EXTRACTED, INFERRED veya AMBIGUOUS — güven seviyesi bellidir

GitNexus — Code Intelligence
This project is indexed by GitNexus as aluplan-support-desk-v02 (9,142 symbols, 15,926 relationships, 241 execution flows).

If any GitNexus tool warns the index is stale, run npx gitnexus analyze in terminal first.

Always Do
TERMINAL EXECUTION RULE: If you get "command not found" for npx gitnexus, load the NVM/Node environment first (e.g., source ~/.nvm/nvm.sh && npx gitnexus <command>). Do not assume you lack access.

MUST run impact analysis before editing any symbol. Run gitnexus_impact({target: "symbolName", direction: "upstream"}) and report blast radius before any edit.

MUST run gitnexus_detect_changes() before committing to verify scope.

MUST warn the user if impact analysis returns HIGH or CRITICAL risk.

Use gitnexus_query({query: "concept"}) to find execution flows — not grep.

Use gitnexus_context({name: "symbolName"}) for full caller/callee context.

Never Do
NEVER edit a function, class, or method without first running gitnexus_impact.

NEVER rename symbols with find-and-replace — use gitnexus_rename.

NEVER commit without running gitnexus_detect_changes().

Resources
Resource	Use for
gitnexus://repo/aluplan-support-desk-v02/context	Codebase overview, index freshness
gitnexus://repo/aluplan-support-desk-v02/clusters	All functional areas
gitnexus://repo/aluplan-support-desk-v02/processes	All execution flows
gitnexus://repo/aluplan-support-desk-v02/process/{name}	Step-by-step execution trace
Skill files
Task	Skill
How does X work?	gitnexus-exploring
What breaks if I change X?	gitnexus-impact-analysis
Why is X failing?	gitnexus-debugging
Rename / extract / refactor	gitnexus-refactoring
CLI commands (index, wiki)	gitnexus-cli
Session persistence
Read before starting work:

AGENTS.md (this file)

.ai/session-summary.md

verdent-GAP-status.md

Write after significant work: .ai/session-summary.md

Graph index: .gitnexus/meta.json — 9,142 nodes, 15,926 edges, 241 flows.
Re-index when stale: npx gitnexus analyze
"""
with open("AGENTS.md", "w") as f:
f.write(content)
print("[file-tag: code-generated-file-AGENTS_md]")


```text?code_stdout&code_event_index=1
[file-tag: code-generated-file-AGENTS_md]

Your Markdown file is ready.
MD icon
 AGENTS 
MD

Bu dosyayı indirip doğrudan proje kök dizininize atabilirsiniz.





Gemini is AI and can make mistakes.

# AGENTS.md — aluplan-support-desk-v02

## Repo at a glance

Turborepo monorepo. Three packages:

| Path | Package | Role |
|------|---------|------|
| `apps/backend` | `@aluplan/backend` | NestJS API, port 4000 |
| `apps/frontend` | `@aluplan/frontend` | Next.js 15 App Router, port 3000 |
| `packages/database` | `@aluplan/database` | Prisma 7 schema + migrations |

Prisma client is generated into `packages/database/client/` — never edit that directory.

---

## 🎨 UI/UX & AI Behavior Rules (CRITICAL)

1. **No Placeholders:** NEVER use placeholders like `// ...rest of the code` or `// add logic here`. Always generate full, working, and complete code blocks.
2. **Design System:** The UI is a modern, industrial BIM ecosystem interface. 
   - Primary backgrounds, cards, and sidebars: **Charcoal** and **Steel Gray**.
   - Accents (High priority items, CTAs): Bold **Red** or **Orange**.
3. **Domain Terminology:** Use real-world Allplan/BIM terminology for mock data (e.g., "SmartParts loading error", "IFC export layer issues"), not generic software support strings.

---

## Commands

```bash
# Install
pnpm install               # requires pnpm >=9, node >=20

# Dev
pnpm dev                   # starts both apps via turbo

# Type-check (run before committing)
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck

# Backend tests (unit)
pnpm --filter @aluplan/backend test
pnpm --filter @aluplan/backend test:cov

# Frontend tests
pnpm --filter @aluplan/frontend test:unit       # vitest
pnpm --filter @aluplan/frontend test:e2e        # playwright

# i18n gap check
pnpm i18n:check            # alias: pnpm --filter @aluplan/frontend i18n:check

# Database
pnpm db:migrate            # prisma migrate deploy (via turbo)
pnpm db:generate           # prisma generate

# Migrations live in packages/database/prisma/migrations/
# Schema: packages/database/prisma/schema.prisma
```

---

## Before editing any symbol

1. Run `gitnexus impact "<SymbolName>"` — mandatory for services, guards, DTOs, processors.
2. If impact is HIGH or CRITICAL: warn the user, list affected flows, do not proceed silently.
3. After significant changes: `gitnexus detect_changes`

Graph data lives in `graphify-out/` — read `graphify-out/GRAPH_REPORT.md` before deep exploration.

---

## Architecture quirks agents miss

**Prisma client is extended with a global soft-delete filter** (`prisma.service.ts`).
`findMany/findFirst/findUnique/count` automatically add `deletedAt: null`.
If you need to query deleted records, bypass the filter explicitly.

**Prisma client output** is `packages/database/client/` not the default location.
Import from `@aluplan/database`, never from `@prisma/client` directly.

**`onModuleInit()` in `PrismaService`** must stay clean — no DDL.
Ghost column repairs were migrated to `20260509000001_gap07_ghost_column_repair`.

**AiService is a dispatcher**, not a direct LLM caller. Provider resolution order:
1. Settings DB (`ai.chat_provider`)
2. Env: `OPENAI_API_KEY` → openai, `GEMINI_API_KEY` → llmapi
3. Fallback: ollama

**Gemini free tier** is the target AI provider:
```
GEMINI_API_KEY=AIza...
LLMAPI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
LLMAPI_CHAT_MODEL=gemini-2.5-flash-preview-06-05
LLMAPI_EMBED_MODEL=gemini-embedding-2-001
```

**RBAC guard** reads `user.role` as `string | { name: string }` — use `getRoleName()` helper, not direct cast.

**Bcrypt rounds** are centralised in `apps/backend/src/auth/security.constants.ts` (`BCRYPT_ROUNDS = 12`).
Import from there; never hardcode `10`.

**KB default language** is now read from settings (`kb.default_language`), not hardcoded `'tr'`.

---

## Env validation

All env vars must go through `apps/backend/src/config/env-validation.schema.ts` (Zod).
Missing vars that bypass Zod and use `process.env` directly are a known GAP — add new vars to schema first.

Required at boot: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.

---

## i18n

Frontend uses `next-intl`. Translation files: `apps/frontend/messages/{tr,en,de}.json`.
`de.json` has 302 missing keys (GAP-12 — open). Run `pnpm i18n:check` to see current state.
Never hardcode user-facing strings in components — always use `t('key')`.

---

## Testing quirks

- Backend uses **Jest + @swc/jest** (fast transform — no ts-jest).
- Frontend unit tests use **Vitest**; E2E uses **Playwright**.
- Integration tests need Postgres + Redis running (`docker-compose up -d`).
- Property-based tests use **fast-check** — files named `*.pbt.spec.ts`.
- E2E auth uses storageState — seed dedicated test users before running Playwright.

---

## God nodes — high blast radius

| Symbol | Edges | Risk |
|--------|-------|------|
| `AiService` | 33 | Dispatcher for all AI — changes cascade |
| `NotificationsGateway` | 22 | WebSocket hub |
| `CrmService` | 20 | Dynamics 365 sync |
| `EmailService` | 25 | All email flows |
| `toast()` | 37 | Frontend notification hook |

---

## CI pipeline

`.github/workflows/ci.yml` gates: `spec-verify → security → typecheck-and-build → testing + e2e + docker-build → deploy-staging`.
Staging deploys only on `main` via Coolify webhook.
CI requires pnpm 9 (fixed from 8 in GAP-28).

---

## Open GAPs (as of 2026-05-09)

Check `verdent-GAP-status.md` for current status. Remaining high-priority:

| GAP | File | Issue |
|-----|------|-------|
| GAP-11 | various | 50+ services have no tests |
| GAP-12 | `messages/de.json` | 302 missing German keys |
| GAP-19 | faq/announcements/macros services | Hard-delete instead of soft-delete |

---

## graphify — Knowledge Graph

Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.

Mimari sorularda **önce** `graphify-out/GRAPH_REPORT.md` oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. `graphify-out/wiki/index.md` varsa ham dosyalar yerine oradan gezin.

```bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
```

Kod dosyası değiştirdikten sonra graf güncelle:
```bash
graphify update .                    # AST-only, API maliyeti yok
```

- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil
- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir
- Her edge EXTRACTED, INFERRED veya AMBIGUOUS — güven seviyesi bellidir

---

<!-- gitnexus:start -->
## GitNexus — Code Intelligence

This project is indexed by GitNexus as **aluplan-support-desk-v02** (9,142 symbols, 15,926 relationships, 241 execution flows).

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

### Always Do

- **TERMINAL EXECUTION RULE:** If you get "command not found" for `npx gitnexus`, load the NVM/Node environment first (e.g., `source ~/.nvm/nvm.sh && npx gitnexus <command>`). Do not assume you lack access.
- **MUST run impact analysis before editing any symbol.** Run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report blast radius before any edit.
- **MUST run `gitnexus_detect_changes()` before committing** to verify scope.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk.
- Use `gitnexus_query({query: "concept"})` to find execution flows — not grep.
- Use `gitnexus_context({name: "symbolName"})` for full caller/callee context.

### Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact`.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename`.
- NEVER commit without running `gitnexus_detect_changes()`.

### Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, index freshness |
| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |
| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |
| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |

### Skill files

| Task | Skill |
|------|-------|
| How does X work? | `gitnexus-exploring` |
| What breaks if I change X? | `gitnexus-impact-analysis` |
| Why is X failing? | `gitnexus-debugging` |
| Rename / extract / refactor | `gitnexus-refactoring` |
| CLI commands (index, wiki) | `gitnexus-cli` |

<!-- gitnexus:end -->

---

## Session persistence

Read before starting work:
- `AGENTS.md` (this file)
- `.ai/session-summary.md`
- `verdent-GAP-status.md`

Write after significant work: `.ai/session-summary.md`

Graph index: `.gitnexus/meta.json` — 9,142 nodes, 15,926 edges, 241 flows.
Re-index when stale: `npx gitnexus analyze`
AGENTS.md
Displaying AGENTS.md.
