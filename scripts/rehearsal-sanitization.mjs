// Pure, fixed-policy SQL preparation only. Caller must enforce disposable local DB,
// reviewed full schema/table inventory, no triggers/rules/RLS and blocked egress.
// Retains PII, free text, JSON and historical jobs: NOT anonymization or boot approval.
const REQUIRED = {
  users: { passwordHash: "'!LOCAL_REFERENCE_LOGIN_DISABLED!'", refresh_token_hash: 'NULL' },
  crm_connections: { tenant_id: 'NULL', client_id: 'NULL', client_secret: 'NULL', webhook_secret: 'NULL', instance_url: 'NULL', is_active: 'false', sync_settings: 'NULL' },
  crm_delta_sync_states: { delta_link: 'NULL' },
  settings: { value: "''" },
  webhooks: { url: "'https://disabled.invalid/'", secret: 'NULL', is_active: 'false' },
};
const OPTIONAL_USER_FIELDS = {
  session_version: '0',
  email_verification_jti_hash: 'NULL',
  email_verification_sent_at: 'NULL',
  password_reset_jti_hash: 'NULL',
  password_reset_sent_at: 'NULL',
};
const SENSITIVE = /password|secret|token_hash|session_version|verification|credential|api_?key|private_?key|access_?token|refresh_?token|mfa|totp|hotp|otp|recovery|backup_?code|authenticator|passkey|webauthn/i;
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function reviewedInventory(columns) {
  if (!Array.isArray(columns) || columns.length === 0) throw new Error('Column inventory required');
  const keys = columns.map(row => {
    if (!row || typeof row.table !== 'string' || typeof row.column !== 'string' ||
        !IDENTIFIER.test(row.table) || !IDENTIFIER.test(row.column)) throw new Error('Invalid column inventory');
    return `${row.table}.${row.column}`;
  });
  const present = new Set(keys);
  if (present.size !== keys.length) throw new Error('Duplicate column inventory');
  const required = [...Object.entries(REQUIRED).flatMap(([table, fields]) => Object.keys(fields).map(column => `${table}.${column}`)), 'settings.is_secret'];
  if (required.some(key => !present.has(key))) throw new Error('Required column missing');
  const allowed = new Set([...required, ...Object.keys(OPTIONAL_USER_FIELDS).map(column => `users.${column}`)]);
  if (columns.some(row => SENSITIVE.test(row.column) && !allowed.has(`${row.table}.${row.column}`))) {
    throw new Error('Unreviewed credential/schema drift');
  }
  return { present, keys: [...keys].sort() };
}

/** Accepts public information_schema column rows: [{ table, column }]. No values. */
export function buildSanitizationPlan(columns) {
  const { present, keys } = reviewedInventory(columns);
  const optional = Object.fromEntries(Object.entries(OPTIONAL_USER_FIELDS).filter(([column]) => present.has(`users.${column}`)));
  const policy = { ...REQUIRED, users: { ...REQUIRED.users, ...optional } };
  const excludedColumns = Object.fromEntries(Object.entries(policy).map(([table, fields]) => [table, Object.keys(fields)]));
  // Inventory values are strict identifiers rendered as SQL literals, never targets.
  // Full public-column equality is repeated inside the transaction before any write.
  const inventoryGuard = `DO $guard$
BEGIN
  IF (SELECT array_agg(table_name || '.' || column_name ORDER BY table_name || '.' || column_name COLLATE "C")
      FROM information_schema.columns WHERE table_schema='public')
      IS DISTINCT FROM ARRAY[${keys.map(key => `'${key}'`).join(',')}]::text[] THEN
    RAISE EXCEPTION 'Rehearsal column inventory changed';
  END IF;
END $guard$;`;
  const updates = Object.entries(policy).map(([table, fields]) =>
    `UPDATE public."${table}" SET ${Object.entries(fields).map(([column, value]) => `"${column}"=${value}`).join(',')};`);
  const counts = Object.entries(policy).map(([table, fields]) =>
    `(SELECT count(*) FROM public."${table}" WHERE ${Object.entries(fields).map(([column, value]) => `"${column}" IS DISTINCT FROM ${value}`).join(' OR ')})`);
  const unsafeAssertionSql = `SELECT\n${counts.join(' +\n')};`;
  return { sql: `BEGIN;\n${inventoryGuard}\n${updates.join('\n')}\nCOMMIT;`, unsafeAssertionSql, excludedColumns };
}
