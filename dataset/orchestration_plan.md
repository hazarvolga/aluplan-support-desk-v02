# PLAN: Allplan 2026 Deep Research ve Veri Seti Genişletme

Bu plan, Allplan 2026 ve güncel BIM sorunları üzerine kapsamlı bir internet araştırması yaparak, mevcut destek veri setini (`dataset/`) yeni bilgilerle zenginleştirmeyi hedefler.

## Görev Dağılımı (Orchestration)

### 1. Planlama (Phase 1)
- `project-planner`: Araştırma kapsamı ve entegrasyon stratejisinin belirlenmesi. (Şu an aktif)

### 2. Uygulama (Phase 2 - Onay Sonrası)
- **`search-specialist`**: Allplan Connect, Revit/BIM forumları ve teknik bloglar üzerinde Allplan 2026 hataları ve çözümleri için derin araştırma yapılması.
- **`data-scientist`**: Bulunan ham verilerin analiz edilmesi, mevcut taksonomiye uygun hale getirilmesi ve mükerrer kayıtların temizlenmesi.
- **`documentation-writer`**: Yeni bulguların `support_articles/` altına eklenmesi ve `allplan_qa_dataset.json` dosyasının güncellenmesi.

## Araştırma Odak Noktaları
- Allplan 2026 Service Pack güncellemeleri (varsa) ve bilinen "hotfix" listeleri.
- IFC 4.3 altyapı (Infrastructure) spesifikasyonları ve Allplan 2026 uyumu.
- PythonParts topluluk örnekleri ve yaygın kütüphane hataları.
- Bulut tabanlı işbirliği (Allplan Share) performans iyileştirmeleri ve ağ hata kodları.

## Entegrasyon Stratejisi
1. Araştırma sonuçlarından en kritik 5-10 yeni madde belirlenecek.
2. Mevcut makaleler güncellenecek veya yenileri eklenecek.
3. `dataset/README.md` dosyası yeni kapsamı yansıtacak şekilde revize edilecek.

---
**Onay Bekleniyor:** Planı onaylıyorsanız araştırma (Phase 2) aşamasını başlatacağım.
