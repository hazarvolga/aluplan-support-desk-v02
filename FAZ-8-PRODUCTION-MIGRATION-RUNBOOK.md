# Faz 8 Production Migration Runbook

Durum: **YEREL HAZIRLIK TAMAM, PRODUCTION UYGULAMA YETKİSİ YOK**

Bu runbook yalnız kullanıcı açıkça bakım penceresini ve production uygulamasını onayladığında yürütülür. Hazırlanırken production PostgreSQL/Redis'e bağlanılmadı ve deploy yapılmadı.

## Kapsam ve zorunlu sıra

Bekleyen migration'lar:

1. `20260314900000_restore_crm_foundation`
2. `20260806000000_align_schema_parity`
3. `20260806010000_harden_auth_action_tokens`

Zorunlu sıra: **doğrulanmış yedek → uygulamayı bakım moduna alma → `prisma migrate deploy` → şema/ledger doğrulaması → yeni uygulamayı başlatma**.

Yeni Prisma Client eski production şemasında bulunmayan `crm_accounts.customer_no` alanını seçebildiği için uygulama migration tamamlanmadan başlatılamaz.

## Coolify başlangıç akışı kapısı

Docker imajı `apps/backend/Dockerfile` içindeki `CMD ["./deploy.sh"]` ile başlar. `deploy.sh` migration komutunu uygulamadan önce çalıştırır ve artık migration başarısızlığında `exit 1` ile fail-closed davranır. Shell syntax kontrolü ve disposable PostgreSQL 17 üzerinde migration zinciri doğrulanmıştır; production/staging kabulü ayrıca gereklidir.

İlk Faz 8 uygulamasında sıradan bir Coolify redeploy **tek başına yeterli kabul edilmez**. Aşağıdaki kapılar sağlanmadan bakım penceresi açılmaz:

- Yeni imaj/container bağlamında migration komutunu ayrı bir one-shot adım olarak çalıştır, çıkış kodu `0` ve ikinci çalıştırmada “No pending migrations” sonucunu doğrula; sonra backend'i başlat.
- Coolify secret store'a birbirinden farklı, placeholder olmayan `JWT_SECRET`, `JWT_REFRESH_SECRET` ve `AUTH_ACTION_JWT_SECRET` değerleri uygulama başlatılmadan önce sağlanmış olmalı. Yeni kod eksik/eşit/placeholder secret ile fail-closed açılmaz.

## Yerel ölçüm kanıtı

Kaynak: secret değerleri temizlenmiş dump; üç ayrı PostgreSQL 17 disposable klon. Her klonda `crm_accounts=807`, `knowledge_pool_embeddings=7745`, `users=1282`. Lock gözlemi 1 ms aralıkla ayrı bağlantıdan yapıldı.

| Migration | Çalıştırma 1 | Çalıştırma 2 | Çalıştırma 3 | Medyan |
|---|---:|---:|---:|---:|
| Foundation | 10.542 ms | 9.453 ms | 8.449 ms | 9.453 ms |
| Parity | 10.249 ms | 10.201 ms | 9.899 ms | 10.201 ms |
| Auth action token state | 8.115 ms | 8.419 ms | 8.631 ms | 8.419 ms |

Gözlenen başlıca lock'lar:

- Foundation: `users` ve `customer_profiles` üzerinde `AccessExclusiveLock`; `roles`, `permissions`, `ai_response_cache`, `crm_accounts`, `crm_connections` üzerinde `ShareLock`.
- Parity: `ai_interactions`, `crm_accounts`, `customer_profiles`, `knowledge_sources`, `users` üzerinde `AccessExclusiveLock`; indeks oluşturulan/denetlenen tablolarda `ShareLock` veya `AccessShareLock`.
- Auth state: `users` üzerinde kısa süreli `AccessExclusiveLock`.
- Üç ölçümde de bekleyen (`granted=false`) lock görülmedi.

Bu değerler per-lock süreleri değil, migration wall-clock süresi ve 1 ms örneklemede görülen lock varlığıdır. Yalnız **çatışmasız yerel ölçümdür**; production kesinti garantisi değildir. Canonical eski migration dosyaları değiştirilemez; timeout one-shot bağlantısının URL `options` parametresiyle verilir. Bakım penceresi için 15 dakika ayır; one-shot süreç 30 saniyeyi aşarsa işlemi sonlandır ve uygulamayı başlatma.

## Bakım penceresi öncesi salt-okunur kontroller

Komutlarda gerçek URL ekrana yazılmaz; mevcut secret store üzerinden `DATABASE_URL` sağlanır.

```bash
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "
SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations
WHERE migration_name IN (
  '20260314900000_restore_crm_foundation',
  '20260806000000_align_schema_parity',
  '20260806010000_harden_auth_action_tokens'
)
ORDER BY migration_name;"
```

Beklenen: foundation, parity ve auth-state için tamamlanmış satır yok; üçü pending.

```bash
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "
SELECT pid, now() - xact_start AS age, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE datname = current_database()
  AND xact_start IS NOT NULL
  AND pid <> pg_backend_pid()
ORDER BY xact_start;"
```

İptal kriteri: 30 saniyeden eski yazan transaction, bilinmeyen DDL, bakım dışı import/sync/re-index işi veya doğrulanmamış yedek.

Ön veri sayıları kaydedilir:

```bash
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "
SELECT 'crm_accounts' AS object, count(*) FROM crm_accounts
UNION ALL
SELECT 'knowledge_pool_embeddings', count(*) FROM knowledge_pool_embeddings
UNION ALL
SELECT 'users', count(*) FROM users;"
```

## Uygulama adımları — yalnız açık kullanıcı onayından sonra

Önce gerçek adları salt-okunur komutla çöz ve kaydet:

```bash
docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}'
```

Operatör aşağıdaki değişkenleri gerçek, tekil hedeflerle tanımlar; boş veya belirsiz hedefle devam edilmez:

```bash
export ALUPLAN_BACKEND_CONTAINER='coolify-backend-container-name'
export ALUPLAN_DATABASE_CONTAINER='coolify-postgres-container-name'
export ALUPLAN_RELEASE_IMAGE='exact-release-image@sha256:digest'
export ALUPLAN_DOCKER_NETWORK='exact-coolify-network-name'
export ALUPLAN_BACKUP_DIR='/root/aluplan-backups/faz8-YYYYMMDD-HHMM'
mkdir -p "$ALUPLAN_BACKUP_DIR" && chmod 700 "$ALUPLAN_BACKUP_DIR"

export ALUPLAN_RELEASE_ENV_FILE="$ALUPLAN_BACKUP_DIR/release.env"
umask 077
cleanup_release_env() {
  if [ -n "${ALUPLAN_RELEASE_ENV_FILE:-}" ] && [ -f "$ALUPLAN_RELEASE_ENV_FILE" ]; then
    shred -u "$ALUPLAN_RELEASE_ENV_FILE"
  fi
}
trap cleanup_release_env EXIT INT TERM
docker inspect "$ALUPLAN_BACKEND_CONTAINER" \
  --format '{{range .Config.Env}}{{println .}}{{end}}' > "$ALUPLAN_RELEASE_ENV_FILE"
```

1. Coolify bakım sayfasını aç; yeni yazmaları durdur. Backend/worker/cron/RAG/CRM süreçlerini durdur ve `docker ps` ile uygulama konteynerinin çalışmadığını doğrula. PostgreSQL konteynerini durdurma.
2. Native-format yedek al; dosya adı ve SHA-256 kaydet:

```bash
docker exec "$ALUPLAN_DATABASE_CONTAINER" sh -lc \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner --no-privileges' \
  > "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump"
chmod 600 "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump"
sha256sum "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump" \
  > "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump.sha256"
sha256sum -c "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump.sha256"
docker exec -i "$ALUPLAN_DATABASE_CONTAINER" pg_restore --list \
  < "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump" >/dev/null
```

Yedek ayrı bir PostgreSQL 17 disposable hedefe restore edilip `pg_restore` exit `0`, tablo sayıları ve `_prisma_migrations` okunabilirliği doğrulanmadan migration'a geçilmez. Ham dump geliştirme klonu olarak kullanılmaz:

```bash
export ALUPLAN_RESTORE_CONTAINER='aluplan-faz8-restore-check'
docker run -d --rm --name "$ALUPLAN_RESTORE_CONTAINER" \
  -e POSTGRES_USER=restorecheck -e POSTGRES_PASSWORD='local-disposable-only' \
  -e POSTGRES_DB=restorecheck pgvector/pgvector:pg17
until docker exec "$ALUPLAN_RESTORE_CONTAINER" pg_isready -U restorecheck -d restorecheck; do sleep 1; done
docker exec -i "$ALUPLAN_RESTORE_CONTAINER" pg_restore \
  -U restorecheck -d restorecheck --no-owner --no-privileges \
  < "$ALUPLAN_BACKUP_DIR/production-pre-faz8.dump"
docker exec "$ALUPLAN_RESTORE_CONTAINER" psql -U restorecheck -d restorecheck \
  -v ON_ERROR_STOP=1 -c 'SELECT count(*) AS migration_rows FROM _prisma_migrations; SELECT count(*) AS users FROM users;'
docker stop "$ALUPLAN_RESTORE_CONTAINER"
```

3. Yeni release imajında one-shot migration çalıştır:

```bash
docker run --rm --name aluplan-faz8-migrate \
  --network "$ALUPLAN_DOCKER_NETWORK" \
  --env-file "$ALUPLAN_RELEASE_ENV_FILE" \
  --entrypoint sh "$ALUPLAN_RELEASE_IMAGE" -lc '
    cd /app
    MIGRATION_DATABASE_URL=$(node -e '\''
      const url = new URL(process.env.DATABASE_URL);
      url.searchParams.set("options", "-c lock_timeout=5s -c statement_timeout=300s");
      process.stdout.write(url.toString());
    '\'')
    DATABASE_URL="$MIGRATION_DATABASE_URL" npx prisma migrate deploy \
      --schema ./packages/database/prisma/schema.prisma \
      --config ./packages/database/prisma.config.js
  '
```

Beklenen: üç migration başarıyla uygulanır ve komut exit code `0` döner.

`PGOPTIONS` kullanılmaz: Prisma migration motorunun bu shell değişkenini
taşımadığı yerel kilit testinde doğrulanmıştır. URL `options` parametresi ile
`users` üzerinde doğrulanmış `AccessExclusiveLock` altında migration komutu
exit `1` ile **5.946 saniyede** kesilmiş ve uygulama başlatılmamıştır. Bu kanıt
disposable PostgreSQL 17 klonunda üretilmiştir; canlı sistemde test edilmemiştir.

4. Aynı komutu ikinci kez çalıştır. Beklenen: `No pending migrations to apply.`
5. Aşağıdaki son kontroller geçmeden uygulamayı başlatma.
6. Backend'i başlat, health check yeşil olduktan sonra frontend/worker trafiğini aç.
7. One-shot ve health doğrulaması tamamlanınca `cleanup_release_env; trap - EXIT INT TERM` çalıştır. Hata, CTRL-C veya TERM durumunda `trap` aynı geçici secret dosyasını otomatik kaldırır.

`deploy.sh` kapısı ayrıca aşağıdaki gibi kontrol edilir; migration komutu hatalı bir URL ile başlatıldığında süreç non-zero çıkmalı ve NestJS başlamamalıdır:

```bash
bash -n apps/backend/scripts/deploy.sh
```

## Son doğrulama

```bash
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "
SELECT migration_name,
       finished_at IS NOT NULL AS finished,
       rolled_back_at IS NOT NULL AS rolled_back
FROM _prisma_migrations
WHERE migration_name IN (
  '20260314900000_restore_crm_foundation',
  '20260806000000_align_schema_parity',
  '20260806010000_harden_auth_action_tokens'
)
ORDER BY migration_name;"
```

Beklenen: üç satır, üçünde `finished=true`, `rolled_back=false`.

```bash
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "
SELECT
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='crm_accounts' AND column_name='customer_no') AS customer_no,
  EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid WHERE t.typname='AgentStatus' AND e.enumlabel='OFFLINE') AS agent_offline,
  EXISTS (SELECT 1 FROM pg_type WHERE typname='AnnouncementChannel') AS announcement_channel,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='email_verification_jti_hash') AS email_verification_state,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='email_verification_sent_at') AS email_verification_cooldown,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='password_reset_jti_hash') AS password_reset_state,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='password_reset_sent_at') AS password_reset_cooldown,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='session_version' AND data_type='integer' AND is_nullable='NO') AS durable_session_version,
  (SELECT count(*) = 2 FROM information_schema.columns
   WHERE table_schema='public' AND table_name='users'
     AND column_name IN ('email_verification_jti_hash','password_reset_jti_hash')
     AND data_type='character varying' AND character_maximum_length=64 AND is_nullable='YES') AS auth_state_shape;"
```

Beklenen: dokuz değer de `true`.

Release checkout/container içinde:

```bash
pnpm db:verify:migration-files
pnpm db:verify:migrations
pnpm exec prisma migrate status \
  --schema packages/database/prisma/schema.prisma \
  --config packages/database/prisma.config.js
```

Beklenen: checksum doğrulaması geçer ve migration zinciri günceldir.

Ön veri sayılarıyla son sayıları karşılaştır. Migration'lar DML içermediği için bu üç tabloda kayıt kaybı beklenmez.

## İptal ve rollback

- Migration transaction içindeyken hata alırsa `BEGIN/COMMIT` sınırı otomatik rollback sağlar. Enjekte edilen hata testlerinde foundation, parity ve auth-state sonrası kataloglar referans klonla sıfır fark verdi.
- Migration 5 saniye lock timeout'a düşerse, one-shot süreç 30 saniyeyi aşarsa veya beklenmeyen SQL/constraint hatası verirse **uygulamayı başlatma**. One-shot süreci sonlandır, logları ve backup SHA-256 değerini sakla, önceki uygulama imajını migration öncesi additive şemaya karşı yeniden başlat veya forward-fix hazırla.
- Commit sonrasında veritabanında ters DDL çalıştırmak varsayılan rollback değildir. Değişiklikler additive ve eski uygulama tarafından tolere edilir; uygulama imajı geri alınır, yeni kolon/tip/indexler yerinde bırakılır ve forward-fix hazırlanır.
- `ALTER TYPE ... ADD VALUE` güvenli biçimde geri alınamaz. `OFFLINE` enum değerini kaldırmaya çalışma.
- Kolon/index/type drop komutları veri ve bağımlılık riski taşıdığı için bu runbook otomatik ters migration önermiyor.

## Secret rotasyonu sonrası

Canlı anahtarlar kullanıcı tarafından rotate edildikten sonra yeni bir production dump alınır, hemen sanitize edilir, beş sanitize kontrolü doğrulanır ve yalnız sanitize edilmiş yeni artefakt disposable klon kaynağı yapılır. Ham dump `RAW-DO-NOT-CLONE` altında kalır veya kullanıcı onayıyla güvenli biçimde kaldırılır.
