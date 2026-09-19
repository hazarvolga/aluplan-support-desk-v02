// Ephemeral local certificates only. Run before Jest, then set
// MAIL_TLS_FIXTURE_DIR=<printed path> NODE_EXTRA_CA_CERTS=<printed path>/ca.pem.
const { mkdtempSync, writeFileSync, chmodSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');

function generateMailTlsFixtures() {
  const dir = mkdtempSync(join(tmpdir(), 'mail-tls-'));
  try {
  writeFileSync(join(dir, 'req.cnf'), '[req]\ndistinguished_name=dn\n[dn]\n');
  const openssl = (...args) => execFileSync('/usr/bin/openssl', args, { cwd: dir, stdio: 'pipe', env: { ...process.env, OPENSSL_CONF: join(dir, 'req.cnf') } });
  openssl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.pem', '-days', '2', '-subj', '/CN=Local mail test CA');
  writeFileSync(join(dir, 'index'), '');
  writeFileSync(join(dir, 'serial'), '1000\n');
  for (const name of ['valid', 'hostname', 'expired']) {
    openssl('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', `${name}.key`, '-out', `${name}.csr`, '-subj', `/CN=${name}`);
    writeFileSync(join(dir, 'ca.cnf'), `[ca]\ndefault_ca=local\n[local]\ndatabase=${dir}/index\nserial=${dir}/serial\nnew_certs_dir=${dir}\ncertificate=${dir}/ca.pem\nprivate_key=${dir}/ca.key\ndefault_md=sha256\ndefault_days=2\npolicy=policy\nx509_extensions=server\n[policy]\ncommonName=supplied\n[server]\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=${name === 'hostname' ? 'DNS:wrong.example.invalid' : 'IP:127.0.0.1,DNS:localhost'}\n`);
    openssl('ca', '-batch', '-config', 'ca.cnf', '-in', `${name}.csr`, '-out', `${name}.pem`, ...(name === 'expired' ? ['-startdate', '20000101000000Z', '-enddate', '20010101000000Z'] : []));
  }
  openssl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'untrusted.key', '-out', 'untrusted.pem', '-days', '2', '-subj', '/CN=localhost');
  for (const name of ['ca', 'valid', 'hostname', 'expired', 'untrusted']) chmodSync(join(dir, `${name}.key`), 0o600);
  return dir;
  } catch (error) {
    rmSync(dir, { recursive: true });
    throw error;
  }
}

module.exports = { generateMailTlsFixtures };
if (require.main === module) process.stdout.write(generateMailTlsFixtures() + '\n');
