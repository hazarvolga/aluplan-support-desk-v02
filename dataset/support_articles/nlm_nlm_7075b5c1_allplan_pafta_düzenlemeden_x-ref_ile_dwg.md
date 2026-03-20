# Allplan Pafta Düzenlemeden X-Ref ile DWG Dönüşümü

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T18:57:41.067112
> **Orijinal ID:** nlm-7075b5c1

---

Yapılandırılmış Destek Makalesi: Allplan Pafta Düzenlemeden X-Ref ile DWG Dönüşümü
Sorun Tanımı: AutoCAD yazılımı, Allplan'ın aksine çoklu çizim dosyası mantığına değil, sadece tek bir konstrüksiyon (model) alanına sahiptir
1
. Tasarımcıların Allplan'daki katmanlı yapıyı koruyarak AutoCAD'e veri aktarması gerektiğinde; paftadan bir adet "Ana Plan-DWG" ve paftanın içerdiği her bir çizim dosyası için ayrı bir "X-Ref-DWG" üretilmesi gerekir
1
2
.
Temel Çözüm Adımları:
Pafta Düzenleme modülünü açıp dışa aktarılacak paftayı aktif hale getirin
2
.
Menüden Dosya > Dosya Gönder > AutoCAD Verisi Gönder... (File > Export > AutoCAD Data) komutunu çalıştırın
2
.
Açılan pencerede DWG dosyasının kaydedileceği yeri ve ismini belirledikten sonra Seçenekler (Options) butonuna tıklayın
3
.
Genel Ayarlar sekmesinde, dışa aktarım favorisi olarak "Karmaşık Pafta Katmandan Katmana" (Favori 3) seçeneğini uygulayın
2
3
.
'AutoCAD tanımlıda' sekmesinde, transfer edilecek bölüm olarak "Tasarım" (Model) seçeneğini işaretleyin
4
.
Kaydet ve Tamam diyerek işlemi başlatın. Sistem, paftadaki her çizim dosyası için işlemi tekrarlayarak X-Ref dosyalarını üretecektir
4
5
.
Dikkat Edilecek Noktalar:
Eleman Patlatma (Explode): Gelişmiş Ayarlar menüsündeki "Patlatılacak elemanlar" bölümünde, "Desenli elemanlar" seçeneğinin işaretli olmamasına dikkat edin
4
.
Filtreleme Geçerliliği: Dışa aktarım filtresinden "Yardımcı çizgiler" gibi basılmayacak elemanları kapattığınızda, bu filtre hem ana DWG hem de tüm X-Ref çizim dosyaları için ortak olarak uygulanır
6
.
Katman Aktarımı: Bu işlemle üretilen tüm ayrı DWG dosyalarındaki Allplan katmanları (layer), doğrudan AutoCAD katmanlarına dönüştürülerek aktarılır
7
.
En İyi Uygulamalar (Best Practices):
Veri Optimizasyonu: Desenler AutoCAD tarafından doğal olarak tanınmadığı için, "Veri alımında oluştur" bölümünden desenleri (pattern) sadece "çizgi" olarak aktarılacak şekilde değiştirmek dışa aktarım dosya boyutunu büyük oranda azaltır
3
.
Tek Dosyada Birleştirme: Eğer veriyi alan partneriniz çok sayıda X-Ref dosyasıyla çalışmak istemiyorsa, AutoCAD içerisindeki "Bind" komutunu kullanabilir veya ücretsiz DWG TrueView yazılımındaki "DWG Convert" aracını kullanarak tüm X-Ref'leri tek bir DWG dosyasına sorunsuzca sıkıştırabilir
7
8
.
Bu detaylı iş akışını da arka planda hazırlanan bilgi bankası raporunuza ekleyerek belgenizi güncelleyeyim mi? Ardından Allplan Share üzerinden projeleri güvenle yedekleme (backup) veya Bimplus bulut platformuna model yükleme adımlarına geçmek ister misiniz?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
