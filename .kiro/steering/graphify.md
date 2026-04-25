---
inclusion: always
---

## graphify — Knowledge Graph

Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.

### Mimari sorularda ÖNCE şunu yap

`graphify-out/GRAPH_REPORT.md` dosyasını oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. Ham dosyaları grep'lemek yerine graf yapısını kullan.

### Navigasyon komutları

```bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
```

### Güncel tutma

Kod dosyası değiştirdikten sonra:
```bash
graphify update .                    # AST-only, API maliyeti yok
```

Git hook'ları kurulu — her commit/checkout'ta otomatik çalışır.

### God Node'lar (en bağlantılı soyutlamalar)

`GRAPH_REPORT.md` içindeki "God Nodes" bölümüne bak. Bunlar projenin çekirdek soyutlamaları — değişiklik yaparken bu node'ları etkileyen dosyalara dikkat et.

### Önemli

- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil (bundled gürültü hariç tutuldu)
- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir
- Her edge EXTRACTED, INFERRED veya AMBIGUOUS olarak etiketli — güven seviyesi bellidir
