# PLAN: Dataset & Platform Tam Uyumluluk Senkronizasyonu

Hazırlanan Allplan Datasetinin, `/aluplan-support-desk-V02` platformunun veritabanı şeması ve `KnowledgePool` işlemcisi ile %100 "Plug-and-Play" (Tak-Çalıştır) çalışabilmesi için gereken teknik eşlemeler aşağıdadır.

## 🤖 Orchestration Team (Phase 1)
- **project-planner:** Yapısal alan eşleşmesi (JSON -> Schema mapper).
- **database-architect:** `pgvector` uyumluluğu ve `nomic-embed-text` (768 dim) konfigürasyon denetimi.
- **backend-specialist:** `KnowledgePoolProcessor.ts` içindeki `SmartChunker`'ın Markdown dosya yapımızı nasıl okuyacağının analizi.

## 1. Alan Eşleşme (Mapping) Analizi

| Dataset Alanı (JSON) | Platform Şeması (FaqEntry) | Değişiklik Gerekli mi? |
| :--- | :--- | :--- |
| `question` | `question` | Hayır (Tam Uyumlu) |
| `short_answer` / `detailed_answer` | `answer` | **Evet (Merge edilmeli)** |
| `tags` | `tags` | Hayır (Tam Uyumlu) |
| `id` | `id` (UUID) | **Evet (UUID'ye dönüştürülmeli)** |

## 2. Markdown Yapılandırması
Platformdaki `TurndownService` ve `SmartChunker` başlık hiyerarşisine (# ve ##) duyarlıdır. Makalelerimiz bu yapıya zaten uygundur; ancak platform dosya adını bizzat `KnowledgeSource` adı olarak kullandığı için dosya isimleri "Hata_Kodu_Cezumi.md" yerine daha "insan okunabilir" hale çekilmelidir.

## 3. Vektör Uyumluluğu
Platform `Ollama` üzerinden `nomic-embed-text` (768 dimension) kullanıyor. Datasetimizin ham metin (plain text) olması bu noktada bir avantajdır; çünkü platforma yüklendiği an platform bu vektörleri kendi embedding servisi üzerinden oluşturacaktır.

---

## ✅ Plan Onay Durumu
Bu plan, datasetin yapısal olarak platformun "yutabileceği" hale getirilmesini hedefler. Sadece bir rapor olarak sunulacak, kod değişikliği yapılmayacaktır.

**Onaylıyor musunuz? (Y/N)**
