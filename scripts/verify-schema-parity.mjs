import { spawnSync } from 'node:child_process';

const allowedResidual = [
    '-- DropIndex',
    'DROP INDEX "idx_faq_entries_embedding_version_dim";',
].join('\n');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for schema parity verification');
}

const result = spawnSync(
    'pnpm',
    [
        'exec',
        'prisma',
        'migrate',
        'diff',
        '--config',
        'packages/database/prisma.config.js',
        '--from-config-datasource',
        '--to-schema',
        'packages/database/prisma/schema.prisma',
        '--script',
    ],
    {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env,
        timeout: 60_000,
        maxBuffer: 4 * 1024 * 1024,
    },
);

if (result.error) {
    throw new Error('Unable to complete Prisma schema parity diff');
}

if (result.status !== 0) {
    throw new Error('Prisma schema parity diff failed');
}

const normalizedDiff = result.stdout
    .split('\n')
    .filter((line) => !line.startsWith('[dotenv@'))
    .join('\n')
    .trim();
if (normalizedDiff !== allowedResidual) {
    if (normalizedDiff) {
        process.stderr.write(`${normalizedDiff}\n`);
    }
    throw new Error(
        'Unexpected schema drift; only the externally managed partial FAQ index is allowed',
    );
}

console.log(
    'Schema parity verified: only the allowlisted partial FAQ embedding index remains externally managed.',
);
