# Local pause / restore point — 2026-09-18

## Resume verification — 2026-09-19

Local read-only reconciliation completed after owner requested continuation. All six archived artifact hashes match the checkpoint manifest; all 68 preserved canonical dirty files match their extracted copies. Candidate tracked tree remains unchanged at `20b2faf`; canonical HEAD remains `17bb69ff` before this documentation update. Comparison of 885 candidate tracked files against canonical working files finds 20 changed and seven candidate-only files. This is a local-to-local comparison, NOT a fresh production comparison. Previous test results were not rerun.

Independent source-scope review found the isolated candidate is NOT a complete deployment checkout. Its unchanged backend Dockerfile requires omitted `.npmrc`, `packages/database/scripts/`, `scripts/backup-db.sh`, and backend `scripts/deploy.sh` / `migrate-once.sh`. CI workflows, Compose files and some public assets are also absent by design. Never replace the canonical tree with this subset or delete canonical-only files. Required next consolidation: new worktree from canonical Git history, explicitly preserve original source changes and candidate deltas, retain reviewed canonical-only build/ops/assets. Do not execute preserved boot/deploy scripts or copy credential-bearing configuration without review.

Exact candidate backend Dockerfile has no USER directive and retains runtime npm/pnpm/Prisma. Historical non-root/package-manager-free image evidence does NOT describe this Dockerfile. Exact hardened Linux/amd64 image acceptance remains open; passing Nest compilation is not passing Docker build/runtime acceptance.

Mail-source inspection reconfirms `rejectUnauthorized: false` in SMTP and IMAP configuration. Inbound source maps parsed From to an active account and ticket owner, but this is not sender-authentication evidence. Webhook ingress has a signature guard; provider-request authentication must not be confused with proof of the original email sender. No spoofing attempt or production reachability test was made.

Owner confirmed email is actively used and believes the mail system is on the server, but provider/hosting is uncertain. Preserve this workflow. Before changing sender-admission policy, establish the actual receiving provider and trusted ingress/header contract through owner confirmation or separately approved read-only inspection. Do not disable email, trust arbitrary Authentication-Results headers, or create a CRM entitlement flag: CRM membership remains the owner's support eligibility rule.

Next bounded work: canonical-history source consolidation, then isolated TLS regression fix with explicit mail compatibility acceptance and provider-specific sender trust decision. No production, DB, provider, push, deploy, runtime restart or application-code change occurred in this resume verification.

User requested: commit, preserve a restore point, and stop until morning.

## Saved state

- Tested source candidate: sibling directory `../aluplan-security-candidate-20260917`.
- Standalone local Git branch: `checkpoint/local-security-20260918`.
- Source commit: `20b2fafa4b86e6897e02dc776817f9637a6a3311`.
- Local tag: `restore/local-security-20260918`.
- 885 explicitly selected source/config/test files committed. Generated Prisma client, dependencies, coverage and real environment files excluded. This is a standalone source checkpoint, not a merged release branch or published PR.
- Staged-source Gitleaks scan flagged five reviewed false positives: four localhost example headers in `apps/backend/src/crm/E2E_TEST_CHECKLIST.md` and a migration checksum in `packages/database/prisma/migration-checksums.json`. No blanket suppression applied.
- Canonical branch remains `security/source-isolation-20260917`. Its 68 existing modified/untracked files were preserved unchanged, not swept into this documentation commit.

Private checkpoint directory (repository-relative):

`.private-data/checkpoints/20260918-pause-o9rfAl/`

Contents: candidate and canonical-before Git bundles, full candidate-source archive, canonical-dirty archive, original source manifest, checksums, and extracted verification copies. Bundles verified with Git; every archived source/dirty file extracted and byte-hash compared to its original. Directory is private (0700), archive/bundle files 0600. A final canonical bundle will include this handoff commit and its local tag.

## Last verification, not rerun during checkpoint

- Backend: 149/149 default Jest suites passed; 1728 tests passed, one existing skipped test.
- Backend TypeScript and production build passed.
- Last frontend result: 327 tests across 47 suites, typecheck and i18n passed.
- Default backend suite excludes database integration tests. These results do not establish real-provider, browser, live-data migration or production readiness.
- Detailed evidence and remaining risks: `2026-09-17-upload-admission-patch.md` in this directory; private evidence archives remain under `.private-data/dependency-gate-20260917/`.

## Morning continuation / STOP gates

1. Read this note and the upload-admission report; verify Git state and checkpoint hashes before changing files.
2. Consolidate candidate changes into a reviewable canonical release branch using source comparison; preserve unrelated canonical work. Do not merge the unrelated standalone root history blindly.
3. Resolve release-blocking sender authentication/CRM admission and TLS verification decisions, then focused regression checks. Keep SSRF/parser/HTML risks visible.
4. Validate isolated real-data rehearsal, schema/grants, attachment bytes and rollback after new writes; validate exact Linux/amd64 runtime image and scan it.
5. Production and host/credential work require fresh evidence and explicit approvals. No push without explicit `push et`; no deploy without explicit `deploy et`.

Restore into a NEW sibling directory from the candidate bundle/source archive. For canonical recovery, clone its final bundle into a NEW directory and overlay the canonical-dirty archive only there. Do not reset or overwrite the current checkout. Check hashes first. Dependencies/generated client must be recreated separately using the pinned lockfile and documented isolated setup.

This checkpoint is LOCAL ONLY: not an off-device backup, not a new production database backup, not proof of a clean host and not release approval. No production access, push, deployment, migration or service restart was performed for this checkpoint. Work stops here; no automatic morning run scheduled.
