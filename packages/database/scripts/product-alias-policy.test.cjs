const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveProductAliasMatch, syncCanonicalProduct } = require('./product-alias-policy.js');

test('creates canonical CDS product when neither alias exists', () => {
    assert.deepEqual(resolveProductAliasMatch('CDS Add-On', []), {
        aliases: ['CDS Add-On', 'CDS Add-on'],
        product: null,
    });
});

test('reuses and canonicalizes the legacy CDS spelling', () => {
    const legacy = { id: 'legacy', name: 'CDS Add-on', deletedAt: null, isActive: true };
    assert.equal(resolveProductAliasMatch('CDS Add-On', [legacy]).product, legacy);
});

test('reuses a soft-deleted canonical CDS product for restoration', () => {
    const deleted = { id: 'deleted', name: 'CDS Add-On', deletedAt: new Date(0), isActive: false };
    assert.equal(resolveProductAliasMatch('CDS Add-On', [deleted]).product, deleted);
});

test('fails closed before mutating when both CDS aliases exist', () => {
    assert.throws(
        () => resolveProductAliasMatch('CDS Add-On', [
            { id: 'canonical', name: 'CDS Add-On' },
            { id: 'legacy', name: 'CDS Add-on' },
        ]),
        /Duplicate product aliases require manual reconciliation/,
    );
});

test('canonical product sync creates when no alias exists', async () => {
    const product = {
        findMany: async () => [],
        create: async ({ data }) => ({ id: 'created', ...data }),
        update: async () => assert.fail('update must not run'),
    };
    const result = await syncCanonicalProduct(product, { name: 'CDS Add-On', description: 'Canonical' });
    assert.deepEqual(result, { id: 'created', name: 'CDS Add-On', description: 'Canonical', isActive: true });
});

test('canonical product sync restores and renames a single legacy or soft-deleted match', async () => {
    const legacy = { id: 'legacy', name: 'CDS Add-on', deletedAt: new Date(0), isActive: false };
    let updateInput;
    const product = {
        findMany: async () => [legacy],
        create: async () => assert.fail('create must not run'),
        update: async (input) => { updateInput = input; return { ...legacy, ...input.data }; },
    };
    await syncCanonicalProduct(product, { name: 'CDS Add-On', description: 'Canonical' });
    assert.deepEqual(updateInput, {
        where: { id: 'legacy' },
        data: { name: 'CDS Add-On', description: 'Canonical', isActive: true, deletedAt: null },
    });
});

test('canonical product sync performs no write when aliases are duplicated', async () => {
    let writes = 0;
    const product = {
        findMany: async () => [{ id: 'one' }, { id: 'two' }],
        create: async () => { writes += 1; },
        update: async () => { writes += 1; },
    };
    await assert.rejects(
        syncCanonicalProduct(product, { name: 'CDS Add-On', description: 'Canonical' }),
        /Duplicate product aliases require manual reconciliation/,
    );
    assert.equal(writes, 0);
});
