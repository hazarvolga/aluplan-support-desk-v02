const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve the CLI dependency without executing Prisma or reading its config.
const root = createRequire(path.resolve(__dirname, '../package.json'));
const prisma = createRequire(root.resolve('prisma/package.json'));
const mysql = createRequire(prisma.resolve('mysql2/package.json'));
const { authSwitchRequest } = mysql('./lib/commands/auth_switch.js');
const AuthSwitchRequest = mysql('./lib/packets/auth_switch_request.js');

async function switchPlugin(pluginName) {
    const packets = [];
    const errors = [];
    const command = new EventEmitter();
    command.on('error', (error) => errors.push(error));
    const connection = {
        config: { password: 'synthetic-password-marker', ssl: false },
        writePacket: (packet) => packets.push(Buffer.from(packet.buffer.subarray(4, packet.end))),
    };
    const packet = new AuthSwitchRequest({ pluginName, pluginData: Buffer.alloc(20, 7) }).toPacket();
    packet.offset = 4;
    try { authSwitchRequest(packet, connection, command); }
    catch (error) { errors.push(error); }
    // Drain the real handler's promise callbacks; no sockets or servers exist.
    await new Promise((resolve) => setImmediate(resolve));
    return { packets, errors };
}

test('Prisma resolves the reviewed mysql2 version', () => {
    assert.equal(mysql('./package.json').version, '3.22.0');
});

test('default auth switch rejects clear-password before writing any packet', async () => {
    const { packets, errors } = await switchPlugin('mysql_clear_password');
    assert.equal(packets.length, 0, 'no clear-password response may be written');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].code, 'MYSQL_CLEAR_PASSWORD_NOT_ENABLED');
    assert.equal(errors[0].fatal, true);
});

test('native-password challenge still returns a scrambled token', async () => {
    const { packets, errors } = await switchPlugin('mysql_native_password');
    assert.equal(errors.length, 0);
    assert.equal(packets.length, 1);
    assert.equal(packets[0].length, 20);
    assert.equal(packets[0].includes(Buffer.from('synthetic-password-marker')), false);
});

test('unknown auth plugin fails without sending a response', async () => {
    const { packets, errors } = await switchPlugin('fixture_unknown_plugin');
    assert.equal(packets.length, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0].message, /unknown plugin fixture_unknown_plugin/);
});

test('public formatting preserves escaping, null and Unicode without connections', () => {
    const driver = prisma('mysql2');
    assert.equal(driver.escape("O'Reilly"), "'O\\'Reilly'");
    assert.equal(driver.escape(null), 'NULL');
    assert.equal(driver.escapeId('odd`name'), '`odd``name`');
    assert.equal(driver.format('SELECT ? AS label, ? AS count', ['Çağrı', 7]),
        "SELECT 'Çağrı' AS label, 7 AS count");
});
