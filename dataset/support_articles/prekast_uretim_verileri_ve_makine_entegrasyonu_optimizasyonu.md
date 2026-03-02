# Prekast Üretim Verileri ve Makine Entegrasyonu Optimizasyonu

Problem Özeti: Prekast elemanların 3B modelinden fabrikadaki CNC makinelerine (kaynak, kesim, büküm) ve ERP sistemlerine veri aktarımının manuel yapılması, hatalı veya eksik dosya çıktısı alınması.
Belirtiler: Makine dosyalarının (PXML, UniCAM vb.) makineler tarafından okunamaması, üretim hattında otomasyonun sağlanamaması veya ERP sistemine yanlış metraj aktarımı.
Etkilenen Ortam: Allplan Precast, NC Generator, MES (Üretim Yürütme Sistemleri), ERP Sistemleri.
Kök Neden: Tasarım sırasında elemanların (duvar/döşeme) fabrikanın taşıma veya makine kapasitesine göre bölünmemiş olması, "Otomatik Elementasyon" (Elementation) kurallarının atlanması veya yanlış makine üretim profillerinin (örn. NC Generator sürümleri) seçilmesi.
Adım Adım Çözüm:
Otomatik Bölme (Elementation): Duvar ve döşemeleri, fabrikanın üretim kısıtlamalarına (vinç kaldırma kapasitesi, kamyon taşıma boyutları) göre Allplan Precast içinde akıllı araçlarla otomatik olarak bölün.
Fabrikaya Özel Donatı (Plant-Specific Reinforcement): NC Generator ayarlarında, fabrikanın sahip olduğu hasır kaynak makinesine veya büküm makinelerine tam uyumlu donatı kurallarını tanımlayın.
Makine ve ERP Çıktıları: Üretim verilerini dışa aktarırken işlemi otomatikleştirmek için doğru formatı kullanın. Kesim, büküm ve kaynak makinelerini doğrudan çalıştırmak için PXML (sürüm 1.2 veya 1.3) veya UniCAM dosyalarını; malzeme yönetimi ve faturalandırma için ERP (KST, ADS.XML) formatlarını seçin.
Veri Doğrulaması: Üretim verilerini (NC) makinelere göndermeden önce Allplan Veri Doğrulayıcı (Data Validator) aracı ile boşlukların ve gömülü elemanların (fixtures) prekast eleman içinde doğru konumlandırıldığını kontrol edin.
Önleyici Tavsiyeler: Üretim (NC) verilerinin isimlendirme şablonlarını (Production file name) sisteminizle uyumlu olacak şekilde standartlaştırın.
Etiketler: Precast, PXML, UniCAM, NC Generator, ERP, MES, Üretim Otomasyonu.