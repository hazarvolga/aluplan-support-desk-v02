# Türkiye İmar Mevzuatı: Allplan Mimari Tasarım ve Hesap Kriterleri

Türkiye'deki 3194 sayılı İmar Kanunu ve en güncel (2024-2025) Planlı Alanlar İmar Yönetmeliği hükümlerinin Allplan üzerindeki teknik izdüşümüdür.

## 1. Taban Alanı ve Kat Alanı Hesapları (TAKS / KAKS)
Allplan'ın 'Area Management' (Alan Yönetimi) modülü, yasal emsal hesapları için şu şekilde yapılandırılmalıdır:
- **TAKS (Taban Alanı Katsayısı):** Yapının parsele oturduğu izdüşüm alanı. Allplan'da 'Ground Floor' katındaki dış duvarların dış hattını esas alan bir 'Room' veya 'Surface' objesi ile takip edilir.
- **KAKS (Emsal):** İnşaat alanının parsel alanına oranı. Allplan 'Report' motorunda, emsal harici alanlar (asansör boşluğu, yangın merdiveni, tesisat alanları) yasal metrekare kodlarına göre ayrıştırılmalıdır.
- **2024-2025 Güncellemesi:** Güneş enerjisi sistemleri (paneller) ve rüzgar türbinlerinin yatay izdüşümü artık belirli şartlarda inşaat alanı hesabından muaftır. Bu elemanları Allplan'da 'Exempt_From_Area' niteliğiyle işaretleyin.

## 2. Bahçe Mesafeleri ve Yangın Merdiveni
- **Ölçüler:** Ön bahçe min. 3.00m, yan ve arka bahçeler min. 1.50m (Planlı Alanlar Yönetmeliği).
- **Allplan Uygulaması:** 'Trace Boundary' kullanarak parsel sınırlarını belirleyin. 'Distance' aracıyla modelinizin bu sınırlara yaklaşımını test edin.
- **Yangın Merdiveni:** Yönetmeliğe göre yangın merdivenleri bahçe mesafesi içine taşabilir. Allplan'da bu merdivenleri 'Non-Living-Area' sınıfında tanımlayarak emsal hesabını optimize edin.

## 3. Sosyal Donatı Zorunlulukları (Büyük Ölçekli Projeler)
- **Kreş/Gündüz Bakımevi:** İnşaat alanı > 15.000 m² ve bağımsız bölüm > 150 olan konut projelerinde zorunludur.
- **Aile Sağlığı Merkezi:** İnşaat alanı > 25.000 m² ve bağımsız bölüm > 250 olan projelerde müstakil bina olarak zorunludur.
- **Allplan Check:** Proje istatistikleri raporundan toplam m² ve bağımsız bölüm (Unit) sayısını çekerek bu yasal eşikleri kontrol edin.

## 4. Erişilebilirlik Standartları (Yaşlı ve Engelli)
Yönetmelik 2024'te "Engelliler" ifadesini "Engelliler ve Yaşlılar" olarak genişletmiştir.
- **Kapı Ölçüleri:** Bina giriş kapıları min. 1.50m, daire kapıları min. 1.00m temiz geçiş vermelidir.
- **Küpeşte:** Yaşlı bakım kuruluşlarında koridorlarda çift taraflı küpeşte zorunluluğu Allplan 'Railing' modülü ile tasarlanmalıdır.
