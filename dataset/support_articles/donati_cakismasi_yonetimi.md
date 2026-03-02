# Donatı Çakışması Yönetimi

Problem Özeti: Karmaşık betonarme düğüm noktalarında veya farklı disiplinlerin (örn. MEP ve Statik) kesişimlerinde donatıların veya taşıyıcı elemanların fiziksel olarak çakışması.
Belirtiler: Allplan içinde "Otomatik Donatı Çakışma Kontrolü" (Automatic Reinforcement Collision Check) sırasında hata alınması veya Bimplus federatif modelinde (federated model) çakışma raporlanması.
Etkilenen Ortam: Allplan Engineering, Bimplus, Issue Manager (Sorun Yöneticisi), BCF.
Kök Neden: Dar kesitlerde yoğun donatı yerleşimi, tesisat (HVAC vb.) boşluklarının taşıyıcı sistemi kesmesi veya disiplinler arası koordinasyon eksikliği.
Adım Adım Çözüm:
Tüm disiplinlere ait modelleri Allplan Bimplus platformuna yükleyin ve "Çakışma Kontrolü" (Clash Detection) işlemini başlatın.
Tespit edilen donatı/taşıyıcı çakışmasını seçerek Bimplus üzerinden "Sorun Oluştur" (Create Issue) butonuna tıklayın ve bir BCF kaydı oluşturun.
Durumu, önceliği ve sorumlu mühendisi belirleyin (Bimplus, elemanların GUID kimliklerini ve tam 3B kamera açısını otomatik kaydeder).
Sorumlu mühendis Allplan'ı açıp Sorun Yöneticisi (Issue Manager) panelinden ilgili göreve tıkladığında, program otomatik olarak hatalı donatının bulunduğu noktaya zum yapar.
Allplan içinde donatı yerleşimini (veya gerekli penetrasyon/boşluk detaylarını) revize edin, yorumunuzu ekleyerek BCF durumunu güncelleyin ve modeli Bimplus'a geri yükleyin.
Önleyici Tavsiyeler: Modelleme esnasında Allplan'ın dahili "Otomatik Donatı Çakışma Kontrolü" aracını düzenli periyotlarla çalıştırın. Ekip içi iletişimi e-posta yerine tamamen Bimplus Issue Manager üzerinden yürütün.
Etiketler: Donatı Çakışması, Clash Detection, BCF, Bimplus, Issue Manager, Reinforcement.