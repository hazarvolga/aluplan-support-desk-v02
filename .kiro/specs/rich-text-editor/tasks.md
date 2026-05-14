# Implementation Plan: Rich Text Editor

## Overview

TipTap tabanlı rich text editör entegrasyonu. Uygulama sırası: önce bağımsız utility katmanı (`ContentSanitizer`, `markdownToHtml`), ardından UI bileşenleri (`RichTextEditor`, `RichTextRenderer`), sonra backend (`SanitizeHtmlPipe`, `AddMessageDto`, Prisma migration), en son `TicketDetailPage` entegrasyonu ve i18n anahtarları.

> **Önemli kısıtlamalar (tüm görevler için geçerli):**
> - Prisma client her zaman `@aluplan/database`'den import edilmeli, asla `@prisma/client`'tan değil.
> - `gitnexus impact` çalıştırılmalı: `AddMessageDto`, `TicketMessage`, `TicketDetailPage` değiştirilmeden önce.
> - `de.json` GAP-12 açık — yeni anahtarlar eklenirken `pnpm i18n:check` ile doğrula.
> - TipTap v3: `useEditor` hook kullanılacak (`EditorProvider` değil).
> - Kullanıcıya yönelik string'ler asla hardcode edilmemeli — `t('key')` kullanılmalı.

---

## Tasks

- [ ] 1. ContentSanitizer modülünü oluştur
  - `apps/frontend/src/lib/content-sanitizer.ts` dosyasını oluştur
  - DOMPurify ile `sanitize(input)` fonksiyonunu implement et: izin verilen tag'lar (`p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `h2`, `h3`, `a`, `blockquote`, `code`, `pre`), izin verilen attribute'lar (`href`, `target`, `rel`)
  - `afterSanitizeAttributes` hook'u ekle: `javascript:` href'leri kaldır, `target` varsa `rel="noopener noreferrer"` ekle
  - `isEffectivelyEmpty(html)` fonksiyonunu implement et: `<p></p>`, `<p><br></p>`, `<p><br/></p>` gibi yapıları boş kabul et
  - SSR güvenliği: `typeof window !== 'undefined'` kontrolü ile server-side'da güvenli fallback (input'u olduğu gibi döndür)
  - `null` / `undefined` input için boş string döndür
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 1.1 ContentSanitizer için property test yaz (`content-sanitizer.pbt.spec.ts`)
    - **Property 1: ContentSanitizer İdempotence** — `sanitize(sanitize(x)) === sanitize(x)` her geçerli HTML string için
    - **Property 2: Tehlikeli Tag Kaldırma** — `script`, `iframe`, `object`, `embed`, `form`, `input` tag'ları ve `on*` event attribute'ları sanitize sonrası mevcut olmamalı
    - fast-check ile rastgele HTML string'leri üret, minimum 100 iterasyon
    - _Validates: Requirements 4.4, 4.2, 4.3_

  - [ ]* 1.2 ContentSanitizer için unit test yaz (`content-sanitizer.spec.ts`)
    - Boş/null/undefined için boş string döndürme
    - `isEffectivelyEmpty` edge case'leri: `<p></p>`, `<p><br></p>`, `<p><br/></p>`, gerçek içerik
    - `javascript:` href kaldırma, `rel` ekleme
    - _Requirements: 4.4, 4.5_

- [ ] 2. markdownToHtml yardımcı fonksiyonunu oluştur
  - `apps/frontend/src/lib/markdown-to-html.ts` dosyasını oluştur
  - Harici Markdown kütüphanesi kullanma — minimal regex tabanlı dönüşüm implement et
  - Dönüşüm sırası: `##` → `<h2>`, `###` → `<h3>`, `**text**` → `<strong>`, `*text*` → `<em>`, ardışık `- item` satırları → `<ul><li>`, ardışık `1. item` satırları → `<ol><li>`, boş satırla ayrılmış bloklar → `<p>`, tek satır sonu → `<br>`
  - Son adım olarak `ContentSanitizer.sanitize(html)` çağır
  - `null` / `undefined` input için boş string döndür
  - _Requirements: 7.3, 7.4, 7.5, 7.6_

  - [ ]* 2.1 markdownToHtml için property test yaz (`markdown-to-html.pbt.spec.ts`)
    - **Property 5: markdownToHtml Sanitizasyon İdempotence** — `ContentSanitizer.sanitize(markdownToHtml(m)) === markdownToHtml(m)` her Markdown string için
    - **Property 6: Yapısal Dönüşüm** — `## başlık` içeren string → çıktı `<h2>` içermeli; `**text**` → `<strong>`; `- item` → `<ul><li>`
    - fast-check ile rastgele Markdown string'leri üret, minimum 100 iterasyon
    - _Validates: Requirements 7.4, 7.5, 7.3_

  - [ ]* 2.2 markdownToHtml için unit test yaz (`markdown-to-html.spec.ts`)
    - Boş/null/undefined için boş string
    - Bilinen AI Copilot çıktı formatı (`## 📌 Sorun Yorumu`, `## 🎯 En Olası Neden`, `## 🛠️ Çözüm Adımları`) için tam dönüşüm örneği
    - _Requirements: 7.3, 7.6_

- [ ] 3. Checkpoint — Utility katmanı hazır
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. RichTextRenderer bileşenini oluştur
  - `apps/frontend/src/components/ui/rich-text-renderer.tsx` dosyasını oluştur
  - `RichTextRendererProps` interface'ini tanımla: `content: string | null | undefined`, `contentFormat?: 'HTML' | 'MARKDOWN' | 'PLAIN_TEXT' | null`, `className?: string`
  - Render mantığını implement et: boş/null/undefined → `null` döndür; `contentFormat === 'PLAIN_TEXT'` veya HTML tag içermiyorsa → `<p>{sanitize(content)}</p>`; aksi halde → `dangerouslySetInnerHTML={{ __html: sanitize(content) }}`
  - Plain text tespiti için `HTML_TAG_PATTERN` regex'ini kullan: `/<(p|br|strong|em|ul|ol|li|h2|h3|a|blockquote|code|pre)\b/i`
  - `contentFormat === null` → `PLAIN_TEXT` olarak işle (geriye dönük uyumluluk)
  - Tailwind CSS stilleri uygula: `strong → font-bold`, `em → italic`, `ul → list-disc ml-4`, `ol → list-decimal ml-4`, `h2 → text-lg font-semibold`, `h3 → text-base font-semibold`, `p → mb-2`, `a → text-primary underline`, `code → font-mono text-xs bg-muted px-1 rounded`, `pre → font-mono text-xs bg-muted p-2 rounded overflow-x-auto`, `blockquote → border-l-2 border-border pl-3 italic text-muted-foreground`
  - Her render'da `ContentSanitizer.sanitize()` çağır
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.5_

  - [ ]* 4.1 RichTextRenderer için property test yaz (`rich-text-renderer.pbt.spec.ts`)
    - **Property 3: RichTextRenderer Sanitizasyon Garantisi** — render edilen içerik her zaman `ContentSanitizer.sanitize(content)` çıktısıyla eşdeğer olmalı
    - **Property 4: Plain Text Sarma** — bilinen HTML tag'larından hiçbirini içermeyen string → `<p>` tag'ına sarılarak render edilmeli
    - fast-check ile rastgele string'ler üret, minimum 100 iterasyon
    - _Validates: Requirements 5.2, 6.1, 6.5_

  - [ ]* 4.2 RichTextRenderer için unit test yaz (`rich-text-renderer.spec.tsx`)
    - Boş/null/undefined için `null` döndürme
    - HTML içerik render ve CSS sınıflarının uygulanması
    - `contentFormat === null` → plain text işleme
    - _Requirements: 5.3, 5.4, 6.5_

- [ ] 5. RichTextEditor bileşenini oluştur
  - `apps/frontend/src/components/ui/rich-text-editor.tsx` dosyasını oluştur
  - `RichTextEditorProps` interface'ini tanımla: `value: string`, `onChange: (html: string) => void`, `placeholder?: string`, `disabled?: boolean`, `aria-label?: string`, `className?: string`, `onSubmit?: () => void`
  - TipTap extension'larını kur: `StarterKit` (Bold, Italic, BulletList, OrderedList, Heading H2/H3, Paragraph, HardBreak), `Link`, `Placeholder`
  - `useEditor` hook'u kullan (TipTap v3 uyumlu)
  - Controlled component davranışı: `value` prop değiştiğinde ve editörün mevcut HTML çıktısından farklıysa `editor.commands.setContent(value, false)` çağır
  - `onChange` callback'ini `editor.on('update')` event'inde `editor.getHTML()` ile tetikle
  - Klavye kısayolları: `Enter` → yeni paragraf (TipTap default), `Shift+Enter` → `<br>`, `Ctrl+Enter` / `Cmd+Enter` → `onSubmit` prop callback'i
  - Unmount'ta `editor.destroy()` çağır
  - `disabled` prop: Toolbar butonlarını `opacity-50 cursor-not-allowed` yap, tıklamaları yoksay, editörü `editable: false` yap
  - Karanlık tema stilleri: Charcoal/Steel Gray arka plan, `border-border/40` kenarlık, `muted-foreground` placeholder rengi
  - Erişilebilirlik: editör container'ına `role="textbox"` ve `aria-multiline="true"` ekle, `aria-label` prop'unu uygula
  - Toolbar butonları: Bold, Italic, BulletList, OrderedList, H2, H3 — her biri `aria-label` ve `aria-pressed` attribute'larıyla; Tab sırası soldan sağa, son butonda Tab → editör içerik alanına geç
  - Toolbar `aria-label` değerleri `useTranslations` ile i18n anahtarlarından al: `richTextEditor.toolbar.*`
  - `:focus-visible` outline: min 2px, min 3:1 kontrast oranı (WCAG 2.1 AA SC 1.4.11)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.3_

  - [ ]* 5.1 RichTextEditor için property test yaz (`rich-text-editor.pbt.spec.ts`)
    - **Property 7: Toolbar Butonları ARIA Erişilebilirliği** — render edilmiş her `RichTextEditor`'da Toolbar içindeki her buton `aria-label` attribute'una sahip olmalı ve aktif biçimlendirme durumunu `aria-pressed` ile yansıtmalı
    - fast-check ile farklı prop kombinasyonları üret, minimum 100 iterasyon
    - _Validates: Requirements 8.2, 8.3_

  - [ ]* 5.2 RichTextEditor için unit test yaz (`rich-text-editor.spec.tsx`)
    - Toolbar'da 6 butonun render edildiğini doğrula
    - `disabled` prop davranışı (opacity, tıklama yoksayma)
    - `placeholder` gösterimi
    - `aria-label`, `role="textbox"`, `aria-multiline="true"` attribute'ları
    - Unmount'ta `destroy()` çağrısı
    - Ctrl+Enter ile `onSubmit` tetiklenmesi
    - _Requirements: 1.2, 1.5, 1.6, 1.8, 8.1_

- [ ] 6. Checkpoint — Frontend bileşenleri hazır
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. i18n anahtarlarını ekle
  - `apps/frontend/messages/tr.json` dosyasına `richTextEditor.toolbar.*` anahtarlarını ekle: `bold: "Kalın"`, `italic: "İtalik"`, `bulletList: "Madde İşaretli Liste"`, `orderedList: "Numaralı Liste"`, `heading2: "Başlık 2"`, `heading3: "Başlık 3"`
  - `apps/frontend/messages/en.json` dosyasına aynı anahtarları İngilizce değerlerle ekle
  - `apps/frontend/messages/de.json` dosyasına aynı anahtarları Almanca değerlerle ekle (GAP-12 bağlamında — `pnpm i18n:check` ile doğrula)
  - `next-intl` `defaultLocale` fallback mekanizması `de.json` eksik anahtarlar için `tr.json`/`en.json`'a fallback yapacak şekilde çalışmalı
  - _Requirements: 9.3, 9.4_

- [ ] 8. Backend: SanitizeHtmlPipe ve AddMessageDto güncellemesi
  - **Önce `gitnexus impact "AddMessageDto"` çalıştır** — blast radius raporunu kullanıcıya sun
  - `apps/backend/src/common/pipes/sanitize-html.pipe.ts` dosyasını oluştur
  - `SanitizeHtmlPipe` implement et: `message` alanını server-side sanitize et (`sanitize-html` veya `isomorphic-dompurify` kullan — Node.js ortamı için uygun)
  - `message` 10.000 karakteri aşıyorsa `BadRequestException` fırlat: `"message must be shorter than or equal to 10000 characters"`
  - Sanitizasyon sonrası `message` boş string ise `BadRequestException` fırlat: `"message cannot be empty after sanitization"`
  - `contentFormat` geçersiz değer içeriyorsa `BadRequestException` fırlat: `"contentFormat must be one of: HTML, MARKDOWN, PLAIN_TEXT"`
  - `apps/backend/src/tickets/dto/add-message.dto.ts` dosyasına `contentFormat` alanını ekle: `@ApiPropertyOptional`, `@IsEnum(['HTML', 'MARKDOWN', 'PLAIN_TEXT'])`, `@IsOptional()`, varsayılan `'PLAIN_TEXT'`
  - _Requirements: 4.6, 6.3_

  - [ ]* 8.1 AddMessageDto için property test yaz (`add-message-dto.pbt.spec.ts`) — backend Jest
    - **Property 8: AddMessageDto contentFormat Validasyonu** — `'HTML'`, `'MARKDOWN'`, `'PLAIN_TEXT'` dışındaki her string için POST isteği 400 Bad Request döndürmeli
    - fast-check ile geçersiz string'ler üret, minimum 100 iterasyon
    - _Validates: Requirements 6.3_

- [ ] 9. Prisma migration: TicketMessage.contentFormat alanı
  - **Önce `gitnexus impact "TicketMessage"` çalıştır** — blast radius raporunu kullanıcıya sun
  - `packages/database/prisma/schema.prisma` dosyasında `TicketMessage` modeline `contentFormat String? @map("content_format") @db.VarChar(20)` alanını ekle
  - Migration oluştur: `pnpm db:migrate` — migration adı `add_content_format_to_ticket_messages`
  - Migration mevcut satırları etkilememeli (`null` varsayılan değer)
  - `pnpm db:generate` ile Prisma client'ı yenile
  - Import her zaman `@aluplan/database`'den yapılmalı
  - _Requirements: 6.4_

- [ ] 10. Checkpoint — Backend ve veritabanı hazır
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. TicketDetailPage entegrasyonu
  - **Önce `gitnexus impact "TicketDetailPage"` çalıştır** — blast radius raporunu kullanıcıya sun
  - `/[locale]/(dashboard)/tickets/[id]/page.tsx` dosyasında `Textarea` bileşenini `RichTextEditor` ile değiştir
  - `reply` state'ini HTML string olarak tut (mevcut `useState<string>('')` yeterli)
  - `handleTypingChange` → `RichTextEditor.onChange` prop'una bağla
  - Gönder butonu disabled kontrolü: `reply.trim() === ''` yerine `ContentSanitizer.isEffectivelyEmpty(reply)` kullan
  - Gönder işleminde: `ContentSanitizer.sanitize(reply)` çağır, sonuç boş string ise göndermeyi iptal et
  - API çağrısına `contentFormat: 'HTML'` ekle
  - `handleDraft` akışı: AI taslak metni → `markdownToHtml(draft)` → `setReply(cleanHtml)` (RichTextEditor `value` prop'u üzerinden)
  - `MacroPicker` seçimi: makro içeriğini mevcut editör içeriğinin sonuna HTML olarak ekle, editör odağını koru
  - Ctrl+Enter / Cmd+Enter: `handleSendReply` tetikle (gönder butonu etkin durumdaysa)
  - Enter: yeni paragraf (TipTap default — `handleSendReply` tetiklenmemeli)
  - Ticket durumu `CLOSED`, `RESOLVED`, `PENDING_CUSTOMER_REVIEW` ise: `RichTextEditor disabled={true}`, gönder butonu gizle
  - `isCustomer` durumunda da `RichTextEditor` göster (aynı 6 Toolbar özelliği)
  - Mesaj geçmişinde `{msg.message}` → `<RichTextRenderer content={msg.message} contentFormat={msg.contentFormat} />`
  - Ticket açıklama metni `ticket.description` → `<RichTextRenderer content={ticket.description} />`
  - `RichTextEditor`'a `placeholder` prop'unu `t('tickets.detail.message_placeholder')` ile ilet
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 5.5, 5.6, 9.2_

  - [ ]* 11.1 TicketDetailPage için integration test yaz (`ticket-detail-page.spec.tsx`)
    - Admin: `RichTextEditor`'ın `Textarea` yerine render edildiğini doğrula
    - Customer: `isCustomer=true` durumunda editörün gösterildiğini doğrula
    - Kapalı ticket: `disabled={true}` prop'unun iletildiğini doğrula
    - `handleDraft` → `markdownToHtml` → editör içeriği akışı
    - `MacroPicker` seçimi → editör içeriğine ekleme
    - `isEffectivelyEmpty` → gönder butonu disabled
    - _Requirements: 2.1, 2.4, 2.5, 2.7, 3.1, 3.4_

- [ ] 12. Final checkpoint — Tüm testler ve i18n kontrolü
  - `pnpm --filter @aluplan/frontend test:unit` çalıştır
  - `pnpm --filter @aluplan/backend test` çalıştır
  - `pnpm i18n:check` çalıştır — `de.json` GAP-12 durumunu doğrula
  - `pnpm --filter @aluplan/frontend typecheck` ve `pnpm --filter @aluplan/backend typecheck` çalıştır
  - `gitnexus detect_changes` çalıştır — değişiklik kapsamını doğrula
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- `*` ile işaretli görevler opsiyoneldir; MVP için atlanabilir
- Her görev ilgili requirements'a referans verir (izlenebilirlik)
- Checkpoint'ler artımlı doğrulama sağlar
- Property testleri evrensel doğruluk özelliklerini, unit testler spesifik örnekleri ve edge case'leri doğrular
- `gitnexus impact` çalıştırma zorunluluğu: `AddMessageDto`, `TicketMessage`, `TicketDetailPage` için — AGENTS.md kuralı
- TipTap v3 `useEditor` hook'u kullanılır; `EditorProvider` pattern'i bu tasarımda tercih edilmez
- Backend sanitizasyon için `sanitize-html` veya `isomorphic-dompurify` tercih edilir (Node.js ortamı uyumluluğu)
- Prisma client import'ları her zaman `@aluplan/database`'den yapılmalı

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["4.1", "4.2"] },
    { "id": 3, "tasks": ["5.1", "5.2"] },
    { "id": 4, "tasks": ["8.1"] },
    { "id": 5, "tasks": ["11.1"] }
  ]
}
```
