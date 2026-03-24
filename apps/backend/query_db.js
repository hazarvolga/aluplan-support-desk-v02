const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:changeme@localhost:5432/aluplan_support?schema=public' });
  await client.connect();
  const res = await client.query("SELECT id, title FROM knowledge_articles WHERE title ILIKE '%kalem%' OR title ILIKE '%tarama%'");
  console.log("KNOWLEDGE ARTICLES:", res.rows);
  const res2 = await client.query("SELECT id, substring(content for 100) as content FROM knowledge_article_versions WHERE content ILIKE '%kalem%' OR content ILIKE '%tarama%'");
  console.log("KNOWLEDGE VERSIONS:", res2.rows);
  const faq = await client.query("SELECT id, question, substring(answer for 100) as answer FROM faq_entries WHERE question ILIKE '%kalem%' OR answer ILIKE '%kalem%' OR question ILIKE '%ölçü%' OR answer ILIKE '%ölçü%'");
  console.log("FAQ ENTRIES:", faq.rows);
  await client.end();
}
run().catch(console.error);
