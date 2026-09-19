# Local source consolidation — 2026-09-19

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
