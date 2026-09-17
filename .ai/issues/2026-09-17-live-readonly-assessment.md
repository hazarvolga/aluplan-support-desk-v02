# Bounded live observation — 2026-09-17

Historical stage record: the export prohibition below applied to this observation batch. The owner subsequently approved a separate bounded read-only capture, documented in `2026-09-17-fresh-data-quarantine.md`. Local commit/checkpoint authority is in `2026-09-17-git-checkpoint-workflow.md`. No production mutation or publication is authorized.

## Scope and authority

The owner replied yes to the explicit request to inspect running version/images, disk/resources, limited mining indicators and existing backup metadata without modifications, downloads or restarts. This authorizes this bounded observation, not general production access or release.

Root alone connected to the previously recorded host167.86.84.107 using the existing maintenance identity, BatchMode/IdentitiesOnly/StrictHostKeyChecking and no host-key updates. Target hostname matched vmi3049865, x86_64. Observation window2026-09-17 17:45:21–17:47:33UTC (20:45–20:47 Europe/Istanbul). No customer content, environment values, credentials or raw application logs were read.

Commands were limited to date/hostname/architecture/uptime/df/free/nproc, process names/resource columns, docker container listing, one stats sample of the two support containers, selected inspect metadata, exact package.json reads, selected established-port counts and shallow temporary-executable/backup metadata searches. No application code was imported. SSH/audit and runtime observation can naturally create system audit events; no service configuration or business data mutation was requested.

No deployment/restart/stop/build/install, migration/seed, backup creation/export, database/Redis/CRM query, object-body download, firewall/secret change or unrelated application mutation. No application HTTP journey or customer transaction tested. Agents reviewed scope and conclusions without parallel server access.

## Fresh resource evidence

| Measurement | Observed |
| --- | --- |
| Logical CPUs | 8 |
| Root filesystem | 194GiB total;36GiB used;159GiB available;19% used |
| Root inode utilization | 4% |
| Memory | 24028MiB total;20808MiB available at first sample |
| Swap | 0 |
| Uptime | Approximately14days22hours |
| Load averages | 3.13/1.94/1.75 initially;1.74/1.85/1.74 at final sample |
| Frontend single Docker stats sample | 0.00%CPU;108.2MiB of512MiB;11PIDs |
| Backend single Docker stats sample | 1.42%CPU;390MiB of23.47GiB;20PIDs |

Disk/inode exhaustion and obvious capacity saturation are not supported by this snapshot. These are not sustained load, capacity-planning or peak-traffic acceptance tests. Process-list CPU percentages and Docker sampling windows differ and must not be treated as identical metrics.

## Exact live versus local comparison

| Surface | Fresh live evidence | Local candidate / interpretation |
| --- | --- | --- |
| Frontend Next |15.5.24, read from exact installed package JSON and app dependency declaration | Local manifest/lock remains15.3.3. Publishing it unchanged would regress the emergency dependency update |
| Frontend container | allplan-frontend-ee4d70a7; running/healthy; started2026-09-04T17:19:21Z | Not evidence that current local phase2/3 changes are live |
| Frontend runtime | User nextjs;read-only rootfs=true;privileged=false;restart count0;OOMKilled=false | Preserve these controls in candidate; canonical source alone is not the deployed emergency image |
| Backend container | backend-api;running;started2026-09-02T19:03:59Z;restart count0;OOMKilled=false | Running does not establish API health or customer-flow acceptance |
| Backend runtime | Config.User empty (default root);read-only rootfs=false;privileged=false | Hardening gap remains; does not itself prove active exploitation |
| Backend version/provenance | package version0.1.0;image tag references d9b21b9d7b5c4c259acbe9a5828fdd04ba077ce2;OCI revision absent | Tag is not independently verified source provenance;0.1.0 is not enough to identify code |

Frontend exact image ID: `sha256:dbd2a193d62a499e2adcea3d90f0f4617e1d9588d3b52a9b525c0e7fbf08094e`.
Architecture amd64; image created2026-09-04T16:54:13Z; OCI revision `ee4d70a71a75d2f52cfc55ee05f4af34414c2b30`.

Backend exact image ID: `sha256:302229b2403d3a3e5fcb34b2af3003e6f0d6ba5e7610ad2e89e41eb375bd4644`.
Architecture amd64; image created2026-06-30T08:54:29+02:00; OCI revision not set.

These Docker image IDs are not asserted to be registry manifest digests or reproducible-source proofs. An initial metadata template failed on the backend's absent labels; the read-only call was corrected with a nil guard. No subsequent steps from the failed shell ran until the corrected invocation.

Pure Node fs/JSON reads targeted frontend installed Next package and app package, plus backend/root package metadata only. The frontend root node_modules/next path was absent; the app-local path positively returned15.5.24. No recursive source search, package manager invocation or app startup was performed.

The official [August2026 Next security release](https://nextjs.org/blog/august-2026-security-release), refreshed during this observation, lists15.5.24 as a maintenance-line security release. This is not a fresh full dependency/image vulnerability scan or a claim that every current advisory is resolved.

## Limited mining observation

- Process comm-name matching for xmrig/xmr-stak/cpuminer/minerd/kinsing/kdevtmpfsi/nanominer/t-rex/lolminer:0matches.
- Established TCP peers ending in3333/4444/5555/7777/14444/15555:0matches.
- Regular executable files, depth≤2 and same filesystem, in /tmp, /var/tmp and /dev/shm:0in each directory.
- Top CPU sample showed familiar daemon/interpreter names, not proof of executable authenticity.

**Interpretation: no active mining indicators observed in these specific short samples.** Not host-clean proof, no rootkit/persistence/cron/systemd/secret-theft examination, no attribution of original entry point. Renamed processes, different ports, deeper paths, container filesystems and dormant compromise may escape these checks. Historical incident closure remains open.

The existing maintenance SSH identity still authenticated successfully. Its lifecycle/rotation remains a future separately approved action; no authorized_keys inventory or key removal occurred.

## Existing backup metadata only

Bounded filename/size/mode/mtime searches covered /var/backups and /data/coolify/backups to depth3 with selected archive extensions, and Aluplan-named dump files under /root to depth2. /root/backups was absent. No archive contents or checksums were read, no backup invoked.

| Located archive | Bytes | Mode | Filename timestamp |
| --- | ---: | --- | --- |
| /root/aluplan_support_predeploy_ee4d70a7_20260904T170500Z.dump |140520763|0600|September4,17:05UTC |
| /root/aluplan-data-safety-20260904-1549Z/aluplan_support_pg17.dump |140518309|0600|September4 directory |

Filesystem mtimes were September4 as well. These archives are approximately13days old relative to observation, not current release recovery evidence. First size matches the historical recorded size; that is NOT a fresh checksum/integrity validation.

No additional matching archives were returned in the stated shallow search. **Do not infer no other/newer backups exist:** provider snapshots, off-host destinations, other paths, extensions and deeper directories were not inspected. Contabo's historical screenshot is not current backup evidence. No restore/object-byte parity or ability to recover post-September4 tickets was proven.

## Release conclusion and next boundary

**NO-GO remains.** Fresh evidence reduces the disk-full suspicion and positively distinguishes patched live frontend from vulnerable local frontend. It does not close backend hardening, customer-grant compatibility, attachment durability, exact-image reproducibility, rollback or host-trust gates.

1. Continue local isolated-candidate preservation and dependency remediation without regressing the live frontend controls.
2. Keep synthetic auth/customer/file/queue and exact runtime acceptance separate from live observations.
3. Before a real-data rehearsal, obtain distinct permission for fresh consistent DB export/object scope and private sanitization/retention. Current yes did not authorize export.
4. Rehearse code rollback against current updated DB/storage preserving newly accepted writes; never restore an old dump over live as routine rollback.
5. Any broader live schema/grant/storage/queue/incident examination needs an explicitly scoped next decision. Deployment, maintenance and recovery changes remain separately approved.

Companion documents: September17 resume-comparative-assessment; September8 production-readiness-gates and paused-recovery-roadmap. Those earlier documents' “no live observation” statements describe their historical batch; only the narrow fields above are now refreshed.
