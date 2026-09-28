#!/usr/bin/env node
// Operator-only, one-shot production R2 read canary. No object bytes or keys are printed or saved.
const { createDecipheriv, createHash } = require('node:crypto');
const { existsSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');

const BUCKET = 'aluplan-support-desk';
const ENDPOINT = 'https://457188683bc1b5df04c2ef11a013605a.r2.cloudflarestorage.com';
const MAX_OBJECT_BYTES = 1024 * 1024;
const MAX_OBJECTS = 3;

function backendRequire() {
    const checkoutPackage = path.resolve(__dirname, '../apps/backend/package.json');
    const runtimePackage = existsSync(checkoutPackage) ? checkoutPackage : path.resolve(process.cwd(), 'package.json');
    if (!runtimePackage.endsWith('/apps/backend/package.json')) throw new Error('Backend package context unavailable');
    return createRequire(runtimePackage);
}

function selectCandidates(rows, listed, maxBytes = MAX_OBJECT_BYTES) {
    const selected = [];
    const seen = new Set();
    for (const row of rows) {
        if (selected.length === MAX_OBJECTS) break;
        const key = row.url;
        const size = Number(row.file_size);
        if (typeof key !== 'string' || !key || key.startsWith('FAILED_STORAGE_UPLOAD_') || seen.has(key)) continue;
        if (!Number.isSafeInteger(size) || size < 1 || size > maxBytes || listed.get(key) !== size) continue;
        seen.add(key);
        selected.push({ url: key, size });
    }
    return selected;
}

async function hashBoundedBody(body, expectedBytes, maxBytes = MAX_OBJECT_BYTES) {
    if (!body || !Number.isSafeInteger(expectedBytes) || expectedBytes < 1 || expectedBytes > maxBytes) {
        throw new Error('Object budget is invalid');
    }
    const hash = createHash('sha256');
    let bytes = 0;
    try {
        for await (const chunk of body) {
            bytes += chunk.length;
            if (bytes > maxBytes || bytes > expectedBytes) throw new Error('Object budget exceeded');
            hash.update(chunk);
        }
        if (bytes !== expectedBytes) throw new Error('Object length differs from metadata');
        return { bytes, sha256: hash.digest('hex') };
    } finally {
        body.destroy?.();
    }
}

function verifyGetHeaders(object, head, expectedBytes) {
    const contentRange = `bytes 0-${expectedBytes - 1}/${expectedBytes}`;
    if (!object?.Body || !head?.ETag || object.ContentLength !== expectedBytes ||
        object.ContentRange !== contentRange || object.ETag !== head.ETag) {
        object?.Body?.destroy?.();
        throw new Error('R2 GET metadata changed or exceeded scope');
    }
}

function decryptSetting(row, encryptionKey) {
    if (!row) return '';
    if (!row.is_secret) return row.value;
    if (!/^[a-f0-9]{64}$/i.test(encryptionKey || '')) throw new Error('Encryption key unavailable');
    const parts = row.value.split(':');
    if (parts.length !== 3 || !parts.every(part => /^[a-f0-9]+$/i.test(part))) {
        throw new Error('Encrypted setting format invalid');
    }
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), Buffer.from(parts[0], 'hex'));
    decipher.setAuthTag(Buffer.from(parts[1], 'hex'));
    return decipher.update(parts[2], 'hex', 'utf8') + decipher.final('utf8');
}

async function loadScope() {
    if (!process.env.DATABASE_URL || process.env.STORAGE_TYPE !== 'S3') throw new Error('Storage configuration unavailable');
    const { Client } = backendRequire()('pg');
    const db = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
        query_timeout: 10000,
    });
    await db.connect();
    try {
        await db.query('BEGIN TRANSACTION READ ONLY');
        const settings = await db.query(
            "SELECT key, value, is_secret FROM settings WHERE key = ANY($1::text[])",
            [['storage.endpoint', 'storage.region', 'storage.access_key', 'storage.secret_key', 'storage.bucket']],
        );
        const attachments = await db.query(
            'SELECT url, file_size FROM attachments WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
        );
        await db.query('ROLLBACK');
        const values = new Map(settings.rows.map(row => [row.key, decryptSetting(row, process.env.ENCRYPTION_KEY)]));
        return {
            endpoint: (values.get('storage.endpoint') || process.env.STORAGE_ENDPOINT || '').trim().replace(/\/+$/, ''),
            region: (values.get('storage.region') || process.env.STORAGE_REGION || 'auto').trim(),
            accessKey: (values.get('storage.access_key') || process.env.STORAGE_ACCESS_KEY || '').trim(),
            secretKey: (values.get('storage.secret_key') || process.env.STORAGE_SECRET_KEY || '').trim(),
            bucket: (values.get('storage.bucket') || process.env.STORAGE_BUCKET || '').trim(),
            attachments: attachments.rows,
        };
    } finally {
        await db.end();
    }
}

async function main() {
    const scope = await loadScope();
    if (scope.bucket !== BUCKET || scope.endpoint !== ENDPOINT || !scope.accessKey || !scope.secretKey) {
        throw new Error('R2 target or credentials do not match the approved scope');
    }
    const { S3Client, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } = backendRequire()('@aws-sdk/client-s3');
    const client = new S3Client({
        endpoint: ENDPOINT,
        region: scope.region || 'auto',
        credentials: { accessKeyId: scope.accessKey, secretAccessKey: scope.secretKey },
        forcePathStyle: true,
        maxAttempts: 1,
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
        const listed = new Map();
        let token;
        let complete = false;
        for (let page = 0; page < 2; page += 1) {
            const result = await client.send(new ListObjectsV2Command({
                Bucket: BUCKET, MaxKeys: 1000, ...(token ? { ContinuationToken: token } : {}),
            }), { abortSignal: controller.signal });
            for (const object of result.Contents || []) {
                if (typeof object.Key !== 'string' || !Number.isSafeInteger(object.Size) || listed.has(object.Key)) {
                    throw new Error('R2 list metadata invalid');
                }
                listed.set(object.Key, object.Size);
            }
            if (listed.size > 2000) throw new Error('R2 listing budget exceeded');
            if (!result.IsTruncated) { complete = true; break; }
            if (!result.NextContinuationToken || result.NextContinuationToken === token) throw new Error('R2 pagination invalid');
            token = result.NextContinuationToken;
        }
        if (!complete) throw new Error('R2 listing budget exceeded');
        const selected = selectCandidates(scope.attachments, listed);
        if (!selected.length) throw new Error('No eligible small attachment');
        let bytesRead = 0;
        for (const candidate of selected) {
            const head = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: candidate.url }), { abortSignal: controller.signal });
            if (head.ContentLength !== candidate.size) throw new Error('R2 HEAD length mismatch');
            if (!head.ETag) throw new Error('R2 HEAD ETag missing');
            const object = await client.send(new GetObjectCommand({
                Bucket: BUCKET, Key: candidate.url,
                Range: `bytes=0-${candidate.size - 1}`,
                IfMatch: head.ETag,
            }), { abortSignal: controller.signal });
            verifyGetHeaders(object, head, candidate.size);
            const digest = await hashBoundedBody(object.Body, candidate.size);
            if (!digest.sha256) throw new Error('Hash unavailable');
            bytesRead += digest.bytes;
        }
        process.stdout.write(JSON.stringify({
            status: 'PASS', bucket: BUCKET, listedObjects: listed.size,
            selected: selected.length, bytesRead, hashesComputed: selected.length,
            fullBackup: false,
        }) + '\n');
    } finally {
        clearTimeout(timer);
        client.destroy();
    }
}

module.exports = { selectCandidates, hashBoundedBody, verifyGetHeaders, backendRequire, main };
if (process.argv.includes('--execute')) {
    main().catch(() => {
        process.stderr.write('R2_CANARY_FAILED (details suppressed to protect credentials and object keys)\n');
        process.exitCode = 1;
    });
}
