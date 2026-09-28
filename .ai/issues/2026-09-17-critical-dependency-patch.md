# Critical dependency patch — isolated candidate — 2026-09-17

## Outcome and boundary

The three previously flagged critical package families are remediated in the isolated candidate. Comparable whole-workspace advisory result changes from **3 critical /128 high /154 moderate /24 low** to **0 critical /119 high /143 moderate /23 low**. This is not an exact runtime-image scan, application penetration test, production inventory or host-cleanliness determination. **Release remains NO-GO.**

No production access, DB connection/migration, Prisma generation, app startup, customer data writes, remote push or deployment. Canonical source preserved: all877original source-manifest hashes still match. Candidate differences from that manifest are exactly package.json, apps/backend/package.json, apps/frontend/package.json and pnpm-lock.yaml. No application implementation or original tests changed.

## Changes

- Root and backend Handlebars pinned to4.7.9. Bounded override `handlebars@>=4.0.0 <4.7.9` ensures transitive consumers also receive4.7.9.
- Bounded override `protobufjs@>=7.0.0 <7.6.5` ->7.6.5. Refreshed @protobufjs/utf8 is1.1.2.
- Frontend Vitest and coverage-v8 pinned together to4.1.11; @vitest/mocker follows4.1.11.
- Existing Next family15.5.24 retained.

Public version metadata was fetched over the reviewed local proxy with TLS certificate validation and exact name/version checks. All four requested releases exist; engine/peer/integrity metadata retained privately. Recorded engine requirements accept Node20.20.2 and the local Node24.18.0 for these selected packages; this is not validation of every dependency or an amd64 runtime.

Prior advisory sources and preconditions: [Handlebars](https://github.com/advisories/GHSA-2w6w-674q-4c4q), [protobufjs](https://github.com/advisories/GHSA-xq3m-2v4x-88gg), [Vitest](https://github.com/advisories/GHSA-5xrq-8626-4rwp). Patch targets also cover additional recorded advisories for those families; the new audit returns no entries for Handlebars/protobufjs/Vitest/@vitest/mocker/@protobufjs/utf8. No finding was suppressed.

Independent code/security reviews approved bounded overrides, fixed backend acquisition and diff scope. No unrelated application dependency upgrade was identified. Package presence and runtime exploitability remain distinct concepts.

## Acquisition and actual tests

Frontend filtered install completed in15.7s. To test actual backend rendering and protobuf behavior, the fixed launcher gained `install-backend`: exact backend workspace filter, frozen lockfile, zero caller arguments, lifecycle/pnpmfile disabled, isolated store/copy and unchanged proxy restriction. RED/GREEN test covers this mode; code/security review preceded execution. Backend dependency acquisition completed in1m19s. It did not start Nest/Prisma or connect to DB. Proxy was stopped afterward.

| Check | Result |
|---|---|
| Direct pins and complete lock package-family checks |2/2pass; initially RED on old versions |
| Handlebars escaping + harmless numeric-AST rejection + protobuf trusted codec roundtrip |3/3pass |
| Actual TemplateService rendering |Password-reset and master-announcement HTML/plain-text/subject smoke pass, no mail sent; root and backend-resolved Handlebars both4.7.9 |
| Existing announcement-content-safety.spec.ts |81/81pass with real parser/compiler, in-band, normal teardown |
| Frontend typecheck |PASS |
| Frontend tests on Vitest4.1.11 |46files /316tests pass |
| Frontend coverage provider |Runs successfully and passes existing45% thresholds; measured lines65.21%, statements62.33%, functions48.53%, branches51.34% |
| Isolation probes |14/14pass, networking/private-content controls retained |
| Acquisition/proxy/mode unit tests |6/6pass |

The Handlebars regression uses harmless arithmetic text in a numeric AST field, not shell/network/file payloads. The old library accepted it (expected-exception test RED); patched library rejects it (GREEN). Positive normal rendering also passes. This demonstrates a library-level regression fix, not that an application endpoint previously accepted attacker AST objects.

Frontend uses `--pool=threads --maxWorkers=2` for this isolated verification. Previous fork cleanup `kill EPERM` did not recur; no sandbox signal/network permissions were widened. This is a command-line test mode, not a permanent repository configuration change. Existing React mock-prop and duplicate TipTap-link warnings remain and are not relabeled as resolved.

Coverage percentages refer to the files measured by the current Vitest configuration, not the whole monorepo. They **do not meet the80% target**. Full backend typecheck/suite, production build, lint, browser E2E, exact Linux/amd64 image, DB rehearsal and rollback validation remain open. No live Google/CRM/AI/email integration was exercised.

## Checkpoint and recovery

Private local `.private-data/dependency-gate-20260917/` additions:

- critical-patch-inputs.tgz: three manifests, lock and original candidate manifest. SHA256 `fd88eefe0209e8d410089bf09f4a0690ecb9d7d0dd0b02d1bcf7447dade8a8ce`.
- critical-patch-evidence.tgz: new controls/tests, exact public metadata and raw audit/test outputs. SHA256 `c2b75e759f07b0082b8f238d3aa9f703a4792a96366a8c83f9ae679632f7817e`.
- Prior candidate-inputs.tgz and controls-and-results-final.tgz remain unchanged for the previous gate.

Candidate lock SHA256 `01a5008a534ee039ce5b28474c55b2b81004be078ca2ef9fb319fe1ff2b61c62`; archived lock bytes match. These are local recovery artifacts, not off-device backups or application/DB restore proof. Git evidence checkpoint does not import candidate manifests into canonical application files or authorize remote publication. Retain the prior scratch controls archive alongside this incremental evidence archive to reproduce the harness.

## Next ordered step

Triage the remaining119high findings by actual runtime path and input exposure, beginning with upload/document processing, outbound HTTP/email and HTML rendering. Select small compatible patch groups with relevant regression tests; do not use mass audit-fix or suppress findings. Then close coverage/test-quality, lint/offline-build/font and excluded-asset gates. A later mutable sanitized DB clone is separate from retained references and production; no migration or live release follows automatically from this checkpoint.
