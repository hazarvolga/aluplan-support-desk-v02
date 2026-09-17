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
