# Bina Yönetmelikleri: Otopark, Sığınak ve Yangın Kriterleri (Allplan)

Türkiye'deki spesifik bina yönetmeliklerinin Allplan modellerinde nasıl doğrulanacağına (Validation) dair teknik prosedürlerdir.

## 1. Otopark Yönetmeliği (1 Daire 1 Otopark)
2018 revizyonu ile her daire için en az 1 otopark alanı zorunlu hale gelmiştir.
- **Modelleme:** Otopark alanlarını 'SmartPart' araç (Car) objeleriyle doldurarak manevra alanlarını (min. koridor genişliği 4.80m - 6.00m) test edin.
- **Raporlama:** Allplan 'Room Report' üzerinden `Independent_Unit_Count` ile `Parking_Slot_Count` verilerini karşılaştırarak yönetmelik uyumunu (1:1 oranı) otomatik denetleyin.

## 2. Sığınak Yönetmeliği (7 Kasım 2025 Güncellemesi)
Apartman ve kamu binalarında zorunlu olan sığınakların teknik donanımı Allplan'da şu kriterlerle dökümante edilmelidir:
- **Havalandırma:** Kimyasal, biyolojik ve radyoaktif gazlara karşı filtreli çift devreli sistem. Allplan MEP modülünde kanalları bu filtre 'Node'larına bağlayın.
- **Altyapı:** Elektrik, su ve aydınlatma tesisatı bağımsız enerji kaynağına (jeneratör) bağlı olmalıdır.
- **Tapu Notu:** Sığınaklar 'Ortak Alan' olarak işaretlenmeli ve Allplan 'Space Management' içinde yasal brüt alandan düşülmelidir.

## 3. Yangın Yönetmeliği (Yangından Korunma Hakkında Yönetmelik)
1 Temmuz 2025 tarihli güncelleme, yangın güvenliği donanımlarının organizasyonunu zorunlu kılar.
- **Yangın Dayanımı:** Duvar ve kapı objelerinin 'Properties' (Özellikler) kısmına `Fire_Rating` (REI 60, EI 90 vb.) niteliklerini ekleyin.
- **Tahliye Projeleri:** Allplan 'Plan Layout' üzerinde acil çıkış yönlendirmelerini ve yangın dolabı lokasyonlarını otomatik işaretleyen 'Symbols' kütüphanesini kullanın.
- **Süreç:** Mevcut binaların 31 Aralık 2025'e kadar bu standartlara uygunluğu denetlenmelidir.

## 4. Deprem Yönetmeliği (TBYD 2018)
- **Allplan Engineering:** Donatı detaylandırmasında kolon-kiriş birleşim bölgelerindeki etriye sıklaştırması (h/3 bölgesi), yönetmelikteki min. çap ve aralık değerlerine göre (min. 10cm) Allplan 'Reinforcement Specification' ekranında kurgulanmalıdır.
