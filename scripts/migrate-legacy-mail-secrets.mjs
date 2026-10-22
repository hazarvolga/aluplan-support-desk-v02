import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

export const LEGACY_MAIL_SECRET_KEYS = Object.freeze([
  'email.imap.pass',
  'email.smtp.pass',
]);

export function parseMigrationArgs(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === '--dry-run')) {
    return { apply: false };
  }
  if (args.length === 1 && args[0] === '--apply') {
    return { apply: true };
  }
  throw new Error('Unknown argument. Use --dry-run or --apply.');
}

function encryptionKeyBuffer(encryptionKey) {
  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey ?? '')) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes encoded as 64 hexadecimal characters.');
  }
  return Buffer.from(encryptionKey, 'hex');
}

export function encryptSettingValue(plaintext, encryptionKey) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKeyBuffer(encryptionKey), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSettingValue(ciphertext, encryptionKey) {
  const parts = typeof ciphertext === 'string' ? ciphertext.split(':') : [];
  if (parts.length !== 3 || !/^[0-9a-f]{24}$/i.test(parts[0])
      || !/^[0-9a-f]{32}$/i.test(parts[1]) || !/^(?:[0-9a-f]{2})+$/i.test(parts[2])) {
    throw new Error('Stored secret is not valid application ciphertext.');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      encryptionKeyBuffer(encryptionKey),
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('Stored secret cannot be authenticated with the current encryption key.');
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length !== LEGACY_MAIL_SECRET_KEYS.length) {
    throw new Error('Expected exactly two legacy mail password settings.');
  }

  const expectedKeys = new Set(LEGACY_MAIL_SECRET_KEYS);
  const observedKeys = new Set();
  for (const row of rows) {
    if (!expectedKeys.has(row.key) || observedKeys.has(row.key)) {
      throw new Error('Migration query returned an unexpected setting key.');
    }
    observedKeys.add(row.key);
    if (!row.is_secret && (typeof row.value !== 'string' || row.value.trim() === '' || row.value === '********')) {
      throw new Error(`Legacy mail password setting ${row.key} has an invalid value.`);
    }
  }
}

export async function migrateLegacyMailSecrets(client, options) {
  const apply = options?.apply === true;
  let inTransaction = false;
  try {
    await client.query('BEGIN');
    inTransaction = true;
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    const result = await client.query(
      `SELECT id, key, value, is_secret
       FROM settings
       WHERE key = ANY($1::text[])
       ORDER BY key
       FOR UPDATE`,
      [LEGACY_MAIL_SECRET_KEYS],
    );
    validateRows(result.rows);

    const pending = result.rows.filter((row) => !row.is_secret);
    const alreadySecured = result.rows.length - pending.length;
    if (!apply) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return { mode: 'dry-run', migrated: 0, pending: pending.length, alreadySecured };
    }

    const encryptionKey = options?.encryptionKey;
    encryptionKeyBuffer(encryptionKey);
    for (const row of result.rows.filter((candidate) => candidate.is_secret)) {
      decryptSettingValue(row.value, encryptionKey);
    }
    for (const row of pending) {
      const encryptedValue = encryptSettingValue(row.value, encryptionKey);
      const update = await client.query(
        `UPDATE settings
         SET value = $4, is_secret = TRUE, updated_at = clock_timestamp()
         WHERE id = $1 AND key = $2 AND is_secret = $3 AND value = $5`,
        [row.id, row.key, false, encryptedValue, row.value],
      );
      if (update.rowCount !== 1) {
        throw new Error(`Setting ${row.key} changed concurrently; no migration was applied.`);
      }
    }

    await client.query('COMMIT');
    inTransaction = false;
    return { mode: 'apply', migrated: pending.length, pending: 0, alreadySecured };
  } catch (error) {
    if (inTransaction) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the original failure; the connection will be closed by the caller.
      }
    }
    throw error;
  }
}

async function main() {
  const options = parseMigrationArgs(process.argv.slice(2));
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required. Environment files are not loaded automatically.');
  }
  if (options.apply) {
    encryptionKeyBuffer(process.env.ENCRYPTION_KEY);
  }

  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const result = await migrateLegacyMailSecrets(client, {
      ...options,
      encryptionKey: process.env.ENCRYPTION_KEY,
    });
    process.stdout.write(
      `legacy_mail_secret_migration mode=${result.mode} migrated=${result.migrated} pending=${result.pending} already_secured=${result.alreadySecured}\n`,
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch(() => {
    process.stderr.write('Legacy mail secret migration failed. No secret values were logged.\n');
    process.exitCode = 1;
  });
}
