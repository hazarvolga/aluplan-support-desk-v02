# Mail transport observation — 2026-09-19

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
