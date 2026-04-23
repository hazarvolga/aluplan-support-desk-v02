<p align="center">
  <img src="https://allplan.net.tr/logo.png" alt="Aluplan Logo" width="200" />
</p>

<p align="center">
  <strong>Alüplan AI Support Desk</strong><br>
  <em>Premium AI-Powered Enterprise Customer Support & Strategic Intelligence Platform</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma%207-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Coolify-6366F1?style=for-the-badge&logo=docker&logoColor=white" alt="Coolify" />
</p>

---

## 📋 Proje Özeti (Project Overview)

Alüplan AI Support Desk, B2B şirketleri için tasarlanmış, yapay zeka odaklı yeni nesil bir müşteri destek platformudur. Klasik bilet (ticket) yönetimini, gelişmiş **RAG (Retrieval-Augmented Generation)** mimarisi ve stratejik zeka dashboard'ları ile birleştirerek operasyonel yükü %70 oranında azaltmayı hedefler.

Sistem, batan (obsolete) biletlerden otomatik olarak yeni bilgi üreten, düşük güven puanlı cevapları "Eğitim Kuyruğu"na (Training Queue) atan ve müşteri davranışlarından stratejik içgörüler çıkaran kapalı bir döngüde çalışır.

---

## 🔄 AI İş Akışı: "Sonsuz Bilgi Döngüsü"

Projemiz sadece soru-cevap yapmaz, kendi kendini besleyen bir veri ekosistemi kurar:

1.  **Ingestion:** Teknik dokümanlar, PDF'ler ve geçmiş biletler `pgvector` üzerinde HNSW indeksleri ile vektörize edilir.
2.  **AI Query & RAG:** Kullanıcı sorusu geldiğinde, sistem hibrit (semantic + keyword) arama yaparak en alakalı bağlamı bulur ve **OpenAI/Groq/Ollama** üzerinden yanıt üretir.
3.  **Real-time Streaming:** Yanıtlar, düşük gecikme için WebSocket/Server-Sent Events üzerinden bizzat akış (stream) olarak sunulur.
4.  **Feedback-to-Vector Loop:** Düşük puan alan cevaplar otomatik olarak **Strategic Intelligence Dashboard**'a düşer.
5.  **Gap Detection:** Yapay zeka, cevaplayamadığı soruları analiz ederek "Bilgi Boşluklarını" (Knowledge Gaps) raporlar.
6.  **Auto-Correction:** Yönetici onayıyla, bu boşluklar yeni Bilgi Bankası makalelerine veya SSS (FAQ) girişlerine dönüştürülür.

---

## 🛠 Teknoloji Yığını (Tech Stack)

### Backend (Core Engine)
- **NestJS:** Modüler, kurumsal sınıf Node.js çerçevesi.
- **Prisma 7:** Type-safe Veritabanı ORM.
- **PostgreSQL 16:** Ana veri deposu + `pgvector` vektör uzantısı.
- **Redis & BullMQ:** Arka plan işleme (Sync, Email, PDF Scraping) ve throttler yönetimi.
- **Socket.io:** Canlı bilet güncellemeleri ve AI akışı.

### Frontend (User & Admin Interface)
- **Next.js 15 (App Router):** SSR ve dinamik rotalama ile en yüksek performans.
- **React 19:** En yeni React özellikleri.
- **Tailwind CSS & shadcn/ui:** Glassmorphic modern tasarım dili.
- **TanStack Query:** Güçlü state yönetimi ve veri önbelleğe alma.

### AI & Intelligence
- **Multi-Provider Fallback:** OpenAI (GPT-4o), Groq (Llama 3.3), ve Yerel Ollama arasında anlık geçiş ve hata toleransı.
- **HNSW Vector Indexes:** Milisaniyeler içinde yüksek hassasiyetli döküman arama.
- **OpenTelemetry:** Yapay zeka performans ve maliyet takibi.

---

## 🏗 Mimari Yapı (Architecture)

```text
aluplan-support-desk-v02/
├── apps/
│   ├── backend/          # NestJS API (Yüksek performanslı AI dağıtıcı)
│   └── frontend/         # Next.js Dashboard (Yönetici ve Müşteri paneli)
├── packages/
│   └── database/         # Merkezi Prisma şeması ve Migration yönetimi
├── docker/               # PostgreSQL, Redis ve Diğer altyapı konteynerleri
├── scripts/              # CI/CD ve Dev-Ops otomasyon araçları
└── docs/                 # Detaylı teknik spesifikasyonlar
```

---

## 🚀 Kurulum ve Çalıştırma

### Yerel Geliştirme (Local Development)

```bash
# 1. Bağımlılıkları Yükleyin
pnpm install

# 2. Altyapıyı Başlatın (Postgres + Redis)
docker-compose up -d

# 3. Veritabanını Hazırlayın
pnpm db:migrate
pnpm db:seed

# 4. Geliştirme Modunda Başlatın
pnpm dev
```

### Üretim Ortamı (Production - Coolify)

Sistem **Coolify** üzerinde tam otomatik olarak dağıtılır (CI/CD):
- **Backend:** `https://api.allplan.net.tr`
- **Frontend:** `https://allplan.net.tr`
- **İzleme:** Sentry ve OpenTelemetry entegrasyonu mevcuttur.

---

## 📈 Stratejik Yönetim ve Görselleştirme

Platform, sadece operasyonel değil, aynı zamanda stratejik bir yönetim aracıdır:

- **System Topology:** AI servislerinin, veritabanı bağlantılarının ve dış entegrasyonların (CRM, Email) sağlık durumunu ve gecikme sürelerini canlı olarak görselleştirir.
- **FAQ Learning Center:** Çözümlenen biletlerden otomatik olarak "Öğrenilen Bilgileri" bularak Bilgi Bankası'na aday makaleler sunar.
- **Service Level Agreements (SLA):** Departman ve takım bazlı SLA takibi yaparak gecikmeleri gerçek zamanlı raporlar.

---

## 📊 Önemli Özellikler

| Özellik | Tanım |
|---------|-------------|
| ⚡ **AI Streaming** | Yanıtları bekletmeden, kelime bazlı gerçek zamanlı gösterim. |
| 🛡 **RBAC Security** | Role-Based Access Control ile Admin, Agent ve Customer yetkilendirmesi. |
| 📞 **Omni-Channel** | WhatsApp, E-posta ve Web Widget entegrasyonu hazır altyapı. |
| 🌡 **Hotinfo Snapshot** | Kritik müşteri verilerinin (Sözleşme tipi, ürün vb.) bilet anındaki anlık görüntüsü. |
| 📉 **Maliyet Takibi** | AI kullanımını token bazlı takip eden finansal metrikler. |
| 🕵️ **Audit Logs** | Güvenlik ve hesap verebilirlik için her işlemin kaydı. |

---

## 🤝 İletişim ve Katkı

Proje hakkında sorularınız için teknik ekip ile `destek@allplan.net.tr` adresinden iletişime geçebilirsiniz.

---

<p align="center">
  <em>Built for Excellence by Alüplan Dev Team</em>
</p>
