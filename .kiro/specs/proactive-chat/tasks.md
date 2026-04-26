# Görev Listesi — Proaktif Chat

## Görevler

- [x] 1. Prisma Schema ve Veritabanı Migrasyonu
  - [x] 1.1 `ProactiveChatStatus` ve `ProactiveChatInitiatorType` enum'larını schema.prisma'ya ekle
  - [x] 1.2 `ProactiveChatSession` modelini schema.prisma'ya ekle (tüm alanlar, index'ler, ilişkiler)
  - [x] 1.3 `ProactiveChatMessage` modelini schema.prisma'ya ekle (tüm alanlar, index'ler, ilişkiler)
  - [x] 1.4 `User` modeline `proactiveChatAsAgent`, `proactiveChatAsCustomer`, `proactiveChatMessages` ilişkilerini ekle
  - [x] 1.5 `CustomerProfile` modeline `isVip Boolean @default(false)` alanını ekle
  - [x] 1.6 Prisma migration oluştur ve uygula (`prisma migrate dev`)
  - [x] 1.7 Prisma client'ı yeniden oluştur (`prisma generate`)

- [x] 2. Backend — ProactiveChatModule İskeleti
  - [x] 2.1 `apps/backend/src/proactive-chat/` dizinini oluştur
  - [x] 2.2 `proactive-chat.module.ts` oluştur (imports: NotificationsModule forwardRef, PrismaModule, RedisModule, BullModule queue kaydı)
  - [x] 2.3 `proactive-chat.controller.ts` oluştur (tüm endpoint stub'ları, JWT guard, rol guard)
  - [x] 2.4 `proactive-chat.service.ts` oluştur (tüm method stub'ları)
  - [x] 2.5 `proactive-chat-timeout.processor.ts` oluştur (BullMQ processor stub)
  - [x] 2.6 `ProactiveChatModule`'ü `app.module.ts`'e import et
  - [x] 2.7 DTO'ları oluştur: `CreateSessionDto`, `SendMessageDto`

- [x] 3. Backend — Oturum Yönetimi (CRUD)
  - [x] 3.1 `createSession()` implement et: CustomerProfile kontrolü (404), çakışan oturum kontrolü (409), `ProactiveChatSession` oluştur (PENDING), BullMQ `pending-timeout` job ekle (120s), `proactive_chat:incoming` WS event gönder, müşteri çevrimdışıysa `Notification` kaydı oluştur
  - [x] 3.2 `acceptSession()` implement et: oturum sahipliği kontrolü, PENDING kontrolü, status → ACTIVE güncelle, BullMQ job iptal et, `proactive_chat:accepted` her iki tarafa gönder
  - [x] 3.3 `declineSession()` implement et: oturum sahipliği kontrolü, PENDING kontrolü, status → DECLINED güncelle, BullMQ job iptal et, `proactive_chat:declined` ajana gönder
  - [x] 3.4 `endSession()` implement et: oturum sahipliği kontrolü (agent veya customer), terminal durum kontrolü (409), status → ENDED, `endedAt` set et, `proactive_chat:ended` karşı tarafa gönder
  - [x] 3.5 `listSessions()` implement et: ajan için kendi oturumları, müşteri için kendi oturumları

- [x] 4. Backend — Mesajlaşma
  - [x] 4.1 `sendMessage()` implement et: oturum sahipliği kontrolü, ACTIVE durum kontrolü (403), `ProactiveChatMessage` oluştur, `proactive_chat:message` karşı tarafa gönder
  - [x] 4.2 `getMessages()` implement et: oturum sahipliği kontrolü (403), `createdAt` artan sırada mesajları döndür
  - [x] 4.3 `NotificationsGateway`'e `proactive_chat:join` handler ekle (oturum odasına katıl: `proactive_chat:{sessionId}`)
  - [x] 4.4 `NotificationsGateway`'e `proactive_chat:leave` handler ekle
  - [x] 4.5 `NotificationsGateway`'e `proactive_chat:typing` handler ekle (persist etmeden karşı tarafa ilet)

- [x] 5. Backend — Timeout Mekanizması
  - [x] 5.1 `ProactiveChatTimeoutProcessor`'ı implement et: `pending-timeout` job handler (PENDING → MISSED, `proactive_chat:missed` ajana)
  - [x] 5.2 `ProactiveChatTimeoutProcessor`'a `disconnect-timeout` job handler ekle (ACTIVE → ENDED, `proactive_chat:ended` karşı tarafa)
  - [x] 5.3 `NotificationsGateway.handleDisconnect`'e proaktif chat disconnect logic ekle: kullanıcının aktif oturumlarını sorgula, her biri için BullMQ `disconnect-timeout` job ekle (60s)
  - [x] 5.4 `NotificationsGateway.handleConnection`'a yeniden bağlantı logic ekle: bekleyen `disconnect-timeout` job'larını iptal et

- [x] 6. Backend — Ticket Dönüşümü
  - [x] 6.1 `convertToTicket()` implement et: `convertedTicketId` null kontrolü (409), `Ticket` oluştur (subject, userId, assignedTo, metadata), tüm `ProactiveChatMessage`'ları `TicketMessage` olarak kopyala (transaction içinde), `convertedTicketId` güncelle, `proactive_chat:converted` ajana gönder
  - [x] 6.2 Dönüşümün mevcut ticket'ların `chatStatus` alanını etkilemediğini doğrula

- [x] 7. Backend — Yetkilendirme
  - [x] 7.1 `ProactiveChatController`'a ajan rolü guard'ı ekle (oturum oluşturma: admin, super-admin, department-manager, team-lead, agent)
  - [x] 7.2 `ProactiveChatService`'e oturum sahipliği kontrolü ekle (mesaj gönderme, geçmiş okuma: sadece agentId veya customerId)
  - [x] 7.3 Müşteri izolasyonu: müşteri sadece kendi oturumlarına erişebilir (403 otherwise)

- [x] 8. Backend — Birim ve Özellik Testleri
  - [x] 8.1 `fast-check` bağımlılığını backend'e ekle
  - [x] 8.2 Özellik 1 testi: oturum oluşturma veri bütünlüğü (tüm alanlar mevcut, status=PENDING)
  - [x] 8.3 Özellik 2 testi: çakışan oturum reddi (PENDING/ACTIVE varken 409)
  - [x] 8.4 Özellik 3 testi: geçersiz customerId için 404
  - [x] 8.5 Özellik 4 testi: PENDING → ACTIVE geçişi
  - [x] 8.6 Özellik 5 testi: PENDING → DECLINED geçişi
  - [x] 8.7 Özellik 6 testi: mesaj kalıcılığı round-trip
  - [x] 8.8 Özellik 7 testi: mesaj veri bütünlüğü (tüm alanlar mevcut)
  - [x] 8.9 Özellik 8 testi: aktif olmayan oturumda mesaj reddi (403)
  - [x] 8.10 Özellik 9 testi: mesaj geçmişi sıralaması (createdAt artan)
  - [x] 8.11 Özellik 10 testi: sonlandırma durumu ve endedAt zaman damgası
  - [x] 8.12 Özellik 11 testi: terminal durumda end() → 409
  - [x] 8.13 Özellik 12 testi: ticket dönüşüm metadata bütünlüğü
  - [x] 8.14 Özellik 13 testi: mesaj kopyalama tamlığı (N mesaj → N TicketMessage)
  - [x] 8.15 Özellik 14 testi: dönüşüm ID round-trip (convertedTicketId = ticket.id)
  - [x] 8.16 Özellik 15 testi: tekrar dönüşüm reddi (409)
  - [x] 8.17 Özellik 16 testi: yetkisiz kullanıcı oturum oluşturma → 403
  - [x] 8.18 Özellik 17 testi: oturum erişim izolasyonu (yabancı kullanıcı → 403)
  - [x] 8.19 Birim testi: DND ajanlı oturum oluşturma başarılı olur
  - [x] 8.20 Birim testi: çevrimdışı müşteri için Notification kaydı oluşturulur
  - [x] 8.21 Birim testi: typing event ProactiveChatMessage kaydı oluşturmaz
  - [x] 8.22 Birim testi: ticket dönüşümü mevcut ticket'ların chatStatus'unu değiştirmez

- [x] 9. Frontend — API İstemcisi
  - [x] 9.1 `apps/frontend/src/lib/api.ts`'e `proactiveChat` namespace'ini ekle (tüm endpoint'ler: createSession, acceptSession, declineSession, endSession, sendMessage, getMessages, convertToTicket, listSessions)

- [x] 10. Frontend — ProactiveChatInvite Bileşeni
  - [x] 10.1 `apps/frontend/src/components/proactive-chat/ProactiveChatInvite.tsx` oluştur
  - [x] 10.2 `proactive_chat:incoming` WS event dinleyicisi ekle (useEffect + getSocket())
  - [x] 10.3 Sağ alt köşede sabit konumlu kart render et (ajan adı, avatar, "Kabul Et" / "Reddet" butonları)
  - [x] 10.4 120s geri sayım göstergesi ekle
  - [x] 10.5 Çoklu sekme koruması: `localStorage` + `BroadcastChannel` ile aynı daveti tek sekmede göster
  - [x] 10.6 "Kabul Et" → `api.proactiveChat.acceptSession()` çağır, `ProactiveChatWindow`'a geç
  - [x] 10.7 "Reddet" → `api.proactiveChat.declineSession()` çağır, bileşeni kapat

- [x] 11. Frontend — ProactiveChatWindow Bileşeni
  - [x] 11.1 `apps/frontend/src/components/proactive-chat/ProactiveChatWindow.tsx` oluştur
  - [x] 11.2 Mesaj geçmişini yükle (`api.proactiveChat.getMessages()`)
  - [x] 11.3 `proactive_chat:message` WS event dinleyicisi ekle (yeni mesajları listeye ekle)
  - [x] 11.4 Mesaj input alanı ve gönder butonu implement et
  - [x] 11.5 `proactive_chat:typing` event gönder/dinle (yazma göstergesi)
  - [x] 11.6 `proactive_chat:ended` event dinleyicisi: salt okunur moda geç, bildirim göster
  - [x] 11.7 Ajan tarafında "Ticket'a Dönüştür" butonu ekle (`api.proactiveChat.convertToTicket()`)
  - [x] 11.8 Ajan tarafında "Sonlandır" butonu ekle (`api.proactiveChat.endSession()`)

- [x] 12. Frontend — ProactiveChatPendingBadge Bileşeni
  - [x] 12.1 `apps/frontend/src/components/proactive-chat/ProactiveChatPendingBadge.tsx` oluştur
  - [x] 12.2 Müşteri adı ve bekleme süresi göster
  - [x] 12.3 `proactive_chat:accepted` event dinleyicisi: `ProactiveChatWindow`'a geç
  - [x] 12.4 `proactive_chat:declined` event dinleyicisi: toast göster, badge'i kapat
  - [x] 12.5 `proactive_chat:missed` event dinleyicisi: toast göster, badge'i kapat

- [x] 13. Frontend — ActiveSessionsPanel Bileşeni
  - [x] 13.1 `apps/frontend/src/components/proactive-chat/ActiveSessionsPanel.tsx` oluştur
  - [x] 13.2 `api.proactiveChat.listSessions()` ile aktif oturumları listele
  - [x] 13.3 Her satır: müşteri adı, başlangıç zamanı, durum badge'i
  - [x] 13.4 Satıra tıklanınca `ProactiveChatWindow` aç

- [x] 14. Frontend — Müşteri Listesi Entegrasyonu
  - [x] 14.1 `apps/frontend/src/app/[locale]/(dashboard)/customers/page.tsx`'e "Proaktif Chat Başlat" butonunu müşteri satır aksiyonlarına ekle
  - [x] 14.2 Butona tıklanınca `api.proactiveChat.createSession(customerId)` çağır
  - [x] 14.3 Başarılı yanıtta `ProactiveChatPendingBadge` göster

- [x] 15. Frontend — Global WS Entegrasyonu
  - [x] 15.1 `ProactiveChatInvite` bileşenini müşteri layout'una ekle (sadece customer rolü için)
  - [x] 15.2 `ActiveSessionsPanel` bileşenini ajan dashboard layout'una ekle (sadece agent/admin rolleri için)
