const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({ connectionString: 'postgresql://postgres:changeme@localhost:5432/aluplan_support' });

const datasetDir = path.resolve(__dirname, 'dataset');
const validExts = ['.md', '.pdf', '.csv', '.json', '.txt', '.docx'];

function walkSync(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walkSync(full, files);
    } else {
      const ext = path.extname(f).toLowerCase();
      if (validExts.includes(ext) && !f.endsWith('.metadata.json') && !f.includes('.resolved')) {
        files.push(full);
      }
    }
  }
  return files;
}

async function run() {
  await client.connect();
  const files = walkSync(datasetDir);
  console.log('Files found:', files.length);

  let added = 0, skipped = 0;
  for (const absPath of files) {
    const ext = path.extname(absPath).toLowerCase();
    let type = 'FILE_TXT';
    if (ext === '.md')   type = 'FILE_MD';
    if (ext === '.pdf')  type = 'FILE_PDF';
    if (ext === '.csv')  type = 'FILE_CSV';

    const fileName = path.basename(absPath);
    const relPath = 'dataset' + absPath.split('dataset')[1];
    const sourceName = '[Dataset] ' + fileName;

    const existing = await client.query('SELECT id FROM knowledge_sources WHERE name = $1', [sourceName]);
    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO knowledge_sources (id, name, type, file_name, file_path, status, metadata, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVE', $5, NOW(), NOW())`,
        [sourceName, type, fileName, relPath, JSON.stringify({ useAiPreprocessing: true })]
      );
      added++;
    } else {
      skipped++;
    }
  }
  console.log('Added:', added, '| Skipped:', skipped);
  await client.end();
}

run().catch(console.error);
