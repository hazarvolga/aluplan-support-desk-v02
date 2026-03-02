import json
import os
import re

input_file = '/Users/hazarekiz/Projects/aluplan-support-desk-V02/yeni_veriler.md'
dataset_file = '/Users/hazarekiz/Projects/aluplan-support-desk-V02/dataset/allplan_qa_dataset.json'
articles_dir = '/Users/hazarekiz/Projects/aluplan-support-desk-V02/dataset/support_articles'

with open(input_file, 'r', encoding='utf-8') as f:
    text = f.read()

article_pattern = re.compile(r'Yapılandırılmış Destek Makalesi:\s*(.*?)\n(.*?)(?=\nYapılandırılmış Destek Makalesi:|\Z)', re.DOTALL)
articles = article_pattern.findall(text)

with open(dataset_file, 'r', encoding='utf-8') as f:
    dataset = json.load(f)

existing_qa = dataset['qa_pairs']
max_id = max([int(qa['id'].replace('QA_', '')) for qa in existing_qa])

new_articles_count = 0
for title, content in articles:
    content = content.split('--------------------------------------------------------------------------------')[0].strip()
    # Also split on "Bu makale ile" or "Bu makaleyi de" or "Bu kritik konuyu da" which are conversational markers from the AI
    content = re.sub(r'\nBu makale.*\Z', '', content, flags=re.DOTALL)
    content = re.sub(r'\nBu eklemeyle.*\Z', '', content, flags=re.DOTALL)
    content = content.replace('Bu adımlar sizin için net mi?', '')
    
    full_content = f"# {title}\n\n{content.strip()}"
    filename = title.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('/', '_').replace('ç','c').replace('ğ','g').replace('ı','i').replace('ö','o').replace('ş','s').replace('ü','u')
    filename = re.sub(r'[^a-z0-9_]', '', filename) + '.md'
    
    filepath = os.path.join(articles_dir, filename)
    
    problem_match = re.search(r'Problem Özeti:\s*(.*?)\n', content)
    short_answer = problem_match.group(1).strip() if problem_match else title
    
    print(f"Processing: {filename}")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)
        
    found = False
    for qa in existing_qa:
        if qa['long_answer_markdown_ref'].endswith(filename):
            qa['short_answer'] = short_answer
            found = True
            break
            
    if not found:
        max_id += 1
        new_id = f"QA_{max_id:03d}"
        existing_qa.append({
            "id": new_id,
            "category": "Yeni Veri / " + title.split(' ')[0],
            "short_answer": short_answer,
            "long_answer_markdown_ref": f"support_articles/{filename}"
        })
        new_articles_count += 1

with open(dataset_file, 'w', encoding='utf-8') as f:
    json.dump(dataset, f, indent=4, ensure_ascii=False)

print(f"Added {new_articles_count} new articles to the dataset.")
