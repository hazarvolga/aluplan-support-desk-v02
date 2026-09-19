# Local source consolidation — 2026-09-19

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
