// Opt-in synthetic-only DMS renewal rehearsal. NOT a production certificate publisher.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { generateMailTlsFixtures } = require('./mail-tls-fixtures.cjs');

const IMAGE = 'ghcr.io/docker-mailserver/docker-mailserver@sha256:af51b15dd3fc72153c0e90eb7692bb5e3a463212d87959a80fa7aa89b617d44a';
const CANDIDATE_IMAGE = 'sha256:e7962dbe5cda314ce8aa4143a72ab7275344b00adcb7194128737c3cf38b3e2c';
const token = crypto.randomBytes(8).toString('hex');
const name = `aluplan-renewal-${token}`;
const label = `com.aluplan.synthetic-renewal=${token}`;
const receipts = [];
let fixture;
const socket = path.join(os.homedir(), '.docker/run/docker.sock');
const endpoint = `unix://${socket}`;
let dockerVerified = false;

function command(file, args, options = {}) {
    return execFileSync(file, args, { encoding: 'utf8', timeout: 20000, stdio: 'pipe', ...options });
}
const docker = (...args) => command('docker', ['--host', endpoint, ...args]);
const inside = (...args) => docker('exec', name, ...args);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const openssl = (...args) => command('/usr/bin/openssl', args, { cwd: fixture });

function validatePair(cert, key) {
    for (const file of [cert, key]) assert(fs.lstatSync(file).isFile(), 'Regular fixture files required');
    openssl('verify', '-CAfile', path.join(fixture, 'ca.pem'), '-purpose', 'sslserver', cert);
    assert.equal(new crypto.X509Certificate(fs.readFileSync(cert)).checkHost('localhost'), 'localhost');
    openssl('x509', '-in', cert, '-noout', '-checkend', '60');
    const certPub = openssl('x509', '-in', cert, '-pubkey', '-noout');
    const keyPub = openssl('pkey', '-in', key, '-pubout');
    assert.equal(certPub.trim(), keyPub.trim(), 'Certificate/key mismatch');
}

function fingerprint(cert) {
    return new crypto.X509Certificate(fs.readFileSync(cert)).fingerprint256.replaceAll(':', '').toLowerCase();
}

function probe() {
    const script = `import ssl,smtplib,imaplib,hashlib,json
ctx=ssl.create_default_context(cafile='/fixture-ca.pem')
with smtplib.SMTP('localhost',587,timeout=4) as c:
 c.ehlo(); c.starttls(context=ctx)
 smtp=hashlib.sha256(c.sock.getpeercert(binary_form=True)).hexdigest()
with imaplib.IMAP4_SSL('localhost',993,ssl_context=ctx,timeout=4) as c:
 imap=hashlib.sha256(c.sock.getpeercert(binary_form=True)).hexdigest()
print(json.dumps({'smtp':smtp,'imap':imap}))`;
    return JSON.parse(command('docker', ['--host', endpoint, 'exec', '-i', name, 'python3', '-'], { input: script, timeout: 15000 }));
}

async function waitForCertificate(expected) {
    const deadline = Date.now() + 45000;
    let lastError;
    while (Date.now() < deadline) {
        try {
            const actual = probe();
            assert.deepEqual(actual, { smtp: expected, imap: expected });
            return actual;
        } catch (error) { lastError = error; }
        await sleep(1000);
    }
    throw new Error(`TLS presentation deadline exceeded (${lastError?.name})`);
}

async function probeExactCandidate() {
    const script = String.raw`
const fs = require('node:fs');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const ca = fs.readFileSync('/fixture-ca.pem');
const user = 'rehearsal@example.invalid';
const pass = 'SyntheticRehearsalOnly';
const marker = 'candidate-' + require('node:crypto').randomBytes(8).toString('hex');
const transport = nodemailer.createTransport({host:'localhost',port:587,secure:false,requireTLS:true,
 auth:{user,pass},tls:{ca,servername:'localhost',rejectUnauthorized:true},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:8000});
(async()=>{
 let client;
 try {
 await transport.verify();
 const sent = await transport.sendMail({from:user,to:user,subject:marker,text:'synthetic only',
  messageId:'<' + marker + '@example.invalid>',attachments:[{filename:'probe.bin',content:Buffer.from([0,1,2,255])}]});
 assert.equal(sent.rejected.length,0);
 client = await imaps.connect({imap:{user,password:pass,host:'localhost',port:993,tls:true,
  tlsOptions:{ca,servername:'localhost',rejectUnauthorized:true},authTimeout:8000,connTimeout:8000}});
  await client.openBox('INBOX');
  let matches=[];
  for(let attempt=0;attempt<12;attempt++){
   matches=await client.search([['HEADER','MESSAGE-ID','<' + marker + '@example.invalid>']],{bodies:[''],markSeen:false});
   if(matches.length) break;
   await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.equal(matches.length,1);
  const body=matches[0].parts.find(part=>part.which==='').body;
  const parsed=await simpleParser(body);
  assert.equal(parsed.subject,marker);
  assert.equal(parsed.attachments.length,1);
  assert.deepEqual(parsed.attachments[0].content,Buffer.from([0,1,2,255]));
  console.log(JSON.stringify({candidate:true,smtpTls:true,imapTls:true,syntheticAttachment:true}));
 } finally { try { if(client) client.end(); } finally { transport.close(); } }
})().catch(error=>{console.error(error.name + ': ' + error.message);process.exitCode=1});`;
    const output = command('docker', ['--host', endpoint, 'run', '--rm', '--name', `${name}-candidate`, '--label', label,
        '--platform', 'linux/amd64', '--network', `container:${name}`, '--read-only', '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges', '--memory', '256m', '--pids-limit', '64',
        '--mount', `type=bind,source=${fixture}/ca.pem,target=/fixture-ca.pem,readonly`,
        '--workdir', '/app/apps/backend', '--entrypoint', 'node', '-i', CANDIDATE_IMAGE, '-'],
        { input: script, timeout: 60000 });
    assert.deepEqual(JSON.parse(output.trim()), { candidate: true, smtpTls: true, imapTls: true, syntheticAttachment: true });
    receipts.push('exact candidate image mail libraries: SMTP STARTTLS + IMAP TLS + synthetic attachment round-trip verified');
}

function publish(cert, key) {
    // Validation happens before touching the watched pair or stopping the watcher.
    validatePair(cert, key);
    const certTarget = path.join(fixture, 'served/cert.pem');
    const keyTarget = path.join(fixture, 'served/key.pem');
    if (hash(fs.readFileSync(cert)) === hash(fs.readFileSync(certTarget)) &&
        hash(fs.readFileSync(key)) === hash(fs.readFileSync(keyTarget))) return 'unchanged';
    inside('supervisorctl', 'stop', 'changedetector');
    // supervisorctl status returns nonzero for STOPPED: inspect captured stdout explicitly.
    let status;
    try { status = inside('supervisorctl', 'status', 'changedetector'); }
    catch (error) { status = String(error.stdout || ''); }
    assert.match(status, /changedetector\s+STOPPED/);
    fs.copyFileSync(cert, certTarget);
    fs.copyFileSync(key, keyTarget);
    fs.chmodSync(keyTarget, 0o600);
    inside('supervisorctl', 'start', 'changedetector');
    return 'published';
}

async function run() {
    assert.equal(process.env.MAIL_RENEWAL_REHEARSAL, 'synthetic-local-only', 'Explicit opt-in required');
    assert(!process.env.MAIL_EXACT_IMAGE_REHEARSAL || process.env.MAIL_EXACT_IMAGE_REHEARSAL === 'synthetic-local-only',
        'Invalid exact-image rehearsal opt-in');
    assert.equal(process.platform, 'darwin', 'This bounded harness requires local macOS Docker Desktop');
    assert(!process.env.DOCKER_HOST && !process.env.DOCKER_CONTEXT && !process.env.DOCKER_TLS_VERIFY,
        'Docker endpoint overrides are not accepted');
    assert(fs.statSync(socket).isSocket(), 'Local Docker socket required');
    assert.equal(docker('info', '--format', '{{.OperatingSystem}}|{{.Name}}').trim(), 'Docker Desktop|docker-desktop');
    dockerVerified = true;
    fixture = generateMailTlsFixtures();
    fs.chmodSync(fixture, 0o700);
    openssl('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'renewed.key', '-out', 'renewed.csr', '-subj', '/CN=renewed');
    openssl('x509', '-req', '-in', 'renewed.csr', '-CA', 'ca.pem', '-CAkey', 'ca.key', '-set_serial', '2001', '-days', '2', '-sha256', '-extfile', 'ca.cnf', '-extensions', 'server', '-out', 'renewed.pem');
    fs.chmodSync(path.join(fixture, 'renewed.key'), 0o600);
    fs.writeFileSync(path.join(fixture, 'truncated.pem'), '-----BEGIN CERTIFICATE-----\n', { mode: 0o600 });
    fs.mkdirSync(path.join(fixture, 'served'), { mode: 0o700 });
    fs.mkdirSync(path.join(fixture, 'config'), { mode: 0o700 });
    const accountHash = command('docker', ['--host', endpoint, 'run', '--rm', '--name', `${name}-hash`, '--label', label,
        '-i', '--network', 'none', '--read-only',
        '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--memory', '128m', '--pids-limit', '32',
        '--platform', 'linux/amd64', '--entrypoint', 'openssl', IMAGE, 'passwd', '-6', '-stdin'],
        { input: 'SyntheticRehearsalOnly\n' }).trim();
    fs.writeFileSync(path.join(fixture, 'config/postfix-accounts.cf'), `rehearsal@example.invalid|${accountHash}\n`, { mode: 0o600 });
    // Local ARM-host amd64 emulation workaround; never a production recommendation.
    fs.writeFileSync(path.join(fixture, 'config/dovecot.cf'), 'default_vsz_limit = 1G\n', { mode: 0o600 });
    const firstCert = path.join(fixture, 'valid.pem');
    const firstKey = path.join(fixture, 'valid.key');
    validatePair(firstCert, firstKey);
    fs.copyFileSync(firstCert, path.join(fixture, 'served/cert.pem'));
    fs.copyFileSync(firstKey, path.join(fixture, 'served/key.pem'));
    fs.chmodSync(path.join(fixture, 'served/key.pem'), 0o600);
    docker('network', 'create', '--internal', '--label', label, name);
    const env = {
        SSL_TYPE: 'manual', SSL_CERT_PATH: '/fixture-tls/cert.pem', SSL_KEY_PATH: '/fixture-tls/key.pem',
        ENABLE_CLAMAV: '0', ENABLE_AMAVIS: '0', ENABLE_SPAMASSASSIN: '0', ENABLE_FAIL2BAN: '0',
        ENABLE_OPENDKIM: '0', ENABLE_OPENDMARC: '0', ENABLE_POLICYD_SPF: '0', ENABLE_RSPAMD: '0',
        UPDATE_CHECK_INTERVAL: '0', LOG_LEVEL: 'warn', DMS_CONFIG_POLL: '1',
    };
    docker('create', '--name', name, '--label', label, '--platform', 'linux/amd64', '--hostname', 'mail.example.invalid',
        '--network', name, '--memory', '768m', '--cpus', '2', '--pids-limit', '256',
        '--mount', `type=bind,source=${fixture}/served,target=/fixture-tls,readonly`,
        '--mount', `type=bind,source=${fixture}/ca.pem,target=/fixture-ca.pem,readonly`,
        '--mount', `type=bind,source=${fixture}/config,target=/tmp/docker-mailserver`,
        ...Object.entries(env).flatMap(([key, value]) => ['--env', `${key}=${value}`]), IMAGE);
    const isolated = JSON.parse(docker('inspect', name))[0];
    assert.equal(isolated.HostConfig.Privileged, false);
    assert.equal(Object.keys(isolated.HostConfig.PortBindings || {}).length, 0);
    assert(isolated.Mounts.every(m => m.Source.startsWith(fixture + '/')));
    assert.equal(JSON.parse(docker('network', 'inspect', name))[0].Internal, true);
    docker('start', name);
    const initial = fingerprint(firstCert);
    await waitForCertificate(initial);
    receipts.push('initial SMTP+IMAP certificate verified');
    if (process.env.MAIL_EXACT_IMAGE_REHEARSAL === 'synthetic-local-only') await probeExactCandidate();
    const before = JSON.parse(docker('inspect', name))[0];
    for (const [test, cert, key] of [
        ['mismatched-key', firstCert, path.join(fixture, 'renewed.key')],
        ['wrong-hostname', path.join(fixture, 'hostname.pem'), path.join(fixture, 'hostname.key')],
        ['expired', path.join(fixture, 'expired.pem'), path.join(fixture, 'expired.key')],
        ['untrusted', path.join(fixture, 'untrusted.pem'), path.join(fixture, 'untrusted.key')],
        ['truncated', path.join(fixture, 'truncated.pem'), firstKey],
    ]) {
        assert.throws(() => publish(cert, key), test);
        assert.equal(fingerprint(path.join(fixture, 'served/cert.pem')), initial);
        assert.deepEqual(probe(), { smtp: initial, imap: initial });
        receipts.push(`${test} rejected; old SMTP+IMAP certificate preserved`);
    }
    assert.equal(publish(firstCert, firstKey), 'unchanged');
    receipts.push('unchanged pair is no-op');
    const renewed = path.join(fixture, 'renewed.pem');
    assert.notEqual(fingerprint(renewed), initial);
    assert.equal(publish(renewed, path.join(fixture, 'renewed.key')), 'published');
    await waitForCertificate(fingerprint(renewed));
    receipts.push('renewed SMTP+IMAP certificate verified');
    const after = JSON.parse(docker('inspect', name))[0];
    assert.equal(after.State.StartedAt, before.State.StartedAt);
    assert.equal(after.RestartCount, before.RestartCount);
    assert.match(inside('supervisorctl', 'status', 'changedetector'), /RUNNING/);
    receipts.push('container not restarted; watcher running');
}

async function main() {
    let failure;
    try { await run(); }
    catch (error) { failure = error; }
    finally {
        let cleanupFailed = false;
        const cleanup = action => {
            try { action(); }
            catch (error) { cleanupFailed = true; failure = failure || error; }
        };
        if (dockerVerified) {
            // Query exact names even if a create/run command timed out after taking effect.
            for (const ownedName of [name, `${name}-hash`, `${name}-candidate`]) cleanup(() => {
                const id = docker('ps', '-aq', '--filter', `name=^/${ownedName}$`).trim();
                if (!id) return;
                const owned = JSON.parse(docker('inspect', id))[0];
                assert.equal(owned.Config.Labels['com.aluplan.synthetic-renewal'], token);
                docker('rm', '-f', '-v', id);
            });
            cleanup(() => {
                const id = docker('network', 'ls', '-q', '--filter', `name=^${name}$`).trim();
                if (!id) return;
                assert.equal(JSON.parse(docker('network', 'inspect', id))[0].Labels['com.aluplan.synthetic-renewal'], token);
                docker('network', 'rm', id);
            });
        }
        // Retain files if a container might still be using them after cleanup failure.
        if (fixture && !cleanupFailed) cleanup(() => fs.rmSync(fixture, { recursive: true }));
        console.log(JSON.stringify({ syntheticOnly: true, receipts, cleanup: cleanupFailed ? 'FAILED' : 'complete', passed: !failure }));
    }
    if (failure) { console.error(`REHEARSAL_FAILED: ${failure.message.split('\n')[0]}`); process.exitCode = 1; }
}
main();
