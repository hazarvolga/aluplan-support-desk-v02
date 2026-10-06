import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { LearnNowCrawlerService } from './learnnow-crawler.service';

// Opt-in and disposable only: this test creates and drops its own schema in the
// same synthetic PostgreSQL instance used by the inbound-claim race tests.
const run = process.env.LEARNNOW_CRAWL_POSTGRES === 'synthetic-local-only' ? describe : describe.skip;

function client(searchPath?: string) {
    return new PrismaClient({ adapter: new PrismaPg({
        host: '127.0.0.1',
        port: 15432,
        database: 'claim_test',
        user: 'claim_test',
        password: 'SyntheticClaimOnly-20260923',
        max: 5,
        connectionTimeoutMillis: 5000,
        options: `-c statement_timeout=10000 -c lock_timeout=8000${searchPath ? ` -c search_path=${searchPath}` : ''}`,
    }) });
}

run('actual PostgreSQL LearnNow import/delete serialization', () => {
    jest.setTimeout(30000);

    const schema = `learnnow_delete_${randomUUID().replaceAll('-', '')}`;
    const firstId = randomUUID();
    const secondId = randomUUID();
    let admin: PrismaClient;
    let importer: PrismaClient;
    let deleter: PrismaClient;

    beforeAll(async () => {
        admin = client();
        await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
        await admin.$executeRawUnsafe(
            `CREATE TYPE "${schema}"."CrawlCandidateStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'IMPORTING')`,
        );
        await admin.$executeRawUnsafe(
            `CREATE TABLE "${schema}".crawl_candidates (
                id uuid PRIMARY KEY,
                status "${schema}"."CrawlCandidateStatus" NOT NULL
            )`,
        );
        importer = client(schema);
        deleter = client(schema);
        await importer.$executeRawUnsafe(
            `INSERT INTO crawl_candidates (id, status)
             VALUES ($1::uuid, 'APPROVED'), ($2::uuid, 'PENDING_REVIEW')`,
            firstId,
            secondId,
        );
    });

    afterAll(async () => {
        await Promise.allSettled([importer?.$disconnect(), deleter?.$disconnect()]);
        if (admin) {
            await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
            await admin.$disconnect();
        }
    });

    it('locks the whole delete set and preserves every row when an import claim wins', async () => {
        let releaseClaim!: () => void;
        let announceClaim!: () => void;
        const release = new Promise<void>(resolve => { releaseClaim = resolve; });
        const claimed = new Promise<void>(resolve => { announceClaim = resolve; });

        const importClaim = importer.$transaction(async transaction => {
            const updated = await transaction.$executeRawUnsafe<number>(
                `UPDATE crawl_candidates
                 SET status = 'IMPORTING'::"CrawlCandidateStatus"
                 WHERE id = $1::uuid
                   AND status = 'APPROVED'::"CrawlCandidateStatus"`,
                firstId,
            );
            expect(Number(updated)).toBe(1);
            announceClaim();
            await release;
        });

        await Promise.race([claimed, importClaim]);
        const service = new LearnNowCrawlerService(
            deleter as never,
            {} as never,
            {} as never,
            {} as never,
            {} as never,
            {} as never,
        );
        const bulkDelete = service.bulkDeleteCandidates([firstId, secondId]);

        try {
            let observedLockWait = false;
            for (let attempt = 0; attempt < 20; attempt += 1) {
                const waits = await admin.$queryRawUnsafe<Array<{ count: bigint }>>(
                    `SELECT count(*) AS count
                     FROM pg_stat_activity
                     WHERE datname = current_database()
                       AND wait_event_type = 'Lock'`,
                );
                if (Number(waits[0]?.count ?? 0) > 0) {
                    observedLockWait = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            expect(observedLockWait).toBe(true);
        } finally {
            releaseClaim();
        }

        await importClaim;
        await expect(bulkDelete).rejects.toThrow('Importing crawler candidates cannot be deleted');
        const rows = await admin.$queryRawUnsafe<Array<{ id: string; status: string }>>(
            `SELECT id, status::text AS status
             FROM "${schema}".crawl_candidates
             ORDER BY id`,
        );
        expect(rows).toEqual(expect.arrayContaining([
            { id: firstId, status: 'IMPORTING' },
            { id: secondId, status: 'PENDING_REVIEW' },
        ]));
        expect(rows).toHaveLength(2);
    });
});
