# Requirements Document

## Introduction

Bu belge, `aluplan-support-desk-v02` projesindeki ticket detay sayfalarına rich text editör entegrasyonunu tanımlar. Şu anda hem admin hem de customer tarafındaki mesaj/yorum giriş alanları plain text yapısındadır; bu durum iki kritik soruna yol açmaktadır:

1. Kullanıcılar bold, italic, liste, başlık gibi biçimlendirme özelliklerini kullanamıyor.
2. AI (ANN/Copilot) tarafından otomatik üretilen uzun taslak metinler hiçbir biçimlendirme olmadan tek blok olarak geliyor ve okunması çok zor.

TipTap kütüphanesi (`@tiptap/react ^3.20.0`) zaten `package.json`'da kurulu olup bu özellik için temel alınacaktır. `dompurify` da mevcut olup XSS koruması için kullanılacaktır.

**Etkilenen alanlar:**
- Admin ticket detay sayfası (`/[locale]/(dashboard)/tickets/[id]/page.tsx`) — mesaj giriş alanı
- Customer ticket detay sayfası (aynı sayfa, `isCustomer` rolüne göre) — mesaj giriş alanı
- AI Copilot tarafından üretilen taslak metinlerin (`handleDraft`) yerleştirildiği ve render edildiği alanlar

## Glossary

- **RichTextEditor**: TipTap tabanlı, bold/italic/liste/başlık gibi temel biçimlendirme özelliklerini destekleyen yeniden kullanılabilir React bileşeni.
- **RichTextRenderer**: Veritabanından gelen HTML içeriği güvenli şekilde render eden salt okunur React bileşeni.
- **ContentSanitizer**: DOMPurify kullanarak HTML içeriği XSS saldırılarına karşı temizleyen yardımcı fonksiyon.
- **ContentFormat**: Bir mesaj içeriğinin formatını tanımlayan değer kümesi — `HTML`, `MARKDOWN`, `PLAIN_TEXT`.
- **TicketMessage**: Veritabanındaki `ticket_messages` tablosuna karşılık gelen model; `message` alanı mesaj içeriğini tutar.
- **AiCopilotService**: AI tarafından taslak yanıt üreten backend servisi.
- **AddMessageDto**: Ticket'a mesaj eklemek için kullanılan NestJS DTO'su.
- **MacroPicker**: Mevcut makro seçici bileşeni; seçilen içeriği editöre enjekte eder.
- **isCustomer**: Kullanıcının customer veya viewer rolünde olup olmadığını belirleyen frontend mantığı.
- **Toolbar**: RichTextEditor içindeki biçimlendirme araç çubuğu (bold, italic, liste, başlık butonları).
- **markdownToHtml**: Markdown formatındaki metni HTML'e dönüştüren yardımcı fonksiyon.

## Requirements

### Requirement 1: Temel Rich Text Editör Bileşeni

**User Story:** As a destek temsilcisi veya müşteri, I want mesaj yazarken bold, italic, sıralı/sırasız liste ve başlık gibi biçimlendirme özelliklerini kullanmak, so that daha okunabilir ve yapılandırılmış mesajlar gönderebilirim.

#### Acceptance Criteria

1. THE `RichTextEditor` SHALL TipTap kütüphanesi (`@tiptap/react`, `@tiptap/starter-kit`) kullanarak oluşturulmuş, yeniden kullanılabilir bir React bileşeni olarak `apps/frontend/src/components/ui/rich-text-editor.tsx` dosyasında tanımlanmış olmalıdır.
2. THE `RichTextEditor` SHALL en az şu biçimlendirme özelliklerini destekleyen bir `Toolbar` içermelidir: Bold, Italic, Sırasız Liste (bullet list), Sıralı Liste (ordered list), Başlık H2, Başlık H3.
3. WHEN kullanıcı `Toolbar`'daki bir biçimlendirme butonuna tıkladığında, THE `RichTextEditor` SHALL seçili metne veya imlecin bulunduğu konuma ilgili biçimlendirmeyi 100ms içinde uygulamalıdır.
4. THE `RichTextEditor` SHALL `value` (string — HTML içerik) ve `onChange` (yeni HTML içeriğini string olarak döndüren callback) prop'larını kabul etmelidir; `value` prop'u dışarıdan değiştiğinde editör içeriği güncellenmelidir (controlled component).
5. THE `RichTextEditor` SHALL `placeholder` prop'unu desteklemeli ve `@tiptap/extension-placeholder` kullanarak boş editörde placeholder metni göstermelidir.
6. IF `disabled` prop'u `true` olarak verilirse, THEN THE `RichTextEditor` SHALL `Toolbar` butonlarını görsel olarak devre dışı (opacity-50, cursor-not-allowed) göstermeli, tıklamaları yoksaymalı ve editör içeriğini düzenlenemez hale getirmelidir.
7. THE `RichTextEditor` SHALL projenin endüstriyel karanlık temasıyla uyumlu görünüme sahip olmalıdır: Charcoal/Steel Gray arka plan, border-border/40 kenarlık, muted-foreground placeholder rengi.
8. WHEN `RichTextEditor` bileşeni unmount edildiğinde, THE `RichTextEditor` SHALL TipTap editör instance'ı üzerinde `destroy()` çağırmalıdır.
9. WHEN `value` prop'u dışarıdan değiştiğinde ve yeni değer editörün mevcut HTML çıktısından farklıysa, THE `RichTextEditor` SHALL editör içeriğini yeni değerle güncellemeli ve imleç konumunu korumaya çalışmalıdır.

### Requirement 2: Admin Ticket Detay Sayfasında Editör Entegrasyonu

**User Story:** As a destek temsilcisi, I want ticket detay sayfasındaki mesaj giriş alanında rich text editörü kullanmak, so that müşterilere daha profesyonel ve okunabilir yanıtlar gönderebilirim.

#### Acceptance Criteria

1. WHEN admin kullanıcı ticket detay sayfasını açtığında, THE `TicketDetailPage` SHALL mevcut `Textarea` bileşeni yerine `RichTextEditor` bileşenini mesaj giriş alanı olarak göstermelidir.
2. WHEN admin kullanıcı `RichTextEditor`'da Enter tuşuna bastığında (Shift+Enter olmadan), THE `RichTextEditor` SHALL yeni paragraf oluşturmalı ve `handleSendReply` tetiklenmemelidir.
3. WHEN admin kullanıcı Ctrl+Enter (veya Cmd+Enter) tuş kombinasyonuna bastığında ve gönder butonu etkin durumdaysa, THE `TicketDetailPage` SHALL `handleSendReply` fonksiyonunu tetikleyerek mesajı göndermelidir.
4. WHEN `handleDraft` fonksiyonu AI tarafından üretilen taslak metni döndürdüğünde, THE `TicketDetailPage` SHALL bu metni `markdownToHtml` ile dönüştürüp `RichTextEditor`'ın mevcut içeriğini bu HTML ile değiştirmelidir.
5. WHEN `MacroPicker`'dan bir makro seçildiğinde, THE `TicketDetailPage` SHALL makro içeriğini mevcut editör içeriğinin sonuna HTML olarak eklemeli ve editör odağını korumalıdır.
6. WHEN admin kullanıcı gönder butonuna tıkladığında, THE `TicketDetailPage` SHALL `RichTextEditor`'dan alınan HTML içeriği `ContentSanitizer` ile temizlemeli; sanitizasyon sonucu boş string ise gönderme işlemini iptal etmelidir.
7. WHEN `RichTextEditor` içeriği boş olduğunda (`<p></p>` veya `<p><br></p>` gibi yalnızca boş yapılar içerdiğinde), THE `TicketDetailPage` SHALL gönder butonunu devre dışı bırakmalıdır.

### Requirement 3: Customer Ticket Detay Sayfasında Editör Entegrasyonu

**User Story:** As a müşteri, I want destek talebi detay sayfasında mesaj yazarken temel biçimlendirme özelliklerini kullanmak, so that sorunumu daha net ifade edebilirim.

#### Acceptance Criteria

1. WHEN `isCustomer` değeri `true` olan kullanıcı ticket detay sayfasını açtığında, THE `TicketDetailPage` SHALL customer kullanıcıya da `RichTextEditor` bileşenini göstermelidir.
2. THE `RichTextEditor` SHALL customer arayüzünde admin arayüzüyle aynı altı `Toolbar` özelliğini sunmalıdır: Bold, Italic, Sırasız Liste, Sıralı Liste, Başlık H2, Başlık H3.
3. WHEN customer kullanıcı Ctrl+Enter (veya Cmd+Enter) tuş kombinasyonuna bastığında ve gönder butonu etkin durumdaysa, THE `TicketDetailPage` SHALL `handleSendReply` fonksiyonunu tetikleyerek mesajı göndermelidir.
4. WHEN ticket durumu `CLOSED`, `RESOLVED` veya `PENDING_CUSTOMER_REVIEW` olduğunda, THE `RichTextEditor` SHALL `disabled={true}` prop'u ile devre dışı bırakılmalı; editör görünür kalmalı, mevcut içerik salt okunur modda gösterilmeli ve gönder butonu gizlenmelidir.

### Requirement 4: HTML İçerik Sanitizasyonu

**User Story:** As a sistem yöneticisi, I want kullanıcıların girdiği rich text içeriğinin XSS saldırılarına karşı korunmasını, so that sistemin güvenliği tehlikeye girmez.

#### Acceptance Criteria

1. THE `ContentSanitizer` SHALL DOMPurify kullanarak HTML içeriği temizleyen bir modül olarak `apps/frontend/src/lib/content-sanitizer.ts` dosyasında tanımlanmalıdır.
2. THE `ContentSanitizer` SHALL yalnızca şu HTML taglarına izin vermelidir: `p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `h2`, `h3`, `a` (yalnızca `href` ve `target` attribute'larıyla; `href` değeri `javascript:` ile başlıyorsa kaldırılmalı, `target` attribute'u varsa `rel="noopener noreferrer"` eklenmelidir), `blockquote`, `code`, `pre`.
3. THE `ContentSanitizer` SHALL `script`, `iframe`, `object`, `embed`, `form`, `input` taglarını ve tüm `on*` event attribute'larını (örn. `onclick`, `onerror`) kaldırmalıdır.
4. THE `ContentSanitizer` SHALL idempotent olmalıdır: herhangi bir geçerli HTML string `x` için `sanitize(sanitize(x))` değeri `sanitize(x)` ile eşit olmalıdır.
5. IF `ContentSanitizer`'a boş string, `null` veya `undefined` değeri verilirse, THEN THE `ContentSanitizer` SHALL boş string döndürmelidir.
6. THE backend `AddMessageDto` SHALL NestJS pipeline'ında bir `SanitizeHtmlPipe` aracılığıyla `message` alanını sanitize etmeli ve `message` alanı en fazla 10.000 karakter uzunluğunda olmalıdır.

### Requirement 5: Rich Text İçerik Render Bileşeni

**User Story:** As a destek temsilcisi veya müşteri, I want mesaj geçmişinde gönderilen rich text mesajların biçimlendirmesiyle birlikte görüntülenmesini, so that mesajları okunabilir şekilde okuyabilirim.

#### Acceptance Criteria

1. THE `RichTextRenderer` SHALL HTML içeriği güvenli şekilde render eden, salt okunur bir React bileşeni olarak `apps/frontend/src/components/ui/rich-text-renderer.tsx` dosyasında tanımlanmalıdır.
2. THE `RichTextRenderer` SHALL her render'da `ContentSanitizer.sanitize()` fonksiyonunu çağırmalı ve temizlenmiş HTML'i `dangerouslySetInnerHTML` ile render etmelidir.
3. THE `RichTextRenderer` SHALL render edilen HTML içeriğine projenin endüstriyel karanlık temasıyla uyumlu Tailwind CSS stilleri uygulamalıdır: `strong` için `font-bold`, `em` için `italic`, `ul` için `list-disc ml-4`, `ol` için `list-decimal ml-4`, `h2` için `text-lg font-semibold`, `h3` için `text-base font-semibold`.
4. IF `RichTextRenderer`'a boş string, `null` veya `undefined` değeri verilirse, THEN THE `RichTextRenderer` SHALL `null` döndürmeli (hiçbir DOM elementi render etmemelidir).
5. THE `TicketDetailPage` SHALL mesaj geçmişindeki her mesajı render ederken `{msg.message}` yerine `<RichTextRenderer content={msg.message} />` kullanmalıdır.
6. THE `TicketDetailPage` SHALL ticket'ın ilk açıklama metnini (`ticket.description`) da `<RichTextRenderer>` ile render etmelidir.

### Requirement 6: İçerik Formatı Uyumluluğu (Geriye Dönük)

**User Story:** As a sistem yöneticisi, I want veritabanında mevcut plain text mesajların yeni rich text sistemiyle birlikte sorunsuz çalışmasını, so that geçmiş mesajlar bozulmaz.

#### Acceptance Criteria

1. IF `RichTextRenderer`'a verilen string `<` karakteri ve ardından geçerli bir HTML tag adı (`p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `h2`, `h3`, `a`, `blockquote`, `code`, `pre`) içermiyorsa, THEN THE `RichTextRenderer` SHALL bu içeriği plain text olarak kabul edip `<p>` tagına sararak render etmelidir.
2. WHEN `RichTextRenderer`'a plain text olarak tespit edilen bir string verildiğinde, THE `RichTextRenderer` SHALL içeriği `<p>` tagına sarmadan önce `ContentSanitizer.sanitize()` çağırmalıdır.
3. THE `AddMessageDto` SHALL `contentFormat` alanını opsiyonel olarak kabul etmeli; bu alan yalnızca `'HTML'`, `'MARKDOWN'` veya `'PLAIN_TEXT'` değerlerinden birini alabilmeli; geçersiz bir değer verildiğinde 400 Bad Request döndürmelidir; belirtilmediğinde varsayılan değer `'PLAIN_TEXT'` olmalıdır.
4. THE `TicketMessage` Prisma modeli SHALL `contentFormat` alanını `String?` tipinde opsiyonel bir alan olarak içermelidir; migration mevcut satırları etkilemeden `null` varsayılan değeriyle eklenmelidir.
5. WHEN `RichTextRenderer` veritabanından `contentFormat` değeri `null` olan bir mesaj aldığında, THE `RichTextRenderer` SHALL bu mesajı `'PLAIN_TEXT'` formatında işlemelidir.

### Requirement 7: AI Copilot Taslak Metinlerinin Biçimlendirilmesi

**User Story:** As a destek temsilcisi, I want AI Copilot tarafından üretilen taslak yanıtların biçimlendirmesiyle birlikte editörde görünmesini, so that uzun AI çıktılarını kolayca okuyabilir ve düzenleyebilirim.

#### Acceptance Criteria

1. THE `AiCopilotService` SHALL ürettiği taslak metni `## 📌 Sorun Yorumu`, `## 🎯 En Olası Neden`, `## 🛠️ Çözüm Adımları` başlıklarını içeren Markdown formatında döndürmelidir.
2. WHEN `handleDraft` fonksiyonu AI tarafından üretilen taslak metni aldığında, THE `TicketDetailPage` SHALL bu Markdown içeriği `markdownToHtml` ile dönüştürmeli ve sonuç HTML editör içerik alanında görünür olmalıdır.
3. THE `markdownToHtml` fonksiyonu SHALL en az şu Markdown yapılarını HTML'e dönüştürmelidir: `##` başlıkları → `<h2>`, `###` başlıkları → `<h3>`, `**text**` → `<strong>`, `*text*` → `<em>`, `- item` → `<ul><li>`, `1. item` → `<ol><li>`, boş satırla ayrılmış bloklar → `<p>`, tek satır sonu → `<br>`.
4. THE `markdownToHtml` fonksiyonu SHALL dönüştürme sonrasında `ContentSanitizer.sanitize()` çağırmalıdır.
5. THE `markdownToHtml` fonksiyonu SHALL idempotent sanitizasyon üretmelidir: herhangi bir geçerli Markdown string `m` için `ContentSanitizer.sanitize(markdownToHtml(m))` değeri `markdownToHtml(m)` ile eşit olmalıdır.
6. IF `markdownToHtml`'e boş string, `null` veya `undefined` değeri verilirse, THEN THE fonksiyon SHALL boş string döndürmelidir.

### Requirement 8: Erişilebilirlik ve Klavye Navigasyonu

**User Story:** As a klavye kullanıcısı veya ekran okuyucu kullanan kullanıcı, I want rich text editörü klavye ile tam olarak kullanabilmek, so that erişilebilirlik standartlarına uygun bir deneyim yaşarım.

#### Acceptance Criteria

1. THE `RichTextEditor` SHALL `aria-label` prop'unu desteklemeli ve TipTap editör container'ına `role="textbox"` ve `aria-multiline="true"` attribute'larını uygulamalıdır.
2. THE `Toolbar` içindeki her biçimlendirme butonu SHALL `aria-label` attribute'u içermelidir (örn. `aria-label="Kalın"`, `aria-label="İtalik"`).
3. THE `Toolbar` içindeki her biçimlendirme butonu SHALL aktif biçimlendirme durumunu `aria-pressed` attribute'u ile belirtmelidir.
4. WHEN kullanıcı Tab tuşuyla `Toolbar` butonları arasında gezindiğinde, THE `RichTextEditor` SHALL odaklanmış buton üzerinde en az 2px kalınlığında, komşu arka plana karşı en az 3:1 kontrast oranına sahip `:focus-visible` outline göstermelidir (WCAG 2.1 AA SC 1.4.11).
5. THE `RichTextEditor` SHALL `Toolbar` butonları için metin ve arka plan arasında en az 4.5:1 kontrast oranı sağlamalıdır; focus ring dahil tüm görsel göstergeler bu oranı karşılamalıdır.
6. THE `Toolbar` SHALL Tab tuşuyla soldan sağa sırayla (Bold → Italic → Sırasız Liste → Sıralı Liste → H2 → H3) odaklanabilir olmalı; son butonda Tab'a basıldığında odak editör içerik alanına geçmelidir.

### Requirement 9: i18n Uyumu

**User Story:** As a çok dilli kullanıcı, I want rich text editörünün arayüz metinlerinin kendi dilimde görünmesini, so that dil tercihimden bağımsız olarak editörü rahatça kullanabilirim.

#### Acceptance Criteria

1. THE `RichTextEditor` SHALL placeholder metnini `placeholder` prop'u üzerinden dışarıdan almalıdır; böylece çağıran bileşen çeviri anahtarını kullanarak prop'u iletebilir.
2. THE `TicketDetailPage` SHALL `RichTextEditor`'a iletilen placeholder metnini `t('tickets.detail.message_placeholder')` çeviri anahtarından almalıdır.
3. THE `Toolbar` butonlarının `aria-label` değerleri SHALL `apps/frontend/messages/tr.json`, `en.json` ve `de.json` dosyalarına şu anahtarlar altında eklenmeli ve `useTranslations` ile kullanılmalıdır: `richTextEditor.toolbar.bold`, `richTextEditor.toolbar.italic`, `richTextEditor.toolbar.bulletList`, `richTextEditor.toolbar.orderedList`, `richTextEditor.toolbar.heading2`, `richTextEditor.toolbar.heading3`.
4. IF `de.json` dosyasında `richTextEditor` anahtarları eksikse, THEN THE sistem SHALL `next-intl`'in `defaultLocale` mekanizması aracılığıyla `tr.json` veya `en.json` değerlerine fallback yapmalıdır.
