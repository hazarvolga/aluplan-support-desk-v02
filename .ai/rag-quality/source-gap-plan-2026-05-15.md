# RAG Source Gap Plan - 2026-05-15

## Context

Faz 3 found 6 real quality/data failures. Faz 4 fixed 2 retrieval-code failures:

- `rag-tr-general-demotion-001`
- `rag-tr-duplicate-canonical-001`

The remaining 4 failures should not be solved with broad retrieval rewrites until source coverage is confirmed.

## Active Corpus Check

Active `knowledge_sources` currently contains no strong canonical source for:

- Allplan Share / Cloud usage
- Hotinfo-specific support flow
- project backup / project exchange as a data-management topic
- product help explaining that ticket creation can be done without AI

Relevant active matches are weak or off-topic:

- `Allplan_2023_New_Features` is `General` and can leak into Hotinfo-like queries.
- `[Dataset] ifc_aktarim_el_kitabi.pdf` wins Allplan Share questions because Share/Cloud content is missing from active corpus.
- License-transfer PDFs win project backup/computer-transfer questions because backup/data-management sources are weak or not imported.
- Softlock/license PDFs win "AI olmadan ticket açma" because this is product UX/help content, not a vendor FAQ.

## Archive Candidates

### Allplan Share & Cloud

Use PDF-first sources from `.archive/rag-incoming/pdf/`:

- `.archive/rag-incoming/pdf/Allplan_Share_2022_Manual.pdf`
- `.archive/rag-incoming/pdf/Allplan_Share_2023_Manual.pdf`
- `.archive/rag-incoming/pdf/Allplan_Share_2023_Handbuch.pdf`
- `.archive/rag-incoming/pdf/System_Requirements_Allplan_Share_EN_GmbH.pdf`
- `.archive/rag-incoming/pdf/setup-System_Requirements_Allplan_Share_EN_GmbH.pdf`

Recommended dataset target:

- `dataset/en/allplan-share-cloud/batch-012/`
- `dataset/de/allplan-share-cloud/batch-012/`

### Project Data Management

Candidate PDF:

- `.archive/rag-incoming/pdf/FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
- `.archive/rag-incoming/pdf/faq-technical-FAQ-DE-Projektaustausch-incl-aller-Einstellungen-mit-Partnerbuer.pdf`

Recommended dataset target:

- `dataset/de/project-data-management/batch-012/`

Deduplicate before import; these two may be same-topic duplicates.

### Hotinfo / Hotline Tools

Archive currently shows mostly MD sources:

- `.archive/rag-incoming/FAQ-PDF/Tools_and_Macros/Hotlinetools.md`
- `.archive/rag-incoming/FAQ-PDF/reference-guides/bilgi-bankasi-Hotlinetools.md`

Recommendation:

- Do not import these yet under the PDF-first rule unless no PDF exists.
- If Hotinfo support is product-critical, create or obtain a canonical PDF/TXT support note and classify it as `Turkish Local Support`.

### AI-Optional Ticket Creation

This is not vendor RAG content.

Recommendation:

- Move `rag-tr-no-ai-ticket-001` out of PDF knowledge acceptance or mark it as an app-help acceptance item.
- Add a small product/help source only if the customer UI should answer this through RAG.
- Do not tune retrieval toward this question using unrelated Allplan PDFs.

## Next Action

Before importing Batch 012:

1. Copy only selected canonical PDFs into `dataset/{language}/{category}/batch-012/`.
2. Run dataset scan.
3. Sync only these sources with low-rate ingestion.
4. Run targeted acceptance:
   - `rag-tr-share-cloud-001`
   - `rag-tr-project-backup-001`
5. Revisit Hotinfo and AI-optional ticket creation as separate product-help/source decisions.

## Do Not Do

- Do not import generated MD duplicates from old PDF conversion unless explicitly accepted.
- Do not force broad retrieval boosts for Share/Hotinfo while canonical sources are missing.
- Do not mix this dataset/source decision with unrelated `apps/backend/openapi.json`.
