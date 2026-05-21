# CrawlerIA4 Learn Now Ingestion

## Goal
Add CrawlerIA4 as a controlled ingestion layer for public Allplan Learn Now resources without changing the existing Knowledge Pool sync, parser, chunking, embedding, or rate-limit pipeline.

Initial public formats:

- `knowledge_article`
- `pdf`
- `technical_manual`
- `explaining_video`
- `recorded_online_session`

## Tasks
- [ ] Confirm crawl boundaries for `learnnow.allplan.com`: public-only pages, robots/terms check, language routes, and no login bypass. Verify: blocked/login-only URLs are skipped with a reason.
- [ ] Create a crawler candidate model or table for discovered content before Knowledge Pool import. Verify: candidates store `sourceUrl`, `title`, `language`, `format`, `contentHash`, `crawlFilter`, `status`.
- [x] Implement CrawlerIA4 adapter for Learn Now search filters: `knowledge_article`, `pdf`, `technical_manual`, `explaining_video`, and `recorded_online_session`. Verify: crawler extracts result URLs from selected filters, records pagination state, and preserves the original LearnNow format in candidate metadata.
- [ ] Add duplicate and quality gates before import. Verify: same URL/hash is skipped, empty/menu-only/too-short content is rejected, useful PDF/article content remains pending.
- [ ] Add admin review/import flow or admin endpoint to promote approved candidates into existing `knowledge_sources`. Verify: imported items enter current `knowledge-sync` queue with existing pacing settings.
- [ ] Add metadata mapping for RAG: `source=allplan_learnnow`, `sourceType=pdf|knowledge_article|technical_manual|explaining_video|recorded_online_session`, `categorySlug`, `language`, `sourceUrl`, `crawledAt`. Verify: embeddings retain metadata and search results expose source provenance.
- [ ] Run a small pilot crawl for license-server and workgroup related terms. Verify: questions about CodeMeter access rights and Workgroup checkout retrieve Learn Now candidates before unrelated content.
- [ ] Add operational controls: max pages per run, crawl delay, retry/backoff, dry-run mode, and per-domain allowlist. Verify: a dry run reports candidates without importing anything.

## Done When
- [ ] Public Learn Now PDFs, knowledge articles, technical manuals, explaining videos, and recorded online sessions can be discovered without manual upload.
- [ ] No crawler result enters RAG until it passes duplicate/quality checks and approval/import rules.
- [ ] Existing Knowledge Pool queue/rate-limit behavior remains unchanged.
- [ ] Customer ticket AI and admin draft can retrieve newly imported Learn Now sources with visible provenance.

## Notes
- Do not use CrawlerIA4 as a replacement for RAG or answer generation.
- Keep CrawlerIA4 as a separate service/container where possible.
- Start with public content only; login-protected content is out of scope unless licensing/permission is explicitly confirmed.
- Prefer a dry-run/import-review MVP before any auto-import behavior.
