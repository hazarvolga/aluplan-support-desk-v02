# Fresh production data capture / local quarantine — 2026-09-17

## Authority and boundaries

Owner approved the proposed one-way fresh production database copy for isolated local validation, then opened Docker. This supersedes the earlier export prohibition for this bounded capture only. No production writes, migrations, deployment, restart, firewall or credential changes are authorized. Never restore local test data over production. Never attach application processes to the raw reference.

## Verified setup

- Actual application database: `aluplan_support`; the database container's default database variable points to `postgres`, which is not the application database. Target was checked before capture.
- Source PostgreSQL17.9 / vector0.8.2; cached local PostgreSQL17.10 / vector0.8.6. This minor-version/extension drift must not be represented as exact release parity.
- New owned quarantine: `aluplan_capture_pg17_20260917`, dedicated volume `aluplan_capture_pg17_20260917_data`; network `none`, no published ports/listening TCP, OS user `postgres`, read-only rootfs, all capabilities dropped, no-new-privileges, 2GiB/2CPU limits. No host bind or Docker socket.
- Existing `aluplan_dev_pg17` and its data are not changed by this workflow. Docker opening auto-started it; this is not proof the application preview is running.
- Private, Git-ignored capture artifacts under `.private-data/live-copy-20260917/`; directory0700, encrypted dump/key0600. No plaintext dump file. Key and ciphertext share the private directory, so this is not protection against compromise of that directory/account.

## Capture method and failed attempt

One exported REPEATABLE READ / READ ONLY snapshot links aggregate fingerprints for six key tables to `pg_dump --snapshot`. Archive streams directly over verified-host SSH through local age encryption; no server dump file. Source lock wait3s, read-only sessions, bounded remote/local timeouts. Normal application writes can continue; snapshot retention has vacuum/DDL-lock costs and is not zero-impact.

Attempt1 hit its120s dump deadline; SSH exit124. Its encrypted partial archive and key are retained privately, have no completion receipt and must not be restored. A follow-up found no remaining pg_dump/psql sessions from that attempt; host load≈1.49 and availableRAM≈20GiB.

Attempt2 uses an exclusive new directory, fresh key/snapshot and bounded840s dump /900s exporter and local deadline, accommodating the observed transfer speed. Independent code review approved capture and non-executing archive inspection, not restore or application startup.

## Completed checkpoint

Attempt2 completed18:07:29–18:14:16UTC (407seconds): raw141,542,982bytes/encrypted141,577,726bytes. Encrypted and independently decrypted SHA-256 checks passed. First schema extraction lacked `--file=-`; corrected inspection passed, failed empty output retained, no DDL executed at inspection.

Independent schema/TOC review:3expected extensions,26enums,62tables/617columns,104indexes,62constraints,68FKs,1sequence. No custom functions/triggers/rules/policies/external connection objects. Standard builtins and md5 expression indexes reviewed. Hash-bound approval and external timeout gate restore.

Raw `capture_reference` restore passed single-transaction/exit-on-error. Six same-snapshot full-row fingerprints AND counts match:180tickets/563messages/114attachments/1285users/1281customer_profiles/807crm_accounts. This is not source parity for all tables/object bytes; sequence values are not MVCC-snapshot-consistent.

Separate `sanitized_reference` created; no existing DB overwritten. Two reviewers approved after exact table/column manifest, MFA credential drift and rewrite/RLS checks were strengthened. Password hashes replaced by non-login sentinel; refresh hashes cleared; CRM credentials/endpoints/settings cleared and connections disabled; delta links cleared; all settings values blanked; webhooks disabled with invalid URL/no secret. Structured credential assertions0. All62 table counts/business-content fingerprints match raw reference, excluding only documented sanitation columns. Roles/status/customer numbers/relationships/job history preserved. Both references verified default read-only, which superuser can override (not immutable).

No application, worker, mutable working clone, migration or provider connection started. PII/free-text/JSON remain private and can contain embedded secrets; not anonymization/comprehensive secret removal. Attachment bytes and Redis not included. Post-capture live check:0remaining named capture sessions, load≈2.06. No live business writes/restart/deploy/firewall/secret changes; existing local DB untouched by our commands. Private artifacts ignored, no customer content or credentials printed/committed.

## Authentication clarification and next step

Source `users` has passwordHash/refresh_token_hash but lacks local session_version and reset/verification JTI/timestamp fields. This does NOT imply current login/reset failure. Repository commit matching observed backend image tag uses signed time-limited JWT reset without those fields; source/tag comparison is not running-code attestation. Local code adds stored one-use reset evidence and persistent session version. No live reset/login was exercised.

Next: separate patched candidate and mutable isolated working clone; rehearse reviewed schema compatibility/CUSTOMER grants and prove outbound/worker isolation before app startup. Never migrate references or restore local data over live. Deployment needs separate approval and fresh release-time recovery evidence.

Production readiness remains NO-GO. This capture does not resolve host trust, dependencies, application security, credential rotation, rollback or file durability gates.
