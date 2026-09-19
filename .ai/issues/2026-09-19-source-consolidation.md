# Local source consolidation — 2026-09-19

## Sanitized full-app boot passed; customer acceptance blocked — 2026-09-19

Exact accepted18929781 backend image booted normally on NEW sanitized Sept17 clone plus fresh Redis; health HTTP200 with DB/Redis/BullMQ/storage/memory up. Preboot structured credential assertion0 and62protected fingerprints matched. No published ports, host binds or real provider credentials; internal Docker network/restricted DNS. Disposable mutable clone only; cron may change local copied records, so postboot business parity is NOT claimed.

Customer probe stopped before fixtures/HTTP: copied CUSTOMER role has0 permissions (ADMIN16, SUPPORT_AGENT16;23permission definitions). Current RbacGuard requires route permissions and JWT authority comes from DB. This is a release compatibility blocker requiring narrow role-policy review, not proof current live service is broken. No roles/permissions were granted to force a pass. No customer login, ticket, reply or isolation acceptance is claimed.

Probe guard tests4/4 pass, including actual stdin execution rejection. Initial stdin invocation silently did not execute and is explicitly excluded from evidence; corrected entrypoint and safe aggregate failure counters verified actual execution (0HTTP checks, AssertionError at role prerequisite). Independent static review covered code/security and persisted-reply proof. Probe uses manual cookie replay, not browser-cookie proof. Raw backend logs were not exposed. New owned app/Redis/PG containers and network were removed; label inventories empty. Original raw/sanitized artifacts and reference resources preserved. No production access, push or deploy. Next inspect minimal CUSTOMER permissions and current-versus-candidate authorization before any RBAC migration; preserve deny boundaries and avoid broad grants.

## Sanitized rehearsal artifact prepared and restored — 2026-09-19

Added only a pure local-tooling helper `scripts/rehearsal-sanitization.mjs` and5 focused tests. No application/runtime/schema/migration edits. The helper emits fixed-policy transaction SQL and assertion SQL after validating required fields, strict identifiers, duplicate/unknown credential-like columns and complete supplied column inventory. Optional migrated user session/reset/verification fields are handled explicitly. It does not connect to a database or authorize app startup. Tests RED then5/5GREEN; measured helper line/branch/function coverage100%. Independent code and security reviews approve this bounded use; secret scans clean.

A NEW network-none, no-host-port/bind PG17 container restored the checksum-verified Sept17 raw snapshot; original reference container and existing volumes remained untouched. Before writes: original schema approval hash and raw archive hash bound; all62 tables/617 base columns exactly matched the reviewed schema; no user triggers/RLS/rewrite rules found. A deliberately mismatched inventory failed inside PostgreSQL and full-table fingerprints remained identical. Correct sanitation then produced0 unsafe structured-credential rows and equal protected fingerprints across all62 tables, excluding only the documented authentication/integration fields. Invalidated copied passwords/refresh state, cleared CRM credentials/endpoints/delta links/settings values and disabled webhooks; no rows removed. Prior and new full-table comparisons were separate from aggregate count checks.

Private artifact `.private-data/release-input/sanitized-20260919-527f2bdff9/` contains0600 dump/READY/checksum/sanitization evidence under0700 directory. Dump141531226bytes, SHA256 `c7a2aeb8969841e8e17e07e6e43241d3fb768a358f017e9716aeb08a11e673c4`, generated with pg_dump17.10. READY records sourceSept17, structuredCredentialsSanitized=true, anonymized=false, applicationStartAllowed=false and productionGo=false. PII/free text/JSON and historical jobs remain; credential-name heuristics are not comprehensive secret detection. Never commit or publish these artifacts. Original raw/encrypted inputs are retained separately.

The SAME accepted18929781 image and unchanged A13 runner then restored THIS sanitized dump into another new isolated baseline/candidate and ran both migration passes. Run `sanitized-20260919-18929781` exit0; private LOCAL-A13/parity/cleanup receipts complete. Protected business/RAG/object-reference/sequence/schema/RBAC checks passed, second pass no-op;180tickets/563messages/114attachment records/1285users retained. This establishes restore/migration compatibility for the sanitized snapshot, not application workflow acceptance. All owned sanitation/drill containers and drill network/volume removed; fresh label inventories empty. No NestJS/Redis/provider/customer-login started in this phase, no live/push/deploy.

Next minimum: restore this sanitized artifact into a new mutable full-app test clone with fresh random signing/encryption secrets and emptyRedis/blockedegress. Create two synthetic customer/account/profile fixtures without granting extra permissions to copied roles; authenticate only synthetic users. Test own/cross-customer ticket/reply/attachment access and CSRF, recording scheduled local mutations separately. Existing-account login does not by itself prove CRM admission; test that policy independently. Production-mode Secure/domain cookies require separately scoped browser acceptance; an isolated HTTP probe manually forwarding test cookies is not browser-cookie proof. Synthetic uploaded bytes do not prove historic114attachment bodies, and same-image restart is not old-version rollback. Overall release remains NO-GO.

## Synthetic normal application startup passed — 2026-09-19

Accepted backend image `sha256:b802af9e6d9a6819d9721d1705dbe3555d9c20c1ce03a6b22eb61d856060cbd3` started through its UNCHANGED normal entrypoint against a new empty PG17 database and fresh Redis8.8.2 (`sha256:96cb544fa0af5aa898d160cffb7dae70c3df117190fc123831c64712cda425ff`). No customer dump, existing volume, host bind, production env or provider keys were supplied. PostgreSQL/Redis used disposable tmpfs data; no host ports were published. Backend retained default non-root identity, dropped capabilities/no-new-privileges, bounded resources and ephemeral writable layer. Synthetic unique random JWT/action/encryption/Swagger/DB secrets were generated only for the run. LOCAL storage explicitly selected.

Normal migration/parity/RBAC startup completed sufficiently to launch NestJS. `GET /api/v1/health` returned status ok with database, redis, bullmq, storage, memory_heap and memory_rss up. This proves bounded synthetic bootstrap/dependency health, NOT customer login/reset, ticket writes, frontend/browser, attachment bytes, sustained cron behavior or release rollback. Child process exit0; all owned containers/network removed. Fresh label-filtered inventory also returned empty; no live access or changes.

Before bootstrap, a separate synthetic probe on a Docker internal network with `--dns 127.0.0.1` observed public TCP443 ENETUNREACH, external DNS ESERVFAIL and a temporary host-loopback canary timeout. Probe network/canary were closed. These are sampled boundary checks, not a comprehensive network security proof; keep internal-only network, explicit DNS configuration, no published ports/host mounts and no real credentials in subsequent rehearsal. The previous raw migration drill was not this full application test.

Preflight found production startup additionally requires SWAGGER_PASSWORD and exactly64-hex ENCRYPTION_KEY despite looser optional/schema declarations. Synthetic run supplied both; no application config validation was weakened. Provider keys were not needed for bootstrap; their actual calls remain untested.

Owner confirmed fresh Redis instead of copying live queues. Existing reference sanitizer intentionally preserves historical records, clears structured credentials only, and marks applicationStartAllowed=false. Do not directly run its hardcoded old-reference script or attach NestJS to reference databases. Fresh Redis does not suppress new SLA/CRM repeat jobs, announcement reconciliation, retention or nightly jobs. Next bounded customer-copy rehearsal must use a NEW sanitized mutable clone, verify preboot sanitation/fingerprints, create only synthetic test identities, and account for scheduled local mutations separately from API actions. Prefer normal unchanged entrypoint and explicitly attributed local deltas; do not silently disable schedules then call it normal production acceptance. Existing source/reference records remain untouched. Production mail TLS, host/credential recovery, fresh release-time data/object parity and new-write-preserving rollback remain open.

## Real isolated PG17 restore/migration rehearsal passed — 2026-09-19

Independent security/evidence review verified all58 baseline business fingerprints exactly match corresponding post-migration entries, post-round1/round2 JSON equality, aggregate counts and zero remaining owned Docker resources. Approval is limited to this local drill; schema/RBAC/migration ledger intentionally change, so whole-database identity is not claimed.

Unchanged A13 restore script completed with exit0 using accepted image/source18929781. Run `restore-20260919-18929781`; private evidence under `.private-data/release-evidence/a13-restore/restore-20260919-18929781/`. LOCAL-A13 reports complete, parity verified, cleanup clean; productionGo remains false. This supersedes the pending A13 restore statements below, not application/release gates.

Input is the previously approved September17 attempt-2 capture, NOT fresh live data. Encrypted file size/SHA verified against original receipt; a NEW operator-private0700 input directory holds a0600 decrypted custom dump (141542982bytes), whose SHA matches both original capture and schema approval. The verified archive header identifies pg_dump17.9. Adapted local READY metadata explicitly retains source date, unsanitized status and applicationStartAllowed=false. Original encrypted artifact/key and stopped raw/sanitized reference container were not modified or started. The new plaintext input is sensitive customer data, Git-ignored, retained only for controlled local rehearsal; it is not an anonymized export or off-host backup.

Preflight independent review raised a potential defaultUID1000 versus host0700/0600 bind-read issue. A real synthetic-only probe passed on this Docker Desktop, so no code/permission/root override was made. This result is platform-specific, not portable UID ownership proof.

The drill created its own internal network and fresh PG17 volume/container, published no ports, restored raw baseline, cloned candidate, captured fingerprints and ran migrations twice using the exact non-root backend image. Before/after/second counts remain180tickets,563ticket_messages,114attachment records,1285users. Protected business fingerprints, RAG, object references, sequences, baseline RBAC/schema and reviewed additive changes passed script checks; business table set58->59 reflects the allowed empty faq_entry_sources addition. Second migration explicitly no-op; first/second post fingerprints equal. No NestJS, Redis, worker, email, CRM, AI or storage provider started. Local PG17arm64 differs from deployment architecture/version and is logical compatibility evidence only.

Owned temporary containers/network/volume were removed; fresh label-filtered inventories returned empty. Private evidence retained; ephemeral connection env files removed by script. Existing Docker volumes were not reused or deleted. No production access, push or deploy.

Next: verify a sanitized mutable working clone and fresh Redis with enforced external-traffic isolation before actual application startup. Exercise login/reset/CRM eligibility, customer isolation, tickets/replies and attachment bytes, then designated rollback image against candidate-created writes on the migrated database. Do not restore an old dump over new writes. Attachment bytes were not in this capture; full object parity and fresh release-time backup remain open, as do mail TLS compatibility and host/credential recovery.

## Corrected exact-image static and permission acceptance — 2026-09-19

Clean source `189297816a84998928a3efb5f5d01f1a19dc65f5` built Linux/amd64 successfully. Immutable image `sha256:b802af9e6d9a6819d9721d1705dbe3555d9c20c1ce03a6b22eb61d856060cbd3` passed the real network-none/read-only A13 smoke:56 migration files match the manifest, PG dump/restore17.11, AWS CLI and shell checks passed; owned smoke container removal verified. Private completed evidence is under `.private-data/release-evidence/a13-images/image-189297816a84998928a3efb5f5d01f1a19dc65f5/`; `image.json.sha256` verified. This supersedes pending-rebuild statements below, not remaining release gates.

A separate disposable writable-layer container used the SAME immutable image, default UID1000, network none, no mounts/env file, dropped capabilities and no-new-privileges. Four representative code directories and three root-owned files rejected writes; files remained readable. Writes succeeded in uploads, OpenAPI and both existing dist/source MJML screens directories. Prisma7.4.2 and Chromium149 version commands exited0 under Node20.20.2. Prisma was invoked from `/tmp` and therefore reported no local @prisma/client; this was a CLI check, not client/DB acceptance. No browser rendering, migration engine execution against DB, application boot or recursive permission audit is claimed. Existing mounts/custom storage ownership and persistence remain untested. Probe container removed automatically; no running containers remained.

Next smallest stage is the existing A13 PG17 isolated restore/migration drill after verifying the local artifact contract. It does NOT sanitize data or start NestJS. Full application acceptance additionally needs a verified sanitized mutable clone, fresh Redis, enforced provider egress isolation and no live credentials/settings. Normal startup still migrates. Test candidate-created tickets/replies/attachment bytes and designated rollback-image readability without replacing the database with an old dump. Mail-server TLS compatibility and host/credential recovery remain separately gated. Overall production NO-GO; no live access, database writes, provider messages, push or deploy in this batch.

## Exact-image first attempt — permission gate caught a blocker

Correction: image preparation now explicitly uses Git `tar.umask=0022` and permission-preserving tar extraction. Regression RED reproduced0600/0700, GREEN12/12; combined non-root/image/restore contracts69/69 pass, exit0. An actual Git archive probe independently confirmed0644 source,0755 executable/directory and0700 private parent. Code/security review approve the scoped correction; changed diff secret scan is clean. Two broad scripts-scan detections were independently classified as existing synthetic RBAC digest fixture false positives, not credentials. No runtime/Dockerfile privilege relaxation. Corrected exact-image acceptance remains pending until rebuilt.

Frozen source `904376e472589ce0c8b6815a21b1d31e4f865242` built successfully as Linux/amd64 (11.18 MB transferred context), but the network-disabled static smoke FAILED with EACCES reading `/app/scripts/verify-migration-integrity.mjs` as node. Image ID: `sha256:c4f2966c9936c487d3d7bd027e8dfba8f1d4a6e3ffc477e60428b1e45d01944e`. This image is rejected; successful compilation is not runtime acceptance. No completed image evidence was published.

Disposable read-only inspection confirmed UID/GID1000, root-owned source files0600 versus generated dist files0644. Root cause: the image-evidence script's protective umask077 also masked Git archive extraction permissions. Fix the archive materialization, not application privilege or code ownership. Private evidence roots remain0700. The failed smoke and permission-inspection containers were removed; no existing volumes, application boot, database, provider, production, push or deployment were involved. A corrected clean revision must be rebuilt and retested before any application/data rehearsal.

## Minimal non-root backend candidate — 2026-09-19

Final combined source/tooling regression:68/68 passed (5 non-root contracts +63 fake-Docker release/restore contracts), normal exit0. Independent code review approved local checkpoint. No runtime artifact acceptance implied. Prior mail-fixture whitespace-only change was verified with `git diff -w --exit-code` and independent review, and retained in a separate style commit.

Dockerfile now ends with `USER node`, `HOME=/home/node`. Application code remains root-owned. Only `/app/uploads`, precreated `/app/openapi.json` and existing MJML `screens` directories are assigned to node. Standard dist, legacy dist/src and source fallback bases are handled conditionally: absent higher-priority template bases are not created, preserving the existing template lookup. Layouts/partials/locales, generated client, migrations and node_modules remain root-owned. No npm/Prisma removal, dependency change, startup bypass, schema edit or runtime application-code change in this batch.

Read-only write-path audit found the unconditional OpenAPI startup write and template-edit writes; simply appending USER would have broken those flows. LOCAL uploads require node access; custom STORAGE_LOCAL_PATH and existing mounts need separately verified owner/ACL compatibility because a mount hides image permissions. /tmp and /home/node support temporary/cache use. In-process DB backup is disabled; operator backups require a separately provisioned owned0700 root/marker, not application ownership of /app/.private-data. Template/upload persistence still needs exact-image/volume acceptance; this patch does not make container-local changes durable.

Regression-first source contracts initially failed for missing USER/write provisions, then passed5/5 after implementation and conditional-template checks. These inspect Dockerfile/startup contracts, not Linux filesystem behavior. No exact new image has been built or run yet; UID, permission-denied tests for code, writable-path tests, Prisma migration engine/cache and Chromium behavior remain required in the current Linux/amd64 artifact. Therefore non-root runtime is prepared in source, NOT closed as a runtime release gate. Existing base image was not available under its pinned reference locally; historical images are not substitutes.

No production, credentials, DB, application startup, volume changes or container creation/deletion. Pre-existing mail fixture indentation-only diff is preserved separately and not part of this change. Next: freeze this source revision and build/test the exact artifact in isolation before application/data rehearsal. Migration-on-start behavior remains unchanged and requires the existing approved migration gate.

## Stabilization-only checkpoint — 2026-09-19

Owner explicitly deferred new customer requests/features. Freeze scope to demonstrated security, compatibility and data-preservation release blockers. Do not expand into redesigns or blanket dependency upgrades. Source-equivalence statements below describe consolidation time; subsequent strict mail-client commits intentionally changed the candidate.

Current audit baseline: `0f86ab2d`, initially clean. Local Docker context `desktop-linux` is accessible; no running containers were listed. Cached `aluplan-backend-security-hotfix:local` is arm64, user `node`, but has no revision label; it is NOT proof for this release. Cached PG17 image is also arm64. No containers/images/volumes started, changed or removed during this audit.

Fresh verification: all56 migration SQL files match the56-entry checksum manifest. This is local file integrity, not live ledger/schema equivalence. Existing A13 safety/image-smoke contract suites passed63/63 with fake Docker and synthetic artifacts; this is tooling regression evidence, NOT a real Docker build, DB restore or runtime rehearsal.

| Gate | Current evidence | Remaining minimum |
| --- | --- | --- |
| Mail client | Strict TLS patch and29 focused mock tests previously passed | Real local TLS transport acceptance, then separately approved server compatibility and sender-trust evidence |
| Backend identity/privilege | Current Dockerfile has no USER directive; old hardened image differs | Small non-root patch with writable-path checks; exact revision-bound Linux/amd64 artifact |
| Startup/schema | Fail-closed manifest, migration, ledger/schema/RBAC checks exist; PG17 tooling corrected | Fresh disposable PG17 and sanitized clone rehearsal; boot DOES run migrations, so no migration-free release claim |
| Recovery tools |63 contract tests and56 manifest checks pass | Real current-artifact restore/run evidence; contract tests cannot substitute |
| Customer workflows | Historical isolated unit results only for broader application | Boot exact candidate with fresh Redis, blocked provider egress and verified sanitized mutable clone; login/reset, customer isolation, ticket/reply/attachment tests |
| Rollback/data | Existing restore drill checks DB fingerprints and object references only | Prove attachment bytes and rollback app can read new candidate-created writes on migrated schema; never restore stale DB over new writes |
| Production | No new live inspection this turn | Separate approval for fresh ledger/backup/object parity, actual rollback artifact and host/credential decision; no deployment authorization |

Independent read-only release audit confirmed several historical warnings are now stale: PG17 client selection and fail-closed DR delegation exist; ordinary boot no longer performs seed/repair. However it still applies migrations. Existing A13 smoke and restore explicitly do not start NestJS and do not prove application rollback. Worker/cron initialization requires runtime isolation, not simply blanking a few configuration values. Do not attach raw or old partially sanitized reference data to a running application.

After wire-level mail tests, the next bounded implementation is backend non-root runtime acceptance, followed by exact-image isolated application/data rehearsal. New source test success does not close live mail compatibility or incident recovery. Overall decision remains NO-GO.

## Result and scope

Canonical-history worktree: `../aluplan-release-candidate-20260919`, branch `security/release-candidate-20260919`, based on `9b5d6870`. Original canonical dirty checkout and isolated candidate are preserved. This worktree is the next release-development source, not an approved production release.

All 885 tracked source files match isolated candidate checkpoint `20b2faf` byte-for-byte. All 279 canonical-only entries are preserved, including one dataset symlink whose target was compared without following it. Original local source changes are represented in the candidate; no non-document dirty source file was omitted. Relative to canonical HEAD: 40 modified and 29 added files, no deletions. The earlier 20 changed / seven added comparison used the dirty canonical working tree, not HEAD.

Local commits:

- `7b3a1321`: five dependency manifest/lock files.
- `394020a8`: 35 regression test/config files.
- `4626f627`: 28 application/helper/translation files.
- `23d3dac0`: release inventory compatibility script.

No new application behavior was authored during consolidation. No schema, migration, Docker, CI, Compose or startup-script changes. Canonical-only files are preserved, not newly approved for execution. No deployment, database or provider command was run.

## Verification

- Independent code and security reviews approved mechanical LOCAL consolidation only.
- Staged 69-file diff: Gitleaks no findings; whitespace check passed.
- Fresh isolated backend run: 149 suites passed, 1728 tests passed, one pre-existing skip; normal exit 0.
- Fresh isolated frontend run: 47 suites / 327 tests passed; normal exit 0.
- Fresh backend and frontend TypeScript checks: exit 0.
- Execution occurred in the existing restricted candidate environment with byte-identical source, NOT in this new worktree. No dependency installation or service startup in the new worktree. This is source-equivalent regression evidence, not an acceptance test of the newly combined deployment environment.
- Logs: sibling `.aluplan-dependency-check-20260917/consolidation-{backend,frontend,typecheck,frontend-typecheck}-20260919.log`.

Initial preservation verifier attempted to read the canonical dataset symlink as a file and failed; corrected to compare the link target without accessing data. Copying also initially removed one executable bit on `scripts/capture-release-fingerprints.mjs`; canonical modes restored and independently verified. Neither diagnostic failure was counted as successful verification.

## Next gates

Do not merge/push/deploy yet. Exact Linux/amd64 build and non-root runtime acceptance, mail TLS and actual sender trust, isolated database/schema/attachment/browser/rollback acceptance and host/credential decisions remain open. Email is actively used; provider uncertain. Preserve CRM-membership eligibility policy and existing customer email workflow.

Next small implementation batch: backend runtime hardening / mail TLS with focused tests and explicit compatibility evidence; sender admission requires verified ingress contract. Do not run retained boot scripts without reviewing their DB effects. Do not copy local data over production.

Restore tag `restore/consolidated-source-20260919` identifies the final documentation-inclusive checkpoint. A verified local bundle and test evidence archive are stored in the canonical checkout's private checkpoint directory. Local restore artifacts are not remote backup or production DB backup.
