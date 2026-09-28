# Candidate dependency acquisition and verification — 2026-09-17

## Decision

Acquisition prerequisite completed; candidate remains **release NO-GO**. No production access, service restart, DB connection/migration, customer data mutation, push or deployment. Canonical application source/manifests unchanged: all 877 source-manifest hashes still match canonical bytes. Only isolated candidate frontend package.json and pnpm-lock.yaml differ from its original source manifest.

## Candidate changes and reviewed acquisition

Installed and read-back verified: next, eslint-config-next and @next/bundle-analyzer all exactly 15.5.24. [Official security release](https://nextjs.org/blog/august-2026-security-release). Lock diff:94 insertions/199 deletions; Next internals/peer references updated, existing TypeScript-ESLint and axe-core versions consolidated. Unrelated deprecation metadata changes do not change versions/integrities. Independent code review approved narrow diff scope, not release readiness.

macOS sandbox rejected numeric-IP network filters. No blanket internet rule was substituted. Trusted pnpm9.15.4 instead ran with explicit ignore-scripts/ignore-pnpmfile, separate config/cache/store and package-import-method=copy. Fixed launcher accepts install or audit only, with no caller arguments. Installer can connect only to loopback52983; a temporary proxy accepts exact CONNECT registry.npmjs.org:443. Direct external TCP, other localhost, Docker socket and private content remain denied. CONNECT tunnel is not a TLS-SNI/HTTP-Host enforcement boundary on a shared CDN; this limitation is explicit. Untrusted build execution remains offline.

Acquisition profile:14 actual permission checks plus positive certificate-validated registry metadata request passed. Offline profile:14 checks passed. Harness5/5 tests passed, including argument override/--fix denial, forbidden proxy destinations and mandatory explicit probe mode. Separate code/security reviews approved bounded acquisition and advisory query. The temporary proxy was stopped after the query; no candidate test workers remained in the subsequent process inventory.

Installer completed in5m22s with no lifecycle scripts enabled. Initial native-flag type mismatch was corrected before successful installation. Audit required pnpm9-compatible --config.ignore-pnpmfile=true rather than unsupported --ignore-pnpmfile; suppression also remains in the clean environment. No automatic audit fix was used.

## Actual verification results

| Gate | Result |
|---|---|
| Shared schema package build | PASS, tsc exit0 |
| Frontend typecheck | PASS, tsc --noEmit exit0 |
| Frontend Vitest |46 files /316 test cases passed, exit0; **cleanup not clean** |
| Worker cleanup | kill EPERM and timeout warnings from denied child signaling; not a clean suite acceptance |
| Lint / production build / E2E | Not run in this batch; no app server started |
| DB/schema/customer workflow rehearsal | Not started |

First Vitest attempt failed resolving localhost. Exact read permission for /private/etc/hosts plus read-only timezone data allowed the rerun; no network/DNS service permission was added. The second run passed assertions but could not signal workers normally. Subsequent inventory found no remaining candidate workers. Correct this narrowly (same-sandbox child signaling or an appropriate test pool) and re-run before closing the test gate. Do not suppress the cleanup warning or count exit0 alone as clean acceptance.

Static build-input inspection found next/font/google in locale layout. Offline production build may require reviewed local font assets; it was not executed, so this is a prospective blocker, not an observed build failure. Existing binary-asset omissions also remain. Existing Next config ignores build-time type/lint failures; explicit independent gates remain mandatory.

## Dependency advisory result — scope matters

Whole-workspace lockfile audit: **3 critical /128 high /154 moderate /24 low**,2162 dependency entries reported. Raw evidence is retained. This includes development tooling and backend dependencies, even though install selected frontend plus shared schemas. Scanner metadata reports devDependencies0; that is not evidence that the inventory is production-only. These counts cannot be compared directly with the earlier backend-image Trivy counts and do not establish current production versions, exploitability, reinfection or host cleanliness.

No Next advisory was returned for15.5.24 in this snapshot. That does not clear its transitive dependencies: sharp remains flagged, among many other high findings. Three critical advisories require priority treatment:

| Package | Evidence and qualification | Next bounded decision |
|---|---|---|
| Handlebars4.7.8 | Backend email compile sites use file/MJML strings or stored string subjects; no attacker-supplied AST-to-compile path observed in focused review. Also present via frontend ts-jest. [Advisory](https://github.com/advisories/GHSA-2w6w-674q-4c4q). | Verify/pin a compatible patched version >=4.7.9; test template typing, rendering and announcement restrictions. |
| protobufjs7.5.4 | Runtime transitive via Google/gRPC/telemetry SDKs. Empty audit paths do not imply absence. No application path accepting untrusted schema descriptors observed in focused review. [Advisory](https://github.com/advisories/GHSA-xq3m-2v4x-88gg). | Candidate target >=7.6.5 covers additional recorded advisories; verify availability and parent compatibility before change. |
| Vitest4.0.18 | Development tooling; configured run/watch with jsdom, no exposed UI/API/browser mode observed. [Advisory](https://github.com/advisories/GHSA-5xrq-8626-4rwp). | Align Vitest and coverage-v8 at a verified version >=4.1.11 to cover additional recorded advisories. |

These are focused code-review observations, not proofs of unreachability. Independent security review recommends no release until patches, regenerated lockfile, fresh audit and relevant tests. No additional dependency upgrades were started after the critical results appeared.

## Recoverability and next sequence

Private local artifacts under `.private-data/dependency-gate-20260917/`:

- candidate-inputs.tgz: changed manifest/lock plus original source manifest; SHA256 `eee161c4aad2d83485baa2b30df51916b7b569a7eb6f912a2bdaead7e4a3d251`.
- controls-and-results-final.tgz: final machine-specific controls and audit/test logs; SHA256 `e36869dc968f6f2e4029709a97067112e0438cea8be921a1e5466f8149bd52c7`.
- earlier controls.tgz retained as an intermediate snapshot, not final harness state.

Candidate lock SHA256 `1896abfa360161fd344d459b1e5dcd0824e628d51cf5ce47f6d992729d7e98bb`; archived lock bytes match. Archives are local, private and not full application/DB recovery tests. Original source recovery archive and untouched canonical bytes remain available. This report's Git checkpoint records evidence; it does not import candidate dependency changes into the canonical application or authorize publication.

Next: validate exact patched versions for the three critical package families and implement a small candidate-only batch with regression tests; re-audit and classify remaining high findings by runtime reachability. Resolve test cleanup, then lint/offline build/assets and exact Linux/amd64 image gates. Only later attach a mutable isolated sanitized DB clone for auth/CRM/grant and migration rehearsals. Retained reference databases and live DB remain untouched.
