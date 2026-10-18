import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import test from 'node:test';
import pg from 'pg';

import {
  decryptSettingValue,
  migrateLegacyMailSecrets,
} from './migrate-legacy-mail-secrets.mjs';

const image = 'sha256:7ae6051efd0e60444282c27c7e141af07f322ce033300e727a49c3dd11075e38';
const encryptionKey = '11'.repeat(32);

function docker(args) {
  return spawnSync('docker', args, {
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  });
}

async function connectWithRetry(connectionString) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const client = new pg.Client({ connectionString });
    try {
      await client.connect();
      return client;
    } catch {
      await client.end().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('Synthetic PostgreSQL did not become ready.');
}

test('real PostgreSQL migration rolls back atomically and reruns idempotently', {
  skip: process.env.LEGACY_MAIL_SECRET_MIGRATION_TEST !== 'isolated-local-only',
  timeout: 60000,
}, async () => {
  const context = execFileSync('docker', ['context', 'show'], { encoding: 'utf8' }).trim();
  const endpoint = JSON.parse(execFileSync(
    'docker',
    ['context', 'inspect', '--format', '{{json .Endpoints.docker.Host}}'],
    { encoding: 'utf8' },
  ).trim());
  assert.equal(context, 'desktop-linux');
  assert.equal(endpoint, `unix://${homedir()}/.docker/run/docker.sock`);
  assert.equal(process.env.DOCKER_HOST, undefined);

  const container = `aluplan-mail-secret-migration-${randomBytes(5).toString('hex')}`;
  const ownerLabel = `mail-secret-migration-${randomBytes(8).toString('hex')}`;
  let client;
  let started = false;
  try {
    const start = docker([
      'run', '-d', '--pull', 'never', '--name', container,
      '--label', `aluplan.test=${ownerLabel}`,
      '--log-driver', 'none', '--tmpfs', '/var/lib/postgresql/data:rw,size=512m',
      '-p', '127.0.0.1::5432',
      '-e', 'POSTGRES_PASSWORD=synthetic-only', '-e', 'POSTGRES_DB=aluplan_support',
      image,
    ]);
    assert.equal(start.status, 0, start.stderr);
    started = true;

    const portResult = docker(['port', container, '5432/tcp']);
    assert.equal(portResult.status, 0, portResult.stderr);
    const port = portResult.stdout.trim().match(/:(\d+)$/)?.[1];
    assert.ok(port, 'Synthetic PostgreSQL port was not assigned.');
    client = await connectWithRetry(`postgresql://postgres:synthetic-only@127.0.0.1:${port}/aluplan_support`);

    await client.query(`
      CREATE TABLE settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        key varchar(100) NOT NULL UNIQUE,
        value text NOT NULL,
        is_secret boolean NOT NULL DEFAULT false,
        updated_at timestamp(3) NOT NULL DEFAULT now()
      );
      INSERT INTO settings (key, value, is_secret) VALUES
        ('email.imap.pass', 'synthetic-imap-plain', false),
        ('email.smtp.pass', 'synthetic-smtp-plain', false);
      CREATE FUNCTION reject_smtp_migration() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.key = 'email.smtp.pass' AND NEW.is_secret THEN
          RAISE EXCEPTION 'synthetic forced failure';
        END IF;
        RETURN NEW;
      END $$;
      CREATE TRIGGER reject_smtp_migration
        BEFORE UPDATE ON settings
        FOR EACH ROW EXECUTE FUNCTION reject_smtp_migration();
    `);

    await assert.rejects(
      migrateLegacyMailSecrets(client, { apply: true, encryptionKey }),
      /synthetic forced failure/,
    );
    const afterRollback = await client.query('SELECT key, value, is_secret FROM settings ORDER BY key');
    assert.deepEqual(afterRollback.rows, [
      { key: 'email.imap.pass', value: 'synthetic-imap-plain', is_secret: false },
      { key: 'email.smtp.pass', value: 'synthetic-smtp-plain', is_secret: false },
    ]);

    await client.query('DROP TRIGGER reject_smtp_migration ON settings');
    const applied = await migrateLegacyMailSecrets(client, { apply: true, encryptionKey });
    assert.deepEqual(applied, { mode: 'apply', migrated: 2, pending: 0, alreadySecured: 0 });
    const secured = await client.query('SELECT key, value, is_secret FROM settings ORDER BY key');
    assert.equal(secured.rows.every((row) => row.is_secret), true);
    assert.deepEqual(
      secured.rows.map((row) => decryptSettingValue(row.value, encryptionKey)),
      ['synthetic-imap-plain', 'synthetic-smtp-plain'],
    );

    const rerun = await migrateLegacyMailSecrets(client, { apply: true, encryptionKey });
    assert.deepEqual(rerun, { mode: 'apply', migrated: 0, pending: 0, alreadySecured: 2 });
    assert.deepEqual(
      (await client.query('SELECT key, value, is_secret FROM settings ORDER BY key')).rows,
      secured.rows,
    );
  } finally {
    await client?.end().catch(() => undefined);
    if (started) {
      const owner = docker(['inspect', '--format', '{{index .Config.Labels "aluplan.test"}}', container]);
      assert.equal(owner.status, 0, 'Synthetic database container disappeared before cleanup verification.');
      assert.equal(owner.stdout.trim(), ownerLabel, 'Unexpected container owner; refusing cleanup.');
      const removed = docker(['rm', '-f', container]);
      assert.equal(removed.status, 0, removed.stderr);
    }
  }
});
