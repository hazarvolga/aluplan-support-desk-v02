import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildUpdatedChecksumManifest,
    serializeChecksumManifest,
} from './verify-migration-integrity.mjs';

test('manifest update appends only new migrations in deterministic order', () => {
    const fileChecksums = new Map([
        ['20260806021000_second', 'checksum-second'],
        ['20260806010000_existing', 'checksum-existing'],
        ['20260806020000_first', 'checksum-first'],
    ]);
    const checksumManifest = new Map([
        ['20260806010000_existing', 'checksum-existing'],
    ]);

    const updated = buildUpdatedChecksumManifest(
        fileChecksums,
        checksumManifest,
    );

    assert.deepEqual([...updated], [
        ['20260806010000_existing', 'checksum-existing'],
        ['20260806020000_first', 'checksum-first'],
        ['20260806021000_second', 'checksum-second'],
    ]);
    assert.equal(
        serializeChecksumManifest(updated),
        `${JSON.stringify(Object.fromEntries(updated), null, 2)}\n`,
    );
});

test('manifest update refuses to canonicalize a modified existing migration', () => {
    const fileChecksums = new Map([
        ['20260806010000_existing', 'changed-checksum'],
        ['20260806020000_new', 'checksum-new'],
    ]);
    const checksumManifest = new Map([
        ['20260806010000_existing', 'checksum-existing'],
    ]);

    assert.throws(
        () =>
            buildUpdatedChecksumManifest(
                fileChecksums,
                checksumManifest,
            ),
        /Refusing to update manifest.*20260806010000_existing/,
    );
});

test('manifest update refuses to hide a deleted migration directory', () => {
    const fileChecksums = new Map();
    const checksumManifest = new Map([
        ['20260806010000_existing', 'checksum-existing'],
    ]);

    assert.throws(
        () =>
            buildUpdatedChecksumManifest(
                fileChecksums,
                checksumManifest,
            ),
        /Manifest entry has no migration directory.*20260806010000_existing/,
    );
});

test('manifest update refuses to append a migration older than the canonical tail', () => {
    const fileChecksums = new Map([
        ['20260806005000_unexpected_old', 'checksum-old'],
        ['20260806010000_existing', 'checksum-existing'],
    ]);
    const checksumManifest = new Map([
        ['20260806010000_existing', 'checksum-existing'],
    ]);

    assert.throws(
        () =>
            buildUpdatedChecksumManifest(
                fileChecksums,
                checksumManifest,
            ),
        /Refusing to append a non-forward migration.*20260806005000_unexpected_old/,
    );
});

test('manifest update refuses to bless a non-empty migration set from an empty baseline', () => {
    const fileChecksums = new Map([
        ['20260806010000_existing', 'checksum-existing'],
    ]);

    assert.throws(
        () => buildUpdatedChecksumManifest(fileChecksums, new Map()),
        /Refusing to create a canonical manifest from an empty baseline/,
    );
});

test('manifest update rejects malformed migration directory names', () => {
    const fileChecksums = new Map([
        ['20260806010000_existing', 'checksum-existing'],
        ['unexpected migration name', 'checksum-new'],
    ]);
    const checksumManifest = new Map([
        ['20260806010000_existing', 'checksum-existing'],
    ]);

    assert.throws(
        () =>
            buildUpdatedChecksumManifest(
                fileChecksums,
                checksumManifest,
            ),
        /Invalid migration directory name.*unexpected migration name/,
    );
});
