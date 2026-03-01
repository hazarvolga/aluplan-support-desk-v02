# Türkiye Kamu Projeleri: Çevre ve Şehircilik Bakanlığı BIM Uyumluluğu

2023 yılında yayınlanan "Yapı Bilgi Modellemesi (BIM) Rehberi"ne göre Allplan projelerinin yapılandırılmasına dair mühendislik notlarıdır.

## 1. Bilgi Gereksinimleri Seviyesi (LOD/LOI)
Bakanlık rehberine göre projeler aşamasına göre LOD 100 ile LOD 500 arası bilgi içermelidir.
- **Allplan Uygulaması:** 'Object Attributes' paletinde `LOD_Level` ve `Information_Need` sütunlarını ana şablona ekleyin.
- **Denetim:** Bimplus üzerindeki 'Property Set Manager' aracı ile bakanlığın istediği tüm parametrelerin (Tapu bilgisi, Isı yalıtım katsayıları vb.) modelde mevcut olduğunu 'Collision & Integrity' testiyle doğrulayın.

## 2. Ortak Veri Ortamı (CDE) Gereksinimleri
Bakanlık, verilerin merkezi ve versiyonlu bir platformda tutulmasını zorunlu kılar.
- **Milli Uyum:** Allplan Share ve Bimplus, bakanlığın 'ISO 19650' tabanlı CDE gereksinimlerine tam yanıt verir. Proje yönetim portalında 'Workflow Management' (Onay Mekanizması) aktif edilerek belgelerin yasal onaya sunulması sağlanmalıdır.

## 3. BCF (BIM Collaboration Format) Protokolü
Bakanlık projelerinde disiplinler arası çakışmaların (Clash) raporlanması için BCF formatı esastır.
- **İş Akışı:** Allplan'daki çakışma analizlerini Bimplus 'Issue Manager'a aktarın. Bu kayıtlar bakanlık denetçileri tarafından web tarayıcı üzerinden görüntülenebilir ve onaylanabilir.
- **Kritik Not:** BCF 3.0 kullanımı, verilerin hem Revit hem Allplan hem de Solibri arasında tam geçişkenliğini sağlar.
