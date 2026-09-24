# Mail transport transition plan — 2026-09-23

Status: Approved Stage A1 issuance and separately approved one-domain on-host certificate/key export completed. Mail TLS transition NOT executed; no mail settings/restart, automatic publisher or DB mutation. Application deployment remains NO-GO.

## AI fallback persistence listener integration — 2026-09-24

Used a smaller listener-side change: all3AiService publishers remain unchanged. NotificationsGateway.handleAiFallback now uses synchronous Nest event registration (no async:true metadata), reserves shared root/current-child before returning to emit, and returns the tracker Promise to Nest's error wrapper. Inside the reservation, an explicit setImmediate preserves deferred persistence. Original health-write/admin-lookup/notification-write/broadcast body is unchanged in private persistAiFallback. Payloads, recipients and delivery policy remain unchanged; mandatory shared tracker injection added, isolated fixture updated. No broad event dispatcher or new infrastructure.

Five new tests first failed against old listener. Final tests use real Nest discovery, actual gateway and actual AiHealthEventService with synthetic Prisma only: held health/notification writes × success/failure, and closed standalone event performs no IO. Already admitted event remains counted after publisher returns and closes admission; callback still deferred. Actual health service catches its write failure, then notification attempt continues as before.12suites205tests pass/1pre-existing skip; backend/newtest diagnostics0 with matching borrowed schema; secret scans/diff checks and independent code/security review clear. No live/push/deploy/schema/env/dependency changes.

Limits: not socket delivery, fullApp startup, real persistence or provider-internal timeout proof. A fallback emitted from an already-expired untracked producer after closure is a new root and rejected; remaining producer lifetime coverage is still necessary. No runtime endpoint/hook closes admission yet. Next actual ticket-created fan-out/translation/auto-tagging integration against the existing finite writer checklist. Broader worker completion, cron, WebSocket and first-cutover Gate1/2/3 acceptance remains open.

## Query background completion integration — 2026-09-24

AiQueryService now injects the shared tracker and wraps BOTH public query and queryInternal as root-or-child operations. This preserves the direct Bull worker entry that bypasses query. Query submission tracks awaited enqueue only; the later worker invocation is a distinct root, never a serialized lease. The3existing detached operations (retrieval tracing, semantic-cache insertion, trainingQueue.create) reserve children before callback invocation. Retrieval payload is captured before scheduling; fixed-label rejection logging avoids raw provider/customer details. Both synchronous callback throws and promise rejections remain best-effort background failures, not failures of a committed response. No new external integration or latency wait added.

Eight new tests use actual service with synthetic IO: closed admission before either entry's IO, and3heldchildren × success/rejection proving fast response plus nonzero work until settlement. All8failed before patch then passed. Existing broad AI regression10suites154pass/1pre-existing skip; explicit backend/fullchangedtest typecheck0 after3pre-existing implicit-any callbacks received minimal test-only type annotations. Schema matches borrowed generated declarations. Independent code/security review approves bounded diff; secret scans and diff checks clean. GitNexus command/report unavailable; direct source/caller review used. No live/data/provider access, push, deploy, schema/env/dependency change.

Limits: no actual Bull worker/socket/persistence integration proof or general HTTP fence; future admission closure causes direct worker entry to fail through existing retry handling, so acquisition pause/drain ordering remains required. Worker completion notifications after queryInternal, AI-fallback persistent events, other service entrypoints, provider-internal detached operations and whole ticket-created chain remain out of scope. No endpoint/shutdown hook activates closure. Next finite system.ai_fallback emission-to-persistent-notification chain, preserving normal response latency; full Gate1 remains open.

## Answer generation lifetime integration — 2026-09-24

Bounded product fix: SupportAnswerOrchestrator.generate reserves a root or a child of the current active lease; its whole awaited operation includes no-knowledge recovery. Actual generateOrReformat has its own child before Promise.race, remaining active after timeout/fallback until generation/model lookup/reformat settles. No new response wait or provider cancellation was added. A stuck underlying operation deliberately prevents drained=true rather than fabricating completion. CommonModule registers/exports the mandatory shared tracker; no duplicate AiModule provider, optional fallback instance, public control endpoint or shutdown hook. Closed root rejects with Nest503.

Two timeout cases failed before the fix and now pass; added closed-root/no-provider, active-parent after closure, provider rejection before and after timeout. Existing fixture constructors/providers updated for required injection.10suites146tests pass,1pre-existing skipped test retained; no-emit backend and new acceptance tests diagnostics0 using schema-matched borrowed declarations. Independent review scoped clear; tests use mocked external IO, not physical persistence or fullApp bootstrap. No production access, push, deploy, schema/env/dependency changes.

Limits: repairLanguage and provider-internal losing timeout operations are not covered by this slice. Detached system.ai_fallback persistent writes, query tracing/cache/training and complete ticket-created consumers still need admission/completion accounting. AiQueryService catches generation errors and may continue fallback/DB processing; do NOT describe orchestrator503 as HTTP fencing. Closure remains test/in-process-only and is not activated in normal runtime. Next bounded descendant integration, then the actual ticket-created chain; Gate1/2/3 remain open. Prior section below records the pre-fix characterization, not current orchestrator behavior.

## Ticket-created completion boundary audit — 2026-09-24

Integration deliberately not activated: tracking only TicketsService.create plus emitAsync would still give false completion. This is a bounded prerequisite discovery, not a new infrastructure project. No production observation or product edits in this batch; old live findings are not refreshed.

Evidence:

- Installed Nest loader wraps callbacks in a non-async arrow returning a Promise. EventEmitter2 async:true scheduling alone does not expose completion under this wrapper. Three real-Nest synthetic tests prove early emitAsync resolution, explicit promisify:true preserving deferred scheduling while joining completion, and a reserved child retaining drain after the root response.
- Two actual SupportAnswerOrchestrator/mock-provider tests prove Promise.race timeout returns fallback without cancelling the generation. Outer-only tracking reaches zero; a late ranking response can still initiate reformat. Count the underlying operation, not only the race result. These tests characterize current risk and must be converted to desired acceptance when integration lands.
- Source audit: TicketsService.create detaches auto-tagging and ticket.created; four of five finite consumers use async:true (rules, assignment, auto-resolution, notifications), while Automation already returns its Promise. RuleEngine additionally detaches ai.translate_message. Wildcard webhooks remain inactive under current default event configuration; do not enable them incidentally.
- Additional concrete descendants: AiQueryService retrieval tracing, semantic-cache set and trainingQueue.create; AiService system.ai_fallback emissions with persistent gateway writes; SupportAnswerOrchestrator generation/reformat surviving timeout. Do not claim all writers covered by changing only the five outer listeners.

Smallest implementation order: (1) account for actual AI-operation lifetime and these descendants without extending customer response latency; (2) register one shared tracker and wrap create/root-or-child plus pre-reserved auto-tag/event children; (3) join finite handlers and nested translation, verify actual discovered consumers and failure settlement; (4) advance remaining Gate1 entries. Nest default suppressed listener errors settle the promise but do not prove successful delivery. Fail-fast aggregation needs explicit regression coverage if any listener propagates errors. No generic event monkey-patch, blanket awaited AI in HTTP, public maintenance endpoint or premature shutdown hook.

Verification: new5cases and existing focused suites total6suites69tests green in network-denied runner; no-emit backend with both new tests diagnostics0 using schema-matched borrowed declarations; secret scans clean. Independent review found no blocking test issue. Not actual five-consumer integration, fullApp, physical persistence, Linux artifact, runtime coverage percentage or release readiness. Tracker remains unregistered; no schema/env/dependency/customer data/live/push/deploy changes.

## Work accounting foundation — unregistered, 2026-09-24

Added common/services/maintenance-work.service.ts and colocated tests as a small explicit process-local primitive, not a new orchestration platform. No module/provider/HTTP endpoint/signal hook imports it yet. Therefore this changes no running application admission or shutdown behavior and does NOT close Gate1.

Contract: runRoot reserves before deferring callback; runChild requires an active same-instance lease and may reserve after admission closes; descendants retain independent leases when parents settle. AsyncLocalStorage carries context, but active object identity authorizes it; copied/forged/foreign/expired contexts rejected. closeAdmission is irreversible. waitForIdle requires the fence, returns only drained/count, and timeout leaves work running/incomplete. Finally releases successful or failed work; drained means settled tracked promises, not success/delivery. Caller must handle returned errors and register real domain promises before deferred callbacks; HTTP finish/close or Observable unsubscribe is not equivalent.

40offline tests cover immediate fence/microtask race, descendants, inherited expired context, instance isolation, timeout/input checks, rejection cleanup, concurrent waiters, real EventEmitter2 synchronous-wrapper fixture and10,000pending roots. Initial RED was missing implementation; tests then exposed null/undefined string coercion, corrected with explicit type check. Parent rerun:40passed and100%statement/branch/function/line coverage of this single new file. Backend/newtest no-emit typecheck0 using schema-matched sibling declarations; secret/diff checks clean; independent review found no blocking issue. No full-backend coverage/build claim or Nest integrated shutdown evidence.

Next integrate ONE complete ticket-created path (request operation plus assignment/rules/nested translation/AI/automation/persistent notifications) with synchronous registration wrappers before async scheduling; keep response latency independent of AI. Review changed fan-out semantics and error handling explicitly. Then cover remaining event/cron/IMAP/WebSocket/Bull entries from the consolidated matrix. Do not add a public maintenance API, activate a premature shutdown hook, or use a zero primitive count to certify unwired writers. Legacy first-cutover is still separately gated. No live/provider/data access, push or deploy in this batch.

## Consolidated maintenance acceptance scope — 2026-09-24

This section is the current bounded checklist; earlier chronological sections are evidence/history, not separate new projects. Source-only inspection this turn; no production observation or fresh tests. Last focused acceptance remains15suites134tests, not full release acceptance. Local lifecycle improvements do not change the old running image's first-cutover behavior.

### Gate 1 — Stop new work and account for already accepted work

| Work source | Current evidence | Required maintenance acceptance |
| --- | --- | --- |
| HTTP/API/webhooks | No general maintenance fence identified in inspected bootstrap/common/config paths | Explicitly block new mutations without false success; account for accepted requests/uploads and caller retries. Provider mail/source must remain retained. |
| Existing WebSocket clients | ticket:message_read can cancel queued customer email; presence writes Redis | Cover existing connections, not only new HTTP upgrades; stop mutation admission and finish already accepted handlers. |
| IMAP | Local stop flag/direct-chain drain + synthetic PG/file re-entry proven | Verify exact artifact and first-cutover procedure; no blanket mailbox deletion/Seen reset or old/new simultaneous consumers. |
| Bull workers/repeat producers | Scoped worker/Prisma/Redis order and SLA warning join tested | Stop fresh job acquisition/production with supported non-deleting controls; finish active jobs while their DB/Redis and dependent enqueue paths remain usable; retain waiting/delayed/failed jobs. |
| Detached ticket events and direct async work | Assignment waits1.5s then writes DB; AI drafts/status, automation emails, persistent notifications and auto-tagging can outlive caller | Enumerate concrete promises and observe completion, including nested events; do not infer safety from a fixed quiet sleep or await all AI work inside customer requests. |
| In-process cron | Announcement reconciliation writes DB; AI reports enqueue email; presence cleanup writes Redis | Stop future invocations and account for in-flight work. Separate repeatable reconciliation/cache work from irreplaceable accepted customer effects. |

Gate1 passes only when a focused local rehearsal shows: new admission is rejected/retained as appropriate, an intentionally held accepted writer prevents ready-to-stop, nested accepted work completes while dependencies remain available, and the signal is scoped to every applicable process. A process-local zero counter alone cannot certify other replicas or legacy writers. Do not implement a public unauthenticated maintenance endpoint, queue deletion, broad callback monkey-patching or a new distributed platform. Exact mechanism is still a bounded design/implementation decision, not executable authorization.

Independent architecture review acceptance details: register detached work before async listener scheduling so a scheduled-but-not-entered callback cannot produce false zero. After admission closes, already-admitted parents may still create required descendants; account for those rather than silently rejecting them. Hold a request, cron callback, delayed listener, nested AI/notification, enqueue and worker in local tests; verify both registration race and failed/incomplete drain. A timeout must leave the decision NOT DRAINED, never certify unfinished writes. Keep relevant queue enqueue paths available until accepted producers/descendants settle, and never conflate stopping acquisition with deleting waiting jobs. Exact safe phase order must be tested as a whole.

### Gate 2 — Accept one frozen release artifact

- Freeze scope to necessary compatibility/security/data fixes; exclude new customer feature requests.
- Build one final Linux/amd64 artifact including the recent commits, pin identity and run existing functional/security runners on it. Earlier image tests remain useful but do not certify newer source.
- Close remaining reachable security decisions (including crawler containment) or explicitly restrict the affected feature with tested compatibility; scanner counts alone are not a verdict.
- Recheck customer/staff separation, CRM eligibility, login/reset, ticket/reply/attachment, frontend dashboard and inbound/outbound mail. Reuse existing tests; no replacement test framework.

### Gate 3 — Separately approved operational cutover

- Fresh scoped live identity/config/migration/host/credential evidence and protected DB/mail/attachment recovery copies require separate permission. Historical local recovery proofs are not fresh snapshots.
- Rehearse the actual pending migration/startup path and attachment bytes with the exact artifact in isolation; never replace live DB with a development DB.
- Specify first-cutover writer fencing for the legacy running artifact, mail TLS/client/renewal handoff, operator, extended-maintenance acceptance, abort criteria and forward-recovery procedure under ADR-022. Do not restart historical deploy.sh blindly.
- Obtain explicit push/deploy and maintenance authorization, then execute controlled customer workflow acceptance before reopening writes. Keep post-cutover accepted writes; never blindly restore an older DB to undo an application failure.

### Scope limits and stop conditions

Deferred: redesigning all event delivery as an outbox, distributed shutdown coordination, zero-downtime blue/green architecture, complete event-system replacement, general dependency mass-upgrades, renewed historical rollback-image engineering and new product features. These do not justify skipping demonstrated reachable security or data-preservation blockers.

Do not schedule deployment while Gate1 has an unknown writer, Gate2 has an unacceptable reachable risk or failed critical workflow, or Gate3 lacks verified recovery/authority. Previously stated1–3focused-day estimate remains conditional, not a measured completion promise; no defensible fixed downtime estimate yet. Next action: design/test one shared local admission-and-in-flight accounting mechanism for this enumerated scope, with old-live operational fencing kept explicitly separate; review before implementation.

## Targeted SLA producer completion — 2026-09-24

Added sla-completion.spec.ts with real EventEmitterModule bootstrap/decorator discovery and actual SlaProcessor, SlaCronService, AutomationService. Queue/Prisma/email boundaries mocked; exactly one discovered sla.warning listener asserted. Four cases (response/resolution × attempt success/rejection) failed against old emit: marker updated and process completed while enqueue remained held. Two emit calls now await emitAsync; payloads, recipients, repeat schedule and retry policy unchanged. Existing unit mocks/assertions updated, marker comments clarified as attempt rather than delivery. Test release/teardown is deterministic with bounded listener-start wait; no AppModule or external connections.

After fix both marker update and processor completion wait for listener/child attempt settlement. Failure remains caught by AutomationService and marker still updates; deliberate preservation of current best-effort semantics, not successful queueing/delivery guarantee or retry redesign. No-assignee behavior unchanged. Focused15suites134tests green (includes existing ticket SLA suite), no-emit backend/newtest typecheck0 with schema-matched declarations, secret/diff checks clean; independent review clear for scoped change. No live access, migration/env/dependency change, send, push or deploy.

This closes only the SLA warning dispatch join; it is not actual Bull worker shutdown/SIGTERM, durable Redis/DB transaction, fullApp or all-writer acceptance. Remaining detached ticket automation/AI/assignment/notifications, repeat producers and in-process cron plus HTTP/WebSocket/IMAP admission must be accounted for before maintenance. Next consolidate that finite acceptance scope; do not blindly await all ticket events and introduce long AI latency to customer requests. Continue existing Aluplan architecture without a new queue platform/outbox framework in this slice.

## Direct automation mail completion prerequisite — 2026-09-24

Architecture audit: TicketsService emits ticket events without joining listeners; AutomationService previously launched its email children without awaiting them. EmailService later writes emailLog and enqueues Bull work, so merely switching an outer emit to emitAsync would still report premature completion. New automation-completion.spec.ts held each of10mail enqueue promises; all10desired assertions failed against old code. Product now awaits those operations and placeholder evaluateRules calls. Recipient/visibility guards, payloads, WEB delay60s and job IDs unchanged. Resolution/CSAT rejections now have sanitized error handlers, allowing later attempts. Other existing best-effort catches retained.

Independent review found awaiting customer creation exposed an existing raw /tmp/mail_error.txt write failure as a staff-notification abort. Removed fs import/write and kept sanitized application error logging; no actual existing file deleted. Three rejection-continuation tests cover customer→staff, resolution→survey and survey failure without raw error leakage. Final independent review found no critical/high issue. Focused13suites116tests pass offline; secret/diff checks clean. No live access, send, DB read/write, migration, push or deploy.

Limits: mocked direct-handler evidence, not actual mail delivery, durable enqueue atomicity, outer dispatch join, fullApp or shutdown proof. Sequential awaits mean a stuck earlier enqueue can delay later attempts; no false-success timeout added. Existing log-before-queue partial failure semantics unchanged. Next bounded producer chain is SLA: SlaProcessor awaits checkSlaWarnings, but that service emits sla.warning and records its timestamp without joining notification completion. Characterize actual listener topology before targeted repair; retain best-effort policy explicitly. Detached assignment/AI/notification DB writers and cron/HTTP/WebSocket/IMAP admission still require maintenance accounting. Reuse existing patterns per Aluplan skill, no new outbox/platform in this slice.

## Minimal shared Redis lifecycle fix — 2026-09-24

Converted redis-shutdown-order.spec.ts to desired acceptance;3tests failed before product edits. Changes are limited to root first-discovery of RedisModule (removed later duplicate placement) and RedisService cleanup moved to onApplicationShutdown with awaited client.quit(). Existing pool drain/clear and disconnect-on-QUIT-rejection behavior retained. No new dependency/env/schema/API, queue retry policy or lifecycle coordinator.

Reason for both edits: installed Nest11.1.14 assigns global modules equal MAX_VALUE distance and reverses stable discovery order for final shutdown. Registering shared Redis first keeps it available until Bull global worker closure completes. A source-order guard checks the actual AppModule imports without booting it. Reduced real module test includes async ConfigService factory and checks Redis receives configured URL, preventing an assumed startup dependency regression. Hold worker close, release it to perform late Redis read, verify Prisma/pool cleanup ordering, hold QUIT and assert close remains pending; resolve/reject cases verify successful wait or disconnect fallback. Drivers/worker body are synthetic, not real Redis/socket/fullApp proof; dependency/import upgrades must rerun this regression.

Final focused offline10suites88tests passed. Backend no-emit typecheck including new test reports0diagnostics using schema-matched sibling declarations; secret scans/diff checks clean. Source/library impact inspection substituted for unavailable GitNexus and absent Graphify report. Local source fix only: previous built images/live process do not inherit it. Remaining maintenance gate includes detached event/cron writers and new-ingress fencing, exact Linux artifact and explicitly approved operational acceptance; no blanket safety or zero-loss claim.

Independent code/security review found no critical/high blocker and reproduced3focused cases with isolated setup. Default Jest invocation in review failed before test execution on existing unresolved langfuse-core setup; the documented sandbox runner/sibling dependency configuration passed, so this is not a claim that the standard full backend suite/build passes. Reviewer requested bounded test-only phase waits to ensure failed-order cleanup reaches finally; incorporated without adding production shutdown deadlines.

## Bounded background-writer shutdown audit — 2026-09-24

Actual installed Nest reverses distance-sorted module order during shutdown. Both global Prisma and Bull core share final phase, but this alone is not a race: new prisma/queue-shutdown-order.spec.ts preserves candidate root order (Bull config, Prisma, queue feature) and actual PrismaModule/proxy/Bull discovery. Holding synthetic worker.close prevents DB disconnect; observed worker-close-start → worker-close-end → disconnect. No product correction needed for this reduced topology. Queue/worker/drivers are mocked; not fullApp, network, actual job processing or durability evidence.

New redis/redis-shutdown-order.spec.ts uses actual RedisModule/PrismaModule/Bull registration and candidate-relative Redis placement. Current cleanup: pool-drain → pool-clear → primary Redis QUIT initiation → worker-close-start [held] → worker-close-end → Prisma disconnect. Moving only that instance's actual cleanup body to onApplicationShutdown produces the same order; phase-only repair rejected. Production RedisService also does not await primary quit. This records QUIT invocation, not physical socket closure. AI query/knowledge-sync work uses this shared Redis, distinct from Bull's own Redis connection. Next bounded fix must preserve the shared client through worker completion and await quit/fallback, with module-order acceptance; no generic shutdown framework justified.

Other source-confirmed limits: TicketsService emits without awaiting async listeners; automation/AI/notifications may write/enqueue after direct ticket completion. Installed EventSubscribersLoader removes listeners on shutdown without joining existing promises. SchedulerOrchestrator clears scheduled callbacks but does not universally await in-flight async callbacks. Redis teardown is independently actionable; fixing it does not prove detached-work completion. Maintenance still needs new ingress/producer fencing and observable completion, not queue-count zero or a guessed quiet sleep. No blind production shutdown authorized.

Independent test/code-security review accepted scoped tests; wording corrected per review. Focused offline10suites87tests passed. Local characterization only; no new production access, product changes, push, deploy, schema mutation or external calls. Existing Aluplan skill guided reuse of actual modules/queue patterns rather than new orchestration infrastructure.

## Real PostgreSQL and attachment graceful re-entry — 2026-09-24

New opt-in apps/backend/test/mail-shutdown-postgres-rehearsal.cjs loads allowlisted current inbound/claim/tickets/storage sources, real Nest and real Prisma PostgreSQL adapter. Fixed loopback15432/domain_test identity and PostgreSQL17/initial-empty checks prevent arbitrary endpoint selection. IMAP/MIME, SLA and external providers remain synthetic; AppModule is never loaded.

Executed against existing image sha256:7ae6051efd0e60444282c27c7e141af07f322ce033300e727a49c3dd11075e38, Docker Desktop, network none, temporary memory-backed DB. Current RC Prisma schema generated58,813bytes DDL through installed schema engine; normal Prisma CLI returned empty output and was not treated as success. One readiness retry required waiting beyond transient init-server readiness; failed owned container removed before retry. Loopback-only Docker-exec relay connected the harness to this owned DB; no production data or credentials used.

Actual SIGTERM during held upload after ticket/message commit proved admission fence and still-live DB; releasing work wrote exact attachment bytes, completed claim, acknowledged synthetic IMAP then invoked cleanup and final DB disconnect. Child exited by SIGTERM. Fresh child reprocessed same synthetic message, preserving all IDs and counts1ticket/1message/1attachment/1completedClaim. Exact attachment SHA256:40bb924c02a1c8526e036f932accdba0d7695bee43ff9348eedd9f69e48015cc. Owned directory enumeration asserts exactly the referenced attachment, excluding orphan replay writes. Independent review suggested this manifest assertion; incorporated before passing execution. Syntax/secret scan and focused8suites84tests passed.

Cleanup verified six owned domain-table counts zero; temporary containers and loopback relay removed. Temporary synthetic data/files were intentionally discarded, not a recoverable customer backup. No live access, product changes, migration/deploy/restart, push or external provider calls.

Limits: custom DB lifecycle provider is used here; actual PrismaService proxy wiring is covered separately by prisma-shutdown.spec.ts. Not fullApp/all-writer quiescence, real IMAP transport/socket closure, Linux/amd64 final image, SIGKILL/power-loss durability, migration compatibility or version rollback proof. Next smallest gate: identify actual remaining writers/background listeners and validate the bounded maintenance drain/re-entry sequence. Keep production activation separately approved and avoid expanding this into a new framework.

Isolation distinction: PostgreSQL container had OS-enforced network=none. Host harness/relay used a sanitized environment, fixed loopback endpoint and source/import/provider allowlists, but this PostgreSQL run did NOT use an OS-enforced host egress-denial sandbox. Do not inherit the earlier signal-only sandbox claim.

## Real signal acceptance with synthetic dependencies — 2026-09-24

Added opt-in apps/backend/test/mail-shutdown-signal-rehearsal.cjs. Fixed current EmailInboundService source is transpiled with SWC config discovery disabled and an explicit import allowlist; real Nest application context receives actual SIGTERM in an owned child only. Configuration-held and search-held cases both passed: process remains alive while held, subsequent polling fenced, release produces ordered synthetic ticket/message/completion/ACK/cleanup before synthetic DB shutdown, then exit is SIGTERM. This is source/macOS Node runtime evidence, not the final Linux production artifact.

Final parent execution used existing deny-default macOS sandbox, added read access to RC and self/child signal permission only; network remained denied. Child env allowlists omit production secrets/preloads. Missing opt-in and missing-dependency negative cases both exited1 without timeout; positive case exited0. First worker attempt with network denied failed on SWC inherited alias mapping, fixed by swcrc:false/configFile:false before final passing runs. Independent review found a child-error/unhandled-exit cleanup issue; explicit error settlement, IPC callbacks and nested-finally watchdog clearing corrected it. Final independent code/security review approved scoped tests. Owned children reaped; no fixture DB/container/customer files created or deleted.

Added prisma-shutdown.spec.ts: actual PrismaService constructor/proxy and real Nest lifecycle discover the final disconnect hook after a held destroy-phase provider completes. Driver/adapter/pool are mocked; this strengthens earlier source-regex proof but does not access PostgreSQL. Combined regression8suites84tests passed; secret scans/diff checks passed. No product changes in this batch.

Critical limit: persistenceProof:false. No real PostgreSQL write/reopen, real attachment byte persistence, full AppModule shutdown, physical IMAP socket close or detached-listener completion is proved here. Initial intent to test persistence was split rather than treating synthetic receipts as database evidence. Next bounded task is a fresh isolated synthetic PostgreSQL/current-domain-services signal/re-entry rehearsal retaining newly accepted records/attachment bytes; reuse existing domain fixture patterns and keep all external providers disabled. Live access, push and deploy remain unauthorized.

## Scoped local IMAP lifecycle correction — 2026-09-24

Three desired acceptance assertions failed before product changes. EmailInboundService now publishes a tracked polling promise before asynchronous work, fences new polls synchronously in onModuleDestroy, and awaits the active direct processing chain through its cleanup block. PrismaService disconnect moved from onModuleDestroy to onApplicationShutdown, keeping DB access available through destroy-phase drains irrespective of within-phase provider concurrency. No new API, dependency, environment variable, schema/migration, queue policy or maintenance endpoint.

Final focused offline run:7suites83tests pass, including3shutdown acceptance tests. Minimal real Nest lifecycle uses mocked IO and a synthetic Prisma hook; a separate source contract binds the real Prisma disconnect phase. This is not full application module topology or actual Prisma runtime disconnect proof. Schema-identical sibling generated declarations used for no-emit backend typecheck including shutdown spec:0diagnostics; schema cmp matched. Shell syntax checks and diff check passed. Independent architect and code/security reviewer found no critical/high blocker for this scoped direct chain. GitNexus tool/CLI unavailable; direct source/library impact review used instead.

Important limits: imap-simple.end() returns void and initiates closing, so awaiting finally is not physical socket-close proof. Detached event listeners/outbound enqueues are not part of the polling promise. BullMQ final-phase closure and other background jobs are not universally ordered by this patch; no all-writer drain claim. Hung dependencies can outlast the external termination grace; no arbitrary timeout was added that would falsely report successful completion. Local lifecycle fixes do not make the old live artifact safe to restart. Next targeted acceptance is an isolated full lifecycle/signal and persistent-write rehearsal using the accepted candidate; maintain the distinct first-cutover quiescence, renewal and release gates. No production connection/change, push or deploy in this batch.

## Local stop/re-entry audit — 2026-09-24

Local source and installed-library review only; no live access. Candidate deploy.sh invokes migrate-once.sh on every ordinary startup. That script verifies files, invokes prisma migrate deploy, and checks migration ledger/schema/RBAC before exec node. Shell syntax checks passed; no script executed against a database. Pending migrations can change data/schema, so restart is not inherently migration-free. Do not disable these checks as a shortcut.

Historical d9b21b9d source includes migration-ledger repair and schema operations; prior immutable-image metadata links the live image to a deploy.sh entrypoint, not a full compiled-byte startup proof. Existing ADR-022 rejection of blind historical restart/direct-Node fallback remains. No old image was loaded or executed.

Independent local review found IMAP lacks a shutdown hook or retained processing promise. Nest scheduler stops future schedules without proving active callbacks have completed. BullMQ worker.close has an active-job wait path, conditional on signal handling/grace; neither it nor an empty outgoing queue proves IMAP quiescence. Never use Queue.drain as a graceful wait: it deletes queued jobs.

PrismaService disconnects in onModuleDestroy; Nest calls destroy hooks before beforeApplicationShutdown. Merely adding an IMAP wait to the later hook would be too late to establish database availability. Module destroy order is reversed dependency-distance order, and providers within a module are awaited concurrently; actual module wiring must be tested rather than inferred from hook names.

Added email-inbound-shutdown.spec.ts: two real minimal Nest TestingModule lifecycle characterizations with mocked IO reproduce close resolving while IMAP configuration or connection cleanup remains pending, synthetic Prisma destroy before cleanup, and lack of a service-level post-close poll fence. Synthetic same-module ordering is NOT full application topology proof. Both characterization cases and seven existing IMAP transport regressions pass (9/9) under the offline sandbox harness; this PASS proves the defect is reproducible, not fixed. No actual signals, DB, Redis or mailbox used. Independent review found no blockers and prompted a bounded close observation plus final cleanup await, avoiding a future repaired implementation hanging the characterization indefinitely.

Next choose the smallest ordered lifecycle correction and invert characterization into safety acceptance, with actual module dependency ordering covered. No product implementation, new pause API, distributed coordinator, retry redesign, production stop command or zero-downtime claim in this batch. A local fix cannot retroactively make the old live process safe to stop; first-cutover quiescence remains a separately reviewed operational gate.

## Saved Coolify source confirmed through UI — 2026-09-23

Read-only Firefox inspection of the exact q4wgowwo0wwsg0sksg8gkow4 service, aluplan-support-mailservise, opened Edit Compose File and its source/deployable views. No editor text entered, Validate/Save/Restart/Stop clicked, environment secrets opened or credentials entered. Only presentation controls changed; editor closed without saving.

Saved source contains mailserver:latest, hostname mail/domainname allplan.net.tr, ports25/587/993/143, logical volumes mail-data/mail-state/mail-config and localtime:ro. Environment has OVERTAKE_IP_CHECK=1, ENABLE_SPAMASSASSIN=0, ENABLE_CLAMAV=0, ENABLE_FAIL2BAN=0; no TLS additions. restart:always. UI explicitly states volume names receive the service UUID prefix on save. Deployable view shows the exact q4wgowwo0wwsg0sksg8gkow4-prefixed three volume names and external service network previously observed on host. Selected fields agree; no byte-for-byte browser/export equivalence claim.

This identifies the saved source and its generated volume mapping. Future authorized changes belong in Source Compose with logical volume names retained; never paste the generated prefixed Compose back as source or replace the complete source with the overlay-only candidate. Keep existing settings, ports and logical volume declarations; add only reviewed image pin/TLS variables/read-only bind. Coolify persistence of a future edit is not proven until that separately approved edit is saved and re-read; no save was performed here.

Current UI status Running(unknown) is not a mail health test. Panel uses existing HTTP:8000 connection; no security interstitial bypass or new credentials submitted. Secure administration transport remains a separate hardening item, not permission to alter panel access now.

Source identification gate is closed. Remaining execution gates are exact all-writer drain/safe application re-entry, verified client release compatibility, renewal handoff/owner, and controlled maintenance acceptance. Next local task: audit the current startup/re-entry evidence and define the minimum bounded interruption/recovery sequence; no more repeated Compose inventory is needed unless configuration changes.

## Current generated Compose compatibility proved — 2026-09-23

At2026-09-23T16:46:51Z, scoped SSH inspection resolved the running mail container's Compose labels to /data/coolify/services/q4wgowwo0wwsg0sksg8gkow4/docker-compose.yml. docker compose config rendered this current disk configuration and its .env, then rendered the exact candidate supplied through stdin. Entire normalized JSON matched after only the pinned image, three TLS variables and dedicated read-only bind additions. Private values/output remained on host in process memory; nothing was installed or printed in full.

Current three named mounts (/var/mail, /var/mail-state, /tmp/docker-mailserver) and /etc/localtime bind identities match the rendered configuration. Published25/587/993/143 bindings match. Mail image remains sha256:4f5093c251b61d5691f5ccfd3f90fcbf505585bfd045546430d282e5417658c8, started2026-09-02T19:03:59.002772687Z/restarts0. No up/restart/pull or source file write. This closes the current generated-disk merge gate, NOT the Coolify editor/database source-of-truth persistence gate; do not hand-edit generated Compose and assume redeploy preserves it.

### Coordinated maintenance proposal — not executable authorization

1. Before scheduling activation: confirm Coolify's editable source matches this generated service, identify all mail clients/writers, finish the exact safe application refresh/startup path and certificate renewal handoff. No blind restart of current backend deploy.sh. Assign operator, maintenance window, stop/escalation point and explicit extended-maintenance acceptance under ADR-022.
2. At the approved window: take and verify fresh scoped recovery copies; retain newly accepted ticket writes and attachment/mail bytes. Recheck queue states. Use a separately reviewed writer-stop/drain sequence, not empty-queue observation or blank credentials as a fence. If independent mail quiescence cannot be achieved with existing mechanisms, disclose the required application interruption; do not promise uninterrupted web service.
3. Through the verified Coolify source, use the pinned existing mail image and exact persistent volumes with the reviewed TLS additions; recreate the container, do not upgrade or reset volumes. Verify effective configuration and trusted SMTP587 STARTTLS/IMAP993 certificates before any credential-bearing test.
4. Coordinate IMAP host/993/tls=true and SMTP host/587/secure=false (STARTTLS, not implicit TLS) with the accepted application artifact and all process caches. Settings changes and cache refresh/startup are separately approved actions; no direct blind DB patch. Do not deploy the entire local candidate merely to activate server TLS before its release gates pass.
5. Run an explicitly approved controlled sender/recipient test covering one intake, reply and attachment, then verify queue catch-up and duplicate avoidance. Retained failed jobs need investigation; never mass replay as a default. Reopen writers only after agreed acceptance checks.
6. On failure: preserve sources, queues and newly written data; keep affected intake held under the approved recovery procedure and communicate service impact. No automatic plaintext downgrade, historical unsafe image, old DB/mail restore-over-live, or deletion. Use forward recovery per ADR-022; do not call container re-entry version rollback.

Independent review accepted this as a gated proposal only. Server TLS activation alone does not repair live clients' rejectUnauthorized:false; full verified-client acceptance requires the reviewed hardened application artifact and its separate release gates. Renewal must have a named owner, exact protected publication procedure and expiry/failure escalation before maintenance closure. Exact process/command/drain/re-entry steps remain unresolved, not implied by this numbered sequence.

Next smallest action: inspect the Coolify editable service definition read-only and resolve the exact existing stop/drain/cache-refresh path. No new orchestration platform, broad retry refactor or production activation is authorized by this proposal.

## Approved nonsecret settings and queue counts — 2026-09-23

Owner explicitly approved the narrow DB/Redis metadata scope. At2026-09-23T16:44:45Z, a parameterized SELECT inside BEGIN READ ONLY queried exactly seven allowlisted settings. Secret-classified values were suppressed in SQL; no password, username, customer row or mailbox content selected. Transaction ended with ROLLBACK. Direct pg/ioredis clients only; no application bootstrap, worker or BullMQ Queue construction.

Confirmed DB values: provider smtp; SMTP mail.allplan.net.tr:587/secure=false; IMAP mail.allplan.net.tr:143/tls=false. All seven keys present. This confirms persisted settings, not an inspection of process-local cache contents. SMTP secure=false on587 is not itself proof that STARTTLS is forbidden; actual negotiation remains untested.

Compiled module inspection found no custom prefix declaration in the inspected app/email modules. Against the configured Redis endpoint and bull:email keys: wait0, active0, paused0, delayed0, failed0, prioritized0, waiting-children0, completed964; meta exists and paused flag absent. Only LLEN/ZCARD/EXISTS/HEXISTS commands were used; no payloads, job IDs, failure texts or job options read. Counts are a non-atomic point-in-time observation, NOT a drain/fence, successful recipient-delivery proof or assurance against new jobs arriving. Completed964 is retained queue history, not ticket count or all-time delivery total.

No DB/Redis application-data writes, queue pause/retry/delete, settings change, mailbox authentication, mail send, restart, push or deploy. Normal connection/diagnostic overhead occurred. Existing mail settings must not be independently toggled: strict local IMAP needs direct TLS993 with verified server TLS; coordinate cache refresh and all writers during separately approved maintenance. Next prepare current Coolify configuration comparison and an exact maintenance/acceptance sequence; empty queue now does not authorize activation. No new architecture or retry changes.

## Scoped live client audit — 2026-09-23

Owner continued the proposed read-only client/topology inspection. Verified SSH inspected selected compiled code, process names and effective mail TLS settings only. No application module imported/executed, DB/Redis payload queried, mailbox login, health-button authentication, settings write, restart or deploy. Diagnostic processes ran; service identities remained unchanged.

- backend-api image sha256:302229b2403d3a3e5fcb34b2af3003e6f0d6ba5e7610ad2e89e41eb375bd4644, started2026-09-02T19:03:59.250425823Z/restarts0. Process-name snapshot shows deploy.sh and one node process in that container. Other opaque application containers exist: this is NOT proof there are no other mail clients/writers.
- Live SMTP compiled code creates a transporter with setting-driven secure:isSecure and rejectUnauthorized:false, without requireTLS/ignoreTLS option. STARTTLS success is not established by this source inspection.
- Live IMAP compiled code uses setting-driven tls (false permitted), rejectUnauthorized:false, EVERY_MINUTE and process-local isProcessing. Current DB setting values were not read; earlier UI screenshot is not fresh configuration evidence.
- Live settings code contains a Map cache and get/set/delete paths, no TTL token. No live cache introspection or cross-process refresh proof.
- Both live and local email.module use5attempts/exponential3000ms defaults; BOTH actual EmailService enqueue paths override to5attempts/exponential2000ms. Module default alone was initially reported in commentary and corrected after independent review. Four nominal waits total30seconds, excluding execution/queue/initial-delay time. Actual existing job options/counts/states were not read. removeOnFail:false is retention, not automatic retry after exhaustion.
- Mail effective postconf smtpd_tls_security_level=none and doveconf ssl=no; custom /tmp/docker-mailserver/postfix-master.cf absent at inspection. Mail image/start/restarts match prior checkpoint. No claim of exhaustive custom-config or other-client inventory.

Independent local explorer confirmed strict-TLS candidate versus permissive live code: local SMTP requires TLS/cert validation; local IMAP requires direct TLS, so retaining port143 while only enabling the TLS flag is not a valid transition. Cache/poller coordination and finite retries remain blocking. No retry redesign or new infrastructure is justified by this inspection.

Next bounded evidence needed: selected nonsecret current mail settings (provider/host/port/TLS only), aggregate email queue states/options without payloads, current rendered Coolify configuration and other mail-client ownership. Any DB/Redis access must be explicitly scoped; no general mailbox/customer dump. Then propose one coordinated maintenance sequence with queue preservation and controlled acceptance; do not activate TLS or deploy independently. Application release and mail activation remain NO-GO.

## Local maintenance candidate verified, activation still blocked — 2026-09-23

Candidate commit 1365aa2a adds only .ai/issues/2026-09-23-mail-tls-compose-overlay.candidate.yaml. It pins the already examined DMS digest, adds SSL_TYPE/manual and the two certificate paths, and binds only /data/aluplan-mail-tls-bru9sghg read-only at /etc/aluplan-mail-tls with create_host_path:false. No image upgrade or full ACME-store mount.

Actual local docker compose config --format json comparison against the private Sep23 backed-up Compose/.env passed: after accounting for those exact changes, the complete rendered configuration is identical. Existing three named data volumes, ports and remaining environment/topology are preserved. Private rendered values stayed in process memory and were not printed or saved. Structural assertions, Gitleaks candidate scan and git diff --check passed. No service was started. This proves the backup-based merge only, not the current Coolify-rendered configuration.

Independent review of the pinned local image confirmed submission requires encryption and Dovecot defaults to ssl=required when IMAP is enabled. However, the empty-SSL_TYPE startup branch can rewrite these settings to none/no, and the manual branch does not explicitly reverse all those changes. Therefore a restart of the existing container is not an established activation method: plan a fresh container from the same pinned image with exactly the existing named volumes, then inspect effective settings. No local emulator override belongs in production. Backup filename inventory did not include postfix-master.cf; current live custom overrides remain unverified.

Activation remains NO-GO pending bounded current Coolify merge/override verification, deployed client/process/cache compatibility, a defined poller/queue drain and maintenance window, controlled mail acceptance/rollback checks, and a safe renewal handoff. Local strict-TLS clients do not prove deployed clients work. Finite SMTP retries and absence of an independent IMAP pause mean maintenance must not be assumed harmless. Do not introduce broad pause infrastructure or alter live settings automatically.

This preparation turn made no live connection/change, application-code change, mailbox/DB operation, push or deploy. Next safe scope is read-only deployed mail-client/worker topology and cache/queue evidence, followed by an exact maintenance proposal and separate explicit activation approval.

## Approved one-domain private export verified — 2026-09-23

Owner explicitly approved reading shared certificate storage (including its other private material) solely to extract mail.allplan.net.tr on-host. No keys/certificate store copied to Mac/Git/output. One-shot script sent over verified SSH stdin, executed python3 -I without optimization; not installed as a service/task or production publisher.

Result: /data/aluplan-mail-tls-bru9sghg, root:root0700. fullchain.pem, privkey.pem and public-only VERIFIED.json are root:root0600. Independent postcheck confirmed ownership/modes and no mount of this directory into mailserver. No existing output overwritten; fresh mkdtemp destination only.

Validation performed on host:
- Shared acme.json opened read-only/no-follow, regular root:root0600 and size-bounded. Exact resolver letsencrypt with exactly one matching main domain and no additional SAN metadata; actual leaf sole SANmail.allplan.net.tr.
- Strict base64 decoding, bounded selected key/chain, key/public certificate match, validity remaining greater than21days.
- OpenSSL chain/system trust/purpose/hostname verification and byte readback of both selected files. Current trusted public HTTPS leaf fingerprint matches exported leaf.
- Leaf SHA256 d1e47f725559175879ce0100dc29b7ce624bb0cdadd7bb0ad431536bdfaeafad; issuer Let's Encrypt YR1; expiry2026-12-22T15:26:05Z.
- Source bytes identical before/after; no source write. Proxy/mail image/start/running/restart identities unchanged.
- Postaction bounded responses allplan root307, API /api/v1/health200, aluplan200. Not full customer workflow validation.

Independent one-shot code/security review found no blocker and requested root-owner verification and isolated Python invocation; both applied before execution. Local synthetic helper checks passed for private-file reading, loose-permission rejection, symlink rejection,0600 creation and overwrite rejection before final root-owner tightening; no fake claim of executing a real-root local test. Script syntax checked; actual final on-host validation completed successfully. Only nonsecret script remains at local /tmp/aluplan-mail-export-j8A4eg/export.py; production key bytes never left the host.

No mail settings, credential changes, mounts, restarts, auto-renewal publisher/timer, DNS/firewall, mailbox/DB operation, deploy or Git push. This is protected certificate preparation, not mail TLS activation, automatic renewal acceptance, host cleanliness or disaster-recovery proof. Files fsynced; power-loss/directory-metadata durability not claimed. Current private candidate retained; no deletions.

Next: prepare exact same-image mail mount/TLS/client/drain maintenance diff and failure-safe renewal handoff, preserving these existing files. Any actual mount/recreate/settings/credential operation requires distinct explicit maintenance approval. Do not treat general continuation as permission to activate or rotate anything.

## Stage A1 applied and verified — 2026-09-23

Owner explicitly approved the proposed certificate-only action. Installed exactly /data/coolify/proxy/dynamic/aluplan-mail-certificate.yaml at2026-09-23T16:24:23Z, owner9999:0/mode0644. SHA256 be7c79ac419b4628378df45627a62ec6efd71403bb8920e4b418496f130d4209 matches the documented YAML. Existing target absent; complete staged file published by exclusive hardlink (no overwrite), not a partial write into watched YAML.

Remote private staging /data/coolify/proxy/.aluplan-mail-cert-XHauy0 retains candidate hardlink and default-before.yaml; no secrets stored there. Local nonsecret candidate /tmp/aluplan-cert-stage-a1-VWz5oo retained. Initial preflight intentionally stopped before writes because an overstrict all-files count included non-Traefik Caddyfile. Corrected check restricted to YAML/TOML and reconfirmed no target conflict; Caddyfile untouched.

Observed acceptance:
- Trusted client handshake and hostname verification PASS for mail.allplan.net.tr:443; expected HTTP418 from noop@internal.
- Public leaf issuer Let's Encrypt YR1, sole SANmail.allplan.net.tr, notBefore2026-09-23T15:26:06Z, notAfter2026-12-22T15:26:05Z.
- Before/after status: allplan.net.tr root307; api.allplan.net.tr/api/v1/health200; aluplan.net.tr200. These are bounded unauthenticated status checks, not full customer workflow proof. Initial /health probe404 was wrong-prefix baseline, corrected to /api/v1/health before installation.
- Preexisting default_redirect_503.yaml hash unchanged:88c2a2923a7939139e5448c65bd25d4df434d4b6f0c6bc6ad8f40b7c29065dfb.
- Proxy and mailserver remain running with prior Sep2 start times and restart count0. Bounded proxy log tail since installation had no error markers; this is not comprehensive logging/traffic assurance.

Scope: one new public routing file and resulting Traefik-managed ACME issuance/storage. No manual ACME JSON access or mutation, private-key read/export, DNS/firewall action, mail settings, credentials, restart, customer DB/mailbox operation, application deploy or Git push. Issuance/CT effects cannot be undone by merely withdrawing the route. No rollback needed or performed.

Critical distinction: HTTPS443 certificate readiness is now verified; SMTP/IMAP still use their prior configuration and are NOT claimed secure by this step. Existing renewal resolver capability is not proof of a completed renewal or safe certificate-to-DMS handoff. Next separately authorized scope is one-domain protected key/chain export plus production-safe renewal publication design, followed by distinct mail maintenance approval. Do not mount the full ACME store into DMS or activate auto-publishing based solely on this success.

## Stage A1 exact certificate-only proposal — 2026-09-23

User approved continuation of scoped read-only routing inspection, not installation/issuance. Live proxy binary reports3.6.7. CLI confirms only Docker/file provider arguments, https=:443, http=:80, directory=/traefik/dynamic/, watch=true. Host dynamic directory /data/coolify/proxy/dynamic is0700 uid9999/gid0. Proposed target absent. One visible regular YAML file default_redirect_503.yaml: PathPrefix(/), entrypoints http/https, priority-1000. Across22Docker router-rule labels (including stopped container inventory), no mail.allplan.net.tr match or broader HostRegexp/non-Host rule candidate found. These are bounded source/config observations, not complete live router API proof or future Coolify persistence assurance.

Mac-side DNS: mail A167.86.84.107; AAAA and CAA at mail and CAA at parent allplan.net.tr returned NOERROR/empty answer. Higher ancestor/authoritative CAA policy not exhaustively resolved; no claim of universal CA eligibility. Mac HTTP GET to mail:80 reached167.86.84.107 and returned404. This demonstrates reachability from this Mac, NOT a successful CA HTTP-01 challenge. Proxy start/restart unchanged; no special keys, ACME body or mail content read.

Proposed NEW target only: /data/coolify/proxy/dynamic/aluplan-mail-certificate.yaml. Do NOT install until the owner explicitly approves this Stage A1 scope.

```yaml
http:
  routers:
    aluplan-mail-certificate:
      entryPoints:
        - https
      rule: "Host(`mail.allplan.net.tr`)"
      priority: 100
      service: noop@internal
      tls:
        certResolver: letsencrypt
        domains:
          - main: mail.allplan.net.tr
```

This exact-host rule does not route mail traffic or other hostnames. Existing catch-all priority-1000 is lower. noop@internal is implemented in the exact upstream Traefikv3.6.7 source as an empty HTTP418 response; it does not expose a backend/dashboard. Traefik obtains/stores a certificate through its existing resolver; this step is not certificate export to DMS or mail TLS activation.

### Authorized-action boundary to present to owner

Stage A1 approval would authorize only: preflight revalidation, creation of the one named nonsecret dynamic file, resulting Let's Encrypt request/shared ACME update and public Certificate Transparency hostname publication, bounded public TLS/status verification. No mailserver restart/settings, credential rotation, private-key read/export, DB action, DNS/firewall change or application deployment. Explicitly preserve all existing dynamic files/router labels and shared proxy process.

Before placement recheck exact target absent, route conflicts, resolver/entrypoints and directory ownership; capture known application-host response baselines and nonsecret configuration fingerprints. Publish complete content with no overwrite and atomic visibility from a same-filesystem staging location outside watched YAML names. Keep owner9999/gid0 and0644 for this nonsecret file, parent unchanged. Do not chmod/chown any existing path. A failed/partial write must not become a watched YAML file.

Acceptance: trusted chain and exact mail hostname on443 plus418, absence of errors affecting unrelated router loading, and comparable before/after responses for allplan.net.tr, api.allplan.net.tr health and aluplan.net.tr. No authenticated customer probes. If existing route behavior changes, certificate remains invalid or ACME reports error, stop; do not loop issuance or modify resolver/global settings.

Withdraw only the new owned file when needed, after verifying content matches this candidate; preserve a local copy of the nonsecret proposal. Withdrawal does not revoke a certificate, undo CT publication/rate-limit effects, or roll back shared ACME state; never delete/revert acme.json. Coolify future regeneration persistence and ongoing certificate-to-DMS handoff remain later acceptance gates, not claims from this read-only turn.

Independent reviewer accepted exact-host/noop design with preflight and before/after checks; no production permission inferred. Source: [Traefik3.6.7 internal handler](https://raw.githubusercontent.com/traefik/traefik/v3.6.7/pkg/server/service/internalhandler.go), [file provider](https://doc.traefik.io/traefik/v3.6/reference/install-configuration/providers/others/file/). Next decision is explicit owner approval for Stage A1, not another redesign or combined mail maintenance.

## Synthetic certificate renewal rehearsal passed — 2026-09-23

New test-only harness apps/backend/test/mail-renewal-rehearsal.cjs, commit99b506fe. Explicit MAIL_RENEWAL_REHEARSAL=synthetic-local-only opt-in, local macOS Docker Desktop Unix socket pinned, remote Docker overrides refused before access. Pinned public DMS v15.1.0 amd64 image; fresh internal network, no published ports, only disposable synthetic config/cert/public-CA mounts. No real key/ACME/mailbox/backup/customer/DB or production access.

Final strengthened run passed nine recorded checks:
1. Initial trusted synthetic leaf presented by actual SMTP587 STARTTLS and IMAP993.
2. Mismatched private key rejected before publication; previous leaf remained on both protocols.
3. Wrong-hostname certificate rejected; previous leaf preserved.
4. Expired certificate rejected; previous leaf preserved.
5. Untrusted certificate rejected; previous leaf preserved.
6. Truncated certificate rejected; previous leaf preserved.
7. Identical pair is a no-op.
8. New valid same-CA leaf/key published; both protocols presented its new SHA256 fingerprint with actual chain/hostname verification.
9. Container start/restart identity unchanged and changedetector RUNNING after renewal.

Test-local publication validates chain/purpose/name/time/key match first, stops and confirms changedetector STOPPED, replaces the pair, then starts it. Existing DMS watcher performs reload. This single-writer successful path is NOT a production publisher: no crash-between-copy recovery, concurrent writer/other reload coordination, publisher recovery after I/O failure, ongoing alerting or actual Traefik export/CA renewal proof. No mailbox authentication/send/receive roundtrip in this test; previous tests retain their own scope.

Local emulator-only dovecot.cf default_vsz_limit1G allowed amd64 on ARM; container RAM768MiB/2CPU. This override must not enter production. Normal daemon capabilities were retained (not privileged); helper hash container network-none/read-only/cap-drop/nnp. CA private key was never mounted into DMS; only leaf pair and public CA were.

Two initial fixture-tooling attempts failed before mailserver startup: macOS LibreSSL lacks passwd-6 and verify_hostname options. Synthetic hash now uses an isolated named/labelled helper; hostname validation uses Node X509.checkHost alongside OpenSSL chain/purpose/time checks. These failures are not application RED tests or certificate-rejection evidence.

Independent code/security review found and corrected local-target enforcement and timeout-after-create cleanup gaps. Final review approved test scope; final full rerun passed. Remote DOCKER_HOST negative control rejected before Docker access. All exact owned container/helper/network names are token-label-checked during independent cleanup attempts; uncertainty fails and retains files. Parent final labelled container/network inventories empty. Owned temporary synthetic keys/accounts were removed; no user/customer files or images deleted. Node syntax check and Gitleaks file scan passed.

Reproduce with Node24: MAIL_RENEWAL_REHEARSAL=synthetic-local-only node apps/backend/test/mail-renewal-rehearsal.cjs on local Docker Desktop. Runtime helpers are real, but this does not certify exact production Node/Linux application image or complete recovery/security readiness. No product/schema/env changes, push or deploy.

Next bounded step: exact proxy dynamic-route ownership/conflict metadata and reviewed certificate-only StageA diff. Existing watcher capability and successful local renewal are now demonstrated; do not repeat them as unknown, but keep crash-safe production publication and distinct StageA/StageB approvals open. No real issuance/private-key extraction/automatic publisher authorized by this rehearsal.

## Narrow certificate change sheet — proposal, 2026-09-23

Local planning and independent security review only. This is NOT executable configuration, CA issuance approval or a production-ready renewal implementation. Avoid mixing application release, mail image upgrade, DNS migration, firewall work or unrelated vulnerability remediation into this slice.

### Selected direction and rejected shortcuts

Prefer the existing Traefik letsencrypt HTTP-01 resolver over a second certificate daemon or new DNS credentials. This is conditional on a nonconflicting, persistently managed dynamic route being supported by current Coolify/proxy configuration. Do not stop the shared proxy or commandeer80/443 for standalone Certbot. Do not add the mail hostname to the support frontend/WordPress router merely to obtain a certificate; avoid repeating the earlier host-routing collision.

Shared acme.json remains owned by Traefik. A narrowly controlled host-side export can read it and emit only the dedicated mail certificate/key. This exporter necessarily has access to ALL private keys in the shared input: filtering output is NOT least-privilege input isolation. Owner must approve that exact private-material access. No new external upload, private key in Git/logs, Docker socket in mailserver, or whole ACME store mounted into mailserver.

### Stage A — certificate preparation, separate approval

1. Complete remaining metadata preflight: exact HTTPS entrypoint name, file-provider enabled/watch and managed directory, file ownership, Coolify persistence, existing exact-host router conflicts, external HTTP-01 reachability and A/AAAA/CAA compatibility. Current VPS-side A lookup alone does not prove external CA reachability. Do not guess these values into an executable patch.
2. Propose one uniquely named TLS router with exact Host(mail.allplan.net.tr), explicit letsencrypt resolver and only that domain. Its HTTP service must be a verified inert response, never the support backend, mail ports, proxy dashboard or admin UI. Review rendered config/diff locally before placement. If a proxy restart/static change is required, stop and rescope; this plan does not authorize one.
3. On explicit issuance/config approval, request a dedicated public certificate. CT publication of the hostname is expected. Issuance modifies shared ACME state but must not rewrite/delete other entries. Failure leaves mail configuration and volumes untouched. Removing the proposed route is not an instruction to revoke certificates or roll back the shared ACME store.
4. First export only after separate explicit key-access approval. Fixed input and exact hostname selector; root-owned non-user-writable code/config, no user-controlled shell arguments. Reject ambiguous/multiple matches, unrelated SANs, invalid chain/hostname/validity/key pair, malformed or partial input. Do not overwrite the input or log private values. Stage in a new private versioned directory; key0600, parent0700. No mailserver mount or automatic publisher enabled yet.
5. Record only public fingerprint/expiry, protected paths and validation outcome. Do not infer mail endpoint readiness from443 certificate success. No mail credentials/settings change or authenticated mail test in Stage A.

### Local renewal acceptance before automation

Use only synthetic certificates/keys and disposable isolated DMS v15.1.0; no real ACME store or customer backup. Prove first pair, second valid pair, mismatched key, wrong hostname, expired/untrusted certificate, truncated input and unchanged input behavior. Assert rejected replacements keep the previous valid pair and report failure; successful replacement must actually be presented by both SMTP STARTTLS and IMAP TLS.

Directory mounting avoids single-file inode staleness, but an atomic symlink rename alone does NOT prove two separate certificate/key opens see the same generation. Rehearse coordinated publisher/watcher behavior and ownership/mount visibility; choose the smallest proven publication/reload method before enabling automation. Do not invent zero-downtime guarantees. No automatic publication until this proof passes.

Renewal ownership must be assigned: Traefik handles CA renewal; a reviewed host-side scheduled task handles the one-domain handoff; the existing DMS mechanism reloads the services. Each is a distinct success gate. Proposed checks: daily certificate expiry/fingerprint observation, alert below21days remaining and on failed handoff, urgent escalation below7days; recipient/channel/operator must be explicitly chosen, not assumed. No new monitoring platform needed if an existing alert channel suffices.

### Stage B — approved mail maintenance only

Freeze exact same-image Compose diff: dedicated read-only TLS DIRECTORY mount, SSL_TYPE=manual and explicit chain/key paths; preserve all mail/state/config volumes and unrelated service settings. Pin verified image provenance; never pull latest opportunistically.

Before execution, verify the deployed client/process topology, cache refresh and actual drain/pause strategy. Existing finite SMTP retries prohibit assuming a mail outage queues forever. Brief mail interruption must be explicitly accepted; don't disable host/password as a makeshift pause. Preserve newly accepted messages/jobs. App DB and settings recovery evidence remains required separately; the mail archive is not a ticket DB backup.

Coordinate IMAP993/TLStrue and SMTP587/STARTTLS, certificate validation and eventual plaintext-auth rejection across ALL known clients. No password rotation until encrypted paths work and the local secret-handling fix is accepted in its own release scope. Do not combine unapproved application deployment with mail maintenance. Mail transport can be enabled while legacy clients still exist only under an explicitly bounded compatibility-risk decision, never by silently weakening the target.

Acceptance: correct hostname/chain/expiry on mail endpoints; no plaintext credential fallback; approved synthetic send/retrieve/reply/attachment roundtrip; preserved originals/queue; named operator watches failures. Abort on wrong cert, unidentified client, unproven drain or data/queue discrepancy. Keep customer data; no mailbox/DB restore-over-live or automatic rollback to plaintext.

### Review and next action

Independent security reviewer found direction reasonable but explicitly NOT executable; confirmed remaining route ownership, broad exporter input privilege, certificate/key race, mount/readability, failure alert and client acceptance gates. The next local implementation is a small synthetic handoff/renewal rehearsal, not live issuance and not a universal certificate-management platform. Finalize live change scope only after remaining metadata and this proof; obtain distinct Stage A and Stage B approvals.

References checked2026-09-23: [Traefik v3.6 ACME](https://doc.traefik.io/traefik/v3.6/reference/install-configuration/tls/certificate-resolvers/acme/) for router-driven domains, HTTP-01 port80 and automatic renewal; [DMS TLS guidance](https://docker-mailserver.github.io/docker-mailserver/edge/config/security/ssl/) for manual certificates and directory mount considerations. DMS edge docs are design guidance only; previously inspected exact v15.1.0 image source remains version-specific evidence.

## Approved public certificate/renewal metadata check — 2026-09-23

Scoped read-only SSH on verified vmi3049865, observation2026-09-23T16:02:07Z onward. No private key or acme.json content read, mailbox authentication, customer content, database access, issuance, DNS/config writes, restart, push or deploy.

- Mailserver Postfix smtpd_tls_cert_file is empty. Dovecot ssl_cert points to /etc/ssl/certs/ssl-cert-snakeoil.pem; public x509 metadata confirms self-issued CN/SANlocalhost, valid2025-08-12 through2035-08-10. This cannot validate mail.allplan.net.tr.
- Current DNS resolution from VPS returned167.86.84.107 for mail.allplan.net.tr. Verified TLS handshake to hostname:443 failed SSLCertVerificationError. Separate diagnostic public-cert-only handshake (no HTTP request/auth/credential; validation bypass limited to inspection) identified self-issued TRAEFIK DEFAULT CERT with a traefik.default SAN, not mail.allplan.net.tr. This443 observation does NOT prove SMTP/IMAP endpoint behavior or global absence of an unserved matching certificate.
- coolify-proxy runtime arguments configure letsencrypt HTTP-01=true, entrypoint=http, http.address=:80 and ACME storage=/traefik/acme.json. Mount source/data/coolify/proxy; host acme.json exists0600/103303bytes. Contents intentionally not opened because they include private material. No DNS/TLS challenge arguments observed. Existing issuance mechanism is identified, not successful challenge/renewal for the mail hostname.
- Conventional /etc/letsencrypt/live/mail.allplan.net.tr/fullchain.pem and renewal/mail.allplan.net.tr.conf absent. Narrow timer-name search returned no certbot/acme/letsencrypt result. This is not exhaustive absence of alternate certificates/jobs and is not evidence against Traefik's internal renewal.
- Final mail/proxy running/start times and restart counts unchanged (both0 restarts). No mail protocol probes or tests executed.

Decision: do not enable TLS checkboxes against these certificates. Smallest candidate is reuse the existing HTTP-01 resolver for a dedicated mail-host certificate, without proxy shutdown, port takeover or mailserver version upgrade. This is a proposal only: prove exact routing/config diff, challenge reachability and bounded certificate-to-mailserver renewal handoff before issuance. Mailserver must receive only its own chain/key in a protected read-only directory, never the full multi-domain ACME store. Certificate issuance and any extraction/private-key access, route/config change or renewal hook need explicit scoped approval; public CA issuance also publishes the hostname in certificate-transparency records.

Next prepare/review one narrow issuance-and-renewal change sheet with the current proxy topology and separate mail TLS maintenance boundary. No claim that metadata alone closes certificate readiness, operator pause, deployed cache behavior, webhook custody or application release gates.

## Mail password classification fixed locally — 2026-09-23

Bounded server-side correction in SettingsService only. Exact email.imap.pass/email.smtp.pass now override caller isSecret=false for encryption on explicit saves and masking on default responses/caches. Stored isSecret still determines decryption, preserving historical unflagged plaintext internally. Those exact mail keys are deliberately excluded from preexisting read-time automatic secret migration: reads and masked saves do not rewrite old credentials. Existing other secret-key migration behavior remains unchanged. Frontend's IMAP classification hint remains unchanged; server enforcement is authoritative, tested against its false flag.

- Regression-first8failures/21passes before product patch. Final settings35/35, combined settings/mail5suites64/64 passed in network-denied synthetic/macOS Node24 harness. Real DB, actual cryptographic storage and live mail were not exercised (Prisma/Crypto mocked).
- Independent combined code/security review found no blocking issue; recommended legacy-unflagged masked-save tests added and passed. Dedicated additional code-reviewer launch failed agent-thread limit; no separate second review claimed.
- Initial older typecheck harness failed977diagnostics because RC generated database declarations are absent. Explicit identical-schema sibling declaration mapping resolved that harness problem: backend plus explicitly included settings spec0diagnostics, rerun after final test edits. No client generation or schema edits; not a clean installed production-image build.
- SettingsService whole-file coverage75.93%statements/67.52%branches/96.29%functions/74.26%lines. This does not satisfy the overall80% target or certify whole-project coverage; unrelated AI validation branches were not expanded merely to inflate this small security patch. Earlier opt-in wire suite was skipped in broad matching; final64 explicitly selected tests have no skips, and no new wire acceptance is claimed.
- Changed diff Gitleaks scan found no leaks. GitNexus CLI/tool unavailable; source-level settings/controller/mail callsite impact inspected. No UI/runtime change; no frontend browser acceptance claimed.
- Test commit7bd17b46; product1157cc28. No new env vars, schema/migration, customer/production reads or writes, credential rotation, push or deploy. Source-only revert needs no data rollback but reintroduces missing mail-secret enforcement.

Limits retained: authorized ADMIN/SUPERUSER decrypt=true API intentionally still returns plaintext; this patch does not claim secrets can never be retrieved via API. Historical plaintext values, if any, remain unchanged until an explicitly authorized save/rotation. Existing CryptoService empty-string roundtrip behavior remains a follow-up: UI filters empty values, but direct API empty-password saves need a separate regression-first decision. No claim that current live passwords are plaintext or this patch is deployed.

Next return to scoped public certificate/renewal metadata and exact deployed process/cache evidence, then reviewed TLS maintenance. Avoid expanding this fix into a new secret manager or cross-process cache redesign. Production NO-GO remains.

## Local renewal and client-refresh audit — 2026-09-23

Read-only inspection only this turn. Public pinned v15.1.0 amd64 image inspected with overridden shell entrypoint, network none, read-only root, dropped capabilities/nnp and bounded resources; no mail daemon, live volume or secret mounted. Temporary inspection containers auto-removed and absence verified. Existing image digest above remains unchanged; no new image pull.

- Image /usr/local/bin/helpers/change-detection.sh:24-76 includes SSL_CERT_PATH/SSL_KEY_PATH in manual-mode content checks. check-for-changes.sh:148-170 invokes _setup_ssl on matching changes; :74-82 reloads Postfix and Dovecot; :214 defaults polling to2seconds. helpers/ssl.sh:223-267 copies mounted files into internal /etc/dms/tls and protects the key0600. This is source-level reload support, NOT issuance, live watcher health, successful renewal or atomic certificate/key replacement proof. Do not publish partially updated key/certificate pairs or mount the whole multi-domain ACME secret store.
- Independent explorer verified local SettingsService caches indefinitely in process-local Maps (:11-12,223-258). Admin save updates only that process (:53-70,330-375); no cross-process mail invalidation found. SMTP builds a transporter per send (smtp.provider.ts:12-37); IMAP creates connections on minute polls (email-inbound.service.ts:34-46,117-136). Active polls can keep old settings; direct DB writes bypass cache. Deployed artifact/process topology is not established by this local evidence.
- No independent inbound/outbound pause control found in inspected application source. Blank host is not a safe pause/drain mechanism. Outbound retries are finite (email.service.ts:146-155:5attempts/exponential2s), so mail downtime cannot be assumed harmless indefinite buffering. Health buttons authenticate; not metadata-only inspection.
- Concrete local security prerequisite found: frontend admin/settings/page.tsx:250-278 secretKeys includes email.smtp.pass but omits email.imap.pass; IMAP save includes it at:1552. Backend settings.service.ts:13-23 secret-name fallback omits .pass and bulk upsert:334-355 can persist newly entered IMAP password with isSecret=false. Existing masked unchanged values are skipped, so this does NOT prove any current live secret is plaintext. No credentials/DB were read.

Next smallest local correction: regression-first server-side classification of known mail password settings, with matching frontend handling, preserving masked/unchanged values and existing secret encryption behavior. No blind rewrite of existing settings or live credential rotation. Treat as bounded secret-handling bug, not a new secret-management platform. Then finish exact certificate/renewal and process topology metadata evidence under scoped production read approval. Public cert SAN/issuer/expiry plus renewal configuration inspection requested separately; no such new live access occurred in this turn.

No product/test changes or fresh regression results in this audit; no deployment approval. Prior backup and synthetic acceptance remain their recorded scope only.

## Fresh mail backup on owner Mac — 2026-09-23

Owner explicitly selected this Mac and declined archive encryption. Fresh private VPS staging/archive created, transferred over verified SSH/SCP, then inert local regular-file readback verified. No live service/configuration writes, restart, mail login/send, DB operation, push or deploy. Copying/hashing necessarily read customer mail and configuration bytes, but no bodies, attachment/customer filenames or secret values were displayed.

- VPS checkpoint: /var/backups/aluplan-mail-20260923-dq1P6P; capture started2026-09-23T14:31:45Z, final verification2026-09-23T14:33:43Z. Sources: exact previously validated mail-data/mail-state/mail-config volumes and service docker-compose.yml/.env. New staging only; existing backups untouched.
- Mac directory: /Users/hazarvolgaekiz/aluplan-mail-backup-20260923-2hskQt, outside Git, owner hazarvolgaekiz,0700. Archive mail-backup.tgz0600,1621978bytes; unencrypted by owner choice. SSH encrypted the transfer, not storage. File permissions are not encryption; no FileVault claim. Private extracted readback also remains locally; retain both pending explicit cleanup.
- Archive SHA256 aeff9da90f02c018890c1ab9fefb405f0ee9590f0d699381c1205f438509df06 matched remote manifest and local bytes. Remote gzip integrity and GNUtar staging comparison passed.
- Initial drift check correctly stopped on31 nonregular-file skip notices (no stderr). Categorized without exposing filenames. Recheck with NONREG0 suppressed only those notices: checksum/metadata dry-run comparison showed0 persistent differences for each of three volumes; deletion detection enabled ONLY with dry-run. Compose/env byte comparisons passed. This sequential live check is not an atomic snapshot.
- Container image/start/restart/running identity unchanged before/after. No existing file deleted. Source rsync excluded device/special files; transient nonregular entries are not a persistent-file recovery guarantee.
- Local fresh restore-check materialized237regular files,3905939bytes; every file matched archived SHA256/length. One symlink remains stored in archive but was not materialized;0hardlinks/0special archive entries. Local output uses0700/0600, not original ownership/ACL restoration. No runtime started, no network-enabled restored service, no live restore.
- Local verifier rejected synthetic traversal, normalized duplicates, non-directory parent conflicts and checksum mismatch; valid synthetic case passed. Independent security review found no blocker for this bounded small archive. Verifier is not a general-purpose hostile/large-archive tool; member limits are applied after metadata parsing.

Result: fresh off-VPS, unencrypted owner-controlled mail/config file copy with transfer and regular-byte recovery evidence. NOT a ticket-DB backup, complete application disaster recovery, atomically consistent mailserver snapshot, ongoing retention policy, host-cleanliness proof or deployment approval. Messages accepted after capture are outside this checkpoint. Backup scripts and private reports remain outside Git in the Mac directory.

Next: return to the bounded TLS certificate/renewal/client compatibility gate; do not create more backup infrastructure. A real mail runtime restore with production data remains separately scoped and must never start a second active sender/intake. Application release still requires the recorded DB/attachment/exact-artifact gates and explicit deployment approval.

## Approved live mail custody metadata inspection — 2026-09-23

Owner approved configuration/retention/volume/backup metadata reads only. SSH host identity vmi3049865 verified; observation began 2026-09-23 14:05:19 UTC. No mailbox login, customer body/attachment read, DB access, test send, configuration write, restart, deployment or publication.

Current evidence:
- Mail container mailserver-q4wgowwo0wwsg0sksg8gkow4 running, started 2026-09-02T19:03:59.002772687Z, restart count0 before/after. Image sha256:4f5093c251b61d5691f5ccfd3f90fcbf505585bfd045546430d282e5417658c8.
- Named mail-config/mail-data/mail-state volumes mounted at /tmp/docker-mailserver, /var/mail and /var/mail-state. Maildir root/cur/new directories exist; no individual messages enumerated.
- Selected effective Dovecot autoexpunge and autoexpunge_max_mails entries all0. Global ssl=no and disable_plaintext_auth=no remain an unresolved transport risk; nested listener ssl values differ. No protocol/authentication probe performed.
- Filesystem194G total,36G used,159G available,19% usage. This observation does not support a disk-full explanation.
- /var/backups/aluplan-mail-20260919-wvS1G5 exists root:root0700; mail-backup.tgz is1618614bytes, root:root0600, mtime2026-09-19 13:41:08 +0200. SHA256SUMS and zero-byte restore-persistent-compare.log exist0600. Only this aluplan-mail-* directory was found at /var/backups depth1.
- Archive contents/hash were NOT read or retested. Earlier capture/readback proof is recorded in 2026-09-19-mail-transport-observation.md, not newly reproduced here. This on-host backup cannot cover subsequent mail or protect against loss/compromise of the same host.
- Bounded host schedule scan checked17files. Candidates were package dpkg backup and a root cron backup reference; the latter had no direct mail/database/Coolify/remote-copy-tool match. Its implementation and success remain unknown. Selected systemd timer-name scan found dpkg-db-backup only.
- Container schedule candidates include /etc/cron.d/dovecot-purge.disabled and package dpkg. A disabled-name file is not proof of execution or absence of other deletion paths. Checked default mailbox Sieve paths absent; other user/global Sieve locations were not exhaustively inspected.

Decision: persistent source location is identified, but retention/retrieval and current protected backup are NOT proven. No evidence here establishes data loss, complete retention, absence of all backup jobs, or complete host cleanliness. Manual/client expunge, indirect scripts, other backup locations/provider snapshots and active webhook source custody remain unverified. Current code/tests unchanged; no new test result or release acceptance.

Smallest next gate: separately scoped fresh protected mail backup/custody and an isolated byte-verified recovery rehearsal, including Seen/partially completed source. Agree destination/encryption/retention and access scope before reading/copying customer content or creating a backup. Do not add an archive platform, change TLS settings blindly, auto-replay held intake or deploy. Operator ownership and bounded repair acceptance remain open; production NO-GO unchanged.

## Retained-source attachment rehearsal — 2026-09-23

Test-only, explicitly single-writer proof for ONE known message with ONE missing attachment. New synthetic MIME is retained in a no-clobber mode0600 temporary file BEFORE intake, then reparsed with actual mailparser. Storage failure is injected once; ticket/message/partial-attachment marker persist through real services/PostgreSQL. Test-local manual procedure verifies whole-source SHA256, Message-ID, sender, canonical input fingerprint, marker message ID, current ticket ownership and unchanged claim before filling only the missing attachment. LOCAL storage bytes are compared and hashed. Second serial invocation does not add a row/object; tampered source is rejected before attachment writes.

Final domain suite10/10 passed; changed-fileTS0; independent test review approved. Test commit29182054. No product/schema/env change, provider/live/customer access, push or deploy. Owned synthetic tmpfs database/network removed, relay terminated, and temporary source/attachment files cleaned. Those discarded files contain no customer data.

Important limits:
- This is not a production recovery command or completed operator workflow. The helper exists only inside the opt-in test. No claim state or historical error is cleared; repaired item deliberately remains reviewable.
- Existing partial-attachment policy returns success and processed=true with INBOUND_ATTACHMENT_FAILURE metadata. Therefore neither UNSEEN-only retention nor HTTP non-2xx retry can be assumed to protect this case. Retained source must also cover partially completed/acknowledged mail.
- Recovery source was created/retained by the test, NOT retrieved from a live mailbox/webhook provider. Production source retrieval, retention policy and protected custody remain unverified.
- Only serial repeated repair is proven; no concurrent-operator fencing, storage/DB crash-window recovery, generalized multi-attachment identity mapping, unknown-message identification, durable operator audit or complete negative-identity test matrix is claimed.
- Real PG uses the same disposable schema-snapshot/Prisma setup recorded below, not a production migration, backup restore or exact Node20/Linux release-artifact proof.

Next gate is a bounded operator/source-custody design and proof, not more automatic replay: determine how original MIME including Seen/partially completed mail is retained/retrieved; provide immutable source identity and an audited repair decision; preserve operator exclusivity and current-state checks before writes. Any production metadata/mail access needs separately scoped permission. Until that path is demonstrated, do not call manual recovery ready or approve deployment. Avoid promoting the test-local check-then-insert procedure into a public API or executable production script.

## Recipient lookup moved before writes — 2026-09-23

Implemented the bounded ordering correction in TicketsService.addMessage. Existing recipient routing block is unchanged except its explanatory comment and placement: after authorization/validation/sanitization, before the reply transaction. Events remain after commit. No schema/env/dependency/API or retry change.

- Added unit test first failed on lookup-after-write call ordering. Final12suites203tests passed, including unchanged department recipient event payload, assigned-agent and staff-to-customer routing, ticket security and intake regressions.
- Updated real PostgreSQL suite9/9 passed: injected recipient-query rejection now leaves zero messages and PENDING_CUSTOMER unchanged, holds known ticket linkage with no fabricated message ID, emits no event and does not auto-replay. Query failure is injected; persistence is real. This supersedes the earlier postcommit recipient-query characterization, not other postcommit failure limits.
- Changed-file TypeScript diagnostics0. Independent source/test code review approved with no actionable regression/security finding. Full project typecheck/build, full coverage, actual SMTP notification delivery and production runtime acceptance not claimed.
- Direct callers remain web/API, IMAP, webhook. Source-level impact/diff reviewed; GitNexus unavailable as previously recorded. Aluplan skill kept this to reordering, not new infrastructure.
- Tests d3756d51, product e1ff2f0b. Owned synthetic tmpfs DB/network removed; temporary attachment files cleaned and relay terminated. No customer/live access, push or deploy.

This closes the demonstrated recipient-query partial-write window only. Existing event-dispatch/ambiguous-commit/source-custody/manual-reconciliation gates remain. Next prove bounded retained-source reconciliation against the acceptance matrix below; do not blindly replay held mail, restore local DB over production or broaden into an automatic recovery framework. Production NO-GO unchanged. Source revert needs no data migration but reintroduces the known partial-write risk.

## Recovery gate consolidation and recipient-query proof — 2026-09-23

Test-only checkpoint. Real PostgreSQL domain suite9/9 passed, changed-file TypeScript diagnostics0, independent test review approved. The new test injects ONLY db.user.findMany rejection at the department-recipient query; it is not a PostgreSQL outage simulation. Actual ticket/message/hold writes remain real. Result: reply and OPEN state committed; attachment absent; claim held with ticketId but no ticketMessageId; no event and no duplicate on retry. No product fix is claimed. No production/customer access or publication. Owned synthetic container/network/files cleaned and relay terminated.

Smallest next code candidate: resolve notification recipients after existing authorization/sanitization but before the message transaction. A recipient-query failure would then leave no new message/status write. Keep provider/event effects after commit, do not swallow failed work, and retain existing source/hold policy. Requires an updated failure regression plus successful recipient-routing regression before implementation acceptance.

### Manual reconciliation acceptance matrix (plan, NOT executable recovery)

| Observed state | Required evidence before correction | Safe decision boundary |
|---|---|---|
| Held; ticket/message proven absent | Recoverable original MIME + attachments; correct sender/account; all relevant writers fenced; fresh exact DB evidence | Only a separately reviewed, authorized one-message recovery; never clear claim and blindly rerun ingress |
| Ticket known, initial message missing | Original source matches immutable fingerprint; ticket ownership verified; no already-created message | Plan targeted missing-message/attachment completion, not second ticket |
| Ticket known, message ID unknown | Exact source plus durable write correlation; subject/body/time alone are NOT identity | Hold until identity is established; no guessed linkage, deletion or replay |
| Message known, attachment missing | Exact expected bytes/hash and authorized message binding; current object/DB inventory | Repair only missing object/link after separate proof; never resend whole email |
| Identity conflict, interrupted owner, or ambiguous commit | Retained source variants, current claim snapshot and all-writer state | Escalate/manual investigation; no lease expiry or automatic retry |

Current admin/inbound/review is JWT + settings:read + no-store, bounded read-only projection. It exposes ticketId but not marker message ID/count or raw source. It neither retrieves source nor performs reconciliation nor proves a responsible operator observes holds. The fingerprint is identity evidence, not recoverable content. A proposed checklist is not a proven recovery mechanism.

Release-blocking evidence still required:
1. Original source and attachment retrieval/retention for each active ingress, particularly currently unverified webhook provider use. An HTTP503 alone is not source custody.
2. A bounded synthetic rehearsal of operator identification, separately authorized targeted repair, duplicate protection, attachment byte comparison and final state verification. Any future repair must keep identity/CAS fences and audit; generic ticket APIs may trigger notifications, so they are not an assumed safe repair shortcut.
3. Named operational ownership and review cadence for held mail; coordinated independent-writer pause during transition; actual backup/restore and exact-artifact gates already listed below.

Deferred by design: generic outbox, automatic retries/lease takeover, new broker, universal exactly-once architecture and a new recovery dashboard. Existing manual-review policy can avoid these only when the above operational proof exists. Remaining pre-return/commit-response ambiguity and postcommit event effects stay explicit. Production NO-GO remains; do not reopen fixed issues or treat every hypothetical failure as a new architecture project.

## Reply and required ticket writes are atomic locally — 2026-09-23

Scoped TicketsService.addMessage change only: insert reply + applicable customer reopen/first-response timestamp updates share one interactive Prisma transaction. Authorization and sanitization stay before it; recipient lookup and event dispatch stay after commit. Same API signature, no env/dependency/schema/migration change, no automatic retries.

- Real PostgreSQL constraint injections first failed twice as expected: rejected reopen/SLA update left one committed reply. After correction, both reject cases leave zero reply rows and unchanged ticket state/timestamp, with no message-added event.
- Guarded reopen accepts the same nondeleted owner's PENDING_CUSTOMER or OPEN ticket. Independent review caught initial too-narrow predicate rejecting the second legitimate simultaneous customer reply; corrected before final checkpoint. Deterministic synchronized authorized reads + two real transactions prove both distinct replies persist and state is OPEN.
- Stale pending snapshot followed by CLOSED update causes rollback, not reopen. First-response write uses null/deletedAt predicates so an established timestamp is not overwritten; later sequential staff reply preserves it.
- Full local domain suite8/8 passed on a refreshed, empty, internal-network tmpfs PG17 fixture with real Prisma7.4.2/current schema. Existing75ticket/internal-note/security tests and125intake tests passed. Changed-file TypeScript diagnostics0 after correcting self-referential test-mock inference. These are not whole-project coverage, HTTP/E2E, PrismaService lifecycle/extension or exact Node20/Linux artifact acceptance.
- Existing source callsite impact review: web/API tickets.controller, IMAP EmailInboundService, OmniChannel webhook. GitNexus CLI/tool and Graphify report were unavailable in this candidate checkout; no automated graph-completeness claim.
- Code reviewer re-reviewed concurrent fix and test drainage/cleanup, approved within scope, no additional security issue. Additional independent planner security-review invocation hit agent thread limit. No dedicated full security audit claimed.
- Test commitaf6e17bd; product commit3acd9cb7. Owned synthetic container/network removed, temporary files cleaned and bounded relay expired (no listener remaining). No live/customer access, remote push or deploy.

Limits deliberately retained: no general closure/ownership linearization for every status; authorization still uses a pre-transaction read. Recipient-query or direct synchronous event failure after commit can still produce an ambiguous returned outcome. New-ticket + initial-message atomicity, object-store writes, crash/ambiguous-commit recovery, source retrieval and operator reconciliation are NOT fixed by this slice. Reverting this source patch would restore the demonstrated partial-write risk; no data rollback or unsafe historical image is proposed.

Next: consolidate the remaining intake/recovery gates against the accepted manual-review policy and test the actual post-commit recipient-query boundary before choosing any additional code. Do not expand into a generic outbox/automatic replay without demonstrated need. Production remains NO-GO pending the separately recorded operational and release gates.

## Known domain correlation retained on hold — 2026-09-23

Bounded local correction, not full partial-commit recovery. IMAP and webhook now carry returned ticket/message identities into the existing owner-fenced hold update. An existing thread ID is retained only after sender eligibility and owner checks. Unknown identities remain absent; no lookup by subject/body, automatic replay, new acknowledgment, schema, dependency or TicketsService change.

- Corrected interpretation of the previous injected event failure: installed Nest event-emitter3.0.1 wraps @OnEvent callbacks in async try/catch with default suppressErrors=true; discovered ticket.created/message_added listeners use that wrapper. Direct EventEmitter.once throwing in the test is an adversarial boundary, not evidence deployed listeners propagate those errors.
- Six intended assertions first failed before implementation; after the patch and added authorization/attachment checks, nine focused suites passed125/125 under an empty environment/network-denied sandbox. Includes shared claims, old-owner fencing, sender eligibility, IMAP acknowledgment, webhook, review API and signature guards.
- Actual disposable PostgreSQL integration4/4 passed. Added a real temporary CHECK constraint rejecting the initial message after ticket creation: held row retained ticketId, message remained absent, retry did not create another ticket/message. Constraint removed in finally. Existing direct-event case still demonstrates unknown new-ticket ID before service return; reply case now retains authorized thread ID but deliberately does not invent unknown message ID.
- Changed-file TypeScript diagnostics0. Focused three-product-file coverage: statements86.06%, lines88.50%, functions92%, branches75.69%; this is not whole-backend coverage or full project typecheck.
- Independent code and security reviews found no source blocker; reviewer identified the now-obsolete real-PG thread-null assertion, corrected before the4/4 run. Dedicated additional security-agent start was unavailable due thread limit; existing independent planner performed source security review. No claim of independently rerun tests.
- GitNexus tool/CLI and Graphify report unavailable in this checkout; source callsite/diff impact review substituted. Scope is holdInbound plus its two intake callers; no ticket lifecycle/event listener changes.
- Local test commit1ae587eb; local product commitdb3c7529. Owned synthetic tmpfs PostgreSQL container/network removed, loopback relay terminated, and temporary attachment directory cleaned. Only generated test state discarded. No production access, customer data, push or deploy.

Remaining limitations: failure before service return, ambiguous DB commit response, process crash, failed hold persistence, or owner-CAS replacement may still leave incomplete/unknown correlation. This patch neither repairs missing bytes/messages nor proves retained-source retrieval or operator reconciliation. No blanket swallowing of event/database failures.

Next bounded step: reproduce an actual post-insert ticket-status update failure in addMessage using isolated PostgreSQL, then assess an atomic message/status write correction without changing notification semantics or claiming an outbox. Preserve the remaining mail TLS/renewal, webhook source custody, independent-writer pause, backup restoration and exact Node20/Linux artifact gates. Production remains NO-GO.

## Actual domain persistence checkpoint — 2026-09-23

New opt-in `inbound-domain-persistence.integration.spec.ts`: real Prisma7.4.2/PostgreSQL17.10, TicketsService, TicketAccessService, PiiMaskingService and LOCAL StorageService; no application bootstrap or production event listeners. Three tests passed twice, including a fresh-fixture run after independent review strengthened explicit failure-point assertions.

- Normal parsed-email intake persisted one ticket, one message, one attachment row and byte-identical file. Same Message-ID replay added nothing.
- A deliberately throwing synchronous ticket.created listener left the ticket committed, initial message absent, and inbound claim held with PROCESSING_FAILED / null ticketId. Replay stayed held and did not create a second ticket.
- A deliberately throwing synchronous ticket.message_added listener left the reply committed and PENDING_CUSTOMER ticket reopened to OPEN, but attachment absent; claim again held with no linked ticketId. Replay did not duplicate the reply.
- These passing characterization tests expose partial persistence, NOT an acceptable recovery outcome or a product fix. They do not prove a production Nest listener throws through its wrapper, or that any historical customer data was lost. Plain PrismaClient does not reproduce PrismaService lifecycle/extensions. No CRM eligibility, actual IMAP acknowledgement, S3, process-crash durability, migration-history or whole-application acceptance is claimed.
- Synthetic dedicated DB domain_test, internal Docker network, no published ports, 512MiB RAM and tmpfs data. Bounded loopback15432 relay; test runner empty environment and network sandbox allowing only localhost15432. Fresh temporary LOCAL storage; no credentials/customer data from production.
- Current schema and existing sibling generated-client schema match SHA256 95c56846bcbec9ecc79449448e6e15ae39c3790092216d57fe63351cd0bc4db3. Local Prisma CLI diff returned empty output despite exit0; rejected as evidence. Explicit-datasource local schema-engine JSON-RPC generated58,813bytes of SQL, applied with psql ON_ERROR_STOP plus existing ticket-number sequence migration. This installs the current schema snapshot; it is not migration-history compatibility proof. Final reviewed run used an empty recreated synthetic fixture with identical dumped schema.
- Existing six storage/inbound suites71/71 passed. New-file TypeScript diagnostics0 before the review-only assertion/cleanup refinements; no full backend typecheck or coverage claim. Independent code review found no blocking issue in this narrow characterization scope.
- No product code, schema, dependency, live access/change, push or deploy.
- Test checkpoint:184996b6. Owned synthetic tmpfs container/network removed and bounded loopback relay terminated after verification; temporary attachment directory cleaned by test teardown. Only disposable synthetic records/files discarded, no customer or unrelated local data removed.

Next smallest release-blocking task: design and regression-test a bounded correction for post-write failure handling, preserving correlation to committed ticket/message and preventing blind replay. First distinguish actual production listener behavior from injected faults; do not hide failed critical work with a blanket catch or redesign unrelated services. Existing TLS/renewal, recoverable webhook source, writer-pause, backup and exact Linux artifact gates remain open. Production NO-GO remains.

## Storage collision fix and domain-write inspection — 2026-09-23

During preparation of actual ticket/message/storage tests, found a release-relevant byte-integrity issue: StorageService built object keys from folder + millisecond timestamp + sanitized name. Two same-name uploads in one folder at the same timestamp successfully targeted the same local file. A new real-disk regression first failed on identical returned keys. This is a reproducible overwrite risk, not proof that historical customer files were overwritten.

- Minimal local fix adds crypto.randomUUID to new keys; retains timestamp/name shape and opaque-key reads. Existing stored keys/data are not renamed. Final filename component is bounded to255UTF-8bytes, preserving code points and ordinary extensions up to32bytes; exceptionally longer extensions are truncated as part of the name. Original attachment display filename remains separate in existing metadata.
- New actual disk tests verify two different byte sequences remain independently retrievable at the same clock tick and long ASCII/multibyte names still work. S3 command-mock test verifies separate keys/buffers; this is not live S3/R2 upload durability proof. UUIDs remove the practical timestamp collision, not a mathematical no-collision guarantee.
- Six focused suites/71tests passed (storage upload/read/authorization plus inbound attachment/reliability). First combined run failed only because the network-denied sandbox blocked the existing HTTP test's loopback listener; final run permits loopback only, no external networking. Test data lives in mkdtemp-owned synthetic directories and is removed by teardown. Independent code/security review caught initial long-filename regression; fixed and re-reviewed with no remaining actionable issue.
- Shared upload callers include manual ticket attachments, inbound mail, branding and knowledge-pool/crawler uploads. Direct callpath/read-contract inspection found opaque key consumers; folder layout stays unchanged, including public brand/logos single-file route. GitNexus impact/detect tools were unavailable; no index rebuild/tool installation performed.
- Independent source inspection: TicketsService.create inserts ticket before synchronous event emission; inbound creates its first message afterward. addMessage inserts message before status updates/recipient queries/event emission. Errors at these later points can leave partial committed domain state while inbound is held. Synchronous throwing listeners are a valid injectable boundary test, not evidence that ordinary Nest listeners propagate errors. No realDB domain-failure reproduction in this batch.
- Do not reuse existing broad db-utils cleanup/ambient PrismaService factories for this proof. Next build a disposable schema-compatible application fixture using explicit DB identity and scoped services; test post-insert failure without automatic replay and inspect ticket/message/attachment linkage. The previous claim-only table cannot establish application-schema parity.

This batch fixes one demonstrated local storage risk; the intended combined actual domain-persistence test remains OPEN. No production/customer data access, migration, push or deploy; no historical byte recovery claim.

Local checkpoints: tests2b395311, product17780dff. Focused changed-file TypeScript diagnostics0 with existing Jest/Express/Multer declarations explicitly resolved; not a full backend build. Final repeated test run71/71. No new dependency or environment variable; no schema migration. Existing keys are compatible, but older product code retains the collision risk and is not recommended as a safety rollback.

## Real PostgreSQL claim checkpoint — 2026-09-23

- Added opt-in `inbound-claim-postgres.integration.spec.ts`, invoking actual claim/complete/hold helpers through Prisma7.4.2/PrismaPg and PostgreSQL17.10. No delegate mocks. Tests cover one owner with six contending inserts, terminal compare-and-set competition, conflicting payload fencing with retained attachment-failure evidence, and pending ownership surviving graceful client replacement.
- First race deliberately keeps the owner's insert uncommitted, observes an actual PostgreSQL lock wait from competing claims, then releases the transaction. Exactly one row persists; competitors return held and completed duplicate returns done. Terminal update test accepts either winner and checks only one successful update plus stale-owner rejection; it does not force a particular scheduling order.
- Final reviewed run4/4 passed; wrapper requires exactly4passed/0pending. Existing isolated claim/reliability/attachment regressions46/46 passed. Focused new-file TypeScript diagnostics0 before the final settlement-only correction. Independent code/security review found a failure-path async-drain issue; final implementation immediately settles owner, aggregate and every competitor in finally, preserving the original failure. No product helper changes.
- Only the existing migration's `inbound_email_logs` CREATE TABLE and unique-index statements were installed in an empty dedicated database. The borrowed existing generated client's InboundEmailLog schema block and current source schema block have identical SHA256 `d6a7caaf720fdd5743d03ecd8192b3b27a6d81ebd30aea33539194b55b3182ae`. This is focused table parity, NOT a full application migration/DB parity proof. No real PrismaService lifecycle, ticket, storage, CRM or customer data used.
- Local image ID `sha256:7ae6051efd0e60444282c27c7e141af07f322ce033300e727a49c3dd11075e38`, native aarch64 PG17.10. Dedicated internal Docker network, no published ports,384MiB memory cap, tmpfs data192MiB. Fixed synthetic `claim_test` database/user/password; no DATABASE_URL input. Node24/macOS runner uses loopback-only sandbox and a180second raw TCP relay through docker exec to this one container. Test opt-in `MAIL_CLAIM_POSTGRES=synthetic-local-only`; loopback15432 only. No external network or production access.
- Each invocation requires an empty dedicated table. Only owned synthetic rows in this disposable DB were truncated between review iterations; never use this on an existing database. Full disposable-container recreation is the recommended repeat-run setup. Tests retain rows until fixture teardown, so a reused nonempty table fails preflight.
- Limits: graceful client replacement is not a process crash or DB restart; tmpfs is explicitly not durability/backup proof. No actual ticket/message transaction, attachment object persistence, ambiguous post-commit failure recovery or production Node20/amd64 artifact acceptance was established. No absolute no-loss or production-ready claim.
- Local test checkpoint:9b738cb9. Cleanup verified: dedicated container and internal network removed, owned relay terminated. Its five synthetic rows/tmpfs data were intentionally discarded and are not recoverable; no customer or unrelated local data was involved.

Next: test actual ticket/message/attachment persistence together in disposable application state, including failure after a domain write commits. Preserve source originals and manual holds; never automatically replay an ambiguous owner. Broader source-recovery/TLS renewal/maintenance/backup gates remain NO-GO.

## Candidate mail-client intake checkpoint — 2026-09-23

- Added opt-in `apps/backend/src/email/mail-dms-intake.integration.spec.ts`: actual SmtpProvider, EmailInboundService, shared claim helper, nodemailer, imap-simple and mailparser against the pinned amd64 DMS server. Prisma, TicketsService, storage and PII service are explicit synthetic doubles. No full application bootstrap or real database.
- Clean-mailbox final run:3/3 passed. Actual provider health/send and IMAP verification succeeded; MIME attachment bytes reached the storage double unchanged; a completed message manually reset to UNSEEN was acknowledged again without another ticket/upload call. Injected ticket-write failure retained the original UNSEEN mail and a hold marker, with no automatic second ticket attempt on re-poll. No source message was deleted or expunged by the suite.
- Existing focused claim/reliability/attachment tests:3suites/46tests passed with networking denied. Focused TypeScript diagnostics for the new file:0 after resolving existing pnpm Jest type declarations explicitly; this is not a full backend typecheck or whole-project coverage claim.
- Opt-in is `MAIL_DMS_REHEARSAL=synthetic-local-only`; fixed loopback endpoints1587/19993 and fixed synthetic-only account/password. Test startup refuses a nonempty mailbox. Node starts with `NODE_EXTRA_CA_CERTS` pointing to the generated fixture CA, no TLS bypass. Run with an empty environment and loopback-only sandbox. Real credentials/env files are never loaded. The test is skipped by default and must not be counted as passed when skipped.
- Server setup: same public pinned amd64 image and temporary emulator-only Dovecot1GiB virtual limit, container768MiB RAM/2CPU, internal network, synthetic account, read-only fixture leaf cert/key. Initial Docker port publishing on the internal network did not expose a listener, and the first run correctly failed ECONNREFUSED. Final fresh container has no published ports. A bounded180second host-loopback relay forwards raw encrypted bytes via `docker exec` to that single owned container; it does not terminate TLS or give the server external network access. Host Node24/macOS remains different from the production Node20/Linux artifact.
- First successful suite run was followed by per-test harness isolation and a second fresh-container3/3 run. Independent review then caught shared unread-mail contamination across reordered tests: corrected with per-test UNSEEN-empty checks and cleanup of only tracked synthetic Message-IDs, after source-retention assertions. Cleanup marks those test messages Seen, never deletes/expunges; this is fixture housekeeping, not application failure handling. Provider smoke also searches only its returned Message-ID. Re-review found no remaining blocker in the stated test scope.
- The execution wrapper enforces exactly3passed/0pending as well as Jest success. The relay's180second self-expiry caused a later preflight ECONNREFUSED; restarted only the local relay, not production. Failed/skipped/preflight runs are not acceptance evidence.
- Tests exercise the application intake boundary, NOT actual ticket/database commits, object-store durability, CRM eligibility rules, concurrent PostgreSQL claim behavior or disaster recovery. A mocked unique-conflict implementation is not a PostgreSQL uniqueness/concurrency proof.
- No product source, dependency, schema, live access/change, push or deploy. Dedicated reviewer creation failed due thread limit; existing test agent independently reviewed and re-reviewed the test. No broader security certification claimed.
- Reviewed final version passed3/3 on a fresh container; new-file TypeScript diagnostics remained0. Test checkpoint:6f9bb983. Owned synthetic container/network removed and loopback relay terminated afterward; no customer or unrelated local data removed. Fixture CA/keys are synthetic and remain temporary local files, never committed.

Next release-blocking proof: use a disposable schema-matched PostgreSQL database for claim/concurrency/failure behavior and verify actual ticket/attachment persistence through the scoped application services. Preserve the unresolved source-recovery, live TLS/renewal, writer-pause and exact-artifact gates; production remains NO-GO.

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
