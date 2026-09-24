# Session Summary - 2026-05-13

## Ticket root and detached children integrated — 2026-09-24

Added shared mandatory tracker to TicketsService; create wraps private body root/currentchild, detached autotag and emitAsync reserve children and catch fixed-label failures. Four actual scheduled ticket.created decorators add promisify:true, Automation already awaitable. RuleEngine awaits nested translation emitAsync; actual translation decorator promisifies. Response remains independent of background work; later rule actions now wait translation. New tests cover actualcreate+syntheticconsumer4cases, knownactualmetadata6cases, actualRuleEngine+synthetictranslation2cases.17offline suites298tests pass, HTTP12pass via existing loopback-only runner after offline EPERM; no remote network. Backend+3newtests diagnostics0, PG fixture updated/syntaxchecked but persistence rehearsal not rerun. Source inspection/independent review used; no live/push/deploy. Next full actual consumer acceptance, not maintenance-ready assertion.

## Fallback listener reserves before scheduling — 2026-09-24

Chose smaller listener-side fix instead of touching all AiService publishers. NotificationsGateway.handleAiFallback uses default synchronous event registration, reserves root/child immediately, returns tracked promise; explicit setImmediate retains deferred persistence. Original body moved private; injected shared tracker, updated isolated fixture.5new cases initiallyRED, thenGREEN; strengthened test to actual AiHealthEventService so caught health-write failure still attempts notification as before. Combined12suites205pass/1existing skip; backend/newtest typecheck0 with matching borrowed schema declarations; secrets/diff clean and independent review approved. No production/socket/provider IO or shutdown activation. Next actual ticket-created chain; no claim complete fallback provider lifetime or delivery.

## Three detached query children accounted for — 2026-09-24

Architect caught direct worker queryInternal entry; wrapped both public query/queryInternal and retained existing private bodies. Injected existing shared tracker, reserved3background callbacks before invocation and caught failures with fixed-label warning. Actual-service tests cover closed admission before IO plus trace/cache/training held success/failure without delaying response:8RED then8GREEN. Combined10suites154passed/1existing skipped. Explicit changed-file typecheck exposed3old implicit-any callbacks; minimal test-only annotations clear them, backend+spec diagnostics0. Secret scan/diff clean and independent code/security review approved scope. No production access or runtime control hooks. Worker retries after future closure need coordinated acquisition pause; queued job data never carries leases. Next AI-fallback persistent notifications, not full release acceptance yet.

## Timed-out answer work remains counted — 2026-09-24

Converted2false-zero characterization cases to acceptance; both failed before product patch. Mandatory shared MaintenanceWorkService injected into SupportAnswerOrchestrator; entire generate wrapped plus separate actual generation child before Promise.race. CommonModule registers/exports singleton, no duplicate AiModule registration. Closed root now Nest503. Added4admission/rejection cases; updated existing DI/constructor fixtures, including previously missed nested ai/tests fixture caught by broad run. Final10suites146pass/1existing skip; backend/twoacceptancefile typecheck0 with matching borrowed schema declarations. No live/push/deploy/schema/env changes. Scope excludes provider internals, fallback-event writes and remaining query descendants; no full shutdown/HTTP-fence claim. Next close these concrete descendants before ticket-created integration.

## Ticket fan-out audit prevents premature tracker activation — 2026-09-24

Independent architecture audit found deferred Nest listener wrapper mismatch and nested AI escapes. Added ticket-event-completion.spec.ts (3 synthetic real-Nest cases) and support-answer-timeout-completion.spec.ts (2 actual-orchestrator/mock-provider cases). Verified response timeout is not cancellation, including late reformat after outer tracker zero. Focused6suites69tests pass offline; schema cmp matches borrowed declarations and backend/both-new-test typecheck0. Independent review found no blocking test issue. Product remains unchanged and tracker remains unregistered; no live/customer data/provider access, push or deploy. Next narrow lifetime accounting at actual AI operation boundaries before complete ticket-created integration; do not make customers await AI or mislabel characterization as maintenance acceptance.

## Inert maintenance work tracker foundation — 2026-09-24

Planner bounded contract; added unregistered process-local MaintenanceWorkService and40tests. RED missing module, then two malformed-label failures exposed RegExp coercion; explicit string validation fixed them. Final40/40 with100%file coverage; typecheck0, independent code/security approval. Uses AsyncLocalStorage plus per-instance active identity membership, not context presence as authority. No integrations/endpoints/hooks/env/deps/schema/live changes. Formatting follows existing4space/singlequote style. Primitive intentionally cannot mark app ready: untracked work, task success, real persistence and other processes remain outside evidence. Next complete representative ticket-created ingress→descendant chain without blocking normal responses on AI.

## Finite maintenance acceptance checklist — 2026-09-24

Source-inspected writer/admission families and consolidated existing TLS plan into3gates with pass/stop conditions and deferred scope. Verified WebSocket read can cancel email, assignment delay precedes DB write, direct auto-tagging is detached, reconciliation cron writes DB. No claim exhaustive live inventory. Separate candidate-local proof from legacy first-cutover risk, fresh approved backups, exact artifact and ADR022 forward recovery. No product edits/new tests/production access. Next review bounded shared local completion accounting and ingress fencing; no public maintenance API/new platform by default.

## SLA worker-to-listener completion fixed — 2026-09-24

Added actual Nest EventEmitterModule discovery with real SlaProcessor/SlaCronService/AutomationService, mockIO only;4held-attempt cases initially RED. Two warning emissions now awaited; attempt comments clarified, existing unit mocks migrated. Response/resolution success/rejection cases green; existing caught rejection still marks attempted and completes.15suites134tests pass offline, typecheck0 with schema-matched declarations, secrets/diff clean, independent review scoped clear. Test-only bounded start wait guarantees fixture release on missing dispatch. No real enqueue, delivery, shutdown, production access or schema change proved/performed. Next remaining-writer/admission acceptance scope, not new infrastructure.

## Joined automation mail child operations — 2026-09-24

Read-only architecture audit identified double detachment (producer emit plus unawaited listener children). Added13direct-handler tests:10held-success cases initially RED,3failure continuation cases. Joined existing10mail calls, caught resolution/CSAT rejections, awaited placeholder rules. Review caught newly propagated /tmp write failure risk; removed raw diagnostic file write while retaining sanitized app error log, staff continuation verified. Independent final code/security review clear.13suites116tests green offline, secret scan clean; no live access, schema/env/dependency or emit API changes. No full lifecycle proof; enqueue operations now awaited sequentially, so a hung earlier enqueue can delay subsequent attempts. Next scoped SLA producer completion test, not universal coordinator.

## Minimal worker-before-Redis teardown fix — 2026-09-24

Converted Redis characterization into desired acceptance:3RED failures with product untouched. Root RedisModule first discovery plus final-phase Redis cleanup/awaited QUIT passes held-worker late-read and QUIT resolve/reject tests. No new orchestration framework, dependency, schema or env. Combined10suites88tests green offline; no-emit backend/new-test typecheck0 with schema-identical borrowed declarations; secret scans/diff checks clean. GitNexus unavailable and Graphify report absent, so direct source/framework impact inspection used. Separate reviewed commits retain test/product/docs boundaries; no push/deploy/production access. Detached work remains outside this scoped fix.

## Background shutdown ordering characterization — 2026-09-24

Test-only queue-shutdown-order.spec.ts uses actual global PrismaModule/proxy and installed Bull discovery under candidate-relative module order; held synthetic worker closes before DB disconnect. Added redis-shutdown-order.spec.ts proving current cleanup initiates Redis QUIT before held worker drain, and test-instance final-phase move alone does not fix it. Independent architecture/review; reviewer wording tightened to QUIT initiation, not physical closure. Focused10suites87tests green offline; no product/live/DB/provider changes. Candidate shared Redis is used by AI/knowledge workers; detached event writers remain outside direct IMAP/worker proof. Next explicit bounded worker-before-Redis cleanup ordering plus awaited quit, not broad lifecycle redesign.

## PostgreSQL and attachment signal persistence acceptance — 2026-09-24

Added opt-in mail-shutdown-postgres-rehearsal.cjs using current inbound/claim/tickets/storage source with real PostgreSQL17 and synthetic IMAP/MIME. Held upload after ticket/message commit; actual SIGTERM fences intake and waits; release persists attachment/claim before synthetic ACK and final DB disconnect. Fresh child replay preserves IDs/counts/hash; full owned storage listing excludes orphan files. Independent code/security review found no critical/high blocker; optional manifest suggestion incorporated and executed. Focused8suites84tests passed. No product/schema/live changes. Isolated tmpfs DB owned rows verified zero after cleanup; exact containers, relay and temporary fixtures removed. Final artifact/runtime/all-writer/real transport gates remain; do not equate graceful re-entry with crash recovery or old-version rollback.

## Actual signal and proxy lifecycle acceptance — 2026-09-24

Test-only harness real SIGTERM/current inbound/real Nest with synthetic IO passed2phases under deny-default network sandbox. Child env/source-import isolation and owned cleanup reviewed; negative opt-in/deps tests fail closed. Initial SWC config alias failure and later IPC-error cleanup corrected, final independent code/security approval. Real PrismaService proxy/mocked-driver lifecycle test added;8suites84tests green. No DB/customer/provider/live/product changes. Synthetic receipts explicitly persistenceProof:false; real PG/attachment re-entry remains next gate, not claimed completed.

## Scoped IMAP shutdown implementation — 2026-09-24

Converted characterization to desired safety tests,3RED before patch. Added IMAP stop fence/tracked poll/destroy wait; moved Prisma disconnect to final shutdown phase.7suites83tests GREEN offline; backend+newtest typecheck0 using verified schema-identical generated declarations. Independent architect/code-security review clear for direct chain; GitNexus unavailable. No live access, schema/env/dependency/queue changes, push/deploy. Cleanup invocation is not socket-close proof; detached events/allworkers and real signal/persistence remain gates. Next isolated lifecycle acceptance, not new infrastructure.

## Local shutdown/startup characterization — 2026-09-24

Audited candidate deploy.sh/migrate-once and installed Nest lifecycle; sh-n passes only, scripts not run. New test-only email-inbound-shutdown.spec.ts reproduces missing poll/cleanup wait in real minimal Nest close with mockIO and explicitly synthetic Prisma hook.2characterizations+7IMAP TLS regressions pass offline; no repair or full-topology/signal proof claimed. Independent review led to bounded close observation/final await. No live connection, customer data, product edits, push or deploy. Next ordered lifecycle correction with dependency shutdown order acceptance; historical unsafe re-entry remains prohibited.

## Coolify source UI read-only confirmation — 2026-09-23

Used existing Firefox session to inspect exact mail service Source Compose and Deployable Compose. Confirmed logical/prefixed volume mapping and selected ports/env/image agreement, not byte equality. Closed editor without text entry or save; no restart/deploy/secrets. Recorded persistence boundary and full-source-vs-overlay distinction in TLS plan. Next local safe startup/re-entry/drain planning; no repeated Compose audit needed absent drift. Existing HTTP panel transport noted without changing access.

## Current generated mail Compose compatibility — 2026-09-23

Read-only on-host docker compose config comparison at16:46:51Z proves exact candidate delta against current generated disk Compose/.env, secret values never output. Runtime data mount identities and published ports match; mail start/restarts unchanged. No config installed or DB/queue/service mutation. Added reviewed coordinated maintenance proposal to existing TLS plan. Coolify saved editor definition, exact stop/drain/re-entry and renewal owner/procedure still gates; server TLS alone does not fix permissive live clients. No application-code changes, push or deploy.

## Approved DB/Redis metadata inspection — 2026-09-23

Seven allowlisted nonsecret mail settings read via parameterized SELECT in READ ONLY transaction then ROLLBACK; SQL suppresses secret-classified values. Confirms SMTP587 securefalse/IMAP143 tlsfalse at mail.allplan.net.tr. Direct read-only Redis count commands show no pending/active/failed jobs,964retained completed at16:44:45Z. No payload/jobID/password/mailbox read, no app bootstrap or writes/restart/deploy. Point-in-time counts do not prove quiescence or actual mail delivery. Existing TLS plan updated; next exact coordinated maintenance proposal and current Coolify comparison, not immediate activation.

## Read-only live mail-client compatibility audit — 2026-09-23

Compared selected live compiled SMTP/IMAP/settings/queue code to local candidate. Live accepts invalid certs and optional plaintext; effective mailserver TLS remains disabled. backend-api one node snapshot/start/restarts unchanged; not all-client proof. Queue module3s default overridden by actual enqueue2s in both versions, independently cross-checked and initial commentary corrected. No settings values/DB/Redis payloads/mailbox content read, no production mutation, app edits or deploy. Next nonsecret settings/aggregate queue and Coolify merge scope, then coordinated maintenance proposal. Existing TLS runbook updated; no absolute uptime/data-loss guarantee.

## Local mail maintenance candidate, no activation — 2026-09-23

Committed1365aa2a config-only overlay: existing pinned image/3TLS env/dedicated read-only bind with missing-source creation disabled. Structural and actual Docker Compose rendered-JSON comparison passed against private Sep23 backup without exposing values; existing ports/three data volumes/other fields retained. Gitleaks/diff checks passed. Independent local image review found restart alone cannot be assumed to reverse disabled-TLS rewrites: require fresh same-image container and effective-config checks during separately approved maintenance. Current deployed clients/cache/queue/drain remain unverified gates. No live access, application-code change, service start, DB/mailbox operation, push or deploy this turn.

## Approved private certificate preparation — 2026-09-23

Owner explicitly authorized shared ACME read/one-domain export. Fresh root700 /data/aluplan-mail-tls-bru9sghg contains mail-only chain/key/public receipt600. On-host cryptographic/hostname/trust/byte checks passed, matching public443leaf; source unchanged and no service identity changes. Independent review conditions applied (root-owner guard/python-I). No secrets transferred offhost or displayed. Existing site statuses unchanged; no mount/TLS activation/restart/settings/DB/automation/deploy. Runbook records path/fingerprint and next separate maintenance gate.

## Approved certificate-only production change completed — 2026-09-23

StageA1 one exact-host dynamic YAML published atomically/exclusively; existing Traefik issued trusted mail.allplan.net.tr cert (Let's Encrypt YR1, expiry2026-12-22).HTTPS418verified, existing root/API/oldsite statuses unchanged, existing config checksum/start/restarts unchanged. Initial preflight stopped safely on non-YAML Caddyfile count; corrected no unrelated writes. No key/ACME body read/export, mail TLS activation, DB, restart, application deployment or push. Full scope and artifact paths in TLS plan; next key handoff and mail maintenance remain separately gated.

## Exact certificate-only route proposal — 2026-09-23

Scoped live configuration read found actual Traefik3.6.7, watched file directory/ownership, no exact mail rule among22Docker rules, only low-priority file catch-all. Mac DNS/HTTP metadata checks completed, not actual CA proof. Existing TLS plan contains exact new-file YAML using verified noop@internal418 and StageA1 approval boundary plus before/after/rollback checks. Independent plan review completed. No key/ACME contents, mail data, settings writes, restart, issuance, push or deploy.

## Synthetic DMS renewal proof — 2026-09-23

Added200-line opt-in local-only harness99b506fe. Final9checks pass: initial SMTP/IMAP leaf,5bad pairs rejected,unchanged no-op,new leaf on both protocols,unchanged container identity/watcher running. Real TLS handshakes; no mail content/auth. Test-only controlled watcher stop/copy/start, not production crash/concurrency proof. Independent review found/fixed endpoint/cleanup issues, final review approved. Node syntax/Gitleaks pass; negative Docker override rejected; labelled fixtures removed. TLS plan records emulator/tooling limits and next certificate-only metadata/diff gate. No production access/product changes/push/deploy.

## Reviewed narrow certificate change sheet — 2026-09-23

Prepared staged issuance/one-domain export and later mail maintenance proposal in existing TLS plan. Primary Traefikv3.6/DMS guidance checked; independent security review completed. Shared ACME read privilege, pair-publication race, Coolify route ownership and drain/alert gates remain explicit. No live reads/writes, CA issuance, key access, product code or new test run this turn. Next synthetic local renewal rehearsal; separate approvals before each production stage.

## Public certificate metadata inspection — 2026-09-23

Scoped live read-only SSH verified localhost mail cert, default Traefik HTTPS cert for mail hostname, current DNS and existing proxy HTTP-01 resolver. Only public cert metadata and selected runtime arguments/file stats; ACME contents/private keys untouched. Normal443 validation failed; separate diagnostic leaf inspection sent no HTTP/auth. No live changes; mail/proxy restart counts unchanged. TLS plan records evidence and proposed narrow issuance/renewal scope; production NO-GO remains.

## Narrow mail-secret fix — 2026-09-23

Regression-first8RED then final35settings/64combined GREEN. SettingsService enforces exact mail-password classification despite false and masks legacy values without read-time DB conversion. Existing internal reads and masked saves preserved. Independent combined review approved; additional legacy-mask cases added. Older typecheck harness failed missing generated declarations; identical-schema sibling mapping rerun0diagnostics including spec. Whole-file coverage below80% explicitly recorded, diff Gitleaks clean. Tests7bd17b46/product1157cc28; no live/frontend/schema/env/publication actions. Next return to TLS metadata gate, not new architecture.

## Local mail renewal/client audit — 2026-09-23

Inspected exact pinned public DMS image scripts without daemon/network/mounts; existing manual-cert change watcher/reload confirmed at source level only. Independent explorer audited local app cache/pause paths and found concrete missing IMAP password secret classification in frontend/backend. No live credential/plaintext inference. Next minimal regression-first correction recorded in TLS plan; new live cert metadata scope requested, not performed. No code/tests/live mutation; temporary inspection containers removed.

## Owner-approved Mac mail backup — 2026-09-23

Fresh private VPS staging/archive plus SCP to owner-selected unencrypted Mac destination completed. Transfer checksum and inert237regular-file byte readback passed; final persistent source drift0 and container unchanged. Initial31nonregular skip notices were investigated before completion, not ignored as data drift. Archive1symlink retained but not materialized; original metadata/runtime/atomic consistency not proven. No live restart/config/DB/mail send/deploy. No backups removed; Mac archive and private readback retained outside Git. TLS plan records paths/hash/times/limitations. Independent script security review and5synthetic verifier cases passed; application code/tests unchanged.

## Approved live mail metadata audit — 2026-09-23

Completed scoped configuration/volume/retention/backup metadata inspection on verified vmi3049865. Persistent volumes and selected autoexpunge0 confirmed; disk19%; mail container start/restarts unchanged. Sep19 on-host archive exists0600/1618614bytes; no current archive-content/checksum validation or newer/off-host backup proof. Narrow schedule scan cannot establish all retention or backup behavior. TLS remains disabled globally. No mail bodies/attachments, mailbox login, customer DB, test send, live writes/restart/deploy/push. Full evidence/limits/next approval boundary recorded in TLS plan; no code or tests changed.

## Synthetic retained-source repair rehearsal — 2026-09-23

Completed narrow known-message missing-attachment test: retained synthetic MIME, actual parsing and PostgreSQL, injected upload failure, hash/fingerprint/identity checks, targeted LOCAL attachment repair, serial no-duplicate repeat and tamper refusal. Domain10/10 and changedfileTS0; independent review approved; test29182054. Original claim/error remains unchanged. No production-ready repair tool or provider retention evidence. Existing partial-attachment ACK policy explicitly recorded in TLS plan; source custody must include Seen/completed cases. Synthetic fixture removed; no live/customer/product/publication changes.

## Recipient ordering correction — 2026-09-23

Completed user-approved concrete fix: unchanged recipient lookup moved ahead of reply writes after auth/validation; notification dispatch remains aftercommit. Tests first caught old ordering, final203focused+9realPG passed; changedfileTS0 and independent review clear. Specific partial-write window closed, other recovery gates remain. Tests d3756d51/product e1ff2f0b, docs in TLS plan. No live/customer access, push or deploy; only owned synthetic fixtures discarded.

## Recovery consolidation checkpoint — 2026-09-23

Added/reviewed postcommit recipient-query fault characterization; real persistence suite9/9 and changedfileTS0. No product change: committed reply/missing attachment/held claim remains explicit. Existing TLS plan consolidated manual reconciliation evidence gates; operator list is not recovery proof. No new queue/outbox/replay. Next scoped recipient-query ordering fix, then bounded source/reconciliation acceptance. Owned synthetic fixture removed; no live or customer access/publication.

## Atomic reply write checkpoint — 2026-09-23

Implemented transaction around reply insert and required reopen/first-SLA writes, preserving pre-read authorization/sanitization and postcommit recipients/events. Real PG2RED then8GREEN; overlapping valid replies preserved after independent review correction. Existing75ticket+125intake tests green, changed-fileTS0 after test-mock typing correction. No schema/env/live changes. Synthetic fixture cleaned. Testsaf6e17bd/product3acd9cb7. Remaining before/aftercommit ambiguity and operational recovery gates explicitly open in TLS plan; not production acceptance.

## Held intake correlation correction — 2026-09-23

Implemented minimal known-ID/evidence retention in existing hold CAS for both IMAP and webhook. No TicketsService, schema, lifecycle or auto-replay change. Six assertions failed first; final125focused tests and4actualPG tests passed. New PG constraint-injection proves retained ticket correlation after rejected initial message. Corrected direct-event test interpretation against actual Nest wrapper; unknown-before-return/message recovery still open. Independent code/security reviewed; test/product commits1ae587eb/db3c7529. Temporary synthetic fixture cleaned; no live/customer access or publication. Next scoped message/status atomicity proof; production NO-GO unchanged.

## Actual domain persistence checkpoint — 2026-09-23

Added local-only opt-in PostgreSQL domain test3/3 with actual ticket/access/PII/local-storage services. Normal attachment bytes and no duplicate replay proved; injected synchronous post-commit listener failures leave incomplete domain state and manual-held claims with missing linkage. Not production failure incidence or completed recovery proof. Reviewed test, existing71regressions green; no product/live changes. TLS transition plan records exact fixture, limitations and next bounded release-blocking correction.

## Real storage integrity and domain-write preparation — 2026-09-23

Discovered/reproduced timestamp-only upload-key collision using actual synthetic disk writes. Added UUID new-key identity with byte-bounded filenames; existing objects untouched. Real disk byte retrieval/long UTF-8 name tests and S3 key-command test added. Sixsuites71tests passed; independent code/security review approved. Product scope deliberately small. Source-only TicketsService inspection identified separate post-insert failure windows; actual combined ticket/message/attachment DB proof remains OPEN, not conflated with these passing storage tests. No production access or publication.

## PostgreSQL claim concurrency proof — 2026-09-23

Added real PrismaPg/PG17 isolated claim integration tests, final4/4 plus existing46/46. Schema-matched inbound log table only, no fake delegates. Observed real lock contention and owner fencing; completed conflicting payload retains ticket/attachment-failure metadata. Graceful client replacement leaves pending claim held. Independent review found and corrected test failure-path draining; no product edits. TLS plan records image/schema identity and proof boundaries. Real ticket/message/storage transactions, DB restart/crash durability and full application release gates remain unproven. No production/publication changes.

## Candidate client integration with isolated DMS — 2026-09-23

Added opt-in3test integration suite using actual app SMTP/IMAP/MIME/intake/claim code against pinned amd64 mailserver; persistence services are synthetic doubles. Clean final run3/3, existing focused46/46, new-file TS0. Proved byte-preserving parser-to-storage boundary, duplicate re-poll fencing and failed-write UNSEEN retention/hold. Internal network/no final published ports; bounded raw-TLS loopback relay used. No product or live changes. TLS plan contains limitations; real PostgreSQL/actual storage/exact-release-image gates remain open.

## Local Dovecot diagnosis and mail round-trip — 2026-09-23

Identified controlled Rosetta address-space failure at Dovecot's256MiB default, corroborated by native arm64 comparison. Local-only1GiB virtual-address override resolved amd64 daemon startup while retaining768MiB container RAM and isolation. Actual SMTP/IMAP authentication and synthetic message/binary-attachment round-trip passed, UNSEEN preserved; cross-container plaintext IMAP rejected. No application ticket/DB integration, native-amd64 execution or production acceptance claimed. See TLS transition plan for exact observations and temporary setup differences. No product/live/publication changes; independent reviewer unavailable(thread limit).

## Local mail TLS rehearsal — 2026-09-23

Existing synthetic wire tests passed10/10 under loopback-only sandbox. Downloaded immutable official v15.1.0 amd64 image and matched manifest config digest to earlier live ID. Fresh isolated test container demonstrated SMTP STARTTLS/verified TLS1.3 and plaintext AUTH530 rejection, but Dovecot subprocess failures (signal5) prevented authenticated SMTP/IMAP success. Emulation root cause unproven; no mail round-trip acceptance. Detailed setup, limits and next gate recorded in `.ai/issues/2026-09-23-mail-tls-transition-plan.md`. No product changes, production access or publication. Dedicated reviewer unavailable due thread limit.

## Mail TLS planning checkpoint — 2026-09-23

Owner accepted staged planning plus bounded read-only metadata investigation. New plan: .ai/issues/2026-09-23-mail-tls-transition-plan.md. Current mail image v15.1.0 identified by immutable digest; configured public certificate is self-signed localhost, not mail.allplan.net.tr. SMTP submission override also explicitly disables TLS security. Live clients disable certificate validation. Backend broad API route labels show gzip only; webhook usage remains UNKNOWN, and bounded proxy configuration checks found no access-log setup. No absence-of-traffic claim.

Next smallest implementation is isolated synthetic transport rehearsal, not live TLS checkbox changes or combined application rollout. Plan requires verified backups, renewal ownership, client inventory, independent mail-writer pause, coordinated settings refresh and approved maintenance; never restore old customer/mail data or automatically revert to plaintext. No production writes/restart/deploy/push, protocol probe or customer content access. Dedicated review unavailable; production NO-GO remains.

## Live mail read-only findings — 2026-09-23

Explicitly approved configuration-only inspection completed viaSSH; no settings/restart/deploy/testmail or customercontentread. Source-consolidation topsection records exactscope/limits. LiveIMAP143/tlsfalse confirmed; Dovecotssl=no/disable_plaintext_auth=no; maildataonpersistentvolume andselectedautoexpunge0. Persistence isnotbackup/recoveryproof. Ports publishedallinterfaces, externalreachabilitynotprobed. Livewebhookcontroller lacks expectedrouteguard/signaturefile andglobalguard inspectedisthrottler; upstreamaccess/callersunknown, no exploitprobe. Thereforewebhookunusednotproven.

CurrentlocaldirectTLScandidate would beincompatiblewithoutapprovedmailtransportwork; productionNO-GO. Nextplan TLS/certificatecompatibility and identifyactualwebhookroute/callers withseparatelyscopedmetadata-only evidence; do notflipTLSblindly,disableingressorbuildanarchivewithoutneed. Secretsnotprinted/decrypted. Existing175testproofunchanged; no newtests/sourcechanges. Independentsecurityagentunavailable(threadlimit).

## Webhook false-success mitigation — 2026-09-23

Local controller now acknowledges only explicit completed; held/unknown outcomes throw fixed503 INBOUND_EMAIL_REVIEW_REQUIRED. No automatic replay, provider request, payload archive, schema, configuration or shared intake change. Successful completion retains200/success; signature guard remains required. This supersedes only the unconditional-success portion of the previous HIGH finding. Source-retention/manual-recovery remains HIGH and production NO-GO:503 cannot establish provider retry/retention or reconstruct absent bodies/attachments.

Proof: controller RED5pass/5fail -> GREEN10/10, including unknown outcomes, pending promise, rejected service and actual GlobalExceptionFilter with a fake HTTP adapter/audit service. No socket/realHTTP integration claimed. Controller-only coverage100% all metrics, not project coverage. Combined17suites175tests PASS including signature/filter/mail regression controls; backend294rootfiles0noemit diagnostics. Cleared environment, network-denied macOS Node24.18.0, actual RC dependencies with previously disclosed schema-matched sibling DB declarations. Gitleaks changed-diff no leaks; diffcheck clean. No fullapp/DB/customer/mailbox/provider access or targetimage rebuild. Dedicated code-reviewer start hit thread limit; supplementary planner review does not close final independent acceptance.

Local evidence cannot identify the real inbound webhook provider or prove it is enabled. Generic HMAC x-webhook-signature and Mailgun/Resend comments are not provider evidence. The separate Resend route concerns outgoing delivery events, not incoming content custody. Do not disable webhook or assume IMAP-only operation.

Next gate (requires separately scoped read-only production-configuration approval): identify actual active inbound routes/forwarding, provider/service and version, original MIME/body/attachment retention, stable retrieval identity, retry window and operator recovery path; never reveal secrets/customer content. No test send, replay, connection-test button, flag mutation or config save. If retained-source retrieval is verified, prefer that existing path. If webhook is demonstrably unused, separately approve keeping it disabled with a regression guard. Otherwise design a bounded protected durable source store before claim/domain effects; no body in error markers, expiring Redis cache or ephemeral container disk. Include attachment bytes, size limits, encryption/key custody, access/audit, retention and failure-before-ACK tests. Do not introduce that architecture merely because provider evidence is missing.

## Local shared inbound claim patch — 2026-09-23

**WIP / HIGH blocker found in final security review:** webhook controller returns HTTP200 even when service returns held; log metadata/fingerprint is not recoverable original content. A pre-write failure or concurrent pending delivery can therefore be acknowledged with no locally recoverable payload. Provider retention/retrieval is unverified. Do not call this durable webhook intake acceptance or source-preserving delivery. Non-2xx alone is insufficient: next batch must prove provider-specific retained-source retrieval or a bounded protected durable-source design plus explicit controller outcome tests. IMAP source retention does not establish webhook recovery. Security-review agent subsequently started successfully and identified this blocker; dedicated code-review agent remained unavailable. No patch approval or release acceptance is claimed.

Owner accepted conservative hold/manual-review behavior. Implemented shared unique-create claim before IMAP/webhook ticket effects, compare-and-set completion, fingerprint identity conflict holds, success-only IMAP acknowledgement, per-message isolation and finally cleanup. Ambiguous/interrupted/legacy deliveries never automatically replay. Partial-attachment completion remains a duplicate fence with retained failure evidence. Missing identity, invalid text and parse failures are held; IMAP holds include safe INBOX UID/UIDVALIDITY locators. No schema/migration or dependency change in this batch.

Read-only GET /email/admin/inbound/review requires JWT plus settings:read, uses no-store and bounded pagination, excludes raw errors/claim owner/fingerprint. This is an API, not a new frontend review screen; there is no retry/delete/clear action. Settings permission is the existing authorization boundary, not a newly invented role. Manual reconciliation must inspect the mailbox, ticket and attachments before any separately approved action. Webhook HTTP success proves neither recoverable intake nor ticket creation. Unconditional success and absent payload persistence predate this patch; newly held missing-identity/legacy/pending/conflict paths expand that recovery gap.

Local proof: combined14suites/158tests PASS; actual dependency controls13/13 PASS; backend no-emit294roots/0diagnostics. New helper19tests coverage90.12% statements/85.29% branches/100% functions/97.05% lines, NOT whole-project coverage. Initial behavioral RED9/11 and later malformed-input/UIDVALIDITY RED2/15 verified before fixes. All synthetic, cleared environment and network-denied macOS Node24.18.0; existing schema-matched sibling DB declarations used, no real database/bootstrap/mailbox. Architect independently reviewed parent integration; parent reviewed helper/endpoint. Dedicated final code-reviewer could not start due agent-thread limit: final independent code/security acceptance remains OPEN. GitNexus/report unavailable, direct callpath review used.

Remaining release blockers for this patch: disposable PostgreSQL concurrency/failure proof, exact Node20/Linux image acceptance, operator review workflow, verified ingress sender authentication/resource limits and current TLS compatibility. All writers must be quiesced and upgraded together: legacy writers do not honor new markers. No mixed-version rollout or blind replay of held rows. Existing image76432 does not contain mail patches. Existing broader vulnerability/bytes/forward-recovery/host/fresh-backup gates remain. No production access, provider/DB action, push or deploy; production NO-GO. Local checkpoint is work-in-progress evidence, not release approval.

## 2026-09-23 — Inbound failure characterization; application change deliberately paused

Continued local-only after66e0c9f5. Aluplan skill preserved current mail/ticket contracts; no graph tool/report available, so direct caller/table/consumer review used. Independent planner and security agents agree a one-line markSeen:false change is unsafe: a ticket/message may already be committed when TicketsService later throws; both IMAP and webhook share the unique-log/upsert path without exclusive claim. Current source has no admin read surface for inboundEmailLog, so manual hold needs a visible operational review path, not only an error marker.

Added only email-inbound-reliability.characterization.spec.ts:9/9 cases reproduce current behavior, explicitly NOT safety acceptance. Synthetic counters show two ticket writes / two reply writes on repeated post-commit-failure delivery and two concurrent cross-channel writes despite one stateful unique log. One parser error aborts the remaining batch and search/parse errors omit connection.end. Existing processed/partial-attachment fences prevent replay; isProcessing resets after errors. Real ingress methods with mock parser/IMAP/DB/TicketsService/storage, no actual DB transaction or provider proof. Replace gap assertions with desired safety regressions when approved fix lands.

Agent isolated1suite/9pass; parent combined10suites/114pass includes105existing regressions plus9characterizations, none skipped. Parent actual dependency harness13/13 passes. env-i/macOS network-denied, Node24.18.0; existing combined-suite resolver uses schema-matched sibling generatedDBpackage and RCsharedschemas as disclosed previously. No app bootstrap or customer data. Newtest Gitleaks no leaks and diffcheck clean. No production counts, new image/scan/typecheck/coverage or delivery claims.

Proposed bounded no-schema-first design is recorded in source-consolidation; implementation awaits owner decision that ambiguous/interrupted/legacy messages are held visibly for support-administrator reconciliation rather than blindly replayed. Shared claim adoption must cover both routes; attachment failures keep existing duplicate fence. Header identity/UIDVALIDITY and From spoofing trust remain separate checks. No product/dependency/schema/config change; no live access/push/deploy. Global NO-GO remains.

## 2026-09-23 — Scoped mail dependency patch, local compatibility gates passed

Test bcc84323 / patch f73a6902 pin mailparser3.9.28 and nodemailer10.0.10 coherently; no major override or unrelated lock update. New actual-dependency harness initially6pass/2expectedfail on direct6.10.1/nested7.0.13, unchanged original controls8/8 after update; five new compatibility controls make13/13. Original tiny2193byte/128address accumulator probe counted8256copies in each old path versus0patched;2second child deadline/256MiB V8heap/64KiB output/emptyenv. Not general MIME DoS proof.

Turkish MIME/text/HTML, HTML-only fallback, exact synthetic attachment bytes, threading, grouped/quoted addresses, CRLF controls, dynamic mailparser import and construct-only SMTP/Gmail options pass. Existing mockedmail105/105 and real loopbackSMTP/IMAP TLS10/10 pass; WebSocket15/15 unchanged. TLS tests use ephemeral synthetic CA only, localhost-only network sandbox; valid encryptedAUTH and invalidcert/noSTARTTLS rejection checked. Initial sandbox address literal was rejected before tests; corrected supported localhost selector passed. Owned temporary keys/certificates removed; system trust unchanged.

ActualRC backend noemit initially2TS2503 from new bundled type declarations; named type-only imports in provider and existing spec fix both. Reviewer verified byte-identical emittedJS, bundledtypesresolution and293roots/0diagnostics. Retained old@types is not forced as module resolution. Schema-matched sibling generatedDB declarations and RCsharedschema source used; no generation/DB connection. All local checks Node24.18.0, not target20.20.2 artifact proof. Independent review approved bounded diff; source/testGitleaks clean. Existing skill preserved mail/queue/TLS contracts and separated acknowledgment work; GitNexus unavailable, direct caller/consumer review used.

No live/provider/mailbox/DB/push/deploy action or full image rebuild/rescan. Existing76432/source2e9c7ebf remains pre-mail-patch. Next mocked failure/ack-order/idempotence tests and minimal inbound reliability fix, then appropriate final-artifact gates. Parser-size/resource policy, historical IMAPTLS mismatch, remaining advisory/crawler/bytes/forward-recovery/host/backups still open. Production NO-GO. See source-consolidation for scope and upstream references.

## 2026-09-23 — Mail reachability/compatibility triage, no mail code changes

Following artifactcheckpointf8b3a9f5/tagrestore/websocket-image-20260923, read-only explorer traced both actual Nodemailer resolutions and independent security reviewer assessed next scope. Inbound simpleParser uses nested7.0.13 addressparser before eligibility; no explicit app raw-size/attachment-count cap. Direct6.10.1 SMTP/Gmail accepts onlyfrom/to/subject/html/text, so arbitraryraw/file-fetch and SMTP-only nested findings require separate reachability classification, not blanket exploit claims. markSeen:true fetch occurs before parsing/processing; processMail catches failures, risking missed UNSEEN retry. Physical deletion or current live loss is NOT demonstrated. Historical143/tlsfalse versus localdirectTLS remains a releasecompatibility gate, not permission to weakenTLS.

Primary maintainer advisory confirms addressparser quadratic DoS below9.1.0; current upstreammailparser3.9.28 pins10.0.10 (Node>=20), and Nodemailer10 introduces TypeScript/dualmodule layout changes. No target blindly selected/installed. Existing focused9suites/105tests passed, pending0: SMTP/IMAPsecurity, inboundservice/eligibility/attachments/bounce, two emailservice suites andprocessor. ActualRCdependencies, env-i/Node24/macOSnetworkdenied, schema-matched borrowedDBclient and RCshared-schema alias as previous checks. Expected mock errors do not indicate real connections. WireTLS suite was deliberately not included; no realSMTP/IMAP or new parser/advisory/ack-order regression run yet. Next bounded test-first characterization before separate dependency/reliability patches; no production/dependency/app edits.

## 2026-09-23 — Exact WebSocket-patched artifact and same-DB scan verified

Built clean source2e9c7ebf3aafdbeb9b0a80e834a965466be0bf94 into Linux/amd64 image76432eedde218de943045dc46320801ca7b6816e6a62d8fcb6f2ce14b8cb0d50. Existing build tool12/12tests and static smoke passed57migrationfiles/backup-tool versions/startup syntax. Registry/APK access and build lifecycle scripts occurred; not an offline build. No app bootstrap or customer DB used; generated Prisma client stays inside image. No tracked product/dependency changes this phase.

Networknone/nonroot/read-only actual-image WebSocket tests: old6ae3=7pass/8expectedfail, new76432=15pass/0fail. Same unchanged test; no skipped/cancelled. Static compiled CSRF inspector stillpasses2safe warnings, legacyabsence, root-owned unwritable/app; mainhash unchanged7c29425a. Parent and independent reviewer verified new OCIindex→manifest→config/source/receipt/report identities and unchanged frozenDBhash. Raw report createdSeptember22 19:36:56UTC (this closing record September23local).

Same scanner0.72.0 and advisoryDB:336→330findingoccurrences,2C128H183M23L→2C123H182M23L. Removed6 expected engine/parser/ws findings, added0, no unrelated finding changed. Application69High; globalPrisma7High/npm19High+1Critical/pnpm28High+1Critical remain. No whole security/browser/data-preservation claim; production NO-GO. Original baseline evidence untouched, newprivateevidencevuln-ws-20260922-amWugP retained0700/reports0600. Owned smoke/test/scannercontainers absent; no customnetworks/volumes. No live, DB, provider, push or deploy action. Next maildependency compatibility/advisory triage, keeping mailbox untouched; existing other release gates remain.

## 2026-09-22 — Bounded WebSocket remediation and local checkpoints

Test commit `0ded9b6d`; package/lock commit `2b402a84`. engine.io6.6.5→6.6.10, socket.io-parser4.2.5→4.2.7, ws8.18.3→8.21.1. Security review caught that the initially proposed6.6.7/8.21.0 versions still missed protocol-mismatch and empty-fragment fixes. Intermediate RED12pass/3fail became final15/15PASS with unchanged rejection/valid-input controls and tighter finite-cap assertions. Independent code reviewer confirmed installed patched branches and both blocker closures; not a full security rescan. Security follow-up hit thread limit, so no second full security signoff claimed.

Gateway baseline and final46/46PASS. Final run used actual RC dependencies, network-denied macOS sandbox and mocked services; only generated database package borrowed from schema-matched September17 sibling. Backend293/frontend273 root-file no-emit typechecks passed0diagnostics with actual RC dependencies, borrowed matching DB declarations and RC shared-schema source alias. Node24.18.0 local proof, not Linux/amd64 Node20 image proof. Initial gateway setup-resolution errors were corrected via explicit pnpm modulePaths without weakening assertions. Exact pnpm9.15.4 lock generation/frozen install used ignore-scripts and public registry with cleared environment. No app boot, real DB/mail/provider connection or client generation. Staged-diff Gitleaks checks found0 leaks; no blanket secret/security certification.

No app source/schema/migrations/Dockerfile changes. ws7.5.10 dev-tool dependency remains separately tracked; not all workspace advisories cleared. Existing6ae3 exact image and scan are pre-patch. Next rebuild pinned candidate and compare/rescan artifact; mail/parser, tooling/crawler and existing data/host gates remain. No production access, push, deploy or restart. Production NO-GO. Full details in source-consolidation; local checkpoints are not remote backups.

## 2026-09-22 — Same-database image security comparison; no product edits

Pinned existing Trivy0.72.0 imagecffe3f51, separate DB-only download from officialGHCR (no app archive mount), then nonroot/read-only/capdrop/nnp network-none scanning of Docker-saved candidate6ae3 and previous LOCALb112 archives. No Docker socket, credentials, app bootstrap or DB access. All severities/unfixed retained; ignorefile/dev/null, no ignores or VEX supplied. DB updated07:24UTC/downloaded18:51UTC; scan19:02UTC,11.63hours old and beforeNextUpdate. Exit0 means tool completion, not clean security. Scanner signature was not independently verified; pinned identity only.

Both exact images yielded identical336findings:2Critical/128High/183Medium/23Low;90uniqueHigh/Critical advisoryIDs. CriticalCVE-2026-59873(tar6.2.1) occurs in npm and pnpm. Application-tree74High, globalPrisma7High, npm19High+1Critical, pnpm28High+1Critical. Alpine264packages0findings; node-pkg1460records336findings. No new dependency finding caused by last log fix; no comparable claim against old historical71High scan or current live. Initial identity equality assertion correctly failed because Docker ID is OCIindex and Trivy ID is config; then full hashed index→amd64manifest→config chain/revision/legacy-layer-list/DiffIDs verified for both, without bypassing identity gates.

Initial source triage prioritizes runtime WebSocket transport (engine.io/socket.io-parser/ws), mailparser/nodemailer and XLSX/other parser exposure, plus retained package-manager vulnerabilities. Privileged crawler URLs still run Axios/unsandboxedChromium without a wiredSsrfGuard; no exploitation attempted. pnpm/Prisma cannot be blindly removed because startup/schema verification invoke them; AWSCLI supports approved backups. Suggested next small patch group6.6.7/4.2.7/8.21.0 needs red/green tests and independent review, not automatic overrides/major upgrades.

Private evidence/aggregate `.private-data/release-evidence/vuln-6ae3-20260922-GNSnSY/`; raw reports/archives/DB retained under private directory. Three named scanner containers removed with fresh exact-label absence; no networks/volumes created. Parent asserted report counts/hash chains and no product/lockfile changes. Explorer source mapping finished; further security-review agents hit usage limit, so no independent security signoff. No new full test-suite/coverage claim. Production NO-GO; no production/push/deploy actions. Full reachability decisions and existing mailTLS/bytes/forward-recovery/host/fresh-backup gates remain.

## 2026-09-22 — Exact patched backend artifact and repeated auth gate passed

Built clean source6a0be372fa190cff72fdf8bbfed8db6f33a055cc with existing A13 tooling: Linux/amd64 image6ae3a63850864c28e2dedaafa5056c453dc94fc73b3afd85092302c22b5dbe0c. Context11.55MB; registry/APK downloads occurred, so not an offline build. Dockerfile/lock unchanged but OS packages updated; old vulnerability counts do not apply. Static smoke verified57 migrations, executable/syntax-valid startup scripts and backup tools. Parent checked image receipt hashes/revision/architecture and local image identity.

Private reviewed static inspector715907b8 verified exactly two fixed CSRF warnings in compiled main and absence of old interpolation without app bootstrap; nonroot/networknone/read-only/capdrop container, /app not writable. Four synthetic inspector controls passed. Compiled main hash7c29425aa1f89edef7c19ad05caf2e9d76bd767261efc8b2b1aa99a50021ffef. Existing build-tool tests12/12 and combined focused auth/privacy/tooling tests44/44 passed; no global coverage claim. No tracked product/tooling change this turn.

Preserved baseline private runnerb6b86f72; new runnerd5dcde20 changes only candidate image/SHA plus two comments. New disposable sanitized historical clone run cde676d3cece: preboot migration/protected parity/structured credential clearing passed, all12 browser checks true, unexpected0/proxyErrors0, durable fixturePASS. Counts180/563/114 unchanged, users1285→1286 synthetic only. Reference checksum unchanged. Cleanup verified by receipt and fresh exact-label inventories; sampled egress blocked. Independent reviewer confirmed safe receipts; parent independently asserted values and resource absence. Browser remains devfrontend53f55fae with disclosed redirect/certificate exceptions, not productionfrontend/TLS/dashboard/automatic refresh acceptance. No whole postboot row/attachment-byte preservation claim.

Next exact-image vulnerability gate; installed Trivy0.72.0 found but no cache freshness check or scan performed. Mail transport, historical bytes, new-write/byte forward recovery and approved host/credential/fresh-backup gates remain. Production NO-GO. No production access, push, deploy, provider operation or live DB change. Images/private receipts retained; owned temporary resources removed.

## 2026-09-22 — Real auth browser aggregate and durable fixture gate passed

Transport diagnosis stayed data-free. Baseline four-login repetitions: one PASS, one FAIL with a single ECONNRESET during closing-context on a socket with6 requests/6 finished responses/0 active, lastClass blocked-dev-diagnostics, requestComplete true and requestAborted false. Candidate changes only intentional403 denial headers to Connection:close; two matched four-login repetitions passed with unexpected0/proxyErrors0. No generic error suppression or upstream/cookie changes. Commit1b625c45; RED15/16→GREEN16/16, combined44/44, independent code/security approval. Scanner: probe0, tests retain exactly2 previously reviewed fixed noncredential JWT strings. No product code modified.

One real-backend clone run46931334e73b then completed all12 browser assertions and final durable fixture verification. Aggregate pass=true, unexpected0/proxyErrors0; counts blockedAuthenticatedPages4/HMR6/devDiagnostics1/normalizedDevRedirects1. Durable reset consumed/sessionVersion incremented once/new password matches/old rejected/CUSTOMER authority preserved/no queued or sent synthetic mail. Pre/post snapshot counts180/563/114 unchanged; users1285→1286 reflects the added fixture, not production. Protected preboot fingerprints and structured-credential clearing passed; no complete postboot historical-row or attachment-byte parity claim.

Backend remains3403ae61/b112; browser53f55fae contains probe6ab3e798. Source CSRF warning fix0dc5aac0 is NOT in this tested backend. New browser image is a cached-base, COPY-only build with no package install. Original September17 reference checksum unchanged. Sampled externalTCP/DNS/host-canary checks passed in preboot/backend/browser. Raw backend logs not retained. All exact owned resources removed and fresh label inventories empty; private receipts and images retained. Data-free containerd97e2afa also removed. No live connection, push, deploy or production mutation.

Next: final immutable patched-backend build and artifact-specific rehearsal using existing tools; then remaining mail/bytes/forward-recovery/vulnerability/approved-host/fresh-backup gates. Dashboard rendering, automatic frontend refresh, actual CRM/mail delivery, public TLS and exact production frontend were not certified here. Production NO-GO. Details in source-consolidation; condensed handoff refreshed.

## 2026-09-22 — Data-free post-login classification repaired, transport error retained

Checkpoint50cfa072 changes only auth-browser test tooling. Synthetic successful CUSTOMER login reproduced exact unprefixed /my-tickets GET with bounded RSC and exact POST Next dev diagnostics failing proxy route assertion. Both remain denied: unprefixed authenticated routes now have the same blocked category as localized routes; actual proxy403-denies known blocked classes before body/upstream, after host/auth-header checks. Unexpected variants still fail. New test invokes actual server handler without a listening socket and proves zero upstream calls, positive blocked counters, and seven malformed/unknown/body failures. RED13pass2fail→GREEN15/15; combined focused43/43. Independent named code/security review approved; no product change.

Two post-fix four-login data-free repeats: rejected paths0, proxy-handler assertions0, unexpected0; both overall FAIL on proxyErrors1. Last repeat identifies server clientError ECONNRESET, not an upstream failure. Context-close causality not yet proven; no suppression, no full-clone retry, no full-browser pass. Owned network-none/read-only/nonroot/native-sandbox diagnostic container04baa489… label20260922-b removed after exact ownership check; label inventory empty. No DB/Redis/provider/live traffic or new image build. Original artifacts unchanged. Probe Gitleaks clean; test scan retains exactly the two previously reviewed fixed noncredential JWT strings at9/10. No blanket scanner-clean or whole-project coverage claim.

Next: bounded data-free socket/lifecycle correlation, then aggregate + durable fixture acceptance. Frozen backend3403/b112 still lacks source CSRF log fix0dc5aac0; existing exact-image script can rebuild but dependency networking is not guaranteed absent. Detailed current gate and evidence in source-consolidation. Production NO-GO; no push/deploy.

## 2026-09-22 — Scoped CSRF log defect fixed; dev redirect cause reproduced

Actual inline middleware regression RED3fail/1pass→GREEN4/4; product commit0dc5aac0 changes only two warnings to fixed reasons, preserving CSRF decisions/cookies/responses. Test commit886ab2eb uses TS AST extraction without bootstrap/DB/network. Independent code/security approval, clean test/product Gitleaks, whole-backend borrowed-resolver TypeScript0diagnostics. No new env/schema/dependency. Frozen3403ae61/b112 image does not include the fix; final candidate needs rebuilding.

Data-free networknone/nonroot/native-sandbox/read-only browser diagnosed reset200→Next dev307 to wrong httpslocalhost53301 authority. Host-header-only experiment also failed. Installed Next source explains fixed listen-address middleware URL. Narrow test-proxy adapter3d7a61a9 normalizes only exact frontendGET/HEAD/login307/308 redirect to isolated origin; status/body/cookies and guards unchanged, counter explicit. Same rendered data-free UI then reached/tr/login, normalized1/unexpected0/proxyErrors0.13/13 adapter/helpertests,41/41 combinedhelpers. Known two syntheticJWT scanner findings remain documented; not real secrets. No production-routing proof or frontend product change. Exact owned diagnostic container removed; no customer records used. All work local; no push/deploy/live access.

Actual clone bf0cb00ff119: all12 functional auth/reset assertions true, including oldsession revocation/replay/oldpassword rejection/newlogin. Final aggregate FAIL at unexpected4 (two GET same-origin other-path RSC categories, two unclassified), proxyErrors0/normalizedDevRedirects1. No pass or durable final-state claim: fixtureverification/postcounts not reached. Frozenbackend3403/b112 and updated browserc43b870b used; newlogfix absent from runtime. Migration/preboot parity/credential-zero and sampled egress gates passed. Cleanup clean; exact owned containers/networks/volumes absent. Stop clone-based guessing; next data-free remaining-request diagnosis, then aggregate/durable acceptance and final patched-artifact build. All release gates remain, NO-GO.

## 2026-09-22 — Real backend/browser integration advanced, full gate still open

Only local test tooling and disposable clone runs. New guarded synthetic reset fixture committed d8ad410c. Reused exact frozen backend3403ae61/imageb1126e5c, normal startup/migration, sanitized September17 snapshot, fresh Redis and random run-local secrets. New internal Docker network has no published ports; browser remains nonroot/native-sandbox/read-only, proxy preserves real Set-Cookie attributes, and sampled internet/DNS/host-canary traffic is denied. No live connection, push, deploy, existing-service restart or original-data mutation.

Three attempts retained distinct outcomes: e81e831ad949 stopped at an IPv4-only canary assertion before browser acceptance; a data-free diagnostic proved both IPv4/IPv6 blocked, and the guard now checks every resolved address. 4f72ed8201c2 failed expired-reset with3 unexpected requests and no passed browser checks. Exact installed Next source justified an exact13-digit static-asset timestamp query allowance; old three requests were not conclusively classified. e87e6bc3ed75 then passed six browser checks (expiry, login, cookies, /me, refresh, CSRF control), reached actual reset200, but failed login redirect with one unknown same-origin RSC path. All owned resources cleaned, latest absence independently rechecked. No full-pass claim.

34/34 targeted helper tests passed before the final diagnostics refinement; no whole-application coverage claim. Named code/security reviews covered isolation and test scope. Gitleaks found two fixed JWT-shaped test constants, independently classified as noncredentials (literal nine-byte signature, no signing secret); no blanket scanner-clean claim. Real synthetic signed tokens remained private in memory/container scope. Existing main.ts CSRF rejection logging includes token values: real local source finding, not evidence of live exploitation. Raw application logs were not retained; narrow product fix remains required. Full details and remaining gates in source-consolidation.

Final diagnostic refinement added only finite path categories and first-failure preservation, no new allowed request. RED10/12→GREEN12/12; parent combined36/36, syntax/diff checks and independent review passed. Probe/tooling committed96262774. Final full run b312d31c0bc4 on image486ed180… repeated the same six successes then unknown same-origin other-path RSC redirect failure; no complete browser pass/final fixture verification. Cleanup clean and exact container/network/volume label inventories empty. Stop full-clone reruns for routing diagnosis; next use a data-free frontend reproduction. Local restore point follows; no publication or production readiness claim.

## 2026-09-22 — Actual isolated browser RED/GREEN; one-page reset feedback fix

Local continuation only. Pinned native Linux/arm64 Playwright1.58.2 image acquired; actual Playwright browser preflight passed as UID1000 with native sandbox, network none, all capabilities dropped, no-new-privileges and read-only root. Reviewed seccomp derivative adds only chroot syscall allowance; this is a disclosed narrow syscall-surface expansion, not privileged/no-sandbox execution. Source/dependencies staged without secrets; online install was manifest-only, scripts disabled; app-source build/runtime offline.

Initial UI5/9 had22 localhost-normalization fixture requests plus5 blocked dev diagnostics. Canonical localhost frontend and exact blocked diagnostic classification corrected the harness, not product routing. Clean RED7/9 then isolated the two genuine reset error-visibility failures (unexpected0). Product commit98c21bed changes only the reset page's unmounted Sonner calls to the mounted Radix API. Same9 assertions GREEN9/9; blockedHMR9/devDiagnostics3, unexpected0. Full frontend tsc --noEmit --incremental false exit0 in the same container; seven harness tests pass. Independent code/security reviews and changed-diff Gitleaks passed. Tooling commit2cc00aab; documentation/checkpoint follows.

Valid-reset proof covers fragment scrub, exact payload/onePOST and redirect, not success-toast visibility. API is synthetic; real backend/cookie/TLS/migratedDB and reset401 acceptance remain open. Node24/nativearm64 dev artifact is not productionamd64 frontend proof. Backend runtime/image unchanged, frontend has one reviewed page fix. All nine owned disposable containers removed; no existing containers/volumes/images removed. Private staging/cache retained. No production, DB/Redis/provider, push/deploy/restart/migration. Next: smallest actual-backend browser acceptance contract using the existing sanitized clone and enforced provider isolation; remaining mail/bytes/forward-recovery/host release gates unchanged, NO-GO.

## 2026-09-22 — Browser harness prepared; native sandbox blocks UI execution

Added only scripts/frontend-auth-browser-probe.cjs and its two passing helper tests. Independent code review tightened exact login payload/error assertions and correctly scoped the reset400 case as validation feedback, not expired-token401. Security review approved fixed loopback origins, fresh contexts, blocked service workers/workers/WebSockets/downloads, aggregate-only output and bounded execution. Browser remains native-sandbox-enabled; no user browser profile was reused.

Fresh trusted Git source84c3bfe7 served three auth routes with HTTP200 in a scratch-only Next sandbox. Google font access stayed blocked and dev fallback fonts were used. TCP canaries allowed owned53301/53302 and denied an actively listening53303 with EPERM. Browser network-only profile initially prevented Unix bind; independently reviewed Unix-bind-only exception did not broaden outbound grants. Browser then launched but failed native child sandbox initialization; all nine scenarios failed at setup, before any page assertion. This is an environment blocker, NOT nine product failures and NOT browser acceptance. No security control was disabled to force a pass.

No product code, DB, migration, image execution, provider, production, push or deploy action. Static Sonner/Radix reset-feedback mismatch remains suspected only. Owned frontend stopped and browser/profile processes checked absent; private scratch retained. Next bounded route is one disposable Linux browser/frontend container with `--network none`, preserving native sandbox and synthetic-only inputs; no compatible browser image is currently installed. Separate pinned acquisition/build and minimal Linux dependency/executable-path adaptation must precede runtime preflight. Details and evidence limitations are in source-consolidation.

## 2026-09-22 — Owner accepted forward recovery; auth acceptance resumed

Owner replied "ok" to the explicit recommendation and extended-maintenance tradeoff. Recorded ADR-022 and aligned AGENTS: no separately hardened older fallback is required for this stabilization release, but restored backups and data-preserving forward recovery still need proof. No deployment, live access, interruption or historical-image execution was authorized.

Read-only acceptance audit found a composition gap: CRM claim/reset service tests and signed-token HTTP guard tests existed separately, but no actual AuthController/AuthService HTTP journey tied password reset to rejection of previously issued access/refresh cookies. Existing7suites/146tests passed freshly with actual RC source and borrowed dependencies/generated client from the existing September17 local environment under Node24.18.0, env-i; no full AppModule, real DB/Redis, browser, CRM/mail provider or image was started.

Added only auth-reset-revocation.http.spec.ts:4/4 composed synthetic HTTP tests pass. Parent independently reran all8authsuites/150tests successfully (8.999s). Positive refresh before reset, Redis marker write failure, exact oldaccess401/oldrefresh403/resetreplay401/oldpassword401, renewed login/refresh and unchanged CUSTOMER grants are checked. An in-memory sessionVersion reversal makes oldaccess work again, proving the negative assertion responds to the intended boundary. CRM member/nonmember/unavailable lookup matrix asserts no session issuance/user mutation. Runtime source unchanged; no production RED claimed because this adds evidence for existing behavior, not a product fix. Test evidence is not browser/realDB/provider/full-main middleware or crypto-performance acceptance. Source-consolidation records limits and next isolated-browser gate.

Independent code/security reviews approved the final test. Reviewer explicitly included the spec and backend sources in a borrowed-resolver TypeScript check:0 diagnostics/noImplicitAny:true. Matching lockfile is not installed-runtime equivalence. Separate local checkpoints preserve test/policy/docs scope; no remote publication.
## 2026-09-22 — Compared actual fallback options; policy proposal only

Source diff18929781..3403ae61 and independent reviews reject prior localb802 fallback: its unchanged strict migration ledger check rejects the later CUSTOMER migration, while direct-node bypass loses ticket-management safeguards against CUSTOMER4 grants. JWT/RAG hardening is unchanged between these two local candidates; do not confuse them with historicald9. No app/image/DB/live action or source edits. LocalNode24.18.0 helper/source contracts14/14 passed after absent configuredNode20path; no full-app/runtime proof claimed.

Recorded practical proposal in source-consolidation: stop legacy archive engineering; choose owner-approved forward recovery with potentially extended maintenance and preserved writes/bytes, or separately scope a hardened older-functionality fallback. No policy adopted automatically, no rollback gate waived, no execution/deploy approval inferred. Required mail/writer quiescence, persistent-byte recovery, remaining release gates and backup/reconciliation boundaries documented. Await the owner's explicit strategy choice before expanding implementation.

## 2026-09-22 — Inert startup metadata and rollback security boundary

Unchanged verifier27/27 tests pass. Independently reviewed config-only age/gzip stream,180s bound/pipefail, completed all modern+aux checks and exited0. Image302229 declares expected wrapper/deploy.sh/workdir and unspecifiedUser; no Healthcheck key, no nonemptyOnBuild, Env present. Only booleans printed. Ciphertext/verifier hashes and0700/0600 permissions unchanged. No layer-file inspection, extraction/load/execution, production/DB/Redis/provider access or product edits.

Read-only historicald9 versus frozen3403ae61 JWT strategy reveals missing legacy DB-backed status/sessionVersion/current-role checks and legacy URL-query token acceptance. This extends rollback acceptance beyond ticket counts to security non-regression; not a fresh live exploit finding or archived compiled-code attestation. No safe rollback startup designated. Source-consolidation records a bounded selected-file inspection contract and separate execution approval gate. General extractor/legacy-ID reconstruction/re-download rejected as unnecessary. Existing release blockers remain; no push/deploy.

Independent source review also confirms historical RAG onModuleInit performs column/index DDL and dataset/settings writes; candidate moves that maintenance behind an explicit operation. Therefore direct Node bypass is not sufficient. Deeper image-file inspection is conditional on a concrete fallback decision, not a reason to build a general parser or rehabilitate known-unsafe startup. Three-document scope review approved; no application changes.

## 2026-09-22 — Scoped modern-image integrity gate closed locally

Added versioned stdin-only Python verifier and synthetic tests; no product code changes. Contract verifies exact config hash, ordered uncompressed layers/diffIDs, Docker/OCI descriptor sizes/digests/order, strict tar/gzip/JSON framing, and bounded V1 auxiliary classification. Legacy IDs are not regenerated: these records are non-authoritative for the pinned manifest-present modern loader. Tags, parent image links, descriptor URLs/unknown fields and unexplained members are rejected. Runtime/legacy-loader safety stays explicitly false.

TDD plus independent review caught/fixed boolean-number projection, exponent overflow and non-UTF8 JSON acceptance. First real stream then exposed two legitimate exporter representations:23 epoch timestamps with local offsets, and13 typed-zero terminal config fields omitted in the core's6-key JSON. Added strict zero-instant and exact13-default tests before fixes; no core values changed/missing. Final27/27 tests,97.53% statement coverage; independent reviewer reports213 additional offset/type assertions.

Actual final stream exited0 at14:58:05UTC;302229b2… image,24 layers,24 auxiliary records,53 regular members accepted under modern-only scope. Ciphertext SHA unchanged; renamed to image.modern-content-verified.tar.gz.age inside existing private0700 directory; new0600 receipt and superseded old receipt retain limits. Original September19 partial and scratch tools preserved. No production connection, DB access, Docker load/run, extraction, restart, deploy or push. Next inert startup/rollback contract; execution remains separately gated. Production NO-GO is unchanged.

## 2026-09-22 — Private live-image copy acquired; full acceptance still gated

Owner resumed the paused exact-image copy. A fresh0700 private directory/key0600, strict SSH, immutable302229b2… image ID, remote3600s bounded save/gzip and local age/pipefail completed exit0 at14:19:02UTC. Ciphertext867,825,356 bytes; SHA256 `fb05985352e1ccf87c36bd0ff933ea3d37067d7d65900ef565c7349725f81517`. Old September19 incomplete copy preserved. Postflight14:21:08UTC: same backend image/start2026-09-02T19:03:59.250425823Z/restart0/running. No deploy/restart, DB/Redis access, extraction/load/execution, configuration change or publication.

Initial strict verifier rejected25 extra blobs after config and24 ordered layer hashes/gzip completion passed. A separately tested/reviewed bounded offline structural diagnostic completed exit0: all content addresses valid; OCI layout/index/single manifest bind the same expected config and24 uncompressed layers. Zero gzip member blobs; remaining24 captured JSON objects have legacy-compatible key counts (24id/23parent/24created+container_config+os; one config+architecture).18/18 combined tests pass; independent code/security reviews approved diagnostics only. Actual legacy-ID relationships/full allowlist acceptance remain unproved. Do not call this safe rollback, clean host or release approval. Artifact retains `.partial.age` plus an explicit acquired-verification-pending receipt; no duplicate acquisition needed. Next bounded local exporter-format acceptance, then separately reviewed startup/rollback path. Detailed evidence in source-consolidation.

## Final owner pause — resume in the morning

Owner subsequently said "ok sabah devam ederiz". This supersedes nighttime timing, not the incomplete-copy status. No automated retry or further live action is scheduled; wait for continuation.

## 2026-09-19 — Approved image acquisition paused at owner request

Preflight reverified exact live302229b2… image2,470,925,994 bytes/amd64, unchanged container, server159GiB free and local1.2TiB available. Existing age1.3.1 + fresh private identity; verified-host SSH streamed immutable docker image save through nice gzip1 and local age encryption, no explicit server archive file, remote900s timeout/pipefail. Copy was slow (about96MB uncompressed/38MB compressed in6min); sampled backend1.45%CPU/396.3MiB, no restart. Owner chose stop/night after the duration tradeoff was explained.

Matched export-client PID675037 exact argv before SIGTERM; compressor675038 was absent afterward; pipeline exited1. Backend same image/start2026-09-02T19:03:59.250425823Z/restart0/running. Partial ciphertext63,061,860 bytes retained mode0600 inside0700 directory, explicit INCOMPLETE receipt. No load/extraction/execution, DB change, deploy, restart or automatic retry. Next nighttime timing/new full stream; partial is not a valid backup and cannot be appended/resumed as-is. Offline parser in sibling scratch passed7tests and independent review after TDD fixes to reject PAX/unbounded extensions and nonzero tar tail; never run against the incomplete image. See source-consolidation.

## 2026-09-19 — Approved live image/startup observation, no mutation

Following explicit owner approval for image identity/startup inspection only, root used existing maintenance SSH identity with BatchMode/IdentitiesOnly/StrictHostKeyChecking and host-key updates disabled. Host vmi3049865; backend-api image302229b2403d… still matches September17 observation. Image amd64/root-default, no revision/RepoDigests; container writable rootfs, nonprivileged, no mounts. Entry point docker-entrypoint.sh and command ./deploy.sh; command independently matched by SHA. All four deploy/recovery-file hashes exactly match historical d9 source, so identified normal-startup recovery/role mutation hazard is now tied to observed container files. Full code/image provenance remains unproven.

Selected metadata observation18:00:46–18:02:05UTC. Start2026-09-02T19:03:59.250425823Z/restart0/running unchanged. No app scripts imported/executed, DB/Redis/customer/env reads, raw logs, restart, migration, backup, image export, push or deploy. SHA utilities and wrapper structure reads only inside container. Local independent reviewer confirmed: risk on ordinary restart is supported; occurrence of conditional data changes or active compromise is not. Next exact-image private acquisition needs separate approval, followed by explicit safe-startup/offline rollback review, not normal legacy boot or silent bypass. Current authority consumed; production NO-GO.

## 2026-09-19 — Staff/admin, customer review and synthetic attachment acceptance

Extended only the local probe with explicit opt-in, exact request statuses, manual same-origin storage redirect handling, multipart bytes, persisted authorization effects and aggregate-only diagnostics. TDD2 new failures/7 prior passes then14/14 combined passes. Independent reviewers confirmed contracts and found two proof gaps before execution: ADMIN needed a real mutation; bulk OPEN after ADMIN OPEN would be a no-op. Added ADMIN NEW→OPEN, bulk OPEN→IN_PROGRESS and exact internal merge-note sender/distribution assertions. No runtime product changes.

Same immutable3403ae61 image passed56/56 in run `customer-d7254ddf9d6f`, with migration/preboot parity and credential-zero checks. Counts180/563/114/1285→182/568/116/1289 reflect synthetic fixtures only; no complete postboot historical-row parity claim. Exact synthetic PNG bytes passed on disk and authenticated HTTP; owner/staff success and cross-customer/anonymous/internal-note denials passed. Four emulated logins12.369/12.320/11.885/11.930s; no native performance claim. All owned resources removed, absence rechecked; private receipts retained. No production access/push/deploy.

Read-only rollback preflight found observed September17 image302229b2… absent locally; prior localb802af… is not a proven live rollback target. Tag-matchingd9 source startup performs schema/ledger and user/role repair, but actual image provenance/entrypoint remain unverified. Next gate is a reviewed, designated immutable rollback artifact/startup path and preserved new writes/bytes; production acquisition requires separate approval. Full details in source-consolidation. Production remains NO-GO.

## 2026-09-19 — Exact customer release image and real HTTP proof

Built frozen3403ae61 Linux/amd64 imageb1126e5cc5c60adff63fb843c40fe89da4450ba40ed8ef75e5c738b42f7239bf; static smoke and separate nonroot permissions passed. A13 runcustomer-20260919-3403ae61 preserved sanitized Sept17 protected data/counts180/563/114/1285, validated CUSTOMER4/schema and second migration no-op. New normal full-app clone/freshRedis customer probe passed22actualHTTP checks with two synthetic customers/tickets/replies and ownership/internal-note/CSRF denials. Preboot credential assertion0 and protected parity; postprobe182/565/114/1287. Owned containers/network/volumes removed and absence verified; original artifacts/references untouched.

First run81e8cd35f934 timed out before any successful HTTP check under5s; cleanup passed. Measured same-image bcrypt12 hash5743ms/compare5677ms on amd64 emulation. Added test-only bounded request timeout with RED3newfail/4existingpass then12/12combinedGREEN; independent review approves. Successful runcdba19db896d used20s, logins12231/12274ms; exact probe source hash recorded separately from runtime image. No password/work-factor/guard/production changes. Scratch runner cleanup issues caught and fixed before execution. Evidence/remaining gates in source-consolidation; no push/deploy/live access. Runtime source remains3403ae61 despite later tool/doc commits; no image rebuild needed for those alone.

## 2026-09-19 — Local CUSTOMER compatibility and management authorization

Implemented canonical CUSTOMER4 and atomic/additive/idempotent migration preserving role metadata/users; A13 compares only those reviewed additions. Closed transition/link ownership gaps and reviewer-discovered bulk bypass before writes while preserving the actual customer own-ticket review/close-button request. Public FAQ requires no customer FAQ grant. Focused7suites/123tests and full backend + changed/new test typecheck0 pass. Real disposable PostgreSQL17 synthetic proof7/7 validates successful preservation/no-op and failure rollback; no copied customer data used. The owned temporary container/tmpfs was removed and absence verified. Source security review approves local scope; production NO-GO.

Test-harness note: JSON HTTP requests initially failed because the borrowed-dependency Jest resolver selected the wrong transitive pnpm package. Fixed scratch resolution to prefer each importer's actual dependency, removed diagnostics and explicit parser workaround; unchanged Nest default parsing passes. No product parser/dependency changes. Details and evidence limits in source-consolidation report. Next exact rebuilt image and sanitized-clone full-app acceptance; no live connection, provider traffic, push or deploy.

## 2026-09-19 — Read-only customer authorization comparison

Compared exact historical d9 tag source, current4626f627 authority change, preserved A13 baseline/postmigration RBAC fingerprints, seed/catalog/checkers and customer routes. Legacy empty-mapping CUSTOMER fallback5 versus candidate0 confirmed by offline pure-function execution. Prior probe was prerequisite-only, not failed login/HTTP proof. ADMIN baseline14 includes wildcard; migrated16/support16 must not be called live counts. Identified canonical CUSTOMER coverage gap and source-level transition/link ownership risks behind ticket:update; no exploit or fix performed. Next narrow compatibility/security tests and reviewed additive grants, not seed/reset or blanket fallback. Full evidence in source-consolidation report; production untouched.

## Sanitized full-app boot passed; customer acceptance blocked — 2026-09-19

Exact accepted18929781 backend image booted normally on NEW sanitized Sept17 clone plus fresh Redis; health HTTP200 with DB/Redis/BullMQ/storage/memory up. Preboot structured credential assertion0 and62protected fingerprints matched. No published ports, host binds or real provider credentials; internal Docker network/restricted DNS. Disposable mutable clone only; cron may change local copied records, so postboot business parity is NOT claimed.

Customer probe stopped before fixtures/HTTP: copied CUSTOMER role has0 permissions (ADMIN16, SUPPORT_AGENT16;23permission definitions). Current RbacGuard requires route permissions and JWT authority comes from DB. This is a release compatibility blocker requiring narrow role-policy review, not proof current live service is broken. No roles/permissions were granted to force a pass. No customer login, ticket, reply or isolation acceptance is claimed.

Probe guard tests4/4 pass, including actual stdin execution rejection. Initial stdin invocation silently did not execute and is explicitly excluded from evidence; corrected entrypoint and safe aggregate failure counters verified actual execution (0HTTP checks, AssertionError at role prerequisite). Independent static review covered code/security and persisted-reply proof. Probe uses manual cookie replay, not browser-cookie proof. Raw backend logs were not exposed. New owned app/Redis/PG containers and network were removed; label inventories empty. Original raw/sanitized artifacts and reference resources preserved. No production access, push or deploy. Next inspect minimal CUSTOMER permissions and current-versus-candidate authorization before any RBAC migration; preserve deny boundaries and avoid broad grants.

## 2026-09-19 — Sanitized snapshot and migration compatibility

Pure SQLplan helper+5tests added (100% measuredhelpercoverage); independent code/security review approves local-tool scope. New networknonePG clone verified62tables617columns/schemahash; negativeinventory test rolledback with fullfingerprints unchanged; valid sanitation unsafe0 and62protected tableparity. Newprivate0600dump/0700root, sourceSept17, notanonymized. Exactimage18929781 unchanged A13 restored sanitizeddump and passed bothmigrationpasses/no-op,180/563/114/1285 retained. Resourcescleaned; references/production unchanged. Noapp/Redis/provider starts here. Next syntheticcustomer API tests on newmutable sanitizedclone, no rolegrant bypass, separateCRM/cookie/attachment/rollback proof. Source-consolidation report contains paths/hashes/limits.

## 2026-09-19 — Synthetic normal startup and clean Redis checkpoint

Exact18929781 image reached /api/v1/health ok through normal entrypoint on newemptyPG17+freshRedis8.8.2; DB/Redis/BullMQ/storage/memory up. No customer data, ports, host mounts or provider keys. Internalnetwork/DNS sampled egress probes blocked; synthetic resources removed/rechecked. Owner accepted freshRedis rather than livequeue copy. Two read-only preflights identified strict bootenv requirements and cron mutation risks in copied data. No runtime source changes. Next new sanitized mutable clone + explicit local cron-delta accounting, then actual customer API/browser/attachment/new-write rollback tests. Production stillNO-GO; no live/push/deploy.

## 2026-09-19 — Real isolated restore/migration acceptance

A13 runrestore-20260919-18929781 exit0 using exact accepted image and verified Sept17 capture. New private input matches original raw/encrypted checksums; source receipts/references unchanged. Snapshot counts180/563/114/1285 preserved; protected fingerprints and reviewed schema/RBAC deltas pass; second migration no-op. Owned PG/network/volume cleaned and absence rechecked. Synthetic bind-permission concern disproved on this Docker Desktop, no code change. Private plaintext input/evidence retained under0700/0600. No app/providers/live/push/deploy. Full app/attachment/new-write rollback and mail/host gates remain open; details in source-consolidation report.

## 2026-09-19 — Corrected amd64 image accepted for static/permission gate

Source18929781 produced immutable imageb802af9e6d9a6819d9721d1705dbe3555d9c20c1ce03a6b22eb61d856060cbd3. Real A13 smoke and defaultUID1000 writable-layer permission/CLI probes passed; private evidence checksum verified.69/69 source/tool contracts. Existing volumes untouched, probes removed. App/DB/provider/production never started/accessed. Next bounded A13 isolated restore prerequisite checks, then full app/Redis/sanitized-data/attachment/new-write rollback proof; mail compatibility/host remain open. No push/deploy. Source-consolidation report holds detail.

## 2026-09-19 — Exact-image permission blocker caught locally

Source904376e4 built amd64 but non-root static smoke failed EACCES due archive extraction under umask077. Corrected only source archive permissions, preserving private roots/evidence. Regression RED/GREEN, combined69/69 contracts, actual Git mode probe and independent code/security review pass. New exact-image build/runtime acceptance pending. No application/DB/provider/live/push/deploy; existing Docker volumes untouched. See source-consolidation report for rejected image ID and limits.

## 2026-09-19 — Minimal non-root image source

Combined non-root + release/restore contract tests68/68 passed, exit0; independent review approved local checkpoint. Whitespace-only fixture change independently confirmed and separated into style commit. Exact image not yet built/run.

Audited actual writes, including startup OpenAPI export and editable MJML screens. Dockerfile now defaults node, preserving root-owned code with narrowly owned uploads/OpenAPI/screens and conditional template bases. Migration/CLI/dependencies unchanged. New source tests RED then5/5GREEN; runtime image proof still open. No live/DB/container mutations. Existing fixture indentation diff preserved outside this batch. Next exact Linux/amd64 image/writable-path rehearsal.

## 2026-09-19 — Stabilization-only release reconciliation

Added opt-in real-client loopback SMTP/IMAP TLS tests plus ephemeral certificate generator;10/10 tests pass and TypeScript0 diagnostics. Trusted success, invalid trust/name/expiry rejection and absence of plaintext AUTH verified using actual provider entrypoints. Temporary test keys cleaned; no production code changes. Local-only Node24/macOS proof; production image/server, delivery and sender-trust gates remain open.

Owner froze new features/customer requests. Independent source audit reconciled stale reports: PG17/fail-closed DR and boot checks exist, but root backend runtime, current amd64 artifact, full application/attachment/new-write rollback acceptance remain open. Fresh56/56 SQL checksum comparison and63/63 A13 fake-Docker contracts pass. Local Docker inventory read only; no running containers, cached old non-root image arm64/no revision. No live access, DB access, deploy, image build, container creation or deletion. Existing source-consolidation report updated rather than creating a duplicate roadmap.

## 2026-09-19 — Strict local SMTP/IMAP transport

Final focused run:4suites/29tests passed; backend plus new tests TypeScript no-emit0 diagnostics, using existing isolated generated client. Code and security reviewers approve local commit. Initial scratch dependency-resolution failures corrected without package/source changes. Full-release build and wire-level acceptance not performed.

Two-file minimal patch requires SMTP TLS/certificate validation and rejects plaintext IMAP before credentials/network, with caught config errors and cron guard release. New mocked tests initially6failed/6passed, then13passed including cron recovery. Actual release source tested offline using existing isolated dependencies; no app lifecycle or real data. Source impact review substituted for unavailable GitNexus/Graphify; final security review has no blockers. Mail TLS report records compatibility and remaining real-handshake gates. No live access, push or deploy.

## 2026-09-19 — Local-only TLS maintenance plan

Rechecked local mail providers and official DMS/Nodemailer documentation. Recorded minimal staged plan in existing mail report, including current client validation bypass, SMTP587 STARTTLS vs direct TLS, coordinated IMAP993 transition, version-pinned server setup, renewal, secure administration, off-host recovery gap, controlled mail-to-ticket acceptance and non-destructive rollback. Historical pending-inspection statements explicitly superseded. No runtime code/config, production access, tests, certificate issuance, restart, push or deployment this turn.

## 2026-09-19 — Authorized on-host mail backup

Effective Postfix/Dovecot TLSoff confirmed viareadonlyqueries. Explicitbackupapproval used for freshroot0700folder,0600archive of maildata/state/config/Compose/env, no secretcontentdisplay. gzip/tarcompare/SHA256pass; extracted persistentfiles match with31socketexceptions; live-to-stage dryruns zerochanges, runtimeidentityunchanged. File-level only, notatomic/fullrestore/offhost/DBbackup. Shellclosed; noTLS/restart/deploy. Evidence/path/limits in existingmailtransport report. Next prepare separatelyapproved TLSmaintenance and offhost/recoveryacceptance.

## 2026-09-19 — Mail DNS and IMAP capability follow-up

Correlated owner's masked live settings screenshot with freshDNS A/MX. Credential-free IMAP143CAPABILITY advertisesPLAIN/LOGIN withoutSTARTTLS; no mailboxaccess. Browser simultaneoususerinteraction respected; no furtherUIactions or livechanges. Existing mailtransport report updated with evidence and explicitunverified certificate/backup gates. Noappcode/test/deploy changes.

## 2026-09-19 — Read-only mail service identification

Owner-provided Coolify service read in existingFirefox session: DockerMailserver latest,Runningunknown,persistentmailvolumes. NoCompose save. Unauthenticated external587 EHLO lacksSTARTTLS and advertisesAUTH;993refuses. Noauth/email/datachange. Actualapp mailtarget unknown; independentsecurityreview keeps strictTLSdeployment blocked pendingtarget/certcompatibility. New mailtransport observation report records limitations and narrow nextread-only gate; no runtime edits or releaseapproval.

## 2026-09-19 — Local canonical-history source checkpoint

Consolidated885candidate source files into separate canonical-history worktree;279canonical-only entries preserved,69changed/addedpaths committed in four scoped batches. Independent code/security reviewers approved mechanical consolidation. Secret/whitespace checks clean. Fresh tests in source-identical isolated candidate: backend149suites/1728pass/1existing skip,frontend47/327pass,bothTypeScriptchecks pass. New worktree itself not installed/booted/built. Initialsymlink-verifier and executable-mode issues corrected without data access. See issues/2026-09-19-source-consolidation.md. No production,DB,provider,push/deploy. Root runtime/mailtrust/TLS/data-rehearsal gates still open.

## 2026-08-08 — Independent help-center i18n verification

- Independently reviewed Claude product commit `313e5b47`; its four-file scope is limited to the three locale catalogs and one real-next-intl render spec.
- Verified all 11 affected admin help components across TR/EN/DE: focused 33/33, full frontend 40/40 files and 299/299 tests, frontend typecheck and i18n integrity all passed.
- Corrected the documentation count: 193 keys, not 188, were added per locale. Every added key is consumed; 218 unique component keys are used in total, of which 25 pre-existed.
- Verified both restore bundles, their tag targets and SHA-256 values. Restarted local development with frontend on 3000 and backend on 4000; local HTTP checks returned frontend auth redirect 307 and backend health 200.
- Product decision: GO for the help-center i18n fix. Authenticated visual refresh remains a user-side acceptance check; no push/deploy/live access occurred.

## 2026-08-08 — Announcement email final local closure

- Closed the remaining announcement email safety/reconciliation blockers in `117526b1` using RED/GREEN TDD.
- Handlebars validation now covers parameterless blocks, `@root/@data`, helper arity and rejects unsupported partial/decorator syntax fail-closed.
- Reconciliation now filters only actionable linked outcomes, maps SENT/DELIVERED/BOUNCED/FAILED completely, drains deterministic 200-row batches, and conditions writes on both AnnouncementLog and EmailLog snapshot state.
- Stabilized broadcast property tests by restricting successful-payload properties to inputs the send-time safety contract accepts; the previously failing seed passed independently.
- Final evidence: focused 108/108, broad announcement/email 159/159, backend 130/130 suites (1305 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n, ops/API/RBAC/migration contracts and diff hygiene passed.
- Independent code and security reviews both returned GO with C/H/M=0. Verified pre/post restore bundle SHA-256 values are recorded in the dedicated GAP report §17 and common report.
- No push/tag-push/deploy, production/shadow access, migration/seed, or live email send occurred. Claude independent review is requested before any release decision.

## 2026-08-08 — Independent announcement Phase 4 verification

- Independently reviewed Claude product commit `edae3067` without changing product code or data.
- Confirmed closures: retry-aware terminal FAILED, customer response allowlist, direct unknown variable/hash/subexpression rejection, malformed Handlebars normalization, diff scope and restore integrity.
- Reproduced two remaining HIGH defects: parameterless unknown block/helper paths bypass the AST allowlist and silently render empty; QUEUED announcement logs ignore EmailLog DELIVERED/BOUNCED when webhook wins the cron race.
- Identified MEDIUM batch-starvation risk: `take:200` scans have no cursor/order/progress or DB-side outcome filter.
- Verification passed: focused backend 95/95, full backend 130/130 suites (1264 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n, 24/24 ops safety, API/RBAC/migration contracts and restore bundle hashes.
- Appended the full NO-GO result to the dedicated GAP report §16 and the common report. No product code, migration, DB, push, deploy or live system was touched.

## 2026-08-08 — Independent announcement email verification

- Independently reviewed `d8f42c6d`, `df724734`, `f4668592`, and `e4c2ddc8` without changing product code.
- Narrow GO: BUG-02 canonical customer-field parity; GAP-08 additive computed `contentFormat` with non-blocking edge caveats.
- NO-GO: incomplete Handlebars AST/fail-closed coverage and inactive runtime announcement Zod contract; retry/webhook-inaccurate AnnouncementLog reconciliation; customer response leakage of internal email-log/error fields.
- Evidence: focused backend 110/110, focused frontend 4/4, full backend 129/129 suites with 1230 passed/1 skipped, full frontend 39/39 files with 266 passed; typecheck/i18n/ops/API/RBAC/migration gates passed; all reported announcement restore hashes and bundles verified.
- Appended full evidence and remediation order to the dedicated GAP report and `codex-claude-ortak-rapor.md`. Personalized/dynamic announcements remain NO-GO; push/deploy/live restrictions unchanged.

## Follow-up - 2026-08-06 Faz 7 Schema Parity

### What changed

- Added the additive, no-DROP `20260806000000_align_schema_parity` migration and aligned `schema.prisma` with production-proven indexes, four unique constraints, the Knowledge Pool parent FK, and physical type/default truth.
- Removed two misleading Prisma B-tree declarations named as HNSW indexes. HNSW lifecycle remains external under `RagMaintenanceService`; 3072-dimensional embeddings use exact search.
- Added blocking schema-parity, migration-safety, and source/target data-fingerprint tooling. The comparator rejects identical databases, opens read-only sessions, and is restricted operationally to local/sanitized clones.
- Technical commit: `612706c1` (`fix(database): align fresh and shadow schema parity`).

### Verification

- Fresh disposable PG17: all 50 migrations applied; second deploy had no pending migrations; integrity and schema-parity gates passed.
- Restored production-shadow clone: only the expected foundation + parity migrations applied; second deploy had no pending migrations.
- Source shadow versus restored clone fingerprints matched across 61 public business tables and sequences both before and after clone migrations.
- Both fresh and clone parity gates retain exactly one documented residual: externally managed partial index `idx_faq_entries_embedding_version_dim`.
- Prisma validate, backend/frontend typecheck, i18n, migration file gate, Node syntax, and `git diff --check` passed.
- Full backend suite: 116/116 suites passed; 1020 tests passed, 1 skipped, 0 failed.
- Final code review, database review, and security review approved the local commit with no P0-P2 blocker.

### Safety correction

- The reusable snapshot previously described as fully sanitized still contains 14 non-empty rows marked `settings.is_secret=true`. Values were not printed or inspected. CRM/webhook secrets, active integration flags, and user refresh-token hashes remain zero.
- The dump and shadow env are mode `600` and git-ignored, but the dump must not be treated as secret-free or shared. Create a new clone-only sanitized snapshot before any application runtime or external handoff.
- No production connection/write/migration, deploy, remote push, or tag push occurred.

## Follow-up - 2026-08-06 Graphify And GitNexus Tooling Audit

- Refreshed the local Graphify 0.9.30 code graph: 835 code files, 7,338 nodes, 14,249 edges, and 614 communities. Graphify retained a dated curated-graph backup and did not emit the smaller-graph overwrite warning.
- Verified the `RagMaintenanceService` maintenance path and identified `PrismaService` as the largest current graph hub (degree 254).
- Graphify reported 52 SQL files without structural nodes because the optional SQL parser is not installed; database migration acceptance must continue to rely on PostgreSQL and migration-integrity/parity gates.
- GitNexus CLI and local index are absent. Historical AGENTS.md index counts are not current verification.
- Did not install GitNexus: official package 1.6.9 uses PolyForm Noncommercial 1.0.0, so commercial-use rights must be confirmed first for this production product.
- Added a user-requested top-of-report coordination note explaining tool roles, coexistence, ignore boundaries, and the license gate. No production state or remote changed.

## Follow-up - 2026-08-05 Production Shadow Database Baseline

### What changed

- Established the production-data safety baseline as a binding workflow:
  - production is read-only,
  - data only flows `prod -> local`,
  - local development must never point `DATABASE_URL` at production IP `167.86.84.107`,
  - production Prisma migration/restore/reset/resolve commands remain forbidden without a separate maintenance decision.
- Took a read-only PostgreSQL custom-format dump from production Coolify database container `lwk8ok04ocg4w4soog0c888g` (`pgvector/pgvector:pg17`), database `aluplan_support`.
- Stored the raw dump outside Git at `.private-data/prod-dumps/aluplan-support-prod-20260805-193338-pg17.dump`.
- Created a separate local shadow Postgres container:
  - `aluplan_shadow_postgres_pg17`
  - `pgvector/pgvector:pg17`
  - `localhost:55432`
  - database `aluplan_support`
  - local env file `.private-data/shadow/shadow-postgres.env`
- Restored the production dump into this separate shadow DB without touching existing local `aluplan_postgres`.
- Sanitized the shadow DB so local work cannot accidentally call production-like integrations:
  - CRM connections inactive,
  - CRM/webhook secrets removed,
  - user refresh-token hashes removed,
  - secret/token/API-key/password settings emptied.
- Created a sanitized reusable local snapshot at `.private-data/prod-dumps/aluplan-support-shadow-sanitized-20260805-194053-pg17.dump`.
- Intentionally did not copy production Redis. Local Redis should remain empty/ephemeral to avoid replaying live BullMQ jobs, sessions, OAuth state, semantic cache, or throttle counters.

### Evidence

- Raw dump:
  - size `132 MB` / `138034033` bytes,
  - SHA-256 `d12371d0b316fdab1e811fa658a0ca890968596c53d02d3b845cc709679d56da`,
  - archive header: `dbname: aluplan_support`, `TOC Entries: 399`, `Format: CUSTOM`.
- Shadow DB restore:
  - public tables: `64`,
  - database size: approximately `233 MB`,
  - counts: `users=1282`, `tickets=162`, `ticket_messages=476`, `knowledge_sources=241`, `knowledge_embeddings=77`, `knowledge_pool_embeddings=7745`, `_prisma_migrations=54`.
- Sanitization verification:
  - `crm_active=0`,
  - `crm_secrets=0`,
  - `webhooks_active=0`,
  - `webhook_secrets=0`,
  - `user_refresh_hashes=0`,
  - `secret_settings_nonempty=0`.
- Sanitized snapshot:
  - SHA-256 `2e5f7e09a7e4ffbf61787f978a4a401527be46eae4895a5d7ba26c39ef5d770b`,
  - `pg_restore --list` produced `399` TOC entries.
- Prisma shadow verification:
  - `DATABASE_URL="$SHADOW_DATABASE_URL" pnpm exec prisma migrate status --config packages/database/prisma.config.js`
  - result: `Database schema is up to date!`

### Notes

- The temporary SSH key `aluplan-codex-dump-20260805` may still be present in `/root/.ssh/authorized_keys` on the VPS. Remove it after no further backup access is needed.
- `.private-data/`, `*.dump`, and `*.backup` are ignored by Git.
- Continue GAP remediation locally against the shadow DB. Do not use the production database for tests or migration inspection.
- Next safe targets: BULGU-02/BULGU-18 auth-token negative tests and BULGU-10 migration-history inspection using the shadow DB.

## Follow-up - 2026-06-30 Ticket Filter Hardening

### What changed

- Replaced the tickets page status dropdown/fake KPI cards with status chips backed by the backend ticket list query.
- Added submit-based ticket search for ticket number, subject, customer, email, and customer company fields.
- Added `includeStatusCounts` support to the tickets API so status counters are computed from the same scoped/search-filtered queue while intentionally ignoring the active status filter.
- Added `DRAFT` as a first-class ticket status in the frontend status model and `tr/en/de` ticket status translations. This closes the live `MISSING_MESSAGE: tickets.status.DRAFT (tr)` failure class observed on production.
- Hardened frontend/backend deployment order: if an older backend omits `statusCounts`, the frontend hides counters instead of rendering misleading zeroes.
- Added an assignee column so "Bana Atananlar" and "Tüm Talepler" scope changes are visible in the table, not only in the request URL.

### Verification

- `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts` passed with 23 tests.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/tickets/TicketsPage.spec.tsx'` passed with 10 tests.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `git diff --check` passed.

### Notes

- Restore point before the implementation: branch `codex/restore-ticket-filters-20260630-085348` at commit `17331a38`.
- Deploy backend first, then frontend, so the live UI receives `statusCounts` immediately.
- Remaining production performance risk should be watched through real API latency/query telemetry after deploy because search uses relation-aware contains filters; the UI only submits search on form submit, so it does not query on every keystroke.

## Follow-up - 2026-05-26 SupportAnswerOrchestrator Customer/Admin Parity

### What changed

- Moved customer-side retrieval-context acceptance into `SupportAnswerOrchestrator.shouldGenerateFromRetrievedContext(...)`.
- `AiQueryService.query()` and `AiQueryService.streamQuery()` now use the orchestrator decision before returning `NO_MATCH`.
- The decision records result count, effective threshold, audience, visual-evidence allowance, and top score for later traceability.
- Customer ticket-opening synthesis now uses the stronger score between initial retrieval diagnostics and post-rerank top result, preventing usable threshold-edge matches from being cut off before ANN-style synthesis.
- Added a regression for the live failure class: a 3B grid/Axis Grid support question with `topScore=0.8034` reaches LLM synthesis instead of returning `NO_MATCH`.
- Added `allplan-help/` to `.gitignore` so the local official help mirror stays out of GitHub until a deliberate import plan exists.

### Verification

- `pnpm --filter @aluplan/backend test -- support-answer-orchestrator.service.spec.ts ai-query.service.spec.ts` passed with 67 tests and 1 skipped.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Notes

- This fixes the architectural half-gap where customer/admin shared answer prompts but not the retrieval acceptance decision.
- `allplan-help/` content was not processed or staged in this pass.

## Follow-up - 2026-05-24 Hotinfo Retrieval Applicability

### What changed

- Hotinfo is now evaluated more deeply for AI/RAG source applicability instead of only being shown in ticket UI.
- Customer AI query and admin Copilot both append safe Hotinfo search signals for license/activation/transfer questions.
- Allplan version and build id from Hotinfo can now steer retrieval away from legacy Softlock sources for modern Allplan installs.
- Legacy unreadable license-file traces are explicitly treated as low-trust telemetry, not as proof that a modern Cloud/Wibu/BIMPLUS license is invalid.
- Raw license numbers, `_SEC.NSE` paths, and raw Hotinfo traces are not leaked into retrieval/search prompts.
- Prompt context now includes structured multi-GPU card details, including secondary GPU VRAM/RAM, driver date/version, and resolution.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts prompt-context-builder.service.pbt.spec.ts hotinfo-parser.service.spec.ts ai-copilot.service.spec.ts` passed with 112 tests and 1 skipped.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Notes

- Modern license questions with Hotinfo showing Allplan 2026 should no longer accept old 2006-2013 Softlock documents as HIGH-confidence primary evidence.
- Explicit legacy contexts such as Allplan 2012 can still use Softlock sources when Hotinfo or the user question actually indicates a legacy version.

## Follow-up - 2026-05-24 LearnNow Course URL Guardrail

### What changed

- Hardened LearnNow enrollment/course handling from warning-only to enforcement.
- `learnnow.allplan.com/course/*` URLs are now rejected when admins try to add them as normal URL sources.
- Generic web crawl discovery now rejects a `/course/` start URL and skips `/course/` child links.
- LearnNow-specific candidate extraction now rejects `/course/*` URLs before article/PDF format checks, including course-layer PDF-looking links.
- Knowledge Pool URL modal now refuses `/course/` URLs before submission and shows a localized error.
- Removed the extra warning card from the crawler screen; the public crawl boundary is now explained in the primary notice.

### Verification

- `pnpm --filter @aluplan/backend test -- generic-web-crawler.service.spec.ts learnnow-crawler.service.spec.ts knowledge-pool-job.spec.ts` passed with 26 tests.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.

### Notes

- Production was previously observed running commit `44d21f86`, while the public-only LearnNow boundary commit was local at `8e5b1168`; deploy must use the latest pushed head for this guardrail to appear live.

## Follow-up - 2026-05-23 Operations Dashboard Phase 5

### What changed

- Completed the final verification pass for the operations dashboard implementation.
- No additional product-code changes were needed after Phase 4.
- Confirmed the dashboard is ready as a coordinated backend + frontend deploy set:
  - backend provides `GET /dashboard/ops`
  - frontend consumes the aggregate endpoint and renders the approved operations control UI
  - mobile layout uses stacked cards, responsive modals, and internal panel scrolling
- Left unrelated local artifacts uncommitted:
  - `.superpowers/`
  - `Aluplan-Support-Intelligence-PRD.docx`

### Verification

- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed with 6 tests.
- `pnpm --filter @aluplan/frontend build` passed.
- `git diff --check` passed.

### Notes

- The focused frontend test still prints the existing framer-motion test mock warning about `whileHover`; it is test setup noise and did not fail validation.
- Local frontend/backend servers were not already running, so this phase used build/type/unit validation rather than an authenticated browser smoke.

### Next

- Deploy backend first, then frontend.
- After deploy, smoke-test `/tr/dashboard` and `/en/dashboard` as admin/staff at desktop and mobile widths.

## Follow-up - 2026-05-23 Operations Dashboard Phase 4

### What changed

- Added controlled live refresh behavior to the admin/staff operations dashboard.
- Dashboard now supports:
  - manual refresh from the header
  - visible refresh/spinner state
  - visible last-updated timestamp
  - 60-second background refresh for staff/admin dashboards
- Customer/viewer dashboard does not start the operations polling loop.
- Added a regression test for manual refresh calling the operations endpoint again.

### Verification

- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed with 6 tests.
- `pnpm --filter @aluplan/frontend build` passed.
- `git diff --check` passed.

### Notes

- Local frontend/backend servers were not already running in this workspace, so Phase 4 used build/type/unit validation instead of a live authenticated browser smoke. Final phase should include browser smoke if local auth/backend can be started safely.

### Next

- Phase 5 should run final audit, broader verification, commit any remaining docs, and produce the deployment-ready report without pushing.

## Follow-up - 2026-05-23 Operations Dashboard Phase 3

### What changed

- Operations pulse cards are now actionable instead of decorative.
- Clicking Ticket, AI, CRM, or Knowledge pulse opens a responsive detail modal.
- Each modal is fed from the same `GET /dashboard/ops` payload and shows:
  - localized metric strips
  - a larger trend chart
  - linked recent records when available
  - action buttons to the relevant operational area
- Empty modal record lists render an explicit empty state rather than placeholder data.
- Added regression coverage for opening a pulse modal and seeing real ticket data inside it.

### Verification

- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed with 5 tests.
- `git diff --check` passed.

### Notes

- The modal uses responsive `calc(100vw - ...)` widths and max-height internal scrolling so it remains usable on mobile and narrow laptop windows.

### Next

- Phase 4 should add controlled live refresh/manual refresh behavior and then run browser smoke checks at desktop and mobile widths.

## Follow-up - 2026-05-23 Operations Dashboard Phase 2

### What changed

- Replaced the admin/staff dashboard surface with the operations control shell from the approved mockup.
- The new dashboard consumes `GET /dashboard/ops` through `api.dashboard.ops(7)`.
- Customer/viewer dashboard behavior remains separate and still avoids admin-only observability calls.
- Added:
  - header actions for live AI cost and system health drawers
  - operations KPI cards
  - operations pulse preview cards
  - active support desk list
  - action queue list
  - live mini feed
  - tabbed operations workspace for overview, CRM, Knowledge Pool, LearnNow, and AI Health
- Added complete `dashboard.ops` translations for Turkish, English, and German.
- Added a frontend MSW fixture for the new operations endpoint and updated the dashboard unit test to assert the new data flow.
- Mobile behavior is explicitly covered in the component structure: KPI/pulse cards stack, the ops column drops below content on narrow screens, and long lists scroll inside their panels.

### Verification

- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `git diff --check` passed.

### Notes

- The focused dashboard test still prints the existing framer-motion test-mock warning about `whileHover`; this is test setup noise, not a product-code warning.

### Next

- Phase 3 should make the operations pulse cards open real-data modals with larger charts, filters, and action links.
- Phase 4 should add refresh/live-update behavior and browser smoke checks across desktop and mobile widths.

## Follow-up - 2026-05-23 Operations Dashboard Phase 1

### What changed

- Added a dedicated backend operations dashboard module and `GET /dashboard/ops` endpoint.
- The endpoint aggregates real operational data for:
  - active tickets, unassigned tickets, SLA breaches, resolved-today count
  - ticket trend series
  - action queue counts
  - AI quality metrics and trend series
  - admin/superuser-only AI estimated cost telemetry
  - CRM update/failure summaries
  - Knowledge Pool, dataset, generic crawler, and LearnNow candidate summaries
  - BullMQ queue counts for knowledge sync, CRM sync, and AI query processing
  - system health and recent live feed events
- Empty chart data is returned as deterministic zero-value series so the frontend can show honest empty states instead of decorative/fake charts.

### Verification

- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Next

- Phase 2 should replace the current admin dashboard UI with the mockup shell using this single aggregate endpoint, while preserving the simpler customer dashboard.

## Follow-up - 2026-05-23 LearnNow Review Decisions Phase 5

### What changed

- Learn Now candidate enrichment now uses a single review-decision helper instead of one-off `explaining_video` checks.
- Media-like formats now require transcripts consistently across stale/internal and live/public names:
  - `explaining_video`
  - `explainer_video`
  - `recorded_online_session`
  - `recording`
- Recorded session candidates without transcript text are staged as review-only with `reasonCode=TRANSCRIPT_REQUIRED`.
- Technical Manual/PDF candidates are marked importable but carry `reasonCode=PDF_VALIDATED_ON_IMPORT`, because the actual PDF bytes are still validated during import.
- Candidate review metadata now includes reason codes such as `MEDIA_TRANSCRIPT_READY`, `CONTENT_TOO_SHORT`, and `NEEDS_CONTENT_REVIEW`.
- Knowledge Pool candidate UI now shows localized reason badges in `tr`, `en`, and `de`.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts crawl.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `pnpm --filter @aluplan/frontend build` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed after the frontend build completed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `git diff --check` passed.
- Live read-only LearnNow smoke with a real `TotaraSession` returned candidates for:
  - `knowledge_article` sample ids: `9461`, `9460`, `9459`.
  - `pdf` / Technical Manuals sample ids: `2826`, `2828`, `2829`.
  - `explainer_video` sample ids: `2740`, `2743`, `2741`.
  - `recording` sample ids: `2950`, `2959`, `7230`.

### Notes

- Running frontend build and frontend typecheck in parallel can race over `.next/types`; the typecheck failure from that race was not a product-code failure and passed when rerun after build.
- No production DB writes were performed; the live smoke only fetched public LearnNow pages.

### Next

- Run a small end-to-end pilot on one Knowledge Article, one transcript-backed video, one Technical Manual/PDF, and one Recorded Session before pushing/deploying the LearnNow batch.

## Follow-up - 2026-05-23 LearnNow Public Format Filters Phase 4

### What changed

- Learn Now discovery now uses the real public Totara format filter values observed from the live LearnNow UI.
- `Technical Manuals` discovery maps to the public `pdf` filter and stages resulting candidates as `PDF`.
- `Explaining video` discovery maps to `explainer_video`.
- `Recorded online session` discovery maps to `recording`.
- Added regression coverage so future crawler changes do not silently revert to stale internal labels such as `technical_manual`, `explaining_video`, or `recorded_online_session`.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts crawl.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `git diff --check` passed.

### Notes

- No production DB writes were performed.
- `npx gitnexus impact` / `detect_changes` were attempted, but the GitNexus CLI failed before analysis with its known local package/index error; this did not change source files.

### Next

- Next LearnNow phase should add recorded-session/manual-specific import review rules and then run one end-to-end pilot import smoke before pushing the full LearnNow batch.

## Follow-up - 2026-05-23 LearnNow Candidate Quality Phase 3

### What changed

- Learn Now discovery now enriches saved howto candidates before they enter the review queue.
- Candidate metadata now records review quality signals: source type, content length, image count, transcript status/language/length, and ready-for-import flag.
- Existing candidates discovered again receive refreshed title/content hash/metadata instead of staying stale.
- Crawler candidate API now exposes `contentHash`.
- Knowledge Pool crawler UI now shows compact quality badges for content length, images, transcript status, and ready/review state in all supported UI languages.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts knowledge-pool.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/backend build` passed.
- `pnpm --filter @aluplan/frontend build` passed.
- `git diff --check` passed.

### Next

- Phase 4 should add Technical Manual / Recorded Online Session extraction rules and keep low-confidence media candidates review-only.
- After all LearnNow phases, run a small end-to-end production-like import smoke with one article and one transcript-backed video before pushing/deploying.

## Follow-up - 2026-05-23 LearnNow Video Transcript Phase 2

### What changed

- Learn Now howto video resources now extract `vimeo_url` from the Totara API or Vimeo iframe references from the detail HTML.
- When a Vimeo ID is available, the crawler reads the public Vimeo player config and imports the default subtitle/caption VTT as clean transcript text.
- Explaining video content now includes a `Video Transcript (...)` section when captions are available, so video sources can participate in RAG with real spoken content instead of metadata-only shell text.
- Learn Now metadata now records Vimeo ID, Vimeo title, transcript status, transcript language, transcript label, and transcript length.
- `hasVideoUrl` now treats a Vimeo ID as a valid video URL signal.

### Verification

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts learnnow-crawler.service.spec.ts knowledge-pool.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `git diff --check` passed.
- Live read-only smoke for LearnNow video `id=2740` returned `provider=learnnow-api`, `vimeoVideoId=880602266`, `transcriptStatus=AVAILABLE`, `transcriptLanguage=de`, and transcript text in the crawl content; no DB writes were performed.

### Next

- Phase 3 should add Sync Center/admin quality signals for candidate readiness: source type, image count, transcript availability, content length, language, and review-only warnings.
- Phase 4 should cover Technical Manuals / Recorded Online Sessions with the same evidence-first import behavior.

## Follow-up - 2026-05-23 LearnNow Detail Extraction Phase 1

### What changed

- Learn Now howto detail URLs now use the public Totara `engage_howto_get_howto` API before generic Crawl4AI/basic crawling.
- The crawler first establishes a public `/int` session, extracts the Totara sesskey from the detail page, then fetches the real howto JSON.
- Knowledge Article imports now receive the actual Salesforce article body instead of the Totara shell text.
- `salesforce_content` images such as `pluginfile.php/.../engage_howto/salesforce_content/...` are extracted as URL images so existing visual enrichment can summarize them during knowledge sync.
- Learn Now metadata now records resource id, howto type, language, country settings, versions, categories, Salesforce number, and image count.
- Explaining video resources currently import metadata/description only when no transcript or video URL is exposed by the public API; transcript extraction remains the next phase.

### Verification

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts learnnow-crawler.service.spec.ts knowledge-pool.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- Live read-only smoke for LearnNow article `id=9093` returned `provider=learnnow-api`, `contentLength=2632`, `imageCount=1`, and both `Question:`/`Answer:` markers.
- Live read-only smoke for LearnNow video `id=2740` returned `provider=learnnow-api`, `type=explainer_video`, German metadata, and description-only content; no DB writes were performed.

### Next

- Phase 2 should add explicit video transcript/Vimeo extraction and mark transcript-missing video candidates as review-only/metadata-only before broad imports.
- Phase 3 should expose LearnNow Sync Center quality signals: content length, image count, transcript availability, language, source type, and import readiness.

## Follow-up - 2026-05-23 Customer Synthesis Wait UX

### What changed

- Added a desktop-only semantic data-rain layer to the customer ticket creation page background while the AI synthesis wait panel is active.
- The animation uses sanitized question/context tokens plus safe system concepts; emails, long numbers, phone-like values, license-like numbers, and raw attachment names are not rendered.
- Mobile does not render the effect.
- The synthesis panel now stays visible until the AI request resolves and then fades out smoothly instead of disappearing abruptly.

### Verification

- Frontend typecheck: passed.
- i18n integrity check: passed.
- `git diff --check`: passed.

## Follow-up - 2026-05-23 URL-only AI Input Guard

### What changed

- Added a backend AI input guard for URL-only/navigation-only ticket-opening text.
- Inputs such as `https://allplan.net.tr/en/tickets/new` no longer enter RAG retrieval, HyDE generation, semantic cache lookup, or LLM answer generation.
- The customer receives a localized clarification asking for the actual Allplan issue, while ticket creation remains available.
- Real support questions that include a URL as extra context still continue through the normal RAG path.

### Verification

- Backend focused Jest: `ai-query.service.spec.ts` passed.
- Backend typecheck: passed.

## Follow-up - 2026-05-23 Live Bug Closure Pass

### What changed

- Protected static backend routes from dynamic route shadowing:
  - `GET /teams/skills`
  - `GET /teams/agents/:id`
  - `PATCH /teams/agents/me/status`
  - `PATCH /teams/agents/me/profile`
  - `GET /tickets/by-number/:number`
  - `PATCH /tickets/bulk`
- Added route-order regression tests so these routes cannot silently regress behind `:id` handlers.
- Normalized email creation and lookup paths for auth, user creation, customer registration/import, and CRM contact sync.
- Extended customer search to include linked CRM account name/account number and removed the frontend's duplicate global customer filter that could hide valid backend matches.
- Hardened deterministic AI fallback so BIMPLUS/Share storage questions require direct BIMPLUS/Share storage evidence; unrelated license/home-office snippets now produce the safe no-match response.
- Restored dashboard SLA priority distribution by returning `byPriority` buckets from `/tickets/sla/stats`.

### Verification

- Backend focused Jest:
  - `controller-route-order.spec.ts`
  - `tickets.controller.spec.ts`
  - `tickets.service.spec.ts`
  - `users.service.spec.ts`
  - `auth.service.spec.ts`
  - `customers.service.spec.ts`
  - `crm-record-sync.service.spec.ts`
  - `ai-query.service.spec.ts`
  - `ai-copilot.service.spec.ts`
  - Result: 10 suites passed, 144 tests passed, 1 skipped.
- Backend typecheck: passed.
- Frontend typecheck: passed.

### Notes

- No production DB mutation was performed in this pass.
- Existing live mixed-case duplicate email rows, if any, still need a separate dry-run cleanup/migration decision.

## Goal

Stabilize the backend startup path, harden a few real code risks, reduce repo-root noise, and clean up frontend AI settings debt without trusting stale root markdown reports.

## What Was Done

### Faz 0 - Checkpoint

- Commit: `137309c chore: checkpoint pending product code changes`
- Preserved existing uncommitted product work before starting focused cleanup.

### Faz 1 - Backend startup blocker

- Root cause reproduced: `nest build` failed with `EMFILE: too many open files, watch`
- Fix: disabled asset watchers in `apps/backend/nest-cli.json`
- Commit: `10a5d1e fix(backend): disable asset watchers during build`
- Verification:
  - Backend build: passed
  - Backend startup: passed
  - App booted successfully on `http://localhost:4000/api/v1`

### Faz 2 - Security / ops hardening

- Locked down `POST /products/internal/restore-faqs` behind `JwtAuthGuard + RbacGuard + Roles('admin')`
- Tightened WebSocket CORS origin handling to configured origins only
- Reduced handshake diagnostics so token prefixes are no longer logged
- Commit: `6aebabe fix(backend): harden restore endpoint and ws origins`

### Faz 3 - Repo hygiene / archival cleanup

- Moved misleading root-level legacy reports and artifacts into:
  - `archive/legacy-root-docs/2026-05-13/`
  - `archive/legacy-artifacts/2026-05-13/`
- Added a short archive README to mark them as historical only
- Ignored local worktree / graphify scratch artifacts in `.gitignore`
- Commit: `6e3f81f chore(repo): archive legacy root reports`

### Faz 4 - Frontend stabilization

- Fixed `useAiHealthSocket()` listener duplication on reconnect by binding handlers once per hook lifecycle
- Replaced hardcoded AI settings strings with `next-intl` keys
- Added new translation keys to `tr.json`, `en.json`, and `de.json`
- Commit: `0f44840 fix(frontend): stabilize ai settings socket and i18n`

### Faz 5 - Verification / test reliability

- Backend typecheck: passed
- Backend build: passed
- Frontend typecheck: passed
- Targeted backend Jest run passed:
  - `src/notifications/notifications.gateway.spec.ts`
- Important note:
  - Earlier “SWC native binding” suspicion was not reproduced in the current shell path
  - The bigger issue here was flaky command streaming in this environment; `spawnSync` produced reliable verification output

## Current Clean State

- New commits in order:
  1. `10a5d1e fix(backend): disable asset watchers during build`
  2. `6aebabe fix(backend): harden restore endpoint and ws origins`
  3. `6e3f81f chore(repo): archive legacy root reports`
  4. `0f44840 fix(frontend): stabilize ai settings socket and i18n`

## Remaining Local Noise Not Touched

- Modified:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `graphify-out/GRAPH_REPORT.md`
- Untracked:
  - `.agents/skills/`
  - `.github/agents/`
  - `.kiro/specs/ai-pipeline-data-cleanup/`
  - `.kiro/specs/crm-realtime-sync/`
  - `.kiro/specs/rich-text-editor/`
  - `.kiro/specs/ui-contrast-accessibility/`

These were left alone deliberately because they look like user/workflow artifacts rather than product-code fixes.

## Blockers / Follow-up

- `graphify` CLI was not available in PATH during this session, so the requested post-phase graph refresh could not be executed here
- If phase-by-phase graph updates are mandatory, install or expose `graphify` in PATH and run:
  - `graphify update .`
- Good next targets:
  1. broader backend Jest sweep
  2. frontend AI settings interaction smoke test
  3. remaining direct `process.env` cleanup in backend

## Follow-up - 2026-05-13 Ticket Diagnosis Stabilization

### What changed

- Frontend ticket creation is now explicitly **AI-optional**:
  - users can continue directly to ticket creation without waiting for diagnosis
  - `my-tickets` now shows a retryable degraded state when backend fetch fails
  - API network failures are classified as `BACKEND_UNAVAILABLE` instead of leaking raw `Failed to fetch`
- Backend diagnosis now surfaces whether the answer came from:
  - `LLM`
  - `FALLBACK` (top grounded content used after bounded generation timeout / empty response)

### Commits

- `91777bb fix(frontend): make ai diagnosis optional for ticket creation`
- `8e61383 fix(ai): surface bounded diagnosis fallback mode`

### Verification

- Frontend:
  - `./node_modules/.bin/tsc --noEmit -p tsconfig.json` passed in `apps/frontend`
  - `./node_modules/.bin/vitest run src/lib/api.spec.ts` passed
- Backend:
  - `pnpm --filter @aluplan/backend typecheck` passed
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts` passed

### Important notes

- `graphify update .` was attempted after each phase but the `graphify` binary is still unavailable in PATH in this shell.
- `gitnexus detect_changes` reports HIGH risk because the repository already contains unrelated modified files from prior RAG/indexing work; phase commits were staged narrowly to avoid pulling unrelated changes into the new commits.

## Follow-up - 2026-05-13 Sync Diagnosis Spinner

### Root cause

- A customer `POST /api/v1/ai/query?wait=true` reached backend and retrieval finished quickly.
- The request then hung in LLM re-ranking because Gemini free-tier returned `429 RESOURCE_EXHAUSTED` for `gemini-2.5-flash`, including retry delays up to ~59s.
- The existing 25s diagnosis fallback guarded the final answer generation, but not the earlier LLM re-ranking step.

### Fix applied

- Propagated the resolved `wait` flag from `AiQueryService.query()` into `queryInternal()`.
- For synchronous `wait=true` diagnosis calls, skipped LLM re-ranking and kept deterministic retrieval + heuristic re-ranking.
- Added a regression test proving synchronous wait queries do not call `ai.generate()` for re-ranking.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts` passed
- `pnpm --filter @aluplan/backend typecheck` passed
- `pnpm --filter @aluplan/backend build` passed
- Backend restarted successfully on `http://localhost:4000/api/v1`

## Memory System Note - 2026-05-13

The `.ai` folder now acts as the project memory system:

- `.ai/bootstrap.txt`: startup protocol and truth hierarchy for agents.
- `.ai/current-focus.md`: active work, known risks, and next recommended step.
- `.ai/session-summary.md`: chronological session history, commits, verification, and follow-up notes.
- `.ai/architecture-decisions.md`: durable architecture decisions in short ADR form.
- `.ai/summaries/condensed.md`: five-minute handoff summary for new agents.
- `.ai/retrieval.yaml`: retrieval priority and memory source policy.

Maintenance rule:

- Update `session-summary.md` after meaningful implementation or debugging work.
- Update `current-focus.md` when the next active objective changes.
- Add or revise an ADR when a technical direction should persist across sessions.
- Refresh `summaries/condensed.md` after major phase changes or stabilization milestones.

## Follow-up - 2026-05-21 Admin Copilot Drift Hardening

### Root cause

- Customer ticket opening and admin ANN/Copilot draft generation were still separate runtime passes.
- A ticket could have a strong customer-facing AI answer linked through `AiInteraction`, while the later admin draft model call independently returned a no-knowledge answer.
- This caused customer and admin surfaces to disagree even when the original ticket-opening answer was usable and grounded.

### Fix applied

- `AiCopilotService` now extracts the linked ticket-opening AI answer when it is usable.
- The linked answer is injected into the admin prompt as `[LINKED_CUSTOMER_AI_ANSWER]` and treated as the primary grounding signal.
- If the admin model returns no-knowledge while a linked answer exists, Copilot reuses the linked answer instead of contradicting it.
- Added a structured fallback for manual license server discovery / manual server add questions.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-copilot.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `git diff --check` passed.
- Prefer code, tests, Git history, GitNexus, Graphify, and `.ai` memory over stale root-level Markdown.

## Follow-up - 2026-05-13 Regression Guard Stabilization

### Root cause

- Backend regression guard failed because `AuthController` now depends on `ConfigService`, while `auth.controller.spec.ts` still only provided `AuthService`.
- Frontend targeted test command was initially invoked through the package script with an extra `--`, causing Vitest to run a wider suite than intended.
- The wider frontend run exposed two independent test harness issues:
  - `DocBreadcrumb.spec.tsx` expected the Turkish label `Yardım`, but its `next-intl` mock returned raw translation keys.
  - `customer-properties.pbt.spec.ts` expected null customer sort values to stay last, but the local test helper normalized null to an empty string that sorted first.

### Fix applied

- Added a `ConfigService` mock to `auth.controller.spec.ts`.
- Updated the `DocBreadcrumb` test translation mock to return `Yardım` for `help.nav.back`.
- Updated the local customer sort test helper so empty/null values sort last in both directions.

## Follow-up - 2026-05-19 Hotinfo GPU and Download Revision

### What changed

- Hotinfo parsing now preserves up to two graphics adapters as structured `graphicsCards` entries.
- Each GPU card carries name, VRAM, RAM, resolution, driver date, driver version, and OpenGL when present.
- The admin ticket Hotinfo modal now shows GPU 1 and GPU 2 as separate readable cards.
- The Hotinfo modal header spacing and small telemetry values were adjusted for better readability.
- Support/admin users can download the customer's raw `.hxl` Hotinfo file directly from the ticket Hotinfo modal.

### Verification

- `pnpm --filter @aluplan/backend test -- hotinfo-parser.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

## Follow-up - 2026-05-19 CRM Account and Contact Detail Fields

### What changed

- Added persistent CRM account fields for Service Address, Phone, Fax, Client ID: Frilo, License Manager Name, and raw CRM payload snapshots.
- Added persistent CRM contact/customer fields for Fax, Mobile Phone, Address, Primary Time Zone, Preferred Contact Method, and raw CRM payload snapshots.
- Dynamics account/contact sync now writes those fields when they are present in the CRM response or mapped through the CRM field mapping UI.
- Account detail page now shows the requested CRM account fields instead of only website/industry/address.
- Customer profile page now includes a CRM Contact Details card in the same readable format.

### Verification

- `pnpm --filter @aluplan/backend test -- crm-record-sync.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma` passed.

## Follow-up - 2026-05-19 Inbound Bounce Email Filtering

### Root cause

- Mail delivery failure notifications from `MAILER-DAEMON` / Postfix were being treated as normal inbound customer emails.
- That allowed delivery status notifications such as `Reporting-MTA`, `Final-Recipient`, `Action: failed`, and `nullMX` bounces to create support tickets.
- The visible `[E-POSTA GİZLENDİ: ...]` text is PII masking in stored/displayed message content; it is separate from the actual email sending address path.

### Fix applied

- Added shared delivery-status-notification detection for IMAP inbound and omni-channel webhook inbound flows.
- Delivery failure/bounce mails are now marked processed in `inbound_email_logs` with `Ignored delivery status notification` and do not create users, ticket messages, or tickets.

### Verification

- `pnpm --filter @aluplan/backend test -- email-inbound.service.spec.ts omni-channel.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

## Follow-up - 2026-05-19 Email Deliverability Guardrails

### Findings

- Live DNS has MX `mail.allplan.net.tr` and SPF `v=spf1 mx ip4:167.86.84.107 ~all`.
- DMARC exists as `v=DMARC1; p=none; rua=mailto:destek@allplan.net.tr; adkim=s; aspf=s`.
- Reverse DNS for `167.86.84.107` resolves to `vmi3049865.contaboserver.net`, not `mail.allplan.net.tr`.
- No public DKIM record was found for the common selectors checked, while docker-mailserver has DKIM milter configuration internally.

## Follow-up - 2026-05-21 Admin Routing Configuration

### What changed

- Added a backend `PATCH /teams/:id` endpoint for team routing settings.
- `TeamsService` now returns team member status in team/detail department views so the UI can identify active assignable agents.
- Team detail now lets admins save `autoAssignmentEnabled` and `assignmentStrategy` instead of showing a passive Configure button.
- Department detail team cards now show assignable agent counts and names, making routing gaps visible before ticket assignment fails.
- Added `teams.routing.*` translation keys for TR/EN/DE.

### Verification

- `pnpm --filter @aluplan/backend test -- teams.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Deployment note

- Not deployed and not pushed in this phase. User requested holding deploy/push until the broader phase batch is ready.

### Fix applied

- Production email enqueue now skips reserved/test recipients such as `admin@example.com`, `example.org`, `.test`, `.invalid`, and `localhost` before they reach the queue.
- Skipped invalid recipients are logged with `SKIPPED_INVALID_RECIPIENT`.
- Email DNS validation now treats Null MX (`.`) as invalid, matching domains such as `example.com` that explicitly do not accept mail.

### Verification

- `pnpm --filter @aluplan/backend test -- email.service.spec.ts email-validator.service.spec.ts email-inbound.service.spec.ts omni-channel.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

## Follow-up - 2026-05-19 CRM Full Sync Unification and Hotinfo GPU Memory

### Root cause

- Dynamics full sync still used the adapter's legacy direct DB persistence path, while delta/webhook sync used `CrmRecordSyncService`.
- That split caused full sync records to miss newer CRM detail fields, raw payload snapshots, placeholder-email repair behavior, and consistent account/contact linking.
- Hotinfo sometimes reports one `video` memory block for a multi-GPU machine, while additional GPU nodes only carry card name and driver metadata.

### Fix applied

- Added raw Dynamics full-fetch methods for accounts and contacts.
- Updated `CrmService.executeSyncProcess()` to route Dynamics full imports through `CrmRecordSyncService` when raw fetch is available.
- Added lowercase/normalized CRM mapping-key support, so saved mapping keys such as `accountnumber` can still populate the canonical `accountNumber` field.
- Updated Hotinfo GPU parsing so shared display memory and resolution are carried to additional GPU cards when per-card memory is absent.

### Verification

- `pnpm --filter @aluplan/backend test -- hotinfo-parser.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend test -- crm.service.spec.ts crm-record-sync.service.spec.ts dynamics365.adapter.spec.ts` passed.
- `pnpm --filter @aluplan/backend test -- crm.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- Real `/Users/hazarekiz/Downloads/_hotinf_.hxl` smoke showed both AMD and NVIDIA GPU cards with memory, resolution, driver date, and driver version.

### Verification

- Backend must-pass regression set passed:
  - `pnpm --filter @aluplan/backend test -- auth.controller.spec.ts tickets.controller.spec.ts notifications.gateway.spec.ts ai-query.service.spec.ts`
  - Result: 5 suites passed, 48 tests passed, 1 skipped.
- Frontend must-pass regression set passed:
  - `pnpm --filter @aluplan/frontend exec vitest run src/lib/api.spec.ts src/lib/permissions.spec.ts src/components/help/DocBreadcrumb.spec.tsx 'src/app/[locale]/(dashboard)/customers/customer-properties.pbt.spec.ts'`
  - Result: 4 files passed, 58 tests passed.

### Note

- Use `pnpm --filter @aluplan/frontend exec vitest run <files...>` for targeted frontend checks. Avoid adding an extra `--` after `test:unit` because it can widen the run unexpectedly.

## Follow-up - 2026-05-13 Grounded Fallback + Hotinfo Signals

### Root cause

- Skipping sync LLM re-ranking fixed the quota stall, but fallback mode could still surface the wrong top document, e.g. an "Allplan running slow" FAQ for a Turkish graphics-card-driver update question.
- Turkish UI/questions could receive raw English source text because fallback used source content directly when Gemini was quota-limited.
- Hotinfo was available but not injected for Turkish phrases like "grafik kartı" and "sürüm güncelleme" because the hardware-query regex missed these variants.

### Fix applied

- Added query-aware local reranking for sync diagnosis fallback, with stronger signal coverage for graphics card, driver, update, IFC, license, and performance intents.
- Added deterministic fallback summaries:
  - Turkish locale now returns a Turkish safe summary plus the original source passage as a source excerpt.
  - Sync diagnosis generation timeout reduced to 6s so Gemini free-tier quota stalls degrade faster.
- Replaced duplicated hardware regex checks with normalized hardware/system-query detection that includes Turkish variants such as `grafik kartı`, `ekran kartı`, `sürüm`, and `güncelleme`.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts` passed
- `pnpm --filter @aluplan/backend typecheck` passed
- `pnpm --filter @aluplan/backend build` passed
- Backend restarted successfully on `http://localhost:4000/api/v1`

## Follow-up - 2026-05-13 DevOps Standardization Checkpoints

### Goal

- Preserve the currently working RAG/ticket system while moving the project toward cleaner DevOps practice.
- Keep Qdrant out of scope; current direction remains pgvector + Gemini/LLMAPI.
- Split changes into small, reversible commits rather than mixing docs, product code, tests, and generated graph output.

### Completed checkpoints

- `54aaefe docs(memory): establish project memory system`
  - `.ai` now acts as project memory: bootstrap, current focus, ADRs, condensed handoff, retrieval policy, and session summary.
- `21b8956 test(regression): stabilize guard tests`
  - Stabilized backend auth/controller guard test setup and targeted frontend regression tests.
- `0f966a4 fix(ai): align embedding versioning and ingestion safeguards`
  - Removed stale `model_name` assumptions from embedding writes.
  - Added `ai_response_cache.embedding_dim` schema/migration alignment.
  - Moved observability distribution to `embedding_version + embedding_dim`.
  - Added Gemini 3072-dim registry/default handling and pgvector HNSW limit safeguards.
  - Added/updated targeted tests for embedding registry, Gemini defaults, RAG maintenance, PDF parsing, and ingestion safeguards.
- `b4d7d65 ci(config): enforce provider and migration validation`
  - Unified `validateEnv()` onto the shared Zod env schema.
  - Added Gemini/LLMAPI, low-rate ingestion, RAG thresholds, and observability env validation.
  - Added production `ALLOWED_ORIGINS` safety checks.
  - Replaced Prisma 7-incompatible CI migration diff with a blocking shadow-DB migration drift gate.
  - Added `LlmApiService` regression coverage for Gemini-compatible OpenAI endpoint defaults.
- `7485e6a chore(ops): harden rag sync observability`
  - Removed an Antigravity scratch-file debug write from knowledge pool sync.
  - Replaced a sync controller `console.log` with Nest logger debug.
  - Added RAG source health metrics: total, parsed, and failed knowledge sources.
  - Repaired `ai.controller.spec.ts` provider mocks exposed during targeted tests.

### Verification already run

- Backend RAG tests:
  - `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts embedding-version.registry.spec.ts rag-maintenance.service.spec.ts gemini.service.spec.ts ai-query.service.spec.ts`
- Backend config tests:
  - `pnpm --filter @aluplan/backend test -- env-validation.spec.ts llm-api.service.spec.ts`
- Backend ops tests:
  - `pnpm --filter @aluplan/backend test -- knowledge-pool-job.spec.ts ai.controller.spec.ts`
- Backend typecheck:
  - `pnpm --filter @aluplan/backend typecheck`
- Frontend typecheck:
  - `pnpm --filter @aluplan/frontend typecheck`
- Prisma validate:
  - `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`

### Current working tree after these commits

- Still intentionally uncommitted / pending cleanup:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `apps/backend/openapi.json`
  - `graphify-out/GRAPH_REPORT.md`
  - `.agents/skills/`
  - `.github/agents/`
  - `.kiro/specs/*`
- Do not mix these with product commits. Next phase should be AGENTS/tooling/docs cleanup.

### Tooling note

- Graphify hook ran after each commit, but warned that the rebuilt graph has ~5572 nodes while existing `graph.json` has 11474 nodes, so it refused to overwrite the existing graph JSON. `GRAPH_REPORT.md` changed and should be treated as graph-output cleanup, not product code.
- GitNexus `detect_changes` currently reports only dirty docs/tooling symbols because product code checkpoints are committed.

### Next recommended step

- Finish Faz 4:
  - Clean `AGENTS.md` into one concise instruction file with a single GitNexus block.
  - Keep `.agents`, `.kiro`, `.github/agents`, `CLAUDE.md`, OpenAPI, and Graphify output in separate docs/tooling commits or archive decisions.
  - Re-run `git status`, Graphify/GitNexus checks, and update this summary again.

## Follow-up - 2026-05-13 AGENTS Cleanup

### Root cause

- `AGENTS.md` had grown to 2279 lines because multiple AI-agent exports were pasted into the same file.
- It contained repeated AGENTS blocks, a Gemini/OpenCode chat transcript, n8n-as-code bootstrap text, imported Claude instructions, and duplicate GitNexus blocks.
- This made the primary startup instruction file noisy and risky for future agents.

### Fix applied

- Replaced `AGENTS.md` with a concise 215-line project instruction file.
- Kept the current repo map, command set, truth hierarchy, RAG/Gemini direction, high-blast-radius areas, i18n/testing notes, DevOps commit hygiene, Graphify rules, and exactly one GitNexus block.
- Removed embedded chat transcripts, duplicate AGENTS sections, n8n generated text, and imported Claude dump from `AGENTS.md`.

### Remaining docs/tooling state

- `CLAUDE.md` only has a GitNexus index-count refresh and can be committed with AGENTS cleanup.
- `apps/backend/openapi.json` is currently modified to empty by generated output; do not commit until regenerated or intentionally restored.
- `graphify-out/GRAPH_REPORT.md` changed after commit hooks, but Graphify warned that rebuilt graph node count is much smaller than existing `graph.json`; do not commit graph output until that warning is resolved.
- `.agents/skills/`, `.github/agents/`, and new `.kiro/specs/*` remain untracked tooling/spec artifacts and should be reviewed in a separate commit/archive decision.

## Follow-up - 2026-05-14 Artifact Cleanup

### Decision

- Preserve the currently working product behavior; no public API, backend, frontend, Prisma schema, or migration changes in this cleanup phase.
- Keep Qdrant out of scope. Continue with the existing pgvector + Gemini/LLMAPI direction.
- Treat generated outputs and local agent tooling separately from product commits.

### Fix applied

- Restored generated `apps/backend/openapi.json` output instead of committing an accidental artifact diff.
- Restored `graphify-out/GRAPH_REPORT.md` after commit hooks because Graphify still warns that the rebuilt graph has 5572 nodes while the existing graph has 11474 nodes.
- Committed local agent-tool ignore rules in `042fe81 chore(tooling): ignore local agent artifacts`:
  - `.agents/skills/`
  - `.github/agents/`
- Committed pending Kiro specs in `704189b docs(specs): track pending kiro specs`:
  - `.kiro/specs/ai-pipeline-data-cleanup/`
  - `.kiro/specs/crm-realtime-sync/`
  - `.kiro/specs/rich-text-editor/`
  - `.kiro/specs/ui-contrast-accessibility/`

### Verification

- Confirmed the Kiro spec commit contains docs/spec files only.
- Checked new Kiro specs for obvious secret patterns such as API keys, tokens, passwords, private keys, and database URLs; no real secrets were found.
- Kept Graphify output uncommitted until the graph node-count mismatch is investigated.

### Remaining

- Investigate the Graphify source/chunk mismatch before accepting any regenerated graph output.
- Run non-mutating gates after this memory update: `git status --short`, typechecks, targeted backend RAG/config tests, and Prisma schema validation.

## Follow-up - 2026-05-14 AI Quota-Safe Fallback

### Decision

- Keep Gemini as the primary provider and OpenAI as fallback.
- Do not spend OpenAI credits during normal operation unless the primary provider is unavailable or a quota-safe fallback path is needed.
- Treat daily Gemini quota exhaustion differently from short transient rate limits: daily quota should skip retry loops and move to fallback/cooldown; transient 429s should keep the existing retry behavior.

### Fix applied

- Added provider/task scoped quota cooldown in `AiService` using `AI_PROVIDER_QUOTA_COOLDOWN_MS` with a one-hour default.
- Recorded explicit AI health events when daily quota exhaustion is detected.
- Disabled optional automatic sentiment and context-suggestion AI calls by default behind settings flags:
  - `ai.auto_sentiment.enabled`
  - `ai.auto_context_suggestion.enabled`
- Kept required ticket AI diagnosis/auto-resolution behavior intact.

### Verification

- Live OpenAI fallback credential smoke test succeeded with `gpt-4o-mini` and used only 13 tokens.
- Backend focused tests passed:
  - `pnpm --filter @aluplan/backend test -- ai.service.spec.ts ai-auto-resolver.service.spec.ts env-validation.spec.ts`
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts embedding-version.registry.spec.ts rag-maintenance.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts ai.service.spec.ts ai-auto-resolver.service.spec.ts env-validation.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- `git diff --check` passed.

### Remaining

- Email retry noise and failed background jobs remain unrelated operational cleanup items.

## Follow-up - 2026-05-14 PDF-First RAG Dataset Pilot

### Decision

- Use PDF as the canonical source for the next RAG import; keep generated MD files out unless a PDF parses poorly or no PDF exists.
- Keep raw incoming PDFs under `.archive/rag-incoming/pdf/` and copy only curated, deduped files into `dataset/`.
- Categorize Knowledge Pool sources before import so the admin UI does not show all FAQ data as `General`.

### Fix applied

- Added a dataset classifier for local Knowledge Pool imports:
  - language detection: `tr`, `en`, `de`
  - category metadata: license, license server, installation, performance, network, export/import, share/cloud, project data, release info, manuals, review backlog
  - import metadata: `categorySlug`, `sourceClass`, `canonicalSource`, `importBatch`
- Updated local dataset scan to enrich new and existing dataset sources with classifier metadata.
- Generated ignored staging manifests under `.archive/rag-staging/pdf-first/`:
  - 327 raw PDFs
  - 176 exact-unique PDFs
  - 151 exact duplicate drops
  - 123 support-first ready PDFs
  - 52 manual/review backlog PDFs
- Copied three pilot PDFs into categorized `dataset/` paths and scanned them:
  - TR: `License & Activation`
  - EN: `License Server & CodeMeter`
  - DE: `Performance & Hardware`

### Verification

- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- dataset-classifier.spec.ts knowledge-pool-job.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Local services were started successfully:
  - backend health: database, redis, bullmq, storage all `up`
  - frontend: `http://localhost:3000`
- Dataset scan result:
  - discovered 3 new files
  - checked 7 existing files
  - updated 7 existing source metadata records
- Pilot sync result:
  - all 3 pilot sources `SUCCESS`
  - embeddings: 20 total, all `3072 / v2_2`
- Search smoke:
  - EN license-server query returns the EN pilot source.
  - DE real-time scanner query returns the DE pilot source.
  - Targeted TR license-transfer queries return the TR pilot source first.

### Remaining

- Broad Turkish wording such as “Allplan lisansını yeni bilgisayara nasıl aktarırım?” can still retrieve adjacent EN license-server content first; treat this as a retrieval tuning issue, not an import failure.
- Do not commit `apps/backend/openapi.json` unless intentionally regenerated or restored.
- Continue imports in 5-file support batches from `.archive/rag-staging/pdf-first/ready/manifest-ready.json`.

## Follow-up - 2026-05-14 Language/Category-Aware RAG Retrieval

### Decision

- RAG search should not hard-filter by source language. User/UI language controls answer language, while source retrieval may still use EN/DE/TR documents.
- Same-language and same-category sources should be boosted, not made mandatory.
- Repeated chunks from the same source should be de-duplicated in returned search results.
- UI-uploaded Knowledge Pool files should use the same classifier metadata as local dataset imports.

### Fix applied

- UI uploads now classify file metadata through the shared dataset classifier:
  - `language`
  - `category`
  - `categorySlug`
  - `sourceClass`
  - `canonicalSource`
  - `importBatch=ui-upload`
- `EmbeddingService.search()` now:
  - infers query language/category
  - boosts same-language and same-category results
  - keeps foreign-language sources eligible as fallback evidence
  - de-duplicates repeated chunks by source
  - returns source `language` and `category` metadata in search results
- German query detection was tightened for support terms such as `Echtzeit`, `blockiert`, `wenn`, `nicht`, and related German signals.

### Verification

- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- dataset-classifier.spec.ts knowledge-pool-job.spec.ts embedding.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Backend was restarted and health remained green.
- Live search smoke after restart:
  - TR broad license-transfer query returns TR `License & Activation` sources in the first two results.
  - EN license-server query returns the EN `License Server & CodeMeter` pilot first.
  - DE real-time scanner query returns the DE `Performance & Hardware` pilot first.

### Remaining

- Older sources with `General` category still appear lower in result lists; clean/reclassify them separately if they continue to add noise.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 001 Import

### Decision

- Continue imports with small support-first batches instead of bulk-loading all PDFs.
- Keep sync sequential to avoid provider quota pressure; trigger the next file only after the previous source is `ACTIVE` with embeddings.

### Batch 001 files

- TR / `Export Import & IFC DWG`: `FAQ_TR_Allplan Pafta Düzenleme'den X-Ref ile Karmaşık Veri Gönderme -(Export-).pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Allplan-da-Lisans-Nasil-Kayitlandirabilirim-(Register).pdf`
- EN / `Network & Workgroup`: `FAQ_EN_Allplan_in_the_home-office.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_cannot_find_a_license_.pdf`
- DE / `Performance & Hardware`: `FAQ_DE_Geschwindigkeit_von_Allplan_verbessern_bzw_analysieren.pdf`

### Verification

- Product code committed:
  - `0c2f1fb fix(rag): boost title-specific retrieval matches`
- Dataset scan result:
  - discovered 5 new files
  - checked 10 existing files
  - updated 0 existing files
  - total local dataset files: 15
- Sync result:
  - 5/5 sources `SUCCESS`
  - 5/5 sources `ACTIVE`
  - total new embeddings: 36
  - embedding distribution: `3072 / v2_2`
- Backend health remained green after sync.
- Search smoke:
  - TR X-Ref/export query returns the new PDF in the top results.
  - TR license registration query returns the new license PDF first.
  - EN home-office query returns the new home-office PDF first.
  - EN license-server missing-license query returns the new license-server PDF first.
  - DE performance query returns the new performance PDF first.

### Remaining

- Continue with Batch 002 using the same sequential sync pattern.
- Watch legacy `General` category results; they may need separate cleanup/reclassification after enough PDF sources are imported.

## Follow-up - 2026-05-14 PDF Batch 002 Import and Retrieval Tuning

### Decision

- Batch 002 stayed support-first and sequential to protect Gemini quota.
- Retrieval should prefer source title specificity when vector similarity, language, and category are otherwise close.
- Foreign-language sources remain eligible as fallback evidence; this is a ranking improvement, not a language hard filter.

### Batch 002 files

- TR / `License & Activation`: `faq-softlock-SSS-Bilgisayarimi-formatladim-lisansimi-nasil-geri-alirim.pdf`
- EN / `Installation & Setup`: `FAQ_EN_Allplan_silent_installation_(Allplan_2017_and_later).pdf`
- EN / `Export Import & IFC DWG`: `FAQ_EN_Export_resolving_and_transferring_layouts.pdf`
- DE / `Performance & Hardware`: `FAQ_DE_Grafikkarten_fuer_Allplan.pdf`
- DE / `License & Activation`: `FAQ_DE_Lizenz_auf_neuen_anderen_Rechner_uebertragen.pdf`

### Verification

- Dataset scan result:
  - discovered 5 new files
  - checked 15 existing files
  - updated 0 existing files
  - total local dataset files: 20
- Sync result:
  - 5/5 sources `SUCCESS`
  - 5/5 sources `ACTIVE`
  - total new embeddings: 32
  - embedding distribution: `3072 / v2_2`
- Backend health remained green after restart.
- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts`
  - `pnpm --filter @aluplan/backend typecheck`
- Live search smoke after title-specific ranking:
  - TR format/recover-license query returns `faq-softlock-SSS-Bilgisayarimi-formatladim-lisansimi-nasil-geri-alirim.pdf` first.
  - DE license-transfer query returns `FAQ_DE_Lizenz_auf_neuen_anderen_Rechner_uebertragen.pdf` first.
  - EN silent-install query returns `FAQ_EN_Allplan_silent_installation_(Allplan_2017_and_later).pdf` first.

### Remaining

- Continue with Batch 003 using the same sequential sync pattern.
- Similar multilingual license FAQs can still show capped similarity ties; rank order is now improved by language, category, and title tokens.
- Graphify hook ran on commit but warned that the rebuilt graph had 5596 nodes while the existing graph has 11474; `graphify-out/GRAPH_REPORT.md` was restored and not committed.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 Settings Secret Hardening

### Decision

- Secret classification for provider credentials must be enforced on the backend, not trusted from UI payloads.
- Existing plaintext secret-like settings should be remediated safely without printing secret values.

### Fix applied

- `SettingsService` now forces secret storage for keys matching credential patterns such as `.api_key`, `.secret_key`, `.client_secret`, `.webhook_secret`, `.credentials_json`, `.token`, and legacy `resend_api_key`.
- Existing plaintext secret-like settings are encrypted and flipped to `isSecret=true` when read through `get` / `getValue` / `getAll`.
- Added regression coverage for forced encrypted API key storage and read-time plaintext secret migration.
- Checked live DB metadata for `ai.gemini.api_key` without printing the value; it is currently `is_secret=true`.

### Verification

- Backend provider/settings tests passed:
  - `pnpm --filter @aluplan/backend test -- settings.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts ai.service.spec.ts ai-provider-router.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- `git diff --check` passed.

## Follow-up - 2026-05-14 PDF Batch 003 Safety Fix

### Decision

- OpenAI remains enabled as chat fallback, but embedding fallback is disabled for the active Gemini corpus.
- Embedding compatibility must check both vector dimension and embedding model identity; same dimension is not enough.
- An unchanged source hash is not sufficient for sync success when the source has zero embeddings.

### Batch 003 status

- 5 files were discovered under `dataset/.../batch-003`.
- 4/5 sources synced successfully and are `ACTIVE`.
- Successful Batch 003 embeddings: 15 rows, all `3072 / v2_2`.
- The remaining source, `FAQ_DE_Lizenzserver_-_Es_wird_keine_Lizenz_gefunden_.pdf`, is intentionally `FAILED` with 0 embeddings because Gemini embedding quota returned 429.
- Earlier bad OpenAI fallback embeddings for this source were removed; the pool is not polluted by mixed-provider vectors.

### Fix applied

- `EmbeddingService` now rejects embedding results whose dimension or model does not match the active embedding version config.
- `EmbeddingService.indexPoolContent()` now fails if no embeddings are generated for a source.
- `KnowledgePoolProcessor` now re-indexes unchanged files when their embedding count is zero instead of marking them successful.
- `.env.example` now documents the active 3072-dim expectation.

### Verification

- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts`
  - `pnpm --filter @aluplan/backend test -- knowledge-pool.processor.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Backend build passed:
  - `pnpm --filter @aluplan/backend build`
- Backend restarted from `dist/main.js` and `/api/v1/health` is green.

### Remaining

- Retry the failed Batch 003 source after Gemini embedding quota recovers.
- Do not enable OpenAI embedding fallback unless a new embedding version and full re-embedding plan are created.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 003 Completed

### Result

- The previously failed Batch 003 source was retried after Gemini embedding quota recovered.
- Batch 003 is now fully synced:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 003 embeddings: 25
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- TR Softlock computer-change query returned `faq-softlock-SSS-Bilgisayar-değişikliği-yapmak-istiyorum-Softlock-2013.pdf` first.
- TR temporary online license-transfer query returned `faq-softlock-SSS-Geçici-lisans-transferi-Online.pdf` first.
- EN offline activation query returned `FAQ_EN_Activating_license_offline_(without_Internet_access).pdf` first.
- DE CodeMeter manual install query returned `FAQ_DE_Codemeter_Kontrollzentrum_manuell_installieren.pdf` first.
- DE license-server no-license query returned `FAQ_DE_Lizenzserver_-_Es_wird_keine_Lizenz_gefunden_.pdf` first.

### Remaining

- Continue with Batch 004 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 004 Completed

### Batch 004 files

- DE / `License & Activation`: `FAQ_DE_Dienst_fuer_die_Lizenzierung_laeuft_nicht.pdf`
- DE / `License & Activation`: `FAQ_DE_Lizenz_offline_aktivieren_und_zurueckgeben_(ohne_Internet.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Fehlermeldung_CodeMeter_ist_nicht_installiert_CodeMeter_n.pdf`
- EN / `License & Activation`: `FAQ_EN_Controlling_license_selection.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_Finding_license_server_automatically_or_entering_addition.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 25 existing files
  - updated 0 existing files
  - total local dataset files: 30
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 004 embeddings: 29
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE licensing service query returned `FAQ_DE_Dienst_fuer_die_Lizenzierung_laeuft_nicht.pdf` first.
- DE offline license activate/return query returned `FAQ_DE_Lizenz_offline_aktivieren_und_zurueckgeben_(ohne_Internet.pdf` first.
- DE CodeMeter not-installed query returned `FAQ_DE_Fehlermeldung_CodeMeter_ist_nicht_installiert_CodeMeter_n.pdf` first.
- EN controlling license selection query returned `FAQ_EN_Controlling_license_selection.pdf` first.
- EN finding license server query returned `FAQ_EN_Finding_license_server_automatically_or_entering_addition.pdf` first.

### Remaining

- Continue with Batch 005 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 005 Completed

### Batch 005 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Installation_und_Konfiguration_des_Lizenzservers.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Keine_Lizenz_am_Client_nach_Update_von_Codemeter_Runtime.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_borrowing_licenses_temporarily.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_Moving_license_server_to_a_new_server.pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Geçici-lisans-transferi-Manuel.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 30 existing files
  - updated 0 existing files
  - total local dataset files: 35
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 005 embeddings: 31
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server install/config query returned `FAQ_DE_Installation_und_Konfiguration_des_Lizenzservers.pdf` first.
- DE no-license-after-CodeMeter-update query returned `FAQ_DE_Keine_Lizenz_am_Client_nach_Update_von_Codemeter_Runtime.pdf` first.
- EN temporary license borrowing query returned `FAQ_EN_License_server_-_borrowing_licenses_temporarily.pdf` first.
- EN move license server query returned `FAQ_EN_Moving_license_server_to_a_new_server.pdf` first.
- TR manual temporary license transfer query returned `faq-softlock-SSS-Geçici-lisans-transferi-Manuel.pdf` first.

### Remaining

- Continue with Batch 006 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 006 Completed

### Batch 006 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_temporaer.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_auf_neuen_Server_umziehen.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_assigning_access_rights_for_seats_to_ind.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_getting_licenses_by_using_VPN.pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Lisansimi-artik-başka-bir-bilgisayarda-kullanmak-istiyorum.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 35 existing files
  - updated 0 existing files
  - total local dataset files: 40
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 006 embeddings: 26
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE temporary license borrowing query returned `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_temporaer.pdf` first.
- DE move license server query returned `FAQ_DE_Lizenzserver_auf_neuen_Server_umziehen.pdf` first.
- EN assign license-server seat access rights query returned `FAQ_EN_License_server_-_assigning_access_rights_for_seats_to_ind.pdf` first.
- EN license server over VPN query returned `FAQ_EN_License_server_-_getting_licenses_by_using_VPN.pdf` first.
- TR use license on another computer query returned `faq-softlock-SSS-Lisansimi-artik-başka-bir-bilgisayarda-kullanmak-istiyorum.pdf` first.

### Remaining

- Continue with Batch 007 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 007 Completed

### Batch 007 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_Nachverfolgung_welche_Ben.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktivieren_und_zu.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_activating_a_license_offline_on_the_serv.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_license_borrowing_tracking_which_users_h.pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Allplan-Lisansinin-Kayitlandirma-İşlemi.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 40 existing files
  - updated 0 existing files
  - total local dataset files: 45
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 007 embeddings: 26
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license borrowing tracking query returned `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_Nachverfolgung_welche_Ben.pdf` first.
- DE license-server offline activation query returned `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktivieren_und_zu.pdf` first when the query explicitly targeted server-side offline activation.
- EN license-server offline activation query returned `FAQ_EN_License_server_-_activating_a_license_offline_on_the_serv.pdf` first.
- EN license borrowing tracking query returned `FAQ_EN_License_server_-_license_borrowing_tracking_which_users_h.pdf` first.
- TR Allplan license registration query returned `faq-softlock-SSS-Allplan-Lisansinin-Kayitlandirma-İşlemi.pdf` first.

### Note

- A broader DE query mentioning both offline activation and return (`zurueckgeben`) correctly preferred the workstation/offline activation-return PDF from Batch 004 over the server-specific Batch 007 PDF. This is expected; server-specific wording ranks the Batch 007 source first.

### Remaining

- Continue with Batch 008 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 008 Completed

### Batch 008 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktualisieren.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenzen_ueber_VPN_beziehen_.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_updating_a_license_offline_on_the_server.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_settings_used_by_several_computers.pdf`
- TR / `License & Activation`: `faq-softlock-Softlock-Destek-2006.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 45 existing files
  - updated 0 existing files
  - total local dataset files: 50
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 008 embeddings: 23
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server offline update query returned `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktualisieren.pdf` first.
- DE license server via VPN query returned `FAQ_DE_Lizenzserver_-_Lizenzen_ueber_VPN_beziehen_.pdf` first.
- EN license-server offline update query returned `FAQ_EN_License_server_-_updating_a_license_offline_on_the_server.pdf` first.
- EN shared license-server settings query returned `FAQ_EN_License_server_settings_used_by_several_computers.pdf` first.
- TR Softlock support query returned `faq-softlock-Softlock-Destek-2006.pdf` first.

### Remaining

- Continue with Batch 009 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 009 Completed

### Runtime restart

- After a local machine restart, both backend and frontend were down.
- Backend restarted with `pnpm --filter @aluplan/backend start`.
- Frontend restarted on `http://localhost:3000`.
- Backend health returned `ok` with database, Redis, and BullMQ all up.

### Batch 009 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Zugriffsrechte_von_Arbeitsplaetzen_fuer_ei.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_automatisch_finden_oder_zusaetzlichen_Server.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_und_oder_Lizenzen_aktualisieren_.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_obtain_licenses_via_VPN_.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_installation_failed.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 50 existing files
  - updated 0 existing files
  - total local dataset files: 55
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 009 embeddings: 24
  - embedding distribution: `3072 / v2_2` only
- Corpus totals after Batch 009:
  - total knowledge sources: 69
  - total knowledge pool embeddings: 648
  - corpus embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server access-rights query returned `FAQ_DE_Lizenzserver_-_Zugriffsrechte_von_Arbeitsplaetzen_fuer_ei.pdf` first.
- DE license-server update query returned `FAQ_DE_Lizenzserver_und_oder_Lizenzen_aktualisieren_.pdf` first.
- EN obtain-license-via-VPN query returned `FAQ_EN_License_server_-_obtain_licenses_via_VPN_.pdf` first.
- EN license-server-installation-failed query returned `FAQ_EN_License_server_installation_failed.pdf` first.
- DE automatic/additional license-server query initially tied with other license-server docs at capped score `1`; title/keyword-specific queries returned `FAQ_DE_Lizenzserver_automatisch_finden_oder_zusaetzlichen_Server.pdf` first.

### Remaining

- Continue with Batch 010 using the same sequential, low-rate import pattern.
- Watch capped-score ties among very similar license-server FAQs; source title/metadata still resolves the specific document when the query is explicit.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 010 Completed

### Batch 010 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzservereinstellungen_auf_mehrere_Rechner_verteilen.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Rueckgabe_von_Einzelplatzlizenzen_am_Lizenzserver.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_Updating_license_server_and_licenses_.pdf`
- DE / `Performance & Hardware`: `FAQ_DE_Grafikkartentreiber_aktualisieren.pdf`
- EN / `Performance & Hardware`: `FAQ_EN_Updating_the_driver_of_the_graphics_card.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 55 existing files
  - updated 0 existing files
  - total local dataset files: 60
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 010 embeddings: 16
  - embedding distribution: `3072 / v2_2` only
- Corpus totals after Batch 010:
  - total knowledge sources: 74
  - total knowledge pool embeddings: 664
  - corpus embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server settings distribution query returned `FAQ_DE_Lizenzservereinstellungen_auf_mehrere_Rechner_verteilen.pdf` first.
- DE return standalone licenses at license server query returned `FAQ_DE_Rueckgabe_von_Einzelplatzlizenzen_am_Lizenzserver.pdf` first.
- EN update license server and licenses query returned `FAQ_EN_Updating_license_server_and_licenses_.pdf` first.
- DE graphics-card-driver update query returned `FAQ_DE_Grafikkartentreiber_aktualisieren.pdf` first.
- EN graphics-card-driver update query returned `FAQ_EN_Updating_the_driver_of_the_graphics_card.pdf` first.

### Note

- A legacy `General` category source for `FAQ_EN_Updating_the_driver_of_the_graphics_card` still appears behind the new categorized dataset source for English graphics-driver queries. The top result is correct, but legacy source cleanup/reclassification remains a future RAG quality task.

### Remaining

- Continue with Batch 011 using the same sequential, low-rate import pattern.
- Prefer remaining support-first FAQ sources, especially installation, network/workgroup, export/import, and practical license/activation issues.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 011 Completed

### Batch 011 files

- DE / `Installation & Setup`: `FAQ_DE_Allplan_Silent-Installation_ab_Allplan_2017-2021.pdf`
- DE / `Installation & Setup`: `FAQ_DE_Infos_zur_laenderspezifischen_Installation_Allplan_2019.pdf`
- EN / `Installation & Setup`: `FAQ_EN_Installing_loopback_adapter_for_a_stand-alone_version_wit.pdf`
- DE / `Network & Workgroup`: `FAQ_DE_Workgroupmanager_Rechner_aufnehmen_nicht_moeglich.pdf`
- EN / `Network & Workgroup`: `FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 60 existing files
  - updated 0 existing files
  - total local dataset files: 65
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 011 embeddings: 32
  - embedding distribution: `3072 / v2_2` only
- Corpus totals after Batch 011:
  - total knowledge sources: 79
  - total knowledge pool embeddings: 696
  - corpus embedding distribution: `3072 / v2_2` only

### Search smoke

- DE country-specific installation query returned `FAQ_DE_Infos_zur_laenderspezifischen_Installation_Allplan_2019.pdf` first.
- EN loopback adapter standalone query returned `FAQ_EN_Installing_loopback_adapter_for_a_stand-alone_version_wit.pdf` first.
- DE workgroup-manager computer-add query returned `FAQ_DE_Workgroupmanager_Rechner_aufnehmen_nicht_moeglich.pdf` first.
- EN workgroup-manager computer-add query returned `FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf` first.
- DE silent-installation title query returned `FAQ_DE_Allplan_Silent-Installation_ab_Allplan_2017-2021.pdf` first.

### Note

- A broader silent-installation query tied with the already-imported English silent-installation source at score `1`, so the English counterpart appeared first and the new German source second. Explicit title/source wording resolves the German source first.
- The word `deutsch` alone does not currently force German source preference in raw search results; locale-aware answer generation may still choose Turkish/German response language separately.

### Remaining

- Continue with Batch 012 using the same sequential, low-rate import pattern.
- Watch multilingual near-duplicate ties when English and German FAQs cover the same topic.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Pause Checkpoint - 2026-05-14 RAG Dataset Status

### Current answer

- The full dataset operation is **not finished**.
- The support-first, controlled seed corpus is now usable enough to pause importing and run acceptance tests.
- Do not continue importing every remaining PDF before testing real customer questions.

### Completed import state

- Completed staged batches: Batch 001 through Batch 011.
- Last verified corpus state:
  - knowledge sources: 79
  - knowledge pool embeddings: 696
  - embedding distribution: only `3072 / v2_2`
- PDF-first manifest state:
  - ready manifest entries: 123
  - dataset PDF files detected locally: 64
  - remaining ready manifest files: 62

### Remaining ready files by category

- `License & Activation`: 18
- `Project Data Management`: 18
- `Release Package Info`: 6
- `Export Import & IFC DWG`: 5
- `Network & Workgroup`: 5
- `Installation & Setup`: 4
- `Performance & Hardware`: 3
- `License Server & CodeMeter`: 2
- `Allplan Share & Cloud`: 1

### Next recommended phase

- Pause bulk import.
- Build a 20-30 question RAG acceptance test set using real customer-style questions in Turkish, English, and German.
- For each question, check:
  - whether the top source is the expected document
  - whether the generated answer uses the correct language
  - whether legacy `General` sources outrank categorized PDF sources
  - whether multilingual near-duplicate ties damage the final answer
- Resume Batch 012 only after the test set shows which categories are actually missing.

### Import priority after acceptance test

- First: `License & Activation`
- Then: `Network & Workgroup`
- Then: `Export Import & IFC DWG`
- Then: `Performance & Hardware`
- Last: broad manuals, release/package info, and project-data documents.

### Notes for resume

- Keep OpenAI disabled for embedding fallback; OpenAI may remain chat fallback only.
- Keep using the sequential low-rate import pattern for any future batch.
- `apps/backend/openapi.json` remains an unrelated modified artifact and should not be mixed into RAG/memory commits.

## Follow-up - 2026-05-14 Local Browser CSP Fix

### Root cause

- Backend auth was healthy: `POST /api/v1/auth/login` returned 200, set `alu_at`/`alu_rt`, and `/auth/me` returned 200 after login.
- Frontend middleware saw auth cookies correctly; `curl` with the same cookie reached `/tr/dashboard` with 200.
- The browser flow was broken by CSP in local dev:
  - `upgrade-insecure-requests` caused Next.js RSC navigation from `http://localhost:3000/dashboard` to attempt HTTPS and fail with `ERR_SSL_PROTOCOL_ERROR`.
  - `connect-src` allowed `http://localhost:4000` but not `ws://localhost:4000`, so Socket.io WebSocket was blocked.

### Fix

- Commit: `c99076f fix(frontend): allow local websocket and http navigation in csp`
- Changed `apps/frontend/src/middleware.ts`:
  - added websocket origin derived from `NEXT_PUBLIC_API_URL`
  - allowed `ws://localhost:4000` in `connect-src`
  - limited `upgrade-insecure-requests` to production only

### Verification

- `pnpm --filter @aluplan/frontend typecheck` passed.
- GitNexus detect changes:
  - risk level: medium
  - affected flow: Middleware -> Set
- Browser automation with API-auth cookies verified:
  - `/tr/dashboard` renders admin dashboard.
  - `/tr/admin/ai-intelligence` renders AI strategic intelligence page.
  - `/tr/tickets/new` renders customer new ticket page.
  - console shows `[WS] Connected to http://localhost:4000/ws`.

### Notes

- The in-app Browser and Chrome plugin bridges timed out in this session, so Playwright was used as the fallback browser automation path.
- Graphify hook ran during commit and warned that the rebuilt graph is much smaller than the existing graph; hook-generated `graphify-out/GRAPH_REPORT.md` was restored and not committed.
- `apps/backend/openapi.json` remains the only unrelated modified artifact.

## Follow-up - 2026-05-14 RAG Quality Root Fix In Progress

### User-facing problem

- During live RAG testing, Turkish customer questions could still receive weak or wrong grounded fallback answers.
- Example problematic question:
  - `Allplan açılışta birkaç dakika bekliyor, ağ veya isim çözümleme kaynaklı olabilir mi?`
- Earlier behavior:
  - Retrieval/fallback could drift to license, home-office, or generic network docs instead of the best source passage.
  - Cached old answers could continue serving stale wrong results even after retrieval logic improved.

### Root causes found

- `generateHypotheticalDocument()` injected generic causes into HyDE text, including license-related wording, which polluted non-license queries.
- Hotinfo raw context was previously appended into retrieval text for hardware/system queries, so traces containing license paths could pull license PDFs into unrelated searches.
- Knowledge pool search was mostly vector-led; keyword/lexical evidence from `knowledge_pool_embeddings.content` did not strongly help exact phrases like `name resolution`.
- `/ai/search` could find the right candidate at a wider limit, but `/ai/query` cut candidates too early in `rerankResults()`, before query-signal reranking could rescue the best source.
- Exact and semantic AI caches could keep returning stale pre-fix answers; cache versioning was inconsistent between `RAG_CONFIG.CACHE.VERSION` and `AiSemanticCache` exact keys.

### Code changes made in this session

- `apps/backend/src/ai/utils/hypothetical-document.ts`
  - Made HyDE templates neutral and source-intent focused.
  - Removed generic license/performance/plugin cause injection.
- `apps/backend/src/ai/ai-query.service.ts`
  - Stopped injecting raw Hotinfo into the retrieval query; Hotinfo remains answer context only.
  - Added startup/network query signal handling.
  - Kept more candidates through feedback reranking before final sync rerank.
  - Added query-signal reranking for stream path too.
  - Added intent penalties/boosts so network-startup questions do not rank license sources above precise name-resolution passages.
  - Cache hit log now uses `RAG_CONFIG.CACHE.VERSION` instead of stale hardcoded `v5`.
- `apps/backend/src/ai/embedding.service.ts`
  - Expanded knowledge pool hybrid search with lexical keyword matching over source name + chunk content.
  - Added candidate pool widening for reranking.
  - Added category/intent scoring:
    - network/startup query -> boost `Network & Workgroup`
    - performance query -> boost `Performance & Hardware`
    - network/startup query without license intent -> demote `License & Activation`
  - Added precise content signal boost for `name resolution on the network` / `takes several minutes to start`.
- `apps/backend/src/ai/ai-semantic-cache.service.ts`
  - Exact cache key now uses `RAG_CONFIG.CACHE.VERSION`.
  - Exact and semantic cache responses now require matching `cacheVersion`.
  - Stored cache payloads now include the active cache version.
  - Non-UUID semantic tenant mapping to system UUID remains in place.
- `apps/backend/src/config/rag.config.ts`
  - Bumped AI cache version from `v6` to `v7` to bypass stale wrong answers.
- `apps/frontend/src/app/[locale]/(dashboard)/tickets/new/page.tsx`
  - Diagnosis query construction now avoids sending duplicated text when subject and description are the same.
- `apps/backend/src/ai/utils/synonym-dictionary.ts`
  - Added network/name-resolution synonyms.
- `apps/backend/src/knowledge-pool/dataset-classifier.ts`
  - Added name-resolution/DNS signals to `Network & Workgroup` classification.

### Tests / verification run

- Backend targeted RAG/cache tests passed:
  - `pnpm --filter @aluplan/backend test -- ai-semantic-cache.service.spec.ts ai-query.service.spec.ts embedding.service.spec.ts rag-improvements.spec.ts`
  - Result: 5 suites passed, 72 passed, 1 skipped.
- Backend broader targeted set passed earlier in this fix:
  - `embedding.service.spec.ts`
  - `dataset-classifier.spec.ts`
  - `rag-improvements.spec.ts`
  - `ai-query.service.spec.ts`
  - `ai-semantic-cache.service.spec.ts`
  - Result: 6 suites passed, 80 passed, 1 skipped.
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Backend build passed:
  - `pnpm --filter @aluplan/backend build`
- Backend was restarted from `dist/main` on port `4000`.

### Live smoke results

- `/api/v1/ai/search` for the startup/name-resolution question now ranks:
  1. `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  2. `[Dataset] FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf`
  3. `[Dataset] FAQ_EN_Allplan_in_the_home-office.pdf`
- `/api/v1/ai/query?wait=true` after cache-version/cache-guard changes now returns the correct top source:
  - `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - fallback excerpt:
    - `Name resolution on the network If Allplan takes several minutes to start, name resolution on the network may not work.`

### Current status / caution

- This fix is **not committed yet**.
- Important modified files currently include:
  - `apps/backend/src/config/rag.config.ts`
  - `apps/backend/src/ai/ai-query.service.ts`
  - `apps/backend/src/ai/ai-query.service.spec.ts`
  - `apps/backend/src/ai/ai-semantic-cache.service.ts`
  - `apps/backend/src/ai/ai-semantic-cache.service.spec.ts`
  - `apps/backend/src/ai/embedding.service.ts`
  - `apps/backend/src/ai/embedding.service.spec.ts`
  - `apps/backend/src/ai/utils/hypothetical-document.ts`
  - `apps/backend/src/ai/utils/rag-improvements.spec.ts`
  - `apps/backend/src/ai/utils/synonym-dictionary.ts`
  - `apps/backend/src/knowledge-pool/dataset-classifier.ts`
  - `apps/frontend/src/app/[locale]/(dashboard)/tickets/new/page.tsx`
- Existing unrelated artifact still present:
  - `apps/backend/openapi.json`
- Do not mix `apps/backend/openapi.json` into the RAG quality commit unless intentionally regenerated.

### Next step after resume

- Re-run final quick verification:
  - backend typecheck
  - targeted RAG/cache tests
  - live `/ai/search` and `/ai/query?wait=true` smoke for the 3 known questions
- If still green, commit as a focused product-code fix, likely:
  - `fix(rag): improve grounded retrieval relevance and cache invalidation`
- Then update Graphify/GitNexus only after commit; keep generated graph output separate if it changes.

## Follow-up - 2026-05-14 Faz 1 Final Verification

### Additional fix before commit

- `RAG_CONFIG.CACHE.VERSION` was bumped from `v7` to `v8` after the last source-reranking tweak.
- Reason: the live endpoint returned the old `v7` exact-cache result with the previous source list, including a license source for a network/startup question.
- The network/startup reranker now applies a stronger license-source penalty only when the query itself is not about licensing.

### Final verification run

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts ai-semantic-cache.service.spec.ts`
  - 3 suites passed, 39 passed, 1 skipped.
- `pnpm --filter @aluplan/backend build`
  - Passed.
- Backend restarted from the fresh `dist/main` build on port `4000`.

### Live smoke after cache v8

- Startup/network Turkish query:
  - Search top 3:
    1. `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
    2. `[Dataset] FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf`
    3. `[Dataset] FAQ_EN_Allplan_in_the_home-office.pdf`
  - AI answer source:
    - `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - Fallback excerpt correctly contains:
    - `Name resolution on the network If Allplan takes several minutes to start...`
  - License source no longer appears in the top answer sources.
- Performance Turkish query:
  - Search/answer top source remains `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`.
- Graphics driver Turkish query:
  - Search returns graphics driver sources.
  - Answer remains Turkish fallback summary and cites graphics driver source.

### Residual quality note

- One non-license but off-intent source (`FAQ_DE_Export_Plaene_aufgeloest_uebertragen`) still appeared as the third answer source for the startup/network query.
- This is not the original critical license contamination bug; it should be handled in the next quality phases with an acceptance query set, metadata cleanup, and stricter final source diversity/filtering.

### Graphify / GitNexus phase-end check

- `graphify update .` ran successfully but warned:
  - new graph: 5605 nodes
  - existing graph: 11474 nodes
  - Graphify refused overwrite due possible missing chunks/session state.
- Because of that warning, `graphify-out/GRAPH_REPORT.md` must not be committed for this phase.
- `npx gitnexus detect_changes --repo aluplan-support-desk-v02` ran successfully:
  - 15 files changed
  - 55 symbols changed
  - 9 affected processes
  - risk level: high
- High-risk flows include `AiQueryService.queryInternal`, `streamQuery`, and `NewTicketPage`, so this phase is guarded by targeted backend tests, backend build, frontend typecheck, and live RAG smoke.

## Follow-up - 2026-05-14 Faz 2 Started

### Acceptance set created

- Added `.ai/rag-quality/README.md`.
- Added `.ai/rag-quality/acceptance-questions.json`.
- The acceptance set currently contains 25 customer-like questions across Turkish, English, and German.
- Each question records:
  - expected answer language
  - expected categories
  - expected source hints
  - forbidden source hints
  - answer hints that should be mentioned

### Validation

- JSON parse and shape validation passed:
  - 25 questions
  - no duplicate IDs
  - required fields present
- `graphify update .` ran but produced the same node-count warning:
  - new graph: 5605 nodes
  - existing graph: 11474 nodes
  - graph output was not committed.
- `npx gitnexus detect_changes --repo aluplan-support-desk-v02` reported:
  - No changes detected.

### Next step

- Execute the acceptance set against localhost and classify failures by root cause before touching more retrieval code.

## Interrupt Summary - 2026-05-14 Session Limit Checkpoint

### User request

- User warned that session limit is around 30% and asked for an intermediate summary.
- This note captures the current state so the next session can continue without losing context.

### Completed commits this session

- `65d8a54 fix(rag): improve grounded retrieval relevance and cache invalidation`
  - Neutralized HyDE so it no longer injects generic license/performance/plugin causes.
  - Removed Hotinfo raw trace pollution from retrieval query.
  - Added lexical/hybrid retrieval widening and query signal reranking.
  - Strengthened network/startup intent so license sources are demoted when the query is not about licensing.
  - Added exact/semantic cache version guards and bumped cache version to `v8`.
  - Fixed frontend duplicate diagnosis-query construction.
  - Verified with targeted backend tests, backend typecheck/build, frontend typecheck, GitNexus, and live 3-question smoke.
- `6a48060 docs(rag): add acceptance question set`
  - Added `.ai/rag-quality/README.md`.
  - Added `.ai/rag-quality/acceptance-questions.json`.
  - 25 multilingual customer-like RAG acceptance questions are now the active quality gate.

### Current working tree

- Only known uncommitted file:
  - `apps/backend/openapi.json`
- This file was already identified as an unrelated generated artifact and must not be mixed into RAG quality commits unless intentionally regenerated/restored.

### Graphify / GitNexus status

- `graphify update .` was run after phases, but it repeatedly warned:
  - new graph: 5605 nodes
  - existing graph: 11474 nodes
  - possible missing chunk/session state.
- Because of this, `graphify-out/GRAPH_REPORT.md` was restored and not committed.
- GitNexus after Faz 1:
  - 15 files, 55 symbols, 9 affected flows, risk high.
- GitNexus after Faz 2 docs/memory:
  - No changes detected.

### Services

- Backend was rebuilt and restarted from `dist/main`.
- Backend was running on `localhost:4000` at the time of the checkpoint.
- Redis and Postgres were reachable.
- Frontend status was not changed in this checkpoint.

### Acceptance run state

- Faz 3 started as retrieval-only dry-run through `/api/v1/ai/search`.
- First run:
  - 25 total
  - first 10 passed
  - remaining 15 initially failed with HTTP `429` because the search endpoint throttle window was hit.
- Retry for the 15 throttled questions used a slower pace:
  - 15 total
  - 7 passed
  - 8 failed

### Combined acceptance signal so far

- Non-throttle passes observed:
  - TR network/startup
  - TR performance
  - TR graphics driver
  - TR license offline
  - TR license server/add license
  - TR installation
  - TR workgroup add computer
  - TR home-office
  - TR IFC export
  - TR DWG export
  - EN performance
  - EN name resolution
  - EN graphics driver
  - EN license server
  - EN workgroup
  - DE performance
  - DE graphics driver
- Real retrieval/metadata failures observed:
  - `rag-tr-project-backup-001`
    - Top: `[Dataset] FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf`
    - Category: `License & Activation`
    - Likely root cause: dataset gap or acceptance expectation too broad; project backup/data migration content may not exist or is hidden behind license-transfer wording.
  - `rag-tr-share-cloud-001`
    - Top: `[Dataset] ifc_aktarim_el_kitabi.pdf`
    - Category: `Export Import & IFC DWG`
    - Likely root cause: Allplan Share/Cloud source gap or weak category/source coverage.
  - `rag-tr-hotinfo-001`
    - Top: `Allplan_2023_New_Features`
    - Category: `General`
    - Likely root cause: Hotinfo support source gap and legacy `General` source outranking/noise.
- Still unresolved because retry hit `429` again:
  - `rag-de-ifc-001`
  - `rag-tr-cross-lingual-001`
  - `rag-tr-no-ai-ticket-001`
  - `rag-tr-general-demotion-001`
  - `rag-tr-duplicate-canonical-001`

### Important interpretation

- Current failures are not the original critical bug.
- The original critical bug was Turkish network/startup query receiving license-contaminated answer sources. That is fixed in live smoke after cache v8:
  - top source: `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - answer excerpt: `Name resolution on the network If Allplan takes several minutes to start...`
  - license source no longer appears in answer sources.
- The next quality problem is now broader:
  - endpoint throttle makes acceptance execution unreliable,
  - some domain areas have source gaps,
  - legacy `General` sources still leak into retrieval,
  - duplicate/pilot canonical preference needs a measured check.

### Recommended next step after resume

1. Do not change retrieval code immediately.
2. Finish Faz 3 by rerunning only the 5 unresolved `429` questions after throttle cooldown, one by one or with a larger delay.
3. Write a small local acceptance runner script or npm task that:
   - respects endpoint throttle,
   - records JSON results,
   - separates `429` infrastructure failures from RAG quality failures.
4. Then start Faz 4 with the smallest fix:
   - either source-gap/reporting for missing Allplan Share/Hotinfo/project-backup docs,
   - or metadata/category cleanup for legacy `General` noise,
   - or duplicate/canonical demotion if the unresolved duplicate test confirms it.

## Follow-up - 2026-05-15 Faz 3 Completed

### Resume state

- Continued from checkpoint `99a76b2 docs(memory): add rag quality checkpoint`.
- Working tree still had only the known unrelated `apps/backend/openapi.json` artifact before Faz 3 edits.
- Backend was not running at resume, so it was started with:
  - `pnpm --filter @aluplan/backend start`
- Backend booted successfully on `localhost:4000`.
- Redis and Postgres were reachable.

### Unresolved acceptance questions rerun

- The 5 previously unresolved `429` questions were rerun with a 15 second delay.
- Result:
  - 5 total
  - 2 passed
  - 3 failed
  - 0 throttle failures

### Final Faz 3 acceptance result

- 25 total questions.
- 19 passed.
- 6 real quality/data failures.
- 0 remaining throttle-only failures.

### Real failures

- `rag-tr-project-backup-001`
  - Top source: `[Dataset] FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf`
  - Root cause: likely project backup/data-management source gap or over-broad acceptance wording.
- `rag-tr-share-cloud-001`
  - Top source: `[Dataset] ifc_aktarim_el_kitabi.pdf`
  - Root cause: Allplan Share/Cloud source gap or weak coverage.
- `rag-tr-hotinfo-001`
  - Top source: `Allplan_2023_New_Features`
  - Root cause: Hotinfo source gap and legacy `General` noise.
- `rag-tr-no-ai-ticket-001`
  - Top source: `[Dataset] faq-softlock-Softlock-Destek-2006.pdf`
  - Root cause: likely product UX/help content, not PDF RAG corpus content.
- `rag-tr-general-demotion-001`
  - Top source: license registration FAQ.
  - Root cause: query contains `lisans değil`, but retrieval still treats `lisans` as positive signal.
- `rag-tr-duplicate-canonical-001`
  - Top source: `[Dataset] pilot-de-grafikkartentreiber-aktualisieren.pdf`
  - Root cause: duplicate/pilot source outranks canonical FAQ source.

### Files added

- `.ai/rag-quality/run-acceptance.mjs`
  - Local retrieval-only acceptance runner.
  - Handles login, CSRF headers, throttled delay, JSON output, and ID filtering.
- `.ai/rag-quality/results-2026-05-15.md`
  - Human-readable Faz 3 result and failure classification.

### Verification

- Smoke-tested the runner with:
  - `node .ai/rag-quality/run-acceptance.mjs --ids rag-tr-network-startup-001 --delay-ms 1000 --output /private/tmp/rag-acceptance-smoke.json`
- Result:
  - 1 total
  - 1 pass
  - 0 fail
  - 0 throttle

### Next step

- Commit Faz 3 docs/tooling/memory separately.
- Then start Faz 4 with the smallest product-code fix:
  - canonical/duplicate source preference,
  - negation-aware retrieval for `lisans değil / not license`.
- Treat Hotinfo, Allplan Share, project backup, and product-help/ticket-opening failures as dataset/acceptance decisions unless matching sources are confirmed in the corpus.

## Follow-up - 2026-05-15 Faz 4 Target Fix

### Change

- Updated `EmbeddingService` ranking with two narrow deterministic multipliers:
  - negated license intent handling for phrases like `lisans değil`, `not license`, `keine lizenz`.
  - pilot/copy source quality demotion so canonical FAQ sources outrank pilot duplicates.
- Updated `.ai/rag-quality/run-acceptance.mjs` so source hint matching includes retrieved content, not only title/category/metadata.

### Tests

- `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts`
  - 17 passed.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed.

### Live target acceptance

- `rag-tr-general-demotion-001`
  - PASS.
  - Top source changed to `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`.
- `rag-tr-duplicate-canonical-001`
  - PASS.
  - Top source changed to `[Dataset] FAQ_DE_Grafikkartentreiber_aktualisieren.pdf`.

### Live regression acceptance

- `rag-tr-network-startup-001`: PASS.
- `rag-tr-license-offline-001`: PASS.
- `rag-en-license-server-001`: PASS.

### Remaining failures

- Remaining known failures are dataset/acceptance-scope decisions, not immediate retrieval-code defects:
  - `rag-tr-project-backup-001`
  - `rag-tr-share-cloud-001`
  - `rag-tr-hotinfo-001`
  - `rag-tr-no-ai-ticket-001`

## Follow-up - 2026-05-15 Faz 5 Source Gap Decision

### Active corpus finding

- Queried active `knowledge_sources` for Share/Cloud, Hotinfo, backup/project, and ticket/support/help terms.
- Active pool has weak/no canonical source coverage for:
  - Allplan Share / Cloud usage.
  - Hotinfo-specific support flow.
  - project backup / project exchange as `Project Data Management`.
  - AI-optional ticket creation product help.

### Archive candidates found

- Allplan Share / Cloud PDF candidates exist under `.archive/rag-incoming/pdf/`:
  - `Allplan_Share_2022_Manual.pdf`
  - `Allplan_Share_2023_Manual.pdf`
  - `Allplan_Share_2023_Handbuch.pdf`
  - `System_Requirements_Allplan_Share_EN_GmbH.pdf`
  - `setup-System_Requirements_Allplan_Share_EN_GmbH.pdf`
- Project data/exchange PDF candidates:
  - `FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
  - `faq-technical-FAQ-DE-Projektaustausch-incl-aller-Einstellungen-mit-Partnerbuer.pdf`
- Hotinfo/Hotline sources appear to be MD only at this point:
  - `Hotlinetools.md`
  - `bilgi-bankasi-Hotlinetools.md`

### Decision

- Do not broaden retrieval logic to solve missing-source questions.
- Use Batch 012 for selected canonical PDFs covering:
  - Allplan Share & Cloud
  - Project Data Management
- Treat Hotinfo and AI-optional ticket creation separately:
  - Hotinfo needs a canonical PDF/TXT source or explicit exception to PDF-first.
  - AI-optional ticket creation is product-help content, not vendor RAG content.

### File added

- `.ai/rag-quality/source-gap-plan-2026-05-15.md`

## Follow-up - 2026-05-15 Batch 012 Source-Gap Import

### Scope

- Imported only selected canonical PDFs for the confirmed source gaps:
  - `dataset/en/allplan-share-cloud/batch-012/Allplan_Share_2023_Manual.pdf`
  - `dataset/en/allplan-share-cloud/batch-012/System_Requirements_Allplan_Share_EN_GmbH.pdf`
  - `dataset/de/allplan-share-cloud/batch-012/Allplan_Share_2023_Handbuch.pdf`
  - `dataset/de/project-data-management/batch-012/FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
- Raw archive files under `.archive/rag-incoming/pdf/` were not modified.
- `apps/backend/openapi.json` remained an unrelated uncommitted artifact and was not included.

### Dataset scan and sync

- Dataset scan result:
  - 4 new files discovered.
  - 65 existing files checked.
  - 0 existing files updated.
- Final sync logs:
  - 4/4 sources ended as `SUCCESS`.
  - `Allplan_Share_2023_Handbuch.pdf`: 91 embeddings, 67 chunks.
  - `Allplan_Share_2023_Manual.pdf`: 83 embeddings, 61 chunks.
  - `FAQ_DE_Projektaustausch...pdf`: 3 embeddings, 2 chunks.
  - `System_Requirements_Allplan_Share_EN_GmbH.pdf`: 2 embeddings, 1 chunk.
- Embedding distribution for Batch 012:
  - `embedding_version = v2_2`
  - `embedding_dim = 3072`
  - total `179` embeddings.

### Targeted acceptance

- `rag-tr-project-backup-001`: PASS.
  - Top source: `[Dataset] FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
- `rag-tr-share-cloud-001`: PASS.
  - Top source: `[Dataset] Allplan_Share_2023_Handbuch.pdf`
- Result file from the live runner was written outside the repo at `/private/tmp/rag-acceptance-batch-012.json`.
- Throttle count: 0.

### Remaining source decisions

- `rag-tr-hotinfo-001` still needs a canonical source decision. Current confirmed candidates are MD-only, so do not import them into the PDF-first corpus without an explicit exception.
- `rag-tr-no-ai-ticket-001` should be handled as product-help/app copy, not vendor PDF RAG.

### Phase-end mapping

- Graphify was run with `graphify update .`.
- Graphify warning repeated:
  - existing `graph.json`: 11474 nodes.
  - rebuilt graph: 5608 nodes.
  - output was not accepted into git; `graphify-out/GRAPH_REPORT.md` was restored.
- GitNexus was run with:
  - `npx gitnexus detect_changes --repo aluplan-support-desk-v02`
  - result: `No changes detected`.

## Follow-up - 2026-05-15 Hotinfo Diagnostic Context Phase

### Problem clarified

- User clarified that Hotinfo is not a canonical vendor RAG source.
- Correct model:
  - uploaded `.hxl` = ticket-specific diagnostic context about the customer's machine.
  - dataset/RAG PDFs = general support knowledge.
  - AI diagnosis should combine both without importing user Hotinfo into the global knowledge pool.

### Code findings

- Frontend `tickets/new` uploads `.hxl` to `/customers/me/hotinfo`, stores parsed profile Hotinfo, and sends confirmed `hotinfoContext` to `/ai/query`.
- Ticket creation stores `hotinfoContext` into `Ticket.hotinfoSnapshot`.
- Backend prompt context already included a basic Hotinfo section, but missed several useful diagnostic fields.
- Retrieval correctly avoided raw Hotinfo trace pollution, but explicit Hotinfo analysis lacked safe system-signal enrichment.

### Change

- `AiQueryService` now builds safe Hotinfo retrieval signals for explicit Hotinfo/system analysis:
  - includes OS, Allplan version, GPU/driver/OpenGL, RAM/VRAM, resolution, conflicting processes, security services, and an error-present marker.
  - excludes raw trace/path strings such as `_SEC.NSE` and `License` path fragments from the retrieval query.
- `PromptContextBuilderService` now includes richer Hotinfo details in final prompt context:
  - OpenGL, license type, Allplan hotfix, installed modules/worksets, security services, printers/default printer, conflicting processes, and truncated error trace.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts prompt-context-builder.service.pbt.spec.ts`
  - 3 suites passed.
  - 36 passed, 1 skipped.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed after GitNexus reported high risk.

### Phase-end mapping

- GitNexus impact:
  - `AiQueryService`: `MEDIUM`, 34 upstream impacts, 0 affected processes.
  - `PromptContextBuilderService`: `MEDIUM`, 32 upstream impacts, 0 affected processes.
- GitNexus detect changes:
  - 7 files, 12 symbols.
  - 6 affected execution flows.
  - risk level: `high`.
  - extra verification run because of this: backend build passed.
- Graphify was run with `graphify update .`.
  - warning repeated: existing graph 11474 nodes, rebuilt graph 5609 nodes.
  - `graphify-out/GRAPH_REPORT.md` was restored and not accepted into git.

### Next step

- Browser/manual flow:
  - upload `.hxl` from the customer ticket form.
  - ask a Hotinfo-specific AI diagnosis question.
  - verify AI answer references the system details.
  - create the ticket and verify `hotinfoSnapshot` is visible for support/admin.

## Follow-up - 2026-05-15 IFC Fallback Answer Quality

### Problem observed

- User asked in Turkish: `IFC aktarımında hangi ayarlar kritik?`
- Because model generation was delayed, deterministic fallback returned an English raw excerpt:
  - `The model response was delayed...`
  - source title plus `#### 2.2.2 IFC Export Stages`
- This was not useful for a customer-facing support answer.

### Change

- Improved deterministic fallback in `AiQueryService`:
  - supports locale variants such as `tr-TR`.
  - detects Turkish query language when explicit language is missing or malformed.
  - cleans Markdown headings/source wrappers from fallback excerpts.
  - adds an actionable Turkish IFC fallback checklist covering:
    - IFC send/export path.
    - exchange profile.
    - attribute mapping.
    - coordinates/length parameters.
    - element filter.
    - advanced geometry/quantity/element options.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
  - 2 suites passed.
  - 33 passed, 1 skipped.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed.
- Backend was restarted from the new build.
- Health check passed at `/api/v1/health`.

### Remaining note

- This improves the fallback path. The deeper product decision remains whether sync diagnosis timeout should be raised or whether the UI should communicate fallback mode more softly.

## Follow-up - 2026-05-15 DWG/DXF Fallback Source Hygiene

### Problem observed

- User asked in Turkish: `DWG/DXF export sırasında layer ve referans dosyaları nasıl korunur?`
- Customer fallback answer incorrectly drifted to the IFC checklist because fallback intent detection mixed the user query with retrieved source title/excerpt.
- Customer fallback also exposed raw `Kaynak:` and `İlgili pasaj:` lines, which is useful for traceability but not suitable as end-user support copy.

### Change

- `AiQueryService` now passes `showSourceDetails: isStaff` into deterministic fallback generation.
- Customer fallback answers no longer include raw source/passage lines; staff/admin fallback traceability is preserved.
- Turkish fallback intent detection now uses query-only intent for IFC/DWG/DXF/graphics-driver special cases.
- Added a DWG/DXF-specific Turkish fallback checklist for layer/katman, reference/XRef, export scope, scale/coordinates, and final viewer validation.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
  - 2 suites passed.
  - 34 passed, 1 skipped.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed.
- Backend and frontend were restarted:
  - backend: `http://localhost:4000/api/v1`
  - frontend: `http://localhost:3000`
- Live customer API check passed:
  - query returned `200`.
  - answer stayed on DWG/DXF.
  - `sources: []`.
  - answer text did not contain `Kaynak:` or `İlgili pasaj:`.

### Remaining note

- This fixes customer-facing fallback hygiene and one concrete DWG/DXF drift case. Broader RAG quality work should still evaluate retrieval source coverage and answer freshness with the planned regression question set.

## Follow-up - 2026-05-15 Live RAG Acceptance Closure

### Goal

- Decide whether the current support-first vendor PDF RAG corpus can be treated as stable enough to stop broad RAG changes.
- Use API-driven validation while preserving quota-safe pacing.

### Execution

- Ran `.ai/rag-quality/run-acceptance.mjs` against localhost API with 15000ms delay.
- Added `rag-tr-dwg-layer-reference-001` to the acceptance set because it represents the recently observed DWG/DXF layer/reference failure.
- Added `.ai/rag-quality/run-answer-smoke.mjs` for focused customer-facing `/ai/query?wait=true` answer checks.

### Retrieval results

- Initial live run:
  - 25 total.
  - 23 pass.
  - 2 fail.
  - 0 throttle / 429.
- New DWG/DXF layer/reference regression:
  - 1 total.
  - 1 pass.
- Effective current set:
  - 26 total.
  - 24 in-scope vendor PDF RAG checks pass.
  - 2 failures remain out-of-scope for vendor PDF RAG.

### Known out-of-scope failures

- `rag-tr-hotinfo-001`
  - Hotinfo is ticket-specific diagnostic context, not global vendor PDF RAG.
  - Keep outside vendor RAG acceptance unless a canonical Hotinfo PDF/TXT support source is approved.
- `rag-tr-no-ai-ticket-001`
  - AI-optional ticket creation is product/help flow content.
  - Move to product-flow acceptance, not vendor PDF RAG.

### Customer answer smoke

- Ran `.ai/rag-quality/run-answer-smoke.mjs` for:
  - `rag-tr-network-startup-001`
  - `rag-tr-graphics-driver-001`
  - `rag-tr-ifc-export-001`
  - `rag-tr-dwg-layer-reference-001`
  - `rag-tr-cross-lingual-001`
- Result:
  - 5 total.
  - 5 pass.
  - 0 source leaks.
  - 0 `NO_MATCH`.

### Decision

- Vendor PDF RAG can be considered stable for the current support-first corpus.
- Do not continue broad RAG refactors right now.
- Future source imports or retrieval/fallback changes should rerun:
  - `.ai/rag-quality/run-acceptance.mjs`
  - `.ai/rag-quality/run-answer-smoke.mjs` for a focused critical subset.

## Follow-up - 2026-05-15 Product Flow Acceptance Phase 1

### Goal

- Move the two out-of-scope RAG failures into product-flow validation:
  - Hotinfo diagnostic flow.
  - AI-optional ticket creation.
- Validate by API first before browser/UI work.

### Added

- `.ai/product-flow/README.md`
- `.ai/product-flow/acceptance-flows.json`
- `.ai/product-flow/run-product-flow-acceptance.mjs`
- `.ai/product-flow/results-2026-05-15-phase-1.json`
- `.ai/product-flow/results-2026-05-15-phase-1.md`

### API validation

- Ran `.ai/product-flow/run-product-flow-acceptance.mjs` against `http://localhost:4000/api/v1`.
- Result:
  - 9 total.
  - 9 pass.
  - 0 fail.

### Passed checks

- Backend health returned `200`.
- Customer uploaded `_hotinf_.hxl`; parsed profile included:
  - Allplan 2026.
  - Windows 11 24H2 build 26100.
  - NVIDIA RTX 4070.
  - `onedrive.exe` conflict signal.
- `/auth/me` returned persisted Hotinfo profile data.
- `/ai/query?wait=true` accepted Hotinfo context and returned a non-empty customer answer without leaking `_SEC.NSE`.
- Customer created a ticket without prior AI interaction:
  - created ticket `SUP-01018`.
  - `interactionId` remained `null`.
- Customer could read the created ticket.
- Admin could read the created ticket and confirm `hotinfoSnapshot`.
- Customer raw Hotinfo download was forbidden with `403`.
- Admin raw Hotinfo download returned `200` XML.

### Decision

- Faz 1 is complete.
- The product API supports Hotinfo context and AI-optional ticket creation.
- Next product-flow phase should verify the same behavior in the browser/UI:
  - customer uploads `.hxl`.
  - customer can create a ticket without AI.
  - admin sees the ticket and Hotinfo snapshot.
  - live notification behavior is checked.

## Follow-up - 2026-05-15 Product Flow Acceptance Phase 2

### Goal

- Verify the critical Hotinfo + AI-optional ticket flow through the real browser UI, not only API calls.
- Keep this as product-flow acceptance, separate from vendor PDF RAG quality.

### Added

- `.ai/product-flow/run-product-flow-ui-smoke.mjs`
- `.ai/product-flow/results-2026-05-15-phase-2-ui-20260515041454.json`
- `.ai/product-flow/results-2026-05-15-phase-2-ui-20260515041454.md`

### UI validation

- Ran `.ai/product-flow/run-product-flow-ui-smoke.mjs` through the frontend workspace against:
  - frontend: `http://localhost:3000`
  - backend: `http://localhost:4000/api/v1`
- Result:
  - 12 total checks.
  - 12 pass.
  - 0 fail.

### Passed checks

- Backend health returned `200`.
- Customer logged in through the UI as `e2e-customer@aluplan.com`.
- Customer opened `/tr/tickets/new`.
- Customer selected `ALLPLAN`.
- Customer uploaded a new `.hxl` through the UI.
- Customer selected `MEDIUM` priority.
- Customer filled the ticket subject/details.
- Customer skipped AI with `Doğrudan Talep Oluşturmaya Geç`.
- Customer created ticket `b5a609d2-1ff6-4a24-b589-6712534a362b`.
- Admin logged in through the UI as `admin@example.com`.
- Admin opened the ticket detail page.
- Admin saw the Hotinfo snapshot in the ticket detail sidebar.

### Notes

- The runner was hardened to avoid a false-positive where `/tr/tickets/new` matched a broad `/tr/tickets/` URL predicate.
- It now waits for the real `POST /api/v1/tickets` response and extracts the created ticket id.
- Live notification behavior was not included in this smoke result; treat it as the next product-flow sub-phase if it remains a priority.
- GitNexus `detect_changes` returned `No changes detected`.
- Graphify update was attempted, but it again warned about a smaller rebuilt graph (`5611` nodes vs existing `11474`); `graphify-out/GRAPH_REPORT.md` was restored and not committed.

## Follow-up - 2026-05-15 Customer Answer Quality Phase 3

### Trigger

- User tested: `How do I borrow a license temporarily from the license server?`
- Customer-facing AI diagnosis fell back to a raw excerpt-style answer.
- Admin Copilot draft produced a much better structured solution.

### Root cause

- Customer `/ai/query?wait=true` used synchronous generation with a short timeout.
- `AiQueryService.SYNC_DIAGNOSIS_GENERATION_TIMEOUT_MS` was `6000`.
- When the model timed out, deterministic fallback only had special handling for a few intents such as IFC, DWG/DXF, and graphics driver update.
- License borrowing had no structured fallback, so the customer saw a low-quality excerpt even though retrieval found the right document.

### Changes

- Increased synchronous customer diagnosis generation timeout from `6000ms` to `15000ms`.
- Added structured deterministic fallback for license borrowing intent in Turkish.
- Added structured deterministic fallback for license borrowing intent in English.
- Added regression coverage for both Turkish UI-language and English requested-language variants.

### Validation

- GitNexus impact for `AiQueryService`:
  - risk: `MEDIUM`
  - direct impacted files include AI controller, ticket service, AI query processor, AI copilot service.
- GitNexus `detect_changes` after edits:
  - risk: `high`
  - affected execution flows: 8
  - changed symbol area includes `AiQueryService`, `query`, and `streamQuery`.
- Targeted tests passed:
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Graphify update was attempted, but it again warned about a smaller rebuilt graph (`5613` nodes vs existing `11474`); `graphify-out/GRAPH_REPORT.md` was restored and not committed.

### Decision

- This is the first narrow step toward admin-quality customer answers.
- Retrieval is not the issue for this case; answer synthesis/fallback quality was the issue.
- Next improvement should generalize this from individual fallback intents into a shared customer/admin answer quality contract, but only after this narrow fix is live-tested.

## Follow-up - 2026-05-15 Answer Drift Reset Phase 4

### Trigger

- User observed that customer and admin answers use different structures and asked why the two sides do not use the same system.
- Live evidence:
  - customer answer now has a good structured fallback for license borrowing.
  - admin Copilot draft still drifted toward unrelated root-cause troubleshooting for a how-to question.

### Root cause

- Customer query flow used `MASTER_DIAGNOSIS_PROMPT`.
- Admin Copilot imported `MASTER_DIAGNOSIS_PROMPT` but then appended its own shortened `STEP 7` output block.
- The two paths did not share a single answer quality contract for:
  - exact user intent.
  - how-to vs outage diagnosis separation.
  - customer/admin core-answer consistency.
  - no raw source/excerpt leakage in customer answers.

### Changes

- Added `apps/backend/src/ai/ai-answer-contract.ts`.
- Added shared `buildSupportAnswerContractPrompt(...)`.
- Customer `AiQueryService` now builds system prompts through the shared contract.
- Admin `AiCopilotService` now builds system prompts through the same shared contract instead of its private shortened output block.
- Added tests:
  - `apps/backend/src/ai/ai-answer-contract.spec.ts`
  - `AiCopilotService` prompt now asserts the shared answer contract is present.

### Validation

- GitNexus impact before edits:
  - `AiQueryService`: `MEDIUM`
  - `AiCopilotService`: `LOW`
- GitNexus `detect_changes` after edits:
  - risk: `medium`
  - affected execution flows: 4
  - changed symbol area includes `AiQueryService`, `queryInternal`, `AiCopilotService`, and `generateDraft`.
- Tests passed:
  - `pnpm --filter @aluplan/backend test -- ai-answer-contract.spec.ts ai-copilot.service.spec.ts ai-query.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Graphify update was attempted, but it again warned about a smaller rebuilt graph (`5617` nodes vs existing `11474`); `graphify-out/GRAPH_REPORT.md` was restored and not committed.

### Decision

- This phase does not change retrieval, DB schema, embeddings, or provider routing.
- It resets customer/admin answer-format drift at the prompt-contract layer.
- Next live test should compare the same ticket question on both customer answer and admin ANN draft after backend rebuild/reload.

## Follow-up - 2026-05-15 Ticket Interaction Idempotency Phase 5

### Trigger

- User live-tested the improved customer answer for:
  - `How do I borrow a license temporarily from the license server?`
- Customer answer quality was acceptable and stayed on the license borrowing procedure.
- Creating a ticket from the same AI interaction failed with HTTP 500.

### Root cause

- `Ticket.interactionId` is intentionally unique in Prisma/DB.
- The frontend can retry ticket creation with the same `interactionId`.
- `TicketsService.create(...)` did not treat duplicate interaction ticket creation as an idempotent retry.
- Prisma `P2002` leaked as a 500:
  - `Unique constraint failed on the fields: (interaction_id)`.

### Changes

- `TicketsService.create(...)` now checks whether the AI interaction is already linked to a ticket before creating a new one.
- If the same user retries with the same interaction, the existing ticket is returned with `alreadyCreated: true`.
- A race condition on `interaction_id` uniqueness is also handled by catching Prisma `P2002` and returning the existing ticket when safe.
- Cross-user reuse of the same AI interaction is rejected with a controlled `BadRequestException`.
- New ticket UI now skips duplicate initial message/attachment upload when the backend returns `alreadyCreated: true`.

### Validation

- Targeted backend test passed:
  - `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Frontend typecheck passed:
  - `pnpm --filter @aluplan/frontend typecheck`
- Backend build passed:
  - `pnpm --filter @aluplan/backend build`
- Backend was rebuilt and reloaded on `localhost:4000`.
- Graphify/GitNexus:
  - `npx gitnexus impact TicketsService --direction upstream` could not run in the sandbox because npm registry access was blocked.
  - Graphify should still be attempted before commit; if the graph rebuild is smaller than the existing graph, restore `graphify-out/GRAPH_REPORT.md` and do not commit graph output.

### Decision

- This phase is not a RAG retrieval change.
- It removes a ticket-flow drift where an otherwise successful AI answer could not become a ticket because the interaction retry path was not idempotent.
- Next live validation: user should click ticket creation again from the same customer screen and verify it routes to the existing/new ticket without 500.

## Follow-up - 2026-05-15 Customer Dashboard 403 Cleanup

### Trigger

- User reported a browser console error before retesting ticket creation:
  - `API Error [403]`
  - stack pointed to `DashboardClient.useEffect.loadData`.

### Root cause

- Customer dashboard loaded three requests in parallel for every role.
- One request was `/api/v1/ai/health-metrics`.
- Backend correctly protects that endpoint with `ADMIN | SUPERUSER`.
- Customer users therefore received a valid 403, but frontend still produced console noise.

### Changes

- `DashboardClient` now computes user role before loading dashboard data.
- Customer/viewer users skip `api.ai.getHealthMetrics()`.
- Admin/superuser users still load AI health metrics.
- Dashboard spec now verifies:
  - customer role does not call `getHealthMetrics`.
  - admin role does call `getHealthMetrics`.

### Validation

- Frontend dashboard spec passed:
  - `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'`
- Frontend typecheck passed:
  - `pnpm --filter @aluplan/frontend typecheck`

### Decision

- Backend RBAC stays strict.
- This is a frontend role-aware data loading fix, not a security relaxation.

## Follow-up - 2026-05-15 Rich Message Composer MVP

### Trigger

- `.kiro/specs/rich-text-editor` ihtiyacı incelendi.
- Tam spec ilk faz için fazla büyük olduğu için güvenli MVP uygulandı:
  - ticket detayında admin/customer rich reply composer
  - AI Copilot markdown taslaklarını okunabilir HTML'e dönüştürme
  - backend allowlist sanitizasyon
  - Prisma migration olmadan mevcut `TicketMessage.message` alanında sanitized HTML saklama

### Changes

- Frontend:
  - `RichTextEditor` eklendi: TipTap `StarterKit`, placeholder, toolbar, `Ctrl/Cmd+Enter` ile gönderme.
  - `RichTextRenderer` eklendi: eski plain text mesajları bozmadan, rich HTML mesajları sanitize ederek render eder.
  - `ContentSanitizer` eklendi: sadece güvenli rich-text tag/attribute allowlist'ine izin verir.
  - `markdownToHtml` eklendi: AI Copilot draft başlık/list/bold/italic çıktısını editöre uygun HTML'e çevirir.
  - Ticket detay reply textarea yerine rich editor kullanır; macro ve ANN draft çıktıları editöre HTML olarak eklenir.
- Backend:
  - `AddMessageDto.contentFormat` opsiyonel `HTML | PLAIN_TEXT` kabul eder.
  - `message` uzunluk limiti 10.000 karaktere çıkarıldı.
  - Global `XssValidationPipe`, yalnızca `contentFormat: HTML` ve `message` alanında strict rich-text allowlist uygular.
  - Diğer string alanlarda eski HTML temizleme davranışı korunur.
  - `TicketsService.addMessage` kaydetmeden önce ikinci kez rich-text sanitizasyon yapar ve boş kalan mesajı reddeder.

### Validation

- Frontend targeted tests passed:
  - `pnpm --filter @aluplan/frontend exec vitest run src/lib/content-sanitizer.spec.ts src/lib/markdown-to-html.spec.ts src/components/ui/rich-text-renderer.spec.tsx src/components/ui/rich-text-editor.spec.tsx`
  - 4 files, 13 tests passed.
- Backend targeted tests passed:
  - `pnpm --filter @aluplan/backend test -- xss-validation.pipe.spec.ts tickets.service.spec.ts`
  - 2 suites, 18 tests passed.
- Typecheck passed:
  - `pnpm --filter @aluplan/frontend typecheck`
  - `pnpm --filter @aluplan/backend typecheck`
- i18n check passed:
  - `pnpm i18n:check`

### Decision

- First phase stores sanitized HTML in the existing `message` field.
- No Prisma `contentFormat` migration was added.
- Global XSS protection remains strict; rich HTML is a narrow exception for ticket message bodies only.
- `apps/backend/openapi.json` remains a separate drift and was not part of this phase.

### Next

- Manual smoke should verify:
  - admin formatted reply send/render
  - customer formatted reply send/render
  - ANN draft markdown becomes readable headings/lists in the editor
  - old plain text messages still render correctly
  - `<script>`, event attributes, and `javascript:` links do not persist or execute

## Follow-up - 2026-05-15 RAG Fallback + AI Operations Topology Plan

### Trigger

- Customer-facing AI diagnosis still fell back to raw-ish excerpts for unknown intents, even when retrieval found the right document.
- The system already has approved learning surfaces:
  - `/en/faq-learning`
  - `FaqEntry`
  - `TrainingQueue`
  - AI interaction feedback
  - high-CSAT ticket indexing
- A broader review showed AI operations UI is distributed across:
  - `/en/system-topology`
  - `/en/faq-learning`
  - `/en/admin/ai-intelligence`
  - `/en/admin/ai-health`
  - `/en/admin/settings?tab=ai`

### Decisions

- Do not create a second learning system.
- Connect published FAQ learning outputs into the main RAG retrieval path.
- Use product/category keywords as deterministic fallback signals, not only diagnosis/prompt context.
- Customer fallback answers must be structured support answers, not raw excerpts.
- Keep special high-quality fallback templates, but add a generic evidence-driven synthesis path for unknown questions.
- Align source topology stats with actual retrieval behavior.
- Treat AI Operations Dashboard consolidation as a separate frontend/ops debt phase after RAG/fallback stabilization.

### Planned Backend Work

- Add approved `faq_entries` to main search as a first-class `FAQ` source.
- Keep customer retrieval limited to published/public FAQ entries.
- Allow staff/admin retrieval to include internal approved FAQ entries where appropriate.
- Refresh FAQ `question_embedding` on approve/update using the active embedding version/dimension.
- Pass `DiagnosisResult` into deterministic fallback generation.
- Use matched product/category keywords, category names, and source title tokens when selecting fallback snippets.
- Ensure fallback answer text hides `[Dataset]`, file names, Document ID, raw URLs, and technical source metadata from customers.
- Enrich AI interaction context with source/fallback strategy details for AI health/intelligence dashboards.

### Restore Point

- Before product-code changes, create a dedicated docs/memory commit and restore checkpoint:
  - commit: `docs(memory): record rag fallback topology plan`
  - checkpoint branch: `restore/rag-fallback-before-integration-20260515`
- Existing `apps/backend/openapi.json` drift remains intentionally excluded.

## Restore Point - 2026-05-16 Customer/Agent RAG Answer Parity

### Trigger

- Customer tarafında RAG yanıtları fallback'e erken düşüyor ve admin Copilot yanıtlarından belirgin biçimde daha zayıf kalıyordu.
- Örnek: "Lisans sunucusunu yeni bir makineye taşımak istiyorum, süreç nedir?"
  - Customer: 15 saniye sonunda kısa/mixed-language deterministic fallback.
  - Admin: 60 saniyelik Copilot synthesis ile detaylı Türkçe prosedür.

### Implemented

- `AiQueryService` synchronous customer diagnosis generation timeout'u 15s -> 60s yapıldı.
- Cevap dili URL locale yerine soru diline göre belirlenir hale getirildi.
  - `/en` UI altında Türkçe soru Türkçe answer contract kullanır.
- Stale customer permission token sorunu için frontend API katmanı `403 Requires permission` durumunda bir kez refresh+retry yapacak şekilde düzeltildi.
- RBAC seed/auth refresh drift'i düzeltildi; CUSTOMER ve AGENT rolleri `ticket:read` dahil gerekli ticket izinlerine sahip.

### Validation

- Backend:
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts --runInBand`
  - `pnpm --filter @aluplan/backend typecheck`
  - `pnpm --filter @aluplan/backend build`
- Frontend:
  - `pnpm --filter @aluplan/frontend exec vitest run src/lib/api.spec.ts`
  - `pnpm --filter @aluplan/frontend typecheck`
- Runtime:
  - Backend restarted from fresh `dist/main`.
  - `/api/v1/health` returned `ok`.
  - Customer and admin WebSocket clients reconnected.
- User confirmed the latest customer flow works.

### Commits

- `74c859f fix(auth): restore customer ticket permissions`
- `457076a fix(frontend): refresh stale permission tokens`
- `3b7b82d fix(rag): align customer answer synthesis with agent flow`

### Restore Policy

- This point is considered a stable restore checkpoint for RAG customer/admin answer parity.
- `apps/backend/openapi.json` is still unrelated drift and must not be mixed into product/RAG commits.
- Graphify still warns that a fresh graph has about 5.6k nodes vs existing 11.4k nodes; graph output should not be force-overwritten until chunk/source mismatch is understood.

## Follow-up - 2026-05-16 CRM Live Delta Notifications

### Trigger

- Dynamics 365 delta sync was updating local account/contact records and writing `crm_change_logs`, but the admin experience still required watching the CRM page or pressing "Check CRM Updates" to feel confident.
- User expectation: CRM remains source of truth; support DB updates automatically; admins receive live notification and can see refreshed change history.

### Implemented

- CRM scheduled delta sync default interval changed from 15 minutes to 5 minutes.
- Existing backend `crm:changes` and `crm:sync_error` websocket events were connected to the global frontend notification listener.
- Admins now receive localized toast notifications for CRM account/customer changes and CRM sync errors.
- `/customers/crm` now listens for CRM websocket events and refreshes change history/connection status automatically.
- CRM persistent notification recipient lookup now accepts uppercase and lowercase role names, preventing admin notification misses caused by role-name casing.

### Validation

- Backend:
  - `pnpm --filter @aluplan/backend test -- notifications.gateway.spec.ts crm-record-sync.service.spec.ts`
  - `pnpm --filter @aluplan/backend typecheck`
  - `pnpm --filter @aluplan/backend build`
- Frontend:
  - `pnpm --filter @aluplan/frontend typecheck`
  - `pnpm i18n:check`
- Runtime:
  - Backend restarted from fresh `dist/main`.
  - `/api/v1/health` returned `200`.

### Notes

- Manual "Check CRM Updates" remains useful as an immediate force-check button.
- Automatic polling is still delta-poll based, not Dataverse webhook push. Webhook registration can be a later phase if true instant sync is required.
- Existing Resend `401 invalid API key` email queue noise is unrelated and should be handled in a separate email/config cleanup phase.

## Deployment Note - 2026-05-16 Email Branding Logo URLs

### Trigger

- Announcement and transactional email templates now use branding/contact settings dynamically.
- Uploaded logo must be visible inside real email clients, not only inside the admin UI preview.

### Must Remember Before Deploy

- Production must set a public HTTPS backend API URL:
  - `API_URL=https://api.<domain>/api/v1`
- This URL is used to build email-safe logo URLs such as:
  - `https://api.<domain>/api/v1/branding/assets/brand/logos/...`
- Do not use `localhost`, relative URLs, private network URLs, or temporary signed object-storage URLs for `branding.logo_url` in production.
- After deploy, upload/save the logo once from admin settings so `branding.logo_url` stores the new public URL shape.

### Deploy Verification

- Unauthenticated asset check:
  - `curl -I https://api.<domain>/api/v1/branding/assets/<logo-key>` should return a successful image response or a valid public redirect.
- Email HTML check:
  - Announcement and transactional email preview must contain `<img src="https://...">`, not `/api/...` or `http://localhost...`.
- Real inbox smoke:
  - Send one test announcement or transactional email to Gmail/Outlook and confirm the logo renders.

### Related Commit

- `798cc52 fix(email): use public branding logo urls`

## Follow-up - 2026-05-16 Remotion Promo Video

### Trigger

- User requested a 10-second dynamic motion graphic promo video using live application screenshots.

### Implemented

- Added isolated Remotion workspace app:
  - `apps/promo-video`
  - Composition: `AluplanPromo`
  - 10 seconds, 30 fps, 1920x1080, H.264 render target.
- Added screenshot capture helper:
  - `scripts/capture-promo-screenshots.mjs`
  - Captures login, dashboard, tickets, knowledge pool, AI intelligence, and AI settings screens from the running local app.
  - Uses backend login API to create browser cookies without printing tokens.
- Rendered output:
  - `apps/promo-video/out/aluplan-promo.mp4`
  - `apps/promo-video/out/preview.png`

### Validation

- Live app screenshots were captured from `localhost:3000` with backend auth from `localhost:4000`.
- Remotion still preview succeeded:
  - `pnpm --filter @aluplan/promo-video still`
- Full MP4 render succeeded:
  - `pnpm --filter @aluplan/promo-video render`
  - 300/300 frames rendered and encoded.

### Notes

- `ffprobe` is not installed in the shell, so duration was verified from Remotion composition/render output rather than external media probing.
- Backend `/api/v1/health` returned 503 during the session because storage threshold health was down, but auth and screenshot routes were usable.

## Deployment Readiness - 2026-05-17 Repo Hygiene and Env Blockers

### Completed

- Removed local agent/tooling dumps from Git tracking so they will disappear from the remote repository after push:
  - `.agent/`
  - `.agents/`
  - `.claude/`
  - `.gemini/`
  - `.kiro/`
  - `.opencode/`
  - `graphify-out/`
- Kept `.github/` because it contains CI, Dependabot, release, and drill workflows.
- Added ignore rules so local agent/spec/graph/promo artifacts do not re-enter Git.
- Added missing i18n labels for the AI model list UI.
- Updated deployment config docs/examples:
  - `.env.example`
  - `docker-compose.yml`
  - `docker-compose.staging.yml`
  - `docs/PRODUCTION_SECRETS.md`

### Validation

- `pnpm --filter @aluplan/backend test -- env-validation.spec.ts`
- `pnpm i18n:check`
- `docker compose --env-file /dev/null config` with production-like placeholder values.
- `docker compose --env-file /dev/null -f docker-compose.staging.yml config` with staging-like placeholder values.

### Current Deploy Blockers

- Live secrets were pasted into chat. Rotate before deploy/push:
  - database password/URL
  - Redis password/URL
  - OpenAI key
  - Groq key
  - Resend key
  - R2 access/secret keys
  - JWT secrets
  - encryption key
- Backend production env must add:
  - `API_URL=https://api.allplan.net.tr/api/v1`
- Backend production env must replace weak/short:
  - `JWT_SECRET` must be at least 32 characters and should be strong random.
- Backend production env currently includes:
  - `ALLOWED_ORIGINS=https://allplan.net.tr,http://167.86.84.107:8000`
  - Prefer only HTTPS production frontend origins. The raw HTTP IP origin is not suitable for a clean production launch.
- Frontend production env currently has:
  - `NEXT_INTERNAL_API_URL=http://backend-api:3001/api/v1`
  - Verify the Coolify internal backend service really listens on `3001`; current backend Dockerfile exposes `4000`.
- AI/RAG env currently points back to older 1536/OpenAI/Groq defaults:
  - `EMBEDDING_MODEL=text-embedding-3-small`
  - `GENERATIVE_MODEL=llama-3.3-70b-versatile`
  - `VECTOR_DIMENSIONS=1536`
  - Current stable direction is Gemini/LLMAPI with `gemini-embedding-2` and `3072` dimensions unless there is a deliberate migration plan.

### Safe Next Step

- Rotate exposed secrets first.
- Update Coolify backend/frontend env values from `.env.example`.
- Then run a staging deploy smoke:
  - health
  - login/me
  - ticket creation with and without AI
  - email logo public URL
  - CRM update check
  - RAG answer quality check

## Email Branding and KVKK Unsubscribe Hardening - 2026-05-17

### Completed

- Diagnosed why uploaded branding logo did not render inside email templates:
  - `branding.logo_url` was already saved as an absolute backend asset URL.
  - Production CORS was blocking requests that had no `Origin` header.
  - Email clients commonly fetch images without `Origin`, so the backend returned 500 for logo asset fetches.
- Updated backend CORS behavior:
  - Browser origins still use the allowlist.
  - No-origin requests are allowed so email clients, health checks, curl, and server-to-server asset fetches can reach public/signed-token endpoints.
- Added `/api/v1/email/unsubscribe` to CSRF bypass because it is a public signed-token action reached from email links.
- Hardened unsubscribe enforcement:
  - Email send path now checks both category preferences and global `ALL=false`.
  - Registered recipients get `data.userId` injected before queueing so generated unsubscribe URLs are user-specific instead of `global`.
- Added a lightweight unsubscribe survey:
  - `/[locale]/unsubscribe` now asks an optional reason and optional note.
  - TR/EN/DE copy is included for the page.
  - Backend stores reason/comment with user/email, user-agent, IP, and timestamp.
- Added Prisma migration:
  - `20260517000003_add_email_unsubscribe_feedback`
  - creates `email_unsubscribe_feedbacks`.

### Validation

- `pnpm --filter @aluplan/backend test -- email.service.spec.ts`
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm --filter @aluplan/backend typecheck`

### Deploy Smoke After Redeploy

- Re-test email logo:
  - `curl -I -L https://api.allplan.net.tr/api/v1/branding/assets/...`
  - expected: no backend 500; should return/redirect to a reachable image.
- Send a real announcement/test email and confirm the logo renders in Gmail/Outlook.
- Click unsubscribe link:
  - page should show optional reason/comment fields.
  - submit should succeed without login.
  - subsequent non-essential emails should be skipped when `ALL=false` exists.

### Follow-Up

- Decide whether `ALL=false` should suppress ticket/system transactional emails too, or only announcement/marketing-style mail. Current implementation follows the existing endpoint wording and blocks all categories.

## AI Settings and Embedding 400 Investigation - 2026-05-17

### Root Cause

- Dataset indexing errors saying `OpenAI HTTP 400` mean the embedding call was going through `OpenAiService.embed()`, not Gemini.
- The production/env defaults had an inconsistent combination:
  - `EMBEDDING_PROVIDER=OPENAI`
  - `EMBEDDING_MODEL=gemini-embedding-2`
  - `EMBEDDING_DIMENSIONS=3072`
- `text-embedding-3-small` cannot accept `dimensions: 3072`; OpenAI rejects this with HTTP 400.
- This also explains the UI confusion: selecting Gemini models in AI settings does not help if the active embedding provider/env still resolves to OpenAI.

### Completed

- OpenAI embedding requests now cap dimensions per OpenAI model:
  - `text-embedding-3-small` max 1536.
  - `text-embedding-3-large` max 3072.
  - legacy embedding models omit the `dimensions` parameter.
- Embedding provider env validation now accepts `GEMINI`, `LLMAPI`, and `OLLAMA`.
- Provider router now honors `EMBEDDING_PROVIDER=GEMINI` and `EMBEDDING_PROVIDER=LLMAPI`.
- Compose/env examples now default embedding provider to `GEMINI`, matching the current pgvector + Gemini direction.
- Gemini setting validation now requires `ai.gemini.embed_model` when Gemini is selected as the embedding provider.

### Validation

- `pnpm --filter @aluplan/backend test -- openai.service.spec.ts ai-provider-router.service.spec.ts env-validation.spec.ts`
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`
- `pnpm --filter @aluplan/backend typecheck`

### Production Follow-Up

- In Coolify backend env, use:
  - `EMBEDDING_PROVIDER=GEMINI`
  - `EMBEDDING_MODEL=gemini-embedding-2`
  - `EMBEDDING_DIMENSIONS=3072`
  - `VECTOR_DIMENSIONS=3072`
- In Admin AI settings, ensure:
  - `ai.embed_provider=gemini`
  - `ai.gemini.embed_model=gemini-embedding-2`
  - old `ai.openai.embed_model` can remain for fallback, but should not be the active embedding provider during Gemini indexing.

## Optional Crawl4AI URL Ingestion Sidecar - 2026-05-17

### Decision

- Current URL ingestion remains available as the safe default.
- Crawl4AI is added as an optional URL-to-markdown extraction sidecar for higher-quality web source ingestion.
- The sidecar is disabled by default to avoid unnecessary RAM use on the VPS.
- If Crawl4AI fails, times out, or returns weak content, the backend automatically falls back to the existing basic crawler.

### Completed

- Added backend Crawl4AI adapter in `CrawlService`.
- Added env validation for:
  - `CRAWL4AI_ENABLED`
  - `CRAWL4AI_BASE_URL`
  - `CRAWL4AI_API_TOKEN`
  - `CRAWL4AI_TIMEOUT_MS`
- URL sync now stores crawler provider metadata on `KnowledgeSource` and embedding metadata.
- Docker Compose now includes `crawl4ai` behind the `crawl4ai` profile.
- Default compose remains lightweight; sidecar starts only when explicitly enabled.

### Validation

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts knowledge-pool.processor.spec.ts env-validation.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `docker compose --env-file /dev/null config`
- `COMPOSE_PROFILES=crawl4ai docker compose --env-file /dev/null config`
- `git diff --check`

### Production Follow-Up

- For Coolify, only enable this after the current production fixes are deployed and stable.
- If enabled through Compose:
  - set `COMPOSE_PROFILES=crawl4ai`
  - set `CRAWL4AI_ENABLED=true`
  - keep `CRAWL4AI_BASE_URL=http://crawl4ai:11235`
- If enabled as a separate Coolify service:
  - point `CRAWL4AI_BASE_URL` to the internal service URL.
- URL ingestion should be tested with a single pilot URL before bulk web ingestion.

## Embedding Index Isolation Decision - 2026-05-17

### Decision

- Keep Gemini embedding as the active production embedding path because answer quality was validated against that corpus.
- Do not pretend provider normalization makes OpenAI/Gemini/Ollama vectors interchangeable.
- Use index isolation instead:
  - active provider/model/dim resolves to an `embedding_version`.
  - vector writes store that `embedding_version + embedding_dim`.
  - retrieval queries only search the active `embedding_version + embedding_dim`.
  - provider changes require a new index version and controlled reindex before activation.
- Qdrant is added to the roadmap for later benchmark/pilot, not for the pre-test delivery.

### Implementation Direction

- PostgreSQL/pgvector remains the production store.
- Vector columns should be unconstrained `vector` so Gemini `3072` and future provider dimensions can coexist physically.
- HNSW is skipped for active dimensions over pgvector's practical HNSW limit; exact search remains available for the current support-test corpus.
- Dedicated Qdrant migration should only happen after acceptance-set benchmark evidence and deployment/backup/monitoring planning.

## Production RAG / Dataset Upload Fixes - 2026-05-17

### What changed

- Production AI ticket/customer answer flow failed because the live `macros` table missed `deleted_at` while Prisma `Macro.deletedAt` and the global soft-delete filter expected it.
- Added migration `20260517000006_add_macro_deleted_at` and applied the same safe SQL live.
- A Turkish Workgroup Manager question fell back to German raw source text when Gemini response timed out.
- Added a deterministic Turkish Workgroup Manager fallback so `Workgroup Manager’da bilgisayar eklenemiyor...` returns Turkish support structure instead of leaking German excerpts.
- Removed raw fallback passage exposure from staff fallback detail; source title may remain, raw excerpt no longer appears.
- Dataset upload now supports multi-file selection with sequential upload, preserving quota-safe ingestion behavior.
- Knowledge pool upload/parser now accepts Word documents as `FILE_DOCX` via `mammoth` raw text extraction.

### Validation

- `pnpm --filter @aluplan/database db:generate`
- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts knowledge-pool-parser.service.spec.ts knowledge-pool-job.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`

### Deploy note

- Deploy backend for the RAG fallback and DOCX enum/parser changes.
- Deploy frontend for the bulk upload UI.
- Production DB has already received `macros.deleted_at`; the new DOCX enum migration will apply during backend deploy.

## AI Settings / Answer Tone Fixes - 2026-05-17

### Root cause

- Admin AI settings still allowed and persisted the deprecated `gemini-2.0-flash-exp` chat model.
- Gemini `v1beta generateContent` returns 404 for that model, which broke admin AI Copilot/ANN draft generation.
- Gemini model list UI could show a recommended model in the dropdown while the underlying setting state still held the old unsupported value.
- Customer fallback copy was technically useful but too mechanical for a corporate support experience.

### Changes

- Gemini service now normalizes deprecated `gemini-2.0-flash-exp` / `models/gemini-2.0-flash-exp` to `gemini-2.5-flash` before API calls.
- Production sync now repairs existing `ai.gemini.chat_model=gemini-2.0-flash-exp` records to `gemini-2.5-flash` during deploy.
- Admin AI settings model listing now updates the actual setting state to the recommended/supported model when the current value is unsupported.
- Removed the old Gemini "Flash 2.0 Exp" quick option from the UI and added `gemini-2.5-flash`.
- Added `ai.gemini.api_key` to frontend secret-save handling.
- AI answer contract now uses a warmer corporate support voice as "Aluplan AI Destek", while preserving grounding and no-hallucination rules.
- Customer AI answers now address the user by full name once when an authenticated user profile has `fullName`.
- Hotinfo modal no longer shows the raw JSON/kopyalama block; it keeps the structured Hotinfo view.

### Validation

- `pnpm --filter @aluplan/backend test -- gemini.service.spec.ts ai-query.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`

## CRM Placeholder Email / Hotinfo Display Fixes - 2026-05-19

### What changed

- CRM contacts without a real email still keep an internal placeholder user for relational integrity, but `no-email-...@internal.aluplan` is now hidden from customer list/detail API responses.
- Admin password reset for CRM contacts without a real email now fails safely instead of trying to send mail to the internal placeholder.
- Email recipient guard treats `internal.aluplan` placeholder recipients as reserved/blocked.
- Customer profile UI shows a localized "No email in CRM" label instead of the internal placeholder address.
- Hotinfo parser now handles collapsed dual-GPU strings like `NVIDIA ... / AMD ...` as separate GPU cards.
- Hotinfo parser now reads item-style GPU metadata for VRAM, RAM, resolution, driver date, and driver version.
- Hotinfo modal/header and GPU detail cards have more padding and more readable typography.

### Validation

- `pnpm --filter @aluplan/backend test -- customers.service.spec.ts hotinfo-parser.service.spec.ts email.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`

## AI Fallback Grounding Hardening - 2026-05-19

### Root cause

- The customer/admin answer quality regression was not a schema or deployment revert.
- When the model path timed out or returned no-knowledge, the deterministic fallback path was still allowed to:
  - use canned topic summaries even if the retrieved source did not directly cover the topic,
  - expose source labels in staff/customer fallback output,
  - replace admin no-knowledge drafts with raw "strongest match" excerpts.
- This made unrelated sources look authoritative, for example IFC answers citing licensing/virus-scanner FAQs.

### What changed

- Customer fallback now requires direct query/source topic coverage before producing any deterministic answer.
- Turkish canned fallback summaries now only fire when the retrieved evidence contains the matching topic signal.
- Staff-visible customer fallback no longer appends `Kaynak:` labels in the generated answer body.
- Admin Copilot fallback no longer turns no-knowledge into raw excerpt summaries; it returns a safe manual-review message unless the evidence directly supports the canned Workgroup/license procedure.
- Regression tests cover unrelated IFC/licensing source leakage and admin raw-excerpt fallback.

### Validation

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts ai-copilot.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `git diff --check`

## Live Verification Follow-up - 2026-05-19

### What changed

- Live deploy verification confirmed backend and frontend were running commit `4a4c372`.
- Customer/admin AI query smokes returned structured answers without raw `Kaynak:`/strongest-match excerpt leakage.
- Live customer ticket creation failure was traced to backend validation: `subject must be shorter than or equal to 255 characters`.
- New ticket UI now enforces the 255-character subject limit with a localized validation message and character counter before advancing.
- Legacy Hotinfo snapshots with a collapsed dual-GPU name now split into two GPU cards at render time, so old tickets also show `1/2 Graphics Card / GPU`.

### Validation

- Browser smoke opened the live new-ticket page and confirmed the form flow is reachable.
- Live API smoke created a customer-role ticket (`SUP-00087`) with a valid short subject and then cleaned it up by soft-delete.
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`
- `git diff --check`

## Generic Web Crawler Candidates - 2026-05-19

### What changed

- Existing Knowledge Pool URL ingestion keeps the single-URL sync path, but the URL modal now also supports a controlled "crawl subpages" mode.
- Generic web discovery uses the shared Crawl4AI/basic crawler path, follows same-domain links with safe defaults, and writes discovered pages/PDFs to `crawl_candidates` as `generic_web`.
- Crawler candidates can now be filtered by source (`All`, `Learn Now`, `Generic Web`) and show the source domain plus discovered-from URL.
- LearnNow discovery falls back to Crawl4AI markdown links when the static search page does not expose usable anchors.
- Crawl4AI config handling now accepts boolean `CRAWL4AI_ENABLED` values from validated config.

### Validation

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts learnnow-crawler.service.spec.ts generic-web-crawler.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`
- `git diff --check`

## Follow-up - 2026-05-20 Hotinfo VRAM Tespiti Çözüm Planı (Seçenek A - AI Yönlendirmesi)

### What changed

- Harici ekran kartının VRAM bilgisi XML'de bulunamadığında (uyku modundayken Hotinfo oluşturulduğunda), VRAM değeri `Bilinmiyor (Kart Uyku Modunda)` olarak işaretlendi.
- AI sistem prompt'u güncellendi: Ekran kartının VRAM değeri `Bilinmiyor (Kart Uyku Modunda)` ise, AI kesin donanım tanısı koymayıp, kullanıcıdan Allplan'ı açarak ekran kartını aktif hale getirip Hotinfo'yu yeniden yüklemesini rica edecek.

### Verification

- `pnpm --filter @aluplan/backend test -- hotinfo-parser.service.spec.ts prompt-context-builder.service.pbt.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `gitnexus detect_changes` (attempted)

## Live Chat Policy + AI Ticket Trace - 2026-05-20

### What changed

- Customer-initiated live chat requests are now server-side gated: only VIP customers can move a ticket chat status to `REQUESTED`.
- Support staff can still start or accept live chat regardless of customer VIP status, preserving the intended proactive support workflow.
- Ticket creation now marks linked `AiInteraction.ticketCreated=true`, including idempotent/reused ticket paths.
- Added a staff-only `GET /tickets/:id/ai-trace` endpoint with interaction telemetry, language/source/contract checks, source-leak detection, and recent message context.
- Ticket detail UI now shows an AI Ticket Trace card for support users and disables customer live-chat request controls when the ticket creator is not VIP.

### Validation

- `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`

## Follow-up - 2026-05-21 Inbound Reports, AI Trace Locale, and URL Source Names

### What changed

- DMARC/authentication aggregate reports and feedback reports are ignored before inbound email/webhook ticket creation.
- AI interactions now persist request locale, route locale, profile language, response language, strict language, and generation state for trace diagnostics.
- Staff ticket detail AI Trace now displays route locale and profile language.
- Direct Knowledge Pool URL sync preserves the admin-provided source/article name and stores crawler/page titles in metadata, preventing generic `LEARNNOW Allplan` titles from replacing the visible source name.

### Validation

- `pnpm --filter @aluplan/backend test -- email-bounce.util.spec.ts email-inbound.service.spec.ts omni-channel.service.spec.ts`
- `pnpm --filter @aluplan/backend test -- knowledge-pool.processor.spec.ts knowledge-pool-job.spec.ts`
- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`
- `git diff --check`

## Follow-up - 2026-05-21 LearnNow URL Visual Evidence Ingestion

### What changed

- URL crawler results now include discovered content image references from static HTML and Crawl4AI markdown.
- New `VisualContentService` selects non-decorative article images, fetches them with safe limits, summarizes them through the existing multimodal AI dispatcher, and appends useful summaries to the text sent into Knowledge Pool embeddings.
- Visual summaries are cached in `KnowledgeSource.metadata.visualSummaries` and image references are stored in metadata, preparing the next UI step where AI answers can show original source visuals alongside text.
- Retrieval results now carry `visualSummaries`, and AI query responses can return a `visuals` array for matched URL/document sources.
- Vision enrichment is bounded by env defaults: enabled, max 4 images/source, 2 MB/image, same host only, timeout guarded. Failures skip visual enrichment without failing the URL sync.

### Validation

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts visual-content.service.spec.ts knowledge-pool.processor.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `git diff --check`

## Follow-up - 2026-05-21 LearnNow Public Format Discovery

### What changed

- LearnNow crawler discovery now supports the public resource filters `knowledge_article`, `pdf`, `technical_manual`, `explaining_video`, and `recorded_online_session`.
- `knowledge_article` remains the default article path and PDF remains the dedicated PDF import path.
- Non-PDF LearnNow formats are staged as `KNOWLEDGE_ARTICLE` candidates so the existing review/import/sync pipeline stays unchanged.
- Candidate metadata preserves the original LearnNow source type, so admin review and future RAG provenance can distinguish articles, manuals, videos, and recorded sessions.
- The Knowledge Pool crawler UI now exposes all five public format toggles in Turkish, English, and German.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Next

- Phase 2 should inspect LearnNow detail pages for image assets and video transcript availability before importing visual/video content into RAG answers.

## Follow-up - 2026-05-21 Ticket Routing Foundation

### What changed

- Customer ticket creation now asks for support category/department before product selection.
- The selected department is submitted as `departmentId`, so ticket SLA and routing have an explicit department anchor.
- The shared ticket schema now includes optional `departmentId` for frontend/backend DTO alignment.
- Auto-assignment no longer assigns departmentless tickets or falls back to global support agents.
- Auto-assignment only considers active users in non-archived teams where `autoAssignmentEnabled=true` and the team belongs to the ticket department.

### Verification

- `pnpm --filter @aluplan/backend test -- auto-assignment.service.spec.ts tickets.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Note

- This phase is local-only until the remaining routing/admin team phases are complete and explicitly pushed.

## Follow-up - 2026-05-21 Assignment UI Guardrails

### What changed

- Ticket detail now asks the backend for ticket-scoped assignable agents instead of loading the global agent list.
- The new `GET /tickets/:id/assignable-agents` endpoint returns only active non-customer users who belong to a non-archived team for the ticket department.
- Ticket assignment dropdown now shows agent e-mail addresses to make same-name accounts distinguishable.
- Team member add dialog now uses a searchable combobox and loads only staff/agent users instead of all users, preventing CRM/customer records from appearing in support-team assignment.
- Team detail member cards now display member e-mail addresses under the name so duplicate identities are visible before editing team membership.
- Team member removal now uses the app dialog/toast design instead of the browser-native `confirm()` prompt.
- `teams.roles.*` labels were added for TR/EN/DE so role dropdowns render localized role names instead of raw i18n keys.

### Verification

- `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts tickets.controller.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Live finding

- Production has two `Melih Dinekli` identities: `melih@aluplan.com.tr` is the staff/admin account, while `melihdinekli@gmail.com` is a CUSTOMER account currently present in the `Teknik Destek` team. The team should be corrected from UI by removing the customer identity and adding the staff e-mail.
- Live API smoke found `/users?type=agent` was returning overly broad user records, including fields that are not needed by the UI. `UsersService.findAll()` was narrowed to safe summary fields only and now maps role data into a frontend-compatible `userRoles` shape without exposing hashes, raw CRM payloads, or Hotinfo raw data.

## Follow-up - 2026-05-23 AI Answer Quality Guardrail Hotfix

### What changed

- Expanded no-knowledge detection so Turkish/English/German "not enough reliable content" answers are routed as runtime `NO_MATCH` instead of being persisted as successful MEDIUM/HIGH auto-answers.
- Removed the overly broad `destek talebi oluştur` no-knowledge trigger because it incorrectly marked otherwise useful answers as unusable.
- Added answer-language leak detection and a repair pass: if the UI language is English/German/Turkish but the LLM body leaks another language, the backend asks the model to rewrite the same answer in the selected UI language without adding facts.
- Added safe crash/freeze triage for queries like `Allplan kilitleniyor`; it avoids unrelated source attribution, returns LOW confidence, keeps `suggestTicket=true`, and asks for Hotinfo/screenshots/exact steps.
- No-knowledge and safe operational triage responses no longer attach unrelated source metadata to customer-facing answer results.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-answer-quality.spec.ts ai-query.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Deployment note

- Backend deploy is required for the AI quality fix. Frontend deploy is not required for this backend-only guardrail change.

## Follow-up - 2026-05-23 Support Answer Orchestrator

### What changed

- Added `SupportAnswerOrchestrator` as the shared answer-generation decision layer for customer AI diagnosis and admin ANN/Copilot drafts.
- Centralized LLM draft generation, ranking-payload reformat fallback, timeout/empty response fallback, no-knowledge-with-context fallback, and language repair policy.
- Customer `AiQueryService` now delegates final answer generation and language repair to the orchestrator instead of owning a separate generation path.
- Admin `AiCopilotService` now delegates final draft generation and language repair to the same orchestrator, while preserving linked customer-answer grounding and grounded draft fallbacks.
- Ticket creation step 2 now exposes screenshot/file selection before AI diagnosis, so screenshots can be sent into the first AI answer instead of only being attached after ticket creation.

### Verification

- `pnpm --filter @aluplan/backend test -- support-answer-orchestrator.service.spec.ts ai-answer-quality.spec.ts ai-copilot.service.spec.ts ai-query.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Note

- This closes the prompt-only parity gap: previous work shared the prompt contract, but customer/admin still had separate orchestration behavior. The shared orchestrator is now the production path for final answer/draft generation policy.

## Follow-up - 2026-05-23 Customer ANN-Quality Synthesis

### What changed

- Customer ticket-opening AI now explicitly uses the same analytical depth target as admin ANN drafts instead of a quick match-summary posture.
- `SupportAnswerOrchestrator` now retries no-knowledge model responses through an ANN-style second-pass synthesis before using any deterministic fallback.
- Customer sync diagnosis timeout was increased to 120s and wait-mode no-knowledge recovery gets two synthesis attempts.
- Ticket-opening prompt now forbids broad category labels as the problem topic and instructs the model to inspect screenshots/files before refusing.
- Ticket-opening UI now shows a compact “answer is being synthesized” state with source, attachment, and final-answer progress cues instead of implying a fast search.

### Verification

- `pnpm --filter @aluplan/backend test -- support-answer-orchestrator.service.spec.ts ai-query.service.spec.ts ai-answer-quality.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Deployment note

- Backend deploy is required for the ANN-quality synthesis behavior.
- Frontend deploy is required for the new synthesis wait UX and translations.

## Follow-up - 2026-05-24 Operations Dashboard Modal Filters

### What changed

- Dashboard pulse modals now consume real backend `pulse.details` segment data instead of rendering decorative filter labels.
- Ticket, AI, CRM, and Knowledge modal controls are clickable segment buttons with active state and selected-slice metrics, trend points, records, and summaries.
- Backend ops dashboard now returns segment payloads for ticket 7d/24h/30d/department views, AI provider/language/problem-trace views, CRM failed/missing-email/account-matching views, and Knowledge LearnNow/review/failed-import views.
- CRM dashboard records now avoid exposing raw `rawCrmPayload` snippets in modal summaries; CRM payload changes are shown as a readable update label.
- Frontend regression coverage now verifies that a pulse modal segment click changes the rendered records instead of staying decorative.

### Verification

- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Backend deploy is required for the new `pulse.details` data contract.
- Frontend deploy is required for clickable modal segment controls and localized metric labels.

## Follow-up - 2026-05-24 Operations Dashboard CRM/Workspace Closure

### What changed

- Fixed CRM modal customer links by routing contact change records to the owning `User.id` instead of the `CustomerProfile.id`; this resolves the Deniz Doğan "account not found" path.
- CRM modal records are grouped by local customer/account identity so field-level Dynamics changes no longer appear as repeated raw payload rows.
- Pulse modal segment controls now show the actual selected slice result. Empty slices stay empty instead of falling back to generic records, so filters like failed-only, missing-email, and review-required are no longer misleading.
- Operations Workspace removed the redundant AI Health tab and now focuses on Overview, CRM, Knowledge Pool, and LearnNow.
- CRM, Knowledge Pool, and LearnNow workspace tabs now follow the mockup intent more closely with decision-oriented metric panels, progress signals, and linked record lists.
- LearnNow workspace uses current real schema fields (`KNOWLEDGE_ARTICLE`, `PDF`, status counts) instead of placeholder media format labels.

### Verification

- `pnpm i18n:check` passed.
- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `pnpm --filter @aluplan/frontend build` passed.

### Deployment note

- Deploy backend first for the corrected CRM modal link/grouping contract.
- Deploy frontend after backend for the fixed modal filter behavior and updated workspace layout.

## Follow-up - 2026-05-24 Operations Dashboard Segment Clarity

### What changed

- Pulse modal segment controls now display their record counts directly on each segment button.
- Active modal segments now use the backend-provided decision title/description, so slices like LearnNow review or failed imports explain the selected filter instead of showing a generic dashboard summary.
- Added a frontend regression that opens the Knowledge Flow modal, switches to an empty failed-import slice, and verifies the selected slice stays explicit with an empty state.

### Verification

- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Frontend deploy is sufficient for this segment clarity fix.

## Follow-up - 2026-05-24 LearnNow Public Crawl Boundary

### What changed

- LearnNow crawler discovery now rejects enrollment/course-layer pages such as `course/view`, `course/preview`, and generic `mod/page` links from automatic staging.
- Public automatic discovery is limited to safe LearnNow How To resources and PDF/manual resource links.
- Discovery now checks existing Knowledge Pool sources by URL and content hash and stages matches as `SKIPPED_DUPLICATE` instead of re-importable candidates.
- Article imports now persist the candidate content hash on the Knowledge Source, so future duplicate hash checks can catch equivalent content.
- Knowledge Pool crawler UI now explains the public-only LearnNow boundary, the e-learning manual-import path, and duplicate controls in TR/EN/DE.
- Duplicate candidates show their rejection reason and cannot be imported again from the candidate table.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Backend deploy is required for the public-only LearnNow crawl boundary and discovery-time duplicate checks.
- Frontend deploy is required for the crawler UI guidance and duplicate-reason display.

## Follow-up - 2026-05-24 RAG Source Applicability Guard

### What changed

- Added a retrieval applicability multiplier so legacy Softlock / old Allplan 2006-2014 license documents cannot win HIGH confidence for modern license transfer or upgrade questions only because the title is lexically similar.
- Modern license transfer sources such as Product Key / CodeMeter transfer guidance now outrank old Softlock documents for queries like "Bilgisayarıma format attım. Allplan lisansımı yeni bilgisayarıma nasıl aktarabilirim?"
- Explicit legacy queries such as "Allplan 2012 Softlock..." still keep Softlock sources eligible, so the guard does not delete valid old-version support.
- Added an answer-contract rule preventing AI answers generated inside an existing ticket or agent draft from telling the user/admin to create another support request.

### Verification

- `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts ai-answer-contract.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `git diff --check` passed.

### Deployment note

- Backend deploy is required for the applicability guard and answer contract rule.

## Follow-up - 2026-05-25 AI Visual Evidence Rendering

### What changed

- Customer ticket-opening AI answers now preserve the backend `visuals` payload and render approved source images below the synthesized answer.
- Admin AI Support Navigator now uses the same visual evidence card, so LearnNow and future visual-capable sources can show images consistently.
- Added localized visual-evidence labels for TR/EN/DE.

### Verification

- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Frontend deploy is required for actual image cards to appear in the AI answer UI. The backend visual payload fix was already pushed separately.

## Follow-up - 2026-05-28 Admin Copilot Visual Evidence Parity

### What changed

- Admin ANN/Copilot draft responses now return visual evidence from the linked ticket-opening AI interaction.
- If the interaction does not already contain visuals, Copilot can fall back to the matched Knowledge Source metadata images/visual summaries.
- Ticket detail now renders draft visual evidence as separate cards above the reply composer, instead of embedding image URLs into the draft text.
- Visual evidence labels were added for Turkish, English, and German.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-copilot.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Deploy backend first so `/ai/copilot/draft/:ticketId` returns the `visuals` payload.
- Deploy frontend after backend so admin ticket detail renders the draft visual evidence cards.

## Follow-up - 2026-08-06 BULGU-10 Local Migration Recovery

### What changed

- Restored `0_add_ticket_number_seq` and `20260219151110_init_reset` to their production-shadow ledger-matching Git contents.
- Added `20260314900000_restore_crm_foundation` before the first CRM-dependent migration to recover missing RBAC, CRM, and AI response-cache foundations on fresh installs.
- Added a read-only migration integrity verifier, a canonical SHA-256 manifest for all 49 migration files, and a pre-deploy file gate; fresh PG17 deploy/status/ledger integrity remain blocking in CI.

### Verification

- Fresh disposable PG17: 49/49 migrations, no pending migration on the second deploy, integrity gate passed.
- Sanitized production-shadow clone: new migration applied, 49 distinct successful migrations, integrity gate passed, business row fingerprints unchanged.
- Prisma validate, monorepo typecheck, and backend full test suite passed (`116/116` suites, `1020/1021` tests passed, one skipped, zero failed).
- Pre-change restore tag and verified bundle point to `dfd5eccb`.

### Boundary and next action

- No production connection, migration, restore, push, tag push, or deploy occurred.
- The new migration remains pending for production and requires a separately approved maintenance window.
- Pre-existing full `schema.prisma` drift remains a separate follow-up; do not claim exact fresh-schema parity yet.

## Follow-up - 2026-08-05 Repo Consolidation Baseline And BULGU-23 Console Cleanup

### What changed

- Active work continued only in `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-support-desk-v02-main-live-site` after repo consolidation.
- Recorded the local consolidation baseline commit in `codex-claude-ortak-rapor.md`.
- Added `apps/backend/src/common/utils/cli-logger.ts` and moved backend CLI/diagnostic helper output from direct `console.*` calls to Nest `Logger` through `createCliLogger(...)`.
- Replaced remaining direct console calls in helper scripts, including `raw-sync.js`.
- Removed `raw-sync.js` hardcoded Postgres URL and personal dataset path; the script now requires `DATABASE_URL` and uses `DATASET_DIR` with a relative fallback.
- Adjusted one RAG utility spec fixture string so raw `console.*` scans do not report a non-call test snippet.

### Verification

- `pnpm --filter @aluplan/backend lint` passed with 0 errors and existing warnings only.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `git diff --check` passed.
- Direct-call scan for `console.log/warn/error/info/debug/trace/dir/table(` under `apps/backend/src` returned no direct calls.
- Raw `console.` scan only reports `console.x.ai/billing` URL strings in `generic-openai.service.ts`.

### Notes

- Push remains forbidden unless the user explicitly requests it.
- Next safe local technical target is stabilizing `ai-pipeline-optimization.pbt.spec.ts` with deterministic seed/failure-seed handling.

## Follow-up - 2026-08-06 Post-Faz-7 DR, Migration And Auth Closure

### What changed

- Added direct structural comparison and migration-effect audit tooling, exact allowlist payloads, repeatable-read snapshots, and a root-level Faz 8 production runbook.
- Restored the already-applied foundation migration to its immutable canonical checksum; no historical applied migration remains modified.
- Added the new auth-state migration with action-token hashes, verification/password-reset cooldown timestamps, and durable session version.
- Hardened login/refresh cookies, verification/reset token contracts, account-state binding, resend cooldown/rollback, password-reset/refresh race handling, and URL-fragment token transport.
- Removed plaintext registration passwords from welcome-email payloads.

### Verification

- Fresh PG17 and sanitized production-derived clone: 51/51 migrations and migration-integrity gate passed.
- Direct DB comparison: 0 blocking, 4 exact allowlisted, 93 informational column-order differences.
- PRE read-only audit against the original shadow: 49 historical migrations, 1190 parsed effects, the expected 7 ghost effects and one pending foundation ledger entry. POST audit against its migrated disposable clone: 0 ghost, 0 pending/failed, 0 shadow-only. Exact definitions remain the separate comparator's responsibility.
- Backend full suite: 116/116 suites, 1051 passed, 1 skipped, 0 failed. Frontend unit suite: 24/24 files and 217/217 tests passed.
- Backend/frontend typecheck, i18n, Prisma validate/generation, migration manifest, shell syntax and `git diff --check` passed. Playwright discovery listed 60 tests in 21 files.
- Three-run current migration measurements on the sanitized PG17 clone stayed below 11 ms per migration without lock contention. A verified `users` AccessExclusiveLock caused Prisma to exit non-zero in 5.946 seconds when timeout was delivered through the URL `options` parameter; no application start was attempted. Shell `PGOPTIONS` was rejected as an unreliable assumption after it failed to affect Prisma.

### Boundary

- No production DB/Redis connection or mutation, deploy, push, tag-push or publish occurred.
- Production migration and live secret rotation remain user-controlled maintenance-window work.

## Follow-up - 2026-08-06 Knowledge Pool URL Duplicate Prevention

### What changed

- Added a conservative, deterministic Knowledge Source URL canonicalizer.
- Manual URL creation and LearnNow article import now share one transaction/advisory-lock writer, preventing equivalent concurrent submissions from creating two URL sources.
- Duplicate attempts create no record and enqueue no second sync job.
- URL DTO validation now requires URL values for URL sources, validates any supplied URL, and bounds name/URL length.
- Removed raw submitted-URL retention and internal source IDs from duplicate error responses.
- Added localized duplicate feedback and native URL input semantics to the Knowledge Pool modal.

### Verification

- TDD RED failures were observed before implementation.
- Focused backend: 4/4 suites, 39/39 tests passed.
- Full backend: 118/118 suites, 1067 passed, 1 skipped, 0 failed.
- Frontend unit: 25/25 files, 219/219 tests passed; focused duplicate helper 2/2 passed.
- Backend/frontend typecheck, TR/EN/DE i18n integrity, and `git diff --check` passed.
- Independent code and security re-reviews approved with no current-diff Critical/High blocker.

### Boundary

- Existing duplicate data was preserved unchanged; no cleanup or migration was run.
- No production/shadow mutation, push, tag-push, deploy, or publish occurred.
- Pre-existing SSRF risk remains separately open; indexed canonical identity is a future scalability/migration task.

## Runtime Hotfix - 2026-08-06 Prisma Advisory Lock And Knowledge Pool Messages

- User browser smoke exposed Prisma `P2010`: `pg_advisory_xact_lock()` returned PostgreSQL `void`, which Prisma could not deserialize.
- The query now projects `pg_advisory_xact_lock(...) IS NULL AS locked`; the blocking transaction lock still executes while Prisma receives a supported boolean value.
- A real Prisma transaction against local dev PG17 returned `{ok:true,rowType:"boolean"}` without changing application data.
- Missing `admin.knowledge_pool.crawler.public_notice_title` and `public_notice_desc` keys were added for TR/EN/DE; a namespace regression test now checks all three locales.
- Focused backend 20/20 and frontend 5/5 tests, backend/frontend typecheck, i18n, and independent code/security reviews passed.
- Hotfix commit: `6e280ea8`. No production/shadow mutation, push, or deploy occurred.

## Follow-up - 2026-08-06 AI Solution History And FAQ Provenance

### What changed

- Preserved `/kb-approvals` as the FAQ publication queue and added a separate `/admin/ai-interactions` history for the exact customer question and AI solution shown before ticket creation.
- Added paginated ticketed/ticketless, confidence, free-text and exact UUID filters; raw context, attachments, token/cost fields and unused customer text are excluded from FAQ provenance responses.
- Added dedicated `ai-interactions:read` and `faq:review` permissions. Customer/Viewer access is denied; existing Support Manager/KB Editor FAQ-review behavior is preserved without granting AI-history access.
- Added normalized FAQ provenance for tickets and AI interactions. Duplicate updates plus provenance writes are transactional and interaction-derived FAQ candidates cannot auto-publish.
- Added safe Markdown/HTML rendering for stored AI answers and exposed the same answer in the staff-only ticket AI trace after ticket-scope authorization.
- Added privacy-safe read audit records and capped FAQ pagination at 100.

### Verification

- Backend full suite: 119/119 suites, 1083 passed, 1 skipped, 0 failed.
- Frontend unit suite: 28/28 files, 227/227 tests passed.
- Final focused checks: backend 22/22 and frontend 4/4 passed after data-minimization changes.
- Backend/frontend typecheck, TR/EN/DE i18n, Prisma validate, migration status and `git diff --check` passed.
- Pre-migration local dump restored into a disposable PG17 DB; all 53 migrations applied and counts stayed 1282 users / 162 tickets / 259 AI interactions / 29 FAQs / 0 inferred legacy provenance rows.
- Independent code and security re-reviews approved with no remaining Critical/High blocker in this feature diff.

### Boundary

- Production/shadow DB and production Redis were not contacted or mutated. No push, tag-push, deploy or publish occurred.
- Legacy FAQ provenance was intentionally not guessed. Existing rows remain unchanged and display an explicit unknown-source state.
- `packages/database/scripts/production-sync.js` remains unmodified and must not be run in production because of a pre-existing hardcoded admin-password/user-reactivation risk tracked outside this feature.
- Post-feature restore point: commit `348411c5`, tag `restore/after-ai-interaction-visibility-20260806-348411c5`, verified complete-history bundle `.private-data/restore-points/post-ai-interaction-visibility-348411c5.bundle`, SHA-256 `222067a628f8cf5cd2d1817bc5c381a7030aca6e5658a7ed703f2a6eb56fd28a`.

## Follow-up - 2026-08-06 Production Boot And Migration Safety

### What changed

- Added an append-only migration-manifest writer that refuses modified, deleted, malformed, or non-forward migration history; CI retains read-only blocking verification.
- Added the data-preserving FAQ provenance timestamp-default alignment migration and advanced the canonical manifest to 54 migrations.
- Replaced divergent production entrypoints with one executable fail-closed deployment script. Normal boot now contains only migration verification/deploy, ledger verification, and API start.
- Removed automatic production data synchronization, role repair, admin bootstrap, direct DDL, and migration-ledger rewriting from application boot.
- Made database seed and manual production sync explicit opt-in maintenance operations; production E2E seeding, implicit credentials, mass user reactivation, and legacy admin mutation are blocked.
- Removed tracked `extracted_users.json` while preserving its ignored local copy, and removed the historical embedded credential from the current tracked tree.

### Verification

- Ops safety 15/15; backend 119/119 suites with 1083 passed and 1 skipped; frontend 28/28 files with 227/227 tests.
- Backend/frontend and focused seed typechecks, i18n, shell/Node syntax, frozen-lock install, migration manifest 54/54, local ledger/relations, schema parity, and diff checks passed.
- Local migration counts remained 1282 users / 162 tickets / 259 AI interactions / 29 FAQs / 0 FAQ provenance rows.
- Independent code, security, and TDD reviews approved with no Critical/High blocker.

### Boundary

- Product/ops commit: `6759b077`.
- Docker image build remains unproven because registry networking failed before the source build stage; release-environment image smoke is still required.
- No production/shadow connection, push, tag-push, deploy, publish, or live secret rotation occurred.

## Runtime Hotfix - 2026-08-06 Dashboard Strict Mode Loading Loop

### What changed

- Fixed the local Next.js development Dashboard remaining indefinitely in its loading state after React Strict Mode replayed mount effects.
- The Dashboard mount effect now restores `mountedRef.current = true` during setup before cleanup marks it false.
- Added a Strict Mode regression that reproduces the original infinite-loading behavior and verifies that the admin Dashboard renders after asynchronous data loading.
- Strengthened the existing loading assertion so a missing pulse element can no longer pass as a false positive.

### Verification

- TDD RED was observed before the product fix: 1/9 Dashboard tests failed with the loading pulse still mounted.
- Focused Dashboard suite passed after the fix: 9/9.
- Full frontend unit suite passed: 28/28 files, 228/228 tests.
- Frontend typecheck, TR/EN/DE i18n integrity, and `git diff --check` passed.
- Independent code and security reviews approved with no Critical/High/Medium blocker.

### Boundary

- Product commit: `8c802d29`.
- Pre-fix restore tag: `restore/pre-dashboard-strictmode-fix-20260806-a29690aa`.
- Verified complete-history bundle: `.private-data/restore-points/pre-dashboard-strictmode-fix-a29690aa.bundle`, SHA-256 `5f29afac3b96f33431c00448688c988c7349ade7d93c99cc8761757e3c0b0660`.
- GitNexus CLI was unavailable in this checkout, so `detect_changes` could not run. The reviewed diff was limited to the Dashboard component and its co-located test.
- Dashboard-specific timeout, abort, retry and stale-response generation control remain a separate resilience improvement; the global API helper was intentionally left unchanged to avoid affecting long-running uploads, crawler jobs and AI requests.
- No backend, database, migration, production/shadow data, push, tag-push, deploy or publish operation occurred.

## Follow-up - 2026-08-07 Canonical RBAC Contract And Local SUPPORT_AGENT

### What changed

- Added a TypeScript-AST RBAC source scanner and a machine-readable canonical role/permission contract.
- Added blocking CI checks before and after fresh migration deploy so unknown decorators, missing permissions, and an over-privileged `SUPPORT_AGENT` fail closed.
- Added an additive migration that materializes the full 22-permission catalog and creates `SUPPORT_AGENT` with exactly 16 approved permissions; no user is assigned and existing permission metadata is preserved.
- Updated the local RBAC seed to consume the canonical catalog and give ADMIN only the existing `*` wildcard.
- The RBAC seed now uses the generated local database client and refuses to query the database without explicit `ALLOW_DATABASE_SEED=true` opt-in; the operations-safety test locks this ordering.
- Fixed `RbacGuard` role matching so existing hyphenated controller aliases and underscore-backed DB roles resolve consistently.
- Aligned migration alias detection with runtime normalization, including surrounding-whitespace rejection via `BTRIM`.

### Verification

- TDD: the alias regression failed 3 cases before the guard fix, then passed 16/16.
- Operational safety contracts passed 21/21; RBAC source and local DB contracts passed.
- All 55 migrations plus the RBAC database contract passed on a newly created temporary PostgreSQL database; the temporary database was removed afterward.
- Local development DB read-only verification: `SUPPORT_AGENT` has 16 permissions and 0 assigned users.
- Backend full suite: 119/119 suites, 1086 passed, 1 skipped, 0 failed.
- Backend/frontend typecheck, TR/EN/DE i18n, 55-file migration integrity, and `git diff --check` passed.

### Boundary

- Only the local development database received the new migration. Production/shadow DB, production Redis, external services, push, tag-push, deploy, and publish were not touched.
- The repository-declared Node 20 binary was absent; verification ran on the active local Node 24.18.0 runtime. New scripts use Node 20-compatible APIs, but CI remains the authoritative Node 20 execution proof.
- Görev Merkezi API/UI implementation has not started; it is the next local-only phase after this RBAC prerequisite checkpoint.
- Post-phase restore point: tag `restore/post-support-agent-rbac-20260807-05483a67`; verified complete-history bundle `.private-data/restore-points/post-support-agent-rbac-05483a67.bundle`, SHA-256 `3671b51e2a7a211b78618746e5b4aa546b96262d8321f102fd2901f353805e4e`.

## 2026-08-07 - Authorization-scoped Review Center

### What changed

- Added `GET /api/v1/review-center/summary` and a localized `/[locale]/review-center` operational UI.
- Added a sidebar task/approval group whose queue links and aggregate badge come only from the authorization-scoped backend response.
- Added ticket filters for live-chat-requested and unassigned work, plus fail-closed query parsing on destination pages.
- Kept AI interaction history as an audit-only link outside action totals; no customer interaction count is exposed by the summary.
- Aligned FAQ approve/dismiss role metadata with the approved `SUPPORT_AGENT` `faq:manage` contract without widening crawler approval roles.
- Updated OpenAPI and project/RBAC maps to 231 operations.

### Verification

- Backend: 121/121 suites, 1102 passed, 1 skipped, 0 failed.
- Frontend: 34/34 files, 248 tests passed.
- Backend/frontend typecheck, i18n, 21/21 ops safety, RBAC source contract and 55/55 migration manifest passed.
- Unauthenticated local smoke: API 401 with no-store/no-cache; frontend route redirects to localized login.
- Product commits: `1efacf33`, `ef9bfe7e`.
- Independent review blockers were closed: real CUSTOMER permissions cannot expose global counts; cards require destination-read plus action authority; legacy `admin` is not a role wildcard; active ticket and authored-article count/list predicates match; same-route queries resynchronize; unauthorized RoleGuard children never render.

### Boundary and next step

- No production/shadow DB, production Redis, external integration, migration, seed, user-role assignment, push, tag-push, deploy or publish occurred.
- Authenticated local visual acceptance remains: ADMIN and, when a safe local account exists, SUPPORT_AGENT should verify queue visibility, direct links and empty/error states.
- Claude was asked to independently review the authorization-query boundary, action/audit separation, query validation and 231-route documentation parity before any release decision.
- Local restore point: tag `restore/post-review-center-20260807-2fe9eb8e`; verified complete-history bundle `.private-data/restore-points/post-review-center-2fe9eb8e.bundle`, SHA-256 `9a6864b8ab7fe4d32928fed4823dae022d9e6e8dbbee24a563825b1a432c5829`.

## 2026-08-07 - Frontend/backend contract and CRM egress closure

### Delivered

- Corrected CRM settings route and camelCase payload/response contract; added DTO validation and typed frontend client usage.
- Preserved omitted webhook secrets, masked CRM and SettingsService secret responses, and separated CRM credential saving from the legacy API-key save.
- Restricted Dynamics URLs to a trusted HTTPS origin, disabled redirects, and rejected cross-origin OData next/delta links before bearer-token requests.
- Removed the unsupported MFA UI/client contract and unreachable MJML block editor while preserving the two independent email systems: file-backed transactional templates and DB-backed announcements.
- Moved the customer Hotinfo download to the authenticated central client.
- Added a blocking AST/OpenAPI route parity check with function-level, reason-required raw-network allowlisting.

### Evidence

- Product commit `eaa1fc53`; CI contract commit `e294623d`.
- Backend full suite: 124/124 suites, 1152 passed, 1 skipped. Frontend full suite: 38/38 files, 260/260 tests.
- Backend/frontend typecheck, TR/EN/DE i18n, 24/24 operations safety, RBAC source contract, 56/56 migration manifest, API route parity 182/233 with missing=0/raw-network=0, and `git diff --check` passed.
- Independent code review and security review returned GO after Dynamics SSRF/token-origin, omitted webhook-secret and secret-response findings were fixed.

### Boundary

- Pre-work restore: `restore/pre-endpoint-parity-20260807-acafd92b`; complete-history bundle `.private-data/restore-points/pre-endpoint-parity-acafd92b.bundle`, SHA-256 `3400a13c1dbb245e8ce262b387bd64cbc10cc274abf94efea0a6faf0c5349327`.
- No database migration, seed, production/shadow/live access, external CRM request, push, tag-push, deploy or publish occurred.
- Post-work restore tag `restore/post-endpoint-parity-20260807-5320926d` resolves to documentation checkpoint `5320926d353a664026e1e39a369aceada4a42497`. Complete-history bundle `.private-data/restore-points/post-endpoint-parity-5320926d.bundle` passed `git bundle verify`; SHA-256 `117978cb2592aea937f2ccdfde66bc6625836eecefec3bb72451ba12e06afa9c`; `git fsck --strict` exit 0 (dangling trees only).

## 2026-08-07 - Product taxonomy CRUD, archive safety, and endpoint parity audit

### What changed

- Added the missing product PATCH/archive endpoints and moved every products-page mutation to the authenticated central API client.
- Added DTO validation, normalized duplicate detection, P2002-to-409 mapping, and partial normalized unique indexes for active product/category names.
- Product and category archive operations preserve historical foreign keys. Product-first `FOR UPDATE` locking keeps concurrent archive/create/update operations consistent.
- Ticket creation, AI diagnosis, and smart-tagging now reject or ignore archived taxonomy.
- FAQ taxonomy restoration now creates an active replacement instead of silently reusing archived records.
- Added unit, DTO, frontend, real-Postgres concurrency, and Playwright product lifecycle coverage.

### Verification

- Backend full suite: 122/122 suites, 1129 passed, 1 skipped.
- Frontend full suite: 35/35 files, 254/254 tests.
- Product Playwright lifecycle: 4/4 passed; generated product/category and E2E users were removed from local dev DB afterward.
- Fresh PG17: all 56 migrations, migration integrity, schema parity, RBAC DB contract, duplicate-index behavior, and concurrency regression passed; disposable container removed.
- Backend/frontend typecheck, TR/EN/DE i18n, migration manifest, OpenAPI/RBAC matrix 233/233 parity, and diff hygiene passed.
- Independent code review and security review both returned GO after restore/P2002 and TOCTOU findings were fixed.

### Local-only boundary and follow-up

- Local dev DB on `localhost:55433` received migration `20260807143000_add_product_taxonomy_unique_indexes` after a zero-duplicate read-only audit. Production and shadow DBs were not connected to or changed.
- Product code commit: `93870762`; migration commit: `c23867e1`.
- No push, tag-push, deploy, publish, or live-system action occurred.

- Static frontend/OpenAPI parity audit found three pre-existing gaps for separate work: CRM settings wrong route, unimplemented MFA backend contract, and unimplemented MJML content/announcement contract. No code change for those findings was made in this phase.

## 2026-08-07 - Review Center active-record parity Aşama A

- Product commit `69655f1c` aligned live-chat, unassigned-ticket and FAQ pending counts with active target lists through explicit `deletedAt: null` predicates.
- FAQ list/count, single read, public feed, approval, dismissal and edit paths now preserve soft-delete integrity without changing the global Prisma layer.
- Added runtime `UpdateFaqDto` plus service-side allowlisting to prevent PATCH mass assignment; null, blank, size and OpenAPI parity constraints are regression-tested.
- Tickets UI now distinguishes API failure from an empty queue, offers localized retry, and ignores stale concurrent responses.
- Verification: backend 125/125 suites (1168 passed, 1 skipped), frontend 38/38 files (262 passed), targeted backend 33/33, both typechecks, i18n, ops 24/24, API contract, RBAC contract, migration manifest/integrity and diff hygiene passed. Independent code/security reviews returned GO with no Critical/High/Medium findings.
- Restore: `restore/post-review-center-phase-a-20260807-69655f1c`; complete-history bundle `.private-data/restore-points/post-review-center-phase-a-69655f1c.bundle`, SHA-256 `466460f32cfb0bddf5a3adc478dd4f64c95f71bf18585a84aa12fb549f2a5c80`.
- No production/live/shadow access or write, DB mutation, migration/seed, push, tag push, deploy or publish. Global Prisma soft-delete Aşama B remains NO-GO pending a separate full inventory and user approval.

## 2026-08-08 - Production Release A.1.2 local closure

- Product/tooling commit `64c5d2bc` hardens the operator backup path with explicit opt-in, PG17 custom-format dump validation, checksums, private artifact boundaries, lock and symlink protections, S3 conditional no-clobber upload, verified metadata and READY-last publication.
- The legacy in-process scheduled/API backup implementation is quarantined behind a fixed 503 response; exception and public-health responses no longer expose unsafe status, query, audit or driver details.
- Final evidence: backup `44/44`, ops `87/87`, backend `132/132` suites (`1311 passed`, `1 skipped`), frontend `42/42` files (`308 passed`), both typechecks, i18n, API/RBAC and migration `56/56`; independent TDD/code/security reviews GO with C/H/M `0/0/0`.
- Existing Cloudflare R2 application bucket `aluplan-support-desk` (`402` objects, `37.42 GB` observed) was not written, moved, renamed or deleted. `aluplancoolify` is unrelated. Proposed DB-only bucket `aluplan-support-desk-db-backups` is not yet created/configured.
- Verified restore point: `restore/post-release-a12-20260808-64c5d2bc`; bundle SHA-256 `a6b1f98e8828d3a6ec9b5f01e2887408eb42832d777699eb3aba9d147b67c0cd`.
- Production remains NO-GO until A.1.3 exact-image, real Cloudflare R2 round-trip and disposable PG17+pgvector restore evidence. No live DB/R2/SSH action, migration, seed, push, tag-push or deploy occurred.

## 2026-08-08 - Pause and morning handoff

- Work paused after the verified A.1.2 local closure; no additional product
  code, live system action or external mutation was started.
- Last product/tooling commit is `64c5d2bc`; the preceding release-doc
  checkpoint is `46ec376c`. A.1.1 migration planning and A.1.2 backup
  hardening are locally complete, but production remains NO-GO.
- Final evidence carried forward: backend `132/132` suites (`1311 passed`,
  `1 skipped`), frontend `42/42` files (`308/308`), backup `44/44`, ops
  `87/87`, typechecks, i18n, API/RBAC and migration `56/56`; independent
  TDD/code/security reviews GO with C/H/M `0/0/0`.
- Existing Cloudflare R2 `aluplan-support-desk` application data (`402`
  objects / `37.42 GB` observed) remains untouched. `aluplancoolify` is
  unrelated. Proposed `aluplan-support-desk-db-backups` is not created or
  configured.
- Next phase A.1.3 must prove the exact backend image, conditional R2
  round-trip and a disposable PG17+pgvector restore before any cutover.
  Production ledger, credential rotation, object parity, all nine queues,
  cron/repeatable-job singleton behavior and rollback remain acceptance gates.
- New sessions must start at `FIRST-READ.md` section 10. No push, tag-push,
  deploy, production DB/R2/SSH write, migration or seed is authorized.
- Pause handoff was committed as `ab2bd04f`. Verified local restore tag
  `restore/pause-before-release-a13-20260808-ab2bd04f` points to that commit;
  complete-history bundle SHA-256 is
  `63e8f45bc7f2eb51ae6aae4ec49961598c64225d08130fb0b92d93868633c12d`.
  The tag and bundle remain local and were not pushed.
- Claude independently re-ran the source, local read-only DB, restore-integrity, targeted/full test, typecheck, i18n and contract checks and returned GO with no contradicted claim or count deviation. Aşama A is therefore closed; work pauses here.
- Root `FIRST-READ.md` is the shared Codex/Claude account-switch and new-session entry point. It preserves the canonical directory, read order, archive reference, local-only boundaries, Aşama A closure, and Aşama B NO-GO gate.

## 2026-08-10 - Encrypted SharePoint DEV acceptance

- Pinned the official `age v1.3.1` darwin/arm64 release under `.private-data/tools`; its archive matched the publisher SHA-256 `01120ea2cbf0463d4c6bd767f99f3271bbed1cdc8a9aa718a76ba1fe4f01998b`.
- Generated a DEV-only age identity under `.private-data/release-credentials` with mode `0600`. The private identity was never uploaded, committed, printed or documented.
- Encrypted a 288-byte synthetic canary, uploaded only the 488-byte ciphertext and a non-secret JSON manifest to the new SharePoint DEV site's `Manifests` library.
- Downloaded the ciphertext back through Microsoft Graph. Ciphertext SHA-256 `65f66f049c8b31315c27a7fd0f2456fe59c455e067cd08ac08861ef9c10aac25` matched exactly; age decryption succeeded and recovered plaintext SHA-256 `1e38c0dbdbd1c4bcaef3f13335718048ce9997d8ad90d11b1182728cc452ad95` matched the source.
- Verified SharePoint version `1.0` and no anonymous sharing link on the canary. Existing production DB/R2/application SharePoint data remained untouched.
- This is a DEV encrypted round-trip acceptance only. Production remains NO-GO pending organizational key escrow/recovery, automation identity, retention, read-only live inventories, maintenance/cutover and rollback gates.

## 2026-08-10 - DEV object-manifest and encrypted offsite round-trip

- Read-only listed only `aluplan-support-desk-db-backups-dev`: one synthetic canary object, 106 bytes. HEAD size/ETag matched the normalized private manifest.
- Manifest SHA-256 is `fc2041066e4bd4fa35fae0c0570ee13d51bc9a7166fcd68cff3215c1f7b51798`, stored mode `0600` under `.private-data/release-evidence/r2-manifest-dev/`.
- Bucket versioning visibility returned `AccessDenied`; no versioning claim was made and versioning remains excluded from recovery acceptance.
- Encrypted the manifest client-side, uploaded the 689-byte ciphertext to the new SharePoint DEV `Manifests` library, downloaded it, matched SHA-256 `113b4cd4a70e5548a0dce1352bf97553111247a0e9957486ddc5f524fd59064b`, decrypted it and proved exact byte equality with the source JSON.
- No production bucket, database, deploy or production copy was touched. Next authorization gate is organizational key custody plus a separately approved read-only live inventory credential.

## 2026-08-10 - Dual-recipient DEV recovery and SharePoint round-trip

- Created two independent DEV-only age identities under the Git-ignored private root. Directory permissions are `0700`; identities and all recovered artifacts are `0600`.
- Encrypted the existing synthetic canary once for both recipients. The 586-byte ciphertext SHA-256 is `90e7dc235d6b267b58727deaf361d720f8b857205852713468acfb0a8ee63d7f`.
- Proved locally that either identity alone recovers the exact original plaintext SHA-256 `1e38c0dbdbd1c4bcaef3f13335718048ce9997d8ad90d11b1182728cc452ad95`.
- Uploaded only the synthetic ciphertext to the new SharePoint DEV `Manifests` library, downloaded it through Graph, proved ciphertext byte equality, and independently decrypted the round-trip copy with both identities.
- No private key or recipient value was printed, committed, or uploaded. Local-only dual custody is accepted for DEV evidence, not production recovery. Production keys require separate organizational and offline custody locations.
- No live database, live application bucket, production SharePoint site, deploy, migration, seed, push or production copy was touched. Production remains NO-GO.

## 2026-08-10 - A.1.4 offline production inventory preparation

- Added a network-incapable production-inventory preparation contract in commit `fdee46c8`. It accepts no credentials/endpoints, rejects `--execute`, requires explicit `--prepare`, and writes only private no-clobber mode-`0600` evidence.
- Locked the exact nine BullMQ queues, nine source cron declarations, four repeatable jobs, PostgreSQL statement allowlist, and R2/Redis read-operation allowlists. Runtime singleton and live parity remain intentionally unverified.
- Closed a fail-closed SQL review finding by replacing broad `SELECT` acceptance with an exact statement allowlist; side-effect functions such as `set_config` and `lo_unlink` are regression-tested as rejected.
- Verification passed: A.1.4 `12/12`, broad operations safety `163/163`, syntax/format/JSON/secret/diff checks. Manual code/security review found no Critical/High/Medium issue.
- No production PostgreSQL, Redis, R2, SSH, migration, seed, queue mutation, push or deploy occurred. Production remains NO-GO. The next phase requires separate user approval for A.1.4-B live read-only inventory access.
- The private preparation plan is bound to documentation commit `b07203e8260a34460e733b15074e2d1651c1c0bf`. Recovery evidence: local tag `restore/post-release-a14-preparation-20260810-b07203e8`; verified complete-history bundle `.private-data/restore-points/post-release-a14-preparation-20260810-b07203e8.bundle`, SHA-256 `762309f39a05496a9ba1637fdbfd304686f241b05609744492c3d784d5263486`.

## 2026-08-09 - Production Release A.1.3 exact-image and disposable restore evidence

### Outcome

- Local-only exact-image and disposable PG17+pgvector restore evidence is complete. Production remains NO-GO.
- Final tooling commit: `ca26caa1` (`fix(release): serialize fingerprint queries`). Exact amd64 image: `sha256:74a4fac812a84082184c8d42a41473f08a235ed772cc615cfcfd316f7299f6ac`.
- The input was the existing sanitized production-derived PG17 custom archive, SHA-256 `544260dd42453b6510433e27de0ef19e03e3e08793923af8c699fb27a98f1ff7`, `138028808` bytes, mode `0600`. Raw production dumps were not used.
- Baseline and candidate-pre fingerprints were identical. Migration round 1 applied the eight expected pending migrations; round 2 reported no pending migrations. Candidate post-round-1 and post-round-2 fingerprints were identical.
- Final parity evidence records business/RAG/object-reference/sequence/RBAC-baseline/schema-baseline stability, canonical RBAC, schema parity, a true round-two no-op, zero invalid constraints/indexes, clean disposable resource teardown, and `productionGo:false`.

### Fail-closed findings closed during the drill

- Docker Desktop lowercase missing-object messages are accepted only as exact immutable-ID/name matches; wrong ID, suffix and daemon-error cases remain rejected.
- All backend evidence jobs explicitly run as `linux/amd64` on Apple Silicon.
- RBAC fingerprint reads no longer overlap queries on one node-postgres `Client`; a side-effect-free helper and behavior test prove `maxInFlight=1` and deterministic roles -> permissions -> assignments order.
- Every source change received TDD, code review and security review closure with Critical/High/Medium `0/0/0`.

### Verification and recovery

- A.1.3 safety: `52/52`; broad operations-safety: `151/151`; Node syntax and diff hygiene passed.
- Restore tag: `restore/post-release-a13-fingerprint-20260809-ca26caa1`.
- Complete-history bundle: `.private-data/restore-points/post-release-a13-fingerprint-20260809-ca26caa1.bundle`; SHA-256 `dca8524a59d61525bf6f20b5fd4eeda739d5486c5d47356634699fb185280034`.
- Private exact-image/restore evidence is under `.private-data/release-evidence/` and is intentionally not committed.

### Remaining release boundary

- No Cloudflare R2 backup round-trip was performed and no DB-only backup bucket was created. Existing `aluplan-support-desk` application objects were untouched.
- Still required before any production GO: dedicated DB-backup R2 conditional upload/download/hash/restore canary; read-only live migration ledger plan; production PostgreSQL credential rotation; full DB-to-S3/local object-reference parity; all nine BullMQ queues plus cron/repeatable-job singleton checks; approved maintenance/cutover and rollback rehearsal.
- No production DB/R2/SSH access or write, migration, seed, push, tag-push, deploy or publish occurred.

## 2026-08-10 DEV R2 and SharePoint offsite acceptance

### Completed external DEV evidence

- Created the isolated Cloudflare R2 bucket `aluplan-support-desk-db-backups-dev`; the live application bucket remained untouched.
- Created a 30-day Object Read & Write credential scoped to that bucket only. Its values remain untracked under `.private-data` with mode `0600` and were not printed or documented.
- Uploaded a 106-byte synthetic canary with `If-None-Match: *`, verified HEAD metadata, downloaded it, matched SHA-256 on both copies, and proved a repeat conditional upload is rejected.
- Created the separate non-group SharePoint site `ALUPLAN Destek Yedek Kasası DEV` at `/sites/aluplan-destek-backups-dev`, Turkish locale, Istanbul time zone and 100 GB site quota. External sharing is organization-only.
- Created empty `Database Backups`, `Object Storage Snapshots`, and `Manifests` libraries. Existing `ALUPLAN DESTEK PLATFORMU 2026` was not modified.

### Boundary and next action

- No production dump or live R2 object was copied. R2 returned no object `VersionId`, so the release design still requires immutable unique keys plus an independent encrypted SharePoint copy.
- Next: define client-side encryption/key custody, run an encrypted synthetic SharePoint round-trip, then produce a read-only live object manifest and staged initial/delta-copy plan. Production remains NO-GO.
## 2026-08-08 - Announcement email preference BUG-05 closure

- Captured and independently verified the announcement dynamic-data GAP/BUG report in `.ai/issues/2026-08-08-announcement-email-template-dynamic-data-gap-bug-report.md`; docs baseline commit is `cc1a7896`.
- Created and verified pre-change restore tag `restore/pre-announcement-email-safety-20260808-cc1a7896` and complete-history bundle `.private-data/restore-points/pre-announcement-email-safety-cc1a7896.bundle` (SHA-256 `d174ba9c1687ca48e571f69349198d59bfe4c2770f821d1eb092aac64735c27c`).
- TDD RED proved `master-announcement` incorrectly queried `SYSTEM`; the minimal mapping fix now classifies it as `ANNOUNCEMENTS`.
- Product commit `8f40deef`; regression-test commit `bddd51ac`.
- Verification: focused test `14/14`, expanded email/announcement set `61/61`, full backend `125/125 suites` with `1169 passed, 1 skipped`, backend typecheck and `git diff --check` passed.
- Independent code review and security/privacy review returned GO for BUG-05; Critical/High/Medium attributable to the diff are `0/0/0`. The test-isolation warning was fixed before commit.
- Post-fix restore tag `restore/post-announcement-bug05-20260808-bddd51ac`; complete-history bundle `.private-data/restore-points/post-announcement-bug05-bddd51ac.bundle` verified with SHA-256 `236c1800c7ad09486b7bc5ecde455150c1d773437a6311874e1fa140f5b7b2f6`.
- Residual boundary: BUG-04 remains open because consent-skipped announcements can still be recorded as `SENT`; subject rendering, canonical context/Zod validation, preview parity and unresolved placeholder protection also remain open. Personalized dynamic announcements remain NO-GO.
- No production/shadow/live connection, migration, seed, DB mutation, external email send, push, tag-push, deploy or publish occurred.

## 2026-08-08 - Production release readiness and live-drift audit

- Chose a release-readiness/live-drift audit instead of another broad code GAP report; canonical artifact: `.ai/issues/2026-08-08-production-release-readiness-live-drift-audit.md`.
- Local candidate is `4e1c6819`, 153 commits ahead of local `main`; this is release scope evidence, not proof of live drift. Live image digest/commit remains unknown until a separately authorized read-only inventory.
- Current local gates passed: operations safety 24/24, backend/frontend typecheck, TR/EN/DE i18n, API contract `182/233 missing=0 raw-network=0`, RBAC source `12 roles/19 permissions`, migration manifest `56/56` and diff hygiene.
- Production decision remains NO-GO: Faz 8 runbook is fixed to an obsolete three-migration set; DR/backup paths can mask failures; staging does not prove immutable image promotion; PG version is inconsistent; worker/cron jobs are in-process; old shadow sanitization is incomplete; PostgreSQL restore alone does not protect R2/local object data.
- Independent planning, CI/DR/backup and data/RAG/storage reviews agreed on the same NO-GO decision. No code, DB, migration, seed, live system, push, tag-push or deploy was changed.
- Next safe phase is local-only Faz A: repair the current runbook/DR/backup/staging contracts, define a worker/cron maintenance boot strategy, create exact immutable images, and rerun full release gates before requesting live read-only drift authorization.

## Follow-up - 2026-08-08 Production Release Faz A.1.1

- Replaced the stale fixed migration assumptions with a canonical-ledger resolver and fail-closed Faz 8 runbook.
- Product/tooling commit: `8fbdc0b1` (`fix(release): derive production migration plan from ledger`).
- The resolver is opt-in for database access, uses a read-only repeatable-read transaction, writes only mode-`0600` artifacts under `.private-data`, records provenance, and never logs the connection URL.
- Independent review found and closed three important issues before commit: contradictory lifecycle rows, hidden historical checksum-marker acceptance, and insufficient artifact/storage provenance.
- Final tests: planner 19/19, combined operations safety 43/43, migration files 56/56; code/security reviews GO with no Critical/High/Medium findings.
- Read-only Coolify inventory showed backend/frontend running deployed commit `d9b21b9d`, healthy PG17+pgvector and running Redis. MinIO is intentionally retired; S3-compatible storage is canonical.
- A Coolify database configuration snapshot unexpectedly returned the PostgreSQL credential unmasked. It was neither reused nor written into project docs; production PostgreSQL credential rotation is now a mandatory release checklist item.
- Restore tag/bundle: `restore/post-release-a11-20260808-8fbdc0b1`, SHA-256 `ecb15b14da121665c3d30c94df13784b954c3b939b0ebb39b724c3a2250eb9af`; bundle verify and strict fsck passed (historical dangling trees only).
- No production query, SSH command, data write, migration, seed, push, tag-push or deploy occurred. Next local phase: A.1.2 backup hardening.

## 2026-08-11 - A.1.4 independent-review hardening closure

- Preserved Claude's independent A.1.4 verification as docs commit `6a523cda`, then created and verified the pre-fix restore tag/bundle.
- Closed the one Medium and six Low hardening findings in only the two authorized A.1.4 files. Code commit: `9461d52a`; regression-test commit: `c7c8c039`.
- Queue inventory discovery now uses the TypeScript AST to enumerate actual `registerQueue` calls, fails on async/unreviewed registration shapes, and compares the distinct set with the canonical nine queues. Anchors prove real registrations rather than substrings.
- PostgreSQL operations and the independently frozen statement allowlist must match; defense-in-depth rejects known side-effect functions. Timestamps require canonical UTC ISO-8601 and output is restricted to `.private-data/release-evidence`.
- Added real symlink/permissive-directory tests and broader static network-capability guards. R2/Redis restrictions remain declarative future-collector contracts, not live enforcement evidence.
- RED produced 4 expected failures out of 16. Final A.1.4 is 16/16 and broad operations safety is 167/167; syntax, formatting, secret and diff checks passed. Manual C/H/M closure: 0/0/0.
- Generated a private mode-0600 plan bound to `c7c8c03983755a08e9d59ae267e6c7f96bb84486`, with production access/GO both false. No live system, credential, deploy, push, migration, seed or queue mutation was touched. Production remains NO-GO.
- Post-fix recovery: tag `restore/post-release-a14-hardening-20260811-865090f3`; verified complete-history bundle `.private-data/restore-points/post-release-a14-hardening-20260811-865090f3.bundle`, SHA-256 `d05a3ca0a3d801e5062e05fe76fe22dbe0d7d7c974214c7cfe466e5af4aa6423`.

## 2026-08-11 - A.1.4 H1-H5 local commit and restore closure

- Recorded the in-process schedule inventory contract in local commit `5e77ffdc`, its regression suite in `ff38340e`, and the append-only Claude/Codex handoff in `021ae1c5`.
- Final evidence: A.1.4 target `21/21`, broad operations-safety `172/172`, code/security reviews GO with Critical/High/Medium `0/0/0`.
- Created local annotated tag `restore/post-release-a14-h1-h5-20260811-021ae1c5` at `021ae1c577e503f1e584b1f8b5e08d133ebbad87`.
- Created and verified complete-history bundle `.private-data/restore-points/post-release-a14-h1-h5-20260811-021ae1c5.bundle`; mode `0600`, SHA-256 `2ae4e178ac3762a4fbb321d36a08bddbeb2f520828b322a736f1421a773c0cc3`.
- The A.1.4-B live collector was not implemented or run. Its next step is a design-only, fail-closed read-only contract and requires separate user approval before any production access.
- `StalledJobRecoveryService` multi-replica behavior remains a separate product/architecture decision; it must not be silently folded into inventory work.
- No push, tag-push, deploy, live credential access, production connection, migration, seed, queue/object/Redis mutation or production data change occurred. Production remains NO-GO.

## 2026-08-12 - A.1.4-B design-only collector contract

- Added `.ai/issues/2026-08-12-production-readonly-inventory-collector-design.md`; no collector/runtime/product code was implemented or executed.
- The design separates PostgreSQL, R2, Redis, runtime-topology and local-volume adapters from an offline reconciler. Each transport receives a distinct short-lived least-privilege credential; no process receives all credentials.
- Source analysis found the prior count-only PostgreSQL and Redis command declarations insufficient for key-level DB↔R2 and active/repeatable BullMQ evidence. Exact object-reference and exact-known-key contracts are required before implementation.
- The first security review found C/H/M `0/2/3`. The design was hardened to avoid SCAN-as-ACL isolation, bracket DB+R2 as moving targets, probe effective PostgreSQL PUBLIC privileges, isolate the R2 parent token in a minting broker, HMAC keys before persistence and require a separately approved local-volume manifest.
- Final security re-review returned GO for design-only closure with C/H/M `0/0/0`. Independent planning agreed that the next phase must remain offline TDD/implementation, not live access.
- Cloudflare R2 Object Read includes object-body read; the narrow target is an action-scoped child credential for `ListObjectsV2` and `HeadObject`, with the parent secret outside the collector. Redis discovery defaults to exact known keys; BullMQ getters/Lua and fallback SCAN are outside the default contract.
- No production PostgreSQL/R2/Redis/SSH/Coolify/SharePoint access, credential operation, object body read, migration, seed, queue/object/Redis mutation, push or deploy occurred. Production and live A.1.4-B remain NO-GO.

## 2026-08-12 - A.1.4-B0 offline collector core

- Implemented a local-only, import-safe modular collector core under `scripts/a14b/`; it contains no production client construction, endpoint, credential provisioning or CLI execution path.
- Added fail-closed PostgreSQL, R2 and Redis adapter contracts, fixed-order double observation, reference classification, closed evidence generation and private atomic evidence publishing.
- Final focused verification: `21/21`; coverage `%96.81` lines, `%82.53` branches, `%96.47` functions. Broad operations-safety: `193/193`. Syntax, formatting and diff hygiene passed.
- Independent code and security reviews both returned GO with Critical/High/Medium `0/0/0` for the offline core only.
- Local code/test/tooling commit was created: `f6982564` (`feat(release): add A14B offline collector core`). Documentation commits: `3c7c9fe1` and final addendum `1107b7fa`.
- Canonical final restore tag: `restore/post-release-a14b-offline-core-final-20260812-1107b7fa`, target `1107b7fa633abce35b27d6ebd0754a7a990a9bea`. Complete-history bundle: `.private-data/restore-points/post-release-a14b-offline-core-final-20260812-1107b7fa.bundle`, SHA-256 `7d2f17fd8556acd2ca3124cf32cadaf3477f6f6617ee9c77aa43d86a9c66e8eb`; `git bundle verify` passed.
- No live system, credential, database, object store, Redis, SSH, Coolify or SharePoint access occurred. No push, deploy, migration, seed or data mutation occurred. Production and B1 live observation remain NO-GO.

## 2026-08-12 - A.1.4-B0 follow-up hardening

- Closed Claude's B0-1 diagnostic gap locally: moving-target and DB-referenced-but-missing R2 cases now produce closed, `ready:false`, `productionGo:false` diagnostic evidence instead of throwing before artifact generation. Publisher persists blocked diagnostics but never writes `READY.json` for them.
- Closed B0-4 with explicit historical-marker acknowledgement: `manual-psql-fix` is default-deny unless passed through exact `acknowledgedHistoricalMarkers`, and accepted markers are projected as `historicalLedgerMarkersAccepted`.
- Closed B0-5/B0-6/B0-7: publisher now uses `fileURLToPath`, pid+UUID temp names, raw storage-key pattern detection, and a redacted fixed EEXIST message.
- Verification: focused A.1.4-B set `25/25`, broad operations-safety set `197/197`, syntax, Prettier and `git diff --check` passed.
- Follow-up hardening commit: `219d1142` (`fix(release): close A14B B0-1 and low hardening findings`).
- B0-3 is closed with an annotated restore tag: `restore/post-release-a14b-b0-hardening-20260812-219d1142`; tag object `2d5ab23b383a4e9b50e833660344a7f0737c6047`, peeled commit `219d11428a96da7fdb6737e076a1f9ba946fe79b`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b0-hardening-20260812-219d1142.bundle`, mode `0600`, SHA-256 `bbbb9a9636208ca2b81dab0a9ddd1f02c884825d587bb2b8101ad0bdf191554e`; `git bundle verify` passed.
- A.1.4-B0 B0-1 through B0-7 are now committed and recovery-recorded for local/offline hardening. No live access, credential operation, deploy, migration, seed, queue/object/Redis mutation, push or tag-push occurred. B1/live observation and production deploy remain NO-GO.

## 2026-08-12 - A.1.4-B1 live observation preflight

- Added docs-only preflight plan: `.ai/issues/2026-08-12-a14b-b1-live-observation-preflight.md`.
- The plan freezes the next safe gate before any live read: distinct short-lived read-only credentials, exact PostgreSQL/R2/Redis operation scopes, private evidence location, bounded before/after observation, DB↔R2 parity classes, runtime moving-target semantics and explicit GO/NO-GO conditions.
- No concrete transport, credential provisioning or live observation was implemented or run. Production PostgreSQL, Redis, Cloudflare R2, SSH, Coolify and SharePoint remain untouched.
- Production deploy remains **NO-GO**. B1 live observation requires a separate explicit user approval and should preferably run during a low-traffic or maintenance window because active tickets/uploads can make exact parity a moving target.
- Claude independently verified B1-1 through B1-5 as closed with no remaining documentation findings. The docs-only closure commit is `454f6693` (`docs(release): close A14B B1 live observation preflight plan`).
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-preflight-20260812-454f6693`, tag object `d067d68fa4b405712d6a07c9cbdfc4d183ef561c`, peeled commit `454f6693c37f312313f55d75cf070c05df83bfa7`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-preflight-20260812-454f6693.bundle`, mode `0600`, SHA-256 `c708dbeb8feefa56be3807504694ae24b126401e3c294a12ab7e3757db18aeee`.
- Push, tag-push, deploy, production connection, credential read/write, migration, seed and queue/object/Redis/DB mutation did not occur.

## 2026-08-12 - B1 night observation and deploy gates

- Added docs-only night plan: `.ai/issues/2026-08-12-a14b-b1-night-observation-and-deploy-gates.md`.
- The plan separates credential preparation, B1 live read-only observation, runtime-topology access and deploy into distinct approvals. General B1 observation does not include SSH/Coolify runtime topology, and no wording grants deploy.
- Recommended sequence: credential plan → explicit B1 read-only observation approval → B1 observation result → backup/restore/rollback gate → final deploy GO/NO-GO → explicit `deploy et` approval.
- Because production tickets/uploads can continue, exact DB↔R2 parity should be attempted in a low-traffic/night window and treated as moving-target if before/after digests drift.
- No live system access, credential operation, mutation, push, tag-push or deploy occurred.
- Commit: `869e1f38` — `docs(release): close A14B B1 night observation and deploy gates plan`.
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-night-gates-20260812-869e1f38`, tag object `04fb516cb097889c4c5ea41d9845c996d9ab03a5`, peeled commit `869e1f38a37033eb9b64f8c12b09b94f14880012`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-night-gates-20260812-869e1f38.bundle`, mode `0600`, SHA-256 `3bc8da35eab7792349b813ddcf11eaa7d374bc1965ab896b31fdaf6a2587495f`.
- B1 concrete transports, credential provisioning, live observation, runtime-topology/SSH/Coolify and production deploy remain **NO-GO** pending separate explicit approval.

## 2026-08-16 - B1 credential provisioning plan

- Added docs-only credential plan: `.ai/issues/2026-08-16-a14b-b1-credential-provisioning-plan.md`.
- The plan separates PostgreSQL, R2 and Redis credentials, requires short-lived least-privilege scope, keeps SSH/Coolify outside default scope, and requires revocation/cleanup before any deploy gate can open.
- It explicitly preserves the R2 `GetObject` compensating-control caveat and Redis exact-known-key/no-SCAN boundary.
- Claude independently verified the docs-only plan as GO with C/H/M `0/0/0`; the only Low note was an append-only formatting discipline issue, not a content or security finding.
- Commit: `508bb43f` — `docs(release): close A14B B1 credential provisioning plan`.
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-credential-plan-20260816-508bb43f`, tag object `a5de08ba2165f43f5414b3ba0f082e2cd5e66109`, peeled commit `508bb43f4aee1936322bb474f1a1c69c131ff4ab`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-credential-plan-20260816-508bb43f.bundle`, mode `0600`, SHA-256 `1df4de44c9aed670a399e30a6f795549d9617bcdcddc75810240569bac686444`.
- User approved only the credential provisioning method with `B1 credential provisioning yöntemini onaylıyorum`; this does not authorize credential creation, concrete transports, live observation, SSH/Coolify or deploy.
- Added a secret-free operator checklist for PostgreSQL, R2 and Redis credential preparation. No credential value was created, read, stored or printed.
- Added docs-only pre-deploy backup/restore gate: `.ai/issues/2026-08-16-a14b-b1-predeploy-backup-restore-gate.md`. It requires PostgreSQL restore evidence, R2/object parity strategy, Redis/BullMQ runtime state and rollback target evidence before deploy can be considered.
- Claude independently verified the backup/restore gate plan as GO with C/H/M/L `0/0/0/0`.
- Commit: `aecbf6c2` — `docs(release): close A14B B1 backup and credential planning`.
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-backup-gate-20260816-aecbf6c2`, tag object `82a66bb6ef33ee4bc9dcc0bb9d65f9b333812b63`, peeled commit `aecbf6c264c58557eed1e8ebd551b03ce95a52ed`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-backup-gate-20260816-aecbf6c2.bundle`, mode `0600`, SHA-256 `be55dd9585f68eed35c230be6367bb550d3e905948d2ac874e9e5bbfa0a58a2f`.
- No production connection, credential read/write, backup execution, mutation, push, tag-push or deploy occurred. Credential provisioning, B1 concrete transports, B1 live observation, runtime-topology/SSH/Coolify, production backup execution and production deploy remain **NO-GO** pending separate explicit approval.

## 2026-08-16 - B1 PostgreSQL credential provisioning guidance

- User gave the narrow approval phrase `B1 PostgreSQL credential provisioning başlat`.
- This was treated as PostgreSQL credential production guidance only; it did not authorize Codex to connect to production PostgreSQL, create/alter/drop a role, read or write a password/connection string, run backup, start live observation or deploy.
- Added §14 to `.ai/issues/2026-08-16-a14b-b1-credential-provisioning-plan.md`.
- The new guide defines the expected short-lived read-only role contract: `LOGIN`, `NOINHERIT`, `default_transaction_read_only=on`, no membership/admin attributes, target database only, `public` schema usage only, and `SELECT` only on `public."_prisma_migrations"`, `public.attachments`, `public.knowledge_sources` and `public.settings`.
- The guide requires a secret-free effective-scope probe before B1 live observation, fail-closed handling for broad `PUBLIC`/database/schema/table/function grants, and a revoke/drop plan before any deploy gate can open.
- No production PostgreSQL/R2/Redis/SSH/Coolify/SharePoint access occurred. No credential/token/secret was created, read, stored or printed. No mutation, push, tag-push or deploy occurred.
- Commit: `46fe0ad7` — `docs(release): close A14B B1 PostgreSQL credential guidance`.
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-postgres-credential-20260816-46fe0ad7`, tag object `d21dcab7fc3ddb43e40bb9c07e318a83d9eec489`, peeled commit `46fe0ad70fee888f10e72f55fe3a6ca75e750fce`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-credential-20260816-46fe0ad7.bundle`, mode `0600`, SHA-256 `fa40a3cbcdd3b5c44310f702bb371accecae1ec007b7aa8fbcbd40c16ec57e00`.

## 2026-08-16 - B1 PostgreSQL credential provisioning attempt

- User gave the explicit narrow production-write approval: `Production PostgreSQL üzerinde yalnız B1 için geçici read-only rol oluşturmanı onaylıyorum; parola/connection string değerlerini okuma, yazma veya rapora geçirme.`
- Codex did not receive, read, print or store any PostgreSQL password, token, endpoint or connection string. The user/operator worked inside the Coolify PostgreSQL terminal and set the password via `\password`.
- Production DB context was confirmed as `postgres`; the preflight role existence check returned `role_exists = f`, and all four target tables existed.
- A temporary role was created: `a14b_inventory_ro_20260816`, with expiry `2026-08-16T23:59:00.000Z`, `LOGIN`, `NOINHERIT`, `default_transaction_read_only=on`, and `SELECT` grants on only the four intended tables.
- Effective-scope probe result: **NO-GO**.
  - Database privilege output showed broader access than allowed: `aluplan_support` and `template1` appeared in addition to `postgres`, and `can_temporary = true` appeared for `aluplan_support` and `postgres`.
  - Pager output also showed public/pgvector function execute rows, which violates the zero non-system function execute expectation.
  - Relation grants for the four target tables were otherwise as expected: four rows, `relkind = r`, `can_read = true`, `can_write = false`.
- Because the scope probe failed, B1 live observation was not started.
- Cleanup completed in production PostgreSQL: grants were revoked, `DROP ROLE a14b_inventory_ro_20260816` succeeded, and final verification returned `role_exists = f`.
- No production backup, B1 live observation, runtime-topology/SSH/Coolify observation, migration, seed, queue/object/Redis data mutation, deploy, push or tag-push occurred.
- Claude independently verified the attempt record as GO with C/H/M/L `0/0/1/0`; the single Medium was stale wording in credential-plan §14.7 that still described the earlier docs-only moment.
- Fixed that docs-only gap by narrowing §14.7 to "rehber hazırlandığı andaki sonuç" and adding §14.8 "Gerçek deneme sonucu" with the role attempt, NO-GO reason and cleanup proof.
- Commit: `c76f3758` — `docs(release): record B1 PostgreSQL credential attempt outcome`.
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-postgres-attempt-20260816-c76f3758`, tag object `b4981c4709e4873c0731eeebe239e8441371f48a`, peeled commit `c76f37588bc3191004a97628d6aecd087df0eb75`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-attempt-20260816-c76f3758.bundle`, mode `0600`, SHA-256 `4b68a51eeaf7e7b3623cdb693ebe342cba8f6a69b61feb13477917201da71378`.
- No new production connection, credential read/write, role create/alter/drop, backup execution, live observation, mutation, push, tag-push or deploy occurred during restore-evidence recording. B1 live observation and production deploy remain **NO-GO** pending separate explicit approval.
- Added a docs-only PostgreSQL strategy decision after the failed scope probe: do not repeat the same live-role attempt, do not attempt production-wide `PUBLIC`/`TEMPORARY`/function revocation in this release path, prefer collecting PostgreSQL evidence from an isolated disposable PG17 restore under the pre-deploy backup/restore gate. A public-default-aware live PostgreSQL adapter contract remains a separate design/TDD/security-review phase.
- Closed Claude's follow-up findings on that strategy note: documented PostgreSQL dump vs live R2 manifest temporal-skew handling, clarified that `pg_dump` is broader read privilege but shorter-lived/operator-controlled, and named the future adapter redesign target as the `postgres-adapter.mjs` forbidden-function comment versus `functionRows.length !== 0` enforcement mismatch.
- Claude independently verified the final strategy closure as GO with C/H/M/L `0/0/0/0`.
- Commit: `9f2b43bb` — `docs(release): close B1 PostgreSQL credential strategy findings`.
- Recovery evidence: annotated tag `restore/post-release-a14b-b1-postgres-strategy-20260816-9f2b43bb`, tag object `79465f77e3b0e0a5c6b9a1849ea02f91b8e0e6e9`, peeled commit `9f2b43bb4106c1603c6e6a28cfb245594363b890`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-strategy-20260816-9f2b43bb.bundle`, mode `0600`, SHA-256 `98494cda53c27842e085d121731c82cfabcda8cea039619d50ea573df280a4b8`.
- No production access, credential operation, backup execution, live observation, push, tag-push or deploy occurred. Production deploy remains **NO-GO**.

## 2026-08-20 - B1 R2 offline credential minting tool

- Implemented a local-only Cloudflare R2 temporary-credential signer in a separate `scripts/a14b-minting/` trust boundary; it is not exported by the collector core.
- The policy is non-configurable: bucket `aluplan-support-desk`, scope `object-read-only`, exact actions `ListObjectsV2` and `HeadObject`, TTL 900 seconds, and no `paths` claim.
- Parent account/access-key metadata is read only from a private mode-0600 metadata file. The parent secret is accepted only through hidden interactive TTY input, never argv/environment/config/log/report. Child credentials are published mode-0600 with symlink/path/mode/owner checks and no-clobber semantics; stdout contains only a redacted receipt.
- Cloudflare's official HS256 JWT, SHA-256 child-secret and `base64("jwt/" + signedJwt)` session-token derivation are covered with synthetic fixtures. Final hardening rejects secret/unknown metadata fields, cleans invocation-owned bearer files after write/publish and post-publish verification failures, restores TTY state on EOF/error/close, and locks imports to an offline allowlist. Focused tests passed 16/16; combined A14B tests passed 41/41; sequential full ops-safety passed 213/213; focused coverage was 86.54% lines, 83.44% branches and 82.05% functions. Independent TDD/code/security re-reviews were GO with Critical/High/Medium/Low 0/0/0/0.
- Local closure commits: `3b2d5edb` (tool), `2ffe6d7b` (tests), `b90b6279` (docs). Recovery evidence: annotated tag `restore/post-release-a14b-r2-offline-mint-20260820-b90b6279`, tag object `5a7c7d9dd2cb542fdbca466293eca72aa4ee7f98`, peeled commit `b90b6279832e2cc944d6028789fc52882d2d355b`; complete-history bundle `.private-data/restore-points/post-release-a14b-r2-offline-mint-20260820-b90b6279.bundle`, mode `0600`, SHA-256 `9aaec3e369b69b4ebacbe63040add03ee93dd90c4afa417ec71486f6a7f1b479`, verified successfully.
- No real token or credential was created/read, no Cloudflare or production system was contacted, and no R2 request, push, tag-push or deploy occurred. Real parent creation, real child mint, provider canary, B1 live observation and deploy remain separate NO-GO gates.
