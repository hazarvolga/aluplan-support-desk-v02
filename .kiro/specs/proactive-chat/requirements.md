# Gereksinimler Dokümanı — Proaktif Chat

## Giriş

Proaktif Chat, destek ajanlarının müşterilere ticket bağımsız olarak doğrudan chat başlatabildiği bir iletişim kanalıdır. Mevcut Ticket Live Chat sisteminden (chatStatus: NORMAL → REQUESTED → LIVE akışı) tamamen bağımsız çalışır; iki sistem aynı WebSocket altyapısını paylaşır ancak birbirinin veri modellerine dokunmaz.

**Kapsam (Bu Aşama):** Ajan başlatmalı proaktif chat.  
**Sonraki Aşama (Kapsam Dışı):** VIP müşteri başlatmalı chat — ancak altyapı bu akışı destekleyecek şekilde tasarlanmalıdır.

---

## Sözlük

- **Proaktif_Chat_Sistemi**: Bu spec kapsamındaki yeni chat kanalı; ticket bağımsız, ajan başlatmalı.
- **Proaktif_Chat_Oturumu**: Bir ajan ile bir müşteri arasındaki tek bir proaktif chat konuşması. `ProactiveChatSession` DB tablosunda saklanır.
- **Proaktif_Chat_Mesajı**: Bir oturum içinde gönderilen tek bir metin mesajı. `ProactiveChatMessage` DB tablosunda saklanır.
- **Ajan**: `agentStatus` alanı bulunan, `role.name` değeri `admin`, `super-admin`, `department-manager`, `team-lead` veya `agent` olan `User` kaydı.
- **Müşteri**: `CustomerProfile` kaydına sahip, `role.name` değeri `customer` olan `User` kaydı.
- **Çevrimiçi_Ajan**: Redis'te `ws:active:role:{role}` setinde kaydı bulunan ajan.
- **Oturum_Durumu**: `ProactiveChatSession.status` alanının alabileceği değerler: `PENDING` → `ACTIVE` → `ENDED` | `DECLINED` | `MISSED`.
- **Ticket_Live_Chat**: Mevcut `chatStatus` (NORMAL/REQUESTED/LIVE) akışı; bu spec kapsamında değiştirilmez.
- **Bildirim_Gateway**: Mevcut `NotificationsGateway` (`/ws` namespace); proaktif chat event'leri bu gateway üzerinden iletilir.
- **Müşteri_Paneli**: `allplan.net.tr/en/customers` adresindeki müşteri arayüzü.

---

## Gereksinimler

### Gereksinim 1: Proaktif Chat Başlatma

**Kullanıcı Hikayesi:** Bir ajan olarak, müşteri listesinden seçtiğim müşteriye ticket açmadan doğrudan chat başlatmak istiyorum; böylece hızlı, bağlamsal iletişim kurabileyim.

#### Kabul Kriterleri

1. THE Proaktif_Chat_Sistemi SHALL her `ProactiveChatSession` kaydını benzersiz bir `id` (UUID), `agentId`, `customerId`, `status` (`PENDING`), `createdAt` ve `updatedAt` alanlarıyla saklamalıdır.

2. WHEN bir ajan proaktif chat başlatma isteği gönderdiğinde, THE Proaktif_Chat_Sistemi SHALL `status = PENDING` olan bir `ProactiveChatSession` kaydı oluşturmalı ve müşteriye `proactive_chat:incoming` WebSocket event'i göndermelidir.

3. WHEN bir ajan proaktif chat başlatma isteği gönderdiğinde, THE Proaktif_Chat_Sistemi SHALL aynı müşteri ile `status = PENDING` veya `status = ACTIVE` olan başka bir oturum zaten mevcutsa yeni oturum oluşturmayı reddetmeli ve ajana `409 Conflict` hatası döndürmelidir.

4. WHILE bir ajan `agentStatus = DND` durumundayken, THE Proaktif_Chat_Sistemi SHALL o ajanın chat başlatma isteğini kabul etmeli; `agentStatus` kontrolü yalnızca VIP akışı için geçerlidir.

5. IF `customerId` geçersiz veya `CustomerProfile` kaydı bulunamıyorsa, THEN THE Proaktif_Chat_Sistemi SHALL `404 Not Found` hatası döndürmeli ve oturum oluşturmamalıdır.

---

### Gereksinim 2: Müşteri Bildirimi ve Kabul/Red Akışı

**Kullanıcı Hikayesi:** Bir müşteri olarak, bir ajanın bana chat başlattığını anlık bildirim ile görmek ve kabul etmek ya da reddetmek istiyorum.

#### Kabul Kriterleri

1. WHEN müşteri `proactive_chat:incoming` event'ini aldığında, THE Müşteri_Paneli SHALL müşteriye ajanın adını, başlık metnini ve "Kabul Et" / "Reddet" seçeneklerini içeren bir bildirim göstermelidir.

2. WHEN müşteri "Kabul Et" seçeneğini seçtiğinde, THE Proaktif_Chat_Sistemi SHALL oturum `status`'unu `ACTIVE` olarak güncellemeli, hem ajana hem müşteriye `proactive_chat:accepted` WebSocket event'i göndermeli ve her iki tarafta chat arayüzünü açmalıdır.

3. WHEN müşteri "Reddet" seçeneğini seçtiğinde, THE Proaktif_Chat_Sistemi SHALL oturum `status`'unu `DECLINED` olarak güncellemeli ve ajana `proactive_chat:declined` WebSocket event'i göndermelidir.

4. WHEN `proactive_chat:incoming` event'i gönderildikten sonra 120 saniye içinde müşteriden yanıt gelmediğinde, THE Proaktif_Chat_Sistemi SHALL oturum `status`'unu `MISSED` olarak güncellemeli ve ajana `proactive_chat:missed` WebSocket event'i göndermelidir.

5. IF müşteri WebSocket bağlantısı `proactive_chat:incoming` event'i gönderildiği sırada aktif değilse, THEN THE Proaktif_Chat_Sistemi SHALL müşteriye kalıcı bir `Notification` kaydı oluşturmalı ve oturumu `PENDING` durumunda bırakmalıdır.

---

### Gereksinim 3: Gerçek Zamanlı Mesajlaşma

**Kullanıcı Hikayesi:** Bir ajan ve müşteri olarak, aktif proaktif chat oturumunda gerçek zamanlı mesaj alıp göndermek istiyorum.

#### Kabul Kriterleri

1. WHILE oturum `status = ACTIVE` iken, THE Proaktif_Chat_Sistemi SHALL ajan veya müşteriden gelen her mesajı `ProactiveChatMessage` tablosuna kaydetmeli ve karşı tarafa `proactive_chat:message` WebSocket event'i ile iletmelidir.

2. WHILE oturum `status = ACTIVE` iken, THE Proaktif_Chat_Sistemi SHALL kullanıcı yazarken `proactive_chat:typing` event'ini karşı tarafa iletmeli; bu event veritabanına kaydedilmemelidir.

3. THE Proaktif_Chat_Sistemi SHALL her `ProactiveChatMessage` kaydını `id` (UUID), `sessionId`, `senderId`, `content`, `createdAt` alanlarıyla saklamalıdır.

4. IF oturum `status = ACTIVE` değilken mesaj gönderme isteği gelirse, THEN THE Proaktif_Chat_Sistemi SHALL `403 Forbidden` hatası döndürmeli ve mesajı kaydetmemelidir.

5. WHEN bir oturum `status = ACTIVE` olarak güncellendiğinde, THE Proaktif_Chat_Sistemi SHALL oturumun tüm geçmiş mesajlarını `createdAt` sırasına göre döndüren bir endpoint sağlamalıdır.

---

### Gereksinim 4: Oturum Sonlandırma

**Kullanıcı Hikayesi:** Bir ajan veya müşteri olarak, aktif chat oturumunu istediğim zaman sonlandırabilmek istiyorum.

#### Kabul Kriterleri

1. WHEN ajan veya müşteri oturumu sonlandırma isteği gönderdiğinde, THE Proaktif_Chat_Sistemi SHALL oturum `status`'unu `ENDED` olarak güncellemeli, `endedAt` alanını kaydetmeli ve karşı tarafa `proactive_chat:ended` WebSocket event'i göndermelidir.

2. WHEN oturum `ENDED` durumuna geçtiğinde, THE Proaktif_Chat_Sistemi SHALL oturum içindeki tüm mesajları salt okunur olarak saklamalı; yeni mesaj gönderimini reddetmelidir.

3. WHEN ajan veya müşterinin WebSocket bağlantısı `status = ACTIVE` bir oturum sırasında beklenmedik şekilde kesildiğinde, THE Proaktif_Chat_Sistemi SHALL 60 saniye içinde yeniden bağlantı kurulmazsa oturumu `ENDED` olarak işaretlemeli ve karşı tarafa bildirim göndermelidir.

4. IF oturum `status = ENDED`, `DECLINED` veya `MISSED` iken sonlandırma isteği gelirse, THEN THE Proaktif_Chat_Sistemi SHALL `409 Conflict` hatası döndürmelidir.

---

### Gereksinim 5: Ticket'a Dönüştürme

**Kullanıcı Hikayesi:** Bir ajan olarak, proaktif chat oturumunu gerektiğinde bir destek ticket'ına dönüştürmek istiyorum; böylece konuşma kaydı ve takip süreci ticket sistemi üzerinden devam edebilsin.

#### Kabul Kriterleri

1. WHEN ajan aktif veya sonlanmış bir proaktif chat oturumunda "Ticket'a Dönüştür" aksiyonunu tetiklediğinde, THE Proaktif_Chat_Sistemi SHALL yeni bir `Ticket` kaydı oluşturmalı ve oturum `id`'sini ticket'ın `metadata` alanında saklamalıdır.

2. WHEN ticket oluşturulduğunda, THE Proaktif_Chat_Sistemi SHALL oturumdaki tüm mesajları `TicketMessage` kayıtları olarak ticket'a kopyalamalıdır.

3. WHEN ticket oluşturulduğunda, THE Proaktif_Chat_Sistemi SHALL `ProactiveChatSession.convertedTicketId` alanını oluşturulan ticket'ın `id`'si ile güncellemeli ve ajana `proactive_chat:converted` WebSocket event'i göndermelidir.

4. THE Proaktif_Chat_Sistemi SHALL bir oturumun yalnızca bir kez ticket'a dönüştürülmesine izin vermelidir; `convertedTicketId` zaten doluysa `409 Conflict` hatası döndürmelidir.

5. THE Proaktif_Chat_Sistemi SHALL ticket'a dönüştürme işleminin mevcut `Ticket Live Chat` akışını (`chatStatus` alanını) etkilememesini garanti etmelidir; dönüştürme tek yönlü bir köprüdür.

---

### Gereksinim 6: Ajan Tarafı Arayüzü

**Kullanıcı Hikayesi:** Bir ajan olarak, proaktif chat oturumlarını yönetebileceğim, müşteri listesinden chat başlatabileceğim ve aktif oturumları takip edebileceğim bir arayüze ihtiyacım var.

#### Kabul Kriterleri

1. THE Proaktif_Chat_Sistemi SHALL ajan panelinde müşteri listesi üzerinden "Proaktif Chat Başlat" aksiyonunu sunan bir UI bileşeni sağlamalıdır.

2. WHEN ajan "Proaktif Chat Başlat" aksiyonunu tetiklediğinde, THE Proaktif_Chat_Sistemi SHALL ajana oturumun `PENDING` durumda olduğunu gösteren bir bekleme ekranı sunmalıdır.

3. WHEN `proactive_chat:accepted` event'i alındığında, THE Proaktif_Chat_Sistemi SHALL ajan arayüzünde chat penceresini otomatik olarak açmalıdır.

4. THE Proaktif_Chat_Sistemi SHALL ajan panelinde aktif proaktif chat oturumlarını listeleyen bir panel sağlamalıdır; her oturum için müşteri adı, başlangıç zamanı ve oturum durumu gösterilmelidir.

5. WHEN `proactive_chat:declined` veya `proactive_chat:missed` event'i alındığında, THE Proaktif_Chat_Sistemi SHALL ajana toast bildirimi göstermeli ve bekleme ekranını kapatmalıdır.

---

### Gereksinim 7: Müşteri Tarafı Arayüzü

**Kullanıcı Hikayesi:** Bir müşteri olarak, Müşteri Paneli'nde proaktif chat bildirimini görmek ve chat arayüzünü kullanmak istiyorum.

#### Kabul Kriterleri

1. WHEN müşteri `proactive_chat:incoming` event'ini aldığında, THE Müşteri_Paneli SHALL ekranın sağ alt köşesinde ajanın adını ve avatarını içeren bir chat daveti bileşeni göstermelidir.

2. WHEN müşteri "Kabul Et" seçeneğini seçtiğinde, THE Müşteri_Paneli SHALL chat daveti bileşenini chat penceresine dönüştürmeli ve geçmiş mesajları yüklemeli; bu işlem 2 saniye içinde tamamlanmalıdır.

3. WHILE oturum `status = ACTIVE` iken, THE Müşteri_Paneli SHALL müşteriye mesaj gönderme alanı, gönder butonu ve karşı tarafın yazma göstergesini içeren bir chat arayüzü sunmalıdır.

4. WHEN oturum `proactive_chat:ended` event'i ile sonlandığında, THE Müşteri_Paneli SHALL müşteriye oturumun sona erdiğini belirten bir bildirim göstermeli ve chat penceresini salt okunur moda geçirmelidir.

5. WHERE müşteri birden fazla tarayıcı sekmesinde Müşteri_Paneli'ni açık tutuyorsa, THE Müşteri_Paneli SHALL `proactive_chat:incoming` event'ini yalnızca bir kez göstermeli; aynı daveti birden fazla sekmede tekrarlamamalıdır.

---

### Gereksinim 8: Altyapı ve Veri Modeli

**Kullanıcı Hikayesi:** Bir geliştirici olarak, proaktif chat verisinin mevcut sistemden izole, genişletilebilir ve VIP akışını destekleyecek şekilde tasarlanmış olmasını istiyorum.

#### Kabul Kriterleri

1. THE Proaktif_Chat_Sistemi SHALL `ProactiveChatSession` ve `ProactiveChatMessage` tablolarını mevcut `Ticket` ve `TicketMessage` tablolarından bağımsız olarak Prisma schema'ya eklemeli; mevcut tablolara yeni alan eklememeli veya mevcut alanları değiştirmemelidir.

2. THE Proaktif_Chat_Sistemi SHALL proaktif chat WebSocket event'lerini (`proactive_chat:*` prefix'i ile) mevcut `NotificationsGateway` üzerinden iletmeli; ayrı bir gateway oluşturmamalıdır.

3. THE Proaktif_Chat_Sistemi SHALL `ProactiveChatSession` tablosunda `initiatorType` alanını (`AGENT` | `CUSTOMER`) saklayarak VIP müşteri başlatmalı akışın ileride eklenmesine olanak tanımalıdır.

4. THE Proaktif_Chat_Sistemi SHALL `ProactiveChatSession` tablosunda `convertedTicketId` (nullable UUID) alanını saklayarak ticket dönüşüm durumunu takip etmelidir.

5. WHEN Redis'te `ws:active:role:{role}` set sorgusu yapıldığında, THE Proaktif_Chat_Sistemi SHALL mevcut presence mekanizmasını değiştirmeden kullanmalı; proaktif chat için ayrı bir presence altyapısı oluşturmamalıdır.

6. THE Proaktif_Chat_Sistemi SHALL proaktif chat oturumlarına ait tüm REST endpoint'lerini `/proactive-chat` prefix'i altında sunmalı ve mevcut `/tickets` endpoint'leriyle çakışmamalıdır.

---

### Gereksinim 9: Yetkilendirme ve Güvenlik

**Kullanıcı Hikayesi:** Bir sistem yöneticisi olarak, proaktif chat oturumlarının yalnızca yetkili kullanıcılar tarafından başlatılabilmesini ve erişilebilmesini istiyorum.

#### Kabul Kriterleri

1. THE Proaktif_Chat_Sistemi SHALL proaktif chat başlatma yetkisini yalnızca `role.name` değeri `admin`, `super-admin`, `department-manager`, `team-lead` veya `agent` olan kullanıcılara tanımalıdır.

2. THE Proaktif_Chat_Sistemi SHALL bir oturumun mesajlarına yalnızca o oturumun `agentId` veya `customerId` alanında kayıtlı kullanıcıların erişmesine izin vermelidir.

3. IF yetkisiz bir kullanıcı proaktif chat endpoint'ine istek gönderirse, THEN THE Proaktif_Chat_Sistemi SHALL `403 Forbidden` hatası döndürmeli ve isteği işlememelidir.

4. THE Proaktif_Chat_Sistemi SHALL WebSocket üzerinden gelen proaktif chat event'lerini yalnızca mevcut JWT doğrulama mekanizması ile kimliği doğrulanmış bağlantılardan kabul etmelidir.

5. THE Proaktif_Chat_Sistemi SHALL bir müşterinin yalnızca kendi oturumlarına ait mesajlara erişebildiğini garanti etmelidir; başka müşterilerin oturumlarına erişim girişimi `403 Forbidden` ile reddedilmelidir.
