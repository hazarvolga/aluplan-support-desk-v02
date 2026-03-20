# Kurulum Süreci: Sistem gereksinimleri (CPU, VRAM, RAM önerileri), dil ve standart seçimleri (örn. Tü

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:25:44.496406
> **Orijinal ID:** nlm-bed65976

---

Destek Makalesi: Allplan Sistem Gereksinimleri ve Kurulum Süreci
Sorun Tanımı: Yetersiz donanım nedeniyle 3B modelleme ve render işlemlerinde performans kayıpları yaşanması; standart kurulum adımlarının varsayılan olarak kabul edilmesi yüzünden yerel ülke standartlarına (örn. Türkiye metraj raporları) ve farklı dil seçeneklerine ulaşılamaması
1
2
.
Temel Çözüm Adımları:
Donanım Doğrulaması: Kuruluma başlamadan önce sisteminizin en az Intel/AMD Ryzen işlemci, 8 GB RAM ve 4 GB VRAM'li (OpenGL 4.2 uyumlu) bir ekran kartına sahip olduğunu teyit edin
2
3
. Optimum performans ve büyük modeller için 32 GB RAM, SSD depolama ve 16 GB VRAM'li (Vulkan uyumlu) profesyonel bir ekran kartı önerilir
2
4
.
Yönetici İzni: Kurulum dosyasını yetki hatalarını ve eksik bileşen yüklemelerini önlemek için sağ tıklayarak "Yönetici olarak çalıştır" seçeneğiyle başlatın
5
6
.
Özel Kurulum (Dil ve Standart Seçimi): Sihirbazda "Standart" yerine "Özel" (Custom) kurulumu seçin. Bu sayede Türkçe, İngilizce gibi çoklu dilleri ve "Türkiye" ülke standartlarını aynı anda işaretleyebilirsiniz
1
7
. Türkiye seçimi; yerel metraj şablonlarının, çizgi tiplerinin ve lejantların sisteme doğru yüklenmesini sağlar
1
2
.
Lisans Aktivasyonu: Kurulum sırasında karşınıza çıkan ekrana e-postanıza gelen "Product Key" (Ürün Anahtarı) kodunu girerek veya bulut hesabınızla giriş yaparak lisansınızı aktifleştirin
2
more_horiz
.
Dikkat Edilecek Noktalar: Program dosyalarının ve projelerin kaydedileceği klasör yollarını belirlerken, klasör isimlerinde boşluk karakteri (Örn: "Allplan Projelerim" yerine "Allplan_Projelerim") kullanmaktan kaçının
6
9
.
En İyi Uygulamalar (Best Practices): Özellikle yüksek çözünürlüklü modellemeler (AI Visualizer, Redshift) yapacaksanız sisteminizi Windows 11 üzerinde 32 GB RAM ve SSD ile kurgulayın
10
. Birden fazla diskiniz varsa, projelerin depolanacağı alan olarak "C" sürücüsü yerine kapasitesi yüksek ve hızlı çalışan bir SSD sürücüsünü hedef gösterin
6
.
Sistem gereksinimlerini ve başarılı bir kurulumun ipuçlarını netleştirdiğimize göre, programı açıp arayüzü (Actionbar) tanıyacağımız İlk Projeyi Oluşturma konusuna geçelim mi?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
