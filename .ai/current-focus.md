# Current Focus

## HTTP admission-only boundary added locally — 2026-09-24

MaintenanceAdmissionMiddleware uses a synchronous internal tracker check and is registered after helmet, before compression/body parsers and Nest guards. Closed admission returns fixed non-cacheable503 directly, avoiding exception-filter DB writes; open next() and downstream exceptions remain unchanged. It does not wrap next in a promise or infer completion from response close. CommonModule exports the middleware and the same tracker. No route/env/shutdown hook can close admission yet.

11newtests plus audit9 and tracker40 pass (60total), including a real Nest/Express HTTP fixture proving closed requests do not reach a writing global guard or exception filter. Initial TDD failure was missing implementation (no assertions executed), then green. Backend plus explicit newtest typecheck0; independent code/security review approved. No fullApp/SSEtransport/disconnect proof claimed; no schema/live/push/deploy changes.

Operational limits: all HTTP paths/methods, including health and OPTIONS, return503 when closed. Probe/CORS policy must be reviewed before activation. Previously admitted HTTP work is not automatically leased or fully counted. Gate1 remainsOPEN. Installed Nest invokes custom exception filters without awaiting their returned promise: next bounded step is tracking GlobalExceptionFilter error-log persistence before its first await, with held-write/failure/disconnect tests. Do not disconnect shared databases based on this ingress check. Remaining frozen writer/artifact/operational gates unchanged.


## Administrative audit payload safety and write accounting — 2026-09-24

Local interceptor no longer copies request bodies to audit newValue: generic settings values, bulk settings and storage credentials made key-name redaction insufficient. Query strings are excluded from action/entity mapping; errors use a fixed message. Actor/action/entity/IP/user-agent metadata remains, with no body-derived ID fallback. Historical production audit contents were NOT inspected; potential past credential persistence is unverified and requires separately authorized assessment, not automatic deletion or rotation.

Audit persistence now reserves shared root/child work before scheduling and catches rejection without delaying or collapsing HTTP Observable emissions. Non-HTTP contexts bypass unchanged.8RED then9GREEN regression cases; together with primitive40,49tests pass. Backend plus explicit new test typecheck0 using schema-matched borrowed declarations; independent code/security review approved. No schema/env/live/push/deploy changes.

Boundary: admitted audit settlement is tracked, not guaranteed success. Standalone audit after closure is rejected even if the underlying mutation completed. Therefore general HTTP admission remains OPEN; do not activate shutdown readiness based on this slice. Next bounded step is HTTP request admission/lifetime integration preserving SSE and accounting for guards, cancellation and detached descendants, then remaining frozen writer inventory. Existing three release gates remain unchanged.


## Existing-socket email-cancellation admission covered — 2026-09-24

Gateway ticket:message_read now reserves a new root before session/access/DB/queue IO; original authorization/recipient logic unchanged. Closed admission yields WS MAINTENANCE, while admitted cancellation survives closure and blocks drain until settlement. Started flag preserves downstream503 errors.3RED→GREEN;4suites104tests incl existing46gateway tests pass; backend/fullchangedtest diagnostics0, independent review clear. No live or closure hook activation. This is one socket handler, not fullWS transport/API/cron/Bull coverage. Next bounded general HTTP admission design accounting for async audit interceptor, then remaining presence/scheduler writers; do not mark Gate1closed.

## Current-source PostgreSQL SIGTERM/re-entry revalidated — 2026-09-24

At c6c2b715, repeated existing opt-in realPG17 harness with fresh network-none/tmpfs container and loopback relay. Actual SIGTERM while attachment held: intake fenced, DB alive, bytes/claim/ACK completed before disconnect; fresh child replay preserved IDs/counts1ticket/1message/1attachment/1claim and exact SHA. Six synthetic tables0aftercleanup; ownedcontainer/relay absent. Related5offline suites29tests pass. No product/live/customerdata/push/deploy changes. Not fullApp/allwriters/realIMAP/Linuximage/rollback proof; host was not egress-sandboxed. Next close remaining general mutation/WebSocket/cron/Bull admission coverage before wiring any global shutdown-ready decision; exact artifact/operational gates remain open.

## Five actual ticket-created consumers rehearsed together — 2026-09-24

New real-Nest fixture runs actual TicketsService, rules, assignment, AI auto-resolver, Automation and gateway together; exactly5ticket.created listeners discovered in this fixture.10heldboundary cases (rule/assignment/draft/email/notification × success/failure) keep fast creation response and nonzero accounting until settlement. Distinct branch assertions prevent skipped handlers from looking green.18offline suites308tests pass; backend/newtest typecheck0, independent review clear. Test/docs-only change, no live/push/deploy. External DB/AIquery/mail/Redis mocked: not fullApp, durability, delivery or provider-internal proof. Next repeat isolated PostgreSQL SIGTERM/re-entry against current source, then remaining Gate1 writer/admission coverage; deployment still gated.

## Ticket creation tracking integrated; full fan-out rehearsal remains — 2026-09-24

TicketsService.create now reserves root/child and pre-registers detached autotag+ticket.created completion without waiting for AI in the response. Four scheduled consumers and translation listener promisify; rules join nested translation.4actual-create/synthetic-listener cases RED→GREEN;5metadata failures fixed;2actual-rule/synthetic-translation cases pass.17offline suites298tests plus separate loopback-only HTTP12tests pass; backend/3newtests diagnostics0. Known-handler metadata is NOT fullApp discovery or all-five-consumer persistence proof. PG runner adapted/syntax checked, not rerun. No live/push/deploy/schema/env changes. Next actual five-consumer fan-out acceptance, remaining Gate1 writer coverage and exact artifact gates; no universal shutdown readiness claim.

## Persistent AI fallback notification chain tracked — 2026-09-24

Gateway fallback listener now synchronously reserves shared root/child work before emit returns, then defers existing persistence via setImmediate. AiService publishers unchanged. Real Nest/gateway/health-service tests with mockPrisma cover held health/notification success/failure and closed standalone admission.5RED beforeproduct thenGREEN;12suites205pass/1existing skip; backend/newtest typecheck0, independent code/security review clear. No live/push/deploy/schema/env changes. Next actual ticket-created fan-out integration and remaining Gate1 writers; not full socket/provider/Bull/drain acceptance.

## Query background descendants tracked — 2026-09-24

Both public query and queryInternal now reserve root/child work (worker calls queryInternal directly). Retrieval trace, semantic-cache write and training-review insertion reserve child leases before IO; response remains non-blocking and failure warnings contain fixed labels only.8new real-service/mockIO cases RED then GREEN;10suites154pass/1existing skip; backend/fullchangedtest typecheck0 after3pre-existing test callback annotations. No live/push/deploy/schema/env changes. No general HTTP/Bull/ticket drain claim: worker result notifications, AI fallback events, remaining service entrypoints and provider-internal detached work remain outside proof. Next bounded persistent AI-fallback event chain, then actual ticket-created integration; no automatic closure hook activated.

## AI response-timeout lifetime tracked locally — 2026-09-24

SupportAnswerOrchestrator.generate now reserves root/child work and separately tracks actual generateOrReformat across the response timeout. CommonModule provides/exports one shared tracker; no shutdown hook or maintenance endpoint. Two prior false-zero cases RED then GREEN, plus closed-root503/provider0, accepted-parent-after-fence and early/late rejection tests.10suites146pass/1pre-existing skip; backend/newtests typecheck0. Customer timeout/fallback contract retained; no live access. Remaining detached fallback notifications, query cache/training/tracing, other AI entrypoints and complete ticket fan-out are NOT covered. AiQueryService can catch admission errors, so this is not HTTP fencing. Next bounded descendant tracking; full Gate1 still open.

## Ticket completion boundary characterized; integration not activated — 2026-09-24

Two new test files expose false completion before wiring maintenance accounting. Real Nest fixture: async:true alone does not join the deferred handler; explicit promisify:true joins it without synchronous scheduling. Actual SupportAnswerOrchestrator with mocked providers: timeout returns fallback and outer-only tracker reaches zero while generation survives and may initiate reformat afterward. Five new characterization cases, focused6suites69tests pass; no-emit backend/newtests diagnostics0. No product/module/hook/live changes. Next track actual AI generation lifetime and detached cache/training/fallback descendants, then join the finite ticket-created fan-out with pre-scheduling child reservations. Preserve fast ticket response; these passing tests expose an open risk, not a fix or deploy approval. Details in existing TLS plan.

## Local work accounting primitive verified, not activated — 2026-09-24

MaintenanceWorkService added but NOT registered in any module, route or shutdown hook. Root/child leases reserve synchronously before microtasks, closeAdmission irreversible, active parents may admit descendants after fence, expired/foreign leases rejected, wait timeout reports incomplete without cancellation.40tests pass with100%coverage of this file only; no-emit typecheck0 and independent review clear. No production behavior changed. Gate1 remains OPEN. Next usable integration slice: one complete ticket-created chain with actual promise tracking/early listener registration, then remaining frozen inventory; do not claim primitive tests certify shutdown or allow deploy.

## Maintenance/release work consolidated into three gates — 2026-09-24

TLS transition plan now owns one current acceptance matrix:1new-admission fence plus observed accepted work across HTTP/WS/IMAP/Bull/events/cron;2one final artifact/security/critical workflows;3separately approved fresh recovery evidence and legacy-first-cutover/TLS/forward-recovery execution. Historical evidence not reopened as duplicate tasks. No new code/live access/tests this turn;134focusedtests are previous evidence. Next bounded admission/in-flight accounting design and local acceptance, not more independent micro-fixes or blanket synchronous AI event conversion. Candidate does not fix legacy live drain; explicit separate first-cutover plan required.

## SLA warning producer now joins notification attempt — 2026-09-24

4RED real Nest event-discovery cases, then two targeted await emitAsync changes for SLA response/resolution warnings. Actual SlaProcessor/Cron/Automation chain remains pending until mocked enqueue settles; attempt marker written afterward. Caught failure policy retained, not delivery proof.15suites134tests/typecheck0 and independent review pass. No live access. Next consolidate remaining detached ticket/AI/notification writers and ingress/cron fencing into one bounded maintenance acceptance scope; do not blanket-convert ticket emit to await long AI work.

## Automation child completion made observable — 2026-09-24

10RED deferred-enqueue tests reproduced detached child promises. AutomationService now awaits10existing mail child operations and placeholder rule evaluation; resolution/CSAT errors are caught, customer failure still allows staff notification. Removed raw /tmp diagnostic write discovered in review.13suites116tests green; no live/schema/env changes. This is direct handler completion, NOT outer EventEmitter/shutdown draining or delivery. Next smallest chain: actual SLA worker → sla.warning → handler → enqueue completion, then remaining admission/cron/event gates. No blanket emitAsync conversion.

## Shared Redis teardown corrected locally — 2026-09-24

RED3 before product edits, then GREEN: discover RedisModule first at root, move cleanup to final shutdown phase and await primary QUIT/fallback. Installed Nest reverse global order verified; real reduced Nest/Bull/Prisma/Redis module test holds worker, proves late Redis read, ordered cleanup and close waiting on held QUIT in success/rejection cases. Root-source order guard prevents fixture drift.10suites88tests/typecheck0, no new schema/env/deps/live access. Next bounded detached-event/cron completion and ingress fence acceptance; this fix is not universal drain or production artifact proof.

## Queue/Prisma ordering confirmed; Redis teardown gap isolated — 2026-09-24

Reduced real Nest/Bull/Prisma module topology waits held worker close before Prisma disconnect; no queue/DB defect reproduced. Separate actual RedisModule characterization shows primary Redis QUIT initiated before Bull drain; hypothetical final-phase-only move also fails ordering. Mock drivers/workers, not fullApp/physical socket proof.10suites87tests pass. Product unchanged. Next bounded correction must explicitly preserve shared Redis until workers complete and await quit; prove topology rather than only rename hook. Detached event writers and cron/ingress fencing remain separate maintenance gate, no universal drain claim.

## Synthetic PostgreSQL SIGTERM/re-entry passed — 2026-09-24

Current-domain-source test with isolated PostgreSQL17/local attachment storage passed actual SIGTERM while upload held after ticket/message commits. Intake fenced, DB remained available, attachment/claim/ACK completed before disconnect; fresh child replay preserved IDs, counts1ticket/1message/1attachment/1claim and exact bytes, with no orphan file. Focused84tests pass. Test uses custom DB lifecycle provider; companion proxy spec covers actual Prisma hook. Not fullApp, Linux release image, hard-crash or version rollback proof. No live access/push/deploy. Next narrow all-writer shutdown inventory and explicit maintenance drain/re-entry acceptance, not another broad redesign.

## Actual SIGTERM synthetic acceptance passed — 2026-09-24

Two owned-child real Nest/current-source signal cases passed network-denied: held config/search waits, new polls fenced, direct synthetic completion precedes DB shutdown and SIGTERM exit. Missing opt-in/deps fail closed; reviewed child IPC/error cleanup corrected. Actual PrismaService proxy runtime hook test passes with mocked drivers; total84tests. Not PostgreSQL persistence/fullApp/exact Linux artifact proof. Next fresh synthetic PG/domain-services signal+re-entry with record/attachment preservation; no live access or deploy.

## Direct IMAP lifecycle fixed locally — 2026-09-24

RED3 then GREEN83tests: stop flag fences polls and destroy hook waits tracked direct work/cleanup; Prisma disconnect delayed to final shutdown phase. Typecheck0 with schema-matched borrowed declarations. Independent architecture/code-security review scoped clear. No live/schema/env/queue changes. Physical socket close, detached event jobs, all-writer/signal and real persistence proof remain distinct; no general drain/production-ready claim. Next isolated candidate lifecycle/signal/write-preservation acceptance, not live restart. TLS plan contains limits.

## IMAP shutdown gap reproduced locally — 2026-09-24

Two minimal real Nest lifecycle/mockIO characterization cases prove close can resolve before active poll/cleanup, and no service-level post-close fence. Combined IMAP transport set9/9passes characterize defect, NOT fix. Candidate startup calls canonical migrations each boot; Prisma disconnects in destroy phase before later shutdown phase. No live access/product changes. Next smallest ordered lifecycle correction plus safety acceptance/module-order proof; do not assume restart is data-free or Queue.drain preserves jobs. TLS plan records evidence/limits.

## Saved Coolify source identified — 2026-09-23

Firefox source/deployable Compose views confirm logical mail volumes map to exact existing UUID-prefixed volumes; ports/env/image match prior selected evidence. No edits/save/validate/restart/stop. Editor closed. Future patch belongs in source, preserving logical names; never paste generated Compose or overlay alone as full source. Source-location gate closed; next local startup/re-entry and minimum drain/interruption plan, then renewal/client acceptance gates. No activation authorized.

## Current Compose merge verified; maintenance sequence drafted — 2026-09-23

Current on-host generated Compose plus stdin candidate config-only render exactly matches intended imagepin/3TLSenv/read-onlybind changes. Existing3named volumes/localtime identities and25/587/993/143 bindings match runtime; no mutation/restart. Independent review accepts proposal only: editable Coolify source persistence, exact all-writer drain/safe backend re-entry and renewal handoff remain. Server TLS alone does not fix live client certificate validation. TLS plan now records coordinated6step sequence, interruption honesty and ADR022 forward-recovery limits. Next inspect saved editable service definition, no activation.

## Nonsecret live settings and empty pending queue confirmed — 2026-09-23

Approved narrow READ ONLY DB query confirms smtp/mail.allplan.net.tr:587 secure=false and IMAP samehost143 tls=false. At16:44:45Z email queue wait/active/paused/delayed/failed/prioritized/waiting-children all0, retained completed964, not paused. Counts only, no messages/passwords/job IDs; no writes/restarts/deploy. Snapshot is not a maintenance fence or delivery proof. Next current Coolify comparison and exact coordinated maintenance proposal; TLS activation remains separately gated. Details in TLS plan.

## Live client comparison confirms coordinated maintenance required — 2026-09-23

Read-only compiled-code/process/effective-mail-config inspection: live SMTP/IMAP certificate checks disabled, mailserver TLS none/no, one node process observed in backend-api (not exhaustive writer inventory). Actual enqueue override2s/5attempts matches local; module default3s is not effective normal-job policy. Independent review caught this distinction and it was verified live. No DB/Redis contents/settings/login/send/restart/deploy. Next narrowly scoped nonsecret settings and aggregate queue evidence plus current Coolify merge/other-client ownership; separate approval before state access/maintenance. TLS plan records limits.

## Mail maintenance candidate locally verified — 2026-09-23

Candidate1365aa2a pins existing DMS image, adds3TLS env values and one dedicated read-only certificate bind. Actual offline Compose merge against Sep23 private backup preserves all existing ports/volumes/other rendered fields; no secret output. Independent pinned-image review requires fresh same-image container rather than assuming restart reverses disabled TLS settings. No live access/change this turn. Activation remains NO-GO until current Coolify merge, deployed client/cache/worker behavior, drain/window and renewal handoff are verified and maintenance explicitly approved. Next bounded read-only deployed topology evidence; full details in TLS plan.

## Protected one-domain export ready, not active — 2026-09-23

Explicitly approved on-host export completed at /data/aluplan-mail-tls-bru9sghg root700/files600. Exact sole mail domain, trust/expiry/key match/bytes/public443fingerprint verified. Shared ACME source and proxy/mail identities unchanged; key never sent to Mac/Git/output. No mount/mailTLS/settings/restart/timer/DB/deploy. Next exact maintenance diff and failure-safe handoff, separate activation approval. Full evidence in TLS plan.

## Stage A1 certificate issued successfully — 2026-09-23

Owner-approved exact mail-only/noop route installed without overwrite; HTTPS443 now trusted Let's Encrypt YR1/sole mail SAN, expiresDec22.418expected; existing site statuses307/API200/oldsite200 unchanged. Default config checksum and proxy/mail start/restart counts unchanged. No mail TLS/settings/key export/DB/restart/deploy. TLS plan records exact paths/hash/limits. Next separate approval for protected one-domain key handoff; mail transport not yet secured.

## Stage A1 exact route ready for owner approval — 2026-09-23

Read-only confirms Traefik3.6.7 file watch, https entrypoint, dynamic uid9999/gid0, absent target and no mail-host match among22Docker rules; sole dynamic catch-all priority-1000. External Mac HTTP80 reachable404. TLS plan now contains exact new mail-only priority100/noop@internal YAML and narrow issuance approval/acceptance/withdrawal scope. No live writes or CA issuance. Next explicit StageA1 owner approval; no mail restart/key export/DB/deploy included.

## Actual local certificate renewal passed — 2026-09-23

Test99b506fe: pinned isolated DMS served new valid leaf on SMTP/IMAP;5invalid variants rejected preserving old served leaf;unchanged no-op;container not restarted/watcher RUNNING. Watcher pause/copy/resume single-writer test only, not crash-safe production exporter. Independent review corrected Docker-local enforcement and timeout cleanup; final rerun approved/passed, remote override rejected, owned fixtures removed. No real keys/ACME/live/DB. Next exact proxy route ownership/conflict evidence and StageA reviewed diff, separate approval before real issuance.

## Certificate issuance/renewal scope frozen — 2026-09-23

Existing TLS plan now has reviewed StageA certificate-only preparation and separately approved StageB mail maintenance. No executable/live change. Prefer existing HTTP01; never add mail host to frontend/WordPress or mount full ACME store into mailserver. Host exporter necessarily reads shared private material; exact permission required. Local synthetic renewal publication/key-pair/watcher proof next, before auto-publisher or real issuance. Dynamic route ownership/topology and operator alert/drain remain explicit unknowns; no infrastructure expansion.

## Live certificate blocker confirmed — 2026-09-23

Approved public metadata-only inspection: mail config uses localhost snakeoil cert; mail.allplan.net.tr resolves to VPS but443 presents TRAEFIK DEFAULT CERT and fails normal trust/name verification. Existing proxy HTTP-01 resolver/port80 found; no private ACME/key contents read. Not proof no alternate unserved cert exists. Container identities unchanged; no issuance/config/DB/restart/deploy. Next narrow reviewed issuance/renewal handoff proposal using existing resolver; explicit approval before any CA/key/route change. Details in TLS plan.

## Mail password secrecy fixed locally — 2026-09-23

Exact IMAP/SMTP passwords encrypted on explicit save despite caller false; default responses/cache masked. Legacy mail reads/masked saves preserve DB and internal plaintext compatibility; no read-time migration added.35settings/64combined tests pass, corrected schema-matched typecheck0, diff secret scan clean, independent combined code/security review clear. Tests7bd17b46/product1157cc28. Whole-service line coverage74.26%, not80%/full readiness. No frontend/live/schema/env/push/deploy change. Next scoped cert/renewal/deployed cache evidence; limits and empty-password follow-up in TLS plan.

## TLS refresh audit exposes IMAP secret-classification gap — 2026-09-23

Local pinned DMS source supports manual certificate content detection and Postfix/Dovecot reload; not actual renewal proof. Independent local application audit confirms process-local settings cache and no independent mail pause control; finite SMTP retries preclude assuming harmless maintenance. Frontend secretKeys and backend fallback omit email.imap.pass, allowing newly entered password to be nonsecret. Current live storage NOT inspected. Next bounded regression-first known-mail-secret classification correction before rotation, then scoped cert/renewal/topology evidence. No live access or code changes this turn; details in TLS plan.

## Fresh off-VPS mail copy verified — 2026-09-23

Owner authorized unencrypted storage on this Mac. New VPS checkpoint copied to private0700 /Users/hazarvolgaekiz/aluplan-mail-backup-20260923-2hskQt outside Git. Archive0600/1621978bytes, SHA256 matched;237regular files/3905939bytes restored inertly and verified. One archived symlink not materialized; transient special sources excluded. Final three-volume dry-run drift0, Compose/env equal, container unchanged. Not atomic/runtime/ACL/DB recovery proof; no live service/config/DB writes or deploy. Full evidence in TLS plan. Next bounded certificate/renewal and client compatibility gate; avoid expanding backup architecture. Production NO-GO remains.

## Live source-custody metadata checkpoint — 2026-09-23

Approved read-only SSH inspection: persistent mail volumes, selected autoexpunge0, disk19%, container unchanged. Only selected-path Sep19 on-host mail archive verified by metadata, not current checksum/contents or fresh/off-host recoverability. Cron candidate remains unclassified; no exhaustive retention/backup absence claim. Global mail TLS disabled remains known risk. No customer content/DB access or production mutation. Detailed evidence and limits in TLS plan. Next separately scoped fresh protected backup/source custody plus isolated restore proof; deployment NO-GO unchanged.

## Narrow retained-MIME repair rehearsal — 2026-09-23

Test-only single-writer known-message/missing-attachment repair passed with realPG/LOCAL bytes: retained MIME hash+fingerprint checked, tamper rejected, second serial repair no duplicate, claim evidence untouched. Suite10/10, changedfileTS0, independent review approved; test29182054. Not production tool/operator closure/concurrency/source-provider proof. Partial attachment currently returns processed=true, so source custody must cover Seen/acknowledged mail too. Next bounded source-custody/operator audit/fencing acceptance; production access separately approved. No live/product changes.

## Recipient ordering fix verified — 2026-09-23

Moved unchanged addMessage recipient resolution before transaction, after authorization/content validation. Events stay aftercommit. Order regression RED then203focused/9realPG GREEN; changedfileTS0; independent review approved. Query rejection now leaves no message/status change, still holds/no replay. Tests d3756d51/product e1ff2f0b. No schema/env/live/publication changes; synthetic fixture cleaned. Next retained-source/manual-reconciliation acceptance from TLS plan, not more speculative architecture. Production NO-GO unchanged.

## Recipient-query boundary and recovery gates — 2026-09-23

Test-only9/9realPG suite green with explicitly injected recipient lookup rejection: reply/status committed, attachment absent, held known ticket but unknown message ID, no replay. Not fixed. Independent test review approved; newfileTS0. Existing review API is listing, not source retrieval or recovery. TLS plan now has bounded reconciliation matrix and separates blocking source/repair/operator evidence from deferred generic outbox/automatic retry. Next smallest code candidate: recipient lookup before transaction, preserving aftercommit events and successful routing. No product/live/customer/push/deploy change.

## Reply transaction checkpoint — 2026-09-23

Local addMessage now commits reply+required reopen/SLA writes atomically. Real PG first reproduced two partial-write failures, final8/8 passes including overlapping replies and stale-closed guard. Independent review caught/fixed overstrict reopen predicate; final source/test review approved. Ticket75+intake125regressions and changed-fileTS0. Testsaf6e17bd/product3acd9cb7, no live/push/deploy. Next consolidate remaining manual-recovery/source gates and actual postcommit recipient-query boundary; no broad automatic replay/outbox redesign. TLS plan records limitations. Production NO-GO remains.

## Known held-intake linkage preserved — 2026-09-23

Local IMAP/webhook correction retains returned ticket/message IDs and partial-attachment evidence under unchanged exact-owner hold CAS. No automatic replay/ACK or TicketsService/schema change. Six RED assertions before patch; focused125/125 and realPG4/4 green; changed-fileTS0; independent code/security review passed. Nest @OnEvent suppresses listener errors by default, so prior direct synchronous injection is not live propagation evidence. Before-return IDs/process-crash/reconciliation gaps remain. Next reproduce actual addMessage post-insert status-write failure and assess bounded transaction correction. Tests1ae587eb/productdb3c7529; no live access/push/deploy. Details in TLS transition plan.

## Real domain persistence exposes partial commits — 2026-09-23

Three real PostgreSQL/TicketsService/LOCAL-storage tests passed: normal path byte integrity and replay suppression; injected post-insert events leave partial ticket/message state with held, unlinked claims. This is characterization, not a fix or production event-propagation proof. Independent review approved narrow test scope; existing71regressions pass. No live access/change. Next bounded correction of post-write error/correlation handling, not automatic replay or broad redesign. Detailed setup and limits in TLS transition plan. Production NO-GO remains.

## Attachment collision fixed locally; domain proof open — 2026-09-23

Real-disk test reproduced same-folder/name/millisecond key collision. Minimal UUID key addition +255byte UTF-8 filename bound fixed it; old keys unchanged. Storage/inbound focused71tests passed, independent code/security review approved after long-name correction. S3 is command-mock proof only. Combined ticket/message/storage persistence test not yet completed: source review identifies post-insert failures that leave partial domain state/manual holds. Next disposable full/relation-compatible DB fixture and actual post-commit failure tests; no unsafe replay or broad redesign. No live access/change/publication. Details in TLS transition plan latest checkpoint.

## Real PostgreSQL claim checkpoint — 2026-09-23

Actual Prisma7.4.2 + PG17.10 focused table test4/4: contending unique inserts/observed lock wait, terminal CAS/stale-owner rejection, payload collision evidence preservation, pending owner after client replacement. Existing46regressions pass. Dedicated code/security review led to complete async-operation drainage fix in test only. Synthetic isolated tmpfs DB, no live/customer access. Detailed evidence/limits in TLS plan. Next actual ticket/message/storage persistence and ambiguous post-commit failure proof; no full application/backup/crash durability claim. Production NO-GO remains.

## Actual candidate mail-client checkpoint — 2026-09-23

New opt-in DMS intake test3/3 passed on a clean synthetic mailbox, with actual SMTP/IMAP/parser/service/claim code and explicit fake persistence. Parsed attachment bytes preserved; successful re-poll did not repeat ticket/upload calls; injected ticket failure retained UNSEEN source and did not auto-replay. Existing46focused tests passed, new-file TS diagnostics0. This is NOT realDB/storage/CRM/concurrency acceptance. Detailed boundaries/setup in TLS transition plan. Next disposable PostgreSQL and actual persistence proof, not deployment. No live changes.

## Local Dovecot blocker diagnosed — 2026-09-23

Controlled comparison reproduced Rosetta mmap failure/SIGTRAP at256MiB virtual-address limit only for amd64, not native arm64. Temporary local-only Dovecot1GiB virtual-address override (container RAM still768MiB) allowed actual amd64 SMTP235/IMAPOK, verified TLS1.3 and a synthetic attachment-byte-preserving send/retrieve with UNSEEN retained. Cross-container plaintext IMAP rejected PRIVACYREQUIRED; SMTP AUTH530. No production/config/product changes. TLS plan records exact evidence/limits. Next actual candidate-client integration with isolated state; no application/DB/claim/backup acceptance claimed. Production remains NO-GO.

## Local mail TLS rehearsal — 2026-09-23

Partial proof only: existing wire suite10/10 passed; pinned v15.1.0 amd64 config digest matches previously recorded live ID. Isolated actual-server SMTP STARTTLS negotiated verified TLS1.3 and rejected plaintext AUTH530. Dovecot subprocess signal5/startup failures block SMTP authenticated login and IMAP; arm64-host emulation is suspected, not proven. No complete delivery/retrieval proof. See TLS transition plan local checkpoint for exact evidence and exclusions. Next diagnose locally without relaxing isolation; no production access/change, push or deploy. Production remains NO-GO.

## Mail TLS planning checkpoint — 2026-09-23

Owner accepted staged planning plus bounded read-only metadata investigation. New plan: .ai/issues/2026-09-23-mail-tls-transition-plan.md. Current mail image v15.1.0 identified by immutable digest; configured public certificate is self-signed localhost, not mail.allplan.net.tr. SMTP submission override also explicitly disables TLS security. Live clients disable certificate validation. Backend broad API route labels show gzip only; webhook usage remains UNKNOWN, and bounded proxy configuration checks found no access-log setup. No absence-of-traffic claim.

Next smallest implementation is isolated synthetic transport rehearsal, not live TLS checkbox changes or combined application rollout. Plan requires verified backups, renewal ownership, client inventory, independent mail-writer pause, coordinated settings refresh and approved maintenance; never restore old customer/mail data or automatically revert to plaintext. No production writes/restart/deploy/push, protocol probe or customer content access. Dedicated review unavailable; production NO-GO remains.

## Live mail read-only findings — 2026-09-23

Explicitly approved configuration-only inspection completed viaSSH; no settings/restart/deploy/testmail or customercontentread. Source-consolidation topsection records exactscope/limits. LiveIMAP143/tlsfalse confirmed; Dovecotssl=no/disable_plaintext_auth=no; maildataonpersistentvolume andselectedautoexpunge0. Persistence isnotbackup/recoveryproof. Ports publishedallinterfaces, externalreachabilitynotprobed. Livewebhookcontroller lacks expectedrouteguard/signaturefile andglobalguard inspectedisthrottler; upstreamaccess/callersunknown, no exploitprobe. Thereforewebhookunusednotproven.

CurrentlocaldirectTLScandidate would beincompatiblewithoutapprovedmailtransportwork; productionNO-GO. Nextplan TLS/certificatecompatibility and identifyactualwebhookroute/callers withseparatelyscopedmetadata-only evidence; do notflipTLSblindly,disableingressorbuildanarchivewithoutneed. Secretsnotprinted/decrypted. Existing175testproofunchanged; no newtests/sourcechanges. Independentsecurityagentunavailable(threadlimit).

## Webhook outcome mitigation checkpoint — 2026-09-23

Explicit completed alone returns success; held/unknown resolves to fixed503. Controller10/10, combined17suites175tests, backend294roots0diagnostics; controller-only coverage100%. Synthetic/networkdenied proof, not realHTTP/provider/DB proof. No schema/dependency/live/push/deploy changes. Dedicated reviewer unavailable; final acceptance open. Detailed evidence and source-retention decision tree in source-consolidation top section.

HIGH source-recovery blocker remains:503 is not custody of original message/attachments. Actual webhook provider/use/retention cannot be established from local sources. Next smallest step is separately approved read-only configuration evidence, not blind archive engineering, disabled webhook or automatic replay. Preserve explicit live-access and publication gates. Production NO-GO.

## Local shared inbound claim patch — 2026-09-23

**WIP / HIGH blocker found in final security review:** webhook controller returns HTTP200 even when service returns held; log metadata/fingerprint is not recoverable original content. A pre-write failure or concurrent pending delivery can therefore be acknowledged with no locally recoverable payload. Provider retention/retrieval is unverified. Do not call this durable webhook intake acceptance or source-preserving delivery. Non-2xx alone is insufficient: next batch must prove provider-specific retained-source retrieval or a bounded protected durable-source design plus explicit controller outcome tests. IMAP source retention does not establish webhook recovery. Security-review agent subsequently started successfully and identified this blocker; dedicated code-review agent remained unavailable. No patch approval or release acceptance is claimed.

Owner accepted conservative hold/manual-review behavior. Implemented shared unique-create claim before IMAP/webhook ticket effects, compare-and-set completion, fingerprint identity conflict holds, success-only IMAP acknowledgement, per-message isolation and finally cleanup. Ambiguous/interrupted/legacy deliveries never automatically replay. Partial-attachment completion remains a duplicate fence with retained failure evidence. Missing identity, invalid text and parse failures are held; IMAP holds include safe INBOX UID/UIDVALIDITY locators. No schema/migration or dependency change in this batch.

Read-only GET /email/admin/inbound/review requires JWT plus settings:read, uses no-store and bounded pagination, excludes raw errors/claim owner/fingerprint. This is an API, not a new frontend review screen; there is no retry/delete/clear action. Settings permission is the existing authorization boundary, not a newly invented role. Manual reconciliation must inspect the mailbox, ticket and attachments before any separately approved action. Webhook HTTP success proves neither recoverable intake nor ticket creation. Unconditional success and absent payload persistence predate this patch; newly held missing-identity/legacy/pending/conflict paths expand that recovery gap.

Local proof: combined14suites/158tests PASS; actual dependency controls13/13 PASS; backend no-emit294roots/0diagnostics. New helper19tests coverage90.12% statements/85.29% branches/100% functions/97.05% lines, NOT whole-project coverage. Initial behavioral RED9/11 and later malformed-input/UIDVALIDITY RED2/15 verified before fixes. All synthetic, cleared environment and network-denied macOS Node24.18.0; existing schema-matched sibling DB declarations used, no real database/bootstrap/mailbox. Architect independently reviewed parent integration; parent reviewed helper/endpoint. Dedicated final code-reviewer could not start due agent-thread limit: final independent code/security acceptance remains OPEN. GitNexus/report unavailable, direct callpath review used.

Remaining release blockers for this patch: disposable PostgreSQL concurrency/failure proof, exact Node20/Linux image acceptance, operator review workflow, verified ingress sender authentication/resource limits and current TLS compatibility. All writers must be quiesced and upgraded together: legacy writers do not honor new markers. No mixed-version rollout or blind replay of held rows. Existing image76432 does not contain mail patches. Existing broader vulnerability/bytes/forward-recovery/host/fresh-backup gates remain. No production access, provider/DB action, push or deploy; production NO-GO. Local checkpoint is work-in-progress evidence, not release approval.

## Inbound retry behavior requires explicit hold/review decision — 2026-09-23

TEST/PLAN-only follow-up to66e0c9f5. Nine synthetic characterization cases reproduce current gaps: markSeen-before-parse, batch abort, missing connection cleanup, two ticket/reply writes after mocked post-commit failure, and two writes from concurrent IMAP/webhook despite one unique log. Successful completion and partial-attachment fences plus poll-lock reset remain controls. These tests passing means defects reproduced, NOT reliability acceptance or a RED/GREEN fix. Existing105mail regressions and13dependency controls still pass; no product code, config, DB or live change.

Independent planner/security reviews found that both ingestion services share the unsafe find/upsert path, and TicketsService can throw after a write. Do NOT change markSeen:false alone or add an IMAP-only lock. Proposed minimal next patch: shared durable claim before domain effects, explicit outcomes, success-only acknowledgment, cleanup, and a visible private review list. Ambiguous/interrupted/legacy unprocessed states must not auto-replay. This can delay legitimate mail pending operator reconciliation; obtain owner agreement to that workflow before implementation. No current adminAPI/UI exposes these inbound logs. Identity collisions/UIDVALIDITY and From authentication remain explicit separate risks; no current live loss proven.

No production observation/action/push/deploy. Sourcef73a6902 mail patch remains unbuilt in old76432 image; all artifact, bytes/recovery and host gates remain NO-GO. Detailed decision and evidence: source-consolidation top section.

## Mail dependency patch verified locally; acknowledgment safety next — 2026-09-23

Local test checkpoint bcc84323 and patch f73a6902: exact mailparser3.9.28 + nodemailer10.0.10 replace both vulnerable direct6.10.1 and nested7.0.13 paths. Original bounded actual-parser tests RED6pass/2fail → GREEN8/8; five additional compatibility controls make13/13. Both old paths copied8256 array elements for128addresses; patched paths copied0. Existing mail9suites/105tests and real loopbackTLS10/10 pass; previous WebSocket15/15 still pass. Backend no-emit293files/0diagnostics after a named type-only import adaptation; emitted provider/spec JS unchanged. Independent code/security review approved this bounded diff; Gitleaks found no leaks in changed-source/test scans.

All checks used local Node24.18.0, actual RC dependencies and disclosed schema-matched sibling DB declarations where needed. No app bootstrap, DB/customer records, real mailbox/provider, production access, push or deploy. Exact Node20.20.2 image rebuild/scan/acceptance remains pending; existing76432 image does NOT contain this mail patch. Its2Critical/123High inventory is pre-mail-patch and must not be relabeled.

Next smallest batch: characterize parse/process/attachment failures and successful acknowledgment in mocked IMAP tests, then minimal retry/idempotence/cleanup fix separately. markSeen-before-processing remains unresolved, as do parser resource limits and historical IMAP143/tlsfalse compatibility. Do not weaken TLS or infer current live settings from old screenshots. Retain remaining artifact, crawler, attachment-byte/forward-recovery and separately approved host/credential/fresh-backup gates. Production NO-GO.

## Patched exact image verified; mail characterization tests next — 2026-09-23

Clean source2e9c7ebf produced Linux/amd64 image76432eed; A13 static smoke passed. Same15 WebSocket controls against actual old/new images: old7pass/8expectedfail → new15/15pass, Node20.20.2, networknone/no app bootstrap. Compiled CSRF redaction and nonroot/app permissions still pass. Same pinnedTrivy0.72.0/frozenSeptember22DB:2Critical/128High/183Medium/23Low →2Critical/123High/182Medium/23Low. Exactly6expected findings removed,0added; no unrelated finding changed. Independent security evidence review verified identity, hashes, versions and comparison. Evidencevuln-ws-20260922-amWugP; scanner/test containers absent. No live/DB/push/deploy action or product edits in this phase.

Next smallest batch: inspect mailparser/nodemailer advisory preconditions and compatibility, then bounded synthetic-mail tests before selecting versions. Preserve mail-to-ticket, never connect real mailbox or force major overrides blindly. Remaining2Critical are the same tar advisory under globalnpm/pnpm; application69High and tooling54High still require decisions, not count-based dismissal. Newimage full browser/DB/mail acceptance is NOT inherited from6ae3; complete after the narrowly scoped remaining fixes. Crawler containment, bytes/new-write forward recovery, frontend and separately approved host/credential/fresh-backup gates remain. Production NO-GO.

Mail triage now complete, no dependency/source change: directnodemailer6.10.1 versus mailparser3.9.3→nested7.0.13. Inbound addressparser runs BEFORE sender eligibility; CRM restriction does not contain parser DoS. markSeen:true at fetch plus caught processing failures may remove retry eligibility; no physical deletion/current-live loss demonstrated. Existing focused9suites/105tests PASS (mocked, networkdenied, RCdeps+borrowedmatchingDBclient), not missing-case acceptance. Next add tiny synthetic actual-parser/SMTPcompile controls and mocked failure/ack-order RED tests, then separately review coherent upstream dependency pins and acknowledgment fix. Current upstreammailparser3.9.28 declaresnodemailer10.0.10; candidate only, not installed/approved. Nodemailer10 changes Node/module/types contracts, so do not blindly override7→9/10. Historical IMAP143/tlsfalse conflicts with local directTLS requirement; current live configuration remains unverified and must not be changed from a screenshot.

## WebSocket dependency patch verified locally; artifact gate next — 2026-09-22

Supersedes the proposed versions below. Local regression checkpoint `0ded9b6d` and dependency checkpoint `2b402a84` pin engine.io6.6.10, socket.io-parser4.2.7 and ws8.21.1 through scoped same-major overrides. Independent security review rejected the initial6.6.7/8.21.0 targets because newer related protocol-mismatch and empty-fragment fixes were required. RED demonstrated those three failing controls; final15/15 dependency tests and46/46 gateway tests pass. Actual RC dependency resolution verified; backend/frontend no-emit typechecks report0 diagnostics using schema-matched sibling generated DB declarations only. No generated client, application source, Dockerfile, schema or migration changed.

Next smallest gate: build this committed source into a new pinned Linux/amd64 backend with existing A13 tooling, then compare its vulnerability inventory using the same advisory DB and repeat bounded artifact acceptance. Existing6ae3 image and its2Critical/128High counts are PRE-patch; neither the image nor production inherits local source changes. Do not claim a reduced image vulnerability count yet. Remaining mail/parser, tooling, crawler containment, persistent-byte/forward-recovery and separately approved host/credential/fresh-backup gates remain. Production NO-GO; no live access/push/deploy. Avoid unrelated upgrades. Detailed proof and limitations in source-consolidation.

## Exact-image vulnerability inventory complete; targeted remediation remains — 2026-09-22

Local offline Trivy0.72.0 scan of candidate6ae3 and previous LOCAL b112 used the same freshly acquired advisory DB (updated September22 07:24UTC). Both reports have identical finding sets:2Critical/128High/183Medium/23Low; no added/removed findings from the CSRF-log rebuild. Counts are package-location occurrences, not active attacks; the two Criticals are one tar6.2.1 advisory in global npm and pnpm.74High occur in the application dependency tree,7 in globalPrisma,19High+1Critical in npm,28High+1Critical in pnpm. Alpine264packages yielded0findings; no blanket native/Node-runtime security claim. Old0Critical/71High historical counts are not comparable to this pair without the same artifact/DB/scope.

Next smallest remediation: bounded WebSocket dependency patch (engine.io6.6.5, socket.io-parser4.2.5, ws8.18.3; advisory fix candidates6.6.7/4.2.7/8.21.0), existing gateway/session/authorization regressions plus bounded malformed-input controls, then rescan/rebuild as appropriate. Do not bulk-upgrade or remove pnpm/Prisma: current normal startup uses both. Separate next batches: mailparser/nodemailer, document parsers, retained package-manager tar and remaining advisory reachability. Crawler source additionally has privileged URL intake but no wired SsrfGuard and browser no-sandbox; transport/redirect/subresource containment requires a release decision, not dismissal based on admin roles or zero Chromium scan findings.

No code/dependency/lockfile/DB changed. No application image boot, production access/push/deploy or live vulnerability test. Scanner containers removed; images/private archives/reports retained. Evidence `.private-data/release-evidence/vuln-6ae3-20260922-GNSnSY/`. Source mapping completed by explorer; independent security review stopped at usage limit, so no approval claimed. Parent verified artifact descriptor chains, report hashes/counts/comparison and cleanup; full90uniqueHigh/Critical advisory adjudication remains open. Production NO-GO. MailTLS/bytes/forward-recovery/approved-host/fresh-backup gates remain.

## Patched exact backend built and auth gate passed — 2026-09-22

Supersedes the pending patched-artifact gate below. Clean source6a0be372fa190cff72fdf8bbfed8db6f33a055cc produced Linux/amd64 image `sha256:6ae3a63850864c28e2dedaafa5056c453dc94fc73b3afd85092302c22b5dbe0c`. Existing A13 build/static smoke passed, receipt hashes and local image identity checked. Static compiled inspection verified both fixed CSRF warnings and absence of legacy interpolation without importing/bootstrap. No product source change this turn.

One new isolated run `cde676d3cece` passed all12 real-browser auth/reset checks, unexpected0/proxyErrors0 and durable synthetic-state verification. Historical clone counts180tickets/563messages/114attachment records unchanged; users1285→1286 is one fixture. Original reference checksum unchanged; exact owned containers/network/volume absent after cleanup. Independent receipt review agreed. No live access, push or deploy. This is not current production data, complete row/attachment-byte parity, dashboard/publicTLS/automatic frontend refresh or exact production frontend acceptance.

Next smallest gate: vulnerability assessment of this exact image using the existing pinned scanner, recording advisory DB freshness and impact/reachability decisions. Build downloaded dependencies and updated OS packages despite unchanged Dockerfile/lockfile; previous advisory counts cannot be inherited. No new-image vulnerability scan yet. Existing installed Trivy0.72.0 image is available; cache/freshness unverified. Avoid broad dependency upgrades without demonstrated risk. Mail TLS, historical bytes, write/byte-preserving forward recovery and separately approved host/credential/fresh-backup checks remain. Production NO-GO. See source-consolidation for exact receipts, hashes and test scope.

## Actual-backend browser auth gate passed; final patched artifact next — 2026-09-22

Supersedes the unresolved browser/transport gate below for the tested artifact. Local run `46931334e73b` passed all 12 functional auth/reset checks, aggregate unexpected=0/proxyErrors=0, and durable synthetic-user DB verification. Old access/refresh were rejected before renewed login; reset replay and old password were rejected; new login/me/cookies worked. Session version incremented once, reset consumed, CUSTOMER authority preserved, no synthetic queued/sent mail. Historical local snapshot counts stayed 180 tickets / 563 messages / 114 attachment records; users1285→1286 solely includes the new synthetic fixture. Counts are NOT current production data or complete postboot row/attachment-byte parity.

Tooling `1b625c45` adds Connection:close only to intentionally denied403 responses. Data-free A/B correlated a baseline ECONNRESET with context teardown on an idle socket with6/6 responses finished; two four-login candidate repeats passed without exceptions. All clientError codes remain fatal. RED15/16→GREEN16/16; combined44/44; independent code/security review approved. No application code changes this turn.

Evidence `.private-data/release-evidence/auth-browser-46931334e73b/`: frozen backend3403ae61/imageb1126e5c and browser53f55fae; this backend still lacks source-only CSRF log fix0dc5aac0. Local dev frontend uses the disclosed narrow redirect adapter/single-SPKI certificate exception. Dashboard rendering, frontend automatic refresh and public TLS are explicitly NOT accepted by this test. Reference dump hash unchanged; sampled egress checks passed; all exact owned containers/network/volume removed and fresh label inventories empty. No live access/push/deploy.

Next smallest release gate: use existing exact-image tooling to build a clean, pinned Linux/amd64 backend containing0dc5aac0, verify compiled redaction and rehearse that immutable artifact. Do not reuse this older image's pass as final-artifact acceptance. Dependency downloads may be needed; no offline-build claim. Mail TLS, historical attachment bytes, new-write/byte forward recovery, exact artifact vulnerability decisions and separately approved host/credential/fresh-backup gates remain. Production NO-GO.

## Post-login route diagnosis fixed; transport lifecycle still open — 2026-09-22

Local tooling checkpoint50cfa072: data-free actual frontend/browser reproduced unprefixed GET /my-tickets RSC rejection and proxy assertion on the exact POST /__nextjs_original-stack-frames route. Exact unprefixed /my-tickets and /dashboard GET/HEAD are now classified as intentionally blocked; proxy returns403 for either known blocked class after host/header checks and before body/upstream. No dashboard forwarding, cancellation exemption or generic-counter suppression. RED13/15→GREEN15/15, combined43/43, independent code/security review approved.

Two corrected four-login synthetic repeats had zero unexpected requests/proxy-handler assertions, but each aggregate still FAILED with proxyErrors1. The instrumented repeat isolated server clientError ECONNRESET; causality with page/context teardown remains UNPROVEN. This is not evidence of a production auth defect or full acceptance. No new customer-data clone run or backend rebuild. Exact owned diagnostic container removed; original reference and live systems untouched. Existing all12 functional checks from bf0cb00ff119 remain historical partial evidence, not a new pass; final durable fixture verification still pending.

Next bounded step: correlate transport error with owned request/socket/browser lifecycle in a data-free test; do not blanket-ignore ECONNRESET. Then complete actual-backend aggregate/durable-state acceptance and rebuild/rehearse exact backend including0dc5aac0. Existing build tool is suitable but NOT guaranteed offline/cached (source COPY invalidates dependency layer); registry access must be accurately scoped. Mail TLS, historical attachment bytes, new-write/byte forward recovery, artifact vulnerabilities and approved host/credential/fresh-backup gates remain. Production NO-GO; no live/push/deploy authority.

## CSRF logs fixed; all12 auth checks true, aggregate gate still fails — 2026-09-22

Product0dc5aac0 removes sensitive request interpolation from exactly two CSRF warnings; regression886ab2eb executes the actual extracted middleware without bootstrap.4/4 pass after RED3fail/1pass, whole-backend borrowed-resolver TypeScript0diagnostics, independent code/security review. No auth decisions/cookie/status/body/env/schema changes. This fix is LOCAL SOURCE ONLY: old3403ae61/b1126e5c image and production do not acquire it automatically.

Data-free real frontend/browser diagnosed Next dev redirect to wrong httpslocalhost53301 authority. Strict test-only adapter3d7a61a9 preserves status/body/cookies and normalizes only the exact frontend login307/308 Location; data-free UI now passes with normalized1/unexpected0/proxyErrors0.13/13 browser-helper tests and41/41 combined focused tests pass. Not production routing/TLS proof.

One subsequent actual-clone run bf0cb00ff119 reached all12 functional assertions: expiry401, real login/me/cookies/refresh, CSRF403/404 control, reset200+redirect, oldaccess401/oldrefresh403 before renewed login, replay401, oldpassword401, newlogin/me200. BUT final unexpected counter4 (two categorized GET other-path RSC requests, two not categorized) fails the aggregate; proxyErrors0, normalizedDevRedirects1. No full acceptance claim; final scoped DB fixture verification/postcounts did not execute. All owned resources cleaned and label inventories empty. Original sanitized September17 reference unchanged; no live access/push/deploy.

Next: data-free reproduction of remaining unexpected requests/cancellations; classify rather than suppress. Then finish aggregate+durable fixture acceptance and build/rehearse a final exact backend image including0dc5aac0. Do not repeat expensive clone runs merely to guess unknown paths. Mail TLS, historical bytes, new-write/byte forward recovery, image vulnerabilities and separately approved host/credential/fresh-backup gates remain open. Production NO-GO.

## Actual-backend browser acceptance: partial proof, not a pass — 2026-09-22

Local-only continuation now joins the frozen3403ae61/backend imageb1126e5c with the actual frontend, a newly restored sanitized September17 DB clone and fresh Redis. Reference artifacts and production remain untouched. Fixture tooling committed asd8ad410c; no application changes in this batch. New random synthetic CUSTOMER4 identity is the only browser-accessible identity; no customer dashboard is fetched, no provider traffic or mail issuance is allowed.

Run e87e6bc3ed75 passed expired-reset401, UI login200, real /me200, Secure/HttpOnly/domain/path/SameSite cookie checks, browser-native refresh200 and missing-CSRF403 versus valid-CSRF routing404. Reset returned200, but its subsequent login navigation failed with one unrecognized same-origin RSC request. Full reset/revocation/replay/new-password and durable final-state acceptance are therefore OPEN. Do not interpret six partial checks or helper tests as full browser acceptance. No production bug conclusion from the route guard alone.

Migration/preboot protected parity and zero structured credentials passed on the disposable clone; counts180tickets/563messages/114attachment records/1285users are the historical local snapshot, NOT current production counts. Internal-network public TCP/DNS and all resolved host-canary samples were blocked. Exact owned resources were removed and absence rechecked. Browser source uses a scoped local certificate exception; no public TLS, cross-origin CORS, production frontend artifact or complete postboot historical-row parity proof.

Final diagnostic-only run b312d31c0bc4 reproduced the same six passed checks and redirect failure; added fixed locale categories still returned other-path, so the exact route/root cause remains unknown. Cleaned resources and label absence verified. Probe checkpoint96262774,36/36 combined helper tests; no allowlist expansion or weakened assertion. Stop full-clone retries for this route issue. Next smallest step is a data-free frontend redirect reproduction, then complete real-browser acceptance. Separately fix demonstrated CSRF rejection log token interpolation in backend main.ts before release; raw application logs were deliberately not retained here. Mail TLS, historical attachment bytes, write/byte-preserving forward recovery, exact-artifact vulnerability and approved host/credential/fresh-backup gates remain. Production NO-GO; no push/deploy authority.

## Isolated browser gate passed; reset feedback fixed locally — 2026-09-22

Supersedes the runner-blocked status below. Actual nonroot native-sandbox Playwright in a read-only, network-none Linux/arm64 test container completed all nine synthetic-API frontend scenarios. Clean RED:7/9, with only invisible password-mismatch and reset400 feedback failures; GREEN:9/9 after changing only reset-password page notification calls to the existing mounted Radix toaster. Same assertions; unexpected requests/workers0. Seven harness helper tests and full frontend TypeScript check passed. Independent code/security reviews approved; local commits2cc00aab(tooling),98c21bed(page). No shared notification redesign.

This is rendered frontend/synthetic-API proof, NOT real backend/browser cookie/TLS, migratedDB, success-toast visibility, expired/replayed reset401, exact production frontend build or full production readiness. Backend runtime3403ae61/imageb1126e5c remains unchanged; frontend now includes the one-page fix. The Linux test runner uses pinned Playwright1.58.2/Node24.13.0, no host mounts/ports/secrets/customer data. A separately reviewed seccomp derivative allows only one additional syscall(chroot) for Chromium's user-namespace sandbox; no capability addition or sandbox disabling. Details and failed setup attempts are retained in source-consolidation.

All nine owned temporary test containers were removed; test images and private staging retained. No live, DB/Redis/provider, push, deploy, restart or migration action. Next smallest gate: review and prepare existing isolated sanitized-clone acceptance to compose actual candidate backend with browser auth/reset; preserve provider-egress isolation and fresh contexts, no raw customer DB boot or reuse of production cookies. Mail TLS, historical attachment bytes, write/byte-preserving forward recovery and host/credential/fresh-backup release gates still remain. Production NO-GO.

## Synthetic browser gate blocked by local runner — 2026-09-22

No product changes or production access. Added a reviewed, opt-in synthetic frontend browser probe plus two passing invocation/origin-guard tests. Fresh trusted84c3bfe7 frontend snapshot served login/register/reset routes with HTTP200 under a restrictive filesystem/network sandbox; this is NOT rendered-browser acceptance. Borrowed Node24/dependencies and native dev font fallback are not production artifact proof.

Browser execution is blocked: original macOS network profile denied Chromium's Unix ProcessSingleton bind; narrowly allowing Unix bind retained the successful TCP egress canary, but native Chromium child sandbox initialization then failed with EPERM and GPU/network-service termination. All nine scenarios stopped at setup. Do NOT disable Chromium's native sandbox or remove the OS egress boundary just to obtain passing tests. Owned Next/browser processes were stopped; scratch source/cache retained privately.

Next smallest step: one disposable Linux container with browser and frontend on loopback and `--network none`; no production credentials, customer data, user profile, published ports, Docker socket or host-directory mounts. No compatible browser image is installed yet; separate pinned acquisition/build, narrow Linux dependency/executable-path adaptation and nonroot native-browser-sandbox preflight are required. No privileged/SYS_ADMIN/no-sandbox workaround. Keep API responses synthetic for this first UI gate. Static reset-page Sonner calls versus the mounted Radix Toaster suggest invisible feedback, but this has NOT been verified in a rendered browser or production; do not fix broadly from an unexecuted test. Backend frozen3403ae61/imageb1126e5c remains unchanged; production NO-GO and all existing release gates remain.

## Forward recovery accepted; synthetic composed auth proof passed — 2026-09-22

Owner accepted the recommended forward-recovery strategy after explicit warning that maintenance can extend; ADR-022 and AGENTS record the policy. Supersedes the pending choice below and the requirement to manufacture an older fallback, NOT backup/restore, write/byte-preserving recovery proof or remaining release gates. No live/push/deploy/old-image execution approval.

Added one test-only synthetic HTTP composition of actual AuthController/AuthService/access+refresh guards: CRM lookup member/nonmember/unavailable; valid login+refresh → password reset with Redis marker failure → oldaccess401/oldrefresh403/replay401/oldpassword401 → newlogin/access/refresh success with CUSTOMER4 unchanged. In-memory version fault control proves the access denial is not a broken route. New4/4 and complete8authsuites/150tests pass using borrowed matching-lockfile dependencies/Node24 and env-i. This is not exact-image/browser/realDB/provider proof. Product runtime remains frozen3403ae61; only a new spec and docs changed. Next prepare isolated fresh-browser/reset-fragment and migratedDB acceptance without defaultE2E reuse of existing servers/admin storage state. Persistent write/attachment recovery and other release gates remain open. Stop historical archive engineering.

## Recovery strategy needs an explicit owner decision — 2026-09-22

Local comparison eliminates prior18929781/b802 as ready fallback: later CUSTOMER migration violates its unchanged exact-ledger-count boot check, and skipping startup reinstates ticket-management authorization defects. Old302229/d9 remains unsuitable as previously documented. Two independent reviews recommend stopping archive engineering and choosing policy, not creating another parser. Product remains3403ae61;14/14 helper/source tests pass on localNode24, not a new app/DB run.

Proposal ONLY: finish release gates and rehearse pinned-candidate replacement/re-entry plus reviewed forward fixes, preserving migrated DB and persistent bytes; explicitly accept possible extended maintenance and no safe older-version fallback. Alternative: separately scope a hardened older-functionality fallback. Owner must choose; existing rollback requirement/NO-GO is NOT waived. No product changes, live access, DB/image execution, push or deploy. Details and writer/mail/backup/escalation boundaries in source-consolidation. Do not resume old-image inspection or implement a backport before this decision.

## Inert startup config confirmed; safe rollback designation still open — 2026-09-22

Local full-stream metadata read reused the unchanged verifier, passed all existing checks/exit0 and returned only booleans: exact302229image declares expected docker-entrypoint.sh → ./deploy.sh, /app, unspecifiedUser; no Healthcheck key/nonemptyOnBuild; Env present but never exposed. Ciphertext/verifier hashes and private permissions unchanged;27tests pass; product source still3403ae61. No layer-file inspection/load/extraction/execution/live/DB/push/deploy occurred.

Historicald9 JWT strategy lacks candidate DB-backed sessionVersion/status/current-role checks and accepts query tokens; RAG onModuleInit additionally invokes column/index DDL and dataset/settings writes even when deploy.sh is bypassed. Candidate separates that maintenance from normal RAG startup. Source comparison, not compiled-image/runtime proof. Thus default old boot AND an unreviewed direct-node bypass are not accepted fallback paths. Rollback must preserve security semantics as well as candidate-created writes and attachment bytes. Next explicitly review/designate a compatible fallback; use bounded selected-file in-memory/hash inspection only where it resolves that decision, not as a generic extractor or attempt to rehabilitate known-unsafe startup. Execution remains separately approved. Details and stop conditions in source-consolidation. Production remains NO-GO.

## Local modern-image content gate passed — 2026-09-22

Owner continued locally; no new live access, extraction/load/execution or DB action occurred. Versioned verifier and tests added under `scripts/`. Independent reviews plus27/27 synthetic tests passed;237/243 statement lines covered (97.53%, stdlib trace; CLI separately exercised). Real180s-bounded age/gzip verification exited0 at14:58:05UTC: exact302229b2… config,24 ordered layers, OCI index/manifest,53 regular members and24 strictly classified auxiliary records accepted. Core checks were not removed. Compatibility fixes recognize the same zero instant across explicit offsets and only13 source-defined typed-zero fields added to unchanged terminal config.

Scope is modern-image-content integrity plus bounded archive structure, NOT legacy-ID equivalence, host cleanliness, source provenance or runtime/rollback safety. Explicit result: auxiliarySemanticsVerified:false, legacyLoadSupported:false, safeToRun:false. Ciphertext hash unchanged; renamed to `.private-data/live-image-20260922.TfOHUZ/image.modern-content-verified.tar.gz.age`, with private `MODERN-CONTENT-VERIFIED.json`; old pending receipt is marked superseded. Details, hashes and primary-source policy rationale in source-consolidation.

Next: review an inert startup inspection contract and explicitly designate a safe rollback startup path. Any image loading, extraction, execution or isolated runtime rehearsal requires a separate reviewed step/approval; never normal-boot historical deploy.sh or overwrite production with a local/old DB. Do not reopen legacy serializer work or re-download the image merely to seek broader theoretical proof. Runtime product source remains frozen at3403ae61. No push/deploy authority; production remains NO-GO until runtime/new-write/attachment/browser/mail/host release gates are met.

## Resumed private image acquisition completed; format verification pending — 2026-09-22

Owner resumed the paused acquisition. Fresh read-only preflight: same backend-api container/image302229b2…, same September2 start/restart0/running; image size2,470,925,994 bytes; synthetic4MiB SSH read4.75s. NEW strict-SSH/gzip/age stream with disclosed3600s remote timeout completed exit0 at14:19:02UTC. Private ciphertext867,825,356 bytes, directory0700/key/archive0600; old September19 partial unchanged. Destination `.private-data/live-image-20260922.TfOHUZ/image.tar.gz.partial.age` deliberately retains pending name.

First offline verifier rejected extra-member allowlist after complete gzip drain, exact config SHA and24 ordered layer diff_ids passed. Separately reviewed bounded structural diagnostic exited0: all blob addresses match content, OCI index/single manifest binds exact config and same24 uncompressed layers. Remaining24 blobs are captured JSON objects with24 id/23 parent/24 created+container_config+os keys; one config+architecture, consistent with upstream exporter legacy metadata. Counts are NOT legacy-ID validation or full allowlist acceptance.18/18 combined synthetic tests pass. No full-image acceptance/rollback readiness claim; acquired-verification-pending receipt retained. Next close this narrow exporter-format acceptance gap locally before any approved offline startup/rollback work; no re-download or runtime redesign needed.

Postflight14:21:08UTC: same image/start/restart0/running; server159GiB free. No load/extraction/execution, deploy/restart, DB access or publication. Do not repeat acquisition, boot old image or relax checks merely to pass. Exact details/tool hashes and limits in source-consolidation.

## Owner paused work until morning — 2026-09-19

Latest owner instruction supersedes the earlier nighttime timing: resume in the morning, not tonight. Transfer is stopped; no automatic execution scheduled. Preserve the incomplete artifact and current local checkpoint; wait for the owner's continuation.

Owner approved exact-image private acquisition, then explicitly chose to stop the slow transfer and leave it for night. Export stream stopped; pipeline exit1. Only the verified `docker image save` client was signalled; application/container/DB untouched. Backend image/start/restart0/running unchanged afterward. No automatic retry scheduled and no further acquisition/execution authority should be inferred from this pause.

Private `.private-data/live-image-20260919.EcoHCh/` contains mode0600 age identity and encrypted INCOMPLETE partial archive63,061,860 bytes, with explicit failure receipt. It is not a backup, a verified image, or a resumable ciphertext stream. Actual layer/config verification was NOT run. Local offline verifier7tests and independent review passed after fixing header/tail validation gaps. Next agree nighttime timing, start a new bounded complete stream, verify all pipeline stages and exact config/layer content hashes before any offline startup review. No image was loaded/extracted/executed. Details in source-consolidation.

## Authorized live startup inspection confirms rollback hazard — 2026-09-19

Owner explicitly approved read-only image identity/startup inspection. Verified-host SSH to vmi3049865 confirmed backend-api still uses image `302229b2403d…`, Linux/amd64, no OCI revision or RepoDigests. Configured startup is docker-entrypoint.sh → `./deploy.sh`. All four running-container deploy/recovery file SHA256 values exactly match reviewed `d9b21b9d` source. This binds the identified startup hazard to the live container, not the entire image to Git.

Normal old startup includes schema/ledger repair and user/role/data recovery scripts; unsafe to presume an ordinary restart or unchanged-image rollback preserves current data and access policy. Source presence does not prove those conditional effects occurred or active compromise. Container stayed running with identical start2026-09-02T19:03:59.250425823Z/restart0 throughout observation. No restart/deploy, DB/Redis query, environment-value read, settings change, image export or backup operation occurred.

Next authority gate: separately approve private acquisition of the exact image for OFFLINE inspection only (no execution/publication), then review/designate a safe rollback startup configuration and prove new-write/attachment preservation on an isolated migrated clone. No automatic old-image startup or silent direct-node override. Full identity/hashes and limits are in source-consolidation. Production deployment remains NO-GO.

## Extended authenticated HTTP rehearsal passed; rollback artifact remains open — 2026-09-19

Same frozen runtime `3403ae61` / image `b1126e5c…` passed **56/56 real HTTP checks** on a NEW isolated sanitized September17 clone. Added customer own-review and management denials; SUPPORT_AGENT status/bulk/merge with persisted effects; ADMIN status mutation and admin-only lookup; internal-note hiding; two synthetic PNG uploads and exact local-disk/HTTP bytes with owner/staff success and cross-customer/anonymous/internal-note denials. No application, migration, image, role-grant or provider configuration changes. Tool helpers passed14/14 combined tests (new tests first failed as expected); independent contract/security reviews completed before execution.

Run `customer-d7254ddf9d6f`: preboot180 tickets/563 messages/114 attachment records/1285 users; postprobe182/568/116/1289. Additions are two synthetic tickets, five messages (two replies, one staff note, two merge notes), two attachments and four users. Preboot protected parity passed; historical postboot row parity is NOT claimed. Owned resources removed and label inventories rechecked empty. Synthetic upload bytes were ephemeral LOCAL storage, not historical R2 preservation or rollback proof. Production untouched; no push/deploy.

Next release blocker: designate and inspect a trustworthy immutable rollback artifact/startup path before new-write-preserving rollback. The September17 observed backend image ID `302229b2…` is absent locally and has no source attestation; prior local image `b802af…` is NOT a demonstrated production rollback target. Historical tag-matching `d9b21b9d` startup contains schema/ledger and user/role repair operations, so normal old startup cannot be presumed safe. Acquisition from production requires separately scoped approval; do not use an old dump, silently bypass startup, or call same-image restart a rollback. Browser/CRM/reset, historical object bytes, exact-image vulnerability review, mail TLS and host preflight also remain open.

## Exact image and restored-data customer HTTP acceptance passed — 2026-09-19

Frozen runtime source3403ae61 produced Linux/amd64 image `sha256:b1126e5cc5c60adff63fb843c40fe89da4450ba40ed8ef75e5c738b42f7239bf`. Static smoke57/57 migration files and separate UID1000/permission probes passed. Real A13 sanitized Sept17 restore/migration passed protected fingerprints, canonical CUSTOMER4, schema/RBAC checks and second-pass no-op;180tickets/563messages/114attachment records/1285users preserved before app boot.

NEW isolated app clone + fresh Redis, synthetic secrets, internal network/restricted DNS, no ports/app mounts: preboot credential assertion0/protected parity; normal production boot/health passed. Actual customer probe22/22 passed: two synthetic customer logins/tickets/persisted replies, own reads/list scoping, cross-customer denial, internal-note denial and missing-CSRF denial. Postprobe182/565/114/1287; no claim all historical row values remained unchanged during scheduled local jobs. All owned resources removed and absence rechecked. Private artifacts remain; production untouched.

Initial5s login probe timed out on arm64-host amd64 emulation; independent bcrypt12 hash5743ms/compare5677ms explained the lower bound. Only test tooling now permits explicit bounded5..30s request timeout, default5s; successful run used20s and measured login12231/12274ms. Same production crypto/runtime unchanged; this is functional acceptance, NOT native production performance or browser-cookie proof.12/12 tool tests and code/security review passed. See source-consolidation for receipts and limits.

Next bounded gate: use the SAME frozen image (no rebuild for documentation/probe-only commits) for actual customer review/staff/admin permission workflows, attachment-byte access and rollback preserving new writes. CRM admission/reset, browser cookies, fresh exact-image vulnerability assessment, mail TLS and host/production preflight remain separate gates. No push/deploy/live authority.

## CUSTOMER compatibility and ticket authorization fixed locally — 2026-09-19

Added exact CUSTOMER4 database contract and additive migration; no fallback resurrection, seed or user reassignment. Customer-owned PENDING_CUSTOMER_REVIEW remains available for the existing close/review button. Arbitrary status management, merge and bulk update now require recognized staff identity and accessible, nondeleted targets; both merge IDs/all bulk IDs are checked before writes. Published public FAQ remains accessible through its existing endpoint without granting internal FAQ permissions.

Fresh focused backend7suites/123tests pass; backend plus changed/new tests TypeScript0. Real synthetic network-none PostgreSQL17 migration proof7/7 passes, including full rollback on excess grants/alias/missing catalog and preservation/idempotence on empty/partial/fresh CUSTOMER. Synthetic test container/tmpfs removed; existing resources and private snapshots unchanged. This is not exact-image or full customer authentication/browser acceptance. Independent scoped security review approves local commit; production remains NO-GO.

Next: freeze the local checkpoint, rebuild the exact Linux/amd64 artifact, repeat A13 restore/migration on a NEW sanitized Sept17 clone plus fresh Redis, then run real customer/staff/admin login, ticket/reply/isolation and attachment/new-write rollback acceptance. The accepted18929781 image predates this patch and cannot prove it. Keep mail TLS/server compatibility and fresh production backup/inventory as separately approved release gates. No production access, push or deploy in this phase.

## RBAC comparison corrects the customer blocker interpretation — 2026-09-19

Read-only root cause: observed-live-tag d9 source provides five CUSTOMER fallback permissions when DB mappings are empty; candidate4626f627 removes fallback and uses current DB authority. Roles can have been correctly assigned while role_permissions remains empty. Baseline ADMIN14/CUSTOMER0; migrated ADMIN16/CUSTOMER0/SUPPORT_AGENT16; prior postmigration numbers are not live inventory. Canonical checker covers SUPPORT_AGENT, not customer availability. Before granting ticket:update, address source-level missing ownership on transition/link routes with narrow synthetic negative tests. Details in source-consolidation report. No code/live/DB changes; implementation and production remain gated.

## Sanitized full-app boot passed; customer acceptance blocked — 2026-09-19

Exact accepted18929781 backend image booted normally on NEW sanitized Sept17 clone plus fresh Redis; health HTTP200 with DB/Redis/BullMQ/storage/memory up. Preboot structured credential assertion0 and62protected fingerprints matched. No published ports, host binds or real provider credentials; internal Docker network/restricted DNS. Disposable mutable clone only; cron may change local copied records, so postboot business parity is NOT claimed.

Customer probe stopped before fixtures/HTTP: copied CUSTOMER role has0 permissions (ADMIN16, SUPPORT_AGENT16;23permission definitions). Current RbacGuard requires route permissions and JWT authority comes from DB. This is a release compatibility blocker requiring narrow role-policy review, not proof current live service is broken. No roles/permissions were granted to force a pass. No customer login, ticket, reply or isolation acceptance is claimed.

Probe guard tests4/4 pass, including actual stdin execution rejection. Initial stdin invocation silently did not execute and is explicitly excluded from evidence; corrected entrypoint and safe aggregate failure counters verified actual execution (0HTTP checks, AssertionError at role prerequisite). Independent static review covered code/security and persisted-reply proof. Probe uses manual cookie replay, not browser-cookie proof. Raw backend logs were not exposed. New owned app/Redis/PG containers and network were removed; label inventories empty. Original raw/sanitized artifacts and reference resources preserved. No production access, push or deploy. Next inspect minimal CUSTOMER permissions and current-versus-candidate authorization before any RBAC migration; preserve deny boundaries and avoid broad grants.

## Sanitized data artifact ready for gated rehearsal — 2026-09-19

NEW isolated clone:62tables/617columns matched hash-bound approvedSept17schema; wronginventory transaction rejected without datachanges; structured credentials cleared with all62 protected fingerprints preserved. Puretool helper5tests/100% measuredcoverage, code/security review passed. Private sanitized dump then passed unchanged A13 restore+migration/no-op with exact18929781 image;180/563/114/1285 counts retained. Ownedresources removed. Artifact `.private-data/release-input/sanitized-20260919-527f2bdff9/` is sensitive, not anonymized or boot-authorized. Next fresh mutable clone+Redis+blockedegress+synthetic customer API tests; do not start old references. Full workflows/attachmentbytes/rollback/mail/host remain open. No live/push/deploy.

## Synthetic normal NestJS startup passed — 2026-09-19

Exact18929781 backend image booted through unchanged migration/normal entrypoint on NEW emptyPG17+freshRedis, synthetic secrets/LOCAL storage, internal network with restricted DNS, no provider credentials/ports/mounts/customer data. Health ok:DB/Redis/BullMQ/storage/memory up; owned resources removed and absence rechecked. Sample externalTCP/DNS/host-canary egress probes blocked. FreshRedis policy confirmed by owner. Next NEW sanitized mutable Sept17 clone with preboot credential/fingerprint checks; account for cron-created local deltas, not read-only assumptions. Reference sanitizer cannot directly authorize app startup. No push/deploy/live. See source-consolidation for scope/limits.

## Real A13 restore/migration rehearsal passed — 2026-09-19

Unchanged script + accepted18929781 exact image restored the verified September17 capture into NEW isolated PG17 resources. Protected fingerprint/RBAC/schema checks and second migration no-op passed;180tickets/563messages/114attachment records/1285users retained. Owned resources cleaned; original references unchanged. Private0600 plaintext rehearsal input retained under new0700 release-input path, never Git. No app/Redis/provider/live/push/deploy. Next sanitized mutable clone + freshRedis/blocked egress full-app workflows, attachment bytes and new-write rollback. Overall NO-GO. Source-consolidation report records evidence and limits.

## Corrected exact-image smoke passed — 2026-09-19

Image from18929781 passed actual amd64 network-none static smoke plus separate defaultUID1000 permission probes: representative code writes denied; uploads/OpenAPI/screens writable; Prisma/Chromium CLI versions work. Private completed image evidence/checksum verified; no running containers remain.69/69 source/tool contracts passed. This is NOT NestJS boot/DB/attachment/rollback acceptance. Next validate local artifact for existing isolated PG17 A13 restore drill, then sanitized mutable clone + freshRedis/provider-blocked full-app rehearsal. No production/data/provider/push/deploy. Exact digest and limits in source-consolidation report.

## Exact-image permission correction — 2026-09-19

First amd64 image904376e4 compiled but static non-root smoke failed EACCES: private umask077 masked extracted source to0600. Rejected image, no complete evidence published. Fixed Git archive mode normalization/extraction only; private0700/0600 protections retained. RED/GREEN and combined69/69 contracts, actual Git mode probe and independent code/security review passed. Next clean-commit rebuild and exact-image permissions, then isolated app/data rehearsal. No production/data/provider access or push/deploy. Details in source-consolidation report.

## Non-root backend source prepared — 2026-09-19

Final combined regression68/68 passes; independent review approves source-only checkpoint. Prior fixture formatting is retained in a separate style commit. Next exact-image build/runtime acceptance, not production deployment.

Minimal Dockerfile USER node/HOME change with narrow writable uploads/OpenAPI/template screens only; conditional template bases preserve fallback.5/5 source contract tests pass; exact image/runtime NOT yet proved. No migration/boot changes. Existing uploads mounts/custom paths, backup operator directory, Prisma/Chromium and persistence need isolated artifact checks. Prior fixture whitespace diff remains untouched. See source-consolidation report; no live/push/deploy authority.

## Stabilization scope frozen — 2026-09-19

Wire-level local client acceptance completed:10/10 opt-in tests pass with real SMTP/IMAP libraries, valid/invalid certificates and no plaintext AUTH; TypeScript0 diagnostics. This is local Node24/macOS loopback evidence, not production Node20/Linux DMS acceptance. See mail transport report. Next bounded step: backend non-root runtime and exact-image isolated rehearsal; do not start live TLS changes on this evidence alone.

Owner deferred customer feature requests. Only demonstrated release-blocking security, compatibility and data-preservation work belongs in this candidate. Fresh local checks:56/56 migration manifest integrity and63/63 A13 safety contracts pass (fake Docker, not restore proof). Docker accessible with no running containers; cached hardened backend is arm64 without a revision label, not the current candidate. Exact backend Dockerfile still defaults to root and boot still applies migrations. See source-consolidation report's updated gate matrix. No production or database access authorized/performed; no containers started or removed. Next complete wire-level TLS acceptance, then bounded non-root/exact-image and isolated data-preserving runtime rehearsal.

## Local strict mail-client patch — 2026-09-19

Final verification: four focused suites /29 tests pass; backend plus new tests TypeScript no-emit0 diagnostics through isolated dependency resolution. Independent code/security review approved local patch only. No full-release build, real TLS handshake or production acceptance claimed.

SMTP now requires TLS and valid certificates; IMAP requires direct TLS, rejects disabled TLS before credentials/network, and reports errors through existing public contracts.13 mocked transport tests pass after RED proof; actual release source tested with isolated existing dependencies and network denied. No live changes, migration, new env or provider switch. See existing mail transport report for evidence and compatibility warning: current documented live TLS-off endpoints cannot accept this candidate. Next isolated wire-level TLS acceptance and separately scoped certificate/image/renewal inventory; no push/deploy authority.

## Local mail TLS maintenance plan prepared — 2026-09-19

See the top plan section in `issues/2026-09-19-mail-transport-observation.md`. Local SMTP/IMAP both bypass certificate validation; SMTP does not require STARTTLS. No source fix or live change performed this turn. Plan preserves SMTP587, moves IMAP to993 only in coordinated approved maintenance, retains image/volumes, and requires certificate renewal, private off-host recovery, TLS and controlled delivery acceptance. Next: isolated client regression/patch and separately approved read-only certificate/image/renewal inventory. No certificate issuance, DNS edit, restart, settings write, push or deploy authorization.

## Mail file-backup gate completed — 2026-09-19

Owner-approved root-only on-host backup `/var/backups/aluplan-mail-20260919-wvS1G5/mail-backup.tgz` includes mail-data/state/config plusCompose/env. gzip/archivecompare/SHA256 and separate extracted persistentfile comparison passed;31transientsockets excluded. Livecopy notatomic, nooffhostcopy or service-restoreproof. Runtime unchanged; noTLS/restart/deploy/DBwrites. EffectiveSMTP/IMAP TLSoff independently confirmed. Existingmailtransport report holds evidence and limits. Next localTLSmaintenance plan, not livechanges; newauthority required for remediation.

## Mail target correlated, transport prerequisite confirmed — 2026-09-19

Owner screenshot:SMTP587directTLSoff/IMAP143TLSoff atmail.allplan.net.tr. FreshDNS A matchesVPS,MXpoints there; IMAP143CAPABILITY lacksSTARTTLS and advertisesPLAIN/LOGIN. Noauth/messages/datachanges. Browser in owneruse; effectiveTLS/cert and mailbackup checks incomplete. See existing mailtransport report. Next management read-only certificate/backup readiness, then separatelyapproved mailTLSmaintenance; do not deploy strictclientTLS first.

## Mail endpoint compatibility gate — 2026-09-19

Read-only Firefox Coolify inspection confirms Docker Mailserver service; external587 advertisesAUTH withoutSTARTTLS,993refused. App actualtarget not yet correlated, so no plaintext-app claim. Do not deploy strictTLS until actual mailtarget/certificate compatibility verified. See issues/2026-09-19-mail-transport-observation.md. No livechanges/credentials/mail sent/restart/deploy. Next narrowly inspect nonsecret app mail host/port/TLS settings and service runtime; any server remediation needs separate change approval.

## Canonical-history source consolidated — 2026-09-19

Active next-release worktree is `aluplan-release-candidate-20260919` on `security/release-candidate-20260919`. See `issues/2026-09-19-source-consolidation.md`. All885candidate source bytes match,279canonical-only entries preserved. Fresh source-equivalent isolated backend149/1728+frontend47/327 and both typechecks passed; new-worktree/runtime-image acceptance remains untested. Original dirty checkout unchanged. Next bounded runtime/mail TLS hardening, verified mail ingress and isolated data-preserving acceptance. No live/push/deploy authority.

## Active Work

- 2026-08-08 production release readiness preparation is active and **NO-GO**:
  - Canonical audit: `.ai/issues/2026-08-08-production-release-readiness-live-drift-audit.md`.
  - This is not another general code GAP pass; it separates exact local release evidence from live read-only drift, backup/restore, R2, Redis/BullMQ, RAG and rollback acceptance.
  - Audit start baseline was clean at local HEAD `4e1c6819`; ops-safety 24/24, both typechecks, TR/EN/DE i18n, API contract `182/233 missing=0 raw-network=0`, RBAC `12/19` and migration manifest `56/56` passed without package downloads.
  - Release blockers: stale three-migration Faz 8 runbook, fail-open/false-positive DR and backup paths, PG16/PG17 drift, missing exact-image staging/rollback proof, in-process worker/cron overlap risk, unsafe old shadow snapshot, and missing DB↔R2/local-object parity.
  - First authorized work is local-only Faz A: update the runbook and fail-closed release/DR/backup/staging/worker controls. Production/shadow access, migration/seed, push, tag-push and deploy remain forbidden until separately approved.

- 2026-08-08 help-center i18n fix `313e5b47` received independent Codex **GO**:
  - Scope is limited to `messages/{tr,en,de}.json` plus the real-catalog render regression test; no backend, DB, migration, queue or production code changed.
  - All 11 affected admin help components render against all three real catalogs without leaking raw `help.docs.admin.*` keys: 33/33 focused; full frontend 40/40 files and 299/299 tests; frontend typecheck and i18n integrity passed.
  - Independent leaf-key accounting corrects the historical report from 188 to **193 newly added keys per locale**. All 193 are used; the 11 components call 218 unique keys in total and 25 already existed.
  - Pre/post restore bundles and reported SHA-256 values were independently verified. Local frontend/backend dev servers are running on ports 3000/4000; no push, deploy or live access occurred.

- 2026-08-08 announcement email final local closure is complete at product commit `117526b1`:
  - §16's parameterless block, webhook-before-cron status mapping, and >200 starvation blockers are closed.
  - Additional code/security review findings for `@root/@data`, helper arity, partial/decorator AST bypass, and select/update TOCTOU were fixed in the same TDD phase.
  - Final local evidence: backend 130/130 suites (1305 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n/ops/API/RBAC/migration gates, code review and security review all GO.
  - Pre/post restore bundles are verified; product code, tests, and documentation are separated. Claude independent review of `117526b1` is the next requested action.
  - No push, tag-push, deploy, production/shadow access, migration/seed, or live announcement send is authorized.

- 2026-08-08 Claude Phase 4 (`edae3067`) independent Codex verification is complete with **general NO-GO**:
  - Retry-finalization and customer response field minimization are genuinely closed; direct unknown-variable/hash/subexpression and malformed-template guards also work.
  - Remaining HIGH: Handlebars `BlockStatement.path` is not inspected, so parameterless unknown helpers/paths pass and silently render empty.
  - Remaining HIGH: if the provider webhook changes EmailLog to DELIVERED/BOUNCED before reconciliation, a linked AnnouncementLog still in QUEUED is never transitioned.
  - Remaining MEDIUM: both `take:200` reconciliation scans lack cursor/progress or DB-side outcome filtering and can starve rows beyond the first unchanged batch.
  - Independent evidence: backend 130/130 suites (1264 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n/ops/API/RBAC/migration gates and restore hashes passed.
  - Next authorized implementation is a narrow TDD fix for block-path validation, complete QUEUED outcome mapping and starvation-safe batching. Personalized/dynamic announcements, push, deploy and live work remain NO-GO.

- 2026-08-08 announcement email phases §10-13 received an independent Codex review:
  - `d8f42c6d` BUG-02 customer-field parity is GO in its narrow scope; `e4c2ddc8` content-format exposure is additive and GO with non-blocking detector/API-documentation caveats.
  - `df724734` is NO-GO because the Handlebars visitor is not a complete fail-closed allowlist and `AnnouncementEmailSchema` is not enforced at runtime.
  - `f4668592` is NO-GO because reconciliation can terminalize a transient retry failure, misses DELIVERED/BOUNCED webhook outcomes, and exposes internal `emailLogId/error` fields through the customer announcement response.
  - Independent local gates passed: backend 129/129 suites (1230 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n, ops-safety 24/24, API/RBAC/migration contracts, restore bundle hashes/verification, and diff hygiene.
  - Personalized/dynamic announcement sending remains NO-GO. Next authorized implementation must be a separate TDD phase for a complete Handlebars grammar allowlist/runtime schema plus retry-aware delivery reconciliation and customer response DTO minimization. No push/deploy/live work.

- 2026-08-08 announcement email safety BUG-05 is closed locally:
  - Modern `master-announcement` messages now use the `ANNOUNCEMENTS` preference category instead of the `SYSTEM` fallback.
  - A behavioral regression test proves that a registered recipient with `ANNOUNCEMENTS=false` produces neither a BullMQ job nor an `EmailLog` row.
  - Product commit `8f40deef`; test commit `bddd51ac`; focused email/announcement tests `61/61`, full backend suite `125/125` with `1169 passed, 1 skipped`, backend typecheck and diff hygiene passed.
  - Independent code and security reviews returned GO for BUG-05. The separate BUG-04 status/log-linkage defect and the personalization/subject/context/placeholder gaps remain open, so personalized dynamic announcements remain NO-GO.
  - Post-fix restore tag `restore/post-announcement-bug05-20260808-bddd51ac`; verified complete-history bundle SHA-256 `236c1800c7ad09486b7bc5ecde455150c1d773437a6311874e1fa140f5b7b2f6`.
- 2026-08-07 Review Center active-record parity Aşama A is independently closed:
  - Product commit `69655f1c` and restore bundle SHA-256 `466460f32cfb0bddf5a3adc478dd4f64c95f71bf18585a84aa12fb549f2a5c80` received Codex code/security GO and a separate Claude GO.
  - Independent local DB checks confirmed live-chat card/list `0/0` and FAQ candidate card/list `20/20`; all reported test, typecheck, i18n, contract, migration-manifest, and restore-integrity evidence matched without deviation.
  - Aşama A is complete. Global Prisma Proxy/middleware Aşama B remains NO-GO and must not start without a separate inventory, plan, restore point, and explicit user approval.
  - 2026-08-08 user sequencing decision: do not start Aşama B immediately. First complete the next few approved local product improvements; then return to Aşama B as a separate read-only inventory/plan, followed by its own restore point and explicit GO before any implementation.
  - Work is intentionally paused after documentation closure. Push, tag-push, deploy, production/shadow access, migration/seed, and live-data changes remain forbidden.
- 2026-08-07 product taxonomy management is complete locally:
  - `/products` create/update/archive and category create/update/archive now use the authenticated central API client and report non-2xx responses without false success.
  - Backend mutations use validated DTOs, role guards, UUID parsing, normalized duplicate checks, partial unique indexes, and product-first row locking inside transactions.
  - Product/category removal is soft archive; existing ticket/AI/knowledge history is retained. New ticket and AI classification paths accept only active, nondeleted taxonomy.
  - Local PG17 fresh migration, local dev migration, unit/integration/E2E, typecheck, i18n, OpenAPI/RBAC parity, and independent code/security review passed. No production/shadow connection, push, or deploy occurred.
  - Follow-up endpoint-parity audit found three separate pre-existing frontend/backend contract gaps: CRM settings calls nonexistent `/crm/connections/upsert` instead of existing `POST /crm/connections`; profile MFA UI calls four nonexistent backend routes; MJML editor calls nonexistent content/announcement routes and also bypasses the central API client. These are documented only and require separate implementation decisions.
- 2026-08-07 local RBAC/Görev Merkezi prerequisite completed:
  - `packages/database/prisma/rbac-canonical.json` is the machine-readable catalog for controller roles, permissions, and the exact least-privilege `SUPPORT_AGENT` boundary.
  - Migration `20260807090000_add_support_agent_rbac_contract` additively materializes the full 22-permission catalog and creates `SUPPORT_AGENT` with exactly 16 approved permissions; it assigns no users and removes no existing permission metadata.
  - Source and database RBAC contract checks are blocking CI gates. A clean temporary PostgreSQL database passed all 55 migrations and the RBAC database contract.
  - `RbacGuard` now normalizes case plus hyphen/underscore role aliases, matching existing controller literals such as `support-manager` to canonical DB roles such as `SUPPORT_MANAGER`.
  - The local development database has `SUPPORT_AGENT` with 16 permissions and 0 assigned users. Do not assign real users or apply this migration to production without a separately approved rollout.
  - Next product phase is the local-only Görev Merkezi backend summary contract, followed by the sidebar/UI surface and local E2E verification.
- 2026-08-05 prod shadow data safety baseline:
  - Binding rule: all production-data work is one-way `prod -> local`, read-only from production. Never point local `DATABASE_URL` at production IP `167.86.84.107`; never run `prisma migrate deploy/reset/resolve` against production.
  - A read-only production PostgreSQL dump was taken from Coolify database container `lwk8ok04ocg4w4soog0c888g` (`pgvector/pgvector:pg17`), database `aluplan_support`.
  - Raw dump is local-only and git-ignored: `.private-data/prod-dumps/aluplan-support-prod-20260805-193338-pg17.dump`, size `132 MB`, SHA-256 `d12371d0b316fdab1e811fa658a0ca890968596c53d02d3b845cc709679d56da`.
  - Local shadow restore is complete in separate Docker container `aluplan_shadow_postgres_pg17` on `localhost:55432`; existing local `aluplan_postgres` was not overwritten.
  - Shadow env is local-only: `.private-data/shadow/shadow-postgres.env` with `SHADOW_DATABASE_URL`.
  - Shadow DB sanitization is **partial**: CRM connections are inactive, CRM/webhook secrets are removed, and user refresh-token hashes are removed. Faz 7 re-verification found 14 non-empty rows with `settings.is_secret=true` in the supposedly sanitized snapshot. Do not start the app against this shadow or treat it as secret-free until a clone-only sanitizer empties those values and a new dump is created. The existing dump/env remain local-only, mode `600`, and git-ignored.
  - Sanitized reusable snapshot exists locally: `.private-data/prod-dumps/aluplan-support-shadow-sanitized-20260805-194053-pg17.dump`, SHA-256 `2e5f7e09a7e4ffbf61787f978a4a401527be46eae4895a5d7ba26c39ef5d770b`.
  - Prisma read-only status against the shadow DB passed: `DATABASE_URL="$SHADOW_DATABASE_URL" pnpm exec prisma migrate status --config packages/database/prisma.config.js` -> `Database schema is up to date!`.
  - Redis was intentionally not copied from production. Keep local Redis empty/ephemeral to avoid replaying live BullMQ jobs, sessions, cache, OAuth state, or throttle counters.
  - Security cleanup still recommended: remove temporary SSH key line matching `aluplan-codex-dump-20260805` from `/root/.ssh/authorized_keys` on the VPS after no further backup access is needed.
  - Next safe GAP target remains local-only: use shadow DB for BULGU-02/BULGU-18 auth-token negative tests and BULGU-10 migration-history inspection. No live DB writes.
- 2026-08-06 Faz 7 schema parity is complete locally in technical commit `612706c1`:
  - Fresh PG17 and a restored production-shadow clone now converge on the same Prisma schema, with only the explicitly allowlisted externally managed partial FAQ embedding index remaining.
  - The additive parity migration contains no DROP/DML, has lock and statement timeouts, and preserves all 61 business-table/sequence fingerprints on the restored clone.
  - Full backend tests pass: 116/116 suites, 1020 passed, 1 skipped. Final code, database, and security reviews approve the local commit.
  - Production still has both the foundation and parity migrations pending. Faz 8 remains maintenance-window-only and requires explicit user approval; no production connection, migration, deploy, or push occurred.
- 2026-08-06 code-intelligence tooling boundary:
  - Graphify 0.9.30 was refreshed locally over 835 code files: 7,338 nodes, 14,249 edges, 614 communities. SQL structural coverage is incomplete because `tree_sitter_sql` is not installed.
  - GitNexus is not currently installed and no local `~/.gitnexus` index exists. Historical index counts in AGENTS.md are stale evidence only.
  - Do not install or run current GitNexus for this commercial product until a commercial-use license/right is confirmed; upstream package 1.6.9 is PolyForm Noncommercial 1.0.0.
- 2026-08-05 consolidation follow-up:
  - Active repo is now the git-tracked single working directory at `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-support-desk-v02-main-live-site`.
  - `b73ae3f7` recorded the local consolidation baseline; push remains forbidden without explicit user approval.
  - BULGU-23 backend direct-console cleanup is complete locally: CLI/diagnostic helper output uses Nest `Logger` via `createCliLogger(...)`, direct `console.*(` calls under `apps/backend/src` scan clean, backend lint/typecheck and `git diff --check` pass.
  - Next safe local technical target is BULGU-11/Faz 3.4 PBT flakiness stabilization for `ai-pipeline-optimization.pbt.spec.ts`.
- Ticket filter hardening completed locally:
  - tickets page filters now use explicit status chips plus scope and submit-based search instead of the previous status dropdown/fake metric cards.
  - backend list API supports `search` and `includeStatusCounts`; status counters respect scope/search while ignoring only the active status filter.
  - `DRAFT` is now included in the frontend status model and `tr/en/de` translations, closing the production `tickets.status.DRAFT` missing-message class.
  - frontend hides status counters when `statusCounts` is absent, avoiding misleading zeroes during backend/frontend deploy skew.
  - targeted backend/frontend tests, backend/frontend typecheck, i18n check, and `git diff --check` passed on 2026-06-30.
  - deploy order: backend first, then frontend; monitor ticket list API latency after deploy because relation-aware search is production-data dependent.
- SupportAnswerOrchestrator parity fix completed locally:
  - live SUP-00136 showed customer ticket-opening AI returning `NO_MATCH` before synthesis while admin ANN could draft a useful answer from the same intent.
  - the retrieval-context acceptance decision now lives in `SupportAnswerOrchestrator.shouldGenerateFromRetrievedContext(...)` instead of being a raw threshold `if` inside customer `AiQueryService`.
  - customer query and stream query both use the orchestrator decision, including effective threshold, result count, audience, and visual-evidence allowance.
  - regression coverage protects threshold-edge synthesis for the 3B grid/Axis Grid style case with `topScore=0.8034`.
  - `allplan-help/` is ignored locally so the raw official help mirror cannot be committed accidentally.
- Operations dashboard implementation is complete and local-only until the user chooses to deploy:
  - Phase 1 backend aggregate endpoint added at `GET /dashboard/ops`.
  - Endpoint returns real DB/queue-backed operations data for active tickets, SLA pressure, AI quality/cost estimates, CRM changes, knowledge/crawler state, system health, live feed, and trend series.
  - AI cost data is intentionally visible only to admin/superuser roles; support agents receive `cost: null`.
  - Empty trend series are deterministic zero-value series, not decorative fake data.
  - Phase 2 frontend shell now consumes the aggregate endpoint for admin/staff dashboards while preserving the customer dashboard path.
  - The new shell includes top live-cost/system drawers, KPI cards, operations pulse cards, active support desk, action queue, live feed, and tabbed operations workspace.
  - Dashboard i18n coverage is complete for Turkish, English, and German.
  - Layout is mobile-first: KPI and pulse cards stack on small screens, the live ops column drops below the header, and fixed-height panels use internal scroll instead of page overflow.
  - Phase 3 made pulse cards actionable: each pulse opens a responsive real-data modal with larger trend chart, linked records, and operational action links.
  - Live modal follow-up is in progress:
    - modal segment controls are no longer decorative; ticket, AI, CRM, and Knowledge pulse modals read real `pulse.details` segments from the backend.
    - empty modal filter slices now stay empty instead of falling back to unrelated generic records.
    - CRM modal records suppress raw CRM payload snippets, group field-level Dynamics changes by local customer/account, and link contacts through `User.id` so customer detail routes resolve.
    - frontend tests now cover that selecting a modal segment changes the displayed records.
    - Operations Workspace now keeps Overview, CRM, Knowledge Pool, and LearnNow only; the redundant AI Health tab was removed from that panel.
    - CRM, Knowledge Pool, and LearnNow workspace tabs use mockup-style decision panels plus linked record lists backed by real ops data.
    - modal segment controls now show per-segment record counts and use the backend-provided decision text for the selected slice, so empty filters such as failed imports are visibly empty rather than appearing inert.
  - Phase 4 added controlled refresh: manual refresh plus 60-second background polling for staff/admin dashboards, with visible last-updated state and no customer-side polling.
  - Phase 5 final verification passed backend tests/typecheck, frontend typecheck/build, dashboard unit tests, i18n check, and diff hygiene.
  - Deployment should include both services: backend first for the new endpoint, then frontend for the new UI.
- Live bug closure pass in progress:
  - AI answer quality hotfix now treats localized no-knowledge text as `NO_MATCH`, repairs mixed-language LLM answers, and gives crash/freeze queries a safe LOW-confidence triage instead of an unrelated source-backed no-answer.
  - static backend routes are guarded against dynamic `:id` shadowing for team skills/agents and ticket by-number/bulk endpoints.
  - user/customer/CRM email writes now normalize to lowercase and legacy mixed-case matches are resolved case-insensitively.
  - customer list search no longer hides backend CRM account-name matches with a second client-side global filter.
  - SLA stats now return priority buckets for the dashboard distribution cards.
  - deterministic AI fallback refuses BIMPLUS storage answers from unrelated license/home-office evidence.
- Customer ANN-quality synthesis now replaces the quick-answer posture:
  - ticket-opening answers target the same analytical depth as admin ANN drafts.
  - no-knowledge responses with retrieved context are retried through a second-pass synthesis before any deterministic fallback.
  - wait-mode customer diagnosis allows up to 120s and two no-knowledge recovery attempts.
  - ticket-opening UI tells the user a grounded answer is being synthesized and uses screenshots/files as first-class evidence.
  - desktop ticket-opening wait UX now shows a subtle sanitized semantic data-rain page background and fades out only after the AI response resolves; mobile skips this effect.
  - URL-only/navigation-only ticket-opening input is now stopped before RAG retrieval and returns a localized clarification instead of a random high-confidence match.
- Rich Message Composer MVP completed:
  - ticket detail now uses a TipTap rich reply composer for admin/customer replies.
  - message history and ticket descriptions render through a safe rich/plain renderer.
  - AI Copilot markdown drafts are converted into sanitized readable HTML before insertion.
  - backend accepts `contentFormat: HTML` only for ticket message bodies and applies strict allowlist sanitization.
  - no Prisma migration was added; sanitized HTML is stored in the existing message field for this MVP.
- Phase 1 RAG relevance/cache fix is committed. Continue with a measured RAG quality program, not ad-hoc browser questions.
- Use `.ai/rag-quality/acceptance-questions.json` as the active acceptance set before importing more files or changing retrieval logic.
- Faz 6 live API acceptance completed:
  - current set is 26 questions after adding `rag-tr-dwg-layer-reference-001`.
  - 24 in-scope vendor PDF RAG checks pass.
  - 2 remaining failures are out-of-scope for vendor PDF RAG: Hotinfo diagnostic flow and AI-optional ticket creation help.
  - 5 critical customer answer smoke checks pass with 0 source leaks.
- Faz 4 narrow retrieval fix committed: negated license intent and pilot/canonical preference target checks pass.
- Faz 5 source-gap decision is documented in `.ai/rag-quality/source-gap-plan-2026-05-15.md`.
- Batch 012 source-gap import completed for Allplan Share/Cloud and Project Data Management:
  - 4 PDFs registered from `dataset/**/batch-012`.
  - 4/4 sync logs ended as `SUCCESS`.
  - 179 embeddings written as `v2_2 / 3072`.
  - `rag-tr-share-cloud-001` and `rag-tr-project-backup-001` now pass retrieval acceptance.
- Hotinfo diagnostic flow is now treated as ticket-specific context, not global RAG corpus:
  - raw Hotinfo traces stay out of retrieval query to avoid source pollution.
  - safe Hotinfo system signals can enrich retrieval when the user explicitly asks for Hotinfo/system analysis.
  - prompt context includes richer Hotinfo fields for final diagnosis.
  - license/transfer/activation queries now also receive safe Hotinfo retrieval signals, because Allplan version/build materially affects source applicability.
  - unreadable legacy license-file traces are treated as low-trust legacy telemetry, not as proof of an invalid modern Cloud/Wibu license.
  - raw license numbers, `_SEC.NSE` paths, and raw Hotinfo traces stay out of retrieval/search prompts.
  - admin Copilot and customer AI query now use the same safe Hotinfo search-signal policy for version, build, license, and hardware context.
  - structured GPU card details, including secondary GPU VRAM/RAM/driver fields, are injected into prompt context for final diagnosis.
- Product-flow Phase 1 API acceptance completed:
  - `.ai/product-flow/run-product-flow-acceptance.mjs`
  - 9/9 pass.
  - verifies Hotinfo upload/profile persistence, AI context without raw trace leak, AI-optional ticket creation, ticket Hotinfo snapshot, and raw Hotinfo download RBAC.
- Product-flow Phase 2 UI acceptance completed:
  - `.ai/product-flow/run-product-flow-ui-smoke.mjs`
  - 12/12 pass.
  - verifies customer UI login, ALLPLAN selection, `.hxl` upload, AI skip, direct ticket creation, admin UI ticket visibility, and admin Hotinfo snapshot visibility.
- Hotinfo admin review revision completed:
  - parsed Hotinfo snapshots now expose up to two structured GPU cards.
  - admin ticket Hotinfo modal shows GPU 1/GPU 2 details with readable VRAM/RAM/resolution/driver date/driver version fields.
  - admin/support can download the customer's raw `.hxl` file from the ticket Hotinfo modal.
- CRM detail surface revision completed:
  - CRM account detail fields now persist beyond list columns and are shown in account profile detail.
  - Customer/contact profile detail now shows a CRM Contact Details card with Dynamics contact fields.
  - Added migration `20260519000001_add_crm_account_detail_fields`.
- Customer Answer Quality Phase 3 started:
  - customer sync diagnosis timeout increased from `6000ms` to `15000ms`.
  - license borrowing fallback now returns structured solution steps instead of raw excerpts.
  - Turkish UI-language and English requested-language fallback regressions are covered.
- Answer Drift Reset Phase 4 started:
  - customer `AiQueryService` and admin `AiCopilotService` now share `buildSupportAnswerContractPrompt(...)`.
  - admin Copilot no longer has its own shortened answer structure layered over the master diagnosis prompt.
  - shared contract enforces exact intent, no how-to-to-outage drift, same customer/admin core solution, and no raw excerpt/source leakage for customer answers.
  - ticket-opening UI language is now persisted on `AiInteraction.userContext.responseLanguage` and admin Copilot prioritizes that language over the creator profile language.
  - deterministic customer fallbacks no longer cache transient model timeouts or expose generic source-title/snippet summaries when no structured fallback exists.
- Ticket Interaction Idempotency Phase 5 started:
  - repeated ticket creation from the same AI interaction no longer leaks Prisma `interaction_id` uniqueness as HTTP 500.
  - backend returns the existing ticket for the same user with `alreadyCreated: true`.
  - frontend avoids adding duplicate initial messages/attachments when the existing ticket is reused.
- Live Chat Policy + AI Ticket Trace completed:
  - customer-initiated live chat requests are VIP-gated in `TicketsService`, not only in the frontend.
  - staff can still start proactive/live chat for any customer.
  - ticket creation marks linked AI interactions as `ticketCreated=true`.
  - support users can inspect ticket-level AI trace signals from the ticket detail UI.
- LearnNow crawler format discovery completed:
  - public `knowledge_article`, `pdf`, `technical_manual`, `explaining_video`, and `recorded_online_session` filters are available in the crawler UI.
  - non-PDF formats are staged as review candidates through the existing URL sync path while preserving original LearnNow source type metadata.
  - LearnNow howto detail extraction now uses the public Totara API to fetch real `salesforce_content` and image references instead of indexing the portal shell.
  - live read-only smoke confirmed `id=9093` returns article text plus one source image.
  - LearnNow explainer videos now extract Vimeo IDs, public Vimeo text tracks, and clean VTT transcript text when captions are available.
  - live read-only smoke confirmed `id=2740` returns `vimeoVideoId=880602266`, `transcriptStatus=AVAILABLE`, and German transcript text in the crawl content.
  - saved howto candidates now carry review-quality metadata: content length, image count, transcript status/language/length, source type, and ready-for-import flag.
  - Knowledge Pool crawler UI now shows these quality signals as compact badges before import.
  - public LearnNow format filters now match the real Totara UI values: Knowledge Article `knowledge_article`, Technical Manuals/PDF `pdf`, Explaining video `explainer_video`, and Recorded online session `recording`.
  - Technical Manuals are staged as PDF candidates; videos and recordings remain review-first Knowledge Article candidates until transcript/content quality is confirmed.
  - LearnNow review decisions now use one backend helper: article content must be long enough, media/recording formats require transcript text, and PDF/manual candidates are clearly marked as validated during import.
  - candidate quality badges now show localized reason codes such as transcript required, transcript ready, content too short, and PDF check on import.
  - LearnNow automatic crawl is now public-only: enrollment/course-layer pages are rejected from discovery and must be imported manually as approved files/transcripts.
  - LearnNow candidate discovery now checks existing Knowledge Pool URL/content hash before import and marks duplicates as `SKIPPED_DUPLICATE`.
  - Knowledge Pool crawler UI now explains the public-only crawl boundary and e-learning manual-import rule in Turkish, English, and German.
  - LearnNow `/course/` enrollment URLs are now hard-blocked in normal URL source creation, generic web crawler discovery, and LearnNow-specific candidate extraction; the UI also refuses these URLs before submission.
  - next LearnNow phase should run a small end-to-end pilot import smoke before broader imports.
- Ticket routing hardening started:
  - new ticket creation now collects support category/department before product selection.
  - ticket create payload includes `departmentId` so SLA and auto-assignment can route by department.
  - auto-assignment no longer falls back to global agents when department routing is missing or no auto-assignment team exists.
  - admin team detail now saves auto-assignment enablement and assignment strategy through the backend.
  - department/team admin views expose assignable agent counts so routing gaps are visible before live tickets arrive.
- Admin Copilot drift hardening completed:
  - admin ANN/Copilot drafts now receive the linked ticket-opening AI answer as primary grounding context when one exists.
  - if the admin model returns a no-knowledge response despite a usable ticket-opening answer, Copilot reuses the linked answer instead of contradicting it.
  - manual license server discovery questions have a structured fallback so the admin side does not regress to a generic no-knowledge draft.
  - admin ANN/Copilot draft API now returns visual evidence from the linked ticket-opening interaction or Knowledge Source metadata.
  - ticket detail renders those draft visuals as separate evidence cards above the composer, keeping image evidence out of the generated text body.
- Customer Dashboard 403 Cleanup completed:
  - customer/viewer dashboard no longer calls admin-only `/ai/health-metrics`.
  - admin/superuser dashboard still loads AI health metrics.
- Use `.ai/rag-quality/run-acceptance.mjs` for future localhost retrieval checks; default delay is intentionally throttle-safe.
- Use `.ai/rag-quality/run-answer-smoke.mjs` for focused customer-facing answer checks before declaring RAG-facing changes done.
- Pause the PDF-first import after the support-first seed corpus and validate real RAG quality before importing more files.
- Build the PDF-first RAG dataset import path without polluting the knowledge pool with generated MD duplicates.
- Keep `dataset/` as the clean import surface and `.archive/rag-incoming/pdf/` as the raw PDF inbox.
- Preserve Gemini/LLMAPI + pgvector and low-rate ingestion while importing in small validated batches.
- Ensure Knowledge Pool sources carry useful `metadata.category` values from both dataset scan and UI upload.
- Controlled 5-file PDF support batches 001 through 011 completed successfully.
- Keep title-specific retrieval boosting in place so near-duplicate FAQ topics rank by the most specific PDF title, not only vector similarity.
- Keep OpenAI as chat fallback only. Do not use OpenAI as embedding fallback while the active corpus is Gemini `3072/v2_2`.
- Embedding index isolation is the active production strategy:
  - Gemini `v2_2 / 3072` remains the active embedding index.
  - pgvector columns are unconstrained `vector`.
  - every vector write/search must isolate by `embedding_version + embedding_dim`.
  - Qdrant is roadmap/benchmark only, not a pre-delivery migration.
- Ensure unchanged dataset files with zero embeddings are re-indexed or fail clearly; never mark them as successful with an empty vector set.

## Avoid Breaking

- `AiService` provider dispatch, retry, and fallback behavior.
- `AiQueryService` sync diagnosis and async query flows.
- `EmbeddingService` knowledge pool, ticket, and article embedding writes.
- `RagMaintenanceService` vector dimension and index maintenance behavior.
- `NotificationsGateway` and WebSocket connection flows.
- Ticket lifecycle and AI-optional ticket creation.
- Global `XssValidationPipe` behavior for non-message strings.
- `AddMessageDto` and ticket message creation/rendering compatibility with old plain text content.

## Known Risks

- Gemini quota/rate limits can stall model-backed reranking or final answer generation if not bounded.
- Gemini 3072-dim embeddings affect pgvector column dimensions and HNSW index compatibility.
- Generated MD files from old PDF conversion flows can duplicate or distort canonical PDF sources.
- Legacy sources with `General` category can still appear after correctly categorized sources until old metadata is cleaned or reclassified.
- Similar multilingual FAQ topics can still tie at capped similarity `1.000`; inspect rank order and source metadata, not only displayed similarity.
- Legacy Softlock / old-version license sources are now demoted for modern license transfer or upgrade intents; keep this applicability guard in retrieval scoring rather than adding one-off answer templates.
- Mixing embedding providers in the same `embedding_version` can corrupt retrieval even when vector dimensions match; model-space compatibility matters as much as dimension.
- A source can have an unchanged content hash while still having zero embeddings from an earlier failed run; sync must verify embeddings before treating unchanged content as healthy.
- `graphify` CLI was previously unavailable in PATH, so graph updates may need environment repair.
- `apps/backend/openapi.json` is modified separately; do not mix it into RAG import commits unless intentionally regenerated.
- Customer answer quality should no longer diverge through the old quick-summary path, but can still fail when the LLM refuses after both synthesis attempts or when retrieved context is genuinely missing.
- Customer/admin answer parity now has a shared `SupportAnswerOrchestrator` generation policy; future answer-quality changes should go through this layer instead of patching `AiQueryService` and `AiCopilotService` separately.
- Ticket creation from AI diagnosis depends on `interactionId` idempotency; keep this path covered when changing ticket creation or AI query interaction persistence.
- Dashboard data loading must remain role-aware; do not call admin-only observability endpoints from customer pages.
- Rich message MVP stores sanitized HTML without a DB `contentFormat` column; renderer must continue detecting legacy plain text safely.
- Backend rich-text sanitizer is intentionally narrow; do not expand tags/attributes without XSS-focused tests.

## Next Recommended Step

Manual smoke-test Rich Message Composer before broadening the editor scope:

- Admin ticket detail: send bold/list/heading reply and verify render.
- Customer ticket detail: send formatted reply and verify render.
- ANN draft: verify markdown headings/lists appear as readable editor content.
- Legacy plain text: verify old messages still display cleanly.
- XSS smoke: `<script>`, `onerror`, and `javascript:` links must not persist or execute.

Keep Hotinfo and AI-optional ticket creation separate from vendor PDF RAG:

- Hotinfo needs canonical PDF/TXT source approval before import, because current confirmed candidates are MD-only.
- AI-optional ticket creation should be app-help/product copy, not vendor FAQ retrieval.
- Next RAG step: stop broad RAG changes unless a new acceptance failure appears; future source imports must rerun the focused acceptance set.
- Next answer-quality step: rebuild/reload backend, live-test the same license borrowing question through customer answer and admin ANN draft, and verify both stay on the same how-to procedure.
- Next orchestrator smoke: live-test one English, one Turkish, and one screenshot-assisted ticket-opening question; confirm customer answer and admin ANN draft share the same core answer and selected UI language.
- Next ticket-flow step: retry ticket creation from the same customer screen and verify it routes without 500; then compare admin ANN draft for the created/reused ticket.
- Next browser step: reload customer dashboard; the `/ai/health-metrics` 403 should disappear, then retry ticket creation.
- Next product-flow step: isolate live notification behavior as its own small acceptance phase, because Hotinfo upload and AI-optional ticket creation now pass in both API and UI flows.

## Operations & Infrastructure Backlog

## Active Focus - 2026-08-06 Post-Faz-7 Closure

- Local-only Faz 7 follow-up is implemented and verified; production PostgreSQL/Redis, deploy and remote push remain untouched.
- Auth action tokens use a dedicated secret, issuer/audience/purpose/JTI binding, 30-minute expiry and atomic one-time consumption.
- Password reset and admin force logout now increment durable `users.session_version`; access and refresh JWTs are rejected when their session version no longer matches the database. Redis markers are compatibility/optimization only.
- Email verification resend and forgot-password both have a two-minute durable cooldown and restore the prior challenge if email enqueue fails. Verification and reset links use URL fragments and remove the fragment from browser history after extraction.
- Registration welcome emails no longer contain the plaintext password.
- Canonical historical migration `20260314900000_restore_crm_foundation` remains immutable at SHA-256 `731839...`; timeout is supplied by the Faz 8 one-shot connection through the PostgreSQL URL `options` parameter. Shell `PGOPTIONS` is not relied upon because Prisma did not propagate it in the disposable lock test.
- Current 51-migration chain was rebuilt on fresh PG17 and on a sanitized production-derived clone. Both pass checksum/ledger integrity; direct comparison has 0 blocking differences and the post-migration audit has 0 ghost/pending/shadow-only effects. The separate read-only PRE audit records the original shadow's expected 7 ghost effects and one pending foundation ledger entry.
- Next action is Claude independent verification and, only after explicit user approval, a separately scheduled Faz 8 maintenance-window decision. Do not run production migrations now.

## Active Focus - 2026-08-06 BULGU-10 Migration Recovery

- Historical migration checksums were restored from Git versions proven against the sanitized production-shadow ledger; all 49 migration files are now pinned in a versioned checksum manifest and checked before CI deploy.
- A transaction-safe, idempotent `20260314900000_restore_crm_foundation` migration now restores the RBAC, CRM, and AI cache prerequisites missing from fresh installs.
- Fresh PG17 and a separate sanitized production-shadow clone both pass the blocking migration-integrity verifier.
- Production has not received this migration. Do not run `migrate deploy` against production without an explicit user-approved maintenance window.
- Full Prisma schema parity still has pre-existing drift beyond BULGU-10. Treat it as a separate local analysis phase; do not broaden the current migration automatically.
- Remote push, tag push, deploy, and publish remain forbidden until the user explicitly says `push et`.

- **DMARC Enforcement Reminder (Post-Deploy + 2-3 weeks):**
  Sistemi canliya aldiktan ve destek e-postalarinin duzgun calistigindan tamamen emin olduktan 2-3 hafta sonra, DNS barindiriciniza (Cloudflare, cPanel vs.) girip DMARC kaydinizdaki `p=none` ibaresini `p=quarantine` veya `p=reject` olarak degistirmelisiniz.
  *Yeni Kod Boyle Olmali:* `"v=DMARC1; p=reject; rua=mailto:destek@allplan.net.tr; adkim=s; aspf=s"`
  *Etkisi:* Bu degisikligi yaptiktan sonra hic kimse domain adinizi kullanarak sahte e-posta atamaz (Spoofing) ve IP/Domain itibarınız tamamen altin seviyeye (maksimum spam korumasina) ulasir.

## Active Focus - 2026-08-06 Knowledge Pool URL Duplicate Prevention

- New manual URL sources and approved LearnNow article imports now use the same canonical URL identity and transaction-scoped PostgreSQL advisory lock.
- URL identity strips fragments and known tracking parameters, normalizes host/default ports/query order, and preserves meaningful protocol/path/query differences.
- Duplicate submissions return the stable `KNOWLEDGE_SOURCE_URL_DUPLICATE` conflict and enqueue no second sync job; the TR/EN/DE UI keeps the modal input and shows an informational message.
- Existing production-derived duplicate rows were not merged, deleted, re-indexed, or modified. Legacy comparison is intentionally read-only and O(N) until an approved canonical identity/index migration is designed.
- Pre-existing SSRF hardening remains a separate high-priority security task: URL fetches need resolved-IP and redirect-chain validation before production release of further URL-ingestion changes.
- Product commit: `a960b73d`. No push, deploy, production connection, schema migration, or shadow write occurred.

## Active Focus - 2026-08-06 AI Solution Visibility And FAQ Provenance

- `/admin/ai-interactions` is now the dedicated admin surface for pre-ticket AI interactions; `/kb-approvals` remains the editorial FAQ review queue.
- AI history returns an explicit allowlist only, supports exact opaque interaction IDs, ticket/confidence/search filters and pagination, and records privacy-safe read audit events.
- FAQ candidates now retain normalized ticket/interaction provenance through `FaqEntrySource`; duplicate frequency updates and source attachment are transactional.
- Interaction-derived candidates use the stored customer-visible AI response and always remain `PENDING_REVIEW`; blank answers cannot be approved.
- Anonymous/customer FAQ reads no longer inherit staff visibility, FAQ list limits are capped, and ticket AI trace now checks actual ticket access before returning details.
- Local dev and a disposable dump-restored PG17 copy both applied all 53 migrations with business row counts unchanged. Production and shadow were not touched.
- Product commits: `d3d1a7b7`, `7bd9dda0`, `809fd245`, `0cbf617a`, `b5228c97`.
- Remaining acceptance step: authenticated local browser smoke of `/tr/admin/ai-interactions` and its exact source link from `/tr/kb-approvals`; this is UI acceptance, not a code/test blocker.
- Remote push, tag push, deploy and production migration remain forbidden until explicit user approval.

## Active Focus - 2026-08-06 Production Boot And Migration Safety Closure

- Claude's manifest and automatic production-sync findings are closed locally in commit `6759b077`.
- Canonical boot is fail-closed: verify migration files, run Prisma migration with URL-encoded lock/statement timeouts, verify ledger/relations, then start the API.
- Normal boot no longer runs user recovery, role repair, admin bootstrap, seed, direct DDL, or manual migration-ledger edits.
- Seed and manual production synchronization require explicit opt-ins; production E2E data is rejected before the first Prisma query and no current-tree hardcoded production credential remains.
- Migration manifest and local ledger are 54/54; schema parity passes with only the existing allowlisted partial FAQ embedding index.
- Local business counts remain 1282 users / 162 tickets / 259 AI interactions / 29 FAQs / 0 FAQ provenance rows.
- Remaining release evidence: build and smoke the Docker runner where registry access is available. Do not run manual production-sync without a disposable-PostgreSQL rollback/lock-duration acceptance test and separate user approval.
- No production/shadow connection, push, tag-push, deploy, publish, or live secret rotation occurred.

## Active Focus - 2026-08-07 Görev ve Onay Merkezi

- Yerel, yetki kapsamlı Görev ve Onay Merkezi backend summary endpoint'i, frontend sayfası ve sidebar merkezi tamamlandı (`1efacf33`).
- Merkezi yüzey canlı destek, atanmamış bilet, makale/FAQ/crawler onayı ve ayrı AI denetim bağlantısını bir araya getiriyor; hiçbir işlemi otomatik onaylamıyor.
- Yetkisiz kuyruklar sorgulanmıyor veya sayı olarak açıklanmıyor; CUSTOMER için summary isteği yapılmıyor.
- Backend 121/121 suite (1102 passed, 1 skipped), frontend 34/34 dosya (248 test), typecheck, i18n, ops ve RBAC kapıları geçti.
- Bağımsız incelemede bulunan müşteri global-count sızıntısı, kart/hedef yetki farkı, count/list parity, stale query geçişi ve RoleGuard render flash sorunları `ef9bfe7e` ile kapatıldı; ikinci kod ve güvenlik incelemeleri GO verdi.
- Kimliksiz smoke doğrulandı: API 401/no-store; frontend `/tr/review-center` login'e yönleniyor.
- Sıradaki kabul adımı: kullanıcı yerel olarak giriş yaptıktan sonra ADMIN ve mümkünse SUPPORT_AGENT ile görsel/işlevsel browser smoke. Claude bağımsız çapraz doğrulaması da bekleniyor.
- Canlı bağlantı/yazma, production migration, rol ataması, push, tag-push, deploy ve publish yasaktır.

## Active Focus - 2026-08-07 Frontend/Backend Contract Closure

- CRM ayarları gerçek `POST /crm/connections` camelCase DTO sözleşmesine taşındı; secret yanıtları maskeli, mevcut webhook secret alan gönderilmezse korunuyor.
- Dynamics outbound istekleri yalnız güvenilir HTTPS `*.dynamics.com` origin'ine gider; redirect kapalı ve OData next/delta linkleri aynı origin'e kilitli.
- CRM bağlantısı ile eski `dynamics_api_key` ayrı kaydediliyor; UI tüm settings secret'larını decrypt ederek istemiyor.
- Backend güvenlik modeli olmayan MFA kontrolleri ve karşılığı olmayan MJML block editor kaldırıldı. Transactional template `source/save/preview` ile DB-backed announcement yapısı ayrı kaldı.
- Blocking frontend API route contract kapısı 182 merkezi istemci operasyonunu 233 OpenAPI operasyonuyla karşılaştırıyor; missing=0 ve dashboard raw-network ihlali=0.
- Ürün commitleri: `eaa1fc53`, `e294623d`. Backend 124/124 suite (1152 passed, 1 skipped), frontend 38/38 dosya (260 test), typecheck, i18n, ops, RBAC ve 56/56 migration manifest geçti.
- Canlı/production/shadow erişimi, migration/seed, push, tag-push, deploy ve publish yapılmadı.

## Active Focus - 2026-08-07 Review Center Soft-Delete Parity Aşama A

- Dar Aşama A `69655f1c` ile tamamlandı: Review Center ticket/FAQ sayaçları ve FAQ hedef sorguları yalnız aktif kayıtlarla eşleşiyor.
- Ticket listesi backend hatasını boş kuyruktan ayırıyor, lokalize retry sunuyor ve eski eşzamanlı istek yanıtlarını request-id ile yok sayıyor.
- FAQ read/publish/approve/dismiss/update yolları soft-deleted kayıtları dışlıyor. `PATCH /faq/:id` gerçek whitelist DTO + service allowlist kullanıyor; mass-assignment, null/blank ve şema drift regresyonları kapalı.
- Son kanıt: backend 125/125 suite (1168 passed, 1 skipped), frontend 38/38 dosya (262 test), typecheck/i18n/ops/API/RBAC/migration kapıları temiz; code ve security review GO, C/H/M=0.
- Aşama B global Prisma Proxy/middleware düzeltmesi ayrı iş ve NO-GO: tam call-site envanteri ve ayrıca kullanıcı onayı gerektiriyor.
- Kalıcı sınır: production/canlı/shadow erişimi veya yazımı, migration/seed, push, tag-push, deploy ve publish yok.

## Active Focus - 2026-08-08 Production Release Faz A.1.1

- Ledger-driven, fail-closed production migration planner and current Faz 8 runbook are complete locally in `8fbdc0b1`.
- The planner derives pending migrations from canonical files/manifest versus `_prisma_migrations`; it rejects unknown, checksum-drifted, unresolved, contradictory-lifecycle and duplicate-success rows.
- The single ADR-011 historical marker is default-deny and only accepted with an exact explicit acknowledgement; the artifact preserves the real ledger marker and match mode.
- Artifacts are restricted to `.private-data`, mode `0600`, and include ledger digest/capture provenance without connection secrets. Online reading is one `REPEATABLE READ READ ONLY` transaction with a static SELECT and rollback.
- Coolify read-only UI evidence: backend and frontend are running the same deployed commit `d9b21b9d`; production PostgreSQL reports healthy on `pgvector/pgvector:pg17`; Redis is running. Local release HEAD is a descendant and must not be treated as live parity.
- MinIO is intentionally retired; the canonical storage target is S3-compatible object storage. The runbook now requires S3 parity plus versioning/immutable-backup restore canary. Local fallback is only a historical recovery inventory.
- Coolify's database General page unexpectedly exposed the PostgreSQL password in browser automation output. The value is not recorded or reused. PostgreSQL credential rotation and dependent connection updates are mandatory before release approval.
- Verification: focused planner tests 19/19, combined operations-safety 43/43, migration manifest 56/56, diff-check clean; independent code and security reviews GO with Critical/High/Medium = 0/0/0.
- Restore: `restore/post-release-a11-20260808-8fbdc0b1`; bundle `.private-data/restore-points/post-release-a11-20260808-8fbdc0b1.bundle`, SHA-256 `ecb15b14da121665c3d30c94df13784b954c3b939b0ebb39b724c3a2250eb9af`, complete history verified.
- Next safe phase is local-only A.1.2: fail-closed custom-format backup tooling and tests. No production DB query, SSH action, migration, seed, push, tag-push or deploy occurred in A.1.1.

## Active Focus - 2026-08-08 Production Release Faz A.1.2

- Yerel fail-closed backup sözleşmesi `64c5d2bc` ile tamamlandı: explicit opt-in, PG17 custom dump, archive doğrulaması, SHA-256, private path/lock/symlink/ownership kontrolleri, READY-last ve S3 no-clobber/owned-cleanup.
- Eski uygulama-içi cron/shell/plain-SQL backup yolu karantinaya alındı; ADMIN backup endpoint'i sabit 503 döndürüyor. Hata filtresi ve public health yanıtlarındaki hassas ayrıntı sızıntıları kapatıldı.
- Kanıt: backup `44/44`, ops `87/87`, backend `132/132` suite (`1311 passed`, `1 skipped`), frontend `42/42` dosya (`308 passed`), typecheck/i18n/API/RBAC/migration `56/56`; TDD/code/security review GO, C/H/M `0/0/0`.
- Mevcut R2 `aluplan-support-desk` uygulama bucket'ındaki `402` nesne / `37.42 GB` veri değişmedi. `aluplancoolify` kapsam dışı. Ayrı DB backup hedefi önerisi `aluplan-support-desk-db-backups`; henüz oluşturulmadı.
- Restore: `restore/post-release-a12-20260808-64c5d2bc`; bundle SHA-256 `a6b1f98e8828d3a6ec9b5f01e2887408eb42832d777699eb3aba9d147b67c0cd`.
- Production hâlâ NO-GO. Sıradaki güvenli faz A.1.3: exact image + gerçek Cloudflare R2 conditional round-trip + disposable PG17/pgvector restore drill. Canlı erişim/yazım, migration/seed, push/tag-push/deploy yok.

## Pause Checkpoint - 2026-08-08 gece / sabah devam

- Kullanıcı yorgun olduğu için çalışma güvenli checkpoint'te durduruldu. Yeni
  ürün geliştirmesi, production bağlantısı veya dış sistem mutasyonu başlatılmadı.
- Güncel yerel HEAD bu kayıt öncesinde `46ec376c`; son ürün/tooling commit'i
  `64c5d2bc`. A.1.1 ve A.1.2 yerel olarak kapalı, production genel GO değildir.
- Yerel güven: backend `132/132` suite (`1311 passed`, `1 skipped`), frontend
  `42/42` dosya (`308/308`), backup `44/44`, ops `87/87`, typecheck/i18n,
  API/RBAC ve migration `56/56`; TDD/code/security GO, C/H/M `0/0/0`.
- Mevcut `aluplan-support-desk` R2 uygulama bucket'ı (`402` nesne / `37.42 GB`)
  dokunulmadan korunuyor. `aluplancoolify` kapsam dışı. Önerilen
  `aluplan-support-desk-db-backups` henüz oluşturulmadı veya yapılandırılmadı.
- Sıradaki tek aktif release işi A.1.3'tür: exact image smoke, ayrı DB-only R2
  conditional round-trip ve disposable PG17+pgvector restore drill. Bunlar
  tamamlanmadan deploy/cutover yok.
- Release öncesi ayrıca production PostgreSQL credential rotasyonu, canlı
  ledger salt-okunur planı, object parity, dokuz queue/cron tekilliği ve
  rollback kanıtı gereklidir.
- Sabah `FIRST-READ.md` bölüm 10'dan başla. Push, tag-push, deploy, production
  DB/R2/SSH yazımı, migration ve seed yasakları aynen sürüyor.
- Pause restore point: commit `ab2bd04f`, tag
  `restore/pause-before-release-a13-20260808-ab2bd04f`, complete-history bundle
  `.private-data/restore-points/pause-before-release-a13-20260808-ab2bd04f.bundle`,
  SHA-256 `63e8f45bc7f2eb51ae6aae4ec49961598c64225d08130fb0b92d93868633c12d`.

## Active Focus - 2026-08-09 Production Release Faz A.1.3 Local Evidence

- A.1.3 exact backend image ve disposable PostgreSQL 17 + pgvector restore/migration tatbikatı yerelde tamamlandı; bu sonuç production GO değildir.
- Güncel kanonik yerel HEAD `ca26caa1` (`fix(release): serialize fingerprint queries`). Exact linux/amd64 backend image digest'i `sha256:74a4fac812a84082184c8d42a41473f08a235ed772cc615cfcfd316f7299f6ac` ve commit/revision bağı doğrulandı.
- Sanitized production-derived PG17 custom dump SHA-256 `544260dd42453b6510433e27de0ef19e03e3e08793923af8c699fb27a98f1ff7`, boyut `138028808`, mode `0600`; yalnız disposable kaynaklarda kullanıldı.
- Restore öncesi baseline/candidate digest'i aynıydı. İlk turda beklenen sekiz migration uygulandı; ikinci tur `No pending migrations to apply` verdi. Post-round-1 ve post-round-2 digest'i `dd63895628fa0961bd4602c3c662d5e24d67f0fb433bca69abe3cae85e071fae` olarak birebir aynı.
- Kanıt: `canonicalRbac=true`, `schemaParity=true`, `roundTwoNoOp=true`, invalid constraint/index `0/0`, cleanup `clean`, `LOCAL-A13` complete ve bütün artifactlerde `productionGo:false`.
- Disposable container/network/volume label filtresiyle tekrar sorgulandı; kalan kaynak yok. Mevcut yerel PostgreSQL/Redis containerları değiştirilmedi.
- Gerçek drill iki fail-closed uyumluluk borcu yakalayıp kapattı: Docker Desktop lowercase missing-object kanıtları ve Apple Silicon üzerinde amd64 backend job platform pin'i. Son olarak tek `pg.Client` üzerindeki eşzamanlı RBAC sorguları seri hale getirildi; stderr uyarısının JSON evidence'ı bozması engellendi.
- Son doğrulama: A.1.3 safety `52/52`, geniş operations-safety `151/151`; TDD/code/security review GO, Critical/High/Medium `0/0/0`.
- Güncel restore point: tag `restore/post-release-a13-fingerprint-20260809-ca26caa1`; bundle `.private-data/restore-points/post-release-a13-fingerprint-20260809-ca26caa1.bundle`, SHA-256 `dca8524a59d61525bf6f20b5fd4eeda739d5486c5d47356634699fb185280034`.
- Açık release kapıları: ayrı DB-only Cloudflare R2 hedefinde conditional round-trip/restore canary, production ledger salt-okunur planı, PostgreSQL credential rotasyonu, application-object parity, dokuz queue/cron tekilliği, maintenance/cutover ve rollback provası. Mevcut `aluplan-support-desk` application bucket'ına dokunma.
- Push, tag-push, deploy, production DB/R2/SSH erişimi veya yazımı, migration ve seed yapılmadı; yasaklar sürüyor.

## Active Focus - 2026-08-10 DEV Offsite Backup Acceptance

- Yalnız DEV kabulü için ayrı Cloudflare R2 bucket'ı `aluplan-support-desk-db-backups-dev` oluşturuldu. Mevcut canlı `aluplan-support-desk` application bucket'ı ve `aluplancoolify` değiştirilmedi.
- 30 gün süreli R2 kimliği yalnız yeni DEV bucket'ta Object Read & Write kapsamıyla oluşturuldu. Secret değerleri belgeye/Git'e yazılmadı; kimlik dosyası `.private-data/release-credentials/r2-dev-canary.env` altında mode `0600` tutuluyor.
- 106 byte sentetik canary `canary/2026-08-10/b3abc01c3aedfb84/canary.txt` anahtarına no-clobber koşuluyla yüklendi. HEAD metadata, geri indirme ve iki taraflı SHA-256 `b3abc01c3aedfb8438f02bba41625db33a21ba3ac232854bc3cabb0a0d0e1fbf` eşleşti; aynı anahtara ikinci koşullu yükleme beklendiği gibi reddedildi.
- R2 HEAD yanıtında `VersionId` yoktu. Bu nedenle versioning geri dönüş kanıtı sayılmıyor; benzersiz/no-overwrite anahtarlar ve bağımsız Microsoft kopyası zorunlu kalıyor.
- Microsoft SharePoint'te mevcut `ALUPLAN DESTEK PLATFORMU 2026` sitesine dokunulmadan, Microsoft 365 Group oluşturmayan ayrı `ALUPLAN Destek Yedek Kasası DEV` sitesi oluşturuldu: `/sites/aluplan-destek-backups-dev`, Türkçe, `(UTC+03:00) Istanbul`, 100 GB site kotası.
- Yeni DEV site dış paylaşımı `Only people in your organization` olarak doğrulandı. `Database Backups`, `Object Storage Snapshots` ve `Manifests` adlı üç boş document library oluşturuldu.
- SharePoint admin salt-okunur envanteri `293.15 GB used of 1.85 TB` gösterdi. Bu kapasite kanıtıdır; Microsoft'a production verisi veya canlı R2 nesnesi henüz kopyalanmadı.
- Sıradaki güvenli iş: client-side encryption ve key-custody sözleşmesini belirlemek; SharePoint'e yalnız sentetik şifreli canary yükleyip geri indirme/hash doğrulaması yapmak; ardından canlı R2 için yalnız salt-okunur object manifest ve maliyet/süre planı çıkarmak.
- Production hâlâ NO-GO. Canlı DB dump, canlı R2 kopyası, production credential rotasyonu, push, tag-push, deploy, migration ve seed yapılmadı.

## Active Focus - 2026-08-10 Encrypted SharePoint DEV Round-Trip

- Resmî `age v1.3.1` Apple Silicon paketi proje özel alanına indirildi; yayımlanmış arşiv SHA-256 değeri `01120ea2cbf0463d4c6bd767f99f3271bbed1cdc8a9aa718a76ba1fe4f01998b` ile birebir doğrulandı. Sistem geneline kurulum yapılmadı.
- Yalnız DEV canary için yeni age identity oluşturuldu. Özel anahtar `.private-data/release-credentials/sharepoint-dev-age-identity.txt` altında mode `0600`; Git'e, SharePoint'e, rapora veya terminal çıktısına yazılmadı.
- 288 byte sentetik plaintext SHA-256 `1e38c0dbdbd1c4bcaef3f13335718048ce9997d8ad90d11b1182728cc452ad95`; age ciphertext 488 byte ve SHA-256 `65f66f049c8b31315c27a7fd0f2456fe59c455e067cd08ac08861ef9c10aac25`.
- Ciphertext ve secretsız manifest yalnız yeni `/sites/aluplan-destek-backups-dev` sitesindeki `Manifests` kütüphanesine yüklendi. Ciphertext Microsoft Graph ile geri indirildi; byte count ve SHA-256 eşleşti, yerel private identity ile çözme başarılı oldu ve recovered plaintext SHA-256 kaynakla birebir eşleşti.
- SharePoint version history `1.0` / 488 byte olarak görüldü. Dosya izinlerinde anonymous sharing linki yok; site Owners/Members/Visitors grupları ve site owner dışında doğrudan grant görülmedi.
- Bu kanıt DEV şifreli offsite round-trip kapısını kapatır; production key custody/escrow, otomasyon kimliği, retention ve gerçek restore tatbikatı henüz kapalıdır. Production hâlâ NO-GO.
- Canlı PostgreSQL, canlı `aluplan-support-desk` R2 bucket'ı ve mevcut `ALUPLAN DESTEK PLATFORMU 2026` SharePoint sitesi okunmadı/değiştirilmedi. Push, tag-push, deploy, migration ve seed yapılmadı.

## Active Focus - 2026-08-10 DEV Object-Manifest Dry Run

- Yalnız `aluplan-support-desk-db-backups-dev` bucket'ı, mevcut bucket-scoped DEV credential ile salt-okunur listelendi. Sonuç tam olarak bir sentetik canary nesnesi / `106` byte; canlı application bucket'ına erişilmedi.
- Normalize DEV manifesti `.private-data/release-evidence/r2-manifest-dev/object-manifest.json` altında mode `0600`; SHA-256 `fc2041066e4bd4fa35fae0c0570ee13d51bc9a7166fcd68cff3215c1f7b51798`.
- Aynı nesnenin `HEAD` sonucu ile manifestteki size ve ETag birebir eşleşti. `GetBucketVersioning` çağrısı DEV credential kapsamında `AccessDenied` döndürdü; versioning durumu varsayılmadı ve recovery gate olarak kabul edilmedi.
- Object manifest age ile client-side şifrelendi; 689 byte ciphertext SHA-256 `113b4cd4a70e5548a0dce1352bf97553111247a0e9957486ddc5f524fd59064b`. Yalnız yeni SharePoint DEV `Manifests` kütüphanesine yüklendi.
- SharePoint'ten indirilen ciphertext hash'i eşleşti; decryption sonrası JSON kaynak manifestle byte-for-byte aynıydı. Bu DEV object-manifest + encrypted offsite round-trip provasıdır, production inventory/kopya değildir.
- Sıradaki güvenli kapı production key custody/escrow kararı ve canlı bucket için ayrı salt-okunur inventory yetkisinin kullanıcı onayıdır. Production hâlâ NO-GO; canlı veriye erişim/yazım yok.

## Active Focus - 2026-08-10 Dual-Recipient DEV Recovery Proof

- DEV anahtar saklama alanı olarak Git tarafından dışlanan `.private-data/release-credentials/age-dev-dual/` kullanıldı. Klasör mode `0700`, iki bağımsız identity dosyası mode `0600`; özel anahtar veya recipient değeri rapora, Git'e ya da SharePoint'e yazılmadı.
- Aynı sentetik 288 byte canary iki farklı age recipient için tek ciphertext olarak şifrelendi. Ciphertext `586` byte ve SHA-256 `90e7dc235d6b267b58727deaf361d720f8b857205852713468acfb0a8ee63d7f`.
- Yerelde her identity tek başına ciphertext'i çözdü; iki recovered plaintext de kaynak SHA-256 `1e38c0dbdbd1c4bcaef3f13335718048ce9997d8ad90d11b1182728cc452ad95` ile birebir eşleşti.
- Ciphertext yalnız yeni SharePoint DEV `Manifests` kütüphanesine yüklendi, Graph üzerinden geri indirildi ve kaynak ciphertext ile byte-for-byte eşleşti. SharePoint round-trip kopyası da her iki identity ile ayrı ayrı çözüldü ve aynı plaintext hash'ini üretti.
- Bu kanıt yerel Git-dışı saklamanın DEV için çalıştığını ve iki bağımsız kurtarma anahtarı sözleşmesini doğrular. Production için iki özel anahtarın aynı bilgisayarda tutulması yeterli değildir; en az birinin kurumsal kasa/secret manager ve diğerinin ayrı offline custody konumu belirlenmeden production key üretimi yapılmayacak.
- Canlı PostgreSQL, canlı application R2 bucket'ı ve mevcut production SharePoint sitesi okunmadı/değiştirilmedi. Production hâlâ NO-GO; push, deploy, migration ve seed yapılmadı.

## Active Focus - 2026-08-10 A.1.4 Production Inventory Offline Preparation

- A.1.4 yalnız yerel hazırlık kapısı tamamlandı; tooling/test commit'i `fdee46c8` (`feat(release): prepare readonly production inventory`). Bu faz hiçbir production bağlantısı kurmaz.
- `scripts/release-a14-inventory-contract.mjs` credential veya endpoint argümanı kabul etmez, database/cloud/Redis client'ı ve child-process import etmez, `--execute` çağrısını fail-closed reddeder ve yalnız açık `--prepare` onayıyla çalışır.
- Dokuz BullMQ queue, dokuz kaynak `@Cron` deklarasyonu, dört repeatable job, exact PostgreSQL statement allowlist'i ve R2/Redis salt-okunur eylem allowlistleri kodla kilitlendi. Runtime singleton henüz doğrulanmış sayılmaz.
- PostgreSQL sorgu sözleşmesi arbitrary `SELECT` çalıştırmaz; yalnız sabit allowlistteki statement'lar kabul edilir. DML/DDL, lock, sleep, `COPY`, multi-statement ve yan etkili fonksiyonlar reddedilir.
- Plan yalnız Git-dışı `.private-data` altında, mode `0600`, no-clobber ve symlink/ownership/mode kontrolleriyle yazılır. Plan daima `productionAccessPerformed=false`, `productionGo=false` ve ayrı kullanıcı onayı gerektiren sonraki kapıyı taşır.
- Doğrulama: A.1.4 hedefi `12/12`, geniş operations-safety `163/163`, syntax, JSON parse, Prettier, secret taraması ve `git diff --check` temiz. Manuel kod/güvenlik incelemesinde Critical/High/Medium `0/0/0`.
- Sıradaki güvenli kapı A.1.4-B için ayrı kullanıcı kararıdır: yalnız kısa ömürlü least-privilege credentiallarla salt-okunur production ledger/R2 metadata/Redis-BullMQ inventory collector. Bu onay verilmeden canlı credential oluşturulmayacak veya production erişimi yapılmayacak.
- Canlı PostgreSQL, `aluplan-support-desk` application bucket'ı, Redis, SSH ve mevcut production SharePoint sitesi okunmadı/değiştirilmedi. Push, tag-push, deploy, migration ve seed yapılmadı; production hâlâ NO-GO.
- Yerel hazırlık planı kanonik dokümantasyon commit'i `b07203e8260a34460e733b15074e2d1651c1c0bf` ile bağlıdır. Restore tag'i `restore/post-release-a14-preparation-20260810-b07203e8`; tam-geçmiş bundle `.private-data/restore-points/post-release-a14-preparation-20260810-b07203e8.bundle`, SHA-256 `762309f39a05496a9ba1637fdbfd304686f241b05609744492c3d784d5263486`; `git bundle verify` geçti.

## Active Focus - 2026-08-11 A.1.4 Independent Review Hardening Closure

- Claude'un append-only bağımsız doğrulaması `6a523cda` docs commit'iyle korundu. Doğrulama A.1.4 yerel GO kararını teyit etti ve `Critical 0 / High 0 / Medium 1 / Low 6` hardening açığı bildirdi.
- Pre-fix restore tag'i `restore/pre-release-a14-hardening-20260811-6a523cda`; bundle `.private-data/restore-points/pre-release-a14-hardening-20260811-6a523cda.bundle`, SHA-256 `5db0a831343bc566c7ba9fe622451c8a71e7e1317caab7446d2a115fe8a9d008`; verify geçti.
- Kod commit'i `9461d52a` bağımsız PostgreSQL statement sözleşmesi, katı UTC ISO-8601 timestamp ve yalnız `.private-data/release-evidence` çıktı sınırını ekledi. Test commit'i `c7c8c039` TypeScript AST tabanlı BullMQ queue drift/anchor keşfi, symlink/permissive-directory ve genişletilmiş network-capability regresyonlarını ekledi.
- M1 ve L1-L6 kapandı. R2/Redis allowlistleri bu fazda hâlâ yalnız A.1.4-B için bildirimsel sözleşmedir; canlı uygulanabilir kısıt veya production kanıtı değildir.
- RED: `16` testin `4` tanesi beklenen sözleşme açıklarında kırıldı. GREEN/final: A.1.4 `16/16`, geniş operations-safety `167/167`; syntax, Prettier, secret scan ve diff hygiene temiz. Manuel kapanış incelemesi `Critical/High/Medium 0/0/0`.
- Yeni private plan `.private-data/release-evidence/a14-production-inventory/preparation-plan-c7c8c039.json`, mode `0600`, commit `c7c8c03983755a08e9d59ae267e6c7f96bb84486` ile bağlı; `productionAccessPerformed=false`, `productionGo=false`.
- GitNexus detect-changes denendi ancak pnpm registry-signature doğrulaması fail-closed durdurdu; bypass uygulanmadı. Canlı PostgreSQL/R2/Redis/SSH/SharePoint erişimi, push, deploy, migration, seed veya queue mutation yapılmadı. Production NO-GO sürüyor.
- Post-fix restore tag'i `restore/post-release-a14-hardening-20260811-865090f3`; complete-history bundle `.private-data/restore-points/post-release-a14-hardening-20260811-865090f3.bundle`, SHA-256 `d05a3ca0a3d801e5062e05fe76fe22dbe0d7d7c974214c7cfe466e5af4aa6423`; `git bundle verify` geçti.

## Active Focus - 2026-08-11 A.1.4 H1-H5 Commit and Recovery Closure

- A.1.4 H1-H5 kapanışı üç ayrı yerel commit ile kaydedildi: sözleşme `5e77ffdc`, regresyon testleri `ff38340e`, append-only ortak rapor `021ae1c5`.
- Final hedef test `21/21`, dokuz dosyalık operations-safety paketi `172/172`; bağımsız code-review ve security-review sonucu GO, Critical/High/Medium `0/0/0`.
- Restore tag'i `restore/post-release-a14-h1-h5-20260811-021ae1c5`; doğrulanmış complete-history bundle `.private-data/restore-points/post-release-a14-h1-h5-20260811-021ae1c5.bundle`, mode `0600`, SHA-256 `2ae4e178ac3762a4fbb321d36a08bddbeb2f520828b322a736f1421a773c0cc3`.
- `StalledJobRecoveryService` envanter sözleşmesine alındı; gerçek multi-replica/çift-retry davranışının değiştirilmesi ayrı bir ürün/mimari fazıdır ve bu kapanışta yapılmadı.
- Sıradaki güvenli adım A.1.4-B'yi doğrudan çalıştırmak değil; least-privilege, kısa ömürlü credential, salt-okunur sorgu/eylem allowlisti, redaksiyon, evidence formatı ve abort koşulları için önce design-only collector sözleşmesidir. Ayrı kullanıcı onayı olmadan canlı collector geliştirilmeyecek veya çalıştırılmayacaktır.
- Push, tag-push, deploy, production PostgreSQL/R2/Redis/SSH/Coolify/SharePoint erişimi, migration, seed veya veri mutasyonu yapılmadı. Production NO-GO sürüyor.

## Active Focus - 2026-08-12 A.1.4-B Design-Only Collector Contract

- Yeni kanonik design-only belge: `.ai/issues/2026-08-12-production-readonly-inventory-collector-design.md`. Collector geliştirilmedi veya çalıştırılmadı.
- Kaynak incelemesi beş zorunlu genişletme belirledi: key-level DB↔R2 parity, exact-known-key Redis envanteri, R2 action-scoped child credential, ayrı runtime/local-volume adapterları ve üç sistem için bounded moving-target semantiği.
- İlk bağımsız güvenlik turu Critical/High/Medium `0/2/3` buldu. Redis `SCAN` ACL varsayımı, DB↔R2 false-static parity, PostgreSQL efektif PUBLIC hakları, R2 parent secret sınırı, object-key persistence/retention ve local-volume kapsamı tasarımda düzeltildi.
- Final bağımsız security re-review: yalnız design-only kapanış için GO, Critical/High/Medium `0/0/0`. Bağımsız planner aynı eksikleri doğruladı ve sıradaki fazın canlı erişim değil offline contract/test/collector implementation olması gerektiğini belirtti.
- Sıradaki güvenli teknik faz A.1.4-B1 offline TDD'dir: exact SQL/SDK/Redis sözleşmesi, adapter interface'leri, evidence schema ve fake/disposable transport harness'leri. Credential provisioning ve production observation ayrıca onaylanmadan yapılmayacaktır.
- `StalledJobRecoveryService` multi-replica ürün davranışı bu faza dahil değildir. Production deploy ve A.1.4-B canlı observation NO-GO olarak kalır.

## Active Focus - 2026-08-12 A.1.4-B0 Offline Collector Core

- A.1.4-B0 yalnız yerel, import-safe ve network-capability içermeyen collector çekirdeği olarak tamamlandı. Concrete production transport, credential provisioning, CLI invocation ve canlı observation bu kapsamda yoktur.
- Modüler çekirdek PostgreSQL, R2 ve Redis adapter sözleşmelerini; çift gözlem penceresini; storage-reference sınıflandırmasını; kapalı evidence üretimini ve private/no-clobber/READY-last publisher sözleşmesini uygular.
- PostgreSQL adapterı dedicated read-only/repeatable-read session, exact migration ledger ve least-privilege kontrolleri uygular. R2 adapterı yalnız `ListObjectsV2` ve `HeadObject`; Redis adapterı yalnız dokuz kanonik queue için exact-known-key okumaları kabul eder. `SCAN`, `KEYS`, Lua ve yazma işlemleri yasaktır.
- Son odaklı doğrulama `21/21`; coverage line `%96.81`, branch `%82.53`, function `%96.47`. Geniş operations-safety paketi `193/193`; syntax, Prettier ve `git diff --check` temizdir.
- Bağımsız code-review ve security-review frozen snapshot üzerinde GO verdi; Critical/High/Medium `0/0/0`.
- Kod/test/tooling commit'i yalnız yerelde oluşturuldu: `f6982564` (`feat(release): add A14B offline collector core`). İlk kapanış docs commit'i `3c7c9fe1`, final addendum commit'i `1107b7fa`.
- Kanonik final restore tag'i `restore/post-release-a14b-offline-core-final-20260812-1107b7fa`; tag hedefi `1107b7fa633abce35b27d6ebd0754a7a990a9bea`. Complete-history bundle `.private-data/restore-points/post-release-a14b-offline-core-final-20260812-1107b7fa.bundle`, SHA-256 `7d2f17fd8556acd2ca3124cf32cadaf3477f6f6617ee9c77aa43d86a9c66e8eb`; `git bundle verify` geçti.
- Production PostgreSQL/R2/Redis/SSH/Coolify/SharePoint erişimi, credential okuma/oluşturma, migration, seed, queue/object/Redis mutation, push, tag-push veya deploy yapılmadı. B1 canlı adapter/observation ve production deploy **NO-GO** kalır.

## Active Focus - 2026-08-12 A.1.4-B0 Follow-up Hardening

- Claude'un A.1.4-B0 bağımsız doğrulamasındaki B0-2 recovery kayıt bulgusu ayrı docs commit'i `db8d53b9` ile kapatıldı; final `1107b7fa` tag/bundle/SHA kanıtı kanonik belgelere eklendi.
- B0-1 Medium için offline orchestrator artık moving-target ve DB-referenced-but-missing R2 durumlarında abort etmek yerine kapalı, `ready:false`, `productionGo:false` diagnostic bundle üretir. Publisher bu blocked diagnostic artifact'lerini yazar ancak `READY.json` üretmez.
- B0-4 kapandı: `manual-psql-fix` tarihsel migration marker'ı artık varsayılan olarak reddedilir; yalnız exact `acknowledgedHistoricalMarkers` parametresiyle kabul edilir ve `historicalLedgerMarkersAccepted` evidence alanında görünür kalır.
- B0-5/B0-6/B0-7 kapandı: publisher `fileURLToPath` kullanır, temp dosya adları pid+UUID içerir, ham storage-key kalıbı secret/raw-material taramasına dahil edilir ve var olan run dizini `Evidence run directory already exists` sabit mesajıyla redakte edilir.
- Doğrulama: A.1.4-B hedef seti `25/25`, geniş ops-safety paketi `197/197`; syntax, Prettier ve `git diff --check` temiz. Bu kontroller yalnız local fake/offline harness ile çalıştı.
- B0-3 kapandı: çalışma commit'i `219d1142` olarak kaydedildi ve yeni restore point annotated tag ile oluşturuldu: `restore/post-release-a14b-b0-hardening-20260812-219d1142`. Tag object `2d5ab23b383a4e9b50e833660344a7f0737c6047`, peeled hedef commit `219d11428a96da7fdb6737e076a1f9ba946fe79b`.
- Complete-history bundle `.private-data/restore-points/post-release-a14b-b0-hardening-20260812-219d1142.bundle`, mode `0600`, SHA-256 `bbbb9a9636208ca2b81dab0a9ddd1f02c884825d587bb2b8101ad0bdf191554e`; `git bundle verify` geçti ve tag type `tag` olarak doğrulandı.
- A.1.4-B0 B0-1 üzerinden B0-7 dahil local/offline hardening artık commit'lenmiş ve doğrulanmış restore point ile kapalıdır. Production/live observation, B1 concrete transports, credential provisioning ve deploy **NO-GO** kalır.

## Active Focus - 2026-08-12 A.1.4-B1 Live Observation Preflight

- B0 kapanışı sonrasındaki ilk güvenli adım olarak docs-only preflight belgesi eklendi: `.ai/issues/2026-08-12-a14b-b1-live-observation-preflight.md`.
- Bu belge canlıya bağlanma veya collector çalıştırma yetkisi vermez; yalnız B1 canlı salt-okunur observation öncesi credential, evidence, bounded observation, DB↔R2 parity, Redis/BullMQ exact-known-key ve NO-GO kapılarını kilitler.
- B1 için geçerli sınır: concrete transports, credential provisioning, live observation ve production deploy hâlâ **NO-GO**. Ayrı açık kullanıcı onayı olmadan PostgreSQL/R2/Redis/SSH/Coolify/SharePoint erişimi yapılmayacak.
- Canlı sistemde bilet ve dosya hareketi devam ettiği için exact parity iddiası ancak düşük trafik/bakım penceresinde, before/after snapshotlar stable olduğunda değerlendirilecektir. Moving-target veya DB-referenced-missing-R2 sonucu `ready:false`, `productionGo:false` diagnostic artifact olarak kalmalıdır.
- Bu turda kod, test, migration, seed, deploy, push, tag-push, credential, production connection veya object/Redis/DB mutation yapılmadı.
- Claude'un iki bağımsız doğrulama turunda bulduğu B1-1 üzerinden B1-5 dokümantasyon bulguları kapandı; yeni bulgu kalmadı. Docs commit'i `454f6693` (`docs(release): close A14B B1 live observation preflight plan`).
- B1 preflight restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-preflight-20260812-454f6693`. Tag object `d067d68fa4b405712d6a07c9cbdfc4d183ef561c`; peeled hedef commit `454f6693c37f312313f55d75cf070c05df83bfa7`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-preflight-20260812-454f6693.bundle`, mode `0600`, SHA-256 `c708dbeb8feefa56be3807504694ae24b126401e3c294a12ab7e3757db18aeee`; `git bundle verify` geçti.
- B1 concrete transports, credential provisioning, live observation, runtime-topology/SSH/Coolify erişimi ve production deploy hâlâ ayrı açık kullanıcı onayı gerektiren **NO-GO** kapılardır. Canlı gözlem yapılacaksa düşük trafik/gece penceresi tercih edilmelidir.

## Active Focus - 2026-08-12 B1 Night Observation and Deploy Gates

- Bu gece için güvenli operasyon sırası docs-only olarak kilitlendi: `.ai/issues/2026-08-12-a14b-b1-night-observation-and-deploy-gates.md`.
- Plan deploy'u otomatik hedef yapmaz; sıralama credential hazırlık kararı → ayrı açık B1 live read-only observation onayı → observation GO/NO-GO → backup/restore/rollback hızlı kapısı → final deploy GO/NO-GO → ayrı açık `deploy et` onayıdır.
- Varsayılan ilk B1 temel gözlem PostgreSQL/R2/Redis metadata ile sınırlıdır. SSH/Coolify runtime-topology kapsam dışında tutulur; gerekiyorsa ayrı açık onay ve komut seti gerekir.
- B1 observation ve olası deploy düşük trafik/gece penceresine bırakılmalıdır; canlı bilet/upload hareketi DB↔R2 exact parity'yi moving target yapabilir.
- Bu turda canlı sistem erişimi, credential işlemi, migration, seed, queue/object/Redis/DB mutation, push, tag-push veya deploy yapılmadı.
- B1 gece planı commit'lendi: `869e1f38` — `docs(release): close A14B B1 night observation and deploy gates plan`.
- Restore evidence: annotated tag `restore/post-release-a14b-b1-night-gates-20260812-869e1f38`, tag object `04fb516cb097889c4c5ea41d9845c996d9ab03a5`, peeled commit `869e1f38a37033eb9b64f8c12b09b94f14880012`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-night-gates-20260812-869e1f38.bundle`, mode `0600`, SHA-256 `3bc8da35eab7792349b813ddcf11eaa7d374bc1965ab896b31fdaf6a2587495f`; `git bundle verify` geçti.
- Credential provisioning, B1 concrete transports, B1 live observation, runtime-topology/SSH/Coolify erişimi ve production deploy hâlâ ayrı açık kullanıcı onayı gerektiren **NO-GO** kapılardır.

## Active Focus - 2026-08-16 B1 Credential Provisioning Plan

- Sıradaki güvenli kapı docs-only olarak başlatıldı: `.ai/issues/2026-08-16-a14b-b1-credential-provisioning-plan.md`.
- Plan, PostgreSQL/R2/Redis için ayrı ve kısa ömürlü credential modelini, secret-handling sınırlarını, R2 `GetObject` compensating-control şartını, Redis exact-known-key gerekliliğini ve revocation/cleanup beklentisini tanımlar.
- Bu belge credential oluşturma, canlı observation, SSH/Coolify erişimi veya deploy yetkisi vermez. Tüm canlı kapılar hâlâ **NO-GO**.
- Claude bağımsız doğrulaması GO verdi; Critical/High/Medium `0/0/0`, yalnız append-only disiplinine dair içerik-nötr bir Low notu vardı ve ileriye dönük kural olarak kaydedildi.
- Docs commit'i oluşturuldu: `508bb43f` (`docs(release): close A14B B1 credential provisioning plan`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-credential-plan-20260816-508bb43f`. Tag object `a5de08ba2165f43f5414b3ba0f082e2cd5e66109`, peeled hedef commit `508bb43f4aee1936322bb474f1a1c69c131ff4ab`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-credential-plan-20260816-508bb43f.bundle`, mode `0600`, SHA-256 `1df4de44c9aed670a399e30a6f795549d9617bcdcddc75810240569bac686444`; `git bundle verify` geçti.
- Kullanıcı `B1 credential provisioning yöntemini onaylıyorum` cümlesini verdi; bu yalnız yöntem onayı olarak işlendi. PostgreSQL/R2/Redis credential üretimi, concrete transports, B1 live observation, SSH/Coolify runtime-topology ve deploy hâlâ ayrı açık onay gerektiren **NO-GO** kapılardır.
- Secret'sız operatör checklist'i credential planına eklendi; credential değerleri oluşturulmadı, okunmadı veya yazılmadı.
- Deploy öncesi veri güvenliği için yeni docs-only backup/restore gate planı eklendi: `.ai/issues/2026-08-16-a14b-b1-predeploy-backup-restore-gate.md`.
- Bu plan PostgreSQL custom dump + SHA + restore drill, R2 manifest/backup stratejisi, Redis/BullMQ runtime snapshot ve Coolify rollback hedefini deploy öncesi GO kapısı olarak tanımlar. Backup execution hâlâ ayrı açık onay gerektiren **NO-GO** kapısıdır.
- Claude, B1 pre-deploy backup/restore gate planını bağımsız doğruladı: GO, Critical/High/Medium/Low `0/0/0/0`; append-only sapması tekrarlanmadı.
- Docs commit'i oluşturuldu: `aecbf6c2` (`docs(release): close A14B B1 backup and credential planning`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-backup-gate-20260816-aecbf6c2`. Tag object `82a66bb6ef33ee4bc9dcc0bb9d65f9b333812b63`, peeled hedef commit `aecbf6c264c58557eed1e8ebd551b03ce95a52ed`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-backup-gate-20260816-aecbf6c2.bundle`, mode `0600`, SHA-256 `be55dd9585f68eed35c230be6367bb550d3e905948d2ac874e9e5bbfa0a58a2f`; `git bundle verify` geçti.
- Production PostgreSQL, Redis, Cloudflare R2, SSH, Coolify veya SharePoint'e bağlanılmadı; credential/token/secret okunmadı veya yazılmadı.
- Credential provisioning, B1 concrete transports, B1 live observation, runtime-topology/SSH/Coolify erişimi ve production deploy hâlâ ayrı açık kullanıcı onayı gerektiren **NO-GO** kapılardır.
- Kullanıcı `B1 PostgreSQL credential provisioning başlat` cümlesini verdi; bu yalnız PostgreSQL credential üretim rehberliğini başlatır. Production PostgreSQL'e bağlanılmadı ve rol/parola/connection string oluşturulmadı, okunmadı veya yazılmadı.
- Credential planına yeni §14 eklendi: kısa ömürlü `LOGIN` + `NOINHERIT` + `default_transaction_read_only=on` rol, yalnız dört tablo için `SELECT`, effective-scope probe, `PUBLIC` privilege sızıntısı halinde fail-closed duruş ve revoke/drop planı. `VALID UNTIL` yalnız parola geçerliliğini sınırlar; cleanup kanıtı hâlâ gereklidir.
- PostgreSQL credential'ın gerçek üretimi kullanıcı/operatör tarafındaki ayrı production write adımıdır. Scope probe PASS gelmeden ve kullanıcı ayrıca `B1 canlı salt-okunur gözleme başla` demeden canlı gözlem **NO-GO** kalır.
- PostgreSQL credential rehberi docs commit'i: `46fe0ad7` (`docs(release): close A14B B1 PostgreSQL credential guidance`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-postgres-credential-20260816-46fe0ad7`. Tag object `d21dcab7fc3ddb43e40bb9c07e318a83d9eec489`, peeled hedef commit `46fe0ad70fee888f10e72f55fe3a6ca75e750fce`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-credential-20260816-46fe0ad7.bundle`, mode `0600`, SHA-256 `fa40a3cbcdd3b5c44310f702bb371accecae1ec007b7aa8fbcbd40c16ec57e00`; `git bundle verify` geçti.
- Kullanıcı/operatör Coolify PostgreSQL terminalinde geçici rolü oluşturdu ve parolayı `\password` ile set etti; parola/connection string Codex'e yazılmadı veya rapora eklenmedi. Rol adı: `a14b_inventory_ro_20260816`; hedef DB doğrulaması: `postgres`.
- Effective-scope probe **NO-GO** verdi: rol `PUBLIC`/varsayılan privilege etkisiyle hedef dışı database erişimi gördü (`aluplan_support`, `template1`) ve `TEMPORARY=true` çıktı; ayrıca public/pgvector fonksiyon execute satırları gözlendi. Bu nedenle B1 live observation başlatılmadı.
- Cleanup yapıldı: `REVOKE ...`, `DROP ROLE a14b_inventory_ro_20260816`, `COMMIT`; doğrulama sonucu `role_exists = f`. Geçici rol production'da kalmadı. Production backup, live observation, deploy, migration/seed veya veri mutasyonu yapılmadı.
- Claude bağımsız doğrulaması GO verdi; Critical/High/Medium/Low `0/0/1/0`. Tek Medium, credential planı §14.7'nin deneme sonrası stale kalmasıydı. Bu docs-only düzeltmeyle §14.7 "rehber hazırlandığı andaki sonuç" olarak daraltıldı ve §14.8 "Gerçek deneme sonucu" eklendi.
- Credential denemesi ve Medium-01 kapanışı docs commit'i: `c76f3758` (`docs(release): record B1 PostgreSQL credential attempt outcome`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-postgres-attempt-20260816-c76f3758`. Tag object `b4981c4709e4873c0731eeebe239e8441371f48a`, peeled hedef commit `c76f37588bc3191004a97628d6aecd087df0eb75`; tag type `tag` olarak doğrulandı.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-attempt-20260816-c76f3758.bundle`, mode `0600`, SHA-256 `4b68a51eeaf7e7b3623cdb693ebe342cba8f6a69b61feb13477917201da71378`; `git bundle verify` geçti.
- Bu restore kapanışı sırasında yeni production connection, credential read/write, role create/alter/drop, backup execution, B1 live observation, migration, seed, queue/object/Redis/DB mutation, push, tag-push veya deploy yapılmadı. B1 live observation ve production deploy hâlâ ayrı açık onay gerektiren **NO-GO** kapılardır.
- PostgreSQL credential NO-GO sonrası docs-only strateji kararı eklendi: aynı şablonla ikinci canlı rol denemesi yapılmayacak; production-wide `PUBLIC`/`TEMPORARY`/function execute revocation mevcut kapsam dışında kalacak. Varsayılan güvenli yol, PostgreSQL ledger/object-reference kanıtını pre-deploy backup/restore gate içindeki izole disposable PG17 restore üzerinden almak; alternatif public-default-aware adapter sözleşmesi ise ayrı design/TDD/security-review fazı gerektirir.
- Claude, bu strateji kararını GO verdi fakat Medium-01 temporal-skew notu ve iki Low netlik notu bildirdi. Düzeltildi: dump zaman damgası ile R2 before/after manifest penceresi birlikte kayda geçirilecek; R2 dump'ı kuşatmıyorsa fark `moving-target` sayılacak; `pg_dump` yolunun daha düşük privilege değil tek seferlik/operatör kontrollü geniş okuma işlemi olduğu yazıldı; adapter redesign hedefi `postgres-adapter.mjs` forbidden-function yorumu ile `functionRows.length !== 0` kontrolü arasındaki çelişki olarak netleştirildi.
- Claude kapanış doğrulaması Critical/High/Medium/Low `0/0/0/0` ile GO verdi. Docs commit'i: `9f2b43bb` (`docs(release): close B1 PostgreSQL credential strategy findings`).
- Restore evidence: annotated tag `restore/post-release-a14b-b1-postgres-strategy-20260816-9f2b43bb`, tag object `79465f77e3b0e0a5c6b9a1849ea02f91b8e0e6e9`, peeled commit `9f2b43bb4106c1603c6e6a28cfb245594363b890`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-strategy-20260816-9f2b43bb.bundle`, mode `0600`, SHA-256 `98494cda53c27842e085d121731c82cfabcda8cea039619d50ea573df280a4b8`; `git bundle verify` geçti.
- Bu kapanış production erişimi, credential işlemi, backup execution, B1 live observation, push, tag-push veya deploy içermedi. Production deploy hâlâ **NO-GO**.
- Kullanıcının `B1 R2 offline credential minting aracını hazırla` onayıyla yalnız local/offline signer geliştirildi. Araç `aluplan-support-desk` + `ListObjectsV2`/`HeadObject` + 900 saniye sözleşmesini sabitler; parent secret yalnız hidden TTY'den gelir, metadata secretsızdır ve child dosyası `0600`/no-clobber yayınlanır.
- Minting kodu collector çekirdeğinden ayrı `scripts/a14b-minting/` sınırındadır ve collector entrypoint'inden export edilmez. Bu turda gerçek Cloudflare tokenı/credential'ı üretilmedi veya okunmadı; Cloudflare/production erişimi ve canary yapılmadı.
- R2 offline minting focused testleri final hardening sonrası `16/16`, A14B birleşik testleri `41/41`, geniş ops-safety paketi sıralı temiz koşuda `213/213` geçti. Focused coverage `%86.54` lines / `%83.44` branches / `%82.05` functions; syntax, Prettier ve `git diff --check` temiz. Metadata secret/unknown-field fail-open, post-write ve post-publish cleanup ile TTY EOF/error/close bulguları kapandı; bağımsız TDD/code/security re-review Critical/High/Medium/Low `0/0/0/0` ile GO verdi.
- Yerel kapanış commitleri: `3b2d5edb` (tool), `2ffe6d7b` (tests), `b90b6279` (docs). Annotated restore tag `restore/post-release-a14b-r2-offline-mint-20260820-b90b6279`; tag object `5a7c7d9dd2cb542fdbca466293eca72aa4ee7f98`, peeled commit `b90b6279832e2cc944d6028789fc52882d2d355b`. Complete-history bundle `.private-data/restore-points/post-release-a14b-r2-offline-mint-20260820-b90b6279.bundle`, mode `0600`, SHA-256 `9aaec3e369b69b4ebacbe63040add03ee93dd90c4afa417ec71486f6a7f1b479`; `git bundle verify` geçti.
- Gerçek parent token oluşturma, gerçek child mint, provider scope/canary, B1 live observation ve production deploy ayrı açık onay gerektiren **NO-GO** kapılarıdır.
