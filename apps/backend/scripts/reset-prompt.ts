import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function main() {
  const result = await prisma.promptTemplate.deleteMany({
    where: { name: 'SYSTEM_PROMPT_SUPPORT' }
  });
  console.log(`Deleted ${result.count} prompt templates from Postgres.`);

  try {
    const redis = new Redis(REDIS_URL);
    const keys = await redis.keys('ai:query:cache:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Deleted ${keys.length} cache keys from Redis`);
    } else {
        console.log('No redis keys found to delete.');
    }
    
    // Also the new stream cache
    const streamKeys = await redis.keys('ai:query:stream_cache:*');
    if (streamKeys.length > 0) {
        await redis.del(...streamKeys);
        console.log(`Deleted ${streamKeys.length} stream cache keys from Redis`);
    }
    await redis.quit();
  } catch(e) {
      console.error('Redis error:', e.message);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
