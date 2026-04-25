## graphify

Bu projenin bilgi grafiği `graphify-out/` dizininde yaşıyor.

### Kurallar

- Mimari veya codebase sorularını yanıtlamadan önce `graphify-out/GRAPH_REPORT.md` dosyasını oku — god node'lar ve community yapısı burada
- `graphify-out/wiki/index.md` varsa ham dosyalar yerine oradan gezin
- graphify MCP server aktifse `query_graph`, `get_node`, `shortest_path` araçlarını kullan
- MCP server aktif değilse cross-module sorular için grep yerine şunları kullan:
  - `graphify query "<soru>"` — BFS traversal
  - `graphify path "<A>" "<B>"` — iki node arası en kısa yol
  - `graphify explain "<kavram>"` — node ve komşularının açıklaması
- Bu session'da kod dosyası değiştirdikten sonra `graphify update .` çalıştır (AST-only, API maliyeti yok)

### Proje bağlamı

- God node'lar: `AiService` (33 edge), `toast()` (37 edge), `emit()` (30 edge)
- `packages/database/client/runtime/` ve `node_modules/` grafa dahil değil
- Graf `graphify-out/graph.json`'da kalıcı — session'lar arası sorgu yapılabilir
