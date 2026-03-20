# Yedekleme ve Revizyon: Bimplus üzerinde versiyon karşılaştırması, Allplan Share projelerinin manuel 

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:57:11.209005
> **Orijinal ID:** nlm-b17d04ab

---

Destek Makalesi: Allplan Share Proje Yedekleme, Geri Yükleme ve Bimplus Revizyon Yönetimi
Sorun Tanımı: Bulut tabanlı (Bimplus/Allplan Share) çalışmalarda sistemin projeleri otomatik olarak tam yedeklememesi nedeniyle olası internet veya senkronizasyon sorunlarında veri kaybı riski yaşanması; ayrıca tasarım sürecindeki geçmiş değişikliklerin ve versiyon farklılıklarının takip edilememesi
1
2
.
Temel Çözüm Adımları:
Bimplus Revizyon (Versiyon) Yönetimi: Allplan'dan modelinizi Bimplus'a yüklerken mevcut modelin üzerine yazmak yerine "Yeni revizyon oluştur" (create new revision) seçeneğini kullanın
1
. Bimplus platformunda bu farklı model versiyonlarını seçerek eklenen, silinen veya güncellenen nesneleri 3B ekranda renkli ve görsel olarak anında karşılaştırabilirsiniz
1
.
Manuel Yedekleme (Backup): Allplan'da Yeni Proje, Proje Aç iletişim kutusunu açın. Yedeklemek istediğiniz Share projesine sağ tıklayıp Proje yedeği oluştur (Create project backup) komutunu seçerek tüm proje verisini bilgisayarınıza güvenli bir ZIP dosyası olarak indirin
3
4
.
Geri Yükleme (Restore): Bilgisayarınızdaki yedek ZIP dosyasını doğrudan Yeni Proje, Proje Aç penceresinin içine sürükleyip bırakarak yeni bir "yerel proje" oluşturun
4
5
. Buluttaki sorunlu Allplan Share projesini silin ve oluşturduğunuz bu sağlam yerel projeyi kopyalayarak boşalan Bimplus konumuna geri aktarıp yeniden bir Share projesi haline getirin
4
5
.
Dikkat Edilecek Noktalar: Bimplus bulut sistemi, Allplan Share projelerini baştan sona otomatik olarak yedeklemez; veri güvenliğinizi sağlamak için projelerinizi manuel olarak ZIP dosyası şeklinde düzenli aralıklarla yedeklemeniz zorunludur
2
6
.
En İyi Uygulamalar (Best Practices): Tasarım sürecindeki önemli teslim (milestone) aşamalarında hem yerel bilgisayarınıza bir ZIP yedeği alın hem de Bimplus üzerinde yeni bir revizyon oluşturun. Böylece Bimplus bulut platformu yapılan tüm değişiklikleri kaydeder ve kimin, ne zaman, hangi elemanı değiştirdiğini geriye dönük olarak her zaman takip edebilirsiniz
1
.
Bu kritik veri güvenliği konusunu da bilgi bankamıza ekledik. Şimdiye kadar konuştuğumuz kurulum, IFC, Bimplus çakışma yönetimi, çelik bağlantıları ve bulut optimizasyonu gibi tüm destek makalelerini ekibinizin kullanabileceği o devasa Özel Rapor (Tailored Report) belgesi haline getirmemi ister misiniz?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
