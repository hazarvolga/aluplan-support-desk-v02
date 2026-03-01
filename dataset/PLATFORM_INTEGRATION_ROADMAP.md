# Allplan Destek Zekası: Entegrasyon ve Gelecek Yol Haritası

Bu doküman, oluşturulan veri setinin mevcut destek platformuna nasıl entegre edileceğini ve önerilen ileri seviye (Option A, B, C) özelliklerin teknik uygulama adımlarını açıklar.

## 🛠 1. Mevcut Platform Entegrasyonu

Platformunuzun "Self-Learning" ve "FAQ" yapısını beslemek için aşağıdaki eşleştirmeleri kullanabilirsiniz:

### A. Makale ve Dosya Entegrasyonu
- **Veri:** `support_articles/` klasöründeki Markdown dosyaları.
- **Yöntem:** Bu dosyaları platformunuzun "Makale/Bilgi Bankası" modülüne toplu olarak yükleyin. 
- **Pro İpucu:** Markdown başlıklarını (#) meta-datalara, etiketleri (#Tags) ise platformunuzun kategori sistemine eşleyin.

### B. Q&A ve FAQ Besleme
- **Veri:** `allplan_qa_dataset.json`
- **Yöntem:** JSON dosyasındaki `question_variations` alanlarını platformun "Arama/FAQ" tetikleyicilerine, `short_answer` kısmını ise hızlı yanıt (Snippet) olarak tanımlayın.

### C. Teşhis Ağaçları (Decision Trees)
- **Veri:** `support_articles/diagnostic_tree_network_error.md`
- **Yöntem:** Platformunuz "Adım Adım" rehber destekliyorsa, bu Markdown akışını etkileşimli bir "Troubleshooter" aracına dönüştürün.

---

## 🚀 2. Gelecek Yol Haritası (İleri Seviye)

### 🤖 Option A: Otonom Veri Besleme (Knowledge Scraper)
*Sistemin güncel Allplan haberlerini ve çözümlerini otomatik bulması.*
1. **Teknoloji:** Python (BeautifulSoup/Selenium) + OpenAI GPT-4o-mini (Özetleme için).
2. **Akış:** 
   - Haftalık olarak `Allplan Connect Forum`, `Allplan Help` ve `buildingSMART` sayfalarını tara.
   - Yeni başlıkları tespit et, içeriği çek.
   - AI kullanarak içeriği `support_articles` formatına (Summary, Symptoms, Solution) dönüştür.
   - Platformun API'si üzerinden taslak makale olarak sisteme gönder.

### 🧠 Option B: RAG Engine & Chatbot MVP
*Dosyalar arasında arama yapmak yerine doğrudan veriyle konuşma.*
1. **Teknoloji:** LangChain + Pinecone (veya yerel ChromaDB).
2. **Akış:** 
   - Mevcut tüm PDF, MD ve JSON dosyalarını "Vectorize" et (göm/embed).
   - Kullanıcı sorusunu vektörel uzayda ara (Semantic Search).
   - En alakalı 3-5 parçayı LLM'e (GPT-4o) gönderip "Sadece bu verilere dayanarak cevapla" de.
   - Yanıtın altına kaynak makale linkini otomatik ekle.

### 👁 Option C: Multimodal Teşhis (Visual AI)
*Ekran görüntüsünden hata tespiti.*
1. **Teknoloji:** GPT-4o with Vision (o1-preview).
2. **Akış:** 
   - `visual_asset_registry.json` içindeki "Master Screenshots" kütüphanesini AI'ya tanıt.
   - Kullanıcı bir ekran görüntüsü yüklediğinde AI'ya sor: "Bu hata mesajı veya arayüz hangi Allplan modülüne/hatasına benziyor?"
   - AI, görseldeki metni ve layoutu analiz ederek ilgili teşhis makalesini (Örn: `diagnostic_tree_network_error.md`) tetiklesin.

---

## 📈 3. Kapanış ve Öneri

Sisteminizdeki "Self-Learning" yapısını beslemek için:
- AI'nın başarılı her cevabı sonrası kullanıcı puanını (`puan > 4`) takip edin.
- Yüksek puanlı cevapları "Doğrulanmış Çözüm" olarak otomatik makaleye dönüştürüp `allplan_qa_dataset.json`'a ekleyin.

Bu yapı ile Allplan desteğinde sadece Türkiye'de değil, küresel ölçekte bir başarı hikayesi yazabilirsiniz.
