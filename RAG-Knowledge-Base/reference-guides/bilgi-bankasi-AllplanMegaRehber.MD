ALLPLAN-MEGA-REHBER/
├─ README.md
├─ BOLUM-01/
│  └─ Part-01.md
├─ BOLUM-02/
│  └─ Part-02.md         (bir sonraki teslimatta)
├─ BOLUM-03/
│  └─ Part-03.md         (mimari iş akışları)
├─ BOLUM-04/
│  └─ Part-04.md         (yapı/donatı)
├─ BOLUM-05/
│  └─ Part-05.md         (prekast)
├─ BOLUM-06/
│  └─ Part-06.md         (civil/altyapı)
├─ BOLUM-07/
│  └─ Part-07.md         (BIM, OpenBIM, veri değişimi)
├─ BOLUM-08/
│  └─ Part-08.md         (Allplan Cloud & Bimplus)
├─ BOLUM-09/
│  └─ Part-09.md         (performans, otomasyon, PythonParts)
└─ BOLUM-10/
   └─ Part-10.md         (sorun giderme, SSS, denetim listeleri)


   # BÖLÜM 01 — Temeller ve Kurulum

> Bu bölümde Allplan'ın mimari, mühendislik ve inşaat ekosistemindeki yeri, sistem gereksinimleri, kurulum türleri, sessiz kurulum (silent install), ilk yapılandırma, şirket standartlarının uyarlanması ve güncelleme/sürüm geçiş stratejileri yer alır.

---

## 1.1 Allplan Ekosistemine Genel Bakış
- **Allplan nedir?** Disiplinler arası BIM yazılımı; mimarlık, yapı, altyapı ve prekast modülleri ile uçtan uca iş akışı sağlar. OpenBIM uyumludur ve bulut tabanlı işbirliği sunar. [1](https://allbim.com.tr/)  
- **Allplan Cloud & Bimplus**: Gerçek zamanlı model koordinasyonu, veri paylaşımı ve sürüm yönetimi; Allplan 2025+ sürümlerinde bulut işbirliği ve verimlilik vurgusu öne çıkmaktadır. [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/)

> **Tarihçe bağlamı:** Allplan’ın kökleri Prof. Georg Nemetschek’in 1963’teki kuruluşuna uzanır; 1984’te CAD tabanlı Allplan çıkmıştır. Nemetschek SE, 2000’li yıllarda Graphisoft, Maxon, Bluebeam, Solibri gibi şirketlerle ekosistemini genişletmiştir. Bu birikim, AEC yazılım ekosistemindeki bütüncül yaklaşımın temelidir. [4](https://www.statikprogramlar.com/allplan-programi-nedir/)

---

## 1.2 Sürüm Matrisi (2025 ve 2026)
- **ALLPLAN 2025 — Öne Çıkanlar:** Yapay zeka tabanlı görselleştirme (AI Visualizer), yeni kapı/pencere nesneleri, çok katmanlı döşeme, parametrik tavan aracı, Akıllı Katalog Editörü, Bilgi Paleti ve Referans Yöneticisi. [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/)  
  AI görselleştirme ve çok katmanlı döşemeye dair bağımsız basın bülteni/inceleme: [5](https://dailycadcam.com/allplan-2025-released-for-bim/)
- **ALLPLAN 2026 — Öne Çıkanlar:** Serbest form merdiven modelleyicisi, çok katmanlı döşeme yönetiminde ileri düzenleme, bulut işbirliği ve parametrik modelleme iyileştirmeleri. [6](https://aluplan.com.tr/allplan-2026nin-ozellikleri/)  
  Türkiye distribütör duyurularında 2026 paket ve ekosistem vurgusu: [2](https://aluplan.com.tr/)

---

## 1.3 Sistem Gereksinimleri (Öneri)
> Resmî sayfalardaki genel performans yönlendirmelerine ve 2025/2026 sürümlerindeki görselleştirme/gelişmiş modelleme özelliklerine dayanarak pratik öneriler: çok çekirdek CPU, **32–64 GB RAM**, **NVMe SSD**, **RTX sınıfı GPU** (AI görselleştirme ve render için) önerilir. Büyük/karmaşık projelerde bulut işbirliği Allplan Cloud ile desteklenmelidir. (Genel özellik seti ve bulut/AI vurgusu: [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/)[5](https://dailycadcam.com/allplan-2025-released-for-bim/))

---

## 1.4 Kurulum Öncesi Hazırlık
- **Bağlantı & Hesaplar:** Lisans sunucusu/Allplan Account erişimleri ve Allplan Cloud/Bimplus yetkilerini doğrulayın. (Bulut tabanlı işbirliği ve proje koordinasyonu: [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/))
- **Güvenlik Politikaları:** Antivirüs/EDR’de Allplan kurulum ve veri dizinlerini hariç tutun (ağ paylaşımlarında NTFS izinleri kontrol edilmeli). (Kurumsal kullanım bağlamı, veri paylaşımı ve disiplinler arası iş akışları: [1](https://allbim.com.tr/))
- **Ağ Paylaşımı:** Ofis standardı, kütüphaneler ve proje şablonlarının merkezi konumu belirlenmelidir. (Ofis standardı ve üretken iş akışları: [1](https://allbim.com.tr/))
- **Yedekleme:** Mevcut versiyondaki ofis/katman/kütüphane varlıklarının yedeği alın; versiyon yükseltmeden önce pilot proje ile test edin. (Sürüm geçişinde verimlilik ve iş akışı sürekliliği: [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/))

---

## 1.5 Kurulum Türleri
- **Tekil İstasyon:** Yerel makinaya tam kurulum (standart ofis).  
- **Sunucu Tabanlı:** Uygulama yerel; veri paylaşımı ağ üzerinde (merkezi ofis standardı).  
- **Sanal Masaüstü/VDI:** GPU sanallaştırma ile paylaşımlı kaynak (yüksek yoğunluklu ekipler).  
- **Sessiz Kurulum (MSI):** Komut satırı parametreleri ve cevap dosyası ile kurumsal dağıtım.  
(Genel kurumsal dağıtım stratejileri ve Allplan’ın büyük ekipler/çok disiplinli ekipler için konumlanması: [1](https://allbim.com.tr/)[3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/))

### 1.5.1 Standart Kurulum Adımları
1. Kurulum medyasını çalıştırın.  
2. Kurulum dizinini belirleyin (uygulama ve veri).  
3. Paket seçin (Basic/Concept/Professional/Ultimate/Civil/Precast). (Paket ailesi: [2](https://aluplan.com.tr/))  
4. Lisans yöntemini seçin (Allplan Account / Lisans Sunucusu / Ürün anahtarı).  
5. Ofis standardı konumu ve varsayılan proje şablonlarını atayın. (Üretken iş akışı ve şablon yönetimi: [1](https://allbim.com.tr/))

### 1.5.2 Sessiz (Silent) Kurulum İpuçları
- MSI/EXE parametreleri ile **cevap dosyası** oluşturun.  
- Güncelleme senaryosunda **/norestart** kullanın.  
- Log dosyalarını merkezi bir ortak klasöre yönlendirin.  
(Büyük kurumsal dağıtımlar için iyi uygulama; Allplan’ın kurumsal kullanım bağlamı: [1](https://allbim.com.tr/))

---

## 1.6 İlk Açılış ve Yapılandırma Sihirbazı
- İş birliği ve **veri konumları**nın belirlenmesi.  
- **Ofis standardı**nın içe alınması.  
- Varsayılan **şablon**, **katman** ve **etiket** yapılandırmaları.  
(BIM iş akışı ve verimli dokümantasyon için öneriler: [1](https://allbim.com.tr/))

---

## 1.7 Sürüm Geçişi (Upgrade) Stratejisi
- **Major sürümler** için **pilot proje** ile doğrulama yapın. (2025/26 geçişinde yeni özelliklerin etkisi: [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/)[6](https://aluplan.com.tr/allplan-2026nin-ozellikleri/))  
- **Eklentiler/Scriptler (PythonParts)** uyumluluk testi. (Parametrik/otomasyon odaklı yetenekler: [2](https://aluplan.com.tr/))  
- **Geri dönüş planı:** Eski versiyonda açılabilir yedek saklayın. (Proje sürekliliği ve veri bütünlüğü: [1](https://allbim.com.tr/))

---

## 1.8 Güvenlik ve Erişim
- Proje bazlı rol/yetki modeli.  
- Bulutta **MFA/2FA** etkinleştirme.  
(Bulut tabanlı disiplinler arası işbirliğinde erişim güvenliği: [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/))

---

## 1.9 Kurumsal Standartların Uyarlanması
- **Katman/çizgi/kalem** sistematiği, **malzeme ve bileşen** kütüphaneleri.  
- **Metraj/keşif** ve **dokümantasyon** şablonları (Türkçe/metric).  
(Allplan ile kesintisiz dokümantasyon ve metraj araçları: [1](https://allbim.com.tr/))

---

# Ek A — Denetim Listeleri
- **Ön-Kurulum:** Donanım, ağ, lisans, yedek.  
- **Kurulum:** Sessiz/etkileşimli, log kontrolü.  
- **Sonrası:** Ofis standardı, yetkiler, bulut entegrasyonu.  
(İş akışı ve verimlilik odaklı kontrol noktaları: [1](https://allbim.com.tr/))

# Ek B — Sık Karşılaşılan Kurulum Sorunları
- **Lisans doğrulama** hataları → Saat senkronizasyonu, proxy ayarları. (Bulut/Lisans erişim altyapısı bağlamı: [3](https://www.allplan.com/tr/system/releasenotes/2025/allplan-2025/))  
- **Veri klasörü** erişim hataları → NTFS izinleri ve antivirüs hariç listesi. (Kurumsal ofis standardı ve ağ paylaşımı: [1](https://allbim.com.tr/))  
- **GPU/Render** sorunları → Sürücü güncellemesi ve güç profili optimizasyonu. (AI görselleştirme ve render iş akışları: [5](https://dailycadcam.com/allplan-2025-released-for-bim/))