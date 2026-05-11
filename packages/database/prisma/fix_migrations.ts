import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  console.log(`🛠️ Found ${migrations.length} migrations. Marking all as applied...`);

  for (const migration of migrations) {
    try {
      console.log(`✅ Resolving: ${migration}`);
      execSync(`npx prisma migrate resolve --applied ${migration} --schema ./prisma/schema.prisma`, {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
    } catch (e) {
      console.warn(`⚠️ Failed to resolve ${migration}. Continuing...`);
    }
  }

  console.log('✨ All migrations marked as applied.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
