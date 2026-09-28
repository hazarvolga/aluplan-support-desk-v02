# Dependency isolation gate — 2026-09-17

## Scope and result

Local prerequisite only. No package installation or application dependency edits, build, app startup, DB connection/migration, live access, push or deploy. All 877 candidate source hashes rechecked unchanged at closure. Production remains NO-GO.

## Reviewed target

Next 15.5.24 is the selected compatible maintenance-LTS patch target, with eslint-config-next and @next/bundle-analyzer aligned to the same version. The latter currently targets a different major. Official evidence: [August security release](https://nextjs.org/blog/august-2026-security-release) and [15.5.24 release](https://github.com/vercel/next.js/releases/tag/v15.5.24). This is a version decision, not an installed-tree audit or assurance against all vulnerabilities. Candidate still contains Next 15.3.3; no manifests or lockfiles changed.

## Local sandbox evidence

Machine-specific experimental controls reside outside Git in sibling `.aluplan-dependency-check-20260917`: `offline.sb`, `run.cjs`, `probe.cjs`, empty npm config and isolated working subdirectories. Original HOME retained; no provider, DB, proxy or SSH-agent environment inherited. Pinned cached pnpm 9.15.4 prints its version inside the sandbox. Node child runtime is 24.18.0; packaged pnpm has its own older internal runtime, which must be considered before installation/engine validation.

Default-deny offline profile blocks networking and content reads outside its explicit runtime/source allowlist. Global filesystem metadata visibility remains allowed; this is not a full machine-confidentiality proof. Runtime reads are limited to /System, /usr/lib, /usr/bin, /bin, selected Node/pnpm trees, candidate and scratch. /private/etc and /usr/local are not broadly readable.

Test-first addition of control-file write checks failed against the initial profile. Independent security review also identified HIGH persistent control tampering: whole scratch-directory write access would allow dependency code to replace the launcher before its next host invocation. Fixed by restricting scratch writes to tmp/cache/store, excluding controls and their parent. Security re-review confirmed closure for the offline milestone only.

Final actual probe: 14/14 controls passed: candidate read, canonical read/write denial, profile/launcher write denial, private-manifest read denial, SSH listing denial, arbitrary TCP443/localhost/Docker Unix socket/registry denial, environment check, scratch-temp write, inherited child-process read restriction. EPERM/EACCES required; timeouts or refused connections do not count as isolation evidence. No real secret contents are emitted. This is a focused probe, not a sandbox escape audit or application test suite.

Reproduction from the parent workspace: `node .aluplan-dependency-check-20260917/run.cjs offline node /Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/.aluplan-dependency-check-20260917/probe.cjs offline`. Keep the final `offline` argument: current experimental probe otherwise skips its registry test. Independent code review approves only this narrow offline milestone. Candidate remains fully writable and scratch contents readable; these controls do not protect candidate integrity against its own build scripts. No comprehensive descendant/process-tree escape proof was performed.

Control SHA-256:

- run.cjs: `529ca698f5182575dd759d088a8ea1b0fcedc18b36e8a05e247e0c6996e3f9a2`
- probe.cjs: `02ecb6e7d50017e5e3ba8bca15054ce45e4298462e5923b6c8d4fd5305e5d0de`
- offline.sb: `5688b68d01e123b47d9c32f597a3ced5661fdbf5c742e87cc654b564cbf9cd18`

## Next ordered gate — not completed

1. Define a single acquisition command; launcher currently explicitly rejects acquisition. Arbitrary network-enabled Node/pnpm commands are not approved. Disable lifecycle scripts and pnpm hooks explicitly; keep isolated cache/config/store and prevent configuration overrides.
2. Review/test network policy before downloads. A shared-CDN IP allowlist is not hostname isolation; DNS permissions can introduce another egress channel. Do not describe either as strict registry-only enforcement. Keep untrusted build execution entirely offline.
3. Change only isolated candidate dependency manifests, acquire the reviewed packages, inspect full lockfile diff, then audit exact resolved dependencies.
4. Run explicit shared-package build, frontend type/lint/test/build checks under offline controls. Existing Next build ignores type/lint errors, so build success alone cannot pass these gates. Review binary build inputs and each necessary generation action first.
5. Record scoped local Git checkpoints; preserve existing 52 dirty source files and private recovery archive. No customer data, environment files or generated dependencies in Git. No remote publication.
6. Only after candidate gates: isolated mutable DB clone for schema/grant/auth rehearsal. Retained references remain untouched; never replace production DB with a local copy.

These scratch tools are experimental, machine-specific and not yet a reusable committed security harness. The documentation checkpoint alone does not preserve their executable bytes; verify hashes before reuse.
