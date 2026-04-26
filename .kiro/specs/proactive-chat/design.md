# Tasarım Dokümanı — Proaktif Chat

## Genel Bakış

Proaktif Chat, destek ajanlarının müşterilere ticket açmadan doğrudan chat başlatabildiği yeni bir iletişim kanalıdır. Mevcut Ticket Live Chat sisteminden (`chatStatus: NORMAL → REQUESTED → LIVE`) tamamen bağımsız çalışır; iki sistem aynı WebSocket altyapısını (`NotificationsGateway`, `/ws` namespace) paylaşır ancak birbirinin veri modellerine dokunmaz.

**Bu aşama:** Ajan başlatmalı proaktif chat.  
**Sonraki aşama (kapsam dışı):** VIP müşteri başlatmalı chat — altyapı bu akışı destekleyecek şekilde tasarlanmıştır (`initiatorType` alanı).

### Temel Akış

```
Ajan → POST /proactive-chat/sessions
         ↓
   ProactiveChatSession (PENDING) oluşturulur
   Redis TTL (120s) + BullMQ delayed job set edilir
         ↓
   proactive_chat:incoming → müşteriye WS event
         ↓
   Müşteri kabul eder → PATCH /sessions/:id/accept
         ↓
   ProactiveChatSession (ACTIVE)
   proactive_chat:accepted → her iki tarafa WS event
         ↓
   Mesajlaşma (bidirectional)
         ↓
   PATCH /sessions/:id/end → ENDED
   (opsiyonel) POST /sessions/:id/convert → Ticket
```

---

## Mimari

### Katman Yapısı

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                  │
│  ProactiveChatInvite  │  ProactiveChatWindow             │
│  ProactiveChatPendingBadge  │  ActiveSessionsPanel       │
│  customers/page.tsx (Start Chat button)                  │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + WebSocket (/ws)
┌──────────────────────────▼──────────────────────────────┐
│                    Backend (NestJS)                       │
│  ProactiveChatModule                                     │
│  ├── ProactiveChatController  (REST /proactive-chat)     │
│  ├── ProactiveChatService     (iş mantığı)               │
│  ├── ProactiveChatTimeoutProcessor (BullMQ)              │
│  └── NotificationsGateway     (mevcut, WS event'leri)    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Veri Katmanı                                 │
│  PostgreSQL (Prisma)  │  Redis (presence + TTL)          │
│  ProactiveChatSession │  BullMQ (timeout jobs)           │
│  ProactiveChatMessage │                                  │
└─────────────────────────────────────────────────────────┘
```

### Modül Bağımlılıkları

`ProactiveChatModule` şu modüllere bağımlıdır:
- `NotificationsModule` (forwardRef) — WS event gönderimi için
- `PrismaModule` — veritabanı erişimi
- `RedisModule` — presence kontrolü ve TTL
- `BullModule` — timeout job'ları

`app.module.ts`'e `ProactiveChatModule` import edilir.

---

## Bileşenler ve Arayüzler

### Backend

#### ProactiveChatController

`/proactive-chat` prefix'i altında tüm REST endpoint'lerini sunar. Her endpoint JWT guard ve rol guard ile korunur.

```typescript
// Endpoint listesi
POST   /proactive-chat/sessions                    // Oturum oluştur (agent only)
PATCH  /proactive-chat/sessions/:id/accept         // Müşteri kabul
PATCH  /proactive-chat/sessions/:id/decline        // Müşteri red
PATCH  /proactive-chat/sessions/:id/end            // Ajan veya müşteri sonlandır
POST   /proactive-chat/sessions/:id/messages       // Mesaj gönder
GET    /proactive-chat/sessions/:id/messages       // Mesaj geçmişi
POST   /proactive-chat/sessions/:id/convert        // Ticket'a dönüştür
GET    /proactive-chat/sessions                    // Oturum listesi
```

#### ProactiveChatService

Tüm iş mantığını içerir. `NotificationsGateway`'e `forwardRef` ile inject edilir.

```typescript
interface ProactiveChatService {
  createSession(agentId: string, customerId: string): Promise<ProactiveChatSession>
  acceptSession(sessionId: string, customerId: string): Promise<ProactiveChatSession>
  declineSession(sessionId: string, customerId: string): Promise<ProactiveChatSession>
  endSession(sessionId: string, userId: string): Promise<ProactiveChatSession>
  sendMessage(sessionId: string, senderId: string, content: string): Promise<ProactiveChatMessage>
  getMessages(sessionId: string, userId: string): Promise<ProactiveChatMessage[]>
  convertToTicket(sessionId: string, agentId: string): Promise<Ticket>
  listSessions(userId: string, role: string): Promise<ProactiveChatSession[]>
  handleTimeout(sessionId: string): Promise<void>       // BullMQ job handler
  handleDisconnectTimeout(sessionId: string): Promise<void>
}
```

#### ProactiveChatTimeoutProcessor

BullMQ processor. İki iş türü işler:

| Job Adı | Gecikme | Tetikleyici | Aksiyon |
|---|---|---|---|
| `pending-timeout` | 120s | Oturum oluşturulduğunda | PENDING → MISSED, ajan'a `proactive_chat:missed` |
| `disconnect-timeout` | 60s | WS bağlantısı kesildiğinde | ACTIVE → ENDED, karşı tarafa `proactive_chat:ended` |

#### NotificationsGateway (mevcut — genişletilir)

Yeni `@SubscribeMessage` handler'ları eklenir:

```typescript
@SubscribeMessage('proactive_chat:join')   // Oturum odasına katıl
@SubscribeMessage('proactive_chat:leave')  // Oturum odasından ayrıl
@SubscribeMessage('proactive_chat:typing') // Yazma göstergesi (persist edilmez)
```

Yeni `sendToUser` çağrıları servis katmanından yapılır — gateway'e doğrudan yeni method eklenmez.

WS oda adı: `proactive_chat:{sessionId}`

### Frontend

#### Bileşen Hiyerarşisi

```
apps/frontend/src/components/proactive-chat/
├── ProactiveChatInvite.tsx        // Müşteri — gelen davet (sağ alt köşe)
├── ProactiveChatWindow.tsx        // Aktif chat penceresi (her iki taraf)
├── ProactiveChatPendingBadge.tsx  // Ajan — bekleme ekranı
└── ActiveSessionsPanel.tsx        // Ajan — aktif oturumlar paneli
```

#### ProactiveChatInvite

- Müşteri tarafında `proactive_chat:incoming` event'ini dinler
- Sağ alt köşede sabit konumlu kart (z-index yüksek)
- Ajan adı, avatarı, "Kabul Et" / "Reddet" butonları
- 120s geri sayım göstergesi
- Birden fazla sekme açıksa: `localStorage` + `BroadcastChannel` ile tek sekme garantisi

#### ProactiveChatWindow

- Her iki taraf için ortak chat arayüzü
- Mesaj listesi (createdAt sıralı), input alanı, gönder butonu
- Yazma göstergesi (`proactive_chat:typing`)
- Ajan tarafında "Ticket'a Dönüştür" butonu
- Oturum ENDED olduğunda salt okunur mod

#### ProactiveChatPendingBadge

- Ajan tarafında oturum PENDING iken gösterilir
- Müşteri adı, bekleme süresi, iptal butonu
- `proactive_chat:accepted` → `ProactiveChatWindow`'a geçiş
- `proactive_chat:declined` / `proactive_chat:missed` → toast + kapanma

#### ActiveSessionsPanel

- Ajan panelinde aktif oturumları listeler
- Her satır: müşteri adı, başlangıç zamanı, durum badge'i
- Oturum satırına tıklanınca `ProactiveChatWindow` açılır

#### API İstemcisi (api.ts)

```typescript
proactiveChat: {
  createSession: (customerId: string) => request<ProactiveChatSession>(...)
  acceptSession: (sessionId: string) => request<ProactiveChatSession>(...)
  declineSession: (sessionId: string) => request<ProactiveChatSession>(...)
  endSession: (sessionId: string) => request<ProactiveChatSession>(...)
  sendMessage: (sessionId: string, content: string) => request<ProactiveChatMessage>(...)
  getMessages: (sessionId: string) => request<ProactiveChatMessage[]>(...)
  convertToTicket: (sessionId: string) => request<Ticket>(...)
  listSessions: () => request<ProactiveChatSession[]>(...)
}
```

---

## Veri Modelleri

### Prisma Schema Eklemeleri

```prisma
enum ProactiveChatStatus {
  PENDING
  ACTIVE
  ENDED
  DECLINED
  MISSED
}

enum ProactiveChatInitiatorType {
  AGENT
  CUSTOMER
}

model ProactiveChatSession {
  id                String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  agentId           String                     @map("agent_id") @db.Uuid
  customerId        String                     @map("customer_id") @db.Uuid
  status            ProactiveChatStatus        @default(PENDING)
  initiatorType     ProactiveChatInitiatorType @default(AGENT) @map("initiator_type")
  convertedTicketId String?                    @map("converted_ticket_id") @db.Uuid
  endedAt           DateTime?                  @map("ended_at")
  createdAt         DateTime                   @default(now()) @map("created_at")
  updatedAt         DateTime                   @updatedAt @map("updated_at")

  agent    User                   @relation("ProactiveChatAgent", fields: [agentId], references: [id])
  customer User                   @relation("ProactiveChatCustomer", fields: [customerId], references: [id])
  messages ProactiveChatMessage[]

  @@index([agentId, status], map: "idx_pcs_agent_status")
  @@index([customerId, status], map: "idx_pcs_customer_status")
  @@index([status], map: "idx_pcs_status")
  @@map("proactive_chat_sessions")
}

model ProactiveChatMessage {
  id        String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionId String               @map("session_id") @db.Uuid
  senderId  String               @map("sender_id") @db.Uuid
  content   String
  createdAt DateTime             @default(now()) @map("created_at")

  session ProactiveChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sender  User                 @relation("ProactiveChatMessageSender", fields: [senderId], references: [id])

  @@index([sessionId, createdAt], map: "idx_pcm_session_created")
  @@map("proactive_chat_messages")
}
```

`User` modeline eklenen ilişkiler:
```prisma
proactiveChatAsAgent    ProactiveChatSession[]  @relation("ProactiveChatAgent")
proactiveChatAsCustomer ProactiveChatSession[]  @relation("ProactiveChatCustomer")
proactiveChatMessages   ProactiveChatMessage[]  @relation("ProactiveChatMessageSender")
```

`CustomerProfile` modeline eklenen alan:
```prisma
isVip Boolean @default(false) @map("is_vip")
```

### WebSocket Event Sözleşmeleri

| Event | Yön | Payload |
|---|---|---|
| `proactive_chat:incoming` | server → customer | `{ sessionId, agentId, agentName, agentAvatar, createdAt }` |
| `proactive_chat:accepted` | server → agent + customer | `{ sessionId, acceptedAt }` |
| `proactive_chat:declined` | server → agent | `{ sessionId }` |
| `proactive_chat:missed` | server → agent | `{ sessionId }` |
| `proactive_chat:message` | server → other party | `{ sessionId, messageId, senderId, content, createdAt }` |
| `proactive_chat:typing` | server → other party | `{ sessionId, userId, isTyping }` |
| `proactive_chat:ended` | server → both | `{ sessionId, endedAt, endedBy }` |
| `proactive_chat:converted` | server → agent | `{ sessionId, ticketId }` |

### Durum Makinesi

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
          ┌──────────────┼──────────────┐
          │              │              │
     accept()        decline()    timeout(120s)
          │              │              │
          ▼              ▼              ▼
       ┌──────┐     ┌─────────┐   ┌────────┐
       │ACTIVE│     │DECLINED │   │ MISSED │
       └──┬───┘     └─────────┘   └────────┘
          │
     end() veya
     disconnect(60s)
          │
          ▼
       ┌──────┐
       │ENDED │
       └──────┘
```

Terminal durumlar: `ENDED`, `DECLINED`, `MISSED` — bu durumlardan geçiş yapılamaz.

### Timeout Mekanizması

**PENDING → MISSED (120s):**
1. `createSession()` çağrısında BullMQ'ya `pending-timeout` job'u eklenir (delay: 120000ms, jobId: `pct-{sessionId}`)
2. Müşteri kabul/red ederse job iptal edilir (`queue.remove(jobId)`)
3. Job tetiklenirse: `status = MISSED`, ajan'a `proactive_chat:missed` event'i

**ACTIVE → ENDED (60s disconnect):**
1. `handleDisconnect` içinde kullanıcının aktif oturumları sorgulanır
2. Her aktif oturum için BullMQ'ya `disconnect-timeout` job'u eklenir (delay: 60000ms, jobId: `pcd-{sessionId}-{userId}`)
3. Kullanıcı yeniden bağlanırsa job iptal edilir
4. Job tetiklenirse: `status = ENDED`, `endedAt` set edilir, karşı tarafa `proactive_chat:ended`

### Ticket Dönüşüm Akışı

```
POST /proactive-chat/sessions/:id/convert
  ↓
1. convertedTicketId null kontrolü (409 if not null)
2. Ticket oluştur:
   - subject: "Proaktif Chat - {customerName} - {date}"
   - userId: customerId
   - assignedTo: agentId
   - metadata: { proactiveChatSessionId: sessionId }
3. Tüm ProactiveChatMessage → TicketMessage kopyala
   - message: content
   - senderId: senderId
   - channel: WEB
4. ProactiveChatSession.convertedTicketId = ticket.id
5. proactive_chat:converted → ajana WS event
```

---

## Doğruluk Özellikleri

*Bir özellik (property), sistemin tüm geçerli çalışmalarında doğru olması gereken bir karakteristik veya davranıştır — temelde sistemin ne yapması gerektiğine dair biçimsel bir ifadedir. Özellikler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasında köprü görevi görür.*

### Özellik 1: Oturum Oluşturma Veri Bütünlüğü

*Herhangi bir* geçerli (agentId, customerId) çifti için oturum oluşturulduğunda, sonuçta oluşan `ProactiveChatSession` kaydı `id`, `agentId`, `customerId`, `status`, `createdAt`, `updatedAt` alanlarının tamamını içermeli ve `status` değeri `PENDING` olmalıdır.

**Validates: Requirements 1.1, 1.2**

---

### Özellik 2: Çakışan Oturum Reddi

*Herhangi bir* ajan-müşteri çifti için, aralarında `PENDING` veya `ACTIVE` durumda bir oturum mevcutken yeni oturum oluşturma girişimi `409 Conflict` hatası döndürmeli ve yeni oturum oluşturulmamalıdır.

**Validates: Requirements 1.3**

---

### Özellik 3: Geçersiz Müşteri Reddi

*Herhangi bir* geçersiz veya var olmayan `customerId` için oturum oluşturma girişimi `404 Not Found` hatası döndürmeli ve hiçbir oturum kaydı oluşturulmamalıdır.

**Validates: Requirements 1.5**

---

### Özellik 4: Kabul Durumu Geçişi

*Herhangi bir* `PENDING` durumundaki oturum için `accept()` çağrısı oturum durumunu `ACTIVE` olarak güncellemelidir.

**Validates: Requirements 2.2**

---

### Özellik 5: Red Durumu Geçişi

*Herhangi bir* `PENDING` durumundaki oturum için `decline()` çağrısı oturum durumunu `DECLINED` olarak güncellemelidir.

**Validates: Requirements 2.3**

---

### Özellik 6: Mesaj Kalıcılığı Round-Trip

*Herhangi bir* `ACTIVE` oturumda ve herhangi bir geçerli mesaj içeriği için, mesaj gönderildiğinde `ProactiveChatMessage` kaydı oluşturulmalı ve mesaj geçmişi endpoint'inden alınabilir olmalıdır.

**Validates: Requirements 3.1**

---

### Özellik 7: Mesaj Veri Bütünlüğü

*Herhangi bir* aktif oturumda gönderilen mesaj için, oluşturulan `ProactiveChatMessage` kaydı `id`, `sessionId`, `senderId`, `content`, `createdAt` alanlarının tamamını içermelidir.

**Validates: Requirements 3.3**

---

### Özellik 8: Aktif Olmayan Oturumda Mesaj Reddi

*Herhangi bir* `ACTIVE` olmayan durumda (`PENDING`, `ENDED`, `DECLINED`, `MISSED`) bulunan oturum için mesaj gönderme girişimi `403 Forbidden` hatası döndürmeli ve hiçbir mesaj kaydı oluşturulmamalıdır.

**Validates: Requirements 3.4, 4.2**

---

### Özellik 9: Mesaj Geçmişi Sıralaması

*Herhangi bir* aktif oturum ve herhangi sayıda mesaj için, mesaj geçmişi endpoint'i mesajları `createdAt` değerine göre artan sırada döndürmelidir.

**Validates: Requirements 3.5**

---

### Özellik 10: Sonlandırma Durumu ve Zaman Damgası

*Herhangi bir* `ACTIVE` oturum için `end()` çağrısı oturum durumunu `ENDED` olarak güncellemeli ve `endedAt` alanını null olmayan bir zaman damgasıyla doldurmalıdır.

**Validates: Requirements 4.1**

---

### Özellik 11: Terminal Durum Sonlandırma Reddi

*Herhangi bir* `ENDED`, `DECLINED` veya `MISSED` durumundaki oturum için `end()` çağrısı `409 Conflict` hatası döndürmelidir.

**Validates: Requirements 4.4**

---

### Özellik 12: Ticket Dönüşüm Metadata Bütünlüğü

*Herhangi bir* dönüştürülebilir (`ACTIVE` veya `ENDED`) oturum için ticket dönüşümü, `metadata` alanında `proactiveChatSessionId` içeren bir `Ticket` kaydı oluşturmalıdır.

**Validates: Requirements 5.1**

---

### Özellik 13: Mesaj Kopyalama Tamlığı

*Herhangi bir* N mesaj içeren oturum için ticket dönüşümü, tam olarak N adet `TicketMessage` kaydı oluşturmalıdır.

**Validates: Requirements 5.2**

---

### Özellik 14: Dönüşüm ID Round-Trip

*Herhangi bir* dönüştürülebilir oturum için ticket dönüşümü sonrasında `ProactiveChatSession.convertedTicketId`, oluşturulan `Ticket.id` değerine eşit olmalıdır.

**Validates: Requirements 5.3**

---

### Özellik 15: Tekrar Dönüşüm Reddi

*Herhangi bir* `convertedTicketId` alanı dolu olan oturum için tekrar dönüşüm girişimi `409 Conflict` hatası döndürmelidir.

**Validates: Requirements 5.4**

---

### Özellik 16: Yetkilendirme — Ajan Rolü Zorunluluğu

*Herhangi bir* `agent`, `team-lead`, `department-manager`, `admin`, `super-admin` rolü dışındaki kullanıcı için oturum oluşturma girişimi `403 Forbidden` hatası döndürmelidir.

**Validates: Requirements 9.1**

---

### Özellik 17: Yetkilendirme — Oturum Erişim İzolasyonu

*Herhangi bir* oturum için, o oturumun `agentId` veya `customerId` alanında kayıtlı olmayan bir kullanıcının mesaj geçmişine erişim girişimi `403 Forbidden` hatası döndürmelidir.

**Validates: Requirements 9.2, 9.5**

---

## Hata Yönetimi

### HTTP Hata Kodları

| Durum | HTTP Kodu | Açıklama |
|---|---|---|
| Geçersiz customerId | 404 | CustomerProfile bulunamadı |
| Çakışan oturum | 409 | PENDING/ACTIVE oturum zaten var |
| Yetkisiz erişim | 403 | Rol veya oturum sahipliği kontrolü başarısız |
| Terminal durumda işlem | 409 | ENDED/DECLINED/MISSED oturumda end() çağrısı |
| Tekrar dönüşüm | 409 | convertedTicketId zaten dolu |
| Aktif olmayan oturumda mesaj | 403 | ACTIVE olmayan oturumda mesaj gönderimi |

### Hata Senaryoları ve Çözümleri

**Müşteri çevrimdışı:** `proactive_chat:incoming` gönderilemezse kalıcı `Notification` kaydı oluşturulur. Oturum `PENDING` kalır; müşteri bağlandığında bildirimi görür.

**BullMQ job başarısız:** Job 3 kez retry edilir (exponential backoff). Tüm retry'lar başarısız olursa oturum `PENDING`/`ACTIVE` kalır — manuel müdahale gerekir. Hata loglanır.

**Ticket dönüşümü kısmi başarısız:** `TicketMessage` kopyalama transaction içinde yapılır. Herhangi bir adım başarısız olursa tüm işlem geri alınır; `convertedTicketId` güncellenmez.

**Eşzamanlı kabul/red:** `ProactiveChatSession.status` güncellemesi optimistic locking ile korunur. İlk gelen istek kazanır; ikincisi `409` alır.

**WebSocket bağlantı kaybı:** `handleDisconnect` tetiklendiğinde kullanıcının aktif oturumları Redis'ten sorgulanır. Her oturum için 60s BullMQ job set edilir. Yeniden bağlantıda job iptal edilir.

---

## Test Stratejisi

### Birim Testleri

`ProactiveChatService` için örnek tabanlı testler:
- DND ajanlı oturum oluşturma başarılı olur
- Çevrimdışı müşteri için `Notification` kaydı oluşturulur
- Typing event'i `ProactiveChatMessage` kaydı oluşturmaz
- Ticket dönüşümü mevcut ticket'ların `chatStatus` alanını değiştirmez

### Özellik Tabanlı Testler (Property-Based Tests)

**Kütüphane:** `fast-check` (TypeScript/Jest ekosistemi ile uyumlu)  
**Minimum iterasyon:** Her özellik için 100 çalıştırma  
**Etiket formatı:** `Feature: proactive-chat, Property {N}: {property_text}`

Her özellik (1–17) için bir property-based test yazılır. Örnek:

```typescript
// Özellik 6: Mesaj Kalıcılığı Round-Trip
it('Feature: proactive-chat, Property 6: message persistence round-trip', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 1000 }),
      async (content) => {
        const session = await createActiveSession();
        await service.sendMessage(session.id, session.agentId, content);
        const messages = await service.getMessages(session.id, session.agentId);
        return messages.some(m => m.content === content);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Entegrasyon Testleri

- PENDING → MISSED timeout akışı (kısa TTL ile)
- ACTIVE → ENDED disconnect timeout akışı
- WebSocket event iletimi (mock socket.io server)
- BullMQ job iptal (kabul/red sonrası)

### Bileşen Testleri (Frontend)

- `ProactiveChatInvite`: ajan adı, avatar, butonlar render edilir
- `ProactiveChatWindow`: mesaj listesi, input, gönder butonu render edilir
- `ProactiveChatPendingBadge`: bekleme durumu gösterilir
- Çoklu sekme: `BroadcastChannel` ile tek davet garantisi
