# Mail transport observation — 2026-09-19

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
