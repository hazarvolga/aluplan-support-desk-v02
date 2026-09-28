# Local Git checkpoints and release discipline

Owner explicitly requests ongoing GitHub-compatible development with timely commits and recovery points. This is a continuing project rule, not permission to publish.

## Required workflow

1. Inspect HEAD/index/worktree and preserve unrelated changes before work. Use task-scoped branches for subsequent feature/security candidates; never silently mix candidate and release state.
2. Keep changes small. Separate documentation, tests, product implementation, database/config and tooling commits according to repository conventions. Use Conventional Commit messages.
3. Before each relevant commit: inspect exact staged paths/diff, run the fastest applicable tests, scan staged content for secrets/customer data, and obtain code/security review where relevant. Broaden tests for blast radius. Record failures honestly; no false production-ready label.
4. Before dependency changes, schema rehearsals or other high-risk work: capture a private recoverable source checkpoint including uncommitted/untracked work. A tag at HEAD or hash manifest alone does not preserve dirty files.
5. Database recovery is separate from Git: use verified private data backups/reference copies. No dumps, real customer data, credentials, .env files, generated clients or unrelated binaries in new commits. Avoid broad `git add .`.
6. Explicit owner `push et` is required for remote push/tag publication; explicit deployment approval is additionally required for deployment. Review existing history/CI trigger effects before future publication. No remote operation is implied by a local commit.
7. For eventual GitHub publication use a reviewed PR with tests, migration compatibility, data preservation, rollout/rollback and remaining-risk evidence. Branch protections/CI status must be verified later, not assumed configured.

## Current checkpoint scope

- Base HEAD before this docs checkpoint: `25267a617299caf5e2b7f8ed32cc650ff523528e`.
- 52 dirty/new source files remain uncommitted. This documentation commit does not include them or claim they are ready to ship.
- Private code recovery consists of a base Git bundle plus allowlisted dirty-source/documentation overlay, inventory and SHA-256 checks. Bundle includes pre-existing committed history, potentially historical sensitive files; it is private and not approved for publication. Overlay excludes ignored private data/env/DB; this is not a clean full-repository secret audit.
- Verified private checkpoint: `.private-data/checkpoints/20260917-code-kbGeZl/`. It contains72 changed source/documentation files (52source), `base.bundle`, `dirty-files.tgz`, a manifest and `verified.json`. Bundle verification passed; every extracted overlay SHA-256 matches captured and source bytes; worktree file inventory/HEAD remained unchanged during capture. The workflow/current-focus docs can subsequently advance as recorded by Git; source files stay preserved at capture. This is not a full application build/restore test or off-device backup.
- Fresh DB capture/raw/sanitized quarantine evidence: `2026-09-17-fresh-data-quarantine.md`. Working clone/application startup remain gated. No live changes or push/deploy.

## Next implementation gate

After preserving the existing source: isolated patched dependency candidate, reviewed schema/grant compatibility rehearsal on a mutable clone and outbound/worker isolation tests. Commit tested logical units as they close; do not bundle all previous security changes as an unreviewed release.
