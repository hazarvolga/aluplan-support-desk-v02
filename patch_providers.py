import os
import re

files = [
    'apps/backend/src/ai/ollama.service.ts',
    'apps/backend/src/ai/openai.service.ts',
    'apps/backend/src/ai/generic-openai.service.ts',
    'apps/backend/src/ai/llm-api.service.ts'
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf8') as f:
        content = f.read()

    # Replace system prompt injection
    content = content.replace(
        'content: `${systemPrompt}\\n\\n---\\nONAYLI BİLGİ KAYNAĞI:\\n${kbContent}`',
        'content: systemPrompt'
    )
    
    # Replace user role content for stream and non-stream
    content = re.sub(
        r"\{\s*role:\s*'user',\s*content:\s*userQuery\s*\}",
        "{ role: 'user', content: `KULLANICI SORUSU:\\n${userQuery}\\n\\n---\\n\\nONAYLI BİLGİ KAYNAĞI:\\n${kbContent}\\n\\nYukarıdaki bilgi kaynağına dayanarak teknik bir dille özetle ve doğrudan soruyu yanıtla. Metni birebir kopyalama.` }",
        content
    )

    with open(file, 'w', encoding='utf8') as f:
        f.write(content)
    
    print(f"Patched {file}")
