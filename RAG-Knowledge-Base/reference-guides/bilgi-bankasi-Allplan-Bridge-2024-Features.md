---
title: "Allplan Bridge 2024 Özellikleri"
category: Features_and_Updates
source: features-allplan-bridge-2024.txt
tags: [Allplan Bridge, 2024, New Features, Parametric, Composite Bridges]
---

# Allplan Bridge 2024 Yenilikleri

Allplan Bridge 2024, tasarımdan inşaya (BIM) süreçlerinde devrim yaratacak yepyeni çözümler getiriyor. Özellikle arazi ilişkisi, donatı entegrasyonu ve kompozit (çelik/beton - prekast) köprülerin modellenmesi baştan aşağı güçlendirildi.

## 1. Parametrik Referanslama ile Arazi Görselleştirmesi
Yeni bir köprüyü yerleştirirken yerel topoğrafyanın güvenliğe ve estetiğe etkileri hesaplanmalıdır. 2024 sürümünde, arazinin 3 boyutlu durumu sadece görselleştirilmekle kalmaz; iskele gibi altyapı elemanları arazi profiliyle "parametrik" olarak (boyut revizyonlarında iskele yüksekliğinin araziye çarpması halinde kendini güncellemesi gibi) referanslanır.

## 2. Dever Verilerinin Bulut Aracılığıyla İçe Aktarılması
Yol mühendisi tarafından tanımlanan çapraz eğim (dever) ve aks geometrileri sadece Allplan Bridge tabanında kalmaz. 2024'te, yol kurb genişlik eğimleri vs. Allplan Cloud üzerinden direkt statik-model arayüzüne taşınarak yeniden veri girişi eziyetini siler.

## 3. Parametrik Donatı Bağlantısı (PythonParts)
Allplan Köprü'de "kod kontrolü (standartlar)" ile elde edilen boyuna, kesme ve burulma donatı kesit miktarları, doğrudan donatı detaylandırma felsefesi olan *PythonParts* teknolojisine bağlanır. Donatılar yalnızca nicelik olarak değil biçim ve 3B geometri olarak da Allplan detay çizimine dökülür.

## 4. Serbest Parametrik Modelleme 2.0
Her kiriş veya tabliye standart istasyon aksını izlemek zorunda değildir. "Serbest Parametrik Modelleme" ile çıkarılan köprü gövdesi "saf 3B katılarda" olduğu gibi şablonlanabilir, taşınabilir ve Boolean işleminden (boşluk açma, birleştirme) geçirilebilir. Birden fazla 3B şablon grubunun konumlandırıldığı *Gövde Konteynerleri* özelliği entegre edilmiştir.

## 5. Otomatik Türetilen Hesaplama Eylemleri (Konsol İnşa Sistemi)
Dengeli konsol yapım metodu (Balanced Cantilever); segmentlerin adımlı eklendiği iskele köprü kuruluklarında zamana ve basamaklara bağlı yapısal davranış (sünme, büzülme, sökme basıncı) geliştirir. Artık, sadece geometrik veri ve yapım sıralaması girilir, hesaplamadaki sayısız alt kırılım modül tarafından otomatik kurgulanır.

## 6. Yeni Ulusal Kod ve Ekler (EN)
Almanya, Fransa, İspanya, Birleşik Krallık, Avusturya ve Polonya'ya ait kod-ulusal ek standartları eklenmiştir (DIN EN, NF EN vb.). Sınır durum analiz raporları ilgili eke referans verir.

## 7. Devrim Yaratan Raporlama Aracı: Word Add-In
MS Word eklentisi (Sürükle-bırak dinamik veri bağlantısı). Tasarım ve hesaplamalara dair *gerçek zamanlı* tabloları, şekilleri, özetleri Microsoft Word dosyalarının içine linkler. Siz ölçüyü değiştirdikçe hesap-görsel dokümanınız anında Word dosyası içinde güncellenir.

## 8. Otomatik Özet Raporu (Kod Kontrolü)
Donatı tasarımı sonrasında oluşturulan "Özet Rapor", kontrol adımlarından geçen / geçmeyen detayları sınır ve kontrol testleri uyarınca özetleyerek masanıza getirir. 

## 9. Kompozit Köprülerin Yapısal Analizi
Çelik kiriş + betonarme döşeme, veya prekast kiriş + yerinde döküm levha gibi hibrid-kompozit sistemlerde, elemanların inşasının aktif edilme yaşına (kuruma-mukavemet zaman katsayısı) ve malzeme birleşim kesit dayanım idealine göre statik analizin geliştirilen halidir.

## 10. Yeni Kompozit Kesit Kod Denetimi (Concrete-to-Concrete)
Öngerilmeli beton ile inşaatın sonraki aşamasında dökülen döşemenin zaman-sünme arayüzlerindeki gerilim tepkileri standartlara uygun çapta hesaplanabilir. Eski ve yeni beton birleşiminde donatı kapasitesi özel olarak kontrol edilir.

## 11. Diğer Geliştirmeler
Gürültü bariyerleri (Jersey bariyer vb.) uzunlamasına modellenmesi için "eşlik eden çokgen aks" araçları. Parametrik montajda serbest "Dış sınır referansı" verebilme kolaylığı.
