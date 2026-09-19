# Mail transport observation — 2026-09-19

## Local wire-level transport acceptance — 2026-09-19

Added opt-in `apps/backend/src/email/mail-wire-transport-security.spec.ts` and ephemeral certificate generator `apps/backend/test/mail-tls-fixtures.cjs`. Actual Nodemailer and imap-simple clients call the unchanged application providers, with mocked settings/other DI dependencies only. Synthetic servers bind127.0.0.1 on ephemeral ports; sandbox permits loopback traffic only. No real customer, mailbox, database, DNS/proxy or certificate authority is involved. Test CA trust is provided at process startup using NODE_EXTRA_CA_CERTS, never by disabling validation in product code.

Acceptance matrix: SMTP STARTTLS and implicit TLS successful verify/send with encrypted AUTH; both verify and send reject untrusted, wrong-name and expired certificates before AUTH. Missing STARTTLS rejects a send before AUTH/MAIL/DATA. IMAP direct TLS succeeds with encrypted LOGIN; untrusted/wrong-name/expired certificates fail before LOGIN. Configured IMAP TLS=false rejects both public entrypoints before connection and credential reads.

Final independent rerun:10/10 wire tests passed, normal process exit0; backend/new regression TypeScript check passed with0 diagnostics. Fixture keys were generated only in owned temporary directories and cleaned after the run. Independent code review found no blocking issue. Normal test-case grouping includes multiple certificate/protocol combinations; no full-application coverage claim.

The suite is opt-in via MAIL_TLS_FIXTURE_DIR and process-start trust configuration. Ordinary Jest runs skipping it are NOT wire acceptance. Existing local scratch runner `.aluplan-dependency-check-20260917/tmp/mail-wire-run.cjs` orchestrates ephemeral generation, process-start trust, loopback-only execution and owned-fixture cleanup. No private key or certificate bytes are committed. Dedicated CI wiring and exact Linux/amd64 image execution remain unverified; this local Node24/macOS result does not attest the production Node20 image or DMS interoperability.

These tests supersede the prior statement that wire-level client policy is wholly untested. They do NOT close the actual server certificate/renewal/STARTTLS, sender-authority, full mail-to-ticket delivery or production release gates. No production source changes were required in this step.

## Local strict-client patch — 2026-09-19 (not deployed)

Changed only `smtp.provider.ts` and `email-inbound.service.ts`: SMTP requires TLS and validates certificates, retaining explicit TLS on465 and STARTTLS mode on587. IMAP rejects an explicitly disabled TLS setting before reading credentials or connecting; enabled/default mode uses direct TLS and certificate verification. Configuration failures now enter existing public error handlers, and the inbound processing guard is acquired before configuration awaits and always released. No new environment variables, schema/migration, provider change, queue retry policy or ticket-processing change.

Installed node-imap source (`Connection.js` around1646) checks whether STARTTLS is advertised before honoring `autotls: always`; it is not a fail-closed requirement. Therefore no automatic-STARTTLS shortcut is used. Existing plaintext143 settings must be changed in approved maintenance before this patch is deployed. IMAP STARTTLS-only configurations are intentionally unsupported by this narrow patch. [Upstream API](https://github.com/mscdex/node-imap) and [Nodemailer SMTP options](https://nodemailer.com/smtp) were consulted; installed dependency code was also checked.

Regression-first evidence: new mocked transport tests initially failed six cases (six passed), then passed13/13 after the implementation and an added cron recovery test. They assert strict transport options, no plaintext IMAP connection/credential reads, preserved unconfigured behavior, error propagation and no weaker fallback. Tests exercise actual release-worktree source using existing isolated dependencies, clean environment and a network-denied sandbox; no application startup, real credentials, DB or mail used. Initial runner resolution failures were tooling failures, not valid RED tests. Mock tests do NOT prove actual certificate rejection/hostname matching on the wire, server interoperability, full coverage or production readiness; isolated wire-level TLS acceptance remains open.

GitNexus tools/CLI and this worktree's Graphify report were unavailable. Independent read-only source impact analysis traced SMTP through queued notifications and health checks, and IMAP through scheduled intake/admin verification. Gmail/Resend are separate paths and unchanged. Independent security review found no blocking issue in the final product diff. No live access, settings writes, restart, push or deployment this turn. Rollback locally is the two-file patch only; production rollback must not restore mail/DB volumes. Server TLS and the broader release gates below remain blocking.

Final focused verification: four suites /29 tests passed, including the13 new transport cases and16 existing inbound/attachment cases. Backend plus new test TypeScript no-emit check returned0 diagnostics using the scratch compiler host and existing isolated generated Prisma client. Independent code review also approved the local patch. Broader suite initially hit an isolated dependency resolver failure (`entities/decode`), corrected in scratch runner without dependency or application changes; only the final successful run counts. This is not a fresh installed-release build or a full backend/frontend regression run.

Reproduction from the workspace parent: use the existing Node24 executable with `.aluplan-dependency-check-20260917/tmp/mail-tls-run.cjs --silent` or `--typecheck`. Scratch runner/config/compiler host remain local and network-denied; no package installation. Standard repository Jest can execute the committed specs once a properly isolated release dependency environment is prepared.

## Proposed bounded TLS maintenance plan — not executed

Prepared locally on 2026-09-19. This section supersedes older pending-inspection statements below; those sections remain historical observations. No production access or mutation performed while preparing this plan. The existing backup is file-verified, not an off-host recovery guarantee. Application release remains NO-GO.

### Smallest compatible target

| Flow | Observed / local source | Target and acceptance |
| --- | --- | --- |
| SMTP submission | Live 587 without STARTTLS; local `smtp.provider.ts` permits invalid certificates and does not require TLS | Keep 587 and `secure=false`; require STARTTLS and valid hostname/chain in the client. Do not select the direct-465 TLS checkbox on 587. |
| IMAP intake | Live 143 without TLS; local `email-inbound.service.ts` permits invalid certificates | Prefer already-published 993 with direct TLS and certificate validation. Do not assume current 143 client automatically upgrades to STARTTLS. |
| Internet mail delivery | Port 25 published | Preserve MX, hostname, port 25 and existing delivery/relay policy; do not blindly require encryption from all external sending servers. Independently confirm unauthenticated third-party relay is denied in a controlled test. |
| Persistent state | Three named mail volumes | Preserve exact volume identities and account/queue state. No recreate/reset/prune/restore-over-live operation. |

Local source observations are not proof of the exact deployed application artifact. Enabling server TLS alone does not fix the local certificate-validation bypass. Local regression-first client fixes can be prepared before maintenance, but must not be deployed against the current non-TLS endpoint.

### Gates and sequence

1. **Read-only preparation, separately scoped production access:** identify running image version, local image ID and available repository digest; confirm rollback image is retained. Never pull `latest` as part of TLS work. Check existing certificate metadata and renewal ownership without exposing keys or the proxy's full ACME store. Confirm backend DNS/network route and other clients using this mailbox. Secure the administrative channel (existing verified HTTPS or approved SSH tunnel) before transferring credentials/private material; the currently known HTTP Coolify URL is not a confidential management channel.
2. **Certificate decision:** reuse an existing trusted certificate only if its SAN covers `mail.allplan.net.tr`, its key matches and renewal is dependable. Otherwise choose automated DNS-01 with narrowly scoped credentials if the actual DNS provider supports it, or a reviewed HTTP-01 route through the existing proxy. Do not stop the shared proxy or bind standalone Certbot to occupied ports 80/443. DNS provider and existing certificate coverage are currently unknown. CA issuance/DNS changes need explicit approval; public certificate issuance exposes the hostname in certificate-transparency logs.
3. **Minimal proposed server configuration:** use version-verified `SSL_TYPE=manual`, `SSL_CERT_PATH` and `SSL_KEY_PATH` with a dedicated read-only certificate DIRECTORY mount (full chain plus protected key). Do not mount unrelated domains' private keys into the mail container. Preserve every current data mount and unrelated setting. Match instructions to the actual running version before writing an executable Compose patch. The generic `latest` documentation is not runtime-version proof.
4. **Renewal before GO:** identify who renews, how validated replacement certificate/key reach the directory, and how the running version reloads them. Rehearse renewal/reload in isolation; monitor expiry and failed renewal. A one-time working certificate is insufficient. Avoid single-file bind mounts that retain old inodes. No broad host Docker socket or all-domain ACME-store access just for renewal convenience.
5. **Recovery readiness:** select owner-controlled encrypted off-host backup destination and verify private readback there; do not publish archive or secrets to Git. Refresh mail/config backup immediately before maintenance and check changes since capture. Rehearse the same image/config with isolated disposable volumes, synthetic mailbox and outbound delivery blocked. A production mail archive must not be started as a second active mail system. Preserve the original checkpoint and recovery image.
6. **Explicit maintenance approval:** freeze reviewed diff, named operator/window, rollback actions and controlled test sender/recipient. Enabling TLS may recreate the mail container and reject the current plaintext IMAP client immediately; coordinate the 993 application setting change in the SAME window. Do not promise zero interruption or globally weaken plaintext restrictions to bridge the transition. Agree a 10-minute investigation budget after restart, then stop/escalate rather than repeatedly changing settings. Website/backend remain untouched except separately approved mail-setting writes; no bundled application deployment or migration.
7. **Credential-free acceptance first:** from outside and the backend network, verify SMTP587 STARTTLS and IMAP993 handshake, trusted chain, hostname, expiry and TLS >=1.2. Confirm pre-TLS AUTH is forbidden on submission and plaintext IMAP authentication is denied. Check service readiness, expected listeners and retained volume identities. Certificate-validation failure, different image/volume, or missing listener means STOP; never authenticate over a failed TLS check.
8. **Approved functional acceptance:** authenticated checks only over verified TLS, then one synthetic mail from an owner-controlled CRM-eligible sender to the support mailbox, exactly one ticket, one reply and one attachment delivered to a controlled recipient. Verify ingestion catches up without duplicate tickets and queued mail drains. Record only sanitized identifiers/counts; do not replay customer emails, delete existing messages, or export message bodies. TLS does not establish CRM sender identity or cure header spoofing; inbound sender-authority remains a separate application release gate.
9. **Local client patch / release:** test certificate rejection (untrusted, expired, hostname mismatch), missing STARTTLS failure before credentials, and successful trusted TLS. Preserve credential masking and existing provider behavior outside scope. Release strict SMTP/IMAP validation only after endpoint acceptance and the broader DB/attachment/image/rollback gates, with separate `push et` / `deploy et` authority. Coordinate a subsequent approved mailbox credential rotation across all consumers because prior transport exposure cannot be undone by TLS.

### Rollback without discarding newly accepted mail

Retain exact image, prior Compose/settings and certificate metadata before change. Roll back only reviewed configuration/application settings while keeping current mail-data/state/config and ticket database; never blindly restore the earlier archive over live mail. Preserve newly queued/delivered mail and evidence. A return to plaintext is an explicit security downgrade, NOT a safe default rollback: stop the transition and ask the owner to choose a bounded recovery action or temporary mail-intake pause. Keep web ticket submission available where independently healthy. Any restart/recreate/setting rollback must be within the approved maintenance scope. Mail queue retries and client reconnects must be verified, not assumed to guarantee delivery.

### Next bounded action

Independent security review accepted this as a non-executable proposal, not maintenance GO. Before executable instructions: prove the deployed SMTP client actually negotiates STARTTLS; name the operator and preapprove the exact action at the 10-minute stop point, including intake/queue preservation; validate certificate/key pair and permissions before replacement/reload, and test renewal-failure behavior in isolation.

Prepare the small local client regression/patch in isolation, and request only the read-only certificate/image/renewal inventory in gate 1 before proposing the final maintenance diff. Do not issue certificates, edit DNS, change mail settings, rotate credentials, restart services or deploy on a general "continue".

Sources consulted 2026-09-19: [Docker Mailserver TLS](https://docker-mailserver.github.io/docker-mailserver/latest/config/security/ssl/), [DMS environment options](https://docker-mailserver.github.io/docker-mailserver/edge/config/environment/), [Nodemailer SMTP options](https://nodemailer.com/smtp). These describe mechanisms; actual image-version compatibility and renewal behavior remain to be verified.

## Owner-approved protected backup completed — 2026-09-19

Owner explicitly approved on-server mail/config/Compose backup and verification only. No TLS change, restart, deployment, database operation or credential rotation authorized/performed. Existing Coolify host terminal used; shell exited after verification.

Backup directory on VPS: `/var/backups/aluplan-mail-20260919-wvS1G5`.
Archive: `mail-backup.tgz`, 1,618,614 bytes. SHA-256 is recorded in sibling `SHA256SUMS` and verified successfully twice. Directory ownership/mode observed `root:root 0700`; archive `root:root 0600`. Reports use0600. This is permission-protected, NOT cryptographically encrypted or copied off-host.

Exact sources identified by Docker mounts and Compose label:

- `/var/lib/docker/volumes/q4wgowwo0wwsg0sksg8gkow4_mail-data/_data`
- `/var/lib/docker/volumes/q4wgowwo0wwsg0sksg8gkow4_mail-state/_data`
- `/var/lib/docker/volumes/q4wgowwo0wwsg0sksg8gkow4_mail-config/_data`
- `/data/coolify/services/q4wgowwo0wwsg0sksg8gkow4/docker-compose.yml`
- Existing regular, non-symlink `.env` alongside Compose (included without displaying contents).

Preflight: source sizes approximately3.8MiB/664KiB/8KiB,159GiB free on filesystem. New unique target created with umask077; no existing backups overwritten. `rsync -aHAX --numeric-ids` copied sources to private staging, retaining owners/permissions/ACLs/xattrs/hardlinks. Compose/env copied; image identity and container start/restart-count saved before/after without dumping environment values.

Verification: gzip integrity passed; GNUtar archive compare against frozen staging passed; SHA256 check passed. Immediate checksum dry-run live-to-staging comparison reported zero changes for all three volumes. This comparison was non-deleting and does not establish atomic snapshot consistency. Image/start-time/restart-count matched before/after; final container observation running=true, restart-count0, start time2026-09-02T19:03:59.002772687Z.

Archive extracted ONLY into fresh backup-local `restore-check/`, not into live paths. Initial comparison logged31 `skipping` notices; staging contains31 Unix sockets. These transient sockets were deliberately not stored by tar. Repeated dry-run checksum/metadata comparison with nonregular-file notices disabled reported zero persistent-file differences (`restore-persistent-compare.log` empty); checksum recheck also passed. No actual rsync deletion was performed (`--delete` occurred only together with `-n` dry-run). Both staging and extracted verification copy retained within0700 parent. No mail body, password, hash of a password, private key or customer filename was printed.

Limits: file-level archive/readback verification, NOT a running mailserver restore rehearsal, atomic application-consistent snapshot, current production ticket-DB backup, encrypted backup, off-host disaster recovery or host-cleanliness proof. New messages after capture are not included. Do not overwrite live volumes from this archive as a casual rollback; preserve newly accepted mail/queue changes. Exact running image not exported. On-host backup alone is insufficient protection against VPS loss or host compromise.

Next gate: prepare certificate/renewal and TLS maintenance plan locally, with pinned currently running image identity and unchanged volume names. Before real TLS changes, separately authorize maintenance scope and controlled mail acceptance test; consider secure off-host backup destination and rehearsal. No automatic latest-image upgrade, port shutdown, password rotation or deploy follows from this backup approval.

## Effective TLS inspection completed before backup

Read-only container queries confirmed Postfix `smtpd_tls_security_level=none`, empty `smtpd_tls_cert_file`, `smtpd_tls_auth_only=no`; Dovecot `ssl=no`, `disable_plaintext_auth=no`. `printenv SSL_TYPE` returned no value. `/etc/letsencrypt` and `/tmp/docker-mailserver/ssl` did not exist at inspection. This does not rule out unrelated certificates elsewhere. Coolify service Scheduled Tasks displayed no configured tasks; other backup mechanisms are not ruled out.

## Authorized read-only scope

Owner provided Coolify service `q4wgowwo0wwsg0sksg8gkow4` and requested browser inspection before safe release. Existing Firefox authenticated session was used. Compose editor was opened only for reading and closed WITHOUT saving. No settings, restart, deploy, credential, DB or mail-content operation performed. External probes used TCP/TLS, SMTP EHLO and QUIT only; no AUTH, MAIL FROM, RCPT TO or DATA commands.

## Observed evidence

- Coolify name: `aluplan-support-mailservise`; image configuration `ghcr.io/docker-mailserver/docker-mailserver:latest`. Exact running image digest/version not established.
- UI status: `Running (unknown)`, not delivery/health acceptance.
- Compose hostname `mail`, domainname `allplan.net.tr`; published ports25,587,993,143.
- Named volumes: mail-data at /var/mail, mail-state at /var/mail-state, mail-config at /tmp/docker-mailserver. Volume presence is NOT backup or restore proof.
- Shown environment: OVERTAKE_IP_CHECK=1, ENABLE_SPAMASSASSIN=0, ENABLE_CLAMAV=0, ENABLE_FAIL2BAN=0. No SSL_TYPE/certificate mount shown in this Compose. This does not prove absence of other filtering, certificate files or runtime overrides.
- Unauthenticated external connection to167.86.84.107:993 was refused.
- Port587 banner: `220 mail.allplan.net.tr ESMTP`. EHLO advertised AUTH PLAIN LOGIN but not STARTTLS.
- OpenSSL SMTP STARTTLS attempt failed with no peer certificate and a protocol alert. Its displayed verify-return-code0 is NOT certificate-validation success when no certificate was presented.
- Initial EHLO diagnostic printed the transcript twice and attempted a second QUIT after stream end; ERR_STREAM_WRITE_AFTER_END was a local diagnostic cleanup issue. Successful observed greeting/capability response is retained as evidence, not a successful TLS session.

## What remains unknown

The owner's subsequent live-settings screenshot shows SMTP mail.allplan.net.tr:587 with direct TLS unchecked and IMAP mail.allplan.net.tr:143 with TLS unchecked. Passwords stayed masked. Fresh unauthenticated DNS lookup resolved mail.allplan.net.tr A to167.86.84.107, no AAAA data; allplan.net.tr MX priority10 points to mail.allplan.net.tr. This correlates the displayed app targets with the observed VPS, though backend-side DNS/network and effective runtime options remain unverified.

A fresh IMAP143 greeting and tagged CAPABILITY response from mail.allplan.net.tr advertised AUTH=PLAIN and AUTH=LOGIN, without STARTTLS. Probe sent only `a1 CAPABILITY` and disconnected: no authentication, mailbox selection or message access. Combined with the earlier SMTP587 observation and owner-supplied TLS-off settings, this is a concrete transport confidentiality concern, not proof of stolen credentials or failed delivery. Successful AUTH was not attempted. SPF/DKIM/DMARC and trusted sender-header handling are not established.

Browser continuation encountered simultaneous owner interaction. Current foreground was unrelated to this task; no further UI actions taken. Actual certificate files/effective mailserver TLS configuration, mail-data/config backup integrity and restore readiness remain UNVERIFIED. No credential changes or server remediation attempted.

## Release decision and next bounded gate

Independent security review agrees: do not deploy a strict-TLS application change against an unverified active mail endpoint. It could interrupt customer email. First read ONLY actual app mail host/port/TLS settings (not passwords), correlate with service runtime, then verify supported TLS endpoint, certificate chain/hostname and expiry. If server remediation/restart is required, prepare separately approved maintenance change with mail-data/config backup, rollback, and controlled delivery test; do not bundle a mailserver latest-image upgrade into the application release.

Local regression-first TLS hardening can be prepared, but remains release-blocked until actual target compatibility is proven. Other runtime/data-preservation gates in source-consolidation report remain open. No production data modified, no push/deploy.

Next action once the management browser is available: read-only inspect the mail service's effective TLS settings, existing certificate metadata (never private key bytes), exact image digest and backup metadata for mail-data/mail-config. Do not recreate volumes, upgrade latest, enable random security components, or restart to discover configuration. Then prepare a separately approved maintenance plan: verified recoverable mail/config backup, trusted certificate and renewal, TLS transport acceptance without credentials, application transition and controlled mail test. Review credential rotation after secure transport is established; do not rotate silently or claim zero downtime.
