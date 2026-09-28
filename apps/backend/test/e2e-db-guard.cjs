// Fail closed before importing AppModule or opening Prisma in generic E2E tests.
// This does not replace an isolated database/container; it prevents accidental
// execution against inherited production or shared-cluster DATABASE_URL values.
const raw = process.env.DATABASE_URL;
let target;
try {
  target = new URL(raw);
} catch {
  throw new Error('Backend E2E requires an explicit disposable local database');
}

const query = [...target.searchParams.entries()];
if (
  process.env.NODE_ENV !== 'test' ||
  process.env.BACKEND_E2E_DISPOSABLE_DB !== 'aluplan-test-ephemeral' ||
  target.protocol !== 'postgresql:' ||
  !['127.0.0.1', 'localhost'].includes(target.hostname) ||
  target.port !== '5433' ||
  target.pathname !== '/aluplan_test' ||
  decodeURIComponent(target.username) !== 'postgres' ||
  !target.password ||
  target.hash ||
  query.length !== 1 || query[0][0] !== 'schema' || query[0][1] !== 'public'
) {
  throw new Error('Backend E2E refused a database outside its disposable local target');
}
