const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '5a91b355db8d48cf6a18ba970912560bc68f472fe180c7d70017f90b45014436';

async function run() {
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'storage' } }
  });

  for(const s of settings) {
    let value = s.value;
    if (s.isSecret) {
      try {
        const [ivHex, authTagHex, encryptedHex] = value.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = Buffer.from(ENCRYPTION_KEY, 'hex').subarray(0, 32);
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        value = decrypted;
      } catch (e) {
        value = "*** DECRYPTION FAILED ***";
      }
      console.log(`[DB] ${s.key} (Secret) = ${value.substring(0, 3)}...${value.substring(value.length - 3)} (Length: ${value.length})`);
    } else {
      console.log(`[DB] ${s.key} = "${value}" (Length: ${value.length})`);
    }
  }
}

run().catch(console.log).finally(() => prisma.$disconnect());
