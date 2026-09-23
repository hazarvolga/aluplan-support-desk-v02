# Mail transport transition plan — 2026-09-23

Status: PLAN ONLY. No production mutation approved or executed. Application deployment remains NO-GO.

## Verified basis

- Docker Mailserver image version: v15.1.0.
- Running image ID: sha256:4f5093c251b61d5691f5ccfd3f90fcbf505585bfd045546430d282e5417658c8.
- Repository digest: ghcr.io/docker-mailserver/docker-mailserver@sha256:af51b15dd3fc72153c0e90eb7692bb5e3a463212d87959a80fa7aa89b617d44a.
- Existing volumes retain mail, mail state and mailserver configuration; a volume is not verified backup.
- IMAP application settings: mail.allplan.net.tr:143, TLS false. Dovecot SSL disabled and plaintext authentication permitted.
- SMTP submission override: submission/inet/smtpd_tls_security_level=none; SASL authentication enabled. This strengthens the earlier global-only finding; actual network negotiation was not tested.
- Configured certificate is self-issued CN=localhost, SAN=localhost, valid August2025–August2035. It does not match mail.allplan.net.tr. Only public certificate metadata was read; private key bytes were not read.
- Live compiled IMAP and SMTP clients contain rejectUnauthorized:false. The inspected IMAP configuration has no autotls line. New candidate requires certificate validation, IMAP direct TLS and SMTP mandatory STARTTLS.
- Backend Traefik HTTPS router accepts api.allplan.net.tr with PathPrefix(/); listed route middleware is gzip. No authentication middleware in those labels. Other upstream controls and external reachability remain unverified.
- No access-log configuration found in inspected proxy arguments, access-log environment names or four conventional static config paths. No matching target rule in the bounded dynamic YAML search. This is not proof all logging or upstream rules are absent. No raw access/customer logs were downloaded or printed; caller usage is UNKNOWN.

## Smallest safe sequence

1. Freeze this scope: transport compatibility first, application release separately. Pin the existing mailserver digest for rehearsal; do not combine TLS with a mailserver version upgrade or deploy latest.
2. Rehearse locally on a disposable network with synthetic mailbox/account/certificate, no production volumes or credentials and no external mail delivery. Verify v15.1.0 supports the chosen configuration, IMAP993 and SMTP587 STARTTLS, wrong hostname/untrusted/expired certificate rejection, and rejection of plaintext authentication after enforcement. Include both historical client behavior and the hardened candidate. Do not run unsafe historical full application startup.
3. Establish the production certificate/renewal design: publicly trusted certificate for mail.allplan.net.tr, full chain, protected read-only key mount, documented renewal and safe reload ownership. Prefer an existing verified renewal mechanism; otherwise issuance/DNS changes need separate approval. Do not reuse localhost certificate, disable validation, expose Coolify's full certificate store, or copy keys into Git/logs.
4. Before a maintenance window, verify recoverable backups of mail data, mail state/configuration, app settings and DB, plus the immutable mailserver artifact. Account for writes accepted after backup; never roll back mail volumes or customer DB to an earlier snapshot. Inventory other clients using this mail service before requiring TLS.
5. Prepare an exact reviewed operational change sheet: certificate paths/mounts, server TLS parameters, application IMAP993/TLStrue, SMTP587 mandatory STARTTLS, affected clients, expected interruptions and abort criteria. Changes to settings cached in backend processes must have a verified refresh/reload path; do not assume a DB update immediately refreshes caches.
6. Obtain explicit maintenance approval for the exact server/config changes and any required restart, scoped synthetic send/receive tests and credential rotation. No firewall action is part of this plan. An unavoidable mailserver restart can temporarily delay mail; zero downtime is not promised. Web ticket submission should remain available if independently verified.
7. During approved maintenance, pause and drain the relevant inbound writers and outbound mail workers using a proven mechanism, preserving queued jobs and mailbox originals. Do not stop the entire web application by default. If independent worker/poller pause is unavailable, resolve that operational dependency before starting.
8. Activate certificate-backed server transport and move every affected client to the approved encrypted connection. Do not enforce authentication encryption until affected clients have a verified compatible path. Any temporary compatibility interval requires explicit risk approval and a bounded end; this plan does not authorize leaving plaintext credentials exposed.
9. Verify trusted certificate/hostname/chain and renewal path, encrypted auth, preserved mail/queue data and a clearly identified synthetic delivery/reply/attachment round-trip before reopening writers. Do not use a customer message as a test. Rotate potentially exposed mail credentials only after the secure path works, updating all consumers together.
10. Observe bounded aggregate errors/backlog and confirm support operators can recover held items. Only then resume the separate application-image release gates: exact artifact, real isolated DB concurrency, source recovery, customer authorization, attachment bytes and forward recovery.

## Abort and recovery

- Wrong certificate/name/chain, failure to retain mail/queue data, unknown active client, no proven pause, unexpected ingress or inability to authenticate securely: abort before reopening writers.
- Keep new customer writes and mail volumes intact. Configuration/artifact re-entry is not database or mailbox rollback.
- Do not automatically fall back to plaintext authentication or rejectUnauthorized:false. Prefer an explicitly communicated mail processing delay while preserving accepted sources/queues; upstream retry behavior is not a guaranteed backup.
- A short maintenance target is not a guaranteed recovery time. Agree operator escalation, communication and permissible delay before execution.

## Webhook decision — separate from TLS

Do not infer unused webhook from absent secrets, absent observed log configuration or IMAP presence. The legacy route lacks the expected application signature guard; broad API routing is configured. No active exploit or external reachability has been proven.

- First obtain operator/integration-owner confirmation of any inbound HTTP sender, routing destination and retained-source retrieval contract.
- If existing traffic metadata is available, review bounded aggregates for this route (period coverage, method/status/count), without payloads, credentials, customer addresses or raw IPs. Zero observed calls alone is insufficient proof of disuse.
- Enabling new access logging changes production configuration and requires separate approval; it was not done.
- If confirmed unused, propose narrowly closing only this route with owner approval and verify normal IMAP/web flows. No broad API block.
- If active, coordinate sender authentication and prove original body/attachment retrieval or design a bounded protected durable archive before success acknowledgement. No blind automatic replay or reliance on 503 alone.
- A route-closure or signature change may stop legitimate intake; it is not authorized by this planning document.

## Sources and limitations

Upstream reference: https://docker-mailserver.github.io/docker-mailserver/edge/config/environment/ documents SSL_TYPE=manual with SSL_CERT_PATH/SSL_KEY_PATH and treats self-signed certificates as testing-only. This is current upstream guidance, not proof of exact v15.1.0 behavior; exact-version rehearsal is mandatory. Versioned documentation URLs could not be retrieved during this turn.

This turn used configuration/image/public-certificate metadata reads only. No protocol probe, mailbox login, customer content access, DB query, certificate issuance, configuration write, restart, deploy or push. Independent architect review could not start due agent-thread limit. This plan is not a production-ready change script or an independent security signoff.
