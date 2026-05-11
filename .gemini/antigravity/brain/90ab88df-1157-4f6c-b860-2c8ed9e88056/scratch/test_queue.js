
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const Redis = require('ioredis');

async function test() {
  const prisma = new PrismaClient();
  const redis = new Redis('redis://localhost:6379');
  const syncQueue = new Queue('knowledge-sync', { connection: redis });

  const source = await prisma.knowledgeSource.findFirst({ where: { status: 'ACTIVE' } });
  if (!source) {
    console.log('No active source found');
    return;
  }

  console.log(`Triggering sync for source: ${source.name} (${source.id})`);
  
  // Clear queue first to be sure
  await syncQueue.drain();
  
  await syncQueue.add('sync-source', { sourceId: source.id });
  
  const jobs = await syncQueue.getJobs(['waiting', 'active', 'delayed']);
  console.log(`Queue size: ${jobs.length}`);
  jobs.forEach(j => console.log(` - Job: ${j.id}, Data: ${JSON.stringify(j.data)}`));

  process.exit(0);
}

test();
