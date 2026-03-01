# PLAN: Phase 9 - Türkiye İmar ve İnşaat Mevzuat Katmanı

Bu faz, dataseti sadece bir yazılım rehberi olmaktan çıkarıp, Türkiye'de çalışan bir mimar veya mühendisin yasal tasarım kriterlerini Allplan modellerine nasıl yansıtacağını bilen bir **"Yasal Danışman Zekası"** seviyesine taşır.

## 📅 Milestones (Mevzuat ve İmar Yol Haritası)

### 1. Temel Kanun ve Yönetmelik Sentezi
- **3194 Sayılı İmar Kanunu:** Ruhsat süreçleri, kaçak yapı tanımları ve yasal sorumlulukların Allplan proje yönetimine (Bimplus) entegrasyonu.
- **Planlı Alanlar İmar Yönetmeliği:** Taban Alanı Katsayısı (TAKS), Kat Alanı Kat Sayısı (KAKS/Emsal) hesaplamalarının Allplan 'Area Calculation' modülüyle eşleştirilmesi.

### 2. Mimari Tasarım ve Ruhsat Kriterleri
- **Otopark, Sığınak ve Yangın Yönetmelikleri:** Allplan objelerinin (Room, Wall, Slab) bu yönetmeliklerdeki minimum ölçü/standartlara göre 'Validation' kurallarına bağlanması.
- **E-Ruhsat ve Dijital Onay:** Belediye ve bakanlıkların dijital ruhsat süreçlerinde istediği model standartlarının teknik dökümantasyonu.

### 3. Profesyonel Mevzuat Veri Seti
- `allplan_qa_dataset.json` için "Mevzuat ve İmar" odaklı 10 yeni soru (TAKS/KAKS hesabı, sığınak ölçüleri vb.).
- `turkey_regulatory_standards.md`: Allplan kullanırken yasal tasarım sınırlarını gösteren teknik rehber.

---

## ✅ Plan Onay Durumu
Bu adım, dataseti Türkiye'deki "Profesyonel Mimarlık ve Mühendislik" dünyasının tam merkezine oturtacaktır.

**Onaylıyor musunuz? (Y/N)**
