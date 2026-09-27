const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve parents only: never import Prisma, dev servers, app modules or config loaders.
const root = createRequire(path.resolve(__dirname, '../package.json'));
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const child = (parent, name) => createRequire(parent.resolve(name));
const mjml = child(backend, 'mjml');
const board = child(backend, '@bull-board/api');
const prismaDev = child(child(root, 'prisma/package.json'), '@prisma/dev');
const parser = child(prismaDev, '@mrleebo/prisma-ast');
const consumers = [
    ['Nest config', child(backend, '@nestjs/config')],
    ['Swagger', child(backend, '@nestjs/swagger')],
    ['MJML core', child(mjml, 'mjml-core')],
    ['Redis INFO parser', child(board, 'redis-info')],
    ['Prisma dev Chevrotain', child(parser, 'chevrotain')],
];

for (const [label, consumer] of consumers) {
    test(`${label} resolves reviewed Lodash 4.18.1`, () => {
        assert.equal(consumer('lodash/package.json').version, '4.18.1');
    });

    test(`${label} preserves nested configuration and collection helpers`, () => {
        const get = consumer('lodash/get');
        const has = consumer('lodash/has');
        const config = { mail: { enabled: false, retries: 0 }, label: 'Çağrı' };
        assert.equal(get(config, 'mail.enabled', true), false);
        assert.equal(get(config, 'mail.retries', 3), 0);
        assert.equal(get(config, 'missing', 'fallback'), 'fallback');
        assert.equal(has(config, 'mail.enabled'), true);
        const clone = consumer('lodash/cloneDeep')(config);
        consumer('lodash/set')(clone, 'mail.retries', 2);
        assert.equal(config.mail.retries, 0);
        assert.equal(clone.mail.retries, 2);
        assert.deepEqual(consumer('lodash/uniq')(['a', 'b', 'a']), ['a', 'b']);
        // Modular fromPairs packaging was broken in 4.18.0; exercise the published artifact.
        assert.deepEqual(consumer('lodash/fromPairs')([['label', 'Çağrı'], ['count', 0]]),
            { label: 'Çağrı', count: 0 });
    });

    for (const entry of ['lodash', 'lodash/template']) {
        const imported = consumer(entry);
        const template = entry === 'lodash' ? imported.template : imported;
        test(`${label} ${entry} preserves trusted template imports and escaping`, () => {
            const render = template('<%= prefix %>: <%- label %>', { imports: { prefix: 'Yanıt' } });
            assert.equal(render({ label: 'Çağrı <&>' }), 'Yanıt: Çağrı &lt;&amp;&gt;');
        });

        test(`${label} ${entry} rejects a non-identifier import key`, () => {
            // An inert constant default parameter, with no side effects or external access.
            assert.throws(() => template('safe', { imports: { 'arg = 1': undefined } }),
                /Invalid `imports` option/);
        });

        test(`${label} ${entry} ignores inherited imports`, () => {
            const imports = Object.create({ inheritedFixtureLabel: 'not-owned' });
            const render = template('<%= typeof inheritedFixtureLabel %>', { imports });
            assert.equal(render({}), 'undefined');
            assert.equal(Object.hasOwn(Object.prototype, 'inheritedFixtureLabel'), false);
        });
    }
}

test('actual Redis INFO parser preserves counts without a Redis connection', () => {
    const result = board('redis-info').parse(
        '# Server\r\nredis_version:7.2.0\r\nconnected_clients:2\r\n' +
        'db0:keys=3,expires=1,avg_ttl=25\r\ncmdstat_get:calls=4,usec=8,usec_per_call=2.0\r\n');
    assert.equal(result.redis_version, '7.2.0');
    assert.equal(result.connected_clients, '2');
    assert.deepEqual(result.databases, { 0: { keys: 3, expires: 1, avg_ttl: 25 } });
    assert.deepEqual(result.commands.get, { calls: 4, usec: 8, usec_per_call: 2 });
});

test('Prisma parser dependency tokenizes a tiny schema without config discovery', () => {
    // Do not import prisma-ast: its module initialization searches config files.
    const { Lexer, createToken } = parser('chevrotain');
    const word = createToken({ name: 'Word', pattern: /[A-Za-z]+/ });
    const space = createToken({ name: 'Space', pattern: /\s+/, group: Lexer.SKIPPED });
    const result = new Lexer([space, word]).tokenize('model Ticket');
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.tokens.map((token) => token.image), ['model', 'Ticket']);
});
