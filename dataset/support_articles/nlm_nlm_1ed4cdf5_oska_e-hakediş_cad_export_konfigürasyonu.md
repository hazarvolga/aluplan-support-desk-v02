# Oska e-Hakediş CAD Export Konfigürasyonu

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T18:53:51.337947
> **Orijinal ID:** nlm-1ed4cdf5

---

Yapılandırılmış Destek Makalesi: Oska e-Hakediş CAD Export Konfigürasyonu
Sorun Tanımı: Allplan modelinden elde edilen metraj ve maliyet verilerinin, Türkiye standartlarındaki Oska e-Hakediş yazılımına doğrudan aktarılamaması veya poz kataloglarının uyumsuz çalışması
1
more_horiz
.
Ön Koşullar: Her iki programın (Allplan ve Oska e-Hakediş CAD) aynı bilgisayarda kurulu olması ve Allplan'ın güncel Türkçe eklentisinin (yama) yüklenmiş olması şarttır
1
more_horiz
.
Temel Çözüm Adımları:
Katalog Entegrasyonu: C:\Program Files\Nemetschek\Allplan_[Versiyon]\Prg\@_Oska\64_Bit (veya 32_Bit) klasörüne gidin. Buradaki iXMLDialog.dll ve OskaKatalog.dll dosyalarını kopyalayıp bir üst dizin olan Prg klasörünün içine yapıştırın
3
5
.
Sistem İlişkilendirmesi: Allplan Servisler (Allmenu) uygulamasını açın. Üst menüden DXF\DWG > Genel katalog sistemini ilişkilendir – OSKA komutunu çalıştırıp, kopyaladığınız iXMLDialog.dll dosyasını seçerek aktifleştirin
6
more_horiz
.
Katalog Ataması: Allplan'ı açıp Araçlar > Seçenekler > Kataloglar menüsüne gidin. Elemanların (Bileşen, Merdiven, Oda vb.) "Katalog ataması" butonlarına tıklayarak malzeme seçimlerini user_kat olarak belirleyin
6
more_horiz
.
Dışa Aktarım (Export): İşlem bittiğinde Dosya > Dosya Gönder > OSKA'ya Metraj Verilerini Gönder... komutunu çalıştırın
4
more_horiz
.
Şablon ve Program Seçimi: Açılan giriş seçeneklerinde Ayarlar'a tıklayın. Tablo olarak Türkçe eklentiyle gelen Metraj Cetveli.rdlc dosyasını, kullanılacak program olarak ise (genelde C:\e-Oska içinde bulunan) OskaCad.exe dosyasını seçin
11
more_horiz
.
Dikkat Edilecek Noktalar ve Best Practice'ler:
Veri tutarsızlığı yaşamamak için, dışa aktarım yapmadan önce modelinizdeki tüm 3B tasarım revizyonlarının bittiğinden emin olun.
Güncel Oska poz numaralarını (örneğin "23 İLE BAŞLAYAN DEMİR POZLARI") elemanlara atarken mutlaka user_kat (OSKA Katalog) kütüphanesinin aktif olduğunu doğrulayın
16
17
.
Bu arayüz ayarları bir kez yapıldıktan sonra, metraj verilerini projeniz boyunca tek tıkla Oska'ya sorunsuzca aktarabilirsiniz
18
19
.
Bu yapılandırma makalesi ile birlikte Türkiye mevzuatına ve yerel yazılımlara entegrasyon konusunu da destek bilgi bankamıza eklemiş olduk.
Şimdiye kadar oluşturduğumuz tüm bu değerli teknik makaleleri destek ekibinizin her an kullanabileceği tek bir Özel Rapor (Tailored Report) belgesi haline getirmemi ister misiniz? Yoksa eklemek istediğiniz farklı bir senaryo var mı?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
