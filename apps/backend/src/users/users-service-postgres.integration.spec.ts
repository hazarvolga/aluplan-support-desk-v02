import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { UsersService } from './users.service';

// Explicit opt-in, synthetic credentials, and a per-test schema keep this proof
// isolated from application and production databases.
const run = process.env.USER_SERVICE_POSTGRES === 'synthetic-local-only' ? describe : describe.skip;

function client(searchPath?: string) {
    return new PrismaClient({ adapter: new PrismaPg({
        host: '127.0.0.1',
        port: 15432,
        database: 'claim_test',
        user: 'claim_test',
        password: 'SyntheticClaimOnly-20260923',
        max: 5,
        connectionTimeoutMillis: 5000,
        options: `-c statement_timeout=10000 -c lock_timeout=8000${searchPath ? ` -c search_path=${searchPath},public` : ''}`,
    }) });
}

run('UsersService transactional delete against disposable PostgreSQL', () => {
    jest.setTimeout(30000);

    const schema = `user_delete_${randomUUID().replaceAll('-', '')}`;
    const actorId = randomUUID();
    const targetId = randomUUID();
    const roleId = randomUUID();
    let admin: PrismaClient;
    let scoped: PrismaClient;

    beforeAll(async () => {
        admin = client();
        await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
        await admin.$executeRawUnsafe(`CREATE TABLE "${schema}".roles (LIKE public.roles INCLUDING ALL)`);
        await admin.$executeRawUnsafe(`CREATE TABLE "${schema}".users (LIKE public.users INCLUDING ALL)`);
        await admin.$executeRawUnsafe(`CREATE TABLE "${schema}".audit_logs (LIKE public.audit_logs INCLUDING ALL)`);
        await admin.$executeRawUnsafe(
            `ALTER TABLE "${schema}".audit_logs
             ADD CONSTRAINT reject_user_delete_audit CHECK (action <> 'user.delete')`,
        );

        scoped = client(schema);
        await scoped.$executeRawUnsafe(
            `INSERT INTO roles (id, name, description, is_system)
             VALUES ($1::uuid, 'VIEWER', 'Synthetic viewer', false)`,
            roleId,
        );
        await scoped.$executeRawUnsafe(
            `INSERT INTO users (id, email, "fullName", "passwordHash", status, role_id)
             VALUES
               ($1::uuid, 'actor@example.invalid', 'Actor', 'synthetic-hash', 'ACTIVE', $3::uuid),
               ($2::uuid, 'target@example.invalid', 'Target', 'synthetic-hash', 'ACTIVE', $3::uuid)`,
            actorId,
            targetId,
            roleId,
        );
    });

    afterAll(async () => {
        await scoped?.$disconnect();
        if (admin) {
            await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
            await admin.$disconnect();
        }
    });

    it('rolls back the soft delete when the audit insert fails', async () => {
        const service = new UsersService(
            scoped as never,
            {} as never,
            { get: (_key: string, fallback: unknown) => fallback } as never,
        );

        await expect(service.remove(targetId, { id: actorId, role: 'ADMIN' }))
            .rejects.toThrow(/reject_user_delete_audit|check constraint/i);

        const rows = await admin.$queryRawUnsafe<Array<{
            id: string;
            status: string;
            deleted_at: Date | null;
        }>>(
            `SELECT id, status::text AS status, deleted_at
             FROM "${schema}".users
             WHERE id = $1::uuid`,
            targetId,
        );
        expect(rows).toEqual([{ id: targetId, status: 'ACTIVE', deleted_at: null }]);

        const audits = await admin.$queryRawUnsafe<Array<{ count: bigint }>>(
            `SELECT count(*) AS count FROM "${schema}".audit_logs`,
        );
        expect(Number(audits[0]?.count ?? 0)).toBe(0);
    });
});
