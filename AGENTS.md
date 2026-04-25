## graphify — Knowledge Graph

Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.

### Mimari sorularda ÖNCE şunu yap

`graphify-out/GRAPH_REPORT.md` dosyasını oku — god node'lar, community yapısı ve sürpriz bağlantılar burada. Ham dosyaları grep'lemek yerine graf yapısını kullan.

Eğer `graphify-out/wiki/index.md` varsa, ham dosyalar yerine oradan gezin.

### Navigasyon komutları

```bash
graphify query "<soru>"              # BFS traversal — geniş bağlam
graphify path "<A>" "<B>"            # İki node arasındaki en kısa yol
graphify explain "<kavram>"          # Bir node'un komşularıyla açıklaması
```

Cross-module "X ile Y nasıl ilişkili?" sorularında grep yerine bu komutları kullan — bunlar dosyaları taramak yerine EXTRACTED + INFERRED edge'leri traverse eder.

### MCP server aktifse

`query_graph`, `get_node`, `shortest_path` araçlarını kullan — CLI komutlarına gerek yok.

### Güncel tutma

Kod dosyası değiştirdikten sonra:
```bash
graphify update .                    # AST-only, API maliyeti yok
```

Git hook'ları kurulu — her commit/checkout'ta otomatik çalışır.

### Önemli

- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil (bundled gürültü hariç tutuldu)
- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir
- Her edge EXTRACTED, INFERRED veya AMBIGUOUS olarak etiketli — güven seviyesi bellidir
- God node'lar: `AiService`, `toast()`, `emit()` — bunlar projenin gerçek çekirdek soyutlamaları
