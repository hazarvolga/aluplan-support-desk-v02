'use strict';

const { isIP } = require('node:net');

function assertSafeE2eDatabaseUrl(environment = process.env) {
    if (environment.E2E_SEED_ALLOWED !== 'true') {
        throw new Error('Refusing to seed E2E users without explicit E2E_SEED_ALLOWED=true');
    }
    if (environment.NODE_ENV === 'production') {
        throw new Error('Refusing to seed E2E users while NODE_ENV=production');
    }

    const databaseUrl = environment.DATABASE_URL;
    if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
        throw new Error('DATABASE_URL is required for E2E seeding');
    }

    let parsed;
    try {
        parsed = new URL(databaseUrl);
    } catch {
        throw new Error('DATABASE_URL must be a valid PostgreSQL URL for an isolated E2E database');
    }

    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        throw new Error('Refusing to seed E2E users unless DATABASE_URL uses PostgreSQL');
    }

    const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    const ipVersion = isIP(hostname);
    const isLoopback = (ipVersion === 4 && hostname.startsWith('127.')) || (ipVersion === 6 && hostname === '::1');
    if (!isLoopback) {
        throw new Error('Refusing to seed E2E users unless DATABASE_URL points to a loopback IP');
    }

    let databaseName;
    try {
        databaseName = decodeURIComponent(parsed.pathname.slice(1));
    } catch {
        throw new Error('DATABASE_URL must identify an isolated E2E database');
    }
    if (!databaseName.endsWith('_e2e')) {
        throw new Error('Refusing to seed E2E users unless the database name ends with _e2e');
    }

    return databaseUrl;
}

module.exports = { assertSafeE2eDatabaseUrl };
