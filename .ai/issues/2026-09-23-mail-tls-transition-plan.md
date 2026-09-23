# Mail transport transition plan — 2026-09-23

Status: PLAN ONLY. No production mutation approved or executed. Application deployment remains NO-GO.

## Local emulator diagnosis and transport proof — 2026-09-23

Supersedes the local Dovecot startup blocker below, not the remaining release gates.

- Reproduced amd64 Dovecot child startup failure in a fresh isolated container. `default_vsz_limit` is256M. A bounded Python `subprocess.run` of `/usr/lib/dovecot/log --help` with `RLIMIT_AS=268435456` returned-5 and `rosetta error: mmap_anonymous_rw mmap failed, size=1000`. With inherited unlimited address space or1GiB it returned89 (expected invalid-option exit, not service success). Native arm64 build under the same pinned multi-platform digest returned89 at256MiB too. These are diagnostic argument-parsing probes, not daemon acceptance.
- On the synthetic amd64 server only, stopped the supervised Dovecot process and started `dovecot -o default_vsz_limit=1G`. This is a temporary emulator accommodation, NOT a production change or recommendation. Container RAM remained805306368bytes (768MiB), CPU2, default capabilities/security profile, no privileged mode, no published ports. The internal network contained only the two owned synthetic containers. No global Docker restart/settings changes.
- Actual amd64 Postfix/Dovecot test using Python stdlib with fixture CA and hostname validation: SMTP587 plaintext AUTH530; STARTTLS TLS1.3; encrypted SMTP authentication235; no refused recipient. IMAP993 authenticationOK. One unique synthetic Message-ID delivered and retrieved; one binary attachment was byte-for-byte equal, and BODY.PEEK/read-only retrieval preserved UNSEEN. No deletion/expunge was requested. This is a server transport/attachment test, NOT application ticket/claim/DB integration or persistent-volume recovery proof.
- Native arm64 comparison server with unmodified256M limit completed SMTP authentication235 and IMAP authenticationOK. This supports the observed Rosetta/address-space-limit cause; arm64 is not the production artifact substitute.
- From the separate native peer, amd64 IMAP143 advertised LOGINDISABLED and rejected LOGIN with PRIVACYREQUIRED. No loopback-security exception was used to claim plaintext IMAP rejection. An initial probe had a local capabilities string/bytes conversion error; only the corrected rejection probe counts.
- Directly launching Dovecot child binaries without their master's descriptors produced unrelated expected bootstrap/panic errors; those are not counted as a reproduction of the service failure. The controlled address-space comparison plus successful bounded daemon override is the relevant evidence.
- No product code, dependency, schema, live system, real credential, customer message, push or deployment change. Dedicated independent review again unavailable due agent-thread limit. The public ARM image was downloaded only for local comparison.
- Cleanup verified: both owned test containers were stopped and removed, followed by their internal network. Only synthetic disposable messages/configuration were discarded; public images and temporary fixture certificates remain available locally. No unrelated container or volume was removed.

Next: connect the hardened candidate's actual mail clients to the isolated server, validate source/attachment and duplicate/hold behavior with disposable application state, and retain exact Node20/Linux artifact acceptance as a separate gate. A synthetic server pass does not prove current live certificate compatibility, renewal, writer pause/cache refresh, backups, webhook source retention or production readiness. Do not copy the emulator override into production.

## Local rehearsal checkpoint — 2026-09-23

Local preparation and partial rehearsal executed; the production sequence below remains a plan, not an approved change script.

- Existing `mail-wire-transport-security.spec.ts`: 10/10 passed with synthetic two-day certificates, cleared environment and macOS sandbox permitting loopback only. Actual application SMTP/IMAP clients talk to synthetic protocol servers; application dependencies/DB are mocked. Node24/macOS proof is not exact Node20/Linux release-image acceptance. An initial invocation skipped all tests because the fixture variable was malformed; only the corrected 10/10 run counts.
- Pulled the pinned public repository digest, Linux/amd64. Its platform manifest is `sha256:c341669e6cbb012c34e8c4a86af27d6415bed485e0a2b66fb18c9ed60a4c4302`; config digest is `sha256:4f5093c251b61d5691f5ccfd3f90fcbf505585bfd045546430d282e5417658c8`, matching the previously recorded live image ID. The local containerd image-store inspect ID is the platform manifest, not that config digest.
- Exact v15.1.0 container used only a synthetic mailbox/password, read-only synthetic leaf key/certificate/CA mounts and fresh container storage. No production volume, credential, mailbox, application bootstrap or customer data. Internal Docker network confirmed, one member, no published ports, no privileged mode or extra capabilities. Spam/antivirus/Fail2ban/update/DKIM/DMARC/SPF services were disabled for transport isolation; this is not production configuration parity.
- `--network none` attempts failed on hostname/IP-interface discovery; an internal isolated bridge allowed setup. No external network was enabled for the server. No image version upgrade or security-profile relaxation was attempted.
- Effective local configuration: Dovecot `ssl=required`, `disable_plaintext_auth=yes`; Postfix submission `smtpd_tls_security_level=encrypt`.
- Actual SMTP587 probe using Python stdlib inside the container: STARTTLS advertised, AUTH not advertised before encryption, plaintext AUTH rejected with530, CA/localhost-verified TLS1.3 established.
- **BLOCKED / NOT PASSED:** Dovecot log/auth/imap-login/anvil subprocess failures, including signal5. SMTP authenticated login subsequently disconnected (`no SASL authentication mechanisms` in server log); IMAP993 reset the connection. The machine/engine are arm64/aarch64 running the amd64 image; emulation is a hypothesis, not established root cause. No authenticated delivery, retrieval, attachment round-trip or historical-client compatibility proof was obtained.
- Dedicated security review could not start because of the agent-thread limit. No product code, live access/write, restart, deployment or push in this turn.
- Cleanup confirmed: disposable mailserver stopped/removed and isolated network removed. Synthetic mailbox existed only in that discarded container; no customer data or persistent production storage was removed. Public pinned image and temporary two-day synthetic certificate fixtures remain local for repeatability.

Next bounded step: diagnose the Dovecot subprocess failure locally without disabling isolation or certificate validation. If confirmed emulator-specific, require a separately scoped isolated native-amd64 rehearsal rather than using production as a test environment. Keep application release NO-GO until secure authentication and source-preserving round-trip pass.

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

Subsequently retrieved exact v15.1.0 upstream environment template: https://raw.githubusercontent.com/docker-mailserver/docker-mailserver/v15.1.0/mailserver.env (lines213–224). It confirms empty SSL_TYPE disables SSL, and manual uses mounted SSL_CERT_PATH/SSL_KEY_PATH. This resolves variable-name/version uncertainty, not startup/client/renewal compatibility proof.

This turn used configuration/image/public-certificate metadata reads only. No protocol probe, mailbox login, customer content access, DB query, certificate issuance, configuration write, restart, deploy or push. Independent architect review could not start due agent-thread limit. This plan is not a production-ready change script or an independent security signoff.
