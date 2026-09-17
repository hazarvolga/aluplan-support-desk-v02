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
