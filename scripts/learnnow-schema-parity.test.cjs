const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const schema = readFileSync(
  path.join(root, 'packages/database/prisma/schema.prisma'),
  'utf8',
);
const migration = readFileSync(
  path.join(
    root,
    'packages/database/prisma/migrations/20261006000000_add_learnnow_crawl_runs/migration.sql',
  ),
  'utf8',
);

function modelSource(name) {
  const match = schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `Expected ${name} in Prisma schema`);
  return match[1];
}

test('LearnNow timestamp defaults match the deployed migration contract', () => {
  assert.equal(
    migration.match(/"updated_at" TIMESTAMP\(3\) NOT NULL DEFAULT CURRENT_TIMESTAMP/g)?.length,
    2,
    'The migration must create both LearnNow updated_at defaults',
  );

  for (const model of ['LearnNowCrawlRun', 'LearnNowCrawlDailyBudget']) {
    assert.match(
      modelSource(model),
      /updatedAt\s+DateTime\s+@default\(now\(\)\)\s+@updatedAt\s+@map\("updated_at"\)/,
      `${model}.updatedAt must preserve the database default created by its migration`,
    );
  }
});
