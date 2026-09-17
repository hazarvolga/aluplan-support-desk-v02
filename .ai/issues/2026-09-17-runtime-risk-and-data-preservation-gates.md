# Runtime risk triage and data preservation gates — 2026-09-17

## Decision and evidence boundary

Release remains **NO-GO**. Absolute security and zero-loss guarantees are not supportable. This continuation is a read-only source review using three independent security reviewers, plus release/recovery reconciliation. Only project documentation is changed. No application edits, dependency acquisition, tests, app startup, DB connection, production access, push or deploy were performed in this triage.

Reviewed application: sibling `aluplan-security-candidate-20260917`. Last retained whole-workspace advisory result is **0 critical /119 high**, not a fresh scan or deployed-image result. Last retained frontend test result is316 tests; measured line coverage65.21%, below80%. These prior checks do not establish the safety of the paths below.

## Ordered implementation batches

| Batch | Source-proven concern | Acceptance before closing |
|---|---|---|
| 1 Upload admission | Nest resolves its own multer2.0.2 despite direct2.1.0. Attachments, branding and knowledge-pool memory uploads lack interceptor-time limits; later25/5/50MB validation occurs after buffering. | Patch every resolved copy, not only direct dependency. Test real multipart transport: role rejection, valid files, size boundaries, field/part/count limits, interrupted requests and bounded resource use. Keep route-specific contracts. |
| 2 File durability | `storage.service.ts:125` falls back from failed S3 to local bytes; download selection still uses S3 at145. `attachments.controller.ts:87` can persist a failed-upload marker and return an attachment. | Forced storage failures must never appear as successful durable uploads. Preserve existing metadata for diagnosis; do not delete customer records. Prove authorized upload/download and restored-byte checksums, including process/container replacement. Decide explicit failure/pending semantics and compatibility before implementation. |
| 3 Document parsers | Hotinfo uses fast-xml-parser5.3.7 without explicit entity policy; DOCX reaches xmldom0.8.13 via Mammoth; AI spreadsheet parsing reaches xlsx0.18.5 before output truncation. | Verify current advisory fixes and compatibility before choosing versions. Real XML/DOCX fixtures and bounded malicious-input tests; explicit XML entity policy; AI attachment schema/count/decoded-size limits. SheetJS replacement/distribution choice is separate, not a blind override. |
| 4 Outbound trust and rendered content | Independent URL/email/HTML review results appended below. | Test destination/redirect/DNS policy, TLS trust and browser sanitization through real consumers, not helper presence or mocks alone. |

Upload evidence: `apps/backend/src/attachments/attachments.controller.ts:40`, `branding/branding.controller.ts:77`, `knowledge-pool/knowledge-pool.controller.ts:49`. Customer Hotinfo already has a2MB interceptor limit at `customers/customers.controller.ts:49`; that does not bound expanded XML. JWT/RBAC are meaningful existing controls, but authenticated input remains untrusted. File-type sniffing itself requires bounded regression testing. Sharp is installed through Next, but attacker-controlled image bytes reaching its optimizer were not demonstrated; do not label package presence as a proven exploit.

Generic `DocumentParserService` still uses the older callable PDF parser interface while installed pdf-parse is v2; this is a suspected functionality regression requiring a real extraction test, not an observed PDF exploit. Parser unit tests mocking libraries are insufficient evidence of remediation.

## Data preservation is a separate release gate

### Additional independent findings

- **Mail identity HIGH:** `email/smtp.provider.ts:27` and `email/email-inbound.service.ts:96` disable certificate verification. SMTP lacks required STARTTLS and explicit connection/greeting/socket deadlines. TLS1.2 and IMAP authentication timeout are existing controls, not server identity verification. Interception is a precondition; active production provider settings were not inspected. Small parallel patch: strict verified encryption and bounded timeouts, trusted private CA support if needed. Prove trusted/wrong-host/untrusted TLS behavior with isolated fixtures and no real mail delivery. Rehearse compatibility before any live configuration change.
- **Outbound policy HIGH:** `webhooks/webhooks.service.ts:33` posts ticket payload/secret to stored URLs with5s timeout but no effective destination/redirect policy. `knowledge-pool/crawl.service.ts:69` follows external content and redirects; the declared `common/guards/ssrf.guard.ts` is not integrated in reviewed callers and lacks resolved-address enforcement. Existing JWT/RBAC limits who configures these URLs; this is not demonstrated anonymous SSRF. `visual-content.service.ts:132` checks its2MB limit after buffering. Require sink-level connection/DNS/redirect validation, streaming limits, and no fallback bypass after denial.
- **Browser containment HIGH:** crawler fallback launches Chromium with `--no-sandbox --disable-setuid-sandbox` at `crawl.service.ts:598`; remote subresources are unrestricted in the reviewed flow. This is not proof of browser RCE. Isolate crawler execution from application credentials and restrict all network requests/resources, not just the first URL. Preserve existing cleanup/timeouts.
- **HTML preview hardening:** legacy settings `EmailTemplates.tsx:92` and announcement admin page456/719 use unsandboxed srcDoc. Admin settings already uses a sandbox. JWT/RBAC and nonce CSP are existing protections; no unauthenticated XSS was demonstrated. Apply consistent restrictive preview sandbox and real browser checks for parent access/script/form denial.
- **SSR sanitizer gap:** `apps/frontend/src/lib/content-sanitizer.ts:28` returns raw input without window; `RichTextRenderer` consumes that result. Current reviewed ticket data loads client-side, so a server-rendered attacker payload was not demonstrated. Make sanitization server-safe or fail closed with hydration tests before introducing SSR data loading.
- **Positive comparisons to preserve:** Dynamics365 adapter validates same-origin pagination and disables redirects. Ticket descriptions/messages/internal notes use an allowlisted renderer; AI Markdown escapes input then sanitizes. Do not weaken these while upgrading dependencies. Saved DOMPurify/TipTap findings require option/path triage; package presence alone is not an exploit proof. Announcement tests that mock sanitization to identity do not validate XSS resistance.

All source paths in this subsection are relative to candidate `apps/backend/src/` unless frontend is explicit. EmailTemplates paths refer to frontend dashboard settings/admin settings. No exploit requests were run. The review is bounded, not an exhaustive penetration test.

The September17 capture report records a restored raw reference and a sanitized reference, six-table snapshot fingerprint parity and62-table sanitation parity excluding documented columns. This review did not reconnect to either DB. References are default read-only, not immutable; sanitized data still contains private free text. Attachment bytes and Redis were not captured. Current live writes after that snapshot are not included.

Required sequence:

1. Keep raw/sanitized references retained. Test only a separate mutable clone with provider traffic and worker replay blocked. Never point local code at live credentials.
2. Rehearse schema changes and CRM/customer permissions against the clone. CRM membership is the business criterion, not an invented entitlement flag; named test exceptions and administrator authority must remain explicit and tested.
3. Preserve records, keys, relations and content fingerprints. Verify file bytes, not just attachment row counts. Exercise login/reset, ticket creation/reply, internal-note isolation and cross-customer denial.
4. Rehearse code rollback **after new writes accepted by the candidate**, with schema compatibility. Restoring the old database over production is not routine rollback: it would erase later customer activity.
5. At a later explicitly approved release window, refresh consistent DB recovery evidence plus object inventory/bytes, verify restore and separate/off-device recoverability, define acceptable recovery time/data-loss window and monitored abort thresholds. A checksum or a same-disk archive alone is insufficient.

Canonical boot was re-read: `apps/backend/Dockerfile:109` invokes `apps/backend/scripts/deploy.sh`, which calls `migrate-once.sh`; that script runs `prisma migrate deploy` and ledger/schema/RBAC verification. Therefore a supposedly migration-free backend swap is **not established**. Do not bypass existing checks; review runtime/migration authority and exact pending changes before any release.

## Sustainable completion contract

- Small candidate-only batches: failing regression first, minimal fix, relevant green tests, independent review, then scoped local checkpoint. Preserve the52 prior development files and original manifest; no mass audit-fix.
- Exact release commit/lock/image architecture, non-root runtime, least privilege, full backend/frontend checks, representative coverage80% target, browser workflows and real parser/provider-boundary fixtures remain required. Passing aggregate coverage is not a substitute for security assertions.
- Record each unresolved advisory's runtime reachability, impact, remediation or justified exception, owner and review date. Do not suppress findings to improve a score.
- Incident closure is independent: local source work cannot establish VPS integrity, credential safety or absence of persistence. No fresh mining/host claim is made here. Any later active-compromise evidence requires a separate containment decision before release.
- No automatic push/deployment follows local acceptance. User's explicit remote-publication and deployment gates remain in force.
