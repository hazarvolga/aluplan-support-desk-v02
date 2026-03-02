import * as fs from 'fs';
const file = 'apps/backend/src/ai/ollama.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace system prompt injection in reformat
content = content.replace(
    'content: `${systemPrompt}\\n\\n---\\nONAYLI BİLGİ KAYNAĞI:\\n${kbContent}`',
    'content: systemPrompt'
);
content = content.replace(
    /\{\s*role:\s*'user',\s*content:\s*userQuery\s*\}/g,
    "{ role: 'user', content: `KULLANICI SORUSU:\\n${userQuery}\\n\\n---\\n\\nONAYLI BİLGİ KAYNAĞI:\\n${kbContent}\\n\\nYukarıdaki kaynağa dayanarak soruyu yanıtla (tam metni kopyalama, özetle).` }"
);

fs.writeFileSync(file, content);
console.log('Patched ollama.service.ts');
