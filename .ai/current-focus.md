# Current Focus

## Güncel karar — 2026-09-27 daraltılmış yayın çizelgesi

Sabit bir saatlik kesinti sınırı yok: kullanıcı ancak provalar geçtiğinde duruma göre yayın kararı verecek. `.ai/issues/2026-09-23-mail-tls-transition-plan.md` başındaki değişiklik çizelgesi mevcut DB restore/migration ve R2 yedeği kanıtını birleştirir; canlı eylem yetkisi değildir. Bağımsız güvenlik incelemesiyle kesin adayın güncel izole DB kopyasında yeniden migration provası ve dış MX/port25→mailbox→ticket kabulü zorunlu kapılar olarak eklendi. Kesin `87372fe4` Linux/amd64 backend imajı aynı güncel yerel Trivy DB ile ağsız tarandı: **0 Critical / 3 High / 14 Medium / 3 Low**; üç High için koşullu etki/erişilebilirlik kararı yeniden gözden geçirilmeli. En yakın yerel iş: güvenli, idempotent mail ayarı geçiş aracı ve eski backend yazıcı durdurma/reconciliation provası; ardından kesin imajın mail testi. `apps/frontend/next-env.d.ts` kullanıcı değişikliği korunacak. **Production NO-GO; push/deploy/restart/settings save yok.**

## Güncel kapı — 2026-09-27 mail TLS ve kontrollü kesme

Geçici özel R2 yedeği 477/477 nesne için oluşturuldu; etkin 109 ekin kaynak/yedek byte eşitliği geçti. Güncel canlı salt-okunur envanterde backend/frontend imajları sabit, e-posta/Postfix kuyrukları anlık boş fakat IMAP 143/TLS kapalı, Dovecot SSL kapalı ve Postfix TLS kapalı. Aday backend bu ayarları reddediyor; doğrudan deploy mail-to-ticket ve gönderimi kırabilir. Bilgi senkronizasyonunda 500 başarısız iş var; hiçbir kuyruk değiştirilmeyecek. Yerel sentetik TLS testleri bugün 23/23 geçti, fakat canlı sunucu/sertifika ve kesin bakım kesmesi kanıtı değildir. En küçük kalan işlem, `.ai/issues/2026-09-23-mail-tls-transition-plan.md` içindeki 27 Eylül kontrollü değişiklik kapısını kapatmak; sonra ifşa edilmemiş parola ile korunan ön DB/mail yedeği, doğrulanmış yazıcı sınırı, son yedek/R2 delta/parite ve ayrı `deploy et` onayı. Bu genel devam onayı canlı değişiklik yetkisi vermez. Kullanıcının `apps/frontend/next-env.d.ts` WIP dosyası korunacak.

## Tarihsel kontrol noktası — 2026-09-27 PostgreSQL restore geçti, R2 henüz açıktı

Bu ve aşağıdaki önceki kontrol noktalarının “sıradaki adım” cümleleri yazıldıkları ana aittir; güncel durum üstteki mail TLS/yayın kapısı ve 27 Eylül canlı envanterindedir.

R2 gövde okunabilirliği için operatör aracı `scripts/release-r2-body-canary.cjs` (tooling commit `e10d419e`) test ve bağımsız kod/güvenlik incelemesinden sonra dar kullanıcı onayıyla bir kez çalıştırıldı. Canlı DB'den yalnız etkin R2 ayarları ve en fazla üç aday ek için `SELECT`; sabit R2 bucket'ında LIST/HEAD ve koşullu/sınırlı üç GET yapıldı. Sonuç PASS: 477 nesne listelendi; üç etkin küçük ekin toplam 385445 baytı bellekte SHA-256 ile işlendi. Ham anahtar, içerik, hash veya credential kaydedilmedi/çıktılanmadı. Backend çalışmaya devam ediyor, site giriş sayfası HTTP 200. **Bu üç dosyalık canary tam R2 yedeği veya restore kanıtı değildir; production NO-GO sürüyor.** Sıradaki farklı canlı işlem (ayrı hedefe kopya/geri okuma, deploy vb.) ayrıca kapsamlandırılıp onaylanmalı; 5 failed-upload marker ve tüm 477 nesnenin bağımlılık kapsamı açık.

Ayrı dar onayla canlı PG17 `aluplan_support` veritabanının custom dump'ı doğrudan AES-256 şifreli ve Git dışı Mac imajına alındı. 144758018 bayt / SHA-256 `213523ac7a760d1b89606509e8b286ba9d1fa108826cb483a432bab72c48a8bc`; katalog ve ağsız/portsuz PG17 izole tam restore geçti. 62 tablo ve 182 bilet / 578 mesaj / 114 ek kaydı / 1289 kullanıcı anlık canlı sayımlarıyla eşleşti. İmaj ayrıldı, Docker Desktop yerel dosya tutamaçlarını bırakmak için düzgün durdurulup tekrar başlatıldı. Canlı DB yazısı, restart, migration, R2 değişikliği, push veya deploy yok. Kanıt `.ai/issues/2026-09-27-live-readonly-release-inventory.md`, yerel docs commit `7d75d75e`.

Bu genel `devam edelim` yeni canlı erişim/yazma onayı değildir. Yerel kod incelemesinde `scripts/a14b/r2-adapter.mjs` yalnız `ListObjectsV2`/`HeadObject` destekliyor; önceki 109 R2 anahtar/boyut eşleşmesi object body restore kanıtı değil. `apps/backend/src/common/services/storage.service.ts` `DeleteObject` kullandığı için canlı uygulama bucket'ına retention lock koymak akışı bozabilir; ayrı backup hedefi daha güvenli adaydır. Beş tarihsel `FAILED_STORAGE_UPLOAD_...` kaydı ve 62,9 GB/477 nesnenin uygulama-bağımlı kapsamı açık. Sonraki dar faz: mevcut metadata ve DB referanslarından tam kopya kapsamı/maliyetini yerelde sabitle; sonra ayrı onayla sınırlandırılmış body-read canary ve ayrı hedefe kopya/geri-okuma kanıtı. PostgreSQL snapshot'ı tek başına production GO vermez; eski snapshot'ı yeni müşteri yazılarının üstüne restore etmek yasaktır.

## Canlı salt-okunur veri/depolama envanteri — 2026-09-27

Kullanıcının dar onayıyla canlı SSH/Docker metadata, PostgreSQL `SELECT` ve R2 `ListObjectsV2` incelendi; hiçbir canlı yazma, backup, restart, migration, push veya deploy yapılmadı. Uygulama DB'sinde anlık 182 bilet / 578 mesaj / 114 ek / 1289 kullanıcı var. R2'de 477 nesne (~62,9 GB) listelendi. Etkin 114 ek kaydının 109 gerçek anahtarı ve boyutu eşleşiyor; 5 kayıt tarihsel `FAILED_STORAGE_UPLOAD_...` işareti ve bunların dosya baytları kanıtlanmadı. Tüm etkin ek paritesi başarısız; işaretsiz R2 anahtar/boyut paritesi başarılı. Bu listeleme byte bütünlüğü veya restore kanıtı değildir. Ayrıntı: `.ai/issues/2026-09-27-live-readonly-release-inventory.md`.

Production **NO-GO**: taze DB backup/restore, etkin R2 dosyalarının geri alınabilirliği, 5 marker istisnasının mahremiyetli kararı, kesin rollback ve ayrı açık deploy onayı henüz yok. Kullanıcının `apps/frontend/next-env.d.ts` değişikliği korunmalı.

Sonraki genel `devam edelim` production erişimi sayılmadı. Yerel backup ön kontrolünde `scripts/backup-db.sh` güvenlik testleri 44/44 geçti; mevcut dış S3 backup hedefi canlıda doğrulanmadı. `fdesetup status` sonucu **FileVault is Off** olduğundan ham canlı DB'yi yalnız dosya izinlerine güvenerek Mac'e yazmak güvenli değil. Önce şifreli hedef/anahtar saklama yöntemi ve dar üretim backup onayı gerekli; sonra tek yönlü PG17 custom dump, hash/katalog ve izole restore doğrulaması yapılabilir. R2/Redis/mail/deploy ayrı kalır.

Kullanıcının Cloudflare ekranında `aluplan-support-desk-db-backups-dev` yalnız 1 küçük DEV test nesnesi gösteriyor; doğrulanmış production DB backup'ı değil. Uygulama bucket'ı 477 nesne/62,9 GB ile canlı listelemeyi destekliyor. Bucket/token değişikliği yapılmadı.

## Combined candidate backend/frozen frontend browser acceptance — 2026-09-27

Private local mode `--run-local-browser-4157` paired backend Git `4157dbee5905df36f283ed420575b0aaa4ab8bfa` / immutable Linux-amd64 image `sha256:45a47db7dfb713e01ebc26b8f96b0cccb6ff2dfba025a9fdcea48bddd4e303b6` with the unchanged frontend Git `c602031d9a2c747b504d6c18a1f0560c1f6125cb` / image `sha256:3b6579da7b0e298fe0de0bac5f4da9fb5796cb13c43dbe289fc9189445873d2c`. Git diff between those commits for `apps/frontend`, browser probe and auth fixture was empty. The private runner pins source archive, image IDs and OCI revision labels; adapted browser source hash `0cf8c8855a393ecf6192b4cf751266c7e84e6fa4c0f1169bca8508b862eb6079` matches the previous accepted browser run and fixture hash `c70f523c598ab70b6e2e2bd438d1e48fbe65cd3f9438790c9005df99f6ff9e11` matches committed source. Independent code/security reviews found no mode-specific local rehearsal blocker. Image labels and source archive hash are not a signed reproducible-build attestation.

Fresh disposable sanitized Sept17-derived DB clone, empty Redis, network-internal containers, no published ports and an allowlisted two-host local Chromium proxy were used. `combined-browser-0b57b342b6e2/result.json` records PASS, `productionGo:false`: actual browser UI login, secure cookies, refresh, CSRF denial/routing, expired/valid/replayed reset, old credential/token revocation and new-password login passed; zero unexpected requests/proxy errors. Durable synthetic fixture verification passed with one session-version increment, consumed reset, retained CUSTOMER authority, zero synthetic mail. Local cleanup receipt says clean, and exact-label containers/network/volumes were independently absent. Raw private probe logs must not be published.

Scope limit: this is auth browser compatibility, **not** full ticket/dashboard UI, frontend automatic refresh, real mail delivery, public TLS, fresh production state, historical attachment bytes, all-writer drain or complete host-gateway isolation. No live access/change, push or deploy. Next release-critical action requires separately scoped approval for production-window read-only current-data/storage inventory and verified fresh backup/recovery evidence; no production GO yet.

## Local forward re-entry proven for 4157dbee candidate — 2026-09-27

The source-pinned Linux/amd64 backend image `sha256:45a47db7dfb713e01ebc26b8f96b0cccb6ff2dfba025a9fdcea48bddd4e303b6` was built from Git commit `4157dbee5905df36f283ed420575b0aaa4ab8bfa` and archive SHA-256 `ec7cf665c8026ba78f7fea294c1ba3ee5779e577fdcdaa524c9677c050a9391d`. This includes the PID1 shutdown exit fix and non-destructive announcement-template seeding. Local, disposable, sanitized Sept17-derived PostgreSQL clone and persistent synthetic upload volume only; no fresh live snapshot or production operation. Private evidence: `.private-data/release-evidence/latest-reentry-100933a1ef5b` (sensitive; do not publish logs).

The run passed protected preboot parity, two 56-check synthetic customer/staff probes, clean backend stop with exit code 0, same-volume replacement, full DB fingerprint and migration-ledger equality before/after replacement, preservation of two first-round synthetic attachment references and byte hashes, and new ticket/attachment writes after replacement. `result.json` says PASS and `productionGo:false`; exact-label containers/network/volumes were independently absent after owned cleanup. Aggregate final clone counts 184 tickets / 573 messages / 118 attachments / 1293 users include synthetic test writes and **are not current live counts**. Docker internal networking blocked tested external routes, but comprehensive host-gateway isolation was not proved. No live credentials/providers were supplied; do not claim that production access was technically impossible.

This closes the earlier local re-entry fingerprint drift: startup template renaming/deletion had modified existing rows, so the candidate now inserts missing defaults only. Historical attachment bytes were not present/proved, all real writer drain was not proved, and production backup/restore/current config remain separately approved release-window gates. Do not publish, push, or deploy from general continuation. No unconditional production GO.

Latest-image offline Trivy 0.72 scan exited 0: `0 Critical / 3 High / 14 Medium / 3 Low`, exact same 20 advisory tuples as the prior c602031d report; no new or removed finding. The same pinned scanner image `sha256:cffe3f5161a47a6823fbd23d985795b3ed72a4c806da4c4df16266c02accdd6f` and DB SHA-256 `1735680d236cc6e7971501084395025a83ba5cd93624b052cdb2d573fc0c6b59` were used network-none, no Docker socket. OCI index links Docker image ID `45a47d...` to amd64 manifest and Trivy-reported config digest `7e76d...`; archive SHA-256 `3bd22865b33e5d84c8257db800271bdb34a3189a9c5294266a1c13e7037bf28f`, report SHA-256 `1e91645bf0cab0672c7d115657206593b878bd6478dd922e7051266a9a7138ac`. Private files in sibling `scan-unified-4157dbee/{input,output}`. The three Highs remain two OTel `CVE-2026-44902` package entries and one html-minifier `CVE-2022-37620`; previous conditional reachability disposition is not a blanket waiver. Scanner DB is a point-in-time snapshot. Next mandatory gate is separately approved production-window read-only inventory and fresh backup/attachment-byte evidence, not immediate deploy.

## Frozen-frontend isolated browser auth acceptance — 2026-09-27

Against the same committed c602031d images (backend sha256:aa150a9c660cba09c4db6476b21f7da552ee59c2addd9c89acb82ab492691471; frontend sha256:3b6579da7b0e298fe0de0bac5f4da9fb5796cb13c43dbe289fc9189445873d2c), a private operator-only adapter routed the frontend's compiled https://api.allplan.net.tr/api/v1 to an isolated backend through a browser-local, two-name HTTPS proxy. The frozen images/product source were unchanged. Fresh Sept17-derived sanitized PG clone, empty Redis, synthetic credentials, no published ports or host bind mounts, exact image/label checks; no production access, push or deploy.

Two final runs `.private-data/release-evidence/final-browser-{0f30642921bc,c5f2eb54636c}` passed actual Chromium UI login, secure/shared-domain cookie attributes, refresh, expired/valid/replayed reset, old access/refresh/password revocation and new-password login. Fixture verification passed: one session-version increment, consumed reset token, retained CUSTOMER authority, zero synthetic mail. Each fresh run's counts 180/563/114/1285 before and 180/563/114/1286 after reflect one synthetic user only in its disposable clone; cleanup.json clean and exact labelled resources independently absent. This does not prove forgot-password issuance/mail delivery, dashboard or frontend automatic refresh, historical attachment bytes, native-VPS timing, or public TLS.

The negative CSRF request reached backend 403 but its response lacked CORS headers, so the real cross-origin browser saw an opaque fetch failure; the same request with the matching CSRF header reached routing 404 with CORS. The adapted harness verifies both the backend status and the browser-visible result. Prior disposable attempt `final-browser-b0dba5ffec33` passed all listed auth checks but ended with one unclassified unexpected event; the next two runs passed with zero. Treat that isolated event as a repeatability caveat, not a proved product defect. Earlier diagnostic failures and their cleanups remain in private evidence. External TCP returned ENETUNREACH and DNS was blocked for jobs/backend/frontend/browser. Docker VM gateway returned ECONNREFUSED on the host-loopback canary port: `hostReachability:unproven`, never claim host isolation. Local security review approved this bounded interpretation.

Remaining mandatory release gates: historical attachment-byte/drain/forward-recovery proof and an explicitly approved production-window fresh data/backup/rollback check. Production GO remains false. No optional feature/dependency expansion.

## Final-image closed-reopen and reset API acceptance passed — 2026-09-27

Same frozen c602031d backend aa150a9c660cba09c4db6476b21f7da552ee59c2addd9c89acb82ab492691471; no application, schema, image or production changes. Added operator-only scripts/rehearsal-ticket-reopen.cjs and rehearsal-auth-api.cjs with separate regression files. Existing customer probe and auth fixture reused unchanged via private runner source composition; generated payloads compile-checked without execution. Independent code/security reviews approved the scoped disposable execution. Tests-first helpers: final aggregate32/32, new helper coverage100% lines/branches and95.24% functions (not project coverage). Local commits58fbb928/b18fe6fe and98a15bd2/5cbde6bd; secret scans clean, next-env WIP preserved.

First disposable run final-customer-2fff899d6718 stopped at closed-reopen after58 checks; cleanup clean. Test incorrectly expected anonymous PATCH without CSRF to reach JWT guard. main.ts confirms CSRF middleware rejects it earlier. Regression reproduced403 versus401; corrected probe sends only matching XSRF cookie/header without authentication cookies, retains expected401. Added internal reopen-note visibility negative tests. No product fix or weaker assertion was needed; first failure receipt remains private.

Fresh retry final-customer-3affbdb17688 PASS:74 customer/staff HTTP checks including18 explicit closed-reopen checks, then12 password-reset HTTP checks. Both SUPPORT_AGENT/ADMIN perform OPEN→RESOLVED→CLOSED→OPEN; customer/other-customer/anonymous/CSRF-denied attempts preserve closed state, existing messages/attachment records remain, closedAt clears, prior resolution/SLA history remains, attributed internal audit appears and stays hidden from customer. Reset uses in-memory synthetic fixture-signed token: expired token401, valid reset200, previously working rotated access401/refresh403 after reset, replay401, old password401, new login/me200. Fixture verification proves sessionVersion increment once, JTI consumed, new hash matches/old fails, CUSTOMER authority retained and no synthetic queued/sent mail. This does NOT prove forgot-password issuance, actual mail delivery, browser cookie behavior, or historical attachment bytes.

Same Sept17-derived sanitized source, fresh owned PG clone and empty Redis; preboot credential-zero and protected parity passed. Internal network/no published ports/no host bind mounts; bounded external TCP/DNS and host-canary checks passed. Host-canary evidence is address/port-specific, NOT comprehensive host isolation. Exit0 plus cleanup.json clean and independently absent exact run-label containers/network/volume confirmed. Only disposable counts became182tickets/570messages/116attachments/1290users; original dump retained. Evidence .private-data/release-evidence/final-customer-3affbdb17688/{result.json,auth-result.json,cleanup.json,preboot-counts.json,postprobe-counts.json}; auth payload SHA1e827bd6ad18ddf4d415eb94b08902f8b6507c3eacaf5bc6b09d57e2cee037fb. No live access/provider integration request/push/restart/deploy. Aluplan guidance enforced one-way isolated data use. productionGo:false.

Next mandatory gate: safely routed actual frontend/browser acceptance against these frozen artifacts, never local browser against baked live API; retain outstanding historical-byte/drain/forward-recovery and separately approved production-window evidence. No optional feature/dependency work.

## Final-image isolated customer/staff acceptance passed — 2026-09-27

Executed unchanged extended scripts/rehearsal-customer-probe.cjs against exact c602031d backend aa150a9c660cba09c4db6476b21f7da552ee59c2addd9c89acb82ab492691471 after normal runtime startup. Sibling private orchestration helper run-customer-c602031d.mjs adapted the existing local runner's image/baseline bindings and replaced browser work with the existing customer probe. Independent security and code reviews found no blocker; node syntax and sanitizer/customer/auth-fixture pure tests17/17 passed. Product source unchanged.

Fresh disposable PG clone used the same Sept17-derived sanitized dump, NOT fresh production data. Preboot credential assertions were zero before/after migrations; protected business/RAG/object-reference/sequence/schema fingerprints matched final A13 and canonical RBAC passed. Empty ephemeral Redis, internal Docker network, no published ports or host bind mounts, nonroot app, dropped capabilities, fresh synthetic secrets. External TCP and host canary returned ENETUNREACH before app boot and inside the running app; external DNS denied. These bounded probes are not universal network/host security certification. Migration/fingerprint jobs ran on the internal network before the explicit egress probe.

Actual extended API probe PASS:56 HTTP checks, two synthetic customers/tickets, customer isolation, own replies, CSRF denial, customer/staff/admin authorization, internal-note visibility, status transitions, bulk/merge, synthetic PNG upload/download byte parity and protected access/headers. No queued/sent mail rows for synthetic recipients. Four logins took10043–10193ms under local amd64 emulation; do not claim production latency. This probe does NOT exercise password reset or explicitly CLOSED→OPEN, nor frontend browser journeys or historical attachment bytes.

Private evidence .private-data/release-evidence/final-customer-e9237306fff9/{result.json,cleanup.json,preboot-counts.json,postprobe-counts.json,egress-preboot.json,backend-egress.json,customer-probe.log}. Exit0 AND cleanup status clean verified, then exact label independently absent from containers/networks/volumes. Counts180/563/114/1285 became182/568/116/1289 only in the disposable test DB due synthetic fixtures; entire owned clone/Redis/app removed, original dump retained. productionGo:false. No live access, provider integration request, push, restart or deploy; unrelated next-env preserved. Aluplan guidance kept the copied data isolated and evidence claims artifact-specific.

Next: remaining reset/closed-reopen and safely routed frontend acceptance, then required drain/historical-byte/forward-recovery and separately approved production-window evidence. Do not expand into optional features or dependency upgrades, and do not run the production-configured frontend against live API for local tests.

## Final-image isolated restore and migration proof passed — 2026-09-27

Executed existing scripts/release-a13-restore-drill.sh unchanged against exact backend aa150a9c660cba09c4db6476b21f7da552ee59c2addd9c89acb82ab492691471 /c602031d9a2c747b504d6c18a1f0560c1f6125cb and official locally verified PG17 image7ae6051efd0e60444282c27c7e141af07f322ce033300e727a49c3dd11075e38. Input remained sanitized-20260919-527f2bdff9/database.dump,141531226bytes/SHA c7a2aeb8969841e8e17e07e6e43241d3fb768a358f017e9716aeb08a11e673c4, originally captured2026-09-17T18:14:16.877Z. This is NOT a fresh production dump. Prior sanitization record62tables/617columns/zero unsafe structured credential rows was checked; input remains sensitive/not anonymized/applicationStartAllowed:false.

New exclusive private A13 image receipt was bound from actual curated source archive, smoke result and immutable local Docker identity by sibling evidence helper bind-a13-c602031d.cjs. Independent code review approved bounded bridge; no historical receipt relabel/rebuild. Receipt explicitly identifies alternative curated-build evidence, not execution of the old exact-image build wrapper. Additionally ran its static payload against the exact image with network:none/read-only/nonroot/no host mounts:57migration checksums, runtime files, PG17.11 tools, AWS CLI and deploy/migrate/backup shell syntax all passed. No normal application boot.

Pure sanitizer plus A13 safety/image harness tests77/77 passed. Actual restored baseline was cloned, migrated twice and compared: protected business/RAG/object-reference/sequence/RBAC-baseline/schema-baseline fingerprints preserved, canonical RBAC and schema parity passed; second migration explicitly no-op with identical fingerprints. Counts remain180tickets/563messages/114attachment RECORDS/1285users. This does not prove historical attachment BYTES, fresh production state, authenticated workflows, all-writer drain or forward recovery.

Evidence .private-data/release-evidence/a13-restore/final-c602031d-20260927/{parity.json,restore.json,cleanup.json,LOCAL-A13.json,baseline-fingerprint.json,candidate-post-round-1.json,candidate-post-round-2.json}. All owned containers/network/volume removed and absence independently listed by exact run label; original dump/image/evidence retained. No live access, provider call, restart, push or deploy. Unrelated next-env preserved. Aluplan rules kept the app stopped until a separately checked mutable working clone and egress boundary are ready.

Next mandatory execution: fresh disposable sanitized working clone + empty Redis + verified host/external egress denial, then exact backend customer/staff/auth/reset/ticket/attachment probes; frontend's production API requires an isolated routing solution before any browser session (never point a local browser test at live API). Reuse existing customer/auth rehearsal tooling, update only artifact bindings and concrete incompatibilities. Remaining real-application/drain/historical-byte/recovery and separately approved production-window gates stay OPEN.

## Production-configured frontend artifact verified locally — 2026-09-27

Same frozen source as backend: c602031d9a2c747b504d6c18a1f0560c1f6125cb. Local helper build-frontend-c602031d.cjs differs from the earlier preview helper only in revision, verified public API URL, local release tag and receipt wording. Independent read-only review found no actionable issue; source/asset review found no omitted committed runtime files. Existing missing /og-image.png is a source-level social-preview defect, deferred, not an archive omission. No product change or broad dependency upgrade.

Curated225files/3,809,280bytes, source SHA256 b16a93459a94e05fe27d5fba004eb5e2d595fb67e72d0b35394602f4a877dc8a. Build exit0 including separate tsc gate and Next15.5.24 production build. Image tag aluplan-frontend-release:c602031d9a2c747b504d6c18a1f0560c1f6125cb; immutable image/index sha256:3b6579da7b0e298fe0de0bac5f4da9fb5796cb13c43dbe289fc9189445873d2c; manifest be741743dcdde83b3dcda6ed2ffb1855a049cec9af00e4a3154b1d7f06d77af2; config61eb196dfea96b2b82e0067b6cca2939c217e40bd4bf0da63c4a4a76c65ec6d4. Evidence sibling .aluplan-hotfix-evidence-20260926/frontend-build-c602031d9a2c/{source.json,source.tar,build.log,smoke.json}.

Three existing smoke programs passed against immutable image in network-none, nonroot, no host mounts/ports, capability-dropped bounded containers: UID1001/x64/Node22.23.3, immutable code/static/public, writable cache, no baked .env or package-manager paths, OpenSSL3.5.8, sharp0.35.4/libvips8.18.6 native closure; vendored serializer negative behavior/hash; local landing/login/logo/optimizer HTTP200 and PNG/JPEG/WebP/AVIF transformations. Separate network-none check found the exact https://api.allplan.net.tr/api/v1 string in7compiled static chunks. Owned containers removed. This is ARM Mac emulation, NOT native VPS, browser/auth/customer API/data acceptance.

Exact archive SHA256 fafb7a1810eeaed7e478a520721c6dd3f36fd0bb95877fc99259982a18d56122. Pinned Trivy0.72 cffe3f5161a47a6823fbd23d985795b3ed72a4c806da4c4df16266c02accdd6f with unchanged2026-09-27T00:40:58 advisory DB, network-none/read-only archive and DB/no Docker socket: **0 Critical /0 High /0 Medium /1 Low**, esbuild0.27.3 GHSA-g7r4-m6w7-qqqr (fixed0.28.1). Report sibling scan-frontend-c602031d/output/report.json SHA2567a4f19f13d0200cf4e3b787ed6660b910c0ae74555452aeb7e1b08fd88511b95. First DB-copy attempt failed on512MiB cache tmpfs because advisory DB is1.3GiB; retry mounted existing DB read-only directly, scan exit0/cleanup verified. Not host disk exhaustion, no scan suppression. Low finding remains visible and is not a new count-driven upgrade task.

Build used external registry/package/font/tooling network; source review found no build/static-generation customer API/CRM/mail/DB call, but this is not packet-capture proof. No credentials supplied. Approved previous UI observation verified configured public/internal URLs and PORT4000; frontend resource Exited means actual serving-container/alias/proxy identity still needs separately scoped confirmation. Current turn made no production access/change, push, restart, deploy or DB operation. Dirty next-env preserved/excluded. Aluplan guidance kept source frozen and scope minimal.

Next: isolated final-image application/data/workflow acceptance against the existing sanitized copy, empty local Redis and blocked provider egress. Preserve prior worker/first-cutover/drain/attachment/forward-recovery gates; frontend smoke does not satisfy them. Backend remains0C3H14M3L with scoped conditional dispositions, not universal clearance. Explicit push et/deploy et gates remain closed.

## Post-drain exact backend artifact verified — 2026-09-27

Frozen committed revision c602031d9a2c747b504d6c18a1f0560c1f6125cb built locally for Linux/amd64. Selected416files,57migration checksums verified; source tar3,348,480bytes SHA256 d55fa3d1eb50ee84145db2c5a57f18962d5b8f33fea18676f25847c1b1782ec6. No dirty files/env/private data included. Existing build/smoke helpers cloned outside Git with only revision substitution and trailing newline; syntax/diff reviewed locally. Attempted independent helper review was unavailable due agent usage limit; do not claim a new independent review. Product source was unchanged this turn.

Build exit0, Nest build passed. Image ID/index sha256:aa150a9c660cba09c4db6476b21f7da552ee59c2addd9c89acb82ab492691471; manifest e2f0c2b00f1117970d92658a04f8adb0b626619e166a3380c316de716b514573; config199b4dc53acec1b43200183183858dce44843ba8cc5f82fb0b54cd09712672b7. Evidence sibling .aluplan-hotfix-evidence-20260926/unified-build-c602031d9a2c/{source.json,source.tar,build.log,smoke.json}. Build network fetched registry/OS packages, not customer services; runtime proof used network:none, no host mounts/ports, overridden node entrypoint and synthetic inert datasource. No normal startup or SQL executed.

Smoke passed UID1000/x64/Node22.23.3, bcrypt6 native, Sentry native binding load (no profiling), eleven package-manager paths absent, five immutable/four writable paths, generated Prisma7.4.2 client, PG17 tools. Offline schema diff remains62tables/58,815bytes/SHA b466a58f9d8dff2215ec7d0de9aa5bf635403fa22dc69e7becf47b097f19afcb. Owned smoke cleanup verified. ARM Mac emulation is not native VPS or authenticated application evidence.

Exact image archive SHA2561ce3f35cd26f7ea61a986dcbb23286cb5b9192e0f0bcc355f8df74651f426b81; report SHA256c0f2bc2412f7564e030ef1947978d555e787abffd6c0b6a9070dc0ade1e50f42. Files under sibling scan-unified-c602031d/{input/image.tar,output/report.json}. Pinned Trivy0.72 scanner cffe3f5161a47a6823fbd23d985795b3ed72a4c806da4c4df16266c02accdd6f ran pull-never/network-none, nonroot, read-only input/DB, no Docker socket, bounded resources, exit0; scanner container removed. Same2026-09-27T00:40:58 advisory DB1735680d236cc6e7971501084395025a83ba5cd93624b052cdb2d573fc0c6b59 used as previous fresh scan. Actual result **0 Critical /3 High /14 Medium /3 Low** versus old11d77fbb0C3H30M7L. Runtime OS now Alpine3.23.6; do not attribute every count change solely to application patches. Remaining High identities unchanged: OTel auto0.71/SDK0.213 CVE-2026-44902, html-minifier4 CVE-2022-37620. Existing conditional dispositions remain, no suppressed findings or blanket GO.

Seventeen pure rehearsal sanitization/customer-probe/auth-fixture tests passed with all network denied; NOT an executed database restore or authenticated acceptance. Next: production-configured frontend artifact and isolated application/data acceptance (including actual worker lifecycle). Preserve three release gates and minimum scope. No live/provider/DB access, customer-data mutation, restart, push or deploy; only unrelated frontend next-env WIP remains. Aluplan guidance kept build inputs committed/curated and smoke inert.

## Runtime tracked-work shutdown join accepted — 2026-09-27

Local checkpoints a177411f (tests), 9a060806 (product). Completed and reviewed existing WorkerShutdownService/AppModule WIP rather than adding a second coordinator. Root beforeApplicationShutdown uses DiscoveryService to join all static initialized WorkerHosts with non-forced close; discovery/close failures still reject before admission closure. Only after successful worker completion does it close the shared MaintenanceWorkService admission and repeatedly waitForIdle(1000) until actual drained:true. An expired interval never means success or authorizes final dependency teardown. Existing module-destroy cron/IMAP/CRM joins precede this phase; pinned Nest awaits this phase before disposal/final Prisma and Redis hooks. No new env, endpoint, schema, dependencies or migration.

TDD: added runtime-coordinator mode to existing real-loopback HTTP/cron fixture: old code3pass1fail (missing automatic fence); two new real-Nest discovery/work cases2fail before implementation. After implementation, new third timeout-result test verifies a false drain result keeps final hooks blocked. Combined12suites83/83 pass under external-network denial/owned-loopback allowance. Backend and frontend no-emit typechecks pass. Scoped coordinator coverage96.66% statements/87.5% branches/100% functions/100% lines; not whole-project coverage. Explicit installed langfuse-core NODE_PATH still accommodates shared test setup. Independent planner and code reviewer approve bounded lifecycle/DI/error behavior; staged secret scans clean. GitNexus tools/graph report unavailable; static lifecycle/caller review used.

Real HTTP regression now demonstrates registered work survives client disconnect and finishes before final dependency teardown with runtime wiring; late accepted worker roots and children registered after closure are preserved. Keep the historical no-hook counterexample in the suite. Synthetic workers/dependencies are NOT real Redis/DB or full AppModule proof. Middleware still does not lease the entire HTTP request: pre-admitted work reaching its first root after closure can reject; unregistered writers and resources already destroyed in onModuleDestroy remain outside this guarantee. An external force-kill or stuck work is not safe completion. No universal zero-loss/zero-downtime claim.

Next: grouped exact-artifact and isolated application acceptance against the existing writer inventory, including actual queue/persistence and deployment stop-grace/first-cutover constraints; do not restart optional dependency work. The known tracked-disconnect defect is repaired locally, but complete operational/data gates remain OPEN. Legacy live backend does not acquire this fix until separately authorized deployment. Frontend next-env WIP preserved. No live/provider/customer-data access, application boot, restart, image build, push or deploy this turn. Aluplan guidance kept this to existing lifecycle primitives and preserved ADR-022 forward recovery.

## Shutdown acceptance refresh: concrete remaining gap — 2026-09-27

Executed 11 existing focused suites /79 tests successfully in this checkout with external network denied and owned loopback allowed. Eight lifecycle suites (worker WIP, worker pause, combined HTTP/cron, cron, inbound mail, queue/Prisma ordering, Redis ordering, CRM failure settlement) passed27; maintenance work/admission and Prisma shutdown passed52. Explicit installed langfuse-core NODE_PATH remains necessary for shared test setup. No AppModule boot, real DB/Redis/provider access or production operations. These tests use synthetic persistence/worker boundaries; they are not final-image integration evidence.

IMPORTANT: green includes an intentional counterexample, not a repaired shutdown. maintenance-combined.spec.ts:157-176/201-207 confirms disconnected HTTP can continue tracked work after final dependency shutdown; its safe sequence at178-196 exists ONLY in the test. Independent read-only source review found zero non-test callers of MaintenanceWorkService.closeAdmission()/waitForIdle(). Thus the existing primitives are not connected to runtime shutdown. This is a demonstrated data/workflow risk, not optional polish.

Unaccepted worker-shutdown/app.module WIP is preserved and not staged: BullExplorer already closes workers in onApplicationShutdown, with existing dependency-order tests; moving completion earlier may support sequencing, but does not itself fence HTTP/other producers or join detached work. Do not commit this WIP as a complete drain fix. Shared admission must not close before already-accepted workers/cron enter their tracked roots. New candidate shutdown code cannot retroactively make the legacy live backend safe to drain; the separately approved first-cutover operational procedure remains necessary.

Next bounded implementation: connect existing completion/admission primitives in the required lifecycle order and make the disconnected-work counterexample pass against the real coordinator, preserving late accepted worker work and failing closed on incomplete drain. Use the existing writer inventory; no new generic maintenance framework, public control endpoint, broad refactor or dependency upgrade. This gate remains OPEN until runtime wiring and combined regression pass. Final-artifact construction follows acceptance, not before it.

## Owner-directed minimum release scope — 2026-09-27

Supersedes earlier open-ended dependency work queues below. Owner explicitly requests only mandatory pre-deploy work; defer everything else. Apply existing delivery policy/ADR-022, not a new platform redesign. No production GO or remote-action approval is implied.

Release blockers are demonstrated unacceptable security exposure, customer-data loss/duplication risk, broken existing customer flows, or missing evidence for the actual deployment artifact. Advisory counts alone are not an upgrade queue. Do not add features, broad dependency/framework upgrades, cosmetic repairs, or speculative refactors to this release.

Bounded read-only review supports these conditional deferrals:

- qs6.15.0 malformed-constructor and comma/null stringify findings: inspected Express/body-parser path uses parse; googleapis-common uses repeat formatting and identified Gmail call has fixed userId:'me'; Superagent uses indices:false/strictNullHandling and is reached through development Supertest. No direct app qs import or customer-object forwarding found. Reopen for untrusted outbound query objects, comma formatting, or any separate parse advisory. This does NOT dispose every qs report entry.
- Nest core SSE metadata injection: sole observed endpoint ai.controller.ts:243 emits {data:object} at257, not untrusted type/id/retry metadata. Installed SSE writer serializes object data; generated IDs and constant error event type are not customer-supplied. Reopen for a new SSE writer or untrusted event metadata. Not host-wide clearance.
- Broader OTel parent-version alignment and html-minifier replacement: defer subject to final artifact retaining the already-tested patched exporter resolution and minify:false boundary, and deployment configuration not enabling an unreviewed path. Findings remain visible; do not suppress or claim all telemetry/MJML risks resolved.
- Existing plain-text special-character double escaping, new team/category/licensing features, cosmetic text and architecture cleanup: post-release backlog. Reopen sooner only if an existing essential customer workflow is demonstrably unusable. These new features must not be represented as included.

Remaining mandatory work, grouped into three acceptance gates rather than endless patch batches:

1. FINAL ARTIFACT: freeze reviewed committed source; build backend plus production-configured frontend; verify exact identities, targeted regressions/typechecks and refreshed scan. Classify residual findings with evidence; fix only demonstrated release blockers. Existing11d77fbb scan is not the newer source's result. Exclude unaccepted worker-shutdown/app.module/next-env WIP; if drain proof requires a change, accept only that bounded change first.
2. DATA AND WORKFLOW REHEARSAL: isolated safe database copy with outbound side effects disabled; login/reset, customer isolation, ticket reply/reopen/attachments, and mail deduplication acceptance. Prove all-writer fencing/drain, backup restoration including attachment bytes, and ADR-022 forward recovery without overwriting newly accepted customer writes. Worker.close alone is not all-writer fencing; restart is not version rollback.
3. APPROVED RELEASE WINDOW: separately authorized current production/configuration checks and fresh backup, maintenance/abort/reopening criteria, explicit push et and deploy et gates, then deployment and post-release data/workflow verification. Never replace live data with the local copy. Current turn does not perform this gate.

Next execution priority: settle the existing writer-drain readiness gap against the established rehearsal plan, then produce the final artifact once. Do not start another broad advisory search or rebuild repeatedly between speculative patches. Latest verified source baseline remains dependency256/256, upload30/30, rich-text19/19 and both typechecks from prior checkpoints; no tests or images rerun for this documentation-only scope decision. No live/DB/provider access, changes, restart, push or deploy.

## Upload detector dependency checkpoint — 2026-09-27

Scoped `@nestjs/common@11.1.14>file-type` override21.3.0->21.3.2; no framework/controller/MIME-policy/schema changes. Verified official release https://github.com/sindresorhus/file-type/releases/tag/v21.3.2 and advisories GHSA-5v7r-6r5c-r473 /GHSA-j47w-4g3g-c36v. Registry notdeprecated, node>=20, noinstallhooks, integrity `sha512-DLkUvGwep3poOV2wpzbHCOnSKGk1LzyXTv+aHFgN2VFl96wnp8YA9YjO2qPzg5PuL8q/SW9Pdi6WTkYOIh995w==`. Existing secondary versions unchanged; unrelated Sentry peer drift/SheetJS integrity loss from lock regeneration restored. Frozenignore-scripts install passed.

Security relevance: actual Nest FileTypeValidator detects bytes BEFORE MIME comparison, used by attachments and branding. Size caps do not prevent tiny malformed ASF hangs. Attachment handler's per-message authorization runs after the pipe, so do not claim it shields detection; route-level permissions still apply. Knowledge-pool upload is outside this consumer. Unknown plaintext/SVG acceptance was not widened. Skill kept this a dependency-only compatible patch, not a upload-policy redesign.

Seven new tests use actual Nest validator and its ESM-resolved file-type: PNG/JPEG/PDF accepted including generic declaredMIME; mismatched/unknown/empty/missing buffers denied; tinyemptyZIP recognized. The55-byte malformedASF runs ONLY in a subprocess with emptyenv,2s hardtimeout/SIGKILL,64MiB V8heap (not totalRSS limit),4KiB output. RED5pass2fail on21.3.0: versionfloor and forcedtimeout (~2004ms). Initial GREEN assertion expected genericASF as in21.3.1; inspected21.3.2 explicitlyrejects negativepayload as undefined, corrected exactassertion (not broadened). FinalGREEN7/7, child~66ms; Nest denies malformedASF masquerading as image. No ZIPbomb stress test or ZIPresource-limit proof claimed.

Explicit33-file recurring dependency suite256/256; independentfocused9/9; existing uploadlimits/durability30/30 bothbefore/after; backend/frontend typechecks passed. First Jest invocation encountered existing langfuse-core resolution setup issue, rerun with installedmodule NODE_PATH passed; no testsetup change. Tests have network denied except aggregate's ownedloopback. Code/security review GO for bounded scope. Local9e92bb35 tests/CI,00beed9d dependency; stagedsecretscan clean. No app/live/provider/DB access, migrations, restart, push/deploy or newimage scan. WIP intact. Next: remaining request-parser qs findings and Nestcore advisory reachability, then grouped image verification; old11d77fbb counts remain artifact-specific, not current source clearance.

## Fail-closed rich-text SSR checkpoint — 2026-09-27

Closed the latent raw-HTML fallback: ContentSanitizer returns empty without window. RichTextRenderer uses module-stable useSyncExternalStore snapshots (false server/initial hydration, true client) and returns null BEFORE content checks. This order also accommodates AiAnswerContent -> markdownToHtml returning empty on the server and sanitized HTML in the browser. No dependency/schema/environment/write-path changes. Intentional tradeoff: this content is absent without JavaScript/hydration; existing ticket/AI callers already fetch data after mount. No demonstrated previous live SSR exploit claimed.

Tests-first RED5failed/11passed ->GREEN19/19 across sanitizer/renderer/markdown focused tests. Actual renderToString with window unavailable, hydrateRoot recoverable/console errors, hostile markup, legacy Unicode, null/empty, and actual AI wrapper exercised. Scoped coverage statements92.59%, branches83.33%, functions100%, lines97.61% (not whole-project coverage). Recurring dependency suite249/249 and both backend/frontend typechecks passed. Independent source/caller review found no actionable issue; graph tools unavailable, scoped static caller analysis used. Local commits aace599e tests /30daf45b fix; staged secret scans clean.

Offline Chromium fixture bundles real renderer + AI wrapper with esbuild write:false; no app/env/DB startup. Empty SSR, rich/AI hydration, link protections, active-markup removal, plain/empty content and updates verified without recoverable hydration errors, browser errors/dialogs or external requests. Evidence helper/screenshot outside Git: sibling `.aluplan-hotfix-evidence-20260926/ssr-renderer-browser.cjs` and `ssr-renderer-hydrated.png`. This is isolated component proof, NOT full authenticated application E2E. Initial browser assertion also exposed existing plain-text ampersand/less-than double escaping: sanitizer returns encoded HTML and React text escapes it again. That branch was not changed here; retain as a separate display defect, not an SSR regression or resolved issue.

Next bounded security work remains file-type/Nest upload validation dependency analysis and compatible patch, followed by remaining request-parser disposition and grouped artifact verification. No image rebuilt or rescan this turn; old11d77fbb count remains0C3H30M7L only for that artifact. Local-only, no live/data/provider access, restart, migration, push or deploy. Existing worker-shutdown/app.module/next-env WIP preserved. Aluplan skill kept fix within existing renderer and preserved persistence semantics.

## DOMPurify compatibility/security checkpoint — 2026-09-27

Scoped `dompurify@>=3.0.0 <3.4.13` override replaces3.3.1 with3.4.13 across existing frontend/backend/type consumers. Official release https://github.com/cure53/DOMPurify/releases/tag/3.4.13 and advisory https://github.com/cure53/DOMPurify/security/advisories/GHSA-55q2-fjhq-7xh7 verified; the specific IN_PLACE hook-removal advisory is not demonstrated reachable through this application's string-input configuration. Registry notdeprecated, integrity `sha512-2vmYIoqjze2d+kakP8S/nS5shfsl587kzwEjcGlTdiksUVgFHnFCsLYDVj/JNqJVOQZGSYBTmuycv0PodwmnMQ==`; no installhooks (prepare husky), install ignoredscripts. Restored unrelated Sentry peer drift and SheetJS integrity removal introduced by lock regeneration; frozen installation passed. No application source/config/schema/DB changes.

New six-test suite loads actual ContentSanitizer in trusted-source VM with allowlisted require and real frontend DOMPurify/jsdom. JSDOM script execution/subresource loading disabled; windows closed. Covers allowed rich text, link rel/URL safeguards, active HTML removal, empty editor behavior, default announcement table/image preservation and bounded malformed/Unicode idempotence. RED5pass1versionfail on3.3.1 -> GREEN6; no exploit reproduction claimed. Explicit32-file CI dependency suite249/249; independently focused8/8; existing ContentSanitizer/RichTextRenderer Vitest7/7; both backend/frontend typechecks passed. Offline Chromium rendered fixture exercised actual sanitizer and retained Turkish text/link protection while stripping script/image markup. This is NOT authenticated application E2E or a full announcement component test. Code/security reviews approve bounded scope. Local commits fc98fc74 tests/CI, df22e760 dependency; staged secret scans clean.

Review identified latent SSR contract risk: ContentSanitizer returns input unchanged without window, and RichTextRenderer can feed that into dangerouslySetInnerHTML. Existing ticket caller starts null/loading and fetches in useEffect; AI history starts empty, so current SSR exploitation was NOT established. Upgrade does not fix this fallback. Next smallest task: fail-closed SSR behavior with renderToString regression and hydration/compatibility check, before file-type upload dependency batch. Do not call entire HTML path safe yet. No new image or rescan this turn; latest exact11d77fbb image result0C3H30M7L remains old-artifact evidence, not this new source's count. No live/provider/data access, push/deploy or restart; unrelated worker-shutdown/app.module/next-env WIP intact. Skill guided preservation of existing renderer behavior instead of replacing rich-text architecture.

## Fresh advisory database and remaining-risk triage — 2026-09-27

Re-scanned the SAME immutable11d77fbb image archive with a separately downloaded Trivy DB; old comparative cache/report untouched. DB-only download used the pinned local scanner, no source/archive/secrets mounted. Scan itself used network-none, pull-never, readonly archive/DB, non-root, bounded4GiB memory/2GiB temporary space, no Docker socket. Both commands exited0; owned refresh/scan containers absent afterward. New metadata UpdatedAt `2026-09-27T00:40:58.172367669Z`, DownloadedAt `2026-09-27T02:18:54.183874137Z`. DB SHA256 `1735680d236cc6e7971501084395025a83ba5cd93624b052cdb2d573fc0c6b59`; metadata `3c3ee5de0d38dd669c8c78a539303d2e799d18cdc4bd280130b97be5a4051c98`; report `cc8c5c72bcd9e9bed1b2aa2c4e797f496989acb6aece6f1b36c2f254876e574f`. Evidence under sibling `.aluplan-hotfix-evidence-20260926/scan-unified-11d77fbb/{fresh-cache/db,fresh-output/report.json}`. Result remains **0 Critical /3 High /30 Medium /7 Low**; this is artifact/dependency evidence, not application penetration testing or live-host clearance.

Independent security review confirms bounded source mitigations: auto0.71 resolves SDK0.213 to patched exporter0.217 and scan inventory has one exporter version; explicit MJML minify:false plus sentinel tests prevent minifier calls for ticket/reset/raw fixtures. Seven focused isolated tests rerun passed on host Node24.18.0, no application or listener startup. These support scoped mitigation only; no package finding suppression, blanket waiver or deployment approval. Production environment/preload drift and authenticated workflows remain unverified.

Medium triage must not be skipped solely for severity labels: current report includes DOMPurify3.3.1, Nest core11.1.14, file-type21.3.0 and qs6.15.0 among others. Source confirms DOMPurify use in frontend content-sanitizer/announcement paths, and Nest FileTypeValidator in attachment/branding controllers. Backend dependency presence alone does not prove backend DOMPurify reachability. Next bounded source work: assess and regression-test active HTML sanitation/file upload/request parsing dependencies before deciding scoped compatible patches; do not perform another indiscriminate upgrade sweep. No new product code/dependency change this turn. Aluplan skill preserves established mail/telemetry behavior. Live/customer data untouched; writer-drain WIP and all operational release gates remain open.

## Grouped immutable backend image checkpoint — 2026-09-27

Built frozen source `11d77fbb41ed2dbfb5c4f1dcd4403df62d0a7007`, not the dirty working tree. Selected archive: 415 files, 57 migration checksums verified, 3,348,480 bytes, SHA256 `c302059035837d4961f8c57505ee5f8102b79392e89877eebb745a946528ba8d`. Local amd64 image ID/index `sha256:6f28d3de79f4f0347cebdb32cfaf4ada25ac7dd09bf43fe8aebf34cdf9eeede2`; manifest `sha256:56612aef33c64f3ead6742f58ca32ee705dda7791e5fce2c12a629b188e1a865`; config `sha256:73117d0d10bb029d439224933252354c9898bb2d664e930a163d6b067ced154d`. Build succeeded. Evidence outside Git: sibling `.aluplan-hotfix-evidence-20260926/unified-build-11d77fbb41ed/{source.json,source.tar,build.log,smoke.json}` and `scan-unified-11d77fbb/{input/image.tar,output/report.json}`. Image archive SHA256 `37d7084c670c66a289658e76353bff8360a0f856c3bea740323c16af24cbfe9e`.

Network-none smoke passed: UID1000, x64/Node22.23.3, bcrypt native6.0.0 correct/wrong-password checks, Sentry native profiler loads without starting profiling, 11 package-manager paths absent, 5 immutable/4 writable paths, Prisma7.4.2 generated client and PG17 tools. Offline Prisma schema diff: 62 tables, 58,815 bytes, SHA256 `b466a58f9d8dff2215ec7d0de9aa5bf635403fa22dc69e7becf47b097f19afcb`, unchanged from prior proof. No DB connection/SQL execution/normal startup. Actual config CLI loads inside isolated image only. Owned smoke container removal verified. ARM Mac emulation is NOT native VPS or authenticated application proof.

Comparative Trivy0.72.0 scanner pinned `sha256:cffe3f5161a47a6823fbd23d985795b3ed72a4c806da4c4df16266c02accdd6f`, pull-never, network-none, no Docker socket, read-only archive/DB, non-root, bounded resources. First attempt exhausted the scanner's 256MiB temporary filesystem (not production disk); retry with 2GiB temporary filesystem/4GiB memory completed exit0, owned containers absent afterward. Same baseline DB: UpdatedAt2026-09-26T06:33:51.318021692Z, DB SHA256 `0f38d33d464c27d068e314efa9173849113a23be04ee279350d2de4b3941004d`, metadata SHA256 `9c187e65768ca92cbc04c7684489490be2e6b1b85360aab9e23f74bfe4ec3cb5`; hashes unchanged before/after. This is comparative evidence, NOT a refreshed advisory database clearance.

Report SHA256 `7eac75a1469167baa6bd8f61f9b23095f701f483ba7fd482cf4b9ab363eef9f9`: prior2b90e02d **0 Critical /30 High /71 Medium /10 Low** -> new11d77fbb **0 Critical /3 High /30 Medium /7 Low**. No new package/advisory identities; Alpine section has no reported vulnerabilities on this DB. Remaining High: CVE-2026-44902 on auto-instrumentations-node0.71.0 and sdk-node0.213.0; CVE-2022-37620 on html-minifier4.0.0. Patched Prometheus leaf and explicit minify:false/tests do not automatically waive parent or retained-package findings. No suppression added. Fresh build APK resolution may differ; do not attribute every delta exclusively to source overrides.

Next: bounded final disposition of these three High findings plus remaining Mediums and fresh-DB scan, followed by authenticated isolated-clone acceptance and production-configured frontend artifact. Writer-drain WIP is excluded and remains unresolved. Backup/restore/forward recovery, native-host checks, mail/TLS and explicit publication/deploy gates remain open. No live access, DB writes, migration, restart, push or deploy; unrelated app.module/worker-shutdown/next-env WIP preserved. No production GO inferred.

## Deepmerge source checkpoint — 2026-09-27

Completed exact @prisma/config@7.4.2>deepmerge-ts8.0.2 override from7.1.5. Reuses existing8.0.2 (html-to-text); no added runtime dependencies, Prisma7.4.2/schema/startup unchanged. Registry notdeprecated, integrity sha512-uqbvqLUMrc6p0MO+WBRtTxY55hmyh94WRwI5a++PZe54X+bfVh59FSN7uWCBCW1CCVjzjnrwzfI8zidE2obMMw==; package hasprepare:husky, noinstallhooks; installation ignoredscripts. PreservedSentrypeerbindings/XLSXintegrity after regeneration; frozeninstall passed.

Primaryrelease https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0 changes Mapcollisionmerge, Intoaliasmutation andtypeexports; observedPrismaconfigdist591/614 uses ordinarydeepmerge throughc12, notthoseAPIs. Tests execute consumer-resolved CJS/ESM only, noPrisma/c12/repositoryconfigload. Configshapedfixtures preservearrays/callbackidentity/falsyvalues/inputobjects and existinglater-valuewins order, including c12-styleenv-first/base-second. These fixtures document existingbehavior, not a newprecedencepolicy or fullconfig-loaderproof. Two tinyselfcycles run in child2stimeout/64MBV8heap/boundedoutput/emptyenv/noshell: oldstackexhaustion, newselfreferencepreserved. 64MB is not a totalRSSbound. Initial4testsRED2pass2fail; final5testsGREEN, focused7/7 independently inclCI. Mainmodule imports/ESMcompatibility checked withoutactualadapterexecution.

Explicit31-file aggregate243/243 passed with externalnetworkdenied/ownedloopbackallowed; both frontend/backendtypechecks passed. Code/securityGO forscope. Local63ea4b5b tests /b2536990 dependency, stagedsecretchecks clean. No image/rescan/live/DB/mail/migration/push/deploy. ExistingWIP preserved. Aluplan skill limited this majorupgrade to verifiedconsumer rather than globaloverride. Next milestone is GROUPED exactimagebuild+rescan from reviewedcommittedsource, not another speculative dependency sweep. Lastimage2b90e02d0C30H remains oldevidence: do not subtract findingsarithmetically. Html-minifierretaineddisabledpath and SDK/auto parentversionadvisoryflags require explicitactualscan disposition; productiondata/acceptance/recovery gates stillopen.

## Email minifier boundary checkpoint — 2026-09-27

TemplateService.compile now explicitly sets minify:false alongside existingbeautify:false; no dependency or delivery behavior change intended. Actual source rendering of ticket-created/password-reset/raw exercised with real MJML/Handlebars/html-to-text; three allowlisted TS modules run in a VM with syntheticprocessenv and stublogger. Sentinel around actual mjml-core html-minifier export records zero calls and is restored in finally; generatedHTML/text and resetlink preserved. RED failed only on undefined versus explicitfalse (old default already did not invoke minifier), GREEN1+CI2=3/3 independently. This is defense against optional-path activation, NOT a fix/removal/waiver for html-minifier4 or all renderer vulnerabilities. No malicious DoS payload or mail dispatch.

Explicit30-file aggregate238/238, mocked EmailService/EmailProcessor23/23 and both frontend/backendtypechecks passed. External network denied (aggregate permits ownedloopback); code/security GO for scope. Localfd3b1a22 test/wiring andd7c289f1 one-linefix; stagedsecretchecks clean. No newenv/schema/migration/configuration, no image/scan/live/customerdata/push/deploy. ExistingWIP preserved; GitNexus tools unavailable, reviewed callsite only (single mjml renderer found). Skill guided narrow explicit behavior guard rather than replacing mail pipeline. Lastimage0C30H remains unchanged evidence; retainedminifier needs scoped release disposition after rescan.

Next bounded patch candidate from independent source review: @prisma/config@7.4.2>deepmerge-ts8.0.2, already used elsewhere by html-to-text. Prisma configdist589-619 uses plain deepmerge via c12 (notInto/custom/types), disablesdotenv/rcFile/giget/extend/packageJson; c12 retainsenv overlays. Checked-inconfig hasacyclicliterals+adaptercallback, noMap; no directapplicationconsumer found. v8 breakingMapcollision/Intoalias/type-name changes do not match observed use, but dedicatedcontracts forargumentorder,callbacks,arrays,falsyinputs,inputpreservation andboundedcyclehandling must precede upgrade. Agent's3boundedconfigfixture comparisons7.1.5/8.0.2 matched; notfullPrismaload/migrationproof. No repositoryconfig/CLI executed. Sources: https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx and https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0 . OrdinaryJSONcannotcreate overlappingcycles; no demonstratedrequest-timeexploit or blanketexception. After that decision, groupedexactimagebuild/rescan remains next milestone, not further unboundeddiscovery.

## Prometheus source checkpoint — 2026-09-27

Completed @opentelemetry/sdk-node@0.213.0>@opentelemetry/exporter-prometheus exact0.217.0 override from0.213.0. Registry version not deprecated; integrity sha512-U9MCXxJu0sBCh5aEkylYRR4xVIL8D1CW6dGwvYXbfFr0qveSorfD0XJchCAWoW6QfAAIcY/yxjf4Dj8OgkHBPw==. Only exporter subtree adds core/resources/sdk-metrics2.7.1; parent SDK/metrics remain0.213/2.6. Rejected regenerated Sentry2.9 peer drift again; preserved previous snapshots and XLSX integrity. Frozenignore-scripts install passed. No global OTel override or activation.

Primary advisory https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-q7rr-3cgh-j5r3 recommends0.217 exporter+SDK/0.75auto. This bounded leaf fix does NOT change parent SDK0.213/auto0.71; scanner version flags may remain. Do not suppress or waive automatically; distinguish actual fixed exporter path from package-level advisory metadata in the next exact-image scan. No runtime exposure proof or full telemetry-system acceptance.

Three pure tests resolve actual parent2.6 MeterProvider/resources plus new reader2.7.1: explicit host127.0.0.1/port9464/preventServerStart:true with listeningfalse assertions, direct handler synthetic badURL400/unknown404/metrics200, counter3->5 cumulative collection, histogramcount/sum, observablegauge7, resource label and serialized values, forceFlush and finallyshutdown, postshutdowncollect rejection and repeated shutdown. No NodeSDK/app/config execution, global provider registration, listener, HTTP traffic or database. Baseline had fixture label mismatch (corrected before upgrade); valid compatibility test then passed while version/InvalidURL failed. GREEN3/3; focused9/9 including Jaeger+CI independently passed. Explicit29-file aggregate237/237 under external-network denial/loopback allowance and both backend/frontend typechecks passed. Code/security GO for scope; local aef9e0d8 tests /8870d4c0 fix, staged secret scans clean.

No image/rescan, hostedCI, live/customer data/mail access, migration, push/deploy. WIP unchanged; last exactimage2b90e02d0C30H is still old evidence. Next: deepmerge7->8 risk/compatibility decision and explicit html-minifier disabled-boundary test, then grouped exact-image build/scan to settle actual remaining findings. Avoid restarting dependency discovery or broad upgrades merely to reduce counts. Existing operational/data-preservation release gates remain required.

## Jaeger source checkpoint — 2026-09-27

Completed exact consumer override @opentelemetry/sdk-node@0.213.0>@opentelemetry/propagator-jaeger2.9.0 from2.6.0. Registry version not deprecated; only its core2.9 subtree added, SDK0.213 and existing stable2.6/Sentry family retained. Lock regeneration initially moved frontend Sentry's Core peer to2.9: rejected this scope expansion, restored prior peer snapshots and added installed consumer-resolution guard for2.6. Preserve that binding in future lock updates; frozenignore-scripts install passed, XLSX integrity preserved.

Primary advisory https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-45rx-2jwx-cxfr fixes malformed percent decoding in2.9. Pure fixtures execute actual Jaeger/API only, never SDK/config/app initialization: malformed trace+baggage percent values do not throw, valid trace/Unicode baggage roundtrip survives and root context unchanged. RED1pass2fail before patch; final4/4 plus2CI guards independently6/6. Aggregate28files234/234 under external-network denial/loopback allowance and both backend/frontend typechecks passed. Code/security reviews GO for bounded scope; local6cf13952 tests /3f5a12ba dependency; staged secret scans clean. No coverage percentage or live exploitability claim. No image/rescan, DB/mail/live access, migration, instrumentation activation, push/deploy; existing WIP preserved. Last exact image2b90e02d0C30H remains old evidence, not this source.

Next bounded decision: Prometheus0.213->0.217 carries sdk-metrics/resources/core2.7.1 while parentSDK uses2.6; isolated malformed-URL test alone is insufficient. Prove cross-version reader registration/collection/shutdown with synthetic data before selecting leaf override. Alternative coherent auto0.78/SDK+OTLP0.220/stable2.9 is broader and must not be automatic. Registry SDK0.217 still pins Jaeger2.7.1: auto0.75/SDK0.217 alone does NOT fix both advisories. Sources: https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-q7rr-3cgh-j5r3 and registry manifests /@opentelemetry%2fsdk-node/0.217.0 , /0.220.0 ; /@opentelemetry%2fexporter-prometheus/0.217.0 . Live activation/listeners remain unverified. Deepmerge major-change and html-minifier boundary decisions remain open, followed by grouped exact-image verification and data-preserving operational gates. Aluplan skill's claimed automatic otel preload is stale versus inspected startup; do not activate it as a dependency fix.

## MySQL2 source checkpoint — 2026-09-27

Scoped prisma@7.4.2>mysql2 override3.15.3->3.22.0; Prisma remains7.4.2, application PostgreSQL/schema untouched. Registry version not deprecated, integrity sha512-4jaJYBObj7FhD3lnZhqX1yDMuZN4mQNz+IolDySDXT7fbozMBpeGQNcuWXKUqo4ahkAEfkjUHPjnwuDI0/6VKw==. Expected lock changes include Node types peer propagation, sqlstring->sql-escaper1.5.2, removal of seq-queue, iconv-lite0.7.2->existing0.7.3. Frozenignore-scripts install passed; XLSX integrity retained.

Primary release https://github.com/sidorares/node-mysql2/releases/tag/v3.22.0 disables mysql_clear_password by default. Advisory https://github.com/sidorares/node-mysql2/security/advisories/GHSA-3f6p-5ww8-9rcr still reports no patched version: do NOT claim full advisory/scanner clearance. In-memory actual authSwitchRequest fixture with synthetic password: old handler writes a response; new handler writes zero packets and rejects with MYSQL_CLEAR_PASSWORD_NOT_ENABLED/fataltrue. Explicit opt-in can still enable cleartext; no such configuration was introduced. Native challenge token and unknown-plugin rejection preserved; public escape/escapeId/null/Unicode formatting tested. Initial RED2pass2fail; initial patched run exposed an incorrect expected error message, corrected to the actual dedicated error code. Final5/5 and focused7/7 inclCI independently passed. No connection, Prisma/config/.env execution or SQL execution.

Explicit27-file aggregate230/230 passed with external network denied/loopback allowed; both backend/frontend typechecks passed. Independent code/security reviews GO for this bounded source scope. Local commits f8fee179 tests,9b40133f dependency; staged secret scans clean. No image/rescan, hostedCI, live/DB/provider access, migration, push/deploy. Unrelated worker-shutdown/app.module/next-env WIP preserved. Last exactimage2b90e02d0C30H unchanged, not a scan of this source. Next: remaining telemetry compatibility, deepmerge major-change and disabled html-minifier decisions, then grouped immutable-image build/rescan. Operational/data-preserving release gates remain open.

## Hono / Node adapter source checkpoint — 2026-09-27

Scoped @prisma/dev0.20.0 edges: hono4.11.4->4.13.9, @hono/node-server1.19.9->1.19.17. Registry verified no deprecation; adapter latest-1 retained instead of major2. Lock only these packages/peer edges, frozenignore-scripts passed, XLSX integrity preserved. Primary references: https://github.com/honojs/hono/security/advisories/GHSA-q5qw-h33p-qvwr , https://github.com/honojs/node-server/security/advisories/GHSA-wc8c-qw6v-h7f6 , https://github.com/honojs/hono/security/advisories/GHSA-88fw-hqm2-52qc , https://github.com/honojs/hono/releases/tag/v4.13.9 , https://github.com/honojs/node-server/releases/tag/v1.19.17 . Version choice includes newer same-major fixes rather than just the earlier high-advisory minimums.

New five-test suite: RED3pass2fail(version+encoded slash), GREEN5; focused7/7 incl CI independently verified. Generic Hono serveStatic uses only in-memory content: normal protected path403, old encoded-slash paths200, new paths deny exposure. CORS allowlist/wildcard checks preserve fail-closed behavior; wildcard already passed on4.11.4, so do not claim reproduced CORS exposure. Node adapter JSON/Unicode smoke binds owned127.0.0.1:0 only, overrideGlobalObjects:false, bounded fetch, finally close/closeAllConnections. No filesystem serving, Prisma/dev/Studio startup, .env or DB access. Node adapter's own filesystem serveStatic path was NOT exercised. External overrides do NOT establish clearance of separate Studio-bundled code; that uncertainty remains.

Explicit aggregate/CI guard26files225/225 passed with external network denied and loopback allowed; both backend/frontend typechecks passed. Code/security review GO for scope; f113918f tests /97ebfb56 dependency committed locally. No app/schema/startup changes, image/rescan, hostedCI, live/provider/DB/migration/push/deploy; WIP intact. Last exactimage2b90e02d0C30H remains unchanged. Next bounded batch: mysql2 clear-password default behavior and scoped patch; telemetry/deepmerge/html-minifier decisions and grouped exact-image rescan remain, along with operational/data release gates.

## Effect source checkpoint — 2026-09-27

Completed scoped `@prisma/config@7.4.2>effect` override: 3.18.4 -> 3.20.0, the reviewed same-major fixed release for https://github.com/Effect-TS/effect/security/advisories/GHSA-38f7-945m-qr2g . Maintainer release https://github.com/Effect-TS/effect/releases/tag/effect@3.20.0 identifies scheduler isolation fix8798a84. Registry had no deprecation; integrity sha512-qMLfDJscrNG8p/aw+IkT9W7fgj50Z4wG5bLBy0Txsxz8iUHjDIkOgO3SV0WZfnQbNG2VJYb0b+rDLMrhM4+Krw==. Lock changes only Effect/its sole config edge; Prisma7.4.2 and Effect's existing secondary dependencies unchanged. Frozen ignore-scripts install passed; XLSX integrity preserved.

New five-test consumer-resolved suite executes only Effect (not Prisma/config/.env). Representative Schema/Either/Function.pipe fixtures preserve optional/mutable-array/NullOr fields, reject invalid/excess/empty seed and preserve feature-gate failure. Two synthetic runPromise fibers yield then read separate AsyncLocalStorage values: old3.18.4 produced alpha/alpha, patched3.20.0 produces alpha/beta. RED3pass2fail ->GREEN5, focused7/7 incl CI. This is a library regression, NOT evidence of live session leakage; observed Prisma usage is config validation, not an established RPC request path. Fixture is not full Prisma loader or migration acceptance.

Recurring explicit25-file aggregate220/220 passed (external network denied, loopback allowed); backend/frontend tsc noEmit/incremental:false passed. Independent code/security reviews found no blockers; localc4795992 tests /a9a6d297 dependency. No app/schema/env/startup change, new image/scan, live/DB/provider/real mail access, migration, push or deploy. WIP preserved. Last exact image2b90e02d0C30H remains artifact-specific. Next: remaining Prisma-tool Hono/adapter/mysql2 patches and telemetry compatibility decisions, then grouped exact-image build/rescan; deepmerge7->8 remains a separate major decision. Authenticated workflow/drain/data-preserving recovery/host gates remain open.

## Lodash source checkpoint — 2026-09-27

Scoped `lodash@>=4.0.0 <4.18.1` override consolidates 4.17.21 and 4.17.23 at 4.18.1. IMPORTANT: advisory minimum 4.18.0 was rejected BEFORE installation after registry metadata marked it a bad release. Maintainer 4.18.1 release explains modular template/fromPairs ReferenceErrors from distribution building; use 4.18.1, not the earlier disposition's minimum. Sources: https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc and https://github.com/lodash/lodash/releases/tag/4.18.1 . Registry integrity: sha512-dMInicTPVE8d1e5otfwmmjlxkZoUpiVLwyeTdUsi/Caj/gfzzblBcCE5sRHV/AsjuCmxWrte2TNGSYuCeCq+0Q==. Frozen ignore-scripts install passed; lock changes only Lodash/consumer edges, XLSX checksum preserved.

New 42-test suite resolves Nest config, Swagger, MJML core, Redis INFO and Prisma dev Chevrotain edges; RED 17 pass/25 fail on old packages, GREEN42 on 4.18.1. Full and modular template entries reject inert default-parameter import keys and ignore local inherited imports; no Object.prototype write or harmful payload. Valid imports/HTML escaping, nested get/has/set/clone, uniq and modular fromPairs remain compatible. Actual Redis INFO parser handles inline counts without connection; Chevrotain lexes two words. Do NOT import prisma-ast in pure fixtures: initialization searches configuration files. Resolving it without execution is sufficient to reach Chevrotain. No demonstrated customer-controlled template imports path; these tests prove library guards, not live exploitability or full Prisma workflow acceptance.

Explicit aggregate/CI guard now24 files; focused44/44 including CI contracts, actual aggregate215/215 (external network denied, loopback permitted), backend/frontend typechecks pass. Existing email service/processor23/23 under network denial passed with the established NODE_PATH workaround for unhoisted langfuse-core test setup; expected mocked failure logs are not live SMTP failures. Independent code/security reviews GO; earlier4.18.0 review blocker resolved. Local commits3864c0c1 tests /99d9e3aa dependency. No image build/rescan, hosted CI, app/Prisma boot, real mail, DB/live/provider access, migration, push or deploy. WIP preserved. Last exact image2b90e02d0C30H remains unchanged; do not infer new scan counts. Next bounded batch: same-major Effect compatibility in Prisma config, followed by remaining telemetry/Prisma-tool decisions and grouped exact-image rescan. Deepmerge7->8 remains a separate major-version decision; release operational/data gates stay open.

## YAML v4 patch checkpoint — 2026-09-27

Completed the first bounded batch from the disposition below: scoped `js-yaml@>=4.0.0 <4.3.2` override to 4.3.2. Lock changes only the three v4 consumers (@nestjs/swagger, cosmiconfig, @eslint/eslintrc); v3.14.2 and XLSX integrity remain unchanged. Frozen install with scripts disabled passed. Primary source: https://raw.githubusercontent.com/nodeca/js-yaml/4.3.2/CHANGELOG.md (merge-work limits, empty-map accounting, ordered-map complexity fixes). No application code, schema, environment or startup change.

New `scripts/yaml-dependency-security.test.cjs`: 15 tests; RED 6 compatibility passes / 9 version-or-limit failures on 4.1.1, GREEN 15 on 4.3.2. Resolves real consumer paths but executes only js-yaml, not CLI/config/app modules. Small synthetic OpenAPI uses Swagger's skipInvalid/noRefs options; tests cover Turkish text, refs/scalars, normal merges, duplicate rejection, three-empty-map budget and 100/101 default merge boundary. No stress payload or timing assertion. This does not measure ordered-map complexity or establish customer exploitability. Changelog changes underscore numeric parsing; tracked YAML search found only Tempo's `max_block_bytes: 1_000_000`, an external Tempo configuration, not a demonstrated js-yaml consumer.

Explicit aggregate/CI guard now 23 files. Focused 17/17 including CI contracts; actual aggregate 173/173 under external-network denial with loopback allowed; backend and frontend tsc noEmit/incremental:false passed. Independent code and security reviews found no scoped blockers. No image build/rescan, hosted CI, app boot, live/DB/provider access, migration, push or deploy. Existing app.module/next-env/worker-shutdown WIP preserved. Last exact image remains 2b90e02d (0C/30H/71M/10L); do not subtract source patches from that scan. Next bounded source batch: Lodash4 compatibility/security tests then scoped update; operational acceptance/recovery gates remain open.

## Remaining-risk source disposition — 2026-09-27

Read-only consumer review with three bounded agents plus maintainer advisories; no dependency/application/runtime changes. Re-ran recurring regression command:158/158 under external-network denial with loopback permitted. This is prioritization, NOT accepted risk, scan suppression, image clearance or production GO. Owner: project maintainer; re-review every row before release acceptance and whenever its activation/input path changes. Last exact image remains2b90e02d0C30H71M10L; newer source patches require a grouped build/rescan.

| Group | Source evidence and uncertainty | Next bounded action / acceptance trigger |
|---|---|---|
| js-yaml4 / Lodash4 | Swagger dumps OpenAPI via js-yaml4.1.1; CLI cosmiconfig parses YAML. Lodash4.17.23 is in Nest config/Swagger/MJML/Redis INFO;4.17.21 in Prisma dev/parser. Email input reaches MJML, so Lodash is not wholly tooling. No customer-controlled template imports established. | Next implementation batch: js-yaml4.3.2 with bounded YAML/OpenAPI fixtures, then Lodash4.18 with config/MJML/Redis/parser compatibility and inert template-import regression. Keep js-yaml3 separate; do not execute large DoS fixtures. |
| OTel Prometheus / Jaeger | main.ts/deploy.sh show no otel.ts/instrument.ts preload; live NODE_OPTIONS/settings/listeners unknown. SDK0.213 imports Prometheus selected by OTEL_METRICS_EXPORTER and Jaeger selected by OTEL_PROPAGATORS. The SDK defaults to OTLP, not Prometheus; Jaeger opt-in differs from default W3C propagation. Sentry10.42 uses separate instrumentation0.211 vs direct0.213. | Assess leaf/SDK compatibility with isolated malformed-input fixtures; no broad global OTel override or activation. Preserve telemetry ownership/shutdown boundaries; live activation/listener verification needs separate approval. |
| Prisma config deepmerge-ts / Effect | Prisma7.4.2 -> @prisma/config7.4.2 owns deepmerge7.1.5 and effect3.18.4; config merger/Schema/Either use, not observed request DTO path. Config loading matters during migrate-once. deepmerge advisory requires recursive object graphs, not ordinary JSON alone;8.x changes semantics. | Prefer same-major Effect compatibility tests first; deepmerge7->8 is a separate justified decision, not automatic override. Never execute repository prisma.config.js during pure tests because it loads root .env. |
| Prisma dev Hono / adapter | @prisma/dev0.20 owns Hono4.11.4/node-server1.19.9. No production startup invocation found. dev serve() omits hostname, so localhost URL does NOT prove loopback-only binding. CLI also embeds Studio HTTP code whose version was not identified. | Paired external-package compatibility review only; never start dev/Studio on production as a test. External overrides do not certify bundled Studio code. |
| Prisma mysql2 | Only observed lock consumer Prisma CLI; dynamic mysql2/promise executor path. App adapter/schema are PostgreSQL. Primary advisory still says patched None, whereas3.22.0 release explicitly disables mysql_clear_password by default. | Verify actual fixed behavior with synthetic no-connection fixture before scoped same-major override; keep Prisma/client pins. Do not infer remediation from scanner FixedVersion alone. |
| MJML html-minifier4 | email.templates.ts:208 supplies fixed MJML options with beautify:false and no minify. Installed mjml-core defaults minify:false at159; html-minifier.minify is behind if(minify) at416. No direct app minifier import found. The separately named minifyOutlookConditionnals helper is not this dependency. | No fixed version in retained scan; do not alias to a different async minifier. Consider explicit minify:false and real-template regression preserving this boundary, plus scoped exception decision if retained at release. Not a whole-renderer security claim. |

Primary sources: [Prometheus](https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-q7rr-3cgh-j5r3), [Jaeger](https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-45rx-2jwx-cxfr), [deepmerge](https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx), [Effect](https://github.com/Effect-TS/effect/security/advisories/GHSA-38f7-945m-qr2g), [mysql advisory](https://github.com/sidorares/node-mysql2/security/advisories/GHSA-3f6p-5ww8-9rcr), [mysql3.22 release](https://github.com/sidorares/node-mysql2/releases/tag/v3.22.0), [html-minifier issue](https://github.com/kangax/html-minifier/issues/1135). No exploit/stress requests executed. No live/env-secret inspection, DB operation, app/CLI/SDK startup, migration, push or deploy. WIP preserved.

Additional primary references: [js-yaml4.3.2](https://github.com/nodeca/js-yaml/releases/tag/4.3.2), [Lodash template imports advisory](https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc). This memo changes priority, not versions: both targets remain unimplemented. Avoid redoing this consumer discovery; proceed with bounded RED/GREEN tests, compatibility patches and aggregate gate. Remaining authenticated workflow/drain/data-preserving recovery/host gates are independent.

## Multipart and cookie dependency patches — 2026-09-27

Scoped same-major overrides: form-data2.5.5->2.5.6, form-data4.0.5->already-present4.0.6 and js-cookie3.0.5->3.0.8. Maintainer references: https://github.com/form-data/form-data/security/advisories/GHSA-hmw2-7cc7-3qxx (CVE-2026-12143; CR/LF/quote escaping); https://github.com/js-cookie/js-cookie/security/advisories/GHSA-qjx8-664m-686j (CVE-2026-46625; per-instance prototype cookie-attribute injection); https://github.com/js-cookie/js-cookie/releases/tag/v3.0.8 (restores ES5/engine compatibility accidentally restricted in3.0.7). No added install lifecycle. Lock contains official registry integrities; form-data2 legitimately moves hasown2.0.2->already-present2.0.4. Restored unrelated XLSX checksum after lock generation; frozen ignore-scripts install passed with no other lock drift.

Actual form-data chains: Google storage->retry-request->@types/request (type-only edge,2.x); supertest->superagent and @types/supertest->@types/superagent (4.x); Axios already4.0.6. Cookie chain MJML->core->js-beautify->js-cookie is installed but no distributed beautifier source usage or direct application import found; application sets beautify:false. Native frontend FormData is unrelated. This establishes package presence, not a customer-facing exploit or live incident cause.

New tests: scripts/form-data-dependency-security.test.cjs12 RED6compatPASS/6version-or-escapingFAIL ->GREEN12; scripts/cookie-dependency-security.test.cjs5 RED1compatPASS/4version-or-prototypeFAIL ->GREEN5. Only resolved FormData in-memory bodies and trusted UMD in a fake-document VM execute; no SDK/client/CLI/browser cookies or network submission. Fixtures cover Unicode/binary bytes, exact multipart lengths/escaping, cookie set/get/remove and set/withAttributes/remove safe-default preservation. Cookie sink is not browser policy/authentication acceptance.

Both new files wired into recurring explicit22-file aggregate and static guard. Targeted19/19 including CI contracts; full pnpm test:security:dependencies158/158 under external-network denial with loopback allowed; backend/frontendtsc before/after pass. Independent code/security reviews GO for scoped source. No image/rescan/remoteCI/live/DB/provider/migration/restart/push/deploy; last exact backend2b90e02d remains0C30H71M10L. WIP preserved. Next remaining groups: telemetry and Prisma configuration libraries (including major-change deepmerge-ts), plus no-fix html-minifier disposition; avoid major upgrades solely to lower counts. Grouped image verification and real authenticated/drain/recovery/operational gates remain.

## Recurring dependency regression gate — 2026-09-27

Root `pnpm test:security:dependencies` explicitly runs19 reviewed dependency/compatibility/runtime/packaging files plus the new `scripts/dependency-regression-ci.test.cjs` contract. `--test-concurrency=1` reduces tight-deadline CPU contention while retaining per-file process isolation. No globs or arbitrary script discovery/execution. CI Quality Gate's existing typecheck-and-build job invokes this command unconditionally after install and before Prisma Generate/migrations, with a five-minute timeout. Existing audit/deploy jobs, secrets, dependencies and lockfile unchanged.

Static contract RED2 missing-command/step failures ->GREEN2; checks exact20-file allowlist, absence of pre/post hooks, blocking step and ordering. Baseline19files139/139 and actual pnpm aggregate141/141 passed under macOS sandbox external-network denial with loopback permitted. Four suites use bounded local HTTP/gRPC servers; others use in-memory, mocks, temporary fixtures/workers or source checks. No normal application boot, mail delivery, provider request or database connection. Existing CI job already declares a disposable Postgres service and synthetic DATABASE_URL; the new step is DB-independent, not a DB-free job. Local Node24.18.0; workflow still selects22.23.3, so hosted Linux/Node22 execution remains unverified. YAML parse/step structure and independent code review passed.

Independent security review also GO for the scoped source change; no new credentials/permissions/publication or fail-open test behavior. Existing staging webhook error handling remains outside this change and is not certified by this gate.

This closes the local recurring-entrypoint implementation task, not remote CI acceptance: no push/workflow trigger, image build/rescan or production activity. Last verified backend image2b90e02d remains0C30H71M10L. Unrelated worker-shutdown/next-env WIP retained. Next: remaining telemetry/rendering/configuration risk decisions followed by grouped immutable-image build/rescan, then authenticated workflow/drain/forward-recovery and explicit operational gates. Do not count141 tests as whole-project security or production readiness.

## Scoped configuration dependency patch — 2026-09-27

Root override `defu@>=6.0.0 <6.1.5:6.1.5` replaces6.1.4 only. Maintainer advisory https://github.com/unjs/defu/security/advisories/GHSA-737v-mqg7-c878 and release https://github.com/unjs/defu/releases/tag/v6.1.5 identify the prototype-data default-override fix (CVE-2026-35209). Installed implementation uses object spread for defaults and own-key iteration. Registry integrity sha512-pwdBJxJuJXmqrLO6s0VBmfbRz+G7FUzkjldAsdi9Yrv86mPyzq0ll1o8+8gB4Gsr6GJHbK1Lh3ngllgTInDCjA== retained; no runtime dependencies/install lifecycle added. pnpm9 frozen ignore-scripts install passed after restoring the XLSX integrity that lock regeneration removed. Final lock diff contains only defu override/package/snapshot and three consumer edges.

Actual chain: Prisma7.4.2 -> @prisma/config7.4.2 -> c12 3.1.0 -> defu; c12 -> giget2.0.0/rc9 2.1.2 -> defu. Prisma's c12 loader uses a deepmerge merger, disables dotenv/rcFile/giget/extend/packageJson; c12 metadata still uses defu. No direct application consumer found; package presence is not evidence of a publicly reachable exploit. Real packages/database/prisma.config.js reads root .env, so tests never load it or execute loaders/CLI. Prisma/client version, schema, migrations and boot commands unchanged.

New scripts/defu-dependency-compatibility.test.cjs:9tests RED3compatPASS/6version-or-regressionFAIL -> GREEN9/9. Resolves actual three consumer edges, loads only defu, checks nullish/falsy/nested/array semantics and input preservation; bounded JSON prototype fixture preserves safe defaults, ordinary result prototype and unchanged global prototype. Combined defu/Prisma-packaging/boot/XLSX/glob/mail-semver/OTel:51/51 under network denial. Backendtsc before/after and frontendtsc after pass. Independent code/security source reviews GO. This is pure-library/packaging proof, not config-loader integration, native Linux image or authenticated workflow acceptance.

No new image/rescan; last verified2b90e02d remains0C30H71M10L, not reduced by arithmetic. No live/SSH/mail/DB/provider/migration/restart/push/deploy. Unrelated worker-shutdown/next-env WIP retained. Next: remaining telemetry/rendering/configuration advisory dispositions and recurring dependency-test entrypoint, then grouped immutable-image build/rescan; authenticated workflows, all-writer drain and data-preserving forward recovery gates remain required.

## Glob-family compatibility checkpoint — 2026-09-27

Four same-major root overrides: brace-expansion2.0.2->2.1.4 and5.0.2->5.0.9; minimatch9.0.1->already-present9.0.9; picomatch2.3.1->2.3.2. Preserve brace1, minimatch3/10, picomatch4 for separate disposition, not blanket dependency clearance. Selected minimatch9.0.9 rather than9.0.7 because9.0.9 retains brace2 and aligns an existing consumer;9.0.7 would introduce brace5 into that chain. Current Node22-compatible engine constraints retained. pnpm9 frozen ignore-scripts install passed; restored XLSX archive integrity removed during lock generation. Final lock diff is limited to these families and consumer edges, including Jest/Tailwind/build-tool consumers; not backend-only.

Maintainer evidence: https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-rgw5-rvv9-x895 (earlier bounds bypass, fixes2.1.4/5.0.9); https://github.com/isaacs/minimatch/security/advisories/GHSA-23c5-xmqv-rm74 and https://github.com/isaacs/minimatch/releases/tag/v9.0.9; https://github.com/micromatch/picomatch/security/advisories/GHSA-c2c7-rcm5-vvqj. No malicious stress fixtures executed. Latest image contains ten HIGH occurrences across these four versions, but do NOT subtract them without a new artifact scan.

Independent consumer analysis: MJML->js-beautify->editorconfig/minimatch9 and glob10; MJML CLI->chokidar->anymatch/readdirp->picomatch2; Sentry->@fastify/otel->minimatch10->brace5; additional Jest/micromatch consumers. App email renderer sets beautify:false, and backend is Express, not Fastify. Installed chains do not establish untrusted request-time pattern execution, nor waive findings universally.

New scripts/glob-dependency-compatibility.test.cjs:14tests RED9compatPASS/5versionFAIL ->GREEN14/14. Actual consumer resolutions, bounded brace alternatives/ranges/Turkish paths, globstar/extglob/negative matching, anymatch exclusions and inline MJML render with includes/beautify/minify disabled. Combined glob/XLSX/mail25/25 network-denied; mocked email service/processor23/23 before/after, frontend Vitest sanitizer4/4, backend/frontendtsc before/after pass. Jest uses documented langfuse-core NODE_PATH accommodation. No watcher/Sentry/normal-app/mail/DB startup. Independent code/security reviews GO for source only.

No image build/rescan, live access, migration, restart, push or deploy; WIP retained. Last verified image remains2b90e02d0C30H71M10L. Next group remains consumer-based risk work (telemetry/configuration/rendering); before release, wire new standalone dependency regression tests into a recurring test/CI entrypoint rather than relying solely on manual invocation. Authenticated data workflows/drain/forward recovery/operational gates remain open.

## Inbound-mail semver source patch — 2026-09-27

Scoped override utf7@1.0.2>semver:5.7.2 replaces its sole5.3.0 edge. Actual backend chain imap-simple5.1.0 ->imap0.8.19 ->utf7 1.0.2 unchanged. Other semver majors/consumers remain unchanged. Official maintainer release https://github.com/npm/node-semver/releases/tag/v5.7.2 and advisory https://github.com/advisories/GHSA-c2qf-rxjj-qqgw identify the5.7.2 fix for CVE-2022-25883, involving untrusted Range input. Inspected utf7 uses gte(process.version,'6.0.0') only; no customer-controlled range input or demonstrated live exploitation established. Do not describe this as fixing a proven mail-message exploit.

Registry5.7.2 has no runtime dependencies or install lifecycle script; SHA512cBznnQ9KjJqU67B52RMC65CMarK2600WFnbkcaiwWq3xy/5haFJlshgnpjovMVJ+Hff49d8GEn0b87C5pDQ10g== retained in lock. pnpm9 lock generation also removed XLSX integrity and changed editorconfig's semver7 edge/optional marker; restored both unrelated changes before frozen ignore-scripts install, which passed. Final lock diff only targeted override/package/snapshot/utf7 edge.

New scripts/mail-semver-compatibility.test.cjs RED3compatPASS/1versionFAIL ->GREEN4/4; resolves actual dependency chain without importing an IMAP connection, tests v-prefixed Node version branches, fixed ASCII/ampersand/RFC mailbox fixtures and bounded Turkish modifiedUTF7 roundtrips. Combined mail/OTel/XLSX14/14 network-denied. Existing mocked inbound service/attachments/review suites30/30 before and after (documented langfuse-core NODE_PATH accommodation), backendtsc passes. These are offline compatibility/mocked behavior tests, not mail-server/TLS end-to-end acceptance or ReDoS stress testing.

No mail settings/service code/schema change, live access, mailbox connection, DB operation, migration, restart, push or deploy. WIP preserved. No new image/rescan; latest exact2b90e02d result remains0C30H71M10L. This and OTel resource fix await next grouped artifact build. Next: review remaining consumer groups together, including telemetry dependencies and rendering/tool-only reachability, before choosing the next minimal compatible patch; do not rebuild per leaf or equate scan counts with release acceptance.

## Passive OTel resource compatibility fix — 2026-09-27

apps/backend/src/otel.ts now imports typed resourceFromAttributes from the existing installed resources2.6.0 instead of casting nonexistent runtime Resource to any and constructing it. No package/lock/environment/endpoint/instrumentation/signal-handler/startup-import changes. Source search still finds no otel preload in backend main/scripts/Dockerfile; live NODE_OPTIONS unknown. Do not activate this module during security patching: shared Sentry ownership and its existing SIGTERM process.exit callback need separate lifecycle assessment.

New scripts/otel-resource-compatibility.test.cjs executes transpiled actual source in a bounded VM with real backend-resolved resources/semantic-conventions only; SDK/exporter/auto-instrumentations/logger/process are mocked and require is allowlisted. Defaults/empty env, explicit env+endpoint and synchronous mocked start-error logging: RED3 failures Resource-is-not-a-constructor ->GREEN3/3. With boot contracts13/13 network-denied; backend TypeScript before/after passes. No real SDK start, provider request, host signal handler, AppModule or database. These tests validate compatibility, not end-to-end trace delivery or shutdown correctness. Graph report absent and GitNexus tools unavailable; direct import/startup search used for bounded impact review.

This source fix is newer than the verified2b90e02d image; no rebuild/rescan in this checkpoint. Last image remains0C30H71M10L. No live/DB/mail/CRM/migration/restart/push/deploy. Unrelated worker-shutdown/next-env work preserved. Next dependency decisions must remain consumer-scoped; do not equate installed parser/tool packages with externally reachable application paths or waive remaining findings from import searches alone.

## Combined locked-CLI backend image verified — 2026-09-27

Built exact committed2b90e02d6bd35f149525decbca0f83bdb2db08ad Linux/amd64, including accepted Undici/path-to-regexp fixes and workspace Prisma command. Curated415files/57 verified migrations/3338240bytes; source archive SHA256290efb216e4d1e4df3bbe990778258e217e290db9eca5c9d810a15ea7d6391a9. Uncommitted worker-shutdown/next-env work excluded and preserved. Build and updated smoke helpers independently reviewed. Builder compilation and runner client generation passed. Index5f369d7de7236abe20309e22e107033d8916bd47e06179994cd6fdc66a3d3936; config36f111fa5ef01b17cafd9f762008f0f214e1a04ad65539045dd169e730cd6be5.

Isolated entrypoint-node/network-none/no host mounts or ports/UID1000 smoke passed: Node22.23.3 ABI127; workspace Prisma7.4.2 exact symlink/realpath/root-owned nonwritable executable; absent global Prisma and removed package managers; generated client load; PG17 tools; native bcrypt synthetic checks and Sentry profiler binary load without profiling/SDK start; five immutable and four intended writable paths. Offline schema SQL exactly62tables/58815bytes/SHA256b466a58f9d8dff2215ec7d0de9aa5bf635403fa22dc69e7becf47b097f19afcb with dotenv advice quiet. No SQL execution, DB connection, normal backend boot or provider calls. ARM-host emulation is not VPS-native CPU acceptance. Smoke container cleanup verified.

Pinned Trivy0.72.0 offline/network-none/no Docker socket, same database UpdatedAt2026-09-26T06:33:51.318021692Z: **0 Critical /30 High /71 Medium /10 Low**, versus0/43/119/15. Report ImageID matches new config. No suppressions. HIGH difference: five old Undici findings, one path-to-regexp finding, seven duplicate global Prisma findings removed; no HIGH occurrences added. Removing duplicate packages is not remediation of advisories remaining in workspace copies. This is a same-DB comparison, not a claim of exhaustive/current-future advisory coverage or production readiness. Frontend was not rebuilt this turn.

Evidence outside Git: ../.aluplan-hotfix-evidence-20260926/unified-build-2b90e02d6bd3/{source.json,source.tar,build.log,smoke.json}; scan-unified-2b90e02d/{input/image.tar,output/report.json}. Image archive SHA256c3ee17f224c4cc84587c9166401afa0b959328ce69a9c14c75ee4087160057cd; report SHA256d732610b6d86f139a7044cb3890c9714332b1e5588d08c9908c34fcadacc64f6. Scanner container removed. Source/boot/runtime21/21 and dependency consumer29/29 repeated successfully in network-denied/loopback-only sandboxes respectively.

**Next:** prioritize remaining30HIGH by actual consumer/reachability and smallest compatible remedy; telemetry's latent Resource mismatch and coordinated dependency family remain open. Do not keep rebuilding for every leaf update. Authenticated sanitized-data workflows, writer drain, forward recovery and separately authorized production evidence still block release. No live access, restart, migration, push or deploy. This verified local artifact does not include unaccepted WIP or deferred team-assignment features.

## Locked Prisma CLI source candidate — 2026-09-27

Implemented the prior packaging proposal only in apps/backend/Dockerfile: removed the separate npm-global prisma7.4.2 install; after frozen production pnpm install, verify the workspace JS entry is executable and link /usr/local/bin/prisma directly to /app/packages/database/node_modules/prisma/build/index.js. Do not link the location-dependent pnpm .bin shell wrapper. Existing Prisma/client7.4.2 pins, lockfile, generate command, migrate-once/startup scripts, schema and migrations are unchanged. Package-manager removal and non-root runtime remain. This consolidates dependency control; it does not remediate advisories in the remaining dependency tree.

TDD scripts/prisma-cli-packaging.test.cjs: RED3pass/1expected-global-install-fail ->GREEN4/4. Combined with production-boot and Node runtime source contracts21/21 network-denied. Independent code review GO for source only. No application-code or frontend change; worker-shutdown/next-env WIP preserved.

Additional compatibility evidence uses the OLD exact cb8ecfd6 Linux/amd64 image822f96cc, Node22.23.3, UID1000, read-only/network-none/cap-drop/no-new-privileges, no host mounts/ports, synthetic unreachable DB URL only. Both existing global and workspace CLI versions7.4.2 ran offline migrate diff --from-empty --to-schema. First raw-output comparison failed because dotenv prints randomized advice, not because of demonstrated SQL drift. Retry with DOTENV_CONFIG_QUIET=true produced byte-identical SQL:62 CREATE TABLE statements,58815bytes,SHA256 b466a58f9d8dff2215ec7d0de9aa5bf635403fa22dc69e7becf47b097f19afcb. No SQL executed. Separate temporary direct-JS symlink executed --version as UID1000 successfully. All three disposable probe containers removed and absence checked. Tests ran under ARM-host emulation, not VPS native CPU.

**Next:** build the combined committed backend candidate and update exact-image smoke assumptions from global Prisma metadata to the locked workspace CLI identity/realpath, then verify generation/client load/offline diff/non-root permissions and rescan. This source candidate has NOT been built as a new image; prior image scan remains0C/43H. No arithmetic deduction for duplicate findings or newer source fixes. Actual migration rehearsal, authenticated cloned-data workflows, drain/recovery and separately approved operational gates remain mandatory. No live access, database connection, migration execution, provider calls, push or deploy.

## Telemetry and migration-tool disposition — 2026-09-27

Read-only follow-up at d0284ec1, not a dependency update or release acceptance. The previous cb8ecfd6 image report identifies exactly seven HIGH occurrences under usr/local/lib/node_modules/prisma: @hono/node-server1.19.9 (one), deepmerge-ts7.1.5 (one), effect3.18.4 (one), hono4.11.4 (two), lodash4.17.21 (one), mysql2 3.15.3 (one). These are distinct from workspace copies. Dockerfile separately installs npm-global prisma7.4.2; this dependency tree is outside pnpm-lock.yaml and root overrides. Pinning the CLI version alone does not lock its full transitive tree.

Do not delete Prisma or blindly force major deepmerge-ts8 to reduce scan counts. migrate-once.sh invokes the global prisma command; deploy.sh invokes migrate-once before node, so even a packaging-only CLI change affects the startup/migration path. The normal API does not thereby become a Prisma Studio server, but CLI presence and infrequent execution do not prove all findings unreachable. Existing production-boot-safety tests repeated network-denied:10/10, no database connection. This is source/guard proof, not a migration rehearsal.

Smallest next candidate to evaluate: preserve Prisma/client7.4.2 and the prisma command interface, but resolve the CLI from the already-retained, frozen workspace dependency tree rather than a second unlocked global installation. First prove command resolution, generation, version, offline schema diff and packaging/permissions under Linux/amd64; then handle compatible dependency fixes in that single tree. This is a proposal, NOT implemented or accepted. Removing a duplicate copy does not fix advisories in the remaining copy. If workspace execution differs, keep the existing toolchain until compatibility is established; no schema/migration changes as a shortcut.

Independent telemetry inspection confirms resources2.6.0 exports resourceFromAttributes, while Resource is undefined. otel.ts constructs new Resource outside its catch, a latent startup failure if imported. Source startup does not import/preload otel.ts or instrument.ts; production NODE_OPTIONS remains unknown. AppModule still references Sentry, so do not describe all telemetry as absent. Skill reference claims that these files load before AppModule conflict with inspected source; source wins. Do not activate telemetry as a side effect of security dependency work. No broad OTel override, telemetry removal or risk waiver was made.

No application/config edits, package install, image build, live access, DB/provider operation, restart, migration, push or deploy in this checkpoint. Preserved worker-shutdown/next-env work. Last verified backend image remains0C/43H; newer routing/Undici source fixes still await combined image validation. Release gates remain open.

## Routing dependency source checkpoint — 2026-09-26

Local commits `dd8ed7d7` (tests), `c30d80a4` (dependency). Scoped override `path-to-regexp@>=8.0.0 <8.4.2` ->8.4.2 changes only one package/version/integrity and four consumer edges: Nest core/platform-express11.1.14, Swagger11.2.6, Express5.2.1->router2.2.0. Separate6.3.0 remains unchanged. No application routes, guards, schema or startup changes. pnpm9 frozen ignore-scripts installation passed; existing XLSX checksum restored after lock generation and regression7/7 passed.

Official https://github.com/pillarjs/path-to-regexp/security/advisories/GHSA-j3q9-mxjg-w52f describes exponential expansion from sequential optional ROUTE PATTERNS, fixed8.4.0; this is not proof that arbitrary request URLs alone exploit this app. https://github.com/pillarjs/path-to-regexp/releases/tag/v8.4.1 corrects8.4.0 nonending-wildcard behavior; https://github.com/pillarjs/path-to-regexp/releases/tag/v8.4.2 adds trailing-backslash rejection and performance fixes. Selected8.4.2 within major8. Actual public branding and protected storage wildcard routes justify compatibility checks, not an assertion of demonstrated live exploitability.

New `scripts/path-routing-dependency-security.test.cjs`: RED6tests5compatPASS/1expectedold-versionFAIL ->GREEN6/6. Resolves all four actual consumer chains; parse/compile/match roundtrip for Turkish parameters, nonending multi-segment wildcard, isolated Express paths representative of tickets/reset/teams and branding/storage, query decoding, wrong paths/methods404 and tiny malformed percent encoding400. Loopback-only sandbox,1s request deadlines,4s async-test deadlines,2KiB response cap and socket cleanup. Synthetic handlers have no real auth/storage/controllers/AppModule/DB: this is routing compatibility, not complete Nest application/auth acceptance or a ReDoS stress test.

Combined routing/Undici/Axios/gRPC29/29; existing mocked auth-controller/ticket-controller/RBAC-guard42/42 before/after; backend TypeScript check passed before/after; XLSX7/7; local/trHTTP200 without restart. HostNode24.18, not rebuilt LinuxNode22 image proof. Independent code/security reviews GO and staged secret scans clean. Preserved worker-shutdown/next-env WIP. No live access, DB/mail/CRM operation, migration, push or deploy. Last verified image remains cb8ecfd6/0Critical43High; new source fixes have NOT yet been rescanned as an image.

Read-only prioritization also flagged telemetry coupling: sdk-node brings Prometheus/Jaeger, Sentry shares OTel packages, so avoid blanket OTel overrides. Repository main.ts/deploy startup did not reveal imports/preloads for existing instrument.ts/otel.ts; production NODE_OPTIONS is unknown, so do not claim telemetry inactive live. Latent source issue: otel.ts calls resources.Resource while installed resources2.6 exports resourceFromAttributes instead. Do not activate or rewrite telemetry during dependency patching. Review its actual startup/consumer compatibility separately before any telemetry upgrade; absence of a known importer is not blanket risk acceptance.

**Next:** remaining backend risk groups (telemetry and Prisma's separate CLI dependency tree need coordinated decisions), then one combined exact-image build/rescan for accepted source fixes. No repeated build solely for each leaf patch. Authenticated sanitized-data workflows, all-writer drain and data-preserving recovery/operational gates remain open.

## Undici consumer-compatible source checkpoint — 2026-09-26

Local checkpoints: `a707c0d6` (tests), `772fd395` (dependency/lock). Neither published nor deployed.

Scoped root override `undici@>=7.0.0 <7.30.0` ->7.30.0 replaces installed7.22.0 without application code, schema, environment or Node-base changes. Lock diff is the package integrity/version and two consumer edges (Cheerio1.2.0, JSDOM28.1.0). JSDOM also serves frontend Vitest; this is not backend-only impact. npm metadata retains Node>=20.18.1, no runtime dependencies or install script. pnpm9 frozen ignore-scripts install passed. Restored the existing measured XLSX archive integrity after lock generation dropped it; regression7/7 confirms it is retained.

Maintainer https://github.com/nodejs/undici/releases/tag/v7.29.1 lists security fixes beyond the scanner's7.29.0 floor; https://github.com/nodejs/undici/releases/tag/v7.30.0 adds diagnostics, decompression backpressure and rejected HTTP/2 WebSocket-stream fixes (Sep25). Selected7.30 within major7, not a major rewrite. Bounded source search finds actual Cheerio.load in rich-text sanitizer and crawlers, but no direct application Undici/JSDOM/fromURL use; this does not establish all advisories unreachable. Existing bare fetch calls use Node's bundled implementation, which this npm override does not replace. Previous exact-image Undici7.22 findings were5High/9Medium/2Low; **do not subtract these from the last43High image count without a new image scan**.

New `scripts/undici-dependency-security.test.cjs` (test commit a707c0d6) RED9tests8compatibilityPASS/1expectedold-versionFAIL ->GREEN9/9. Actual consumer resolutions, Turkish HTML/JSON, real backend rich-text sanitizer, inert JSDOM construction and fromURL private-handler compatibility, tiny gzip and bounded request cancellation pass. JSDOM uses internal Undici handler modules: import-only proof would be insufficient. Review caught its initial use of the default dispatcher; serial fixture now temporarily selects the owned bounded dispatcher and restores the previous one in finally even before DOM creation failure. Scripts/subresources remain disabled, window closed, sockets/Agent cleaned. The temporary global-dispatcher setting exists only in the isolated test process, not application code. Synthetic fixtures, loopback-only sandbox, no AppModule/DB/provider calls. Compatibility proof, not every-CVE exploit reproduction, TLS/proxy acceptance, production limits or overall coverage claim.

Verification: Undici/Axios/gRPC23/23 loopback-only; existing mocked crawler suites33/33 before and after; frontend JSDOM Vitest sanitizer4/4 before and after; backend/frontend TypeScript checks both pass before and after. Backend Jest retains documented local langfuse-core NODE_PATH accommodation; default setup remains unresolved. HostNode24.18, not new LinuxNode22 image verification. Local/trHTTP200, no restart. Independent code/security reviews GO, staged secret scans pass. Unrelated worker-shutdown/next-env WIP preserved. No live access, DB/mail/CRM operation, migration, push or deploy.

**Next:** keep changes narrowly grouped by real consumer risk; inspect remaining backend dependency groups before the next combined exact-image rebuild/rescan. Current verified image remains cb8ecfd6 with0C/43H; Undici source checkpoint is newer and not yet packaged/scan-accepted. Drain, authenticated sanitized-data workflows, recovery and separately approved operational gates remain open.

## Node 22 exact-image verification — 2026-09-26

Both Linux/amd64 images built successfully from exact commit `cb8ecfd62312a7b2020f6d6f1b2aa6c192c69ee0`, excluding all uncommitted worker-shutdown/next-env work. No application source or dependency change in this verification step. Curated backend input: 415 files, 57 checksum-verified migrations, 3338240 bytes, SHA256 `f3744032f0117c10f8d1a3465d654c0547f33b42cd3e0518f1b40c798b58794a`. Frontend: 225 files, 3809280 bytes, SHA256 `ba4485669551b0156a308111d42c049c2427cddfdf6ec953516d4bcf62908e65`. Build helpers independently reviewed; dependency downloads and local Docker writes only.

- Backend image/index `sha256:822f96cc7574c72bca2999115d17ce1e24e4afc514d81a6263f5e6fbfd2f627e`, config `sha256:507698ee4fbaff8a473dd40513279b9fcee7f12d2d2cd9b1078c462112680add`.
- Frontend image/index `sha256:d9f5957753e12fab9a50ca9dc32165721010a836b86976482ee58210abea02ed`, config `sha256:addd83ece9dc4a5e3b7fd51fcf2aae69b51e8f21df991d9a7b71a36005b4708e`.
- Pinned Trivy 0.72.0 offline/network-none with the same DB updated `2026-09-26T06:33:51.318021692Z`: backend **0 Critical / 43 High / 119 Medium / 15 Low**; frontend **0 Critical / 0 High / 0 Medium / 1 Low**. No suppressions. Backend previously 45 High: only removed HIGH records are grpc-js1.14.3 `CVE-2026-48068` and `CVE-2026-48069`; no added HIGH records. Remaining 43 occurrences represent 30 unique advisory IDs, including 7 occurrences in global Prisma. These are image findings, not verified live exposure or whole-platform clearance.

Backend isolated entrypoint-node proof passed as UID1000: actual Node22.23.3/ABI127, generated Prisma client load, Prisma7.4.2 CLI/version and offline schema diff (62 CREATE TABLE statements; no DB connection), PostgreSQL17 dump/restore versions, five root-owned nonwritable paths, four intended writable paths and package-manager removal. Database-workspace bcrypt6 synthetic cost4 positive/negative comparison and actual Sentry musl ABI127 native load/binding selection passed. Backend itself uses bcryptjs; this probe is native packaging compatibility, not a login-flow test. No Sentry SDK/profiling invocation or normal backend startup.

Frontend network-none proof passed as UID1001: Node22.23.3/ABI127, 221 permission paths, cache write, package-manager removal, OpenSSL3.5.8, Sharp0.35.4/libvips8.18.6/native-package1.3.3, reviewed Terser serializer hash/negative behavior. Container-loopback `/tr`, `/tr/login`, logo and image optimizer returned200; PNG/JPEG/WebP/AVIF synthetic transforms passed. Frontend uses `http://127.0.0.1:4000/api/v1`: **preview only, not production configuration**. Existing esbuild LOW unchanged; prior Linux-target disposition remains conditional. These amd64 tests ran under local ARM-host emulation, not native VPS CPU acceptance or authenticated customer API tests.

First backend smoke attempt failed at Docker create (old10s deadline); a late-created owned container appeared after the initial empty cleanup snapshot. It was verified by exact image/name/label as never started and removed. Helper now uses60s create/180s watchdog, bounded diagnostics and explicitly flags uncertain cleanup when create ID was never received. Independent review passed; retry passed and cleanup was verified. This diagnostic correction is outside Git, not an application change. Do not classify the initial failure as an app outage or overlook uncertain Docker operations.

Private evidence under `../.aluplan-hotfix-evidence-20260926/`: `unified-build-cb8ecfd62312/{source.json,source.tar,build.log,smoke.jsonl}`, `frontend-build-cb8ecfd62312/{source.json,source.tar,build.log,permissions.json,vendor.json,http.json}`, and `scan-{unified,frontend}-cb8ecfd6/{input/image.tar,output/report.json}`. Backend archive/report SHA256: `92d9ad33f4722ed7d5a75c745204ddd5664e65e0c404e6241fe5c4206f7aadf4` / `71a32d3d30f9f914d287a5a37a8747e2873f35b7b6f14a13dd0bf3facda71bc2`. Frontend archive/report: `043c3f5be99e4e00825328a1feaa4d641f5aab15b2d9ea0ece3d45268fbc8631` / `81e5493b6a70f18d504fd7947fa807cfeba2fd952bc569825618f2fc3dcb3fdc`. Report config identities matched builds. Source/boot contracts repeated26/26; local dev `/tr`200 without restart.

**Next:** disposition of remaining reachable backend findings, starting with the already identified npm Undici consumers and a narrow compatible patch/test decision; do not confuse npm Undici with Node's bundled fetch. Runtime developer-engine policy remains to reconcile. Drain/all-writer, sanitized-data authenticated workflows, data-preserving recovery and approved host/mail/CPU/credential checks remain release gates. No production access, database/mail/CRM operation, migration, push, deploy or live restart occurred. Local image proof is not a release GO.

## Supported Node base source checkpoint — 2026-09-26

Selected Node22.23.3 LTS as the smaller supported major transition20->22, retaining Alpine3.23 and productionlinux/amd64. Node24 also satisfies inspected engines but is not needed for this stabilization scope. Official https://nodejs.org/dist/index.json lists22.23.3 released2026-09-23; https://raw.githubusercontent.com/nodejs/Release/main/schedule.json sets Node22end2027-04-30 (Node24end2028-04-30). Schedule follow-up runtime review in2027Q1 before22EOL; this note creates no automation. No universal runtime/security compatibility claimed.

Commits ec682d49(tests)/5a9796d0(Dockerfiles) replace exactlyfour FROMlines with `node:22.23.3-alpine3.23@sha256:baf676f7d0e552f3231945c2f979055ca121bce128c152f7a34e6bd1728b1c5a`. Registryverifiedlinux/amd64manifest `sha256:489418a947387da1c5b4c0c5749c963da56ecaac0ced1da74c67db60e42f2b3a`. No application/dependency/lock/schema/entrypoint changes. CIversion alignment changes seven literals in five workflows(ci/backend-test/frontend-test/ai-eval/dr-drill) to22.23.3; jobs, permissions and commands unchanged. Semantic-release already22 and left unchanged. HostedCI not run/pushed. Root engines remains>=20 and hostNode24.18 unchanged; developer engine policy remains to reconcile after actual image acceptance, not proof of Node20 support.

Actualbase pulled by digest and probed read-only/network-none/nonrootUID1000/nohostmounts: Node22.23.3/Undici6.28.1/OpenSSL3.5.8/ABI127/x64/Alpine3.23.6. Yarnpath/opt/yarn-v1.22.22 and globalnpm/corepack match existing explicit removal paths. Separate network-none single-file read-only mount loads installed Sentry2.2.0 linux-x64-musl ABI127 binary and verifies two function exports; never invoked profiler or SDK/provider. Both probecontainersremoved. This proves base identity and one native binary load, NOT complete rebuilt application packaging/behavior.

Read-only installedengine/native review: Prisma7.4.2 andJSDOM28.1.0 require>=22.12 within22; Next15.5.24,Sharp0.35.4,bcrypt6,pdf-parse2.4.5 permit22. Sentryprofiling10.42.0 resolvesprofiler2.2.0 withABI127muslprebuild. ActualPrismaCLI/client,Sharpimageformat,bcrypt andSentrypackaging checks still required in rebuilt images. Retain globalPrisma migrationtool; never normal-boot backend during probes.

TDD: initialDockercontracts8PASS/3expectedoldpinFAIL ->11/11; newCIchecks2DockerPASS/5expectedoldCIversionFAIL ->7/7. Combinedfrontend/runtime/productionboot source contracts **26/26** network-denied on hostNode24.18. Sourceonly, notNode22fulltestacceptance. Local/trHTTP200; no devrestart. Independentcode/securityreviews andgitleaks gates. Existingworker-shutdown/next-envWIP preserved.

**Next:** exact committed-source frontend/backendLinuxamd64 builds with this base and priorgRPCfix, then image-native/runtime/permissions probes and scans. No new fullappimage or scan yet; backendlast0C45H119M15L andfrontendlast0C0H0M1L are OLD Node20artifactresults, not clearanceforNode22. Authenticatedclonedata/recovery/drain/host gates remain. No liveaccess,DB/mail/CRM writes,migrations,push ordeploy.

## gRPC patch and supported-runtime priority — 2026-09-26

Narrow source fix: root override `@grpc/grpc-js@>=1.14.0 <1.14.4` ->1.14.4. Actual DocumentAI->google-gax dependency resolves patched version; same runtime dependency ranges/proto-loader0.8.0/ordered-map unchanged. Lock updates only this package and existing GAX/OTel/optionalTerminus consumer contexts. pnpm lock regeneration again removed the explicit XLSX integrity; restored exact reviewed hash and repeated frozen ignore-scripts installation successfully. Do not accept a future lock change dropping that pin.

Official https://github.com/grpc/grpc-node/releases/tag/@grpc%2Fgrpc-js@1.14.4 and advisories https://github.com/grpc/grpc-node/security/advisories/GHSA-99f4-grh7-6pcq / https://github.com/grpc/grpc-node/security/advisories/GHSA-5375-pq7m-f5r2 identify client/server malformed-compressed-message crash and server-only malformed-stream crash. Sync DocumentAI method exists but no callers found in bounded app-source search; batch RPC is commented out. No application gRPC listener found. Package presence is NOT proof of active production exploitability, and no provider request was made.

New scripts/grpc-dependency-security.test.cjs: RED4compatPASS/1expectedversionFAIL -> GREEN5/5. Actual Google protos preserve Turkish bytes; real tiny loopback unary RPC preserves metadata, deadline and gzip response decoding. Google client/auth not instantiated; no AppModule/DB. Fixtures<256bytes, message limits1KiB, 1sRPC/4stest deadlines, explicit cleanup. Ordinary gzip is compatibility proof, not malicious decompression testing; node:test deadlines are not synchronous CPU containment. Combined gRPC/Axios14/14 loopback-only; XML/XLSX19/19 denied-network; backendtsc0before/after. Local/trHTTP200, no restart.

**Priority correction before more leaf-package batches:** both frontend/backend Dockerfiles pin Node20.20.2. Read-only/network-none exact-image Node probe confirms Node20.20.2, bundledUndici6.24.1, OpenSSL3.0.19, x64. Official https://nodejs.org/en/about/previous-releases lists Node20EOL and22/24LTS; production requires supported runtime acceptance, not only scanner counts. This is an EOL/support finding, not proof of a new exploit or compromise. npm Undici overrides do not replace Node's bundled fetch/OpenSSL. Next: choose a supported LTS exact base digest after checking Prisma/Next/native-addon engines; retain architecture/Alpine compatibility, test/build both images, and verify bundled versions. No Dockerfile change or new image in this checkpoint.

Remaining image report stays **0C/45H/119M/15L** (32uniqueHIGH IDs;7globalPrisma +38workspace occurrences). No arithmetic subtraction for this unbuilt patch. Separate npmUndici analysis:7.22.0 consumed by Cheerio1.2.0 and JSDOM28.1.0; app uses cheerio.load, no fromURL/JSDOM caller found in bounded search, not universal unreachability. Report lists fixes through7.29.0 but official https://github.com/nodejs/undici/releases/tag/v7.29.1 adds further security fixes; eventual scoped7.x target must consider that and https://github.com/nodejs/undici/releases/tag/v7.30.0. Defer selection until supported-runtime decision; avoid reinstall/rebuild per advisory. GlobalPrisma migration tools must not be removed to hide findings. Broader reachability disposition is incomplete; no other finding accepted/suppressed here.

No production access, DB/mail/CRM writes, migrations, app restart, push or deploy. Unrelated worker-shutdown/next-env WIP preserved. Existing authenticated/recovery/drain/host gates remain open.

## Combined Axios/XLSX exact backend image verified — 2026-09-26

Built committed source `91295fad7db670e0f8d242711b91ffc45d25524c`, not dirty working tree. Curated archive:415 regular files/57 checksum-verified migrations/3338240bytes, SHA256 `fac0b2a6d1b107ac11ad2863314542696bdaa80be344f0b1fd7329c5de4caa55`. Outside-Git helper revision/log-stream update independently reviewed GO. Local Docker context/builder enforced; production compilation, generated Prisma client and PostgreSQL17 CLI build guards passed. Linux/amd64 index `sha256:4f0648cbf73ffc10f039d542afdbfeadb762737a6e6928d88b5170f949affeb3`; config `sha256:6af5953d07ecca4a49f3837d1a27ed5f8c4be77a0f8515e1385d26f5e0541d77`.

Pinned Trivy0.72.0, network-none offline scan using the same DB updated2026-09-26T06:33:51.318021692Z: **0 Critical /45 High /119 Medium /15 Low**, previously0/58/137/16. Report config identity matches build. HIGH reduction:Axios10,XLSX2,form-data4.0.5 one occurrence. No suppressions. Remaining45HIGH still need scoped disposition; scanner counts are not exploitability judgments or whole-platform acceptance.

Read-only/network-none/cap-drop/no-new-privileges isolated `node` entrypoint (NOT application startup) independently loaded backend-resolved Axios1.20.0 and XLSX0.20.3 as UID1000/x64. XLSX entry SHA256 `fd159f1e2d694e12cd0709c1ec1b63c6e1f045d2c4ce857a346f9b965798cbfa` matched reviewed source. This is package identity/load proof, not complete runtime workflow acceptance. Host focused tests repeated:XML/XLSX19/19 network-denied and Axios9/9 loopback-only. Localdev/trHTTP200. Scanner and library-proof containers removed.

Private evidence: `../.aluplan-hotfix-evidence-20260926/unified-build-91295fad7db6/{source.json,source.tar,build.log}` and `../.aluplan-hotfix-evidence-20260926/scan-unified-91295fad/{input/image.tar,output/report.json}`. Image archive SHA256 `732e804d38fb3ace7f7e6d7317d24d8414cfeb0e6798a2b43fd787dc0afb79ef`; report SHA256 `6531b616e41e9fe6845bf69302d9354f3ce6d50424295da7d26627f95ffbacd0`.

Next: prioritize remaining backend HIGH dependencies by production reachability and compatible fix, starting with network-facing consumers; separately retain globalPrisma tree and parser resource-bound decisions. Do not conflate this with frontend rebuild or broad authenticated/backup/drain/host acceptance. No production access, DB/mail/CRM operations, migration, application restart, push or deploy. Worker-shutdown/next-env WIP preserved. Publication/deploy remain separately approval-gated.

## Official XLSX security source checkpoint — 2026-09-26

Commits3c610d86(test)/91295fad(dependency). Actual backend SheetJS0.18.5 replaced with official0.20.3 URL https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz in backend package.json. Maintainer https://docs.sheetjs.com/docs/getting-started/installation/nodejs/ identifies CDN as authoritative and npm distribution as stale; vendor advisories https://cdn.sheetjs.com/advisories/CVE-2023-30533 and https://cdn.sheetjs.com/advisories/CVE-2024-22363 state fixes0.19.3/0.20.2 respectively. Keep functionality; no parser rewrite, feature disablement, suppression, or service edit.

Independently streamed archive2409319bytes SHA512 `oLDq3jw7AcLqKWH2AhCpVTZl8mf6X2YReP+Neh0SJUzV/BdZYjth94tG5toiMB1PPrYtxOCfaoUCkvtuH+3AJA==`. pnpm9.15.4 initially emitted tarball URL without integrity: this was a review blocker. Added measured integrity explicitly, frozen ignore-scripts install preserved it and succeeded. Fresh isolated `/tmp/aluplan-xlsx-integrity.OH7InE/store` with one intentionally corrupted checksum character rejected the same official archive with ERR_PNPM_TARBALL_INTEGRITY/exit1; no shared-store pruning. New source contract test protects manifest URL and lock integrity against future regeneration loss. CDN availability remains a future-build dependency; vendoring is optional, not done. Hash pins acquired bytes, not independently reproducible source provenance.

Metadata0.20.3, Apache2.0 LICENSE retained, runtime dependencies empty, no install lifecycle scripts. Independently inspected installed xlsx.js SHA256 `fd159f1e2d694e12cd0709c1ec1b63c6e1f045d2c4ce857a346f9b965798cbfa`. Eight obsolete external dependency records removed from lock; parsing code is now bundled, not necessarily eliminated or universally vulnerability-free.

New scripts/xlsx-dependency-security.test.cjs loads only actual DocumentParserService via TypeScript transpilation with real dependencies, not AppModule/DB. RED6tests5compatpass/1versionfail; integrity contract added after checksum issue; final7/7. Independent <8KiB OOXML fixture proves Turkish/multiple sheets/numbers/booleans/cached formula value (not recalculation). XLSX and BIFF8 roundtrips <64KiB, existing10k output truncation and8byte malformedZIP->null pass. Same-library BIFF8 roundtrip is not all legacy Excel compatibility;3s test timeout cannot preempt synchronous parsing. No malicious bombs or all-CVE exploit reproduction. Network-denied XLSX+XML19/19, loopback-only Axios9/9, backend tsc0. Code/security reviewsGO and stagedgitleaks pass.

Next: one combined exact Linux/amd64 backend build from committed source including Axios and XLSX, provenance/packaging checks and scan. **No updated image or scan yet; last backend0C/58H remains unchanged evidence.** Post-parse truncation is NOT a CPU/memory/ZIP-bomb bound; residual parser resource controls and other reachable backend findings require disposition, not automatic acceptance. Data-preserving workflow/drain/recovery/operational gates remain. No production access, DB/provider/mail/CRM changes, migration, restart, push or deploy; unrelated worker/next-env WIP preserved.

## Axios source checkpoint with consumer compatibility — 2026-09-26

Commits `fc754e7a` (tests), `51b480a9` (dependency). Scoped override `axios@>=1.0.0 <1.20.0` ->1.20.0; actual backend and Nest Axios wrapper resolve this release. Initial1.16.0 idea rejected after current maintainer review: https://github.com/axios/axios/security/advisories/GHSA-mghh-pgcx-3jjj describes conditional Node proxy/NO_PROXY/redirect ReDoS fixed1.20.0; official release https://github.com/axios/axios/releases/tag/v1.20.0 documents additional runtime-option hardening. Proxy environment on live was not inspected; no exploitability claim. No blanket Axios safety assertion.

pnpm9.15.4 lock-only then frozen install with lifecycle scripts disabled. Dependency closure changes: Axios1.20.0, follow-redirects1.16.0, form-data4.0.6, proxy-from-env2.1.0, existing https-proxy-agent5.0.1 edge and hasown2.0.4. Shared es-set-tostringtag2.1.0 also now resolves hasown2.0.4: this affects shared dependency resolution, not literally Axios callers alone. Independent security/code review found no blocking issue or unrelated bulk upgrade.

New scripts/axios-dependency-security.test.cjs: original8 tests RED7compatibilitypass/1expectedversionfail on1.13.5; successful redirect/binary test added after install; final **9/9** pass twice on1.20.0. Actual backend package, HTTP adapter, ephemeral127.0.0.1 server; sandbox denies non-loopback network, proxyfalse,4s test deadlines,1s requests,1KiB boundaries/1byte excess,100ms timeout and finally socket cleanup. Covers OAuth URLSearchParams with Turkish/special characters, webhook JSON/header, OData/query/annotations, blocked CRM redirect, allowed crawler redirect/arraybuffer, body/response limits and cancellation. These limits are fixture configuration, NOT newly applied app-wide limits. No direct advisory exploit reproduction, TLS/proxy-environment or real CRM/provider acceptance.

Five mocked service suites (Dynamics adapter, webhook, three crawlers) passed **53/53 before and after** with all network denied. Initial default runner failed shared setup because langfuse-core is not hoisted; documented existing accommodation sets NODE_PATH explicitly to THIS checkout's installed `node_modules/.pnpm/langfuse-core@3.38.6/node_modules`. Default setup remains unfixed; no test bypass or borrowed checkout. Backend tsc passed before/after; XML/storage/DOCX regression12/12 passed after closure update; localdev/trHTTP200. HostNode24.18.0, not LinuxNode20 image proof. Staged gitleaks passed. No application-service edits, schema/env changes, DB/provider/live operations, dev restart, push or deploy; worker/next-env WIP preserved.

**Exact backend image rebuild/rescan pending.** Last verified backend count remains0Critical/58High; do not subtract assumed Axios fixes. Next bounded step is XLSX trusted-distribution/update versus explicitly approved feature containment decision, then combine accepted dependency source changes into one exact backend image verification. Remaining source-level outbound trust/drain/customer/data-recovery/operational gates stay open. Frontend previous exact scan remains0C/0H/0M/1L, not a full-platform claim.

## Release-blocker triage after frontend image verification — 2026-09-26

Read-only continuation, not a new scan or release approval. Maintainer advisory https://github.com/evanw/esbuild/security/advisories/GHSA-g7r4-m6w7-qqqr explicitly limits the remaining esbuild0.27.3 file-read issue to the Windows development server with `servedir`. Rechecked exact frontend image: Linux/amd64, CMD `node apps/frontend/server.js`; no esbuild/servedir references found in frontend source/config/package or root package script search. The Windows precondition is absent from this verified Linux preview. Classify this specific LOW as **not a blocker for this Linux standalone target**, keep it visible (no ignore or package change), revisit before Windows serving, esbuild serve exposure, changed target/entrypoint or changed advisory. This is not a blanket esbuild safety claim or verification of current live configuration.

Re-read saved backend e992c231 scan: 58 HIGH occurrences correspond to 44 unique advisory IDs; 7 occurrences are under global Prisma and 51 under workspace packages. Neither category alone proves reachability or safety. This is the historical exact-image result, not a current-source rescan. Actual local backend resolution still returns Axios1.13.5 and XLSX0.18.5. Axios has10HIGH occurrences in that image and real CRM/webhook/crawler consumers. XLSX has2HIGH occurrences and actual inline/stored AI-attachment consumers in AiQueryService/AiCopilotService through DocumentParserService. The parser's10,000-character output truncation occurs AFTER xlsx.read/sheet conversion, so it is not a parsing resource bound. No malicious file/exploit or live request was executed.

Priority: minimal compatible Axios remediation with actual request/redirect/limit/CRM contract tests; separate trusted XLSX distribution/update or narrowly approved containment decision (do not silently disable customer document support). Remaining backend findings need consumer-aware decisions, including global Prisma's separate dependency tree: root overrides alone do not patch globally installed CLI dependencies. Do not repeat frontend rebuilds solely to drive an inapplicable LOW to zero.

Still-open release categories: (1) backend dependency/runtime risk disposition and final exact image; (2) pending worker stop/admission/drain ordering, including disconnected work before DB/Redis shutdown; (3) isolated sanitized-data authenticated customer/staff/team/ticket/reset and attachment/recovery acceptance; (4) separately approved live host/CPU/credentials/mail compatibility and release-window backup/write-quiescence checks. Prior frontend packaging blockers are closed by the exact-image proof below, but final production API build configuration is still separate. Working-tree WorkerShutdownService wiring remains uncommitted and was NOT accepted or edited in this continuation. No production access, credentials, DB/mail/CRM operation, app restart, dependency install, push or deploy.

## Terser fix verified in exact frontend image — 2026-09-26

Exact source commit `d66bf7d6063889a505f8b9825f3671df7239943c` built successfully for Linux/amd64. Curated archive: 225 files, 3809280 bytes, SHA256 `0808215c9bb27a48758e363d84a0b23994710c61b1ab77b5e470766def819b19`. Frozen install, Prisma generation (no DB connection/migration), shared-schema build, separate frontend TypeScript gate and Next production build passed. Unrelated working-tree changes were excluded. Build uses loopback API URL: **preview-only, not production-configured**. Build dependency/font downloads and the Next telemetry notice remain distinct from network-denied runtime verification.

Image/index `sha256:4d2d0c80e6b89034d132f982919e874788b3af6802031cdd8c8d32711f0efc9a`; config `sha256:2365a67d6fda152c9c56cb06cbe18c596a5aeb7d6bd4943fba13ecfe4733479e`. Network-none smoke containers had no mounts or published ports and used UID1001, dropped capabilities and resource limits. Permission checks passed for 221 paths plus cache writes; this is not a whole-image immutability proof. Package-manager absence, OS security floor, Sharp/native closure and HTTP `/tr`, `/tr/login`, PNG and image optimizer passed; PNG/JPEG/WebP/AVIF transforms passed. Container exit code zero AND parsed success were required. Host network-denied focused tests again passed **34/34**.

Initial vendor helper failed because standalone tracing omits `@sentry/nextjs/package.json`; do not treat that diagnostic failure as an application outage. Corrected helper enumerates named regular-file serializer copies under `/app` without following symlinks, requires exactly one, and checks adjacent Terser5.5.0 identity, root ownership/nonwritability, exact SHA256 `27a2480018708bf3b3e6f71798bc50fde9d12fce8fb35350c4d7ae81a7283a91`, spoofed-RegExp sanitization and invalid-Date rejection. All passed in the image. This verifies the named vendored file, not arbitrary embedded Next compiled code. Independent helper review approved; no application code changes needed.

Pinned offline Trivy0.72.0 with the same DB updated `2026-09-26T06:33:51.318021692Z`: **0 Critical / 0 High / 0 Medium / 1 Low**, previously0/1/1/1. No findings suppressed. Remaining `esbuild@0.27.3`, `GHSA-g7r4-m6w7-qqqr`, scanner fixed version0.28.1; no reachability or acceptability conclusion yet. Vendor hash proof prevents conflating external-package disappearance with remediation. Report config identity matches the build output.

Private local evidence outside Git: `../.aluplan-hotfix-evidence-20260926/frontend-build-d66bf7d60638/{source.json,source.tar,build.log,permissions.json,vendor.json,http.json}` and `../.aluplan-hotfix-evidence-20260926/scan-frontend-d66bf7d6/{input/image.tar,output/report.json}`. Archive SHA256 `cb233ed054f2428b6fc00ed114f0da2919fdc4337ab3190bc7a858d9508eb694`; report SHA256 `ac5d48a0a523ac93c7df1caf7be47fdbfdaee0550cd74c3e028b6ab9d8406afc`. All containers created for this verification were removed; unrelated containers preserved. Existing local `/tr` HTTP200, no dev-server restart.

Next: narrowly classify remaining esbuild LOW and reconcile separate backend/release gates before choosing another patch. Do not resume broad hardening or claim whole-platform readiness from frontend counts. Backend acceptance, authenticated customer/team/ticket workflows, data-preserving recovery and VPS Sharp CPU compatibility remain separate gates. No production access, DB/mail/CRM operations, migration, push or deploy. Preserve worker-shutdown/next-env WIP and explicit publication/deploy approvals.

## Terser source checkpoint with verified bundled serializer — 2026-09-26

Local commits85983543(test),d66bf7d6063889a505f8b9825f3671df7239943c(dependency). Chosen compatible parent update terser-webpack-plugin5.3.16->5.5.0 within major5, not global serializer major override. Range-scoped override updates both existing webpack contexts without changing webpack versions; lock removes unused external serialize-javascript6.0.2/randombytes2.1.0 and nothing unrelated. New plugin carries serializer internally: scanner absence must NOT be confused with removing all serialization code.

Independent provenance GO: https://github.com/webpack/terser-webpack-plugin/blob/v5.5.0/src/serialize-javascript.js ends byte-exactly with https://github.com/yahoo/serialize-javascript/blob/v7.0.5/index.js, preceded only documented crypto fallback shim from tagged copy script. Independently streamed published npm5.5.0 artifact and local installed dist/serialize-javascript.js SHA256 both **27a2480018708bf3b3e6f71798bc50fde9d12fce8fb35350c4d7ae81a7283a91**. Tagged source and installed Babel-formatted distribution AST match after stripping formatting/location/comments and only added strict directive. Package version/devDependency alone was not accepted as provenance. Identity proof is not universal vulnerability clearance; carry vendor hash verification into final exact image.

New scripts/minifier-dependency.test.cjs uses actual frontend->Sentry->webpack->Terser chain. Initial RED1versionfail/2compatpass; final4/4 after update. Actual production-mode synthetic webpack builds parallelfalse and parallel1 preserve function comment option, RegExp keep_fnames, source maps, exported42 and function name. Reviewer confirmed fresh uncached asset +availablecores1 selects jest-worker serialization path. Additional actual bundled-serializer test sanitizes spoofed RegExp.flags and rejects invalid Date.toISOString; serialized attack-like output is never evaluated. NodeVM executes ONLY trusted synthetic bundle and is explicitly NOT a security sandbox. node:test timeout is not a hard worker/process kill; use an outer deadline for future execution. Temp dirs owned/cleaned; compiler.close in finally. Combined network-denied34/34, frontendtsc0, independent security/code/provenance reviewsGO and stagedgitleaks passed. Host install pnpm9.15.4 frozen ignore-scripts.

**Updated image build/rescan pending.** Last verified frontend image4c4c5540 still **0Critical/1High/1Medium/1Low**; do not claim0HIGH yet. Next step exact committed-source Linux image build, verify actual vendored hash inside image, permission/HTTP checks and sameDB scan; preserve visibility of vendored code even if package-based scanner drops findings. Existing Next compiled copies/backend acceptance/Sharp VPSCPU gate remain separate. Localdev/trHTTP200; no dev restart, production access, DB/mail/CRM operations, migration,push/deploy. Unrelated WIP preserved.

## Combined frontend CSS/browser patch verified in exact image — 2026-09-26

Local commits fe347318 (tests),4c4c554096f0d39fed456cb84a32924b29e1ea69 (Browserslist dependency). Builds include prior PostCSS8.5.28/nanoid3.3.19 checkpoint. Browserslist4.28.1->4.28.7 scoped override; official https://github.com/browserslist/browserslist/releases/tag/4.28.7 confirms memory/prototype fixes. Required data closure also updates baseline-browser-mapping2.11.26,caniuse-lite1.0.30001812,electron-to-chromium1.5.439,node-releases2.0.57: reviewer verified prior versions fall below new package minimums. Existing Next/Autoprefixer caniuse edge retained, no blanket data upgrade. Default query output changes with updated data (confirmed locally); fixed-target tests are not full old-browser visual compatibility proof. Next compiled copies remain separate.

Actual Autoprefixer and webpack resolve the same reviewed package. New tests RED1versionfail/2compatpass -> GREEN3/3; combined network-denied tests30/30, frontendtsc0, code/security reviewsGO, stagedgitleaks passed. Invalid-query tests are compatibility checks, not reproduction of both full advisory exploits. Host installs pnpm9.15.4/frozen/ignore-scripts. No unrelated source changes.

Exact source225files/3809280bytes SHA256c1644231bb24eaa6f1cb428b1578c02a81ad0cf1ed2b83f00d19d3c7b6f0b78c builtlinux/amd64 successfully including separate typecheck. Image/index sha256:5bfd291fdd5bd3f9221d4a10232b3e0ac414a9604874c816a4815b0e52ec18f5; config sha256:91237da65676c3be3a388087f7543891388d16ed51ac0ed56c77c5894c1ca920. LoopbackAPI remains preview-only, NOT production-configured. Network-none/no mounts/no published ports: UID1001,221immutablepathchecks/cachewrite/managerabsence/OSfloor/Sharpnative checks passed; standalone /tr,/tr/login,PNG,imageoptimizer all200; PNG/JPEG/WebP/AVIF transforms passed. Not authenticated customer/API/DB or browser visual acceptance.

Pinned offlineTrivy0.72.0 with same2026-09-26T06:33:51Z DB: **0Critical/1High/1Medium/1Low**, prior exactimage0/8/4/1. Browserslist/PostCSS/nanoid findings absent, no ignores. Remaining HIGH GHSA-5c6j-r48x-rmvq and MEDIUM CVE-2026-34043 affect serialize-javascript6.0.2; LOW GHSA-g7r4-m6w7-qqqr affects esbuild. Report config matches exact build. Evidence outsideGit frontend-build-4c4c554096f0/{source.json,build.log,permissions.json,http.json}, scan-frontend-4c4c5540/{input/image.tar,output/report.json}. ImagearchiveSHA25638c192017add41b243cebf59045c6f422d75b356c1c019a09ea67c3fdae1b43e; reportSHA256cc4b7f7ee17ca104e8530c8f2f3119fd94e35b4d806e7fc45a41deb5002b6d1f.

Next bounded decision: Sentry->webpack5.104.1->terser-webpack-plugin5.3.16->serialize-javascript6.0.2. Terser requires^6.0.2; patched major7 is outside declared range. It serializes minimizer options/cache/worker transfer and worker uses new Function: build-time executable reconstruction demonstrated, customer HTTP input path NOT demonstrated. Verify current upstream Terser release supporting patched serializer first; otherwise consumer-scoped override requires actual minification tests with/without worker, benignfunction/RegExp options and source maps. Do not blindly force global major upgrade. Backend findings/acceptance and Sharp VPSCPU gate remain separate; frontend result is NOT deployGO. All owned containers removed; localdev/tr200; no production access, DB/mail/CRM/migration/push/deploy/restart. Existing WIP untouched.

## PostCSS/nanoid source patch verified; image refresh pending — 2026-09-26

Local checkpoints40d4714d (tests), d9dff4a4ea1979946d2c975926a33c9084316979 (dependency). Single range-scoped PostCSS8 override to8.5.28 replaces Next8.4.31 and frontend8.5.6. New PostCSS requires nanoid^3.3.18; frozen lock resolves3.3.19 naturally. Removed the initially proposed redundant nanoid override rather than downgrading or maintaining an unnecessary rule. Lock review confirmed only these two package versions plus PostCSS peer/edge contexts changed; Next/Tailwind/Autoprefixer/Vite versions unchanged. Host pnpm9.15.4 lock-only and frozen installs used ignore-scripts. No application/config/schema/env changes beyond package override/lock.

Official primary sources verified: https://github.com/postcss/postcss/releases (8.5.26 adds symlink path protection;8.5.28 fixes type regression), https://raw.githubusercontent.com/postcss/postcss/8.5.28/lib/previous-map.js (default adjacent-map boundary, realpath protection, inline/explicit-map handling), https://github.com/ai/nanoid/releases/tag/3.3.19 (huge-ID fix), and PostCSS8.5.28 package manifest (^3.3.18). No assertion that every advisory has an exploit regression here.

New scripts/css-dependency-security.test.cjs follows actual Next PostCSS resolver and lazyPostCSS with real project plugin config. Initial RED3fail/3pass: version, synthetic parent-map traversal loaded, bounded negative-size nanoid child terminated under32MB heap cap (not an application crash). Initial Tailwind empty-config warning revealed root cwd; corrected test process cwd to frontend before final proof, retaining real project config. GREEN6/6: Tailwind @apply, Autoprefixer with fixed target, Turkish content/custom property preservation, allowed adjacent/inline/explicit source maps, rejection of parent/symlink escapes, fixed/default ID lengths and bounded negative-size behavior. Child hard timeout1s/output16KiB; synthetic temp files cleaned. Combined network-denied security/build tests27/27; frontend full tsc returned without errors. Independent code/security review GO and staged gitleaks passed. No claim of whole-project80% coverage or all-advisory exploit testing.

Exact updated image NOT rebuilt/scanned in this step. Last verified image remains6e278405: **0Critical/8High/4Medium/1Low**. Do not subtract PostCSS/nanoid findings until a new committed-source image scan proves it. Next narrow candidate: browserslist same-major patch after upstream/consumer review; then combine pending source fixes in one exact Linux image build/scan to avoid repeated full rebuild cost. serialize-javascript major-version decision and Next vendored-copy caveat remain. Existing dev /trHTTP200 and in-app tab contains Turkish landing hero, login and integration controls; this is existing dev-session availability, NOT proof the process reloaded new dependencies. No dev restart, production access, customer data/DB/mail/CRM mutation, migration, push or deploy. Unrelated worker/next-env WIP preserved.

## Fast-uri patch verified in exact frontend preview — 2026-09-26

Local commits: 4d313522 (regression tests), 6e27840507193df8850ea88b48b2400e96a6bf11 (dependency). Bounded override `fast-uri@>=3.0.0 <3.1.8` -> `3.1.8`; lock diff changes only this package/integrity and both AJV8.17.1/8.18.0 dependency edges. No unrelated upgrades. Actual frontend chain: Sentry -> webpack5.104.1 -> schema-utils4.3.3 -> AJV8.18.0 -> fast-uri. Schema resolution is demonstrated; attacker-controlled SSRF reachability is NOT demonstrated.

Official upstream verification selected3.1.8 instead of scan floor3.1.6: https://github.com/fastify/fast-uri/releases/tag/v3.1.7 addresses additional high-severity issues; https://github.com/fastify/fast-uri/security/advisories/GHSA-hrr3-gc8f-f4qj fixes encoded uppercase host normalization in3.1.8. Tests reproduce old behavior (RED2fail/3pass), then GREEN5/5 using actual consumer/resolver identity, absolute/relative schema refs, escaped JSON pointer, valid/invalid options and unresolved-ref rejection without remote loader. Combined offline frontend security/build tests21/21; full frontend tsc exit0. Independent code/security reviews approved scoped changes; staged gitleaks passed. Host install used pnpm9.15.4, frozen lock, lifecycle scripts disabled.

Exact committed-source archive225files/3809280bytes SHA256bfcf94a608c965f85f0ebb620ebf39d43c474eb2e760d6c708973590e5484e96 built successfully for linux/amd64 with separate typecheck. Image/index sha256:2f2391623885e22995ed7c6b372da2dc45d0ca897115fd351e2d63a77e025d33; config sha256:2f3159e2d37f1d2247d91a8fcc140e9fa27fa8bf4bfaf90e9d2a13414329499e. Loopback API remains: preview-only, not production-configured. Build downloads/lifecycle scripts and Next telemetry notice remain; runtime proof used network-none, no mounts or published ports.

Permission smoke passed UID1001/x64,221 root-owned/non-writable checks, cache write, manager absence, patched OS library floor and Sharp native checks. Separate standalone HTTP /tr,/tr/login,staticPNG and optimizer all200; real Next PNG/JPEG/WebP/AVIF transformations passed. Not customer auth/API/DB/browser acceptance. Existing Sharp VPS x86-64-v2 CPU compatibility gate remains unverified.

Same pinned Trivy0.72.0/advisoryDB2026-09-26T06:33:51Z: **0Critical/8High/4Medium/1Low**, previously0/15/4/1. All7 fast-uri findings absent; report config identity matches exact image. No suppression. Evidence outsideGit: frontend-build-6e2784050719/{source.json,build.log,permissions.json,http.json}, scan-frontend-6e278405/{input/image.tar,output/report.json}. Image archive SHA256926d17db8f845cb546b03b33f6cabf7e54bbcd95e968eacdfddf2b7ae7e6a588; report SHA256f1652dcc42d6aa4c240d2c715f085b6beb439d8be5a70ab91aff2000b95acd54.

Remaining frontendHIGH8: browserslist2,nanoid3,postcss2,serialize-javascript1. Read-only consumer triage points to build-oriented paths; no runtime exploit demonstrated. Next standalone PostCSS uses standalone nanoid/non-secure with constant size6; investigate compatible PostCSS+nanoid patch next, verify official floors first. serialize-javascript needs separate major-version compatibility decision. Next versionless compiled copies remain a distinct risk and are not patched by standalone overrides. Backend findings/acceptance remain separate; no production GO from these counts. All owned containers removed; local dev /tr still200. No production access, DB/mail/CRM operations, migration, push/deploy or dev-server restart; existing worker/next-env WIP untouched.

## Sharp update and exact Linux preview proof — 2026-09-26

Commits e919131a(test),f1ea333227956eedc085b252533d0d4193508c96(dependency): range-scoped sharp override0.34.x->0.35.4, native/libvips closure1.3.3. pnpm9.15.4 lock-only then frozen install with lifecycle scripts disabled on host. Independent review found no unrelated dependency churn; Next/Sentry/next-intl versions unchanged, peer context gains existing @types/node because Sharp now declares it. Node>=20.9 supported by pinned20.20.2.

Official sources verified: https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c (patched>=0.35.4), https://github.com/lovell/sharp/security/advisories/GHSA-f88m-g3jw-g9cj (patched>=0.35.0), https://github.com/lovell/sharp-libvips/releases/tag/v1.3.3 (libheif1.23.2/libvips8.18.6). These do not prove universal image safety or VPS CPU compatibility.

New actual Next->Sharp offline tests: corrected AVIF inspection to Next getImageSize/detectContentType because Next deliberately blocks Sharp's HEIF loader; never unblocked loaders. RED6/1 then GREEN7/7; combined Docker contracts16/16. PNG/JPEG/WebP/AVIF dimensions/type, benign malformed rejection and pixel-limit rejection passed. Host native versions sharp0.35.4/vips8.18.6/heif1.23.2; frontend full tsc exited0. All tests network denied.

Exact committed-source archive225files/3809280bytes SHA256964408315375ebd6b2add2eacd4d804bbc6d37fc5f2d6328a870e20767f2b10d builtamd64 successfully (typecheck/buildpassed). Preview image/index sha256:c929ccc963650b351650a6fd71facc78a2d619b181fad4bebbc507eb3c7a2b35; config sha256:d1b733f2f7cb64072859eb2d1d3d842b8813c43624182debb634581976554604. LoopbackAPI; not production configured.

Initial Linux permission smoke FAILED its assumed sharp.versions.heif equality; not an app crash. Investigation proved standalone omits native versions.json and libvips is nested under the native addon, not directly accessible from Sharp's require context. Retained app packaging and corrected diagnostic to verify actual loaded musl-x64 addon0.35.4, nested libvips package1.3.3, expected nativebinary path and native-reported vips8.18.6. Runtime heif metadata remains unavailable: release metadata lists1.23.2, not a direct runtime measurement. Independent security review approved evidence-based replacement, no functional restrictions weakened. Final permission smoke passed UID1001/221immutablechecks/cachewrite/managerabsence/OSfloor/TLScontext. Separate network-none HTTP /tr,/tr/login,PNG,optimizer all200, and actualNext directPNG/JPEG/WebP/AVIF transformations passed on Linux. No customer API/auth/DB/browser acceptance.

Same advisoryDB offline exact-image Trivy **0Critical/15High/4Medium/1Low**, previously0/17/4/1; Sharp findings absent. No suppressions. RemainingappHIGH15 require focused triage; Next's versionless compiled copies remain separate caveat. Before live release verify VPS CPU meets Sharp's x86-64-v2 requirement using separately approved read-only evidence; local emulator success is not VPS compatibility. No production action authorized.

Evidence outsideGit frontend-build-f1ea33322795/{source.json,build.log,permissions.json,http.json}; scan-frontend-f1ea3332/{input/image.tar,output/report.json}. Archive SHA256b895d0cce045097ab9715670ab710b1bf59c1da4090b189894eaf9c861a6df61; report SHA2565bf734e3235c07da93511d730af33c3a4489aee443af615bb7329d0f5b68b70d. All owned containers removed including failed smoke/diagnostics. Local devHTTP200. No production access, DB changes, migrations, push/deploy or dev restart. WIP preserved.

## Frontend OS patch verified in exact image — 2026-09-26

Local commits070b4e14(test),57022899d32f645d19560020b8a77641b1466012(Docker) require runner libcrypto3/libssl3>=3.5.8-r0 via targeted apk add --upgrade with existing curl. No broad OS upgrade, repo/base/app/lock/schema change. RED8/1 -> GREEN9/9, independent code/security reviews approved. Actual resolver installed both3.5.8-r0 and additionally upgraded ca-certificates-bundle20260413-r0->20260909-r0. Minimum security floor is not an exact reproducibility pin.

Exact source225files/3809280bytes archive SHA256f7354091e45b5424f67219d4aa2167bb5f0c918389f527c80fe9bc68d3baa616. Build/typecheck succeeded. amd64 image/index sha256:5fd6e658f5f71a0a4f907cf3bf5284c6dbcb90ba06cfbf2499310a288b9ce7c7; config sha256:1519a0592ad04776f54f9fa939610d41d24d56fc2c17ad358373a1b7b2b503de. Preview loopback API remains, not production-configured.

Network-none runtime checks passed: UID1001,221 immutable path checks,cachewrite,package-manager absence, installed2library versions>=floor, curl8.22.0 loadingOpenSSL3.5.8 and Node TLS context creation. Node's bundled OpenSSL remains3.0.19; no claim that APK update fixes all Node TLS risks. Standalone /tr,/tr/login,PNG andimageoptimizer all200 with expected MIME/redirect rejection. Not customer auth/API/DB/browser acceptance.

Same advisoryDB offline Trivy exact-image report **0Critical/17High/4Medium/1Low** versus0/21/18/33; Alpine section now0acrossallfour severities in this report. Remaining17HIGH are application dependency findings, not resolved by OS patch. No filters/ignores added. Report config matches build. Full-image security assurance and deploy GO still NOT established.

Read-only next-step triage: all17 reported appHIGH paths are standalone .pnpm packages; sharp0.34.5 has2 and is directly used by Next image optimizer. Prioritize narrowly scoped sharp/native closure compatibility next; reported fixed floor0.35.4 needs upstream verification before update. Other groups fast-uri7,browserslist2,nanoid3,postcss2,serialize-javascript1. Next also carries versionless compiled browserslist/nanoid copies; clearing standalone findings cannot prove vendored copies safe. Do not apply blind mass overrides.

Evidence outsideGit frontend-build-57022899d32f/{source.json,build.log,permissions.json,http.json}; scan-frontend-57022899/{input/image.tar,output/report.json}. Image archive SHA2562ccc31f243234b3a659c8f921f84220fd11a9c644c5a21327547f828423b0517; report SHA25633be4c3ba4db76e78f049dc58a83e3155635ec8e741784f8c24b904416b132c4. All exact-owned proof/scanner containers removed. Local dev/trHTTP200, WIP preserved. No production access, DB operation, migration, push/deploy or dev-server restart.

## Frontend runtime tools removed and exact image verified — 2026-09-26

Supersedes prior frontend1Critical/40High count for the new artifact only. Commits c004db18 (test) and23b403a4e93303a2b662250cae3fd0aed6830882 (Docker runner cleanup) remove11 explicit global package-manager paths, preserving builder tools, node startup, app dependencies and schema. RED7/1 -> GREEN8/8; independent code/security reviews GO for local change. No application or lockfile changes.

Exact committed source built successfully for linux/amd64: image/index sha256:f0aab4276f2227caa68e1cc2c7a327a928ddccd85a2ca3941c2124233edd74f3, config sha256:d63b4d0d68a1abe7faec095854db27f9ddcf3f2a7b85ef0ea694527d91643bc4. Source225files/3809280bytes SHA2565f929b9fac6de1de91a534bb28e52cba19acf00677e7a8e5291c1f8881008d4b. API remains loopback: preview-only, NOT production-configured. Build/typecheck passed.

Network-none, mount-free, unpublished-port containers: permission smoke passed UID1001/x64,221 immutable checks,cache write,7 binary paths absent plus4 global directories absent. Separate real standalone boot returned200 for /tr,/tr/login,staticPNG and Next image optimizer (500-byte image result). Redirects rejected; static MIME and optimizer MIME verified. Container exit codes0 and exact-ID cleanup verified. No browser rendering, authenticated customer flow, API/DB or load acceptance claimed.

Pinned offline Trivy0.72.0 with same2026-09-26T06:33:51Z advisoryDB: **0Critical/21High/18Medium/33Low**, versus prior1/40/24/36. Config identity matches report. Global npm critical+19HIGH occurrences gone; remaining21HIGH (previous triage:17app+4OS) still require decisions/fixes. Next smallest step: targeted libcrypto3/libssl3 patch, then prioritize sharp image-optimizer findings and other app dependencies; do not treat0Critical as production GO. No scan suppressions.

Evidence: ../.aluplan-hotfix-evidence-20260926/frontend-build-23b403a4e933/{source.json,build.log,permissions.json,http.json}; scan-frontend-23b403a4/{input/image.tar,output/report.json}. Archive SHA25650d4209f77deeceee84324d8d63cf49b5cc5f35b8903d7c45e863f992cbb8c25; report SHA256d73cadb96575fa89267c06f596388d334624e067821d9dc95f83e746ca4c45f9. Scanner removed; local dev/trHTTP200. No live access, DB operations, migrations, push/deploy or dev restart. Existing worker/next-env WIP untouched.

## Exact frontend preview image built and scanned — 2026-09-26

Committed source 3dcb743d793f0b772f2e64380ba5a49ec32227b6 built successfully for linux/amd64. Curated archive:225 files/3809280 bytes, SHA256 276e2e5f9cd2afcf786ffee2bdd1954fd08bd29189b8d37ea4d91fb55506c81e. No env/customer-data/migration/WIP input. Preview API is http://127.0.0.1:4000/api/v1: this is NOT a production frontend artifact. Frozen install, Prisma generation, shared-schema compilation, explicit frontend typecheck and Next build passed. Build performs downloads/lifecycle scripts/font fetching; Next telemetry notice observed. No production credentials provided.

Image/index sha256:94038bef67bc8382b4cb5fdcbb95566307ecd2ce94c3b382f577acb94218d318; config sha256:061856093acc27ba7f2d9e6f4f5beb5e32c3830a605da3f42133fdf169c9445b. Network-none inert smoke passed UID1001/x64,221 immutable path checks,4449-path env-filename inventory and actual cache write/read/delete. Global npm/npx/corepack/yarn remain present; pnpm absent. This does not prove application boot, HTTP routes, image optimizer compatibility, full dependency permissions or absence of embedded secrets. Exact owned smoke container removed.

Offline pinned Trivy0.72.0 scan with advisory DB updated2026-09-26T06:33:51Z returned **1 Critical /40 High /24 Medium /36 Low** occurrences. Report config identity matches image. Critical CVE-2026-59873 is tar6.2.1 at usr/local/lib/node_modules/npm/node_modules/tar/package.json (scanner fixed version7.5.19): reachability from application requests is not established. NO-GO for frontend release; do not conflate with backend0Critical/58High. Minimal next step: remove unnecessary runtime package managers, assess OS/app findings and rerun exact image scan; no suppression or blanket safety claim. HTTP/optimizer acceptance still pending.

Independent security triage: global npm1C/19H, application dependencies0C/17H, OS0C/4H. Remove unused global tooling first; assess libcrypto3/libssl3 targeted patch next (report fix3.5.8-r0). Application HIGH occurrences: fast-uri7, browserslist2, nanoid3, postcss2, serialize-javascript1, sharp2. Prioritize sharp reachability because Next Image is used in login/landing; actual exploitability not established. These are proposed follow-up fixes, not applied changes.

Evidence outside Git: ../.aluplan-hotfix-evidence-20260926/frontend-build-3dcb743d793f/{source.json,source.tar,build.log,permissions.json}; scan-frontend-3dcb743d/{input/image.tar,output/report.json}. Scan archive SHA256 bc9cd27165317275cfab41ab8ec89e961d2a679400e007861866996e259ec2c3; report SHA256 4dfc2aadf13b7271d68348002af33a7452cac29147f8233286fe5b515e66c873. Scanner auto-removed and exact-name inventory empty. Local /tr remains HTTP200; no DB/live access, migrations, push, deploy or existing dev-server restart.

## Frontend image identity and ownership controls — 2026-09-26

Review caught a multiline VCS_REF bypass in grep-only validation. An actual /bin/sh regression reproduced it (6 pass/1 fail); an exact 40-character length check now rejects empty, short, long, uppercase and multiline values, while accepting a valid lowercase SHA (7/7 pass). This shell test is not Docker runtime proof.

Docker source now pins both frontend stages to the same Node20.20.2/alpine3.23 digest already used by the verified backend candidate. This establishes identity, not a claim that this Node version is current or vulnerability-free. Required build arg VCS_REF must be40lowercasehex and is stored in OCI revision label; missing/invalid value fails build. All frontend build callers (including future Coolify settings) must supply the exact source SHA; no production setting changed.

Public/standalone/static COPY now explicitly root-owned. Only /app/apps/frontend/.next/cache is nextjs-owned; removed misplaced /app/.next write permission. Source scan found Next image usage and no explicit ISR/revalidate configuration; real image optimization/cache/route behavior still needs runtime validation. No claim that ownership alone provides a read-only root filesystem or full compromise containment. Existing base-image global package-manager tooling remains a separate runtime hardening consideration.

Added three source-contract tests: initial4pass/3fail -> final7/7. Existing frontend build-order/typecheck/frozen-install guards stay green. Local/tr HTTP200. No frontend image build/runtime permission proof yet; no DB/env/UI/product behavior changes, no production access/push/deploy. New backend scan remains0Critical/58High, unrelated to this frontend Docker source edit. Next build a curated frontend source archive with explicit API build value and no production secrets, verify immutable source identity and cache-only writes on the resulting image, then scan it.

## XML-updated exact backend image scan — 2026-09-26

Committed e992c231ccee0b5c5ec8dfc27fa4f87d106806d7 built successfully as Linux/amd64 backend image sha256:4cd531281f3b4d5657e3186f6bc7ea913176429ab3a2e35fa2760ca387691e23; config sha256:2dae239950945dcfc263c1fe8c00ed1df1d4a2ae1cd1bb6459a0aae66a0b192c. Curated Git archive415files/57hash-validated migrations/3338240bytes SHA25637b6b484f372386a012724bba7cd2c674bed9c4add7b50d36b72201ad8cc83b6; dirty WIP/secrets/customer data excluded. Backend production compilation and PG17 build guards passed. Build uses network/downloads/lifecycle scripts; global Prisma/APK resolution is not fully reproducible. No normal app start or new exact-image runtime smoke was performed.

Pinned Trivy0.72.0 scanner ran with network none, no Docker socket, input archive read-only, same advisory DB updated2026-09-26T06:33:51Z (before NextUpdate). Config hash matches report. New C/H/M/L **0/58/137/16**, previous unified **0/69/143/17**:11HIGH/6MEDIUM/1LOW fewer finding occurrences. No findings remain for fast-xml-parser, fast-xml-builder or xmldom in this report; not a universal security guarantee. Scanner removed itself; exact-name inventory empty. Input archive SHA256e33b7dcaf5f41e9ac19ca6f2e8e6c8d79c77113903ed4a27279c6ab21a33009a; report SHA256bf69ae862a7305c6d5f6a9b9454ea0dc2ad48c9c99db2b7ffd3ac085df8980ba. Evidence outside Git: ../.aluplan-hotfix-evidence-20260926/scan-unified-e992c231/{input/image.tar,output/report.json}; build log/source receipt in unified-build-e992c231ccee.

Separate read-only frontend preflight: clean image NOT built. Remaining packaging issues: moving node:20-alpine tags, no VCS_REF image identity, nextjs-owned standalone code writable at runtime. Need root-owned code with narrowly writable cache and pinned image identity. Build embeds NEXT_PUBLIC_API_URL, fetches Google fonts, and configures Sentry sourcemaps; do not pass production secrets or blindly archive checkout. Explicit curated source list can exclude env, Sentry auth files, private data, generated assets/test artifacts; retained logo assets need source verification. Next bounded steps: frontend packaging safeguards/clean image proof, remaining Axios/XLSX risk decisions, then isolated sanitized-data acceptance. No production access, capture, DB operation, push or deploy in this phase; NOT production-ready.

## Frontend Docker prerequisite gate implemented — 2026-09-26

Narrow Dockerfile change: pin pnpm9.15.4 to repository packageManager, remove non-frozen install fallback, build shared-schemas after client generation, and explicitly typecheck frontend before next build. Next's existing ignoreBuildErrors setting is unchanged; the separate RUN fails the Docker build on tsc failure. No runtime or schema change, env addition, migration or production operation.

New scripts/frontend-build-contract.test.cjs: four source-contract tests RED0/4 then GREEN4/4, covering ordering/typecheck/frozen install/pnpm version. Actual shared-schema compile followed by full frontend tsc --noEmit --incremental false also exited0 with network denied. These tests do not execute Docker or prove clean image build, generated route typing, source-map upload safety or final runtime health. Local /tr HTTP200 retained. Exact frontend image build and updated backend image scan still pending; historical0Critical/69High result is unchanged evidence, not a new scan. Existing worker/next-env WIP untouched. Code/config/tests/docs must remain separate local commits; no push/deploy authorization.

## Shared schema prerequisite restored locally — 2026-09-26

Supersedes the frontend TS2307 status below for the current local checkout. Workspace symlink was correct; @aluplan/shared-schemas declares dist/index.js and dist/index.d.ts, but dist was absent. Ran the existing shared-schema TypeScript build with network denied, then the unchanged frontend tsc --noEmit --incremental false: both exited0. No source alias, dependency change, generated-file commit or application-code workaround. Generated dist files are ignored. Frontend /tr still HTTP200; no full-stack or production build claim.

Root turbo typecheck/build already declares upstream build dependencies. Direct frontend tsc bypassed that prerequisite. Separate release packaging gap: apps/frontend/Dockerfile invokes filtered frontend build without explicitly building shared-schemas; it also permits non-frozen install fallback and Next config ignores build type errors. Do not infer a clean frontend image succeeds from a locally populated dist. Next verify/fix the narrow frontend build prerequisite with regression coverage, then clean image acceptance; no broad frontend refactor authorized. XML-updated backend image rebuild/scan and remaining release gates remain pending. No production access, DB operation, push or deploy.

## XML dependency fix with storage compatibility — 2026-09-26

Scoped root overrides now select fast-xml-parser5.7.3, fast-xml-builder1.1.7 and mammoth's xmldom0.8.15. pnpm9.15.4 regenerated the lockfile; frozen installation ran with lifecycle scripts disabled. Diff is limited to XML dependency closure (including entities/path-expression/strnum/anynum), not broad framework upgrades. Default PATH pnpm was incompatible with this repo and its initial metadata queries failed; no install was attempted using it. Existing worker WIP remains excluded.

TDD caught a REAL compatibility regression: proposed FXP5.7.0 broke AWS xml-builder's unconditional numeric addEntity registrations even on benign XML. Rejected that candidate; upstream changelog documents compatibility restoration in5.7.2. Selected5.7.3 and retained the failing AWS test, adding explicit CR/LF assertions. No AWS SDK upgrade or production-code workaround. Maintainer references: https://github.com/NaturalIntelligence/fast-xml-parser/issues/824 ; https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/CHANGELOG.md ; https://github.com/xmldom/xmldom/releases/tag/0.8.15 .

New scripts/xml-dependency-security.test.cjs uses actual consumer dependency resolution, small synthetic XML/DOCX, version floors, escaping, numeric expansion and opt-in doctype serialization controls. Corrected baseline fixture enabled htmlEntities explicitly before meaningful RED3pass/4fail; final suite12/12 passes. Combined XML/mail/WebSocket/dependency44/44 and existing HXL/knowledge parser14/14 pass with network denied; backend TypeScript passes. Independent security review12/12 confirms storage XML/CRLF compatibility. Configured test limits and serializer options do not imply those options are configured in production. No full SDK/cloud integration or full-stack boot proof.

Frontend default tsc remains blocked by TS2307 resolving @aluplan/shared-schemas at src/lib/schemas.ts:28; no alias workaround applied this turn and no full frontend typecheck PASS claim. This is separate from the passing backend/parser checks and must be addressed before release acceptance.

No env/schema/migration/application-service changes, production access, DB writes, push or deploy. Frontend loopback/tr remains HTTP200. Last exact image scan remains0Critical/69High: NEW DEPENDENCIES HAVE NOT YET BEEN REBUILT/SCANNED. Next exact candidate image verification, remaining Axios/XLSX risk decisions, then sanitized-data acceptance; do not represent advisory closure by subtracting expected counts.

## Unified backend image verified and scanned — 2026-09-26

Built committed source `5f9c5b142df978ab30db6899c731b4800647e220` only, excluding dirty worker WIP, as Linux/amd64 image `sha256:41c2c7f9eea574aad2e753f0d6592f75b072f380a7f6ea00bd16767aed463306`. Config identity `sha256:fe01befeddafbff56a7a4b9ad8564882375e3481f2f9ea4c99e1a389ec5deff2` matches the scan. Narrow source archive: 415 files, 57 hash-validated migrations, 3338240 bytes, SHA256 `746a7b969599ad628e1c54869ec0717a7a3c08a7a639a31e32b293ba0625c762`. Build succeeded; network was used for builder dependencies. This is the backend image, not a frontend production build.

Exact-image inert smoke passed with network none, no host mounts or published ports (temporary /tmp tmpfs only), overridden Node entrypoint and UID1000: 11 known package-manager paths absent; five application/code paths non-writable; four intended writable paths; generated client loads; retained Prisma7.4.2 and PG17 clients run. Offline schema diff from empty generated 62 tables without database access. No Nest boot, deployed startup, migration execution or customer-data acceptance was tested.

Offline Trivy0.72.0 scan with the same cached advisory DB as historical hotfix486b986d: unified C/H/M/L **0/69/143/17**, versus hotfix **4/149/194/26**. Counts are finding occurrences, not unique vulnerabilities or proven reachable exploits. No ignorefile suppression. DB updated2026-09-26T06:33:51Z, used before its NextUpdate; not a claim of newest available DB. Report outside Git: `../.aluplan-hotfix-evidence-20260926/scan-unified-5f9c5b14/output/report.json`, SHA256 `8cd4db91999ed5829744904670ef871eac38b99cda01ea80f27ab71aebc58e27`. Remaining HIGH findings require dependency-path/reachability triage before deployment; zero Critical is not production approval.

Smoke helper's 10s create timeout exposed a cleanup race: the daemon completed creation after the initial absent-container check. The exact labeled container was subsequently identified, inspected, run with the already-verified inert command, exited0 and removed by full ID. Final owned-smoke/scan inventories empty. Do not reuse helper unchanged: create timeout must not be interpreted as cancellation or immediate absence as final cleanup proof.

Read-only independent triage: 69 HIGH occurrences represent 54 unique advisory IDs. Seven occurrences are under global Prisma, 62 under workspace dependencies; workspace includes tooling and is not equivalent to reachable runtime. Source shows uploaded HXL reaches fast-xml-parser, document processing reaches XLSX and mammoth (xmldom transitively), and CRM/webhook/crawler flows use axios. Vulnerable operation exploitability is NOT established by these package paths alone. Smallest next fix batch: XML parsing dependencies plus focused attachment regressions; XLSX needs a trusted-source/update or feature-containment decision; axios follows with integration regressions. Do not bulk-upgrade blindly or dismiss all remaining findings as tooling.

Image archive SHA256 `2489b163f8c00eb05c206af240a2cdb88b07e6ba9523ec2b5e85351d7a8f9b8b`; archive remains outside Git in the scan input directory. Loopback frontend `/tr` returns HTTP200; backend/customer-data preview remains pending. No live access, fresh capture, restore, push or deploy in this verification phase. Next: prioritize remaining runtime HIGH paths, then isolated sanitized-data migration/boot and user-flow acceptance. Preserve unrelated worker WIP; team/category feature still unimplemented.

## Consolidation follow-up: runtime tooling and WIP acceptance — 2026-09-26

Follow-up caught and corrected an actual cleanup/startup conflict BEFORE commit/build: migrate-once calls verify-schema-parity.mjs, which still used pnpm exec prisma. It now calls retained Prisma directly with identical migrate-diff arguments, timeout, environment and fail-closed drift handling. Local callers need Prisma on PATH (e.g. pnpm exec node). New bounded VM subprocess-recorder regression RED2pass1fail -> GREEN3/3; combined tooling+consumer7/7 and existing read-onlyRBAC/parity2/2 pass. No real subprocess/DB in the new tests. Worker WIP remains outside accepted scope. Build must use reviewed narrow source context, not blindly archive historical private files with the older full-tree build helper.

Read-only canonical dirty inventory against committed ff4a39b6:50 frontend/backend product/test files,34 identical,16 differing,0 absent. Reviewed differences are later candidate safety/UI changes, not missing canonical features. Keep canonical untouched; no wholesale copy. This is source-level coverage, not functional equivalence proof.

Correction to earlier hotfix transfer suggestions: candidate RagMaintenanceService.onModuleInit already logs only (822aafdd); DDL/sync are explicit runInfrastructureMaintenance operations. Do NOT port hotfix flag/default or old method body. Six existing RAG tests pass.

Candidate Prisma client was missing; generated locally from candidate schema with network denied and synthetic inert datasource, no DB connection. Initial --no-engine option was unsupported and retried without it; generate succeeded. Generated files remain ignored. Backend tsc --noEmit passes without borrowed client. Shutdown tests initially failed in shared setup (langfuse-core resolution); explicit NODE_PATH to THIS checkout's installed3.38.6 resolved it. Six focused suites55/55 pass under network-denied sandbox. This environment accommodation is not a fix to default test setup.

Uncommitted WorkerShutdownService/app.module WIP remains unaccepted: beforeApplicationShutdown may wait indefinitely while HTTP still accepts work; real Bull/Nest error/close ordering and admission boundary need proof. Tests use controlled worker doubles, not all-writer production drain. No forced close or timeout-success workaround added; preserve WIP.

Bounded packaging adaptation removes only explicit global npm/pnpm/corepack/yarn paths AFTER install/generate. Global Prisma deliberately retained because candidate migrate-once invokes it; workspace dependencies/PG17 guards/CMD unchanged. New runtime-tooling source contracts RED2pass2fail -> GREEN4/4. Exact new image build/scan/isolated migration/boot are still pending; no reduced advisory count claimed. No live access, capture, restore, deploy or push in this follow-up.

## Single active integration source — 2026-09-26 (supersedes hotfix routing below)

Owner approved consolidating existing improvements. Active source is THIS checkout, branch `security/release-candidate-20260919`; the narrow hotfix is now a reference, not the user-facing development source. Do not wholesale merge the historical hotfix or its lockfile/startup. Existing candidate already contains homepage ff8ff8a7, reopening f77c4429, AI label05cb3f25, broader authorization/durability and newer mail dependencies.

Local restore branches preserve pre-consolidation release1a2d4f3b, hotfix48be5373 and canonical9b5d6870. These protect committed history only, NOT dirty files or an off-device backup. Existing app.module/worker-shutdown edits remain untouched/unaccepted; canonical dirty frontend files remain in place. Inventory/review those before declaring consolidation complete.

Ported only the missing four Handlebars/protobuf/multer behavior controls into scripts/consolidated-dependency-behavior.test.cjs from hotfix6062e678. Combined dependency/mail/WebSocket32/32 and frontend landing/language/reopen28/28 pass on this checkout. WebSocket tests already identical; no duplicate port. Tests do not establish full image/production readiness.

Pending: reconcile exact packaging/runtime changes (global Prisma cannot simply be removed because candidate migrate-once uses it); resolve existing worker WIP; review remaining canonical deltas; exact unified image/scan/boot; fresh isolated data acceptance; team/category feature not implemented. Production remains NO-GO, explicit push/deploy gates unchanged.

User-facing preview now targets this candidate on loopback3000 with explicit loopback API4000 and outbound-restricted dev process. Backend is NOT ready/connected; no real-data login claim. Google fonts may fall back offline. Fresh live capture helper is prepared outside Git but NOT executed. Approved read-only SSH confirmed host,19% disk, actual application DBaluplan_support/PG17.9 target; no dump/restore/deploy occurred. Do not boot copied production credentials or workers. Sanitization and browser/provider egress must be verified first.

## Hotfix implementation moved to isolated live-baseline branch — 2026-09-26

Active small-patch checkout ../aluplan-ticket-hotfix-20260926 at hotfix/ticket-reopen-label-20260926, product405a51b3 and label17624a46. Only scoped ticket reopening/labels, not this broad candidate. Backend55tests/frontend22/labels3pass, fulltypechecks0 with disclosed borrowed dependency resolution, synthetic browser and independentreviewpass. Detailed evidence/remaining gates are in that checkout .ai/current-focus.md and session-summary.md. Next actual isolatedDB atomicity/conflict proof, exactbuild/startup and separatelyapproved staffgrants/backup/recovery/deploy gates. This worktree pending worker-shutdown edits preserved unchanged. No production actions during implementation.

## Live selected-method correspondence established — 2026-09-26

Separately approved fixed-file read used docker cp tar stdout, local tar stdout and local TypeScript parsing only; no extraction to filesystem, container exec, app import/execution, credentials/env/customerdata or DB access. Source .ts absent in image; fixed dist JS files available. Backend immutable image/start/restart remained the recorded302229/September2/0 at preflight. Historicald9b21b9d source transpiled locally with TypeScript5.9.3; exact skip-trivia lexical token equality passed for TicketsService.transition, TicketsController.transition, JwtStrategy.validate and RbacGuard.canActivate. Full service file hash differs from local transpile; reason NOT established, no whole-source/dependency equivalence claim.

This resolves the narrow actorId/permission-method uncertainty sufficiently to design a local backport, not release acceptance. Next local implementation must preserve existing transition callers and customer review, authorize reopening with current database staff/permission checks, use atomic nested audit and optimistic closure predicate, and adapt UI without candidate-only dependencies. Existing startup risks and exact build/integration/backup/recovery approvals remain separate; never execute legacy startup to test this. Live ticket unchanged by us.

## Isolated live-frontend backport prepared — 2026-09-26

New local worktree ../aluplan-ticket-hotfix-20260926, branch hotfix/ticket-reopen-label-20260926, based exactly on known frontend OCI revisionee4d70a7. Only three ai_draft_btn translation values plus regression5ac248b9 differ. Label tests3RED then3GREEN, i18n and independent review pass; Dockerfile/lock unchanged. This branch does NOT yet contain ticket reopening. Modern-candidate browser evidence is not inherited; backport build/browser still pending.

Existing inert backend archive tooling verifies outer content only; no selected-layer ticket/controller/auth source inspector or equivalence receipt exists. Do not invent source equivalence or build a general archive framework for this hotfix. Smallest unresolved step is narrowly allowlisted read-only deployed code-file evidence (ticket service/controller and relevant authorization), or an explicitly scoped inert selected-file reader. Neither needs old-image execution; release is blocked until enough source/startup compatibility is established. No live connection this continuation; original candidate/worker edits untouched.

## Authorized live identity check — 2026-09-26

Owner approved read-only deployment identity check. Strict-host SSH confirmed vmi3049865. Backend backend-api/9ea92d99bfbd is running image302229b2403d3a3e5fcb34b2af3003e6f0d6ba5e7610ad2e89e41eb375bd4644, tag d9b21b9d7b5c4c259acbe9a5828fdd04ba077ce2, started September2, restart0; image has no OCI revision or RepoDigests. Frontend allplan-frontend-ee4d70a7/5c0b67496777 healthy, imagedbd2a193d62a499e2adcea3d90f0f4617e1d9588d3b52a9b525c0e7fbf08094e, OCIee4d70a71a75d2f52cfc55ee05f4af34414c2b30, started September4, restart0. Both amd64. This confirms current artifacts, not complete backend source provenance or end-to-end health/security.

Local frontend OCI revision source has ANN_TASLAK; backend historical tag source passes actorId:string with no newer ticket-access gate. No blind cherry-pick. Next local work: prepare narrow backport against known frontend source and verify backend code provenance from existing inert archive/receipts before selecting its build base; preserve patched frontend runtime/dependencies. Do not run legacy startup scripts or bundle candidate shutdown/migration work. Only docker ps/selected inspect and hostname used remotely; no container exec, env/secret output, customer-data query, deploy/restart/config/DB mutation.

## Two-change hotfix scope and baseline blocker — 2026-09-26

Scope: authorized CLOSED reopening plus AI action label only. Label tests96a9bb78, label product05cb3f25; TR AI Yanıtı, EN AI Response, DE KI-Antwort. Three RED then GREEN checks, i18n parity and synthetic Chromium button assertion pass; no AI action invoked. Existing reopening functional checks still pass. No migration/env/AI-behavior change.

Offline historical-source comparison warns against blind cherry-pick: d9b21b9d transition takes actorId:string and lacks candidate TicketAccessService; candidate reopen requires requester.sub plus preceding canManageTicket. Historical frontend lacks activeRef used by candidate handler; test also relies on newer MaintenanceWorkService. This is historical evidence, not current live identification. Next scoped need: read-only verification of current deployed backend/frontend immutable identities and source mapping, then a narrow compatible backport and isolated integration/build verification. Do not equate local separated commits with a deployable legacy hotfix. No push, deploy, restart or production data mutation authorized/performed in this continuation.

## Scoped ticket reopening checkpoint — 2026-09-26

Temporarily prioritize CLOSED -> OPEN staff reopening. Local regression checkpoint f8a92e2d and product checkpoint f77c4429 are separate from unfinished worker-shutdown edits. Backend73tests and full backend typecheck pass after optimistic closedAt guard; frontend30tests pass. Independent code/security reviews approved the bounded change. Browser interaction with actual page/UI components and synthetic services passed; no production requests. The scratch bundle has no global CSS and is not full Next/API/database acceptance. Frontend typecheck passes with an ephemeral shared-schemas source alias, not a package/config fix.

Next: assess this narrow fix against the exact deployed source/artifact before proposing a standalone hotfix. Do not deploy the whole candidate or blindly cherry-pick onto an unverified live baseline. Verify actual DB nested-write/conflict behavior and final build compatibility, then require explicit publication/deploy approval. No migration required by this change. SUP-00190 remains unchanged by us; ticket-specific reopening authorization is not general deployment authority. Preserve pending worker-shutdown work separately; overall stabilization gates remain open.

## Worker pause boundary characterized — 2026-09-26

Added worker-pause-boundary.spec.ts: installed BullMQ public pause implementation with synthetic transport/completion boundaries and real MaintenanceWorkService. Three cases prove test-selected admission remains open for late accepted-job work, parallel pause initiation, and the unsafe assumption that pause(true) followed by pause(false) joins active work. The latter skips completion waiting in this installed version. Initial execution hit the repository-wide BullMQ mock; typed jest.requireActual corrected the harness. This was not a product RED. Corrected five-suite run:51passed; backend plus explicit new test diagnostics0. Independent code/security review approved. No runtime, schema, production or external-service changes.

Next minimum implementation: discover/deduplicate initialized WorkerHost workers and begin non-forced close in parallel before closing shared admission. Public BullRegistrar has no enumeration/drain API; do not access private BullExplorer.workers or private whenCurrentJobsFinished. Non-forced close is preferable to reversible pause for one-way shutdown, but CRM failed-event writes and other detached work still require separate joins. Do not activate a global coordinator until producer/admission/dependency ordering is proven. This fixture is not actual Redis acquisition/lock/persistence or all-writer proof; release gates remainOPEN.

## Combined HTTP/cron rehearsal isolates disconnected-work gap — 2026-09-24

New maintenance-combined.spec.ts uses real loopback HTTP, Nest lifecycle and Cron plus actual admission/tracker/cron-drain services, synthetic held controller and dependency hook. Three modes: connected request naturally delays dependency final-shutdown; intentionally disconnected request allows final hook while tracked work remains1; explicit TEST-ONLY drain-before-close prevents that ordering. New ingress returns503 without a second accepted call in all modes. Observed real cron-drain completion avoids mistaking its polling delay for HTTP transport waiting; HTTP/phase waits are bounded.

Important correction: initial assumption that normal open HTTP could outlive final dependency hooks was too broad. Installed Nest closes in order destroy -> beforeShutdown -> dispose HTTP -> applicationShutdown; first attempted assertion timed out, leading to the corrected three-mode proof. Remaining risk is disconnected/detached work, not all connected HTTP.8focused suites67tests pass; backend/newtest diagnostics0. Test-only change, not a product coordinator or fullApp/realDB/Bull acquisition proof. Existing worker tests retain their separate scope.

Next bounded implementation: supported worker acquisition-stop/completion ordering, preserving active-job descendants before closing shared admission, then join tracked disconnected work before dependency teardown. Do not attach waitForIdle to an arbitrary hook or treat sharedzero as allwriters. Previously untracked operations still need coverage. No live/push/deploy; release gates stayOPEN.


## Finite cron callbacks joined during destroy phase — 2026-09-24

Installed @nestjs/schedule5.0.1/cron stop returns void; awaiting stop alone is not a completion proof. Root AppModule now provides CronShutdownService: snapshot jobs, stop all future ticks synchronously, reject unjoinable configuration, poll public isCallbackRunning until all returned callback promises settle. No elapsed-time success cutoff. Nine Cron declarations now opt waitForCompletion:true; existing socket revalidation already did. Normal behavior change: overlapping ticks are skipped, not queued.10source declarations guarded; no addCronJob/onComplete registrations found in source.

Real Nest/Schedule/Cron fixture holds two callbacks through success/failure, verifies no dependency final-shutdown while either runs, completion of a simulated enqueue before dependency closure, and skipped overlapping tick. Unsupported callback configuration stops all jobs then rejects. Initial RED was missing newservice, not an executed assertion failure.13focused suites145tests pass (inbound, reconciliation, notifications, AI budget/clustering and existing queue/CRM/Redis lifecycle); backend/newtest diagnostics0 and independent review approved. No schema/env/live/push/deploy change.

Limits: this hook can run after earlier feature destroy hooks, so it is not an immediate ingress fence. Producer queue connections remain available until final shutdown; work enqueued after the CRM worker stops can wait for restart. Callback completion does not cover detached descendants/onComplete, future dynamic jobs or noncron timers. Multiple runtime instances are possible despite10source declarations; snapshot handles registered instances. A stuck callback blocks graceful shutdown; external force-kill deadlines remain operational risk. Next combined HTTP admission/accepted-request and worker acquisition ordering rehearsal; no universal shutdown-ready decision yet.


## CRM terminal failure persistence joined before shutdown — 2026-09-24

CrmProcessor preserves the failed-event conditions/retry logic; onFailed now synchronously registers a processor-local promise before invoking the original persistence body. onModuleDestroy awaits non-forced worker.close(), then allSettled of remaining failure writes. Database/Redis application-shutdown hooks run later in the tested topology; later BullExplorer close is idempotent. Unregistered-worker/close errors propagate rather than falsely allowing shutdown. No shared admission root can reject accepted CRM failure writes; shared tracker zero still excludes this local set.

Two real-Nest/Bull-discovery lifecycle cases failed before implementation (DB disconnected while write held), then passed. Enhanced fixture emits two late failure events during close: first DB write fails, second stays held through success/failure. Close-error and unregistered-worker tests also pass.7focused suites58tests; backend plus3CRMtest files diagnostics0; independent code/security review approved. Worker/DBdrivers are synthetic, Prisma hook and Nest/Bull discovery real: not fullApp, actual Redis/job durability, stalled-job transport or SIGTERM proof. No schema/env/live/push/deploy changes. Next combined remaining producer/acquisition/HTTP/cron/WS admission ordering; do not infer universal readiness from this CRM-local join.


## Writer inventory reconciled; CRM failure gap characterized — 2026-09-24

Updated the existing Gate1 table rather than creating another plan: HTTP admission/audit and ticket fan-out evidence had outgrown its old rows. Static source has10Cron and9Processor declarations, not a runtime registration claim. RAG trainingQueue.create is awaited; an initial commentary misreading was corrected and no RAG fix is needed for that statement.

Actual CrmProcessor.onFailed through Node EventEmitter exposes terminal crmSyncLog.update still pending while emit returns and unrelated shared accounting reads0. Four new characterization cases plus existing processor/tracker tests:49pass. They intentionally demonstrate an OPEN risk, not a completed fix. No product changes. Do not move the write into process using attemptsMade+1 alone: stalled/discard/unrecoverable/retry behavior may differ. Next bounded implementation must preserve failed-event conditions and join its real promise after workers stop but before Prisma disconnect; prove lifecycle ordering before activation. Remaining HTTP/cron/WS admission and exact artifact/operational gates remain open. No live/push/deploy.


## Exception audit writes tracked through disconnect — 2026-09-24

GlobalExceptionFilter now reserves root/active-parent child work around the actual ErrorLoggerService promise before its first await; main injects the existing shared tracker. Original HTTP status/message/code/redaction and wait-before-reply semantics remain. Logging/admission rejection cannot replace the original response; filter catch uses a fixed log message. Destroyed/ended responses are not replied to after persistence settles. No new env/schema/control endpoint/shutdown hook.

Five new unit cases:4RED/1pass beforeproduct, then allgreen. Added a real loopback Nest/controller/filter/ErrorLoggerService test with held mockedPrisma write: client destroyed, server close observed, count remains1 until release, then0/no reply. Phase waits bounded and cleanup covers bind failure after review. Seven focused suites79tests pass; backend and all4changedtest files typecheck0 with schema-matched declarations. This is mocked persistence, not actual PostgreSQL/wholeApp or guaranteed audit delivery.

Standalone logging after admission closes is refused; active parent descendants remain allowed. Previously admitted HTTP requests without leases and unrelated ErrorLoggerService callers remain outside proof. Existing ErrorLoggerService internal DB-failure stack logging is not sanitized by the fixed filter catch. Next: reconcile remaining admitted-request/guard and scheduler/Bull/socket writer coverage against the frozen Gate1 inventory before any closure hook; no universal drain claim. No live access/push/deploy; operational/artifact gates unchanged.


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
