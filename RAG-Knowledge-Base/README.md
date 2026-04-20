# RAG Knowledge Base - Allplan Support System

Bu klasör, AI destekli support ticket sistemi için hazırlanmış, kategorize edilmiş dokümantasyon deposudur.

## 📁 Klasör Yapısı ve İçerik

### 1. **setup-installation/** (5 dosya)
Kurulum, sistem gereksinimleri ve lisans aktivasyonu
- System requirements (Allplan, SCIA, FRILO, Share)
- Installation guides

### 2. **faq-general/** 
Genel sorular ve cevaplar

### 3. **faq-technical/** (30+ dosya)
Teknik sorunlar ve çözümler
- Grafik kartı sorunları
- Performans optimizasyonu
- Network ve VPN yapılandırması
- Allplan hız iyileştirme
- Oska E-Hakediş entegrasyonu

### 4. **faq-license/** (90+ dosya)
Lisans yönetimi ve sorun giderme
- Wibu CodeMeter lisans aktivasyonu
- Softlock lisans transferi
- Lisans sunucusu yapılandırması
- Offline aktivasyon
- Container yönetimi

### 5. **faq-export-import/** (15+ dosya)
Veri alışverişi ve format dönüşümleri
- DWG Export/Import
- IFC Export/Import
- Data exchange formats
- X-Ref kullanımı

### 6. **faq-workgroup/** (6 dosya)
Workgroup Manager ve işbirliği
- Workgroup Manager kurulumu
- Loopback adapter yapılandırması
- Kullanıcı ve bilgisayar yönetimi

### 7. **tutorial-basics/** (3 dosya)
Temel Allplan eğitimleri
- Basics Tutorial
- Steps to Views and Sections

### 8. **tutorial-architecture/** (1 dosya)
Mimari tasarım eğitimleri
- Steps to Facade

### 9. **tutorial-engineering/** 
Mühendislik eğitimleri

### 10. **tutorial-precast/** (2 dosya)
Prefabrik beton eğitimleri
- Precast Girder Bridges
- Precast Infographic

### 11. **case-studies/** (15+ dosya)
Gerçek proje vaka çalışmaları
- BFU, Enjoy Concrete, HABAU
- Identity, Karpatium Rezidence
- Leube, MoiDom, Naegele
- SPL Talards, Van Edremit School
- Krebs-Kiefer Tunnel, Porto Metro
- Rapid Stadion, Vierseithof

### 12. **reference-guides/** (180+ dosya)
Kapsamlı referans kılavuzları ve dokümanlar
- Allplan Comprehensive User Guide
- BIM Technical Reference Guide
- Allplan Share Manual
- User Guides (Architecture, Engineering, Basics)
- Features and Updates (2022-2026)
- Tools and Macros
- SCIA Engineer Manuals & Tutorials
- BIM Templates
- Training Guidelines
- Technical References
- Troubleshooting guides
- Bilgi Bankası MD dosyaları

### 13. **whitepapers-brochures/** (6 dosya)
Teknik dokümanlar ve broşürler
- Next Level BIM Whitepaper
- Civil Workflow Brochure
- Engineering Civil Brochure
- Road Design Brochure
- Precast Girder Bridges Brochure
- Bluebeam E-Book

### 14. **standards-regulations/** (1 dosya)
Standartlar ve yönetmelikler
- TBDY-2018-1 (Turkish Building Earthquake Code)

### 15. **version-features/** (6 dosya)
Versiyon karşılaştırmaları ve yeni özellikler
- Paket Karşılaştırma (2024-2026)
- New Features (2022, 2023)
- Yenilikler (Turkish)

## 📊 İstatistikler

- **Toplam Kategori:** 16
- **Toplam Dosya:** 360+ dokümantasyon dosyası
- **Diller:** Türkçe, İngilizce, Almanca
- **Format:** PDF, DOCX, MD, TXT, MSG, PNG, JPG, SVG

## 🎯 Kullanım Amacı

Bu yapı, RAG (Retrieval-Augmented Generation) sistemine kolayca yüklenebilir şekilde tasarlanmıştır:

1. **Kategorize Edilmiş:** Her dosya ilgili kategoride
2. **Prefix ile İsimlendirilmiş:** Kolay arama için (faq-, tutorial-, reference-, vb.)
3. **Sanitize Edilmiş:** Türkçe karakterler ASCII'ye dönüştürülmüş
4. **Duplicate-Free:** Tekrar eden dosyalar yok

## 🚀 RAG Sistemine Yükleme

Her kategori klasörünü ayrı ayrı veya toplu olarak RAG sistemine yükleyebilirsiniz:

```bash
# Tüm kategorileri yükle
for dir in RAG-Knowledge-Base/*/; do
  echo "Uploading: $dir"
  # RAG upload komutunuz buraya
done
```

## 📝 Notlar

- Tüm dosya isimleri sanitize edilmiştir (Türkçe karakterler → ASCII)
- Her dosya kategorisine göre prefix almıştır
- System dosyaları (.DS_Store, .kiro) hariç tutulmuştur
- Metadata ve resolved dosyaları kopyalanmamıştır

---

**Oluşturulma Tarihi:** 2025
**Amaç:** AI Destekli Allplan Support Ticket Sistemi
