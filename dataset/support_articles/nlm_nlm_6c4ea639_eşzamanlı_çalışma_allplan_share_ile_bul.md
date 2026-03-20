# Eşzamanlı Çalışma: Allplan Share ile bulut üzerinden eşzamanlı modelleme, dosya kilitleme (Locking) 

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:51:27.707894
> **Orijinal ID:** nlm-6c4ea639

---

Destek Makalesi: Allplan Share ile Bulut Üzerinden Eşzamanlı Çalışma ve Optimizasyon
Sorun Tanımı: Farklı lokasyonlardaki proje ekiplerinin bulut (Allplan Share) üzerinden aynı projede çalışırken yavaşlık, senkronizasyon hataları veya başka bir kullanıcının dosyayı açık unutması nedeniyle "dosya kilitlenme" (locking) problemleri yaşaması
1
2
.
Temel Çözüm Adımları:
Bulut Altyapısı ve Kilitleme (Locking): Allplan Share projeleri Bimplus platformunda barındırılır. Bir kullanıcı bir çizim dosyasını (drawing file), paftayı veya dosya setini düzenlemek için açtığında, veri çakışmasını önlemek adına o dosya anında kilitlenir
3
4
. Diğer ekip üyeleri bu kilitli dosyayı yalnızca salt okunur (referans modunda) açıp görüntüleyebilir
3
4
.
Senkronizasyon İşlemi: Allplan Share verileri anlık değil, işlem bazlı senkronize eder. Yaptığınız değişikliklerin buluta aktarılması ve diğer kullanıcılara görünmesi için; çizim dosyasını kapatmanız, referans moduna geçirmeniz, pafta (layout) düzenleyicisine geçmeniz veya manuel olarak "Kaydet" butonuna basmanız gerekir
1
5
.
Kilitlerin Yönetilmesi: İnternet kesintisi veya projenin aniden kapanması gibi durumlarda dosyalar kilitli (asılı) kalabilir
6
7
. Yöneticiler, "Kilit Bilgilerini Yönet" (Manage locking information) menüsünü kullanarak bu kilitleri manuel olarak kaldırabilir ve dosyayı tekrar erişime açabilir
6
7
.
Dikkat Edilecek Noktalar:
Çalışma bittiğinde veya uzun bir molaya çıkıldığında projenin tamamen kapatılması gerekir. Bu sayede asılı kalan dosya kilitleri serbest bırakılır ve diğer kullanıcıların çalışması engellenmez
1
2
.
En İyi Uygulamalar (Best Practices) - Yerel Önbellek (Local Cache) Optimizasyonu:
SSD Kullanımı: Buluttaki projeyi açtığınızda veriler bilgisayarınızdaki yerel bir önbellek klasörüne (...\Nemetschek\Share) kopyalanır
1
8
. Performans kayıplarını önlemek için bu klasör mutlaka hızlı bir yerel SSD diskte tutulmalı, kesinlikle ağ (network) sürücülerine kurulmamalıdır
1
9
.
Paylaşım Yasağı: Yerel önbellek klasörünüzü kesinlikle diğer kullanıcılarla paylaşıma açmayın; bu durum ciddi çökme ve veri kilitlenme sorunlarına yol açar
1
9
.
Ağ Kalitesi: Kablosuz (WLAN) yerine her zaman kablolu (LAN) ağ bağlantısını tercih edin ve ağ gecikmesinin (latency) 50 milisaniyenin (ideal olarak 10 ms altı) altında olduğundan emin olun
1
10
.
Allplan Share'in arka plandaki çalışma mantığını ve optimizasyon kurallarını bu makaleyle netleştirmiş olduk. Bulut üzerindeki projelerinizin güvenliği için Allplan Share Proje Yedekleme (Backup) ve Geri Yükleme (Restore) iş akışlarına dair bir makale daha hazırlamamı ister misiniz? Yoksa farklı bir konuya mı geçelim?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
