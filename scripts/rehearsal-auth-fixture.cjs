'use strict';
// Operator-only fixture for a newly owned, sanitized disposable clone. Never a seed.
const assert = require('node:assert/strict');
const { randomBytes, randomUUID, createHash } = require('node:crypto');
const permissions = ['kb:read', 'ticket:create', 'ticket:read', 'ticket:update'];

function guard(env, mode) {
  assert(['prepare', 'verify'].includes(mode), 'invalid fixture mode');
  const url = new URL(env.DATABASE_URL);
  assert(env.ALLOW_LOCAL_AUTH_FIXTURE === '1' && env.NODE_ENV === 'production');
  assert(['postgres:', 'postgresql:'].includes(url.protocol) && url.username === 'rehearsal');
  assert(/^aluplan-customer-[a-f0-9]{12}-pg$/.test(url.hostname));
  assert(url.pathname === '/working_clone' && !url.search && !url.hash && (!url.port || url.port === '5432'));
  assert(/^[a-f0-9]{64}$/.test(env.AUTH_ACTION_JWT_SECRET));
}

function validateFixture(value) {
  assert(value && Object.keys(value).sort().join(',') === 'email,expiredToken,newPassword,password,resetToken,userId');
  assert(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value.userId));
  assert(value.email === `${value.userId}@example.invalid`);
  assert(/^[a-f0-9]{64}$/.test(value.password) && /^[a-f0-9]{64}$/.test(value.newPassword));
  assert.notEqual(value.password, value.newPassword);
  for (const token of [value.resetToken, value.expiredToken]) {
    assert(typeof token === 'string' && token.length <= 2048 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token));
  }
}

function assertFinalState(user, fixture) {
  assert(user && user.id === fixture.userId && user.email === fixture.email);
  assert.equal(user.sessionVersion, 1);
  assert.equal(user.passwordResetJtiHash, null);
  assert.equal(user.status, 'ACTIVE');
  assert.equal(user.deletedAt, null);
  assert.equal(user.role.name, 'CUSTOMER');
  assert.deepEqual(user.role.permissions.map(item => item.permission.name).sort(), permissions);
}

async function main(mode, supplied) {
  guard(process.env, mode); // Must precede dependencies and DB connection.
  if (mode === 'verify') validateFixture(supplied);
  const { PrismaClient } = require('/app/packages/database/client');
  const { PrismaPg } = require('/app/apps/backend/node_modules/@prisma/adapter-pg');
  const { Pool } = require('/app/apps/backend/node_modules/pg');
  const { JwtService } = require('/app/apps/backend/node_modules/@nestjs/jwt');
  const bcrypt = require('/app/apps/backend/node_modules/bcryptjs');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1,
    connectionTimeoutMillis: 5000, query_timeout: 10000 });
  const db = new PrismaClient({ adapter: new PrismaPg(pool), log: [] });
  const deadline = setTimeout(() => process.exit(1), 45000);
  try {
    if (mode === 'verify') {
      const user = await db.user.findUnique({ where: { id: supplied.userId },
        include: { role: { include: { permissions: { include: { permission: true } } } } } });
      assertFinalState(user, supplied);
      assert(await bcrypt.compare(supplied.newPassword, user.passwordHash));
      assert.equal(await bcrypt.compare(supplied.password, user.passwordHash), false);
      assert.equal(typeof user.refreshTokenHash, 'string'); // New login/refresh occurred after reset.
      assert.equal(await db.emailLog.count({ where: { recipientEmail: supplied.email,
        status: { in: ['QUEUED', 'SENT'] } } }), 0);
      return { status: 'PASS', sessionVersionIncrementedOnce: true, resetConsumed: true,
        newPasswordMatches: true, oldPasswordRejected: true, customerAuthorityPreserved: true,
        syntheticQueuedOrSentEmails: 0 };
    }
    assert.equal(await db.webhook.count({ where: { isActive: true } }), 0);
    const role = await db.role.findUnique({ where: { name: 'CUSTOMER' },
      include: { permissions: { include: { permission: true } } } });
    assert(role);
    assert.deepEqual(role.permissions.map(item => item.permission.name).sort(), permissions);
    const userId = randomUUID(), jti = randomUUID();
    const email = `${userId}@example.invalid`;
    const password = randomBytes(32).toString('hex'), newPassword = randomBytes(32).toString('hex');
    const jwt = new JwtService();
    const payload = { sub: userId, email, purpose: 'password_reset', jti };
    const options = { secret: process.env.AUTH_ACTION_JWT_SECRET,
      audience: 'aluplan:password-reset', issuer: 'aluplan-support', algorithm: 'HS256' };
    const fixture = { userId, email, password, newPassword,
      resetToken: jwt.sign(payload, { ...options, expiresIn: '30m' }),
      expiredToken: jwt.sign(payload, { ...options, expiresIn: '-1s' }) };
    validateFixture(fixture);
    await db.user.create({ data: { id: userId, email, fullName: 'Isolated auth rehearsal',
      passwordHash: await bcrypt.hash(password, 12), roleId: role.id, status: 'ACTIVE', sessionVersion: 0,
      passwordResetJtiHash: createHash('sha256').update(jti).digest('hex'), passwordResetSentAt: new Date() } });
    // Parent captures this privately in memory and pipes it to the isolated browser;
    // never log the returned fixture, bake it into an image, or persist it in Git.
    return fixture;
  } finally {
    await db.$disconnect(); await pool.end(); clearTimeout(deadline);
  }
}

module.exports = { guard, validateFixture, assertFinalState, main };
if (require.main === module || process.argv[1] === '-') {
  const mode = process.env.ALUPLAN_AUTH_FIXTURE_MODE;
  const input = process.env.ALUPLAN_AUTH_FIXTURE_JSON;
  Promise.resolve().then(() => {
    assert(!input || input.length <= 8192);
    return main(mode, input ? JSON.parse(input) : undefined);
  }).then(value => process.stdout.write(JSON.stringify(value) + '\n')).catch(() => {
    process.stderr.write('isolated auth fixture failed\n'); process.exitCode = 1;
  });
}
