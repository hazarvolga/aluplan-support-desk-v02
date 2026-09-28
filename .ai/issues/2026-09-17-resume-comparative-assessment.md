# Resumption comparison — 2026-09-17

Historical stage record: no-live-access/no-commit statements below describe this initial batch only. Later separately approved work is recorded in `2026-09-17-live-readonly-assessment.md`, `2026-09-17-fresh-data-quarantine.md` and `2026-09-17-git-checkpoint-workflow.md`. These later scopes do not authorize production mutation or publication.

## Decision and authority

Owner explicitly resumes local comparative work and requests multiple agents toward a data-preserving eventual release. The September8 pause is lifted for local work, not for production access, export, push or deployment. **Production remains NO-GO.** Three read-only agents reviewed security, release/data compatibility and isolated-candidate planning. Root reconciled source fingerprints and reran three source-only checks.

No product code, dependency, database, runtime, service, container or customer data changes this batch. No SSH, production application, CRM, provider administration or production data access. Public official Next security documentation was refreshed only. No install/build/full test run, commit/push/deploy. Documentation is updated.

## Fresh evidence versus September8

| Item | September8 | September17 |
| --- | --- | --- |
| HEAD | 25267a617299caf5e2b7f8ed32cc650ff523528e | Identical |
| Frozen changed/untracked source set | 52 nonignored files outside .ai | All52 hashes identical; no added/removed entries in this dirty-file set |
| Frontend/API source contract | 182frontend/233OpenAPI, missing0, raw-network0 | Rerun: same, PASS |
| RBAC source contract | 12roles/19permissions | Rerun: same, PASS; not database grants |
| Migration file checksums | 56files | Rerun:56 match canonical manifest, PASS; no DB/ledger validation |
| Focused415backend /316frontend tests | Historical successful runs | Not rerun; not fresh acceptance |
| Full backend/ops failures | 15HTTP /6sandbox-blocked cases | Not rerun/resolved |
| Live image/data/miner state | Historical bounded observations | Not accessed; current state unknown |

Node24.18.0 and pnpm9.15.4 observed. Three static scripts ran with curated env, network denied, all file writes denied, .env and canonical private-data reads denied. Git diff whitespace check passed. Source-set parity is not runtime/dependency/database parity or a recoverable backup; the fingerprint covers only its stated52 files.

## Reconfirmed blockers

1. **Critical dependency exposure:** manifest/lock still Next15.3.3, App Router. Official [RSC advisory](https://nextjs.org/blog/CVE-2025-66478) refreshed September17 confirms affected configuration. No current live-version or mining-root-cause inference. Choose a supported patched compatible release using current official advisories at implementation, not the old minimum patch alone.
2. **File durability:** storage.service.ts125–139 silently falls back to local bytes after S3 error;145–158 still issues S3 download URL. attachments.controller.ts87–103 can persist FAILED_STORAGE_UPLOAD metadata and normal response. Canonical Compose backend has no uploads volume. Source failure path, not a finding that current customer files are lost.
3. **Multipart resource bounds:** attachments.controller.ts39–50 and knowledge-pool.controller.ts48–58 use memoryStorage without early file/part limits; later25/50MB validation follows buffering. Add bounded streaming negative tests before remediation.
4. **Crawler SSRF:** knowledge-source-url.ts10–30 checks syntax; crawl.service.ts69–72 and609–614 lack complete destination/redirect/DNS/browser-subresource policy. Privileged entry, not anonymous finding. Guard definition alone is not integration evidence.
5. **CRM identity:** crm-record-sync.service.ts142–149,178–186 updates login email while retaining old credentials/session authority. Incoming-email admin bypass does not prove existing staff identity safety. Phase3d public reclaim fix remains present; it does not close CRM rebinding.
6. **Activation compatibility:** ADR021 historically records1280CUSTOMER accounts with empty explicit mappings in the working clone. Strict candidate activation needs isolated additive four-grant rehearsal; current live mappings unknown. Never bulk seed or restore implicit grants to hide incompatibility.
7. **Boot is not migration-free:** backendDockerfile109 → deploy.sh11 → migrate-once.sh25–40 executes Prisma migration deploy and validates ledger/schema/RBAC. ADR016 intentionally requires this. Either prove no pending changes and compatible checks, or review a separate runtime/migration authority design. Do not bypass boot checks.
8. **Image/CI:** canonical backend runtime still root with package tooling; frontend mutable install fallback and floating toolchain; CI metadata/security/deploy-failure gates remain incomplete. Historical sibling image scans do not certify this tree.

## Additional preservation and test hazards

- Exact-image script release-a13-exact-image-smoke.sh89–96 rejects dirty work and191–209 archives HEAD. Bypassing that guard would omit uncommitted security work. A commit SHA alone cannot identify this candidate.
- Git-tracked packages/database/prisma/dev.db exists. Contents were NOT read. Neither git archive nor git ls-files alone is a safe source-copy allowlist: deny database/customer/credential artifacts even if tracked.
- Existing Playwright config reuses localhost3000/4000 and saved admin state; tests also contain hardcoded4000 targets. Do not execute unchanged against the existing preview. Use dedicated ports, fresh synthetic state, no reuse and reviewed targets.
- Vitest unhandled-request warning is not an egress boundary. Candidate tests require externally enforced egress isolation.
- FrontendDockerfile does not explicitly build shared-schemas, whose entrypoints use dist; canonical generated outputs can hide clean-build failures. Test shared-schemas Zod3/frontend Zod4 consumer compatibility, do not assume mismatch itself proves a defect.
- Frontend build ignores lint/type failures; run independent checks. Framework/analyzer version alignment and reproducible pnpm/Node choices must be reviewed.
- Prisma config can read .env. Never propagate existing .env/private-data/auth-state into candidate.
- A13 restore drill checks migration/no-op/data fingerprints; it does not establish rollback to the previous image after newly accepted writes or attachment byte recovery.
- In-process schedules and repeatable jobs make blind blue-green overlap unsafe to assume. Establish worker ownership/draining/version compatibility before choosing topology.

## Next local batch — P1 source preservation before package work

1. Create a new sibling candidate with no symlink/hardlink dependency on canonical runtime/output/data. Preserve current working-tree source bytes, including dirty and untracked developments, not only HEAD.
2. Review an explicit manifest covering app/shared-package source, manifests/lock/config, schema/migrations and necessary verification scripts/assets. Deny .git, .env*, credentials, private-data, database/backup/export files (including tracked dev.db), uploads, auth state, logs, node_modules, dist, .next, generated clients and caches. Migration SQL is an explicit scoped exception, not all SQL dumps.
3. Reject unexplained symlinks and omissions. Verify source-to-candidate hashes and all52 development files. Candidate-only secret scan must report locations/categories without secret values; resolve hits before network/install.
4. Only then acquire dependencies with separate store/toolchain and clean env, scoped registry egress, initially disabled lifecycle scripts. Review required scripts; never install over canonical preview.
5. Build shared-schemas, independent frontend type/lint/unit checks, source contracts/i18n and production build in candidate. Use explicit loopback mock API URLs, no real provider/telemetry tokens.
6. Later main-bootstrap integration uses dedicated synthetic PG/Redis/storage and new browser ports. No existing DB/preview activation. Preserve original source until reviewed changes can be reconciled.

Candidate directory/copy, installs, upgrades and full tests are **not yet executed**. No claim that P1 is complete. This batch completes comparative P0 assessment and records the candidate construction contract.

## Data-preserving release acceptance

- Fresh separately approved production metadata is needed to fill image/schema/permissions/storage/queue comparison; historical counts cannot substitute.
- Fresh DB export and object bytes require their own separate approval, private storage/retention plan and one-way sanitized restore with provider egress denied.
- Rehearse candidate creating new synthetic tickets/messages/files, then previous compatible image reading them against the SAME updated DB/storage. Include IDs/relations/content/sequences, file SHA, sessions, queue payloads and inflight work.
- Never restore a predeployment DB or development copy over current production as routine code rollback.
- Fresh verified recovery evidence, exact source/image mapping, customer access tests, worker topology and all ten readiness gates precede GO.
- No new VPS assumed. Host integrity/incident closure remains separate; local code cannot establish it.

## Separate live-read-only decision requested, not executed

Request permission for bounded image/revision/volume/routing metadata, resource/persistence indicators and existing backup metadata; exclude raw env/secrets, invasive exploits and customer content. Reviewed aggregate read-only schema/permission/storage/queue metadata can be scoped separately before execution. No export, object bodies, backup invocation, writes, restart, migration, role/account changes, credential rotation, firewall or deploy. Active-compromise evidence would stop release preparation and require a separate containment decision.

Local work may proceed independently while that permission is withheld. Do not label current live safe, broken or compromised based only on these source findings.

## Continuation

This document supplements September8 paused-recovery-roadmap and production-readiness-gates; it supersedes their STOP only for explicitly resumed local work. Original52-file baseline remains unchanged and retained. User still controls production access and eventual publication/deployment.
