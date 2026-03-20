# Hata Çözümleri: Asılı kalan senkronizasyon kilitlerinin Services üzerinden veya proje ayarlarından k

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:54:28.289823
> **Orijinal ID:** nlm-4761d297

---

Destek Makalesi: Allplan Share Senkronizasyon Kilitleri ve Performans Optimizasyonu
Sorun Tanımı: Bulut üzerinden (Allplan Share) ortak çalışırken internet kesintileri veya programın düzgün kapatılmaması nedeniyle dosyaların diğer kullanıcılara kilitli kalması; ayrıca ağ veya yanlış depolama yapılandırmaları sebebiyle senkronizasyonun takılması ve ciddi yavaşlıklar yaşanması
1
2
.
Temel Çözüm Adımları (Kilit Kaldırma): Asılı kalan kilitleri iki farklı yöntemle temizleyebilirsiniz:
Proje Ayarlarından: Allplan'da Yeni Proje, Proje Aç iletişim kutusunu açın. İlgili projeye sağ tıklayarak "Kilit Bilgilerini Yönet" (Manage locking information) seçeneğine girin ve listedeki kilitli dosyayı bulup "Kilit bilgisini kaldır" komutunu uygulayın
3
4
.
Services Uygulamasından (Yönetici Yetkisiyle): Allplan kapalıyken bilgisayarınızdaki Services uygulamasını başlatın. Kilit yönetimi fonksiyonunu açıp projenizi seçin ve kilit bilgisini manuel olarak silerek dosyayı diğer ekip üyelerinin erişimine açın
5
more_horiz
.
Dikkat Edilecek Noktalar (Yavaşlık Çözümleri):
SSD Kullanımı (Yerel Önbellek): Allplan Share verileri yerel bir önbelleğe (...\Nemetschek\Share) kopyalayarak çalışır. Yavaşlıkları önlemek için bu klasör kesinlikle bir ağ sürücüsünde (network drive) değil, bilgisayarınızdaki hızlı bir yerel SSD diskte bulunmalıdır
9
10
. Ayrıca bu klasörü ağdaki diğer kullanıcılarla paylaşmaktan kaçının; bu durum çökmelere yol açar
9
10
.
Ağ (LAN) Bağlantısı: Kararlı bir senkronizasyon için kablosuz (WLAN) bağlantı yerine her zaman kablolu (LAN) ağ bağlantısını tercih edin
9
10
. Ağ gecikmesi (latency) 50 milisaniyenin altında olmalı, ideal performans için 10 ms seviyelerine inilmelidir
9
10
.
En İyi Uygulamalar (Best Practices):
İşlem Bazlı Senkronizasyon: Allplan Share verileri anlık olarak değil, işlem bazlı buluta gönderir. Yaptığınız değişikliklerin diğer kullanıcılara yansıması için çizim dosyanızı düzenli aralıklarla kapatmayı, referans moduna almayı veya manuel olarak "Kaydet" işlemi yapmayı alışkanlık haline getirin
9
10
.
Projeyi Kapatma Disiplini: Mesainiz bittiğinde veya uzun molalarda projeyi tamamen kapatın; böylece sistem dosya kilitlerinizi otomatik olarak serbest bırakır
9
10
.
Bu makaleyle birlikte sistem optimizasyonu ve sorun giderme serimizi büyük ölçüde tamamlamış oluyoruz. Destek bilgi bankanız (Tailored Report) için eklemek istediğiniz başka bir hata kodu senaryosu var mı, yoksa bilgi bankanızın oluşturulma sürecini artık başlatalım mı?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
