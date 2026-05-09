# Görevler: Help Docs Redesign

## Görev Listesi

- [x] 1. i18n Key Düzeltmeleri
  - [x] 1.1 page.tsx'teki hatalı admin_guide.guide.* referanslarını admin_guide.* olarak düzelt
  - [x] 1.2 en.json ve tr.json'daki typo key'leri düzelt (card2_item22→card2_item2, item2_desc3→item2_desc, card2_desc4→card2_desc)
  - [x] 1.3 page.tsx'teki duplicate render satırlarını kaldır (card1_item1, item1_way*, card1_rule)

- [x] 2. Temel Tip ve Veri Modelleri
  - [x] 2.1 apps/frontend/src/components/help/types.ts dosyasını oluştur (DocNode, DocTree, BreadcrumbItem arayüzleri)
  - [x] 2.2 apps/frontend/src/components/help/doc-tree.ts dosyasını oluştur (CUSTOMER_TREE ve ADMIN_TREE sabitleri)
  - [x] 2.3 doc-tree.ts'e yardımcı fonksiyonları ekle (findNode, getBreadcrumbPath, buildDocTree, isAdminOrAgent)

- [x] 3. Yardımcı UI Bileşenleri
  - [x] 3.1 apps/frontend/src/components/help/TipBox.tsx bileşenini oluştur (tip/warning/info varyantları)
  - [x] 3.2 apps/frontend/src/components/help/CodeBlock.tsx bileşenini oluştur (inline ve block modları)
  - [x] 3.3 apps/frontend/src/components/ui/accordion.tsx bileşenini oluştur (@radix-ui/react-accordion üzerine)
  - [x] 3.4 apps/frontend/src/components/help/DocAccordion.tsx bileşenini oluştur

- [x] 4. Sidebar Bileşeni
  - [x] 4.1 apps/frontend/src/components/help/HelpDocsSidebar.tsx bileşenini oluştur
  - [x] 4.2 Sidebar'a klavye navigasyonu ekle (Tab, Enter, Arrow tuşları)
  - [x] 4.3 Sidebar'a erişilebilirlik nitelikleri ekle (role, aria-label, aria-current)
  - [x] 4.4 Mobil sidebar toggle (hamburger) ve overlay bileşenini oluştur

- [x] 5. İçerik Paneli Bileşenleri
  - [x] 5.1 apps/frontend/src/components/help/DocBreadcrumb.tsx bileşenini oluştur
  - [x] 5.2 apps/frontend/src/components/help/HelpDocsContent.tsx bileşenini oluştur
  - [x] 5.3 Her Doc_Node için içerik bileşenlerini oluştur (customer: 7 node, admin: 13 node)

- [x] 6. Ana Sayfa Yeniden Yazımı
  - [x] 6.1 help/page.tsx dosyasını yeni HelpDocsPage mimarisine göre yeniden yaz
  - [x] 6.2 next/dynamic ile lazy loading entegrasyonunu ekle
  - [x] 6.3 Rol bazlı varsayılan node seçimini uygula

- [-] 7. i18n Genişletme — Yeni Key'ler
  - [x] 7.1 en.json'a help.docs.nav.customer.* navigasyon key'lerini ekle
  - [x] 7.2 en.json'a help.docs.nav.admin.* navigasyon key'lerini ekle
  - [x] 7.3 en.json'a help.docs.customer.* içerik key'lerini ekle (tüm customer node'ları)
  - [x] 7.4 en.json'a help.docs.admin.* içerik key'lerini ekle (tüm admin node'ları)
  - [-] 7.5 tr.json'a tüm yeni key'lerin Türkçe karşılıklarını ekle (key simetrisi)

- [~] 8. Testler
  - [~] 8.1 doc-tree.ts yardımcı fonksiyonları için birim testleri yaz (findNode, getBreadcrumbPath, buildDocTree)
  - [~] 8.2 TipBox bileşeni için birim testleri yaz (3 varyant)
  - [~] 8.3 DocBreadcrumb bileşeni için birim testleri yaz
  - [~] 8.4 HelpDocsSidebar rol bazlı görünürlük testlerini yaz
  - [~] 8.5 i18n key simetrisi için property-based test yaz (fast-check)
  - [~] 8.6 Doc_Node seçimi içerik eşleşmesi için property-based test yaz
  - [~] 8.7 Breadcrumb yol doğruluğu için property-based test yaz
  - [~] 8.8 TipBox varyant render tutarlılığı için property-based test yaz
  - [~] 8.9 Sidebar aria-expanded durumu için property-based test yaz
