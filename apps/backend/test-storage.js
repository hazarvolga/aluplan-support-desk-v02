const { PrismaClient } = require('@prisma/client');
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const prisma = new PrismaClient();

// This is the same logic as CryptoService. Assume ALGORITHM=aes-256-gcm
// Need to find ENCRYPTION_KEY string from process.env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function run() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['storage.endpoint', 'storage.region', 'storage.access_key', 'storage.secret_key', 'storage.bucket'] } }
  });

  const config = {};
  for(const s of settings) {
    let value = s.value;
    if (s.isSecret) {
      try {
        const [ivHex, authTagHex, encryptedHex] = value.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const defaultKey = process.env.ENCRYPTION_KEY 
            ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex').subarray(0, 32) 
            : Buffer.from('a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90', 'hex').subarray(0, 32);
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', defaultKey, iv);
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        value = decrypted;
      } catch (e) {
        console.error(`DECRYPTION FAILED FOR ${s.key}`);
        value = "*** DECRYPTION FAILED ***";
      }
    }
    config[s.key] = value;
  }

  console.log("Extracted Config:");
  console.log("Endpoint:", config['storage.endpoint']);
  console.log("Region:", config['storage.region']);
  console.log("Access Key:", config['storage.access_key']);
  console.log("Secret Key:", config['storage.secret_key'] ? config['storage.secret_key'].substring(0, 5) + '...' : 'MISSING');
  console.log("Bucket:", config['storage.bucket']);

  const s3 = new S3Client({
    endpoint: config['storage.endpoint'].trim(),
    region: config['storage.region'] ? config['storage.region'].trim() : 'auto',
    credentials: {
      accessKeyId: config['storage.access_key'].trim(),
      secretAccessKey: config['storage.secret_key'] ? config['storage.secret_key'].trim() : ''
    },
    forcePathStyle: true
  });

  try {
    await s3.send(new HeadBucketCommand({ Bucket: config['storage.bucket'].trim() }));
    console.log("SUCCESS! Connection works.");
  } catch (e) {
    console.error("FAILED TO CONNECT:");
    console.error(e.name, e.message);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
