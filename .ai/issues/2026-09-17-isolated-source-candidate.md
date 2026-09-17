# Isolated source candidate — 2026-09-17

## Scope

Local-only preparation before dependency remediation. No production access, database access/migration, service restart, app startup, provider calls, push or deployment. Previous raw/sanitized references are not attached to this candidate.

Base documentation checkpoint: `785e88c1`; private recoverable dirty-source checkpoint documented in `2026-09-17-git-checkpoint-workflow.md`. All52 original source hashes rechecked unchanged at start.

## Design and acceptance gates

- Explicit source/config/migration allowlist over current tracked and nonignored untracked bytes, not HEAD-only export.
- Deny credentials/env, private artifacts, database/dump files (including tracked `packages/database/prisma/dev.db`), saved auth state/uploads, generated outputs, caches and dependency directories.
- Reject symlinks and unsafe target paths. Create only a new sibling candidate; no overwrite/hardlinks or shared node_modules. Record included/excluded manifest and verify hashes, including all52 existing developments.
- Synthetic negative tests before implementation; independent code/security review before actual copy. Secret scan before any install/network-enabled build. A clean scanner result is not proof of absence of all secrets or privacy-sensitive content.
- No blind startup: existing Playwright reuses3000/4000/admin state; Prisma config reads env; boot can apply migrations; Sentry config enables source-map integration. Clean env and externally enforced isolation remain later gates.

## Clean-build inputs identified

Root package.json/pnpm-lock.yaml/pnpm-workspace.yaml/turbo.json plus package-level config/source are required. Database workspace needs entrypoints, Prisma config/schema/migration files and checksum manifest but not dev.db/generated client. Shared-schemas exports dist, requiring an explicit clean build before frontend verification. Frontend uses Next15.3.3 with mismatched analyzer major and ignores build-time lint/type errors; independent checks and a reviewed patched dependency selection remain necessary. No package changes are made by the source-copy step.

## Execution evidence

Implemented `scripts/security-candidate-source.mjs` with its standalone Node test file. Test-first missing-module RED and required-template preservation RED were followed by final9/9GREEN. Root reran final tests with100% line/function and92.31% branch coverage for this utility only. Independent code/security reviews approved the controlled CLI copy; hardlink and checkpoint-forgery gaps found during review were corrected before execution. GitNexus tool was unavailable; no application symbols changed, standalone utility impact reviewed directly.

Final manifest:877included files /7,316,681bytes; all52 frozen development files included and exact. Copy completed into sibling `../aluplan-security-candidate-20260917` with independent bytes, exclusive target and completion manifest. Root rechecked all877 candidate SHA-256 hashes. No .env, .npmrc, .git, node_modules or tracked dev.db present. An existing `apps/backend/dataset` symlink was excluded without following it. Binary assets remain excluded pending explicit review; this is not yet a fully build-verified package.

Private reviewed plan and redacted scanner output: `.private-data/source-candidate-20260917/`. Gitleaks raw result:5findings, not zero. Security review classified4 localhost E2E authentication examples (three test-prefixed values and one intentionally invalid example) and1confirmed SHA256 false-positive in migration-checksums.json; actual SQL checksum recomputation matches. No evidence of real credentials in these findings; possible runtime reuse was not checked. No blanket scanner suppression or live credential rotation. This scoped scan is not an exhaustive confidentiality audit.

No dependencies installed/upgraded; no copied script/app executed, DB connected, migration run, live accessed or pushed/deployed. Existing source remains unchanged except the new standalone utility/tests and this documentation. Candidate is a source-preservation artifact, not a patched/release-ready system.

## Next gate

Choose a compatible patched framework version using current official evidence; review binary assets and clean build inputs; acquire dependencies with separate cache/config, no inherited secrets and initially disabled lifecycle scripts. Review each required build/generate action under enforced egress isolation. Schema/grant rehearsals stay on a later mutable clone, never on either retained reference or live data. Keep the raw five scan findings and their explicit adjudication in subsequent evidence rather than relabeling the raw scanner as clean.
