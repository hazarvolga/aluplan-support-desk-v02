# RAG Acceptance Results - 2026-05-15 Live API

## Summary

- Mode: localhost API validation
- Retrieval endpoint: `/api/v1/ai/search`
- Answer smoke endpoint: `/api/v1/ai/query?wait=true`
- Delay: 15000ms for full retrieval run and answer smoke
- Full retrieval run before adding the new regression:
  - 25 total
  - 23 pass
  - 2 fail
  - 0 throttle / 429
- Added regression:
  - `rag-tr-dwg-layer-reference-001`
  - retrieval pass
- Effective current set:
  - 26 total
  - 24 pass
  - 2 known out-of-scope failures
- Customer answer smoke:
  - 5 total
  - 5 pass
  - 0 source leaks
  - 0 `NO_MATCH`

## Passed Critical Checks

- `rag-tr-network-startup-001`
  - top source: `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - category: `Performance & Hardware`
- `rag-tr-performance-001`
  - top source: `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
- `rag-tr-graphics-driver-001`
  - top source: `[Dataset] FAQ_DE_Grafikkartentreiber_aktualisieren.pdf`
- `rag-tr-ifc-export-001`
  - top source: `[Dataset] ifc_aktarim_el_kitabi.pdf`
- `rag-tr-dwg-export-001`
  - top source: `[Dataset] FAQ_TR_Allplan Pafta Düzenleme'den X-Ref ile Karmaşık Veri Gönderme -(Export-).pdf`
- `rag-tr-dwg-layer-reference-001`
  - top source: `[Dataset] FAQ_TR_Allplan Pafta Düzenleme'den X-Ref ile Karmaşık Veri Gönderme -(Export-).pdf`
- `rag-tr-general-demotion-001`
  - top source: `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - license contamination did not recur.
- `rag-tr-duplicate-canonical-001`
  - top source: `[Dataset] FAQ_DE_Grafikkartentreiber_aktualisieren.pdf`

## Known Failures

### `rag-tr-hotinfo-001`

- Returned top source: `FAQ_TR_Allplan Pafta Düzenleme'den X-Ref ile Karmaşık Veri Gönderme -(Export-)`
- Classification: not a vendor PDF RAG failure.
- Current decision: Hotinfo is ticket-specific diagnostic context, not global RAG corpus.
- Next action: keep this outside vendor RAG acceptance unless a canonical Hotinfo PDF/TXT support source is approved.

### `rag-tr-no-ai-ticket-001`

- Returned top source: `[Dataset] faq-softlock-Softlock-Destek-2006.pdf`
- Classification: product/ticket-flow help content, not vendor PDF RAG.
- Current decision: move to product-flow acceptance, not RAG source acceptance.

## Answer Smoke

The customer-facing answer smoke passed for:

- `rag-tr-network-startup-001`
- `rag-tr-graphics-driver-001`
- `rag-tr-ifc-export-001`
- `rag-tr-dwg-layer-reference-001`
- `rag-tr-cross-lingual-001`

Observed:

- all 5 returned HTTP 200.
- all 5 returned non-empty customer answers.
- no customer answer leaked `Kaynak:` or `İlgili pasaj:`.
- no answer returned `NO_MATCH`.

## Decision

Vendor PDF RAG can be treated as stable for the current support-first corpus after this phase:

- retrieval acceptance: 24/24 in-scope checks passed.
- customer answer smoke: 5/5 critical checks passed.

The remaining two acceptance items should be tracked outside vendor PDF RAG:

- Hotinfo diagnostic product flow.
- AI-optional ticket creation product/help flow.
