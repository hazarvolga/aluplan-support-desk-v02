import { readFile, writeFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
const migrationFile = process.env.MIGRATION_SQL_FILE;
const outputPath = process.env.MIGRATION_MEASUREMENT_OUTPUT;

if (!databaseUrl || !migrationFile) {
    throw new Error('DATABASE_URL and MIGRATION_SQL_FILE are required');
}
if (process.env.ALLOW_DISPOSABLE_MIGRATION_MEASUREMENT !== '1') {
    throw new Error('Set ALLOW_DISPOSABLE_MIGRATION_MEASUREMENT=1 for an explicitly disposable database');
}

const migrationSql = await readFile(migrationFile, 'utf8');
const worker = new Client({ connectionString: databaseUrl });
const observer = new Client({ connectionString: databaseUrl });
await Promise.all([worker.connect(), observer.connect()]);

try {
    const identity = await worker.query(`
        SELECT current_database() AS database_name,
               COALESCE(inet_server_addr()::text, 'local-socket') AS server_address,
               COALESCE(inet_server_port(), current_setting('port')::integer) AS server_port
    `);
    const databaseName = identity.rows[0].database_name;
    if (!/^faz8_measure_[1-3]$/.test(databaseName)) {
        throw new Error(`Refusing migration measurement against non-disposable database: ${databaseName}`);
    }

    const workerPid = worker.processID;
    let running = true;
    const samples = [];
    const observerLoop = (async () => {
        while (running) {
            const locks = await observer.query(
                `SELECT locktype, mode, granted, relation::regclass::text AS relation
                 FROM pg_locks
                 WHERE pid = $1
                 ORDER BY locktype, mode, relation NULLS LAST`,
                [workerPid],
            );
            if (locks.rows.length > 0) {
                samples.push({ atNs: process.hrtime.bigint().toString(), locks: locks.rows });
            }
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    })();

    const startedAt = process.hrtime.bigint();
    let error;
    try {
        await worker.query(migrationSql);
    } catch (caught) {
        error = caught;
    } finally {
        running = false;
        await observerLoop;
    }
    const finishedAt = process.hrtime.bigint();

    const lockSummary = [...new Map(
        samples.flatMap((sample) => sample.locks).map((lock) => [
            `${lock.locktype}|${lock.mode}|${lock.granted}|${lock.relation ?? ''}`,
            lock,
        ]),
    ).values()];
    const result = {
        database: identity.rows[0],
        migrationFile,
        durationMs: Number(finishedAt - startedAt) / 1_000_000,
        sampleCount: samples.length,
        lockSummary,
        succeeded: !error,
        error: error?.message ?? null,
    };

    if (outputPath) {
        await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
    }
    console.log(JSON.stringify(result, null, 2));
    if (error) throw error;
} finally {
    await Promise.allSettled([worker.end(), observer.end()]);
}
