# BCF ve Bimplus ile Gelişmiş Çakışma Yönetimi

Problem Özeti: Farklı disiplinlere ait (Mimari, Statik, MEP vb.) uzmanlık modellerinin birleştirilmesi sırasında ortaya çıkan kritik fiziksel kesişimlerin ve hataların (clash), proje ekipleri arasında etkin bir şekilde iletilememesi ve çözüm sürecinin takip edilememesi.
Belirtiler:
E-posta veya 2B ekran görüntüleri ile yapılan parça parça iletişimler sonucu çakışma konumunun tam olarak anlaşılamaması.
Farklı yazılımlar kullanan ekipler arasında bilgi kaybı yaşanması.
Çakışmaların (örneğin HVAC kanalının bir kirişi kesmesi) şantiye aşamasında fark edilmesi ve yüksek maliyetli gecikmeler yaratması.
Etkilenen Ortam: Allplan, Bimplus Platformu, BIM Collaboration Format (BCF), Çakışma Kontrolü (Clash Detection), Issue Manager (Sorun Yöneticisi).
Kök Neden: Dosya tabanlı geleneksel iletişim (e-posta vb.) veya BCF formatının kullanılmaması nedeniyle modeldeki çakışmanın mekansal ve görsel bağlamının diğer ekip üyelerine doğru aktarılamaması.
Adım Adım Çözüm (BIM Koordinatörü ve Ekipler İçin):
Modellerin Birleştirilmesi: BIM Koordinatörü, tüm disiplinlerin (Mimari, Statik, MEP) modellerini Allplan Bimplus platformuna yükler ve "Federatif Model" (Birleştirilmiş Model) oluşturur.
Çakışma Kontrolü: Bimplus üzerinde veya Allplan içinde Çakışma Kontrolü (Clash Detection) aracını çalıştırarak çakışmaları tespit edin.
BCF Sorunu Oluşturma: Tespit edilen çakışmayı (örneğin K-305 Kirişi ve Ana Havalandırma Kanalı çakışması) seçin ve Bimplus Issue Manager (Sorun Yöneticisi) üzerinden "Sorun Oluştur"a (Create Issue) tıklayın.
Detaylandırma: Soruna açıklayıcı bir başlık, atanacak sorumlu (Assignee), öncelik durumu (Priority) ve teknik bir açıklama ekleyin. Önemli: Bimplus, çakışmanın tam 3B konumunu, kamera açısını ve elemanların benzersiz kimliklerini (GUID) bu kayda otomatik olarak ekler.
Doğrudan Yönlendirme: İlgili sorumlu, Allplan'ı (veya kendi BIM yazılımındaki BCF eklentisini) açıp entegre Sorun Yöneticisi panelinden göreve tıkladığında, ekran otomatik olarak doğrudan çakışmanın olduğu 3B konuma zum yapar.
Çözüm ve Kapatma: Sorumlu mühendis (örneğin kirişte boşluk açarak veya kanalı kaydırarak) gerekli düzeltmeyi yapar, durumu günceller, modelini tekrar yükler. BIM Koordinatörü sorunun çözüldüğünü doğrulayıp BCF kaydını kapatır.
Önleyici Tavsiyeler: Tüm ekiplerin haftalık koordinasyon toplantılarını e-postalar yerine doğrudan Bimplus Issue Manager üzerinden yürütmesini zorunlu kılın.
Bu detaylandırılmış makale ile, destek ekibiniz karmaşık BIM koordinasyon süreçlerinde kullanıcılara çok daha net bir yol haritası sunabilir.
Bilgi bankanıza eklemek istediğiniz başka bir senaryo var mı, örneğin Parametrik Yol ve Köprü Modelleme (Allplan Civil / Bridge) veya Prekast (Prefabrik) Tasarım hataları gibi?
Buna ek olarak gelişmiş donatı raporları hakkında da bir makale oluşturalım.

Gelişmiş donatı raporları ve büküm şemaları (Bending Schedules) için hazırladığım yapılandırılmış destek makalesini aşağıda bulabilirsiniz: