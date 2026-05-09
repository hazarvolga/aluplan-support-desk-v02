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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **aluplan-support-desk-v02** (9060 symbols, 15769 relationships, 233 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, check index freshness |
| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |
| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |
| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
