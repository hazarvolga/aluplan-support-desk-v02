# Candidate upload admission patch — 2026-09-17

## Result and scope

Small candidate-only fix: preserve existing upload routes, MIME validators, guards, persistence and 25/5/50 MiB ceilings; add parser-time resource limits to the three previously post-buffer-only routes. No application redesign, env change or migration. No production/DB/provider access, push or deploy. Canonical877 source-manifest hashes remain unchanged. Release remains NO-GO.

Candidate source changes: attachments/attachments.controller.ts, branding/branding.controller.ts, knowledge-pool/knowledge-pool.controller.ts under apps/backend/src. New focused tests: attachments/upload-limits.spec.ts and upload-limits.http.spec.ts. Direct multer pinned2.3.0; bounded root override `multer@>=2.0.0 <2.3.0` covers Nest's private dependency; lock refreshed with existing restricted installer, lifecycle/pnpmfile disabled. Both direct and Nest-installed versions verified2.3.0.

[Official Express security release](https://expressjs.com/en/blog/2026-08-31-security-releases/) and [array-index advisory](https://github.com/expressjs/multer/security/advisories/GHSA-535w-7cp7-47q4) checked before selecting2.3.0. No mass upgrade. Whole-workspace audit now0 critical/109 high/141 moderate/21 low, with no Multer entries, versus retained0/119/143/23. This is not an exact runtime image or production exploitability scan.

## Behavior and compatibility

- Attachments25MiB and branding5MiB: one file, no text fields, parts ceiling2.
- Knowledge50MiB: one file, one text field, parts ceiling3; existing default1MiB text bound explicit; `fieldArrayIndexLimit:0` rejects positive numeric indices. Flat frontend `name` preserved. Parts ceiling accommodates Busboy limit-event behavior; separate file/field counts constrain actual content.
- Existing frontend api.ts payloads443–445 (knowledge file/name),757–758 (attachment file),871–872 (branding file) inspected. No frontend edits.
- Existing post-parse MaxFileSizeValidator rejects exactly-the-ceiling files; unchanged. Real MIME validation retained, not mocked away.
- Static impact review used because callable GitNexus impact tools were unavailable. Only three route option objects changed; no service/DTO/global guard redesign.

## Actual evidence

| Check | Result |
|---|---|
| Initial stream regression | RED7failed/16passed before controller changes |
| Real Nest interceptor/Multer stream tests | GREEN23/23: valid payloads, near-limit, oversized, extra fields/files, wrong file field, truncated multipart, text/index bounds |
| Real fixed-loopback HTTP tests |15/15: three successful controller flows; oversized413, extra fields/files400, test-guard403; denied requests do not call storage |
| Runtime direct/Nest package version test | RED old2.1.0, GREEN2.3.0 |
| Original offline sandbox probes |14/14pass |
| Separate HTTP fixture boundary | Fixedlocalhost52984 works; localhost4000/5432/52983, public443 and Docker socket denied with EPERM/EACCES |
| Independent code/security-boundary review | Narrow patch approved; no introduced Critical/High identified |
| Backend full typecheck | FAIL exit2; missing generated packages/database/client causes missing Prisma model/enum exports and downstream errors. No generated client or DB access introduced to hide this prerequisite. Other errors not fully triaged. |

HTTP test launcher adds fixed `--experimental-vm-modules` for Jest's genuine FileTypeValidator dynamic import. Initial happy-path400 errors were test-runtime configuration failures; after enabling module support all15 pass, no validation bypass. Separate fixed-command sandbox permits only synthetic HTTP port; original offline sandbox remains unchanged. Guard and provider mocks mean this proves routing/parser/guard ordering, **not real JWT/RBAC, storage or customer data integration**. Test server and registry proxy stopped; ports52983/52984 verified unoccupied after tests.

## Boundaries and next step

- Per-request limits are not aggregate concurrent-upload memory control. Truncated multipart is not a TCP-abort recovery proof. Customer Hotinfo route is not part of this three-route fix.
- No full build, full suite/coverage, exact Linux image or real data recovery acceptance. Existing file-type/parser findings remain separately tracked; not all upload security issues are closed.
- Next narrow change: failed physical storage must not appear as successful durable upload. First reproduce S3 failure with synthetic fixtures, then select minimal explicit failure behavior preserving existing records and API compatibility. Do not rewrite historical customer data.
- Canonical application files are untouched. Candidate changes are preserved in private local recovery archives, not yet imported as canonical product-code commits. This Git checkpoint records evidence, not a published/release application revision. Separate tested transfer is still required; local archives are not off-device backups.

## Recovery

Private ignored `.private-data/dependency-gate-20260917/upload-patch-inputs.tgz` contains current manifests/lock, three controllers, two new tests and original source manifest. SHA256: `6f0bf859561bdcfe7774d42ec7e1848f60083c92f48bf0a138cf26ff66addf6d`. Incremental upload-patch-evidence.tgz contains new harness controls, version test, audit and test/typecheck logs. Retain original source checkpoint and earlier controls archives for complete recovery. Archives mode0600; no live data included.

Evidence archive SHA256: `06fa0717ef96697ba91ee9febf59851530fbaa588c4ea92284c724cba7bb7f3b`.

## Follow-up: storage failure contract — 2026-09-17

Small candidate-only continuation, independently reviewed. `StorageService.uploadFile` now rejects generic503 when configured S3 lacks credentials/client, settings lookup fails or PutObject fails; it never silently substitutes local storage. Explicit LOCAL storage still works; directory/write failures produce the same sanitized503. No provider details are returned or logged by the new upload catch. Successful key/response contracts remain unchanged.

Attachment controller authorizes first, awaits successful storage, then optionally parses Hotinfo and creates metadata. It no longer creates `FAILED_STORAGE_UPLOAD_*` success records. Hotinfo parsing failure after successful storage remains tolerated. No read/download/delete changes; no historical record/file changes, new env, migration, app startup, production/DB access, package acquisition, push or deploy.

### Evidence

- Initial durability RED:11failed/5passed. Final18 durability tests include S3 settings/credential/write failures, pending PutObject acknowledgement, LOCAL success/failure, authorization-before-storage and Hotinfo behavior.
- Root rerun:18durability+23multipart=41/41pass; expanded genuine HTTP suite18/18pass including storage503/no metadata calls for all three upload routes. Synthetic mocked storage/auth only, no real provider/customer data. No socket remains listening on52984.
- Independent code/security review approved this bounded change, not release readiness.
- General backend typecheck rerun still FAILS with missing generated Prisma exports/downstream errors; no diagnostic reported against modified storage implementation. Specs are excluded from that command: their successful SWC/Jest runs are not a complete test TypeScript check. Reviewer corrected new test index typing manually. No full build/E2E/coverage or fresh dependency audit in this continuation.
- All877original canonical source hashes still match. Candidate-only inputs13files verified byte-for-byte against archive; source changes not imported as canonical product-code commits.

### Caller compatibility: explicit release gates, not scope expansion

1. Frontend `tickets/[id]/page.tsx:369`: message is created before uploading attachments; shared catch restores input/removes optimistic display if upload fails. Manual retry may create a duplicate message. Next minimal step: represent message success separately from attachment failure and preserve a safe retry target. Do not blindly retry message creation.
2. New-ticket flow already reports partial upload error but redirects; failed files are not retained for retry. Verify acceptable customer recovery alongside the reply flow.
3. `email/email-inbound.service.ts:171,236`: attachment error is caught/logged; email can still be marked processed. Explicit failure visibility/recovery is required before shipping this changed failure behavior when inbound email is enabled. Do not automatically replay entire emails or duplicate tickets.
4. Logo UI already catches failed upload and does not save a new logo URL. Knowledge controller and LearnNow PDF flow create source metadata only after awaited storage success; static inspection, not real integration verification.

Storage acknowledgement is not a disaster-recovery proof. Successful upload followed by DB failure may leave an orphan object; existing timestamp-key collision possibility also remains. No atomic storage/DB redesign or automatic cleanup is introduced. These limitations and frontend/email gates prevent calling this production-ready.

### Recovery checkpoint

Private ignored archives, mode0600, retained beside earlier checkpoints:

- `storage-patch-inputs.tgz`: SHA256 `4a96ab9bb640b11949b93f15195345ba5675e6b4eb5a7356adb18c434ea668bb`; cumulative manifests/lock, four controllers/service files, four tests and original source manifest.
- `storage-patch-evidence.tgz`: SHA256 `9476a7446d3764106a70300fbf02911ed7e7e5f5462b31fbef60272951e2be90`; root regression, HTTP and typecheck logs. Existing HTTP controls remain in prior evidence archive.

Local evidence checkpoint only, not off-device backup or production rollback authorization. No local database may be restored over production.

## Follow-up: reply partial-success UI — 2026-09-17

Candidate-only ticket detail page, one focused spec and four translation keys in each of TR/EN/DE. No dependency, schema, backend or new infrastructure changes. Existing sanitizer and permission conditions retained; static impact limited to ticket detail page and its attachment socket callback (no callable graph impact tool).

- Keep composer contents until addMessage acknowledgement. Clear only the submitted snapshot, preserving newer text/files/AI visuals.
- Immediately retain acknowledged message; an attachment failure now shows separate pending files and retry/discard controls. Retry uses the original message ID and failed/remaining files, never addMessage. Discard clears local retry state only, never server data.
- A synchronous ref lock prevents same-tick duplicate submission; new sends wait until pending files are retried/discarded. Keyed ticket component plus active checks stop remaining uploads after navigation and keep retry state on the original ticket.
- Deduplicate HTTP/socket attachment acknowledgements by attachment ID in both arrival orders. This review-discovered race was reproduced before fixing.
- Temporary retry files are not persisted across navigation/reload; the localized UI explicitly warns about this. Lost HTTP acknowledgements still make server acceptance ambiguous: no exactly-once guarantee or backend idempotency redesign claimed.

### Verification

Initial focused RED5failed/2passed; additional socket race RED2failed/9passed. Final focused11/11. Root full frontend suite **47files/327tests passed**, frontend TypeScript check passed. Direct frontend i18n checker reports all3locales complete; all12new values additionally asserted present. Root workspace i18n wrapper initially failed because nested pnpm is absent from sanitized PATH; direct package invocation of the same checker passed without widening the environment.

Independent code/security review approved the narrow patch after the socket duplicate issue was fixed. Existing React mock/TipTap warnings remain. ReactDOM/jsdom tests mock editor/API/socket dependencies and are not actual browser E2E. Existing Playwright config starts/reuses3000/4000 services and persisted admin state; deliberately not run unchanged. Browser rendering/real auth/provider acceptance remains open, as do prior backend generation/build/recovery gates. No live/DB access, app startup, push or deployment.

Correction to prior compatibility wording: current load() catches refresh failures internally, so the demonstrated old duplicate-message path was attachment failure, not refresh failure. The new regression also confirms acknowledged replies are not restored on refresh failure.

Next bounded compatibility work: inbound-email attachment failure visibility/recovery; do not replay whole emails and duplicate tickets. New-ticket creation's partial-upload recovery and isolated browser verification remain separate acceptance checks. No automatic release follows these local fixes.

### Local recovery

Canonical877source hashes unchanged. Six archived files verified byte-for-byte after escaping bracket-containing route paths for BSD tar member matching. Earlier failed verification was an archive-selection pattern issue, not a successful restore claim.

- `reply-patch-inputs.tgz`: SHA256 `523e382540eea340e313010f36015a8cb8fe430859266ee4e411d2f95bcf8c97` (page, focused spec, three locale JSON files, original manifest).
- `reply-patch-evidence.tgz`: SHA256 `45c5088aa811635881e94651af19857498b1cbe5d6baff2b71fdc288bdd76f0f` (full test/typecheck and both i18n command logs).

Both under ignored private dependency-gate directory, mode0600. Incremental archives require previous checkpoints. Candidate source remains separate from canonical product commits; this documentation commit is evidence only, not a release source revision or remote backup.

## Follow-up: inbound attachment failure visibility — 2026-09-17

Candidate-only small change to EmailInboundService, one new focused spec and one existing-spec mock return correction. Both threaded/new-ticket paths count storage or metadata failures and continue subsequent attachments. Final successful inbound log update keeps processed=true and stores `INBOUND_ATTACHMENT_FAILURE count=N ticketMessageId=ID`; no filenames, addresses, content or raw provider errors in the new marker/error logs. Full success/no attachments explicitly sets error=null. Existing duplicate skip retains the partial-failure marker. No schema, new queue, automatic retry/replay or dashboard change.

Keeping processed=true is intentional: ticket/message creation already succeeded. Setting it false merely to retry attachments could duplicate customer messages/tickets. This is partial-failure visibility, not automatic file recovery or exactly-once delivery. If the final log update itself fails, existing replay/seen-mail ambiguity remains. An attachment metadata failure after storage success can leave an orphan object.

Evidence: initial RED10failed/2passed; new mocked public handleInboundEmails tests12/12 pass. Root ran these plus existing bounce and storage/attachment durability tests: **4suites/32tests pass**. Independent code/security review approved bounded scope. Existing inbound service suite is blocked at import by absent generated Prisma client despite its corrected addMessage mock; full backend typecheck was rerun and still fails missing database exports/downstream types. No real IMAP, mail delivery, DB connection, app startup, production access, dependency change, push or deploy.

### Operator recovery boundary

Admin email logs read outbound `emailLog`, not `inboundEmailLog`; do not claim a new dashboard warning. Durable evidence is in existing inbound log storage and generic server error logs. With separately approved read-only DB access, an operator can inspect only necessary metadata using this **unexecuted** query:

```sql
BEGIN READ ONLY;
SET LOCAL statement_timeout = '3s';
SELECT id, ticket_id, processed, processed_at, error
FROM inbound_email_logs
WHERE position('INBOUND_ATTACHMENT_FAILURE ' in error) = 1
ORDER BY created_at DESC
LIMIT 50;
ROLLBACK;
```

Verify original email/attachment availability and compare against the identified existing ticket message before any separately authorized recovery. Mailbox retention/byte recovery are unverified. Do not flip processed=false or replay the entire email. Do not insert attachment records without confirmed stored bytes. No recovery actions were executed here.

### Separate source-based authorization finding

Inbound email and OmniChannel code can use `sender?.id || ticket.userId` for a threaded reply and can create a new active user when the sender is absent. TicketsService.create has no CRM membership check in the inspected path; addMessage checks access using the passed sender identity, so substituting the ticket owner undermines that boundary. This is inconsistent with the owner's CRM-only access policy and requires a separate fail-closed sender/CRM authorization review before release. Actual enabled live intake routes and email-origin trust were not checked; no production exploit or current compromise is claimed. Membership alone also does not authenticate an email From header. No sender-policy or mail-TLS change is bundled into this visibility patch.

### Checkpoint

All877canonical source hashes unchanged; four archived files match candidate bytes. Private incremental archives (0600), retained with previous candidate/control checkpoints:

- inbound-patch-inputs.tgz SHA256 `af2dd5c6520b6ccb353a48c0b1c5cf2a19a8be07bb33ae02b8e046984d712685`.
- inbound-patch-evidence.tgz SHA256 `62313f57230659ab9e0928a5519bfd9254ede498dd1de9662bdcd1e1871dbc41`.

Evidence-only local Git checkpoint; candidate implementation remains outside canonical product commits, no off-device backup or release approval implied. Next bounded step is the email sender/CRM authorization decision and regression tests, not more generic refactoring.

## Follow-up: bounded inbound account/ownership mitigation — 2026-09-17

Owner approved continuing the proposed local-only sequence. Static impact analysis covers EmailInboundService.processMail, OmniChannelService.handleInboundEmailWebhook, their callers and TicketsService.addMessage/findOne/create. Callable GitNexus tools are unavailable and the graph is stale; no graph-based proof is claimed. Independent security review confirmed unknown-sender owner substitution, automatic ACTIVE account provisioning, and IMAP role amplification from an unverified From address.

The bounded candidate change must reject unknown, inactive, deleted or roleless accounts before domain writes; remove automatic account provisioning; require exact ownership for existing-ticket replies; and pass only CUSTOMER authority for email-origin messages. An ownership denial must never fall through into new-ticket creation. Existing processed-message duplicate fences, bounce handling and attachment failure markers remain intact. Staff cross-customer replies through inbound email are intentionally disallowed; authenticated dashboard reply behavior is not changed.

This is **risk reduction, not authenticated email admission**. A known customer's address can still be spoofed without trusted ingress evidence. Existing ACTIVE status is not proof of CRM membership or completion of secure onboarding, particularly for historically auto-created accounts. No new CRM entitlement concept, automatic account deactivation or hardcoded test-user exception is introduced. HMAC authenticates the webhook secret holder, not the claimed author. Arbitrary Authentication-Results headers must not be trusted. Full sender authenticity and CRM admission remain release blockers.

Rejected messages use the existing error record, not a new review UI or full-content quarantine. IMAP's existing markSeen behavior and mailbox retention remain operational recovery limitations. No automatic replay or mailbox mutation change is included. Before release, establish a trusted ingress contract or separately approve suspending automatic mail-to-ticket writes while preserving mailbox delivery. Do not silently ship that workflow decision.

### Offline client generation attempt

Root ran the existing network-denied harness with `pnpm --filter @aluplan/database exec prisma generate`. Prisma loaded the existing prisma.config.js; dotenv reported zero injected variables. It failed because the darwin-arm64 schema engine was unavailable and binaries.prisma.sh could not resolve inside the sandbox. Network permissions were not widened, no dependencies acquired, no database connection/migration performed and no successful client generation is claimed. Full backend typecheck/build remains open. Next generation attempt requires reviewed, bounded tool acquisition, not reuse of production credentials or blind enablement of install scripts.

### Implementation and evidence

Candidate changes are limited to the two inbound services, new `email/inbound-sender-eligibility.spec.ts`, and explicit eligible-owner fixtures in the existing inbound/attachment specs. Fixed rejection markers are `INBOUND_SENDER_NOT_ELIGIBLE` and `INBOUND_TICKET_OWNER_MISMATCH`. No new environment variable, dependency, schema or migration. This is not a standalone publishable release branch.

TDD: 32 failures / 4 passes before the fix; all 36 new tests pass after it. Root independently ran those tests plus attachment visibility, bounce and storage/attachment durability: **5 suites / 68 tests passed** in the offline sandbox. Dependencies are mocked; no actual IMAP/HTTP-provider/DB or sender authentication acceptance is claimed. Full backend TypeScript check was rerun and still fails with missing generated database exports and downstream errors. Older full service suites remain generation-blocked; their adjusted fixtures are not counted as passing tests.

All 877 canonical source files still match the original manifest. Byte-verified private incremental archives (mode0600, local only, require previous checkpoints):

- `inbound-sender-inputs.tgz`: `9c08af9517be0013082a15f460e95ed165fffd4fb0a8409567e1f69b4bd2acff` (five candidate source/test files plus original manifest).
- `inbound-sender-evidence.tgz`: `eddf69e25673d330ce81d53caf8448555b88f984cdf23f5c2f8a1f063f11a917` (root regression and failing typecheck logs).

No production access, database operation, app restart, external message, push or deployment. Next: finish sender trust/admission decision and bounded Prisma tooling acquisition, then consolidate the actual tested source into scoped local commits before isolated release rehearsal. Do not substitute evidence-only documentation commits for a reproducible code release.

Independent post-change code/security review approved this bounded local mitigation with no introduced Critical/High finding identified. The reviewer did not independently run tests; the 68-test execution is root evidence. Source files and the report passed the redacted secret scan. This approval explicitly excludes production readiness and the unresolved sender authenticity/CRM/TLS/recovery/compilation gates.
