import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const image = 'sha256:7ae6051efd0e60444282c27c7e141af07f322ce033300e727a49c3dd11075e38';
const bridge = fileURLToPath(new URL('./release-mail-settings-bridge.psql', import.meta.url));

function docker(args, input) {
    return spawnSync('docker', args, {
        encoding: 'utf8',
        input,
        timeout: 30000,
        maxBuffer: 1024 * 1024,
    });
}

function psql(container, database, sql) {
    return docker(['exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-tA'], sql);
}

function checkedPsql(container, database, sql) {
    const result = psql(container, database, sql);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
}

const schema = `
CREATE TABLE settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key varchar(100) NOT NULL UNIQUE,
    value text NOT NULL,
    is_secret boolean NOT NULL DEFAULT false,
    updated_by uuid,
    updated_at timestamp(3) NOT NULL
);
`;

const seed = `
TRUNCATE settings;
INSERT INTO settings (key, value, is_secret, updated_at) VALUES
('email.imap.host', 'mail.allplan.net.tr', false, '2026-01-01'),
('email.imap.port', '143', false, '2026-01-01'),
('email.imap.tls', 'false', false, '2026-01-01'),
('email.imap.user', 'destek@allplan.net.tr', false, '2026-01-01'),
('email.imap.pass', 'synthetic-legacy-secret', false, '2026-01-01'),
('email.smtp.host', 'mail.allplan.net.tr', false, '2026-01-01'),
('email.smtp.port', '587', false, '2026-01-01'),
('email.smtp.secure', 'false', false, '2026-01-01'),
('email.smtp.user', 'destek@allplan.net.tr', false, '2026-01-01'),
('email.smtp.pass', 'synthetic-encrypted-secret', true, '2026-01-01'),
('unrelated.setting', 'must-remain-unchanged', false, '2026-01-01');
`;

const snapshot = `SELECT jsonb_object_agg(key, jsonb_build_object(
    'id', id, 'value', value, 'is_secret', is_secret,
    'updated_by', updated_by, 'updated_at', updated_at))::text FROM settings;`;

test('offline mail bridge changes only two IMAP values and fails closed', { skip: process.env.MAIL_SETTINGS_BRIDGE_TEST !== 'isolated-local-only' }, async () => {
    const sql = readFileSync(bridge, 'utf8');
    assert.match(sql, /ON_ERROR_STOP/);

    const context = execFileSync('docker', ['context', 'show'], { encoding: 'utf8' }).trim();
    const endpoint = JSON.parse(execFileSync('docker', ['context', 'inspect', '--format', '{{json .Endpoints.docker.Host}}'], { encoding: 'utf8' }).trim());
    assert.equal(context, 'desktop-linux');
    assert.equal(endpoint, `unix://${homedir()}/.docker/run/docker.sock`);
    assert.equal(process.env.DOCKER_HOST, undefined);
    const container = `aluplan-mail-bridge-test-${randomBytes(5).toString('hex')}`;
    const ownerLabel = `mail-settings-bridge-${randomBytes(8).toString('hex')}`;
    let startAttempted = false;
    let started = false;

    try {
        startAttempted = true;
        const start = docker([
            'run', '-d', '--pull', 'never', '--name', container, '--network', 'none',
            '--label', `aluplan.test=${ownerLabel}`,
            '--log-driver', 'none', '--tmpfs', '/var/lib/postgresql/data:rw,size=512m',
            '-e', 'POSTGRES_PASSWORD=synthetic-only', '-e', 'POSTGRES_DB=aluplan_support', image,
        ]);
        assert.equal(start.status, 0, start.stderr);
        started = true;

        let ready = false;
        for (let attempt = 0; attempt < 60; attempt += 1) {
            const status = docker(['exec', container, 'pg_isready', '-U', 'postgres', '-d', 'aluplan_support']);
            if (status.status === 0) {
                ready = true;
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        assert.equal(ready, true, 'synthetic PostgreSQL did not become ready');
        checkedPsql(container, 'aluplan_support', schema);
        checkedPsql(container, 'aluplan_support', seed);

        const before = JSON.parse(checkedPsql(container, 'aluplan_support', snapshot));
        const first = psql(container, 'aluplan_support', sql);
        assert.equal(first.status, 0, first.stderr);
        const after = JSON.parse(checkedPsql(container, 'aluplan_support', snapshot));
        assert.equal(after['email.imap.port'].value, '993');
        assert.equal(after['email.imap.tls'].value, 'true');
        for (const key of ['email.imap.port', 'email.imap.tls']) {
            assert.equal(after[key].id, before[key].id);
            assert.equal(after[key].is_secret, before[key].is_secret);
            assert.equal(after[key].updated_by, before[key].updated_by);
            assert.notEqual(after[key].updated_at, before[key].updated_at);
        }
        for (const key of Object.keys(before).filter((key) => !['email.imap.port', 'email.imap.tls'].includes(key))) {
            assert.deepEqual(after[key], before[key], `${key} changed unexpectedly`);
        }

        const second = psql(container, 'aluplan_support', sql);
        assert.equal(second.status, 0, second.stderr);
        assert.deepEqual(JSON.parse(checkedPsql(container, 'aluplan_support', snapshot)), after);

        checkedPsql(container, 'aluplan_support', `${seed} UPDATE settings SET value = '143' WHERE key = 'email.imap.port'; UPDATE settings SET value = 'true' WHERE key = 'email.imap.tls';`);
        const mixedBefore = checkedPsql(container, 'aluplan_support', snapshot);
        assert.notEqual(psql(container, 'aluplan_support', sql).status, 0);
        assert.equal(checkedPsql(container, 'aluplan_support', snapshot), mixedBefore);

        checkedPsql(container, 'aluplan_support', `${seed} DELETE FROM settings WHERE key = 'email.imap.pass';`);
        const missingBefore = checkedPsql(container, 'aluplan_support', snapshot);
        assert.notEqual(psql(container, 'aluplan_support', sql).status, 0);
        assert.equal(checkedPsql(container, 'aluplan_support', snapshot), missingBefore);

        checkedPsql(container, 'aluplan_support', `${seed} UPDATE settings SET value = 'wrong.example.invalid' WHERE key = 'email.smtp.host';`);
        const wrongHostBefore = checkedPsql(container, 'aluplan_support', snapshot);
        assert.notEqual(psql(container, 'aluplan_support', sql).status, 0);
        assert.equal(checkedPsql(container, 'aluplan_support', snapshot), wrongHostBefore);

        checkedPsql(container, 'aluplan_support', `${seed} UPDATE settings SET value = '********' WHERE key = 'email.smtp.pass';`);
        const maskedBefore = checkedPsql(container, 'aluplan_support', snapshot);
        assert.notEqual(psql(container, 'aluplan_support', sql).status, 0);
        assert.equal(checkedPsql(container, 'aluplan_support', snapshot), maskedBefore);

        checkedPsql(container, 'aluplan_support', `${seed} UPDATE settings SET is_secret = true WHERE key = 'email.imap.port';`);
        const wrongFlagBefore = checkedPsql(container, 'aluplan_support', snapshot);
        assert.notEqual(psql(container, 'aluplan_support', sql).status, 0);
        assert.equal(checkedPsql(container, 'aluplan_support', snapshot), wrongFlagBefore);

        checkedPsql(container, 'aluplan_support', seed);
        const heldSession = spawn('docker', [
            'exec', container, 'psql', '-X', '-U', 'postgres', '-d', 'aluplan_support',
            '-c', 'SELECT pg_sleep(12)',
        ], { stdio: 'ignore' });
        try {
            let sessionVisible = false;
            for (let attempt = 0; attempt < 40; attempt += 1) {
                const count = Number(checkedPsql(container, 'aluplan_support', `
                    SELECT count(*) FROM pg_catalog.pg_stat_activity
                    WHERE datname = current_database() AND pid <> pg_backend_pid()
                      AND query LIKE 'SELECT pg_sleep(12)%' AND state = 'active';
                `));
                if (count > 0) {
                    sessionVisible = true;
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            assert.equal(sessionVisible, true, 'synthetic competing DB session was not observed');
            const concurrentBefore = checkedPsql(container, 'aluplan_support', snapshot);
            const concurrent = psql(container, 'aluplan_support', sql);
            assert.notEqual(concurrent.status, 0);
            assert.match(concurrent.stderr, /MAIL_BRIDGE_OTHER_DATABASE_SESSIONS/);
            assert.equal(checkedPsql(container, 'aluplan_support', snapshot), concurrentBefore);
        } finally {
            heldSession.kill('SIGTERM');
        }

        const wrongDatabase = psql(container, 'postgres', sql);
        assert.notEqual(wrongDatabase.status, 0);
        assert.match(wrongDatabase.stderr, /MAIL_BRIDGE_WRONG_DATABASE/);
    } finally {
        if (startAttempted) {
            const owner = docker(['inspect', '--format', '{{index .Config.Labels "aluplan.test"}}', container]);
            if (owner.status === 0) {
                assert.equal(owner.stdout.trim(), ownerLabel, 'unexpected container owner; refusing cleanup');
                const removed = docker(['rm', '-f', container]);
                assert.equal(removed.status, 0, removed.stderr);
            } else if (started) {
                assert.fail('synthetic database container disappeared before cleanup verification');
            }
        }
    }
});
