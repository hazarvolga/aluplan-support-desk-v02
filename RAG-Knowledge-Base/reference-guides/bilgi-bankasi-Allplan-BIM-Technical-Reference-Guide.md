---
title: Allplan BIM Kapsamlı Teknik Referans El Kitabı
category: Technical_References
source: Allplan-BIM-Comprehensive-Technical-Reference-Guide.txt
tags: [BIM, Technical Reference, Open BIM, IFC, BCF, PythonPart, Visual Scripting]
---

# Allplan BIM Kapsamlı Teknik Referans El Kitabı

**Yazar:** Manus AI  
**Versiyon:** 1.0 (Derinlemesine Teknik Revizyon)  
**Hedef Kitle:** BIM Yöneticileri, Deneyimli Mimarlar, Yapısal ve İnşaat Mühendisleri

Bu el kitabı, Allplan BIM yazılımının profesyonel düzeydeki kullanımını, özellikle Open BIM iş akışlarını, ileri modelleme tekniklerini ve otomasyon özelliklerini derinlemesine teknik detaylarla ele almaktadır.

---

## BÖLÜM 1: OPEN BIM VE VERİ YÖNETİMİNDE UZMANLIK

Allplan, yazılım bağımsız işbirliğini destekleyen Open BIM felsefesinin merkezinde yer alır. Profesyonel bir iş akışı, modelin geometrisinden (LoG) çok, içerdiği bilgiye (LoI) odaklanır.

### 1.1. IFC Veri Alışverişi ve Nitelik Eşleme (Attribute Mapping)
IFC (Industry Foundation Classes) formatında veri alışverişi, Allplan'ın en kritik işlevlerinden biridir. Veri kalitesini sağlamak için nitelik eşlemesi hayati önem taşır.

#### 1.1.1. IFC Dışa Aktarım İş Akışı
1. **Model Hazırlığı:** Dışa aktarılacak çizim dosyalarını (Drawing Files) ve bina yapısını (Building Structure) kontrol edin. Yalnızca ilgili katmanların (Layer) görünür olduğundan emin olun.
2. **Dışa Aktarım Ayarları:** `Dosya > Dışa Aktar > IFC Verisi` yolunu izleyin. Gelişmiş ayarlar (Advanced) penceresini açın.
3. **Değişim Profili (Exchange Profile) Seçimi:** IFC dosya türünü (örn. IFC 4.3 veya IFC 2x3) ve ilgili değişim profilini seçin. Standart profillerden birini seçebilir veya ofis standardınıza uygun yeni bir profil oluşturabilirsiniz.
4. **Nitelik Eşleme (Attribute Assignment):** Bu, en kritik adımdır.
   - Nitelik Eşleme alanında mevcut bir atamayı seçin veya `Yeni...` butonu ile yeni bir atama (.cfg dosyası) oluşturun.
   - *Allplan'dan IFC'ye Dönüşüm Yönü* iletişim kutusunda, Allplan'daki standart ve kullanıcı tanımlı niteliklerin (User-defined Attributes) hangi IFC özellik kümelerine (Property Sets - Pset) ve hangi IFC nesnelerine (IfcWall, IfcBeam vb.) eşleneceğini tanımlayın.
   - *Yalnızca Atanan Nitelikleri Aktar* seçeneğini işaretleyerek gereksiz verinin aktarımını engelleyin.

#### 1.1.2. IDS (Information Delivery Specification) Uygulaması
Allplan 2026 ve sonraki sürümler, BIM modelinin belirli bilgi gereksinimlerine (IDS) uygunluğunu kontrol etmeyi ve gerekli nitelikleri içe aktarmayı destekler.
- **İş Akışı:** Projeniz için tanımlanmış bir IDS dosyası (.json) varsa, Allplan bu dosyayı kullanarak modeldeki bileşenlerin (örneğin, bir duvarın yangın dayanımı niteliği) eksik veya yanlış olup olmadığını kontrol edebilir.
- **Teknik Detay:** IDS, Allplan'daki Nitelik Yöneticisi ile entegre çalışarak, modelleme sırasında bileşenlere atanması gereken zorunlu nitelikleri ve bunların kabul edilebilir değer aralıklarını tanımlar.

### 1.2. BCF ve Çakışma Yönetimi (Issue Management)
BCF (BIM Collaboration Format), model tabanlı iletişim ve sorun yönetimi için kullanılır.
- **Bimplus Entegrasyonu:** Allplan, Bimplus platformu üzerinden BCF 2.0 ve 2.1 formatlarını destekler. Bu, modeldeki bir çakışmanın veya sorunun (Issue) doğrudan Bimplus'a aktarılmasını, ilgili kişiye atanmasını ve çözüm sonrası durumunun takip edilmesini sağlar.
- **Adım Adım Çakışma Çözümü:**
  1. **Çakışma Tespiti:** Modelde bir Çakışma Tespiti (Clash Detection) çalıştırın.
  2. **BCF Sorunu Oluşturma:** Tespit edilen çakışmayı seçin ve Issue Manager (Sorun Yöneticisi) aracılığıyla bir BCF sorunu oluşturun. Sorunun konumunu, ekran görüntüsünü, sorumlusunu ve açıklamasını ekleyin.
  3. **Bimplus Senkronizasyonu:** Sorunu Bimplus'a senkronize edin.
  4. **Geri Bildirim:** İlgili disiplin (örneğin, MEP mühendisi) sorunu kendi yazılımında (BCF desteği olan) açar, modeli düzeltir ve durumu Bimplus'ta Çözüldü olarak işaretler.
  5. **Allplan Güncellemesi:** Allplan kullanıcısı, Bimplus'tan güncel BCF durumunu çekerek modelin güncellendiğini doğrular.

---

## BÖLÜM 2: İLERİ MODELLEME VE DETAYLANDIRMA TEKNİKLERİ

### 2.1. Yapısal Detaylandırma: Donatı Modellemesi
Allplan, karmaşık donatı detaylandırmasını otomatikleştiren güçlü araçlara sahiptir.

#### 2.1.1. Çubuk Donatı Detaylandırma İş Akışı
1. **Kesit Oluşturma:** Donatısı yapılacak yapısal elemanın (kiriş, kolon, perde) ilgili yerinden 2D Kesit alın.
2. **Donatı Yerleşimi:** `Mühendislik > Donatı` sekmesinden *Çubuk Donatı* komutunu seçin.
   - **Çap ve Çelik Sınıfı:** Gerekli donatı çapını ve çelik sınıfını (örneğin, B500C) belirleyin.
   - **Beton Örtüsü:** Kesit görünüşte, donatıyı yerleştirmeden önce doğru beton örtüsü (Concrete Cover) miktarını tanımlayın.
   - **Yerleştirme:** Donatıyı serbestçe çizin veya otomatik yerleştirme seçeneklerini kullanın.
3. **Donatı Yerleşimi (Placement):** Donatıyı bir alana yerleştirmek için Donatı Yerleşimi komutunu kullanın. Yerleştirme tipini (Tekil, Düzgün Aralık, Değişken Aralık) ve başlangıç/bitiş mesafelerini teknik çizim standartlarına uygun olarak ayarlayın.
4. **Donatı Raporu (Bending Schedule):** Donatı modellemesi tamamlandığında, Raporlar (Reports) aracını kullanarak otomatik olarak Donatı Listesi (Bending Schedule), Metraj ve Kesme/Bükme Şemaları oluşturun.

#### 2.1.2. Kolon Donatısı Otomasyonu
Tekrarlanan yapısal elemanlar için PythonParts ile otomasyon kullanılır.
- **ALLTO PythonParts Örneği:** Harici olarak geliştirilen (veya Python API ile oluşturulan) Kolon Donatısı PythonPart'ı, kolon geometrisini ve yükleme koşullarını girdi olarak alır.
- **Adımlar:**
  1. Kolonu seçin.
  2. PythonPart'ı çalıştırın.
  3. Gelen iletişim kutusunda Ana Donatı Çapı, Etriye Çapı, Etriye Aralığı ve Bindirme Boyu (Overlap Length) gibi parametreleri girin.
  4. PythonPart, bu parametrelere göre 3D donatıyı otomatik olarak yerleştirir, bindirme boylarını hesaplar ve gerekli kesitleri oluşturur.

### 2.2. Çelik Yapı Detaylandırma ve Entegrasyon
Allplan, çelik yapı detaylandırmasında SDS2 ile entegrasyon sunar.
- **Akıllı Bağlantılar:** Allplan'da modellenen çelik elemanlar (kiriş, kolon) için SDS2 entegrasyonu sayesinde, bağlantı noktalarında otomatik olarak akıllı, çakışmasız ve mühendislik hesaplarına dayalı cıvatalı veya kaynaklı bağlantılar tasarlanır.
- **İş Akışı:**
  1. Allplan'da çelik yapı modelini oluşturun.
  2. Modeli SDS2'ye aktarın.
  3. SDS2, bağlantıları otomatik tasarlar ve detaylandırır.
  4. Detaylandırılmış model, imalat (fabrication) için gerekli tüm bilgileri (NC dosyaları) içerir.

### 2.3. Mimari Modelleme: PythonPart ve Visual Scripting
Parametrik nesneler oluşturmak ve tekrarlayan görevleri otomatikleştirmek için kullanılır.

#### 2.3.1. PythonPart Geliştirme Ortamı
- **Kurulum:** Python API, Allplan ile birlikte gelir. Geliştirme için Visual Studio Code gibi bir IDE kullanılır.
- **Başlangıç:** Allplan içinde `PythonPart CreateVisualStudioCodeWorkspace` komutu çalıştırılarak hızlıca bir geliştirme ortamı oluşturulur.
- **Temel Yapı:** Bir PythonPart, bir nesnenin geometrisini ve niteliklerini tanımlayan Python kodundan oluşur. Bu kod, kullanıcı arayüzü (UI) üzerinden girilen parametrelerle nesneyi dinamik olarak oluşturur.

#### 2.3.2. Visual Scripting (Görsel Betikleme)
Kod yazma bilgisi olmayan kullanıcıların parametrik nesneler oluşturması için görsel bir araçtır.
- **İş Akışı:**
  1. Visual Scripting modülünü açın.
  2. Geometri, matematik ve BIM işlevlerini temsil eden düğümleri (nodes) bir araya getirin.
  3. Düğümleri birbirine bağlayarak bir veri akışı oluşturun.
  4. Örneğin, bir pencere bileşeni oluşturmak için Genişlik, Yükseklik ve Kasa Kalınlığı gibi parametre düğümlerini, Kutu Oluştur (Create Box) ve Pencere Bileşeni Oluştur (Create Window Component) gibi geometri düğümleriyle birleştirin.
  5. Oluşturulan betiği bir Akıllı Nesne olarak kaydedin.

---

## BÖLÜM 3: ALTYAPI, ARAZİ VE OTOMASYON

### 3.1. Parametrik Yol Tasarımı
Allplan, altyapı projelerinde yol tasarımını parametrik bir yaklaşımla ele alır.
- **Yatay ve Düşey Güzergah (Alignment):** Yolun 3D modelini oluşturmadan önce, yatay (plan) ve düşey (profil) güzergahlar hassas bir şekilde tanımlanır.
- **Kesit Şablonları (Cross-Section Templates):** Yolun her bir kesiti için (kaplama, temel, banket, şevler) parametrik şablonlar oluşturulur. Bu şablonlar, yolun güzergahı boyunca otomatik olarak uygulanır.
- **Teknik Detay:** Güzergah üzerinde yapılan herhangi bir değişiklik (örneğin, yatay kurp yarıçapının değiştirilmesi), yol modelinin tamamının ve ilgili metrajların otomatik olarak yeniden hesaplanmasını tetikler. Bu, revizyon süreçlerinde büyük zaman tasarrufu sağlar.

### 3.2. Arazi Modellemesi ve Nokta Bulutları
- **Arazi Modeli Oluşturma:**
  1. **Veri İçe Aktarımı:** Arazi verileri genellikle anket noktaları (Survey Points) veya nokta bulutları (Point Clouds) olarak içe aktarılır. Nokta bulutları için Scalypso gibi entegre araçlar kullanılabilir.
  2. **Filtreleme:** Nokta bulutu verilerinde, modelleme için gereksiz noktalar (ağaçlar, araçlar, binalar) filtrelenir.
  3. **Üçgenleme:** Kalan noktalar kullanılarak bir Sayısal Arazi Modeli (DTM) oluşturulur.
- **Şantiye Hazırlığı:** Oluşturulan arazi modeli üzerinde Hafriyat/Dolgu hesaplamaları yapılır. Vinçler, konteynerler ve geçici yollar gibi şantiye ekipmanları 3D olarak yerleştirilerek lojistik planlama optimize edilir.

### 3.3. Python API ile Gelişmiş Otomasyon
Allplan Python API, yazılımın yeteneklerini ofis standartlarına göre özelleştirmek için kullanılır.
- **Kullanım Alanları:**
  - Özel raporlar ve listeler oluşturma.
  - Tekrarlayan modelleme görevlerini (örneğin, yüzlerce kapı etiketinin güncellenmesi) otomatikleştirme.
  - Allplan dışındaki sistemlerle (örneğin, maliyetlendirme yazılımları) veri entegrasyonu.
- **Kod Örneği (Basitleştirilmiş):** Bir Python betiği, modeldeki tüm duvarların malzemesini kontrol edebilir ve belirli bir malzemeye sahip olanların yangın dayanımı niteliğini otomatik olarak güncelleyebilir.

```python
# Allplan Python API ile basit bir nitelik güncelleme örneği
def update_wall_attributes():
    # Tüm duvar nesnelerini al
    walls = allplan_api.get_elements_by_type("IfcWall")
    for wall in walls:
        # Malzeme niteliğini kontrol et
        if wall.get_attribute("Material") == "Betonarme C30":
            # Yangın Dayanımı niteliğini güncelle
            wall.set_attribute("FireRating", "REI 120")
            print(f"Duvar ID {wall.id} niteliği güncellendi: REI 120")
    allplan_api.rebuild_model()
```

---

## BÖLÜM 4: GÖRSELLEŞTİRME VE ÇIKTILARIN OPTİMİZASYONU

### 4.1. İleri Görselleştirme Ayarları
Allplan, yüksek kaliteli görsel çıktılar için gelişmiş render motorlarını kullanır.
- **Redshift Entegrasyonu:** MAXON'un GPU hızlandırmalı Redshift render motoru, fotogerçekçi görseller ve animasyonlar için kullanılır.
- **Ayarlar:** Redshift ayarlarında, Işıklandırma (Lighting) (Güneş, Gökyüzü, Yapay Işıklar), Malzeme (Material) (PBR dokuları) ve Kamera Efektleri (Alan Derinliği, Hareket Bulanıklığı) gibi parametreler hassas bir şekilde ayarlanır.
- **Yapay Zeka Tabanlı Görselleştirme:** Nemetschek AI Visualizer ve Veras AI Visualizer gibi araçlarla entegrasyon, basit bir 3D modelden veya 2D çizimden, stilize edilmiş (suluboya, fotogerçekçi, konsept) görsellerin hızla üretilmesini sağlar.

### 4.2. Çıktı Yönetimi ve Dağıtımı
- **ALLPLAN Exchange:** Web tabanlı bu araç, çizim ve plan dağıtımını otomatikleştirir. Plan revizyonları yapıldığında, ilgili paydaşlara otomatik e-posta bildirimleri gönderilir.
- **3D PDF Dışa Aktarımı:** Modelin 3D geometrisi ve nitelikleri, Allplan kullanmayan kişilerin bile ücretsiz bir PDF okuyucu ile modeli incelemesine olanak tanıyan 3D PDF formatında dışa aktarılabilir.

---

## SONUÇ VE İLERİ KAYNAKLAR
Bu teknik referans, Allplan BIM'in profesyonel kullanıcılar için sunduğu temel ve ileri düzey iş akışlarını kapsamaktadır. Başarılı bir BIM uygulaması için, bu teknik bilgilerin ofis standartlarınızla entegre edilmesi esastır.

### İleri Kaynaklar:
1. [Allplan Python API Dokümantasyonu](https://pythonparts.allplan.com/latest/manual/getting_started/)
2. [Allplan Yardım Merkezi (IFC Ayarları)](https://help.allplan.com/Allplan/2023-0/1033/Allplan/87733.htm)
3. [Allplan Connect Forumu (Teknik Tartışmalar)](https://connect.allplan.com/forum/)
4. [Allplan Blog (Detaylı İş Akışları)](https://www.allplan.com/blog/)
