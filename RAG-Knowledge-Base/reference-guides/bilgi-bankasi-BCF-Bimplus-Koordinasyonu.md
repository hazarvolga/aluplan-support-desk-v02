---
title: Disiplinler Arası Koordinasyon için BCF ve Bimplus'ı Merkezileştirin
category: Tips
source: Seçilen İpucu: 3. Disiplinler Arası Koordinasyon için BCF ve Bimplus'ı Merkezileştirin.txt
tags: [BIM, Koordinasyon, Çakışma, BCF, Bimplus]
---

# İpucu: Disiplinler Arası Koordinasyon için BCF ve Bimplus'ı Merkezileştirin

## Senaryo: Çok Katlı Ofis Binası Projesinde Kritik Tesisat-Taşıyıcı Çakışmasının Çözümü
**Proje:** İstanbul'da inşa edilecek 15 katlı bir ofis binası.

### İlgili Disiplinler:
- **Mimari Grup:** Tasarımı Allplan ile yapıyor.
- **Statik Proje Grubu:** Taşıyıcı sistemi Allplan ile modelliyor.
- **Mekanik Tesisat (HVAC) Grubu:** Başka bir BIM yazılımı (örneğin Revit) kullanarak ısıtma, havalandırma ve klima sistemlerini tasarlıyor.

## Karşılaşılan Sorun: İnşaatı Durdurabilecek Bir Çakışma
Projenin koordinasyon aşamasında, BIM Koordinatörü tüm disiplinlerden gelen modelleri bir araya getirdiğinde kritik bir sorun tespit eder: Mekanik grubun tasarladığı ana havalandırma kanallarından biri, 3. katın hol tavanında, statik grubun tasarladığı 80cm yüksekliğindeki bir ana taşıyıcı kirişin (K-305) tam ortasından geçmektedir. Bu, inşaat başladığında fark edilseydi, hem maliyetli hem de projeyi geciktirecek büyük bir probleme yol açacak klasik bir disiplinler arası koordinasyon hatasıdır.

### Geleneksel (Verimsiz) Yöntemle Çözüm Girişimi:
1. BIM Koordinatörü, çakışmayı tespit ettiği yazılımda bir ekran görüntüsü alır.
2. Statik ve mekanik proje müdürlerine "Kritik Çakışma" konulu bir e-posta gönderir. E-postaya ekran görüntüsünü ekler ve çakışmanın yerini tarif etmeye çalışır: *"3. kat, B ve 5 aksları arasında kalan K-305 kirişi ile ana havalandırma kanalı çakışıyor."*
3. E-posta trafiği başlar. Mekanik mühendisi, kanalın yerini tam olarak anlayamaz. Statik mühendisi, ekran görüntüsünden hangi kiriş olduğunu bulmak için kendi projesinde zaman harcar.
4. Telefon görüşmeleri yapılır, yeni ekran görüntüleri paylaşılır. Çözüm önerileri (kirişte boşluk açılabilir mi? kanal başka yerden geçirilebilir mi?) e-postalar arasında kaybolur ve sürecin takibi imkansız hale gelir. Bu süreç, çözüme ulaşana kadar günler, hatta haftalar sürebilir.

---

## Allplan Bimplus ve BCF ile Modern ve Etkin Çözüm Senaryosu

### Adım 1: Modellerin Bimplus Platformunda Birleştirilmesi
Tüm disiplinler (Mimari, Statik ve IFC formatında Mekanik) modellerini bulut tabanlı **Allplan Bimplus** platformuna yükler. BIM Koordinatörü, platform üzerinde tüm modelleri birleştirerek federatif bir proje modeli oluşturur ve doğrudan Bimplus içinde bir Çakışma Kontrolü (Clash Detection) başlatır.

### Adım 2: BCF Sorununun (Issue) Oluşturulması
Bimplus, K-305 kirişi ile havalandırma kanalı arasındaki çakışmayı otomatik olarak bulur. BIM Koordinatörü, çakışan elemanları seçer ve bir e-posta yazmak yerine, "Sorun Oluştur" (Create Issue) butonuna tıklar. Bu, standart bir **BCF (BIM Collaboration Format)** kaydı oluşturur:

- **Başlık:** "Kritik Çakışma: HVAC Kanalı - K-305 Kirişi / 3. Kat"
- **Atanan Kişiler:** Statik Proje Müdürü ve Mekanik Proje Müdürü.
- **Durum:** Açık (Open)
- **Öncelik:** Yüksek (High)
- **Açıklama:** *"Ana besleme kanalı, K-305 kirişi ile çakışıyor. Tavan yüksekliği kısıtlamaları nedeniyle kanal aşağı indirilemiyor. Kirişte bir boşluk (penetrasyon) oluşturulması veya kanalın yeniden yönlendirilmesi için acil koordinasyon gerekmektedir."*

> En önemlisi, Bimplus bu soruna çakışmanın 3D kamera açısını, kesin koordinatlarını ve çakışan elemanların benzersiz kimliklerini (GUID) otomatik olarak ekler.

### Adım 3: Sorunun Allplan İçinde Görüntülenmesi
Statik Proje Müdürü, bir bildirim alır. Kendi Allplan yazılımını açar ve entegre Sorun Yöneticisi (Issue Manager) panelinde kendisine atanmış yeni sorunu görür. Soruna tıkladığı anda, Allplan ekranı otomatik olarak doğrudan çakışmanın olduğu noktaya zum yapar. Statik mühendisin sorunu arayıp bulmasına gerek kalmaz. Kendi taşıyıcı modelinin içinde, çakışan mekanik kanalı referans olarak görür.

### Adım 4: Çözümün Tartışılması ve Modelin Güncellenmesi
Statik mühendis, kirişi analiz eder ve kirişin taşıyıcılığını etkilemeden, ek donatılarla birlikte 40x30 cm'lik bir boşluk açılabileceğini belirler. Çözümünü, yine Allplan içindeki Sorun Yöneticisi'ne bir yorum (comment) olarak ekler: 
*"Kirişte 40x30 cm'lik bir boşluk oluşturulabilir. Modeli gerekli ek donatılarla güncelliyorum. Lütfen kanal ölçülerinizi bu boşluğa göre teyit edin."* 
Sorunun durumunu "İşlemde" (In Progress) olarak değiştirir.

### Adım 5: Geri Bildirim ve Kapanış
Mekanik mühendis, kendi BIM yazılımındaki BCF eklentisi sayesinde bu yorumu ve güncellenmiş durumu anında görür. O da tek tıkla çakışma konumuna gider. *"Boşluk ölçüleri uygundur. Kanal bağlantılarımı yeni boşluğa göre revize ediyorum."* şeklinde yanıt verir. Statik mühendis, Allplan'da kirişi revize edip modeli tekrar Bimplus'a yükler. Mekanik mühendis de kendi modelini revize eder.

### Adım 6: Doğrulama ve Kapatma
BIM Koordinatörü, güncellenmiş modellerle çakışma testini yeniden çalıştırdığında sorunun ortadan kalktığını görür. BCF kaydı üzerinden tüm yazışmaları ve çözüm sürecini şeffaf bir şekilde inceler ve sorunun durumunu "Kapalı" (Closed) olarak değiştirir.

## Sonuç
İnşaat sahasında haftalar sürecek ve büyük maliyet yaratacak bir sorun, tüm sorumluların süreci şeffaf bir şekilde takip ettiği, yazışmaların ve çözümlerin doğrudan modelle ilişkili olduğu bir ortamda, sadece birkaç saat içinde tamamen çözülmüş ve belgelenmiş olur. Bu, BCF tabanlı merkezi bir iş akışının gücünü ortaya koyan somut bir örnektir.
