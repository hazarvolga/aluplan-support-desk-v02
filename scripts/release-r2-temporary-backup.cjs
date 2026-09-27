#!/usr/bin/env node
// One-shot, operator-only R2 copy. Never logs credentials, object keys or bytes.
const { createDecipheriv, createHash } = require('node:crypto');
const { createRequire } = require('node:module');
const { existsSync } = require('node:fs');
const path = require('node:path');

const SOURCE_BUCKET = 'aluplan-support-desk';
const DEST_BUCKET = 'aluplan-support-desk-release-backup-20260927';
const ENDPOINT = 'https://457188683bc1b5df04c2ef11a013605a.r2.cloudflarestorage.com';
const DEFAULT_LIMITS = Object.freeze({ maxObjects: 1000, maxTotalBytes: 80e9, maxObjectBytes: 1e9 });
const EXPECTED_HISTORICAL_MARKERS = 5;
const HISTORICAL_MARKER_CUTOFF = Date.parse('2026-05-01T00:00:00Z');

function backendRequire() {
    const fromCwd = path.resolve(process.cwd(), 'apps/backend/package.json');
    const fromScript = path.resolve(__dirname, '../apps/backend/package.json');
    const packagePath = existsSync(fromCwd) ? fromCwd : fromScript;
    if (!existsSync(packagePath)) throw new Error('Backend package context unavailable');
    return createRequire(packagePath);
}

function normalizeObject(row, limits) {
    if (!row || typeof row.Key !== 'string' || !row.Key || row.Key.length > 1024 ||
        !Number.isSafeInteger(row.Size) || row.Size < 0 || row.Size > limits.maxObjectBytes ||
        typeof row.ETag !== 'string' || !/^"[a-f0-9-]{16,100}"$/i.test(row.ETag)) {
        throw new Error('R2 inventory metadata invalid');
    }
    return { key: row.Key, size: row.Size, etag: row.ETag };
}

function validateInventory(sourceRows, destRows, limits = DEFAULT_LIMITS) {
    const source = new Map();
    const destination = new Map();
    let totalBytes = 0;
    for (const row of sourceRows) {
        const object = normalizeObject(row, limits);
        if (source.has(object.key)) throw new Error('Duplicate source key');
        source.set(object.key, object);
        totalBytes += object.size;
        if (source.size > limits.maxObjects || totalBytes > limits.maxTotalBytes) {
            throw new Error('R2 source budget exceeded');
        }
    }
    if (!source.size) throw new Error('R2 source is empty');
    for (const row of destRows) {
        const object = normalizeObject(row, limits);
        if (destination.has(object.key) || !source.has(object.key)) {
            throw new Error('Unexpected destination object');
        }
        destination.set(object.key, object);
    }
    return { source, destination, totalBytes };
}

function classifyDestination(source, destination) {
    if (!destination) return 'COPY';
    if (source.key !== destination.key || source.size !== destination.size) {
        throw new Error('Destination does not match source snapshot');
    }
    return source.etag === destination.etag ? 'SKIP' : 'VERIFY';
}

function requireAbsentDestination(command) {
    command.middlewareStack.add(next => async args => {
        args.request.headers['cf-copy-destination-if-none-match'] = '*';
        return next(args);
    }, { step: 'build', name: 'r2DestinationMustBeAbsent' });
    return command;
}

function encodeCopySource(bucket, key) {
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket) ||
        typeof key !== 'string' || !key || key.length > 1024) {
        throw new Error('Copy source invalid');
    }
    return `/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

function selectActiveAttachments(rows, source, destination) {
    if (!Array.isArray(rows) || rows.length === 0 || rows.length > 1000) {
        throw new Error('Active attachment inventory outside budget');
    }
    const selected = new Map();
    let historicalMarkers = 0;
    let totalBytes = 0;
    for (const row of rows) {
        if (typeof row.url !== 'string' || !row.url || row.url.length > 1024) {
            throw new Error('Active attachment key invalid');
        }
        if (row.url.startsWith('FAILED_STORAGE_UPLOAD_')) {
            const createdAt = new Date(row.created_at).getTime();
            if (!Number.isFinite(createdAt) || createdAt >= HISTORICAL_MARKER_CUTOFF) {
                throw new Error('New or undated failed-upload marker');
            }
            historicalMarkers += 1;
            continue;
        }
        const size = Number(row.file_size);
        const original = source.get(row.url);
        const backup = destination.get(row.url);
        if (!Number.isSafeInteger(size) || size < 0 || !original || !backup ||
            original.size !== size || backup.size !== size) {
            throw new Error('Active attachment missing or size mismatch');
        }
        if (!selected.has(row.url)) {
            selected.set(row.url, { source: original, destination: backup });
            totalBytes += size;
            if (selected.size > 500 || totalBytes > 100e6) throw new Error('Active attachment hash budget exceeded');
        }
    }
    if (!selected.size) throw new Error('No active attachment objects');
    return { selected, historicalMarkers, totalBytes };
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
    const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000, query_timeout: 10000 });
    await db.connect();
    try {
        await db.query('BEGIN TRANSACTION READ ONLY');
        const { rows } = await db.query(
            'SELECT key, value, is_secret FROM settings WHERE key = ANY($1::text[])',
            [['storage.endpoint', 'storage.region', 'storage.access_key', 'storage.secret_key', 'storage.bucket']],
        );
        const attachments = await db.query(
            'SELECT url, file_size, created_at FROM attachments WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1001',
        );
        await db.query('ROLLBACK');
        const values = new Map(rows.map(row => [row.key, decryptSetting(row, process.env.ENCRYPTION_KEY)]));
        const scope = {
            endpoint: (values.get('storage.endpoint') || process.env.STORAGE_ENDPOINT || '').trim().replace(/\/+$/, ''),
            region: (values.get('storage.region') || process.env.STORAGE_REGION || 'auto').trim(),
            accessKey: (values.get('storage.access_key') || process.env.STORAGE_ACCESS_KEY || '').trim(),
            secretKey: (values.get('storage.secret_key') || process.env.STORAGE_SECRET_KEY || '').trim(),
            bucket: (values.get('storage.bucket') || process.env.STORAGE_BUCKET || '').trim(),
        };
        if (scope.endpoint !== ENDPOINT || scope.bucket !== SOURCE_BUCKET || !scope.accessKey || !scope.secretKey) {
            throw new Error('Live storage scope differs from approved source');
        }
        return { ...scope, attachments: attachments.rows };
    } finally {
        await db.end();
    }
}

async function listObjects(client, bucket, signal) {
    const { ListObjectsV2Command } = backendRequire()('@aws-sdk/client-s3');
    const rows = [];
    let token;
    for (let page = 0; page < 2; page += 1) {
        const result = await client.send(new ListObjectsV2Command({
            Bucket: bucket, MaxKeys: 1000, ...(token ? { ContinuationToken: token } : {}),
        }), { abortSignal: signal });
        rows.push(...(result.Contents || []));
        if (!result.IsTruncated) return rows;
        if (!result.NextContinuationToken || result.NextContinuationToken === token) throw new Error('R2 pagination invalid');
        token = result.NextContinuationToken;
    }
    throw new Error('R2 pagination budget exceeded');
}

async function hashObject(client, bucket, object, signal, maxBytes = DEFAULT_LIMITS.maxObjectBytes) {
    const { GetObjectCommand } = backendRequire()('@aws-sdk/client-s3');
    const response = await client.send(new GetObjectCommand({
        Bucket: bucket, Key: object.key, IfMatch: object.etag,
    }), { abortSignal: signal });
    if (!response.Body || response.ContentLength !== object.size || response.ETag !== object.etag) {
        response.Body?.destroy?.();
        throw new Error('Object metadata mismatch');
    }
    const hash = createHash('sha256');
    let bytes = 0;
    try {
        for await (const chunk of response.Body) {
            bytes += chunk.length;
            if (bytes > object.size || bytes > maxBytes) throw new Error('Object hash byte budget exceeded');
            hash.update(chunk);
        }
    } finally {
        response.Body.destroy?.();
    }
    if (bytes !== object.size) throw new Error('Object hash truncated');
    return hash.digest('hex');
}

async function verifyContentIfNeeded(client, source, destination, signal) {
    const decision = classifyDestination(source, destination);
    if (decision === 'COPY') throw new Error('Destination object absent');
    if (decision === 'SKIP') return false;
    const sourceHash = await hashObject(client, SOURCE_BUCKET, source, signal);
    const destinationHash = await hashObject(client, DEST_BUCKET, destination, signal);
    if (sourceHash !== destinationHash) throw new Error('Destination content mismatch');
    return true;
}

async function main() {
    const scope = await loadScope();
    const { S3Client, CopyObjectCommand, HeadObjectCommand } = backendRequire()('@aws-sdk/client-s3');
    const client = new S3Client({
        endpoint: ENDPOINT, region: scope.region || 'auto',
        credentials: { accessKeyId: scope.accessKey, secretAccessKey: scope.secretKey },
        forcePathStyle: true, maxAttempts: 1,
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3 * 60 * 60 * 1000);
    let phase = 'inventory';
    let copied = 0;
    let skipped = 0;
    let hashVerified = 0;
    try {
        const initial = validateInventory(
            await listObjects(client, SOURCE_BUCKET, controller.signal),
            await listObjects(client, DEST_BUCKET, controller.signal),
        );
        if (process.argv.includes('--verify-active')) {
            phase = 'active-attachment-hash';
            const active = selectActiveAttachments(scope.attachments, initial.source, initial.destination);
            if (active.historicalMarkers !== EXPECTED_HISTORICAL_MARKERS) {
                throw new Error('Historical failed-upload marker count changed');
            }
            for (const { source, destination } of active.selected.values()) {
                const sourceHash = await hashObject(client, SOURCE_BUCKET, source, controller.signal);
                const backupHash = await hashObject(client, DEST_BUCKET, destination, controller.signal);
                if (sourceHash !== backupHash) throw new Error('Active attachment content mismatch');
                hashVerified += 1;
            }
            process.stdout.write(JSON.stringify({ status: 'ACTIVE_ATTACHMENT_HASH_PASS',
                activeObjects: active.selected.size, bytes: active.totalBytes,
                historicalMarkers: active.historicalMarkers, fullBucketHashVerified: false }) + '\n');
            return;
        }
        if (process.argv.includes('--preflight')) {
            const multipart = [...initial.source.values()].filter(object => object.etag.includes('-'));
            process.stdout.write(JSON.stringify({
                status: 'PREFLIGHT', sourceObjects: initial.source.size,
                destinationObjects: initial.destination.size, bytes: initial.totalBytes,
                multipartObjects: multipart.length,
                multipartBytes: multipart.reduce((sum, object) => sum + object.size, 0),
            }) + '\n');
            return;
        }
        const canaryOnly = process.argv.includes('--canary');
        const copyList = canaryOnly
            ? [...initial.source.values()].filter(object => object.size > 0 && object.size <= 1024 * 1024).slice(0, 1)
            : [...initial.source.values()];
        if (!copyList.length) throw new Error('No safe backup canary available');
        phase = 'copy';
        for (const source of copyList) {
            const existing = initial.destination.get(source.key);
            if (existing) {
                if (await verifyContentIfNeeded(client, source, existing, controller.signal)) hashVerified += 1;
                skipped += 1;
                continue;
            }
            const head = await client.send(new HeadObjectCommand({ Bucket: SOURCE_BUCKET, Key: source.key }), { abortSignal: controller.signal });
            if (head.ContentLength !== source.size || head.ETag !== source.etag) throw new Error('Source changed during copy');
            await client.send(requireAbsentDestination(new CopyObjectCommand({
                Bucket: DEST_BUCKET, Key: source.key, CopySource: encodeCopySource(SOURCE_BUCKET, source.key),
                CopySourceIfMatch: source.etag, MetadataDirective: 'COPY', StorageClass: 'STANDARD',
            })), { abortSignal: controller.signal });
            const copiedHead = await client.send(new HeadObjectCommand({ Bucket: DEST_BUCKET, Key: source.key }), { abortSignal: controller.signal });
            if (copiedHead.ContentLength !== source.size || typeof copiedHead.ETag !== 'string') {
                throw new Error('Copied object metadata mismatch');
            }
            if (await verifyContentIfNeeded(client, source,
                { key: source.key, size: copiedHead.ContentLength, etag: copiedHead.ETag }, controller.signal)) hashVerified += 1;
            copied += 1;
            if (copied % 25 === 0) process.stdout.write(JSON.stringify({ status: 'COPYING', copied, skipped }) + '\n');
        }
        if (canaryOnly) {
            process.stdout.write(JSON.stringify({ status: 'CANARY_COPIED', copied, skipped,
                bytes: copyList[0].size, fullBackupVerified: false }) + '\n');
            return;
        }
        phase = 'final-inventory';
        const finalSource = validateInventory(await listObjects(client, SOURCE_BUCKET, controller.signal), []);
        const final = validateInventory(
            await listObjects(client, SOURCE_BUCKET, controller.signal),
            await listObjects(client, DEST_BUCKET, controller.signal),
        );
        if (finalSource.source.size !== initial.source.size || finalSource.totalBytes !== initial.totalBytes) {
            throw new Error('Source changed during backup');
        }
        for (const source of initial.source.values()) {
            const current = final.source.get(source.key);
            if (!current || current.size !== source.size || current.etag !== source.etag) {
                throw new Error('Source changed during backup');
            }
        }
        for (const source of final.source.values()) {
            if (await verifyContentIfNeeded(client, source, final.destination.get(source.key), controller.signal)) hashVerified += 1;
        }
        phase = 'canary';
        const canaries = [...final.source.values()].filter(object => object.size > 0 && object.size <= 1024 * 1024).slice(0, 3);
        if (canaries.length < 3) throw new Error('Insufficient restore canaries');
        for (const source of canaries) {
            const originalHash = await hashObject(client, SOURCE_BUCKET, source, controller.signal, 1024 * 1024);
            const backupHash = await hashObject(client, DEST_BUCKET, final.destination.get(source.key), controller.signal, 1024 * 1024);
            if (originalHash !== backupHash) throw new Error('Restore canary hash mismatch');
        }
        process.stdout.write(JSON.stringify({
            status: 'PASS', sourceObjects: final.source.size, backupObjects: final.destination.size,
            bytes: final.totalBytes, copied, skipped, hashVerified, canaries: canaries.length,
            fullBodyHashVerified: false, liveWritesQuiesced: false,
        }) + '\n');
    } catch (error) {
        const safeError = error?.name === 'AbortError' ? 'TIMEOUT' : 'FAILED';
        process.stderr.write(JSON.stringify({ status: safeError, phase, copied, skipped, hashVerified }) + '\n');
        throw error;
    } finally {
        clearTimeout(timer);
        client.destroy();
    }
}

module.exports = { validateInventory, classifyDestination, encodeCopySource,
    requireAbsentDestination, selectActiveAttachments, main };
if (process.argv.includes('--execute') || process.argv.includes('--preflight') ||
    process.argv.includes('--canary') || process.argv.includes('--verify-active')) {
    main().catch(() => {
        process.stderr.write('R2_TEMPORARY_BACKUP_FAILED (details suppressed to protect credentials and object keys)\n');
        process.exitCode = 1;
    });
}
