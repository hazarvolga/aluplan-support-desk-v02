---
title: ALLPLAN BIM KAPSAMLI KULLANICI KILAVUZU
category: User_Guides
source: Allplan-BIM-Complete-User-Guide.txt
tags: [BIM, Allplan 2025, User Guide, Architecture, Engineering, Infrastructure]
---

# ALLPLAN BIM Kapsamlı Kullanıcı Kılavuzu

## Giriş Seviyesi Bilgiler

### Allplan BIM Nedir?
Allplan, Nemetschek grubuna ait, mimarlık, inşaat mühendisliği ve altyapı projeleri için geliştirilmiş kapsamlı bir Yapı Bilgi Modellemesi (BIM) yazılımıdır. Tasarımdan yapıma kadar tüm proje yaşam döngüsünü destekleyen bu güçlü platform, disiplinler arası işbirliğini kolaylaştırır ve proje verimliliğini artırır.

### BIM Kavramı ve Allplan'ın Yeri
Yapı Bilgi Modellemesi (Building Information Modeling - BIM), bir yapının fiziksel ve işlevsel özelliklerinin dijital olarak temsil edildiği bir süreçtir. Geleneksel iki boyutlu çizimlerden farklı olarak, BIM yaklaşımı yapıyı üç boyutlu bir model olarak oluşturur ve bu modele tüm proje bilgilerini entegre eder.

Allplan, BIM ekosisteminde önemli bir konuma sahiptir çünkü sadece bir modelleme aracı değil, aynı zamanda tasarım, analiz, dokümantasyon, işbirliği ve yapım planlaması için komple bir çözümdür. Yazılım, openBIM standartlarını destekleyerek farklı yazılımlarla sorunsuz veri alışverişi sağlar.

### Allplan'ın Temel Özellikleri ve Avantajları
- **Esneklik:** Tamamen iki boyutlu çizimden tam nesne yönelimli üç boyutlu BIM metodolojisine kadar her türlü iş akışını destekler.
- **Disiplinler Arası Çözüm:** Mimari tasarımdan yapısal mühendisliğe, MEP'ten inşaat sahası planlamasına kadar tüm disiplinleri tek bir platformda birleştirir.
- **Yapıdan Yapıma Yaklaşım:** Kavramsal tasarımdan detaylı yapım planlarına kadar tüm aşamaları destekleyen tek BIM çözümüdür.
- **Bulut Tabanlı İşbirliği:** Allplan Cloud servisleri ve Bimplus entegrasyonu sayesinde ekipler gerçek zamanlı olarak işbirliği yapabilir.
- **Üstün Donatı Modelleme:** Betonarme yapılar için sektörün en gelişmiş donatı modelleme ve detaylandırma araçlarını sunar.
- **Yüksek Detay Seviyesi:** Çok daha yüksek detay seviyesinde (LOD) modelleme yapmanıza olanak tanır.

### Sistem Gereksinimleri
**Minimum Gereksinimler:** İşlemci olarak Intel veya AMD Ryzen işlemci, 8 GB RAM bellek, 20 GB boş sabit disk alanı ve OpenGL 4.2 uyumlu 4 GB RAM'e sahip ekran kartı. Ekran çözünürlüğü en az 1920x1080 olmalıdır.

**Önerilen Sistem:** Intel Core i5, i7 veya i9 ya da AMD Ryzen 5, 7 veya 9 işlemci, 32 GB RAM, SSD depolama birimi ve Vulkan 1.2 veya OpenGL 4.5 uyumlu 16 GB veya daha fazla RAM'e sahip profesyonel bir ekran kartı.

**Desteklenen İşletim Sistemleri:** Windows 11 (24H2), Windows 10 (21H2+), Windows Server 2025, 2022, 2019. Mac'lerde Parallels veya Boot Camp ile kullanılabilir.

### Kurulum Süreci
1. **Lisans ve İndirme:** Lisansınızı satın alın veya 14 günlük deneme sürümünü indirin.
2. **Kurulum Dosyasını Çalıştırma:** Yönetici yetkisiyle kurun.
3. **Bileşen Seçimi:** Mimari, mühendislik, civil engineering gibi modülleri seçin.
4. **Ülke ve Standart Ayarları:** Kullanacağınız ülke standartlarını seçin (Türkiye/Türkçe desteği mevcut).
5. **Lisans Aktivasyonu:** Lisans anahtarınızı girin.
6. **İlk Yapılandırma:** Proje klasörü ve varsayılan ayarları belirleyin.

### Arayüz Tanıtımı ve Temel Navigasyon
- **Ana Ekran Bileşenleri:** Menü çubuğu ve hızlı erişim araç çubuğu en üstte bulunur.
- **Palet Sistemi:** Sol tarafta modül paletleri (Mimari, Mühendislik vb.).
- **Çizim Penceresi:** Ekranın merkezinde 2D çizim veya 3D model görünümü.
- **Özellikler Paleti:** Sağ tarafta seçilen nesnenin parametrik özelliklerini gösterir.
- **Navigasyon Araçları:** Görünüm küpü ve dinamik görünüm modu ile 3D gezinme.
- **Katman Yönetimi:** Disiplinler ve aşamalara göre katman organizasyonu.
- **Proje Yapısı:** Sol alt köşede bina, kat ve dosya hiyerarşisi.
- **Durum Çubuğu:** Ekranın altında koordinat ve yakalama bilgileri.

### İlk Proje Oluşturma Adımları
1. **Yeni Proje Başlatma:** Dosya > Yeni Proje.
2. **Proje Özellikleri:** Proje ayarları, müşteri bilgileri vb.
3. **Bina Yapısı Oluşturma:** Bina ekleyin ve kat seviyelerini tanımlayın.
4. **Çalışma Ortamı Seçimi:** Proje tipine uygun yapılandırmayı (Mimari, Altyapı vb.) seçin.
5. **İlk Elemanları Çizme:** Paletten örneğin "Duvar" aracını seçerek çizimi başlatın.
6. **Görünüm Kontrolleri:** 2D ve 3D görünümler arasında kontrol yapın.
7. **Kaydetme:** Sık sık kaydedin (Ctrl+S).

---

## Detaylı Özellik Açıklamaları

### Mimari Tasarım Modülü ve Araçları
- **Duvar Tasarımı:** Tek veya çok katmanlı, parametrik duvarlar. Otomatik köşe birleşimleri.
- **Kapı ve Pencere Sistemleri (2025):** Yüksek performanslı yeni modeller (eski SmartPart yerine). Tam parametrik kapı ve pencereler.
- **Döşeme ve Tavan Sistemleri:** Çok katmanlı döşemeler ve yeni Tavan Sistemleri aracı (servislerin koordinasyonu için).
- **Çatı Tasarımı:** Karmaşık çatı geometrileri (beşik, kırma vb.) için otomatik araçlar.
- **Merdiven ve Rampa:** Düz, döner ve spiral merdivenler ile rampa araçları.
- **Oda ve Alan Yönetimi:** Otomatik alan hesaplamaları ve etiketleme.

### İnşaat Mühendisliği Özellikleri
- **Yapısal Elemanlar:** Kolon, kiriş, perde ve döşemelerin analiz yazılımlarına aktarılabilir modellemesi.
- **Donatı Modelleme:** 3D olarak geliştirilmiş demir modelleme kütüphanesi.
- **Otomatik Donatı Yerleşimi:** Serbest form donatı aracı ile yüzey boyunca otomatik donatı iş akışı.
- **Donatı Detayları ve Çizimler:** 3D modelden 2D pafta ve donatı metrajı çıkarma.
- **Kalıp Planları:** BIM2form eklentisi (Peri Maximo) ile kalıp atama, özel arayüz.
- **Prekast Beton:** Ön üretimli eleman tasarımı ve üretim makinesi verisi aktarımı.

### Altyapı Projeleri İçin Özel Araçlar (Civil Edition)
- **Köprü Tasarımı:** Allplan Bridge modülü ile parametrik köprü tasarımı. 2025 ile öngerilmeli köprülerde süreç otomatikleştirildi.
- **Arazi Modelleme:** DTM oluşturma, hacim hesaplama.
- **Yol ve Karayolu Tasarımı:** Kesitlerin yol boyunca parametrik uygulanması.
- **Tünel Mühendisliği:** Kaplama ve tünel destek sistemleri.
- **Kazı ve Hafriyat Planlama:** Serbest toprak katmanları modelleme ve kazı raporları.

### 3 Boyutlu Modelleme Yetenekleri
- **Katı Modelleme:** Parasolid çekirdek tabanlı boolean katı operasyonları.
- **Yüzey Modelleme:** NURBS tabanlı yüzey oluşturma.
- **Serbest Form Modelleme:** Eğrisel yapılar için yüksek performans.
- **Parametrik Modelleme:** PythonParts ile kendi akıllı objelerinizi programlama.
- **Modifikasyon Araçları:** CAD tabancı döndürme, kırma, yuvarlama vs.

### 2 Boyutlu Çizim ve Dokümantasyon
- **Temel Çizim Araçları:** Çizgi, yay, çokgen çizimleri.
- **Boyutlandırma:** Otomatik lineer/açısal ölçüler. 2025 versiyonunda metin liderleri yenilendi.
- **Yazı ve Açıklama:** Akıllı metin etiketleri ve notlar.
- **Şablonlar:** Pafta şablonları uyarlaması.
- **Kesit ve Görünüm:** Modelden otomatik dinamik 2D kesitler.
- **Çıktı ve Baskı:** PDF, toplu yazdırma ve 3D PDF dışa aktarım desteği.

### BIM Nesneleri ve Kütüphane Yönetimi
- **Standart Kütüphane:** Çok çeşitli hazır yapı elemanları.
- **SmartParts:** Değiştirilebilir dinamik akıllı bileşenler.
- **PythonParts:** Python dili ile entegre, özel mantık yürütülebilen parçalar.
- **Content Connector (2025):** 3DFindit platformuna doğrudan entegrasyon.
- **Kütüphane Yönetimi:** Filtrelenebilir proje veya ofis geneli paylaşımlı kütüphaneler.

### Parametrik Tasarım Araçları
- Nesne parametreleri ile çok yönlü yönetim.
- Aks bazlı ilişkisel geometri.
- Formül ve kısıtlamalar.
- Varyant tasarım denemeleri.

### Görselleştirme ve Render Özellikleri
- **Gerçek Zamanlı Görselleştirme:** Gelişmiş OpenGL ve malzeme motorları.
- **AI Visualizer (2025):** Yapay zeka ile basit kütle / taslaklardan anında konsept render üretimi (Sadece metin modu dahil).
- **Render Motorları:** Yüksek kaliteli ışın izleme desteği.
- **Lumion Entegrasyonu:** Live-sync özelliği.
- **Animasyon:** Kamera uçuş rotaları oluşturma.

### İşbirliği Araçları ve Bimplus Entegrasyonu
- **Bimplus Platformu:** Bulut ortamında eşzamanlı çalışma platformu.
- **Allplan Share:** Yerel proje dizini kullanmak yerine doğrudan bulutta proje senkronizasyonu.
- **Bluebeam Entegrasyonu (2025):** Studio iş akışının, Bimplus ile entegre olması.
- Mobil görünüm erişimi, BCF tabanlı sorun (issue) takibi ve doküman yönetimi.

### Veri Alışverişi
- **IFC Desteği:** IFC2x3 ve IFC4 tam destek. (buildingSMART sertifikalı)
- **IDS Desteği (2025):** Nitelik kurallarının teknik kontrolü süreci.
- DWG, DXF, DGN formatları.
- **SAF & AutoConverter:** Yapısal analiz çözümlerine model aktarımı (eğri kirişler geliştirildi).
- Excel entegrasyonu (nitelik okuma/yazma).

### Analiz Araçları ve Raporlama
- Model çakışma testleri.
- Enerji, Yük, Miktar, Gölgelenme / Güneş analizleri.
- Otomatik beton ve donatı metraj listesi.
- Cost/Maliyet hesabı entegrasyonu.

### Kalite Kontrol ve Revizyon Yönetimi
- **Model / IDS Doğrulama:** Teknik eksikliklerin raporlanmas.
- **Solibri Entegrasyonu:** Kurallı mimari denetim.
- **Veri Doğrulayıcı (2025):** Prekast üretimde yerleşim hatalarını minimize etme.
- Kapsamlı revizyon karşlılaştırıcı, değişiklik takibi ve Bimplus üzerinden yedekleme.

---

## İş Akışları ve Uygulamalı Bilgiler

### Proje Yaşam Döngüsü Uygulaması
1. **Ön Tasarım / Konsept:** Kütle modeli, AI Visualizer ile konsept geliştirme.
2. **Tasarım Geliştirme:** Duvar, döşeme elemanlarına mimari detayın verilmesi.
3. **Detay Projesi:** Boyutların kesinleşmesi, MEP koordinasyonu, donatının işlenmesi.
4. **Ruhsat ve Uygulama:** Plan, kesit, montaj ve kalıp çizimlerinin alınması.
5. **İşletme (As-built):** FM (Tesis yönetimi) için dijital ikiz teslimi.

### En İyi Uygulamalar (Best Practices)
- Sürekli standartlaştırılmış Proje Şablonları (Templates) kullanılmalı.
- Katman disiplini ve standart isimlendirmeler zorunlu tutulmalı.
- Düzenli bulut yedekleme yapılmalı.
- **Referans Yönetimi (2025)** ile tüm dışa/içe aktarımlar ve linklenen DWF/PDF'ler konsolide edilmeli.
- Performans için görünüm sınırları aktif edilmeli, gizli katmanlar kapatılmalı.
- Gelişmiş klavye kısayolları ile zaman avantajı yaratılmalı.

*Not: Bu kılavuz Allplan 2025 sürümü baz alınarak hazırlanmıştır.*
