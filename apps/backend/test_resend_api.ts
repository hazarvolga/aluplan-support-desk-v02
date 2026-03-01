import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const setting = await prisma.setting.findUnique({where: {key: 'email.resend.api_key'}});
  console.log("DB SETTING:", setting?.value);
  console.log("ENV VAR:", process.env.RESEND_API_KEY ? "EXISTS" : "MISSING");
  
  const key = setting?.value || process.env.RESEND_API_KEY;
  console.log("USING KEY:", key?.substring(0, 10) + "...");
}
run().finally(() => prisma.$disconnect());
