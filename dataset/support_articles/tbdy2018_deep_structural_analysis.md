# TBDY 2018 Derin Analiz: Mühendislik Modeli ve Allplan Entegrasyonu

İngilizce yönetmelik (TBDY-2018-1-English.pdf) verilerine dayanan, Allplan Engineering modülü için kritik yapısal tasarım parametreleridir.

## 1. Deprem Yer Hareketi Seviyeleri (Ground Motion Levels)
Yönetmelik 4 ana seviye tanımlar. Allplan Share/Bimplus proje metadata kısmına bu seviyeleri 'Project Info' olarak mühürleyin:
- **DD-1:** En büyük deprem yer hareketi (T=2475 yıl). Allplan'da 'Structural Analysis' modelinde bu yüklemeye göre taşıyıcı sistem 'Migration Prevention' (GÖ) sınırında kontrol edilmelidir.
- **DD-2:** Tasarım deprem yer hareketi (T=475 yıl). Standart tasarım yüküdür.
- **DD-3:** Sık deprem yer hareketi (T=72 yıl).
- **DD-4:** Servis deprem yer hareketi (T=43 yıl).

## 2. Taşıyıcı Sistem Davranış Katsayıları (R and D)
Allplan modelindeki 'Structural Roles' (Yapısal Roller) kısmına yasal doğrulamalar için şu katsayıları nitelik (Attribute) olarak ekleyin:
- **R (System Behavior Coefficient):** Süneklik düzeyi yüksek betonarme çerçeveli sistemlerde Allplan donatıFire Payı hesaplarında `R=8` olarak baz alınmalıdır.
- **D (Overstrength Factor):** Allplan 'Design Rules' içinde `D=3` (veya ilgili sistem için tanınan değer) çarpanı, kolon birleşim bölgelerindeki kapasite tasarımlarında kullanılmalıdır.

## 3. Betonarme Taşıyıcı Sistemlerin Süneklik Seviyeleri (Chapter 7)
- **High Ductile (Süneklik Düzeyi Yüksek):** Allplan donatı kütüphanelerinde (PythonParts), kolon sarılma bölgelerinde etriye çapı Φ8'den az, aralığı ise 10cm'den fazla olamaz (TBDY Section 7.3.4).
- **Limited Ductile (Süneklik Düzeyi Sınırlı):** Allplan modellerinde bu tip sistemler için `R=4` kısıtı raporlara yansıtılmalıdır.

## 4. Yüksek Yapılar İçin Özel Kurallar (Chapter 13)
Allplan Engineering ile tasarlanan ve BYS=1 olan yüksek yapılar (H > 70m - 105m) için:
- **Health Monitoring:** Bina sağlığı izleme sistemlerinin sensör yerleşimleri Allplan 3D modelinde MEP elemanı olarak konumlandırılmalı ve Bimplus üzerinde veriye bağlanmalıdır.
- **Shear Walls:** Perde uç bölgelerindeki donatı yoğunluğu, yönetmelikteki 'Confinement' (Sargılama) formüllerine göre Allplan Legend (Lejant) tablolarında doğrulanmalıdır.

## 5. Çelik Yapılarda Sismik Tasarım (Chapter 9)
Allplan Steel modülünde;
- **Connections:** Moment aktaran birleşimlerin 'Full Penetration Butt Weld' (Tam Penetrasyonlu Küt Kaynak) detayı Allplan 3D birleşim kütüphanesine TBDY Annex 9B standartlarında işlenmelidir.
