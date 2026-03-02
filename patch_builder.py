import os

file = 'apps/backend/src/ai/prompt-context-builder.service.ts'
with open(file, 'r', encoding='utf8') as f:
    content = f.read()

# Remove the section:
# // 3. Knowledge Base
# // System prompt handles Knowledge Base injection for OLLAMA/OpenAI via AiProvider interfaces
# context += `[3. Bilgi Bankası (Knowledge Base)]\nAşağıda sağlanan "ONAYLI BİLGİ KAYNAGI" referansını okuyun.\n\n`;

content = content.replace(
    '// 3. Knowledge Base\n        // System prompt handles Knowledge Base injection for OLLAMA/OpenAI via AiProvider interfaces\n        context += `[3. Bilgi Bankası (Knowledge Base)]\\nAşağıda sağlanan "ONAYLI BİLGİ KAYNAGI" referansını okuyun.\\n\\n`;',
    ''
)

with open(file, 'w', encoding='utf8') as f:
    f.write(content)
