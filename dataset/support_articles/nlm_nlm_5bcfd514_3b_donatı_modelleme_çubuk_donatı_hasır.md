# 3B Donatı Modelleme: Çubuk donatı, hasır donatı, manşon ve BAMTEC halı donatı sistemleri

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T23:10:17.921747
> **Orijinal ID:** nlm-5bcfd514

---

Destek Makalesi: 3B Donatı Modelleme (Çubuk, Hasır, Manşon ve BAMTEC)
Sorun Tanımı: Karmaşık betonarme projelerinde donatıların yalnızca 2B (iki boyutlu) planlar üzerinden çözülmesi; çubukların birleşim noktalarında fiziksel çakışmalara, eksik veya hatalı metraj hesaplarına ve şantiyede montaj zorluklarına neden olur. Ayrıca manşon gibi özel ek elemanları veya fabrikada rulo halinde üretilen BAMTEC halı donatı sistemleri gibi modern yöntemler geleneksel 2B çizimlerle doğru şekilde projelendirilemez.
Temel Çözüm Adımları:
Çubuk Donatı (Bar Reinforcement): "Bar Shape" (Donatı Şekli) aracı ile yapı elemanının içine beton örtüsü (paspayı) ve çap değerlerini girerek 3B standart veya serbest form (freeform) donatılar oluşturun
1
2
. Donatılar "Place Bar Shape" ile istenilen aralıklarla otomatik olarak alana dizilir
3
.
Hasır Donatı (Mesh Reinforcement): Döşeme ve perdelerde "Meshes" görev alanındaki "Span Reinforcement" aracı kullanılarak, belirlenen çokgen veya dikdörtgen alanlara alt ve üst hasır donatı katmanları otomatik olarak serilir
4
5
.
Manşon ve Dişli Bağlantılar (Couplers & Threads): Filiz boyu bırakmanın zor veya imkansız olduğu yerlerde donatı uçlarına manşon ekleyin. "Modify Coupler, Thread, Connecting Bar" aracı ile manşon parametreleri doğrudan 3B model veya yerleşim üzerinden kolayca düzenlenebilir
6
.
BAMTEC Halı Donatı: Şantiyede halı gibi serilerek büyük zaman tasarrufu sağlayan BAMTEC sistemi için, FEM (Sonlu elemanlar) analiz sonuçlarına göre "Carpet Outline" (Halı Sınırı) belirlenir
7
8
. Sistemin ürettiği rulo donatılar için montaj şeritleri (Mounting Strips) ve temel/ikincil donatılar otomatik hesaplanarak üretim dosyaları (.TEC) oluşturulur
9
10
.
Dikkat Edilecek Noktalar:
Hasır veya çubuk donatıları farklı katmanlara (alt/üst) yerleştirirken programdaki "Layer depth" (Katman Derinliği) ve beton örtüsü (Concrete Cover) ayarlarının doğru yapıldığından emin olun
11
12
.
Kopyalama ve aynalama (Mirror) işlemleri sonrasında donatı çaplarını güncellerken, pozların (mark numbers) karışmaması için mutlaka "Rearrange Marks" (Pozları Yeniden Düzenle) komutunu çalıştırın
13
14
.
En İyi Uygulamalar (Best Practices):
3B Model Yönetimi (Method 1): Donatıları her zaman "Reinforce with 3D model" seçeneği aktifken modelleyin
15
16
. Bu sayede donatılar planda, kesitte ve 3B görünüşte her zaman eşzamanlı ve birbiriyle bağlantılı güncellenir.
Otomatik Raporlama: Modelleme bittikten sonra "Reports" aracı ile doğrudan 3B veriden beslenen ve hata payı sıfır olan Büküm Listeleri (Bending Schedules) ve metraj tabloları oluşturun
17
18
.
3B donatı modelleme prensiplerini ve modern donatı tiplerini de tamamladık. Dilerseniz modelleme hızınızı büyük ölçüde artıran, duvar, kolon veya kirişleri tek tıkla donatılandıran Otomatik Donatılandırma (Automated Reinforcement) özelliklerine geçelim mi?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
