# Çelik Yapı (SDS2) Bağlantı Hataları Yönetimi

Problem Özeti: Allplan ve SDS2 entegrasyonu ile oluşturulan çelik yapı modellerinde, bağlantı noktalarında (örneğin kolon-kiriş birleşimleri) çarpışma (clash), geometrik uyumsuzluk veya tasarım hesaplama hatalarının ortaya çıkması.
Belirtiler:
SDS2 arayüzünde "Bağlantı Başarısız" veya "Tasarım Kriterleri Karşılanmadı" gibi uyarı mesajlarının alınması.
Bağlantı bileşenleri (plakalar, cıvatalar vb.) arasında fiziksel çakışmaların (clash) gözlemlenmesi.
Allplan'dan aktarılan elemanların SDS2'de doğru şekilde tanınmaması veya özelliklerinin eksik olması.
Etkilenen Ortam: Allplan Engineering, SDS2 Detaylandırma Yazılımı, Allplan - SDS2 Entegrasyon Arayüzü.
Kök Neden:
Allplan'da tanımlanan yapısal profillerin veya malzemelerin SDS2 kütüphaneleriyle tam olarak eşleşmemesi.
Bağlantı noktalarındaki yük kombinasyonlarının veya tasarım kriterlerinin SDS2'de yanlış girilmesi veya hesaplanamaması.
Bağlantı tipi (örneğin moment bağlantısı vs. kesme bağlantısı) seçimindeki mantıksal hatalar.
Karmaşık geometrilerde veya standart dışı profillerde otomatik bağlantı tasarımının başarısız olması.
Adım Adım Çözüm:
Model ve Profil Doğrulaması: Allplan'da kullanılan çelik profillerin ve malzeme sınıflarının SDS2'nin veritabanında (veya bulut tabanlı çelik profil kataloğunda) doğru şekilde karşılığı olduğunu teyit edin. Eksik veya uyumsuz profiller varsa, SDS2 içinde bu profilleri manuel olarak eşleştirin veya tanımlayın.
Tasarım Kriterlerini İnceleme: Hata veren bağlantı noktası için SDS2 içindeki bağlantı tasarımı hesaplamalarını (Connection Design) açın. Uygulanan kuvvetleri, momentleri ve tasarım kodlarını (örneğin Eurocode, AISC) kontrol ederek aşırı yükleme veya uyumsuzluk olup olmadığını belirleyin.
Çakışma Kontrolü (Clash Detection): SDS2 arayüzünde veya modeli Bimplus'a aktararak detaylı bir çakışma kontrolü yapın. Cıvata başları, somunlar, plakalar veya diğer elemanlar arasındaki çakışmaları (clash) tespit edin.
Manuel Bağlantı Düzenlemesi: Otomatik bağlantı tasarımı başarısız olduysa, bağlantı bileşenlerini manuel olarak düzenleyin. Plaka kalınlıklarını, cıvata adetlerini ve yerleşimlerini değiştirerek çakışmaları giderin ve tasarım kriterlerini sağlayın. Gerekirse Allplan içindeki "Bağlantı Araç Kutusu"nu (Connection Toolbox) kullanarak bağlantıyı baştan oluşturun.
Güncelleme ve Senkronizasyon: SDS2'de yapılan düzeltmelerin ardından modeli Allplan'a veya Bimplus'a senkronize ederek diğer disiplinlerle (örneğin mimari veya betonarme modellerle) uyumunu kontrol edin.
Önleyici Tavsiyeler:
Projenin başlangıcında Allplan ve SDS2 arasındaki profil ve malzeme eşleştirmelerinin doğruluğunu test edin.
Standart ve sık tekrarlanan bağlantı tipleri için Allplan veya SDS2 içinde güvenilir şablonlar (makrolar veya PythonPart'lar) oluşturun.
Karmaşık düğüm noktalarında otomatik tasarıma tamamen güvenmek yerine, erken aşamada manuel kontroller yapın.
Disiplinler arası koordinasyon için Bimplus Issue Manager'ı aktif olarak kullanarak olası çakışmaları imalat aşamasına gelmeden çözün.
Etiketler: SDS2, Çelik Detaylandırma, Çelik Bağlantı, Clash Detection, Moment Bağlantısı, Profil Eşleştirme.