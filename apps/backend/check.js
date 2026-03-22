const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const gte = new Date();
  gte.setHours(0,0,0,0);
  const count = await prisma.ticket.count({
    where: { status: 'RESOLVED', resolvedAt: { gte } }
  });
  console.log('Tickets resolved today:', count);
  const waiting = await prisma.ticket.count({
    where: { status: { notIn: ['RESOLVED', 'CLOSED'] } }
  });
  console.log('Waiting tickets:', waiting);
  
  const teams = await prisma.team.findMany({ include: { members: true } });
  console.log('Teams:', teams.map(t => ({ id: t.id, name: t.name, members: t.members.length })));
}
check().finally(() => prisma.$disconnect());
