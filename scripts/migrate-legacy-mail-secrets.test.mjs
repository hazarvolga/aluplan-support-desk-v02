import assert from 'node:assert/strict';
import { createDecipheriv } from 'node:crypto';
import { test } from 'node:test';

import {
  LEGACY_MAIL_SECRET_KEYS,
  decryptSettingValue,
  encryptSettingValue,
  migrateLegacyMailSecrets,
  parseMigrationArgs,
} from './migrate-legacy-mail-secrets.mjs';

const encryptionKey = '11'.repeat(32);

function fakeClient(rows) {
  const calls = [];
  return {
    calls,
    async query(text, params = []) {
      calls.push({ text, params });
      if (/SELECT id, key, value, is_secret/.test(text)) return { rows };
      if (/UPDATE settings/.test(text)) return { rowCount: 1 };
      return { rowCount: 0, rows: [] };
    },
  };
}

test('defaults to dry-run and requires an explicit apply switch', () => {
  assert.deepEqual(parseMigrationArgs([]), { apply: false });
  assert.deepEqual(parseMigrationArgs(['--dry-run']), { apply: false });
  assert.deepEqual(parseMigrationArgs(['--apply']), { apply: true });
  assert.throws(() => parseMigrationArgs(['--force']), /Unknown argument/);
});

test('uses only the two bounded historical mail password keys', () => {
  assert.deepEqual(LEGACY_MAIL_SECRET_KEYS, ['email.imap.pass', 'email.smtp.pass']);
});

test('dry-run locks and inspects candidates but performs no update', async () => {
  const client = fakeClient([
    { id: 'imap-id', key: 'email.imap.pass', value: 'imap-plain', is_secret: false },
    { id: 'smtp-id', key: 'email.smtp.pass', value: 'already-encrypted', is_secret: true },
  ]);

  const result = await migrateLegacyMailSecrets(client, { apply: false });

  assert.deepEqual(result, { mode: 'dry-run', migrated: 0, pending: 1, alreadySecured: 1 });
  assert.equal(client.calls.some(({ text }) => /UPDATE settings/.test(text)), false);
  assert.match(client.calls.at(-1).text, /ROLLBACK/);
  assert.deepEqual(client.calls.find(({ text }) => /SELECT id, key/.test(text)).params, [LEGACY_MAIL_SECRET_KEYS]);
});

test('apply encrypts each plaintext row transactionally without returning secret material', async () => {
  const client = fakeClient([
    { id: 'imap-id', key: 'email.imap.pass', value: 'imap-plain', is_secret: false },
    { id: 'smtp-id', key: 'email.smtp.pass', value: 'smtp-plain', is_secret: false },
  ]);

  const result = await migrateLegacyMailSecrets(client, { apply: true, encryptionKey });

  assert.deepEqual(result, { mode: 'apply', migrated: 2, pending: 0, alreadySecured: 0 });
  const updates = client.calls.filter(({ text }) => /UPDATE settings/.test(text));
  assert.equal(updates.length, 2);
  assert.equal(updates.every(({ params }) => params[1] === 'email.imap.pass' || params[1] === 'email.smtp.pass'), true);
  assert.equal(updates.every(({ params }) => params[2] === false && !params[3].includes('plain')), true);
  assert.match(client.calls.at(-1).text, /COMMIT/);
  assert.doesNotMatch(JSON.stringify(result), /imap-plain|smtp-plain/);
});

test('apply is idempotent when both rows are already secured', async () => {
  const client = fakeClient(LEGACY_MAIL_SECRET_KEYS.map((key, index) => ({
    id: `secured-${index}`,
    key,
    value: encryptSettingValue(`secured-value-${index}`, encryptionKey),
    is_secret: true,
  })));

  const result = await migrateLegacyMailSecrets(client, { apply: true, encryptionKey });

  assert.deepEqual(result, { mode: 'apply', migrated: 0, pending: 0, alreadySecured: 2 });
  assert.equal(client.calls.some(({ text }) => /UPDATE settings/.test(text)), false);
  assert.match(client.calls.at(-1).text, /COMMIT/);
});

test('apply rolls back when an already-secured row is malformed or encrypted with another key', async () => {
  for (const storedValue of [
    'not-application-ciphertext',
    encryptSettingValue('wrong-key-value', '22'.repeat(32)),
  ]) {
    const client = fakeClient([
      { id: 'imap-id', key: 'email.imap.pass', value: storedValue, is_secret: true },
      {
        id: 'smtp-id', key: 'email.smtp.pass',
        value: encryptSettingValue('valid-value', encryptionKey), is_secret: true,
      },
    ]);

    await assert.rejects(
      migrateLegacyMailSecrets(client, { apply: true, encryptionKey }),
      /ciphertext|authenticated/,
    );
    assert.equal(client.calls.some(({ text }) => /UPDATE settings/.test(text)), false);
    assert.match(client.calls.at(-1).text, /ROLLBACK/);
  }
});

test('fails closed and rolls back for missing rows, invalid values, invalid keys, or stale updates', async () => {
  for (const rows of [
    [{ id: 'imap-id', key: 'email.imap.pass', value: 'plain', is_secret: false }],
    [
      { id: 'imap-id', key: 'email.imap.pass', value: '', is_secret: false },
      { id: 'smtp-id', key: 'email.smtp.pass', value: 'plain', is_secret: false },
    ],
    [
      { id: 'imap-id', key: 'email.imap.pass', value: 'plain', is_secret: false },
      { id: 'bad-id', key: 'unbounded.secret', value: 'plain', is_secret: false },
    ],
  ]) {
    const client = fakeClient(rows);
    await assert.rejects(
      migrateLegacyMailSecrets(client, { apply: true, encryptionKey }),
      /exactly|invalid|unexpected/i,
    );
    assert.match(client.calls.at(-1).text, /ROLLBACK/);
  }

  const staleClient = fakeClient([
    { id: 'imap-id', key: 'email.imap.pass', value: 'plain-a', is_secret: false },
    { id: 'smtp-id', key: 'email.smtp.pass', value: 'plain-b', is_secret: false },
  ]);
  const originalQuery = staleClient.query.bind(staleClient);
  staleClient.query = async (text, params) => {
    const result = await originalQuery(text, params);
    return /UPDATE settings/.test(text) ? { rowCount: 0 } : result;
  };
  await assert.rejects(
    migrateLegacyMailSecrets(staleClient, { apply: true, encryptionKey }),
    /changed concurrently/,
  );
  assert.match(staleClient.calls.at(-1).text, /ROLLBACK/);
});

test('encryption is non-deterministic and decryptable with the application wire format', () => {
  const first = encryptSettingValue('synthetic-secret', encryptionKey);
  const second = encryptSettingValue('synthetic-secret', encryptionKey);
  assert.notEqual(first, second);
  assert.match(first, /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);
  assert.doesNotMatch(first, /synthetic-secret/);

  const [ivHex, authTagHex, encryptedHex] = first.split(':');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
  assert.equal(decrypted, 'synthetic-secret');
  assert.equal(decryptSettingValue(first, encryptionKey), 'synthetic-secret');
});
