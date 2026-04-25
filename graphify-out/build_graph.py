import json
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html
from pathlib import Path

ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text())
cached = json.loads(Path('graphify-out/.graphify_cached.json').read_text())

seen = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in cached['nodes']:
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast['edges'] + cached['edges']
merged_hyperedges = cached.get('hyperedges', [])

extraction = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': 0,
    'output_tokens': 0,
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(extraction, indent=2))

G = build_from_json(extraction)
communities = cluster(G)
cohesion = score_all(G, communities)
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: 'Community ' + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
tokens = {'input': 0, 'output': 0}

report = generate(G, communities, cohesion, labels, gods, surprises, detect, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report)
to_json(G, communities, 'graphify-out/graph.json', force=True)
to_html(G, communities, 'graphify-out/graph.html')

print(f'Graf tamamlandi: {G.number_of_nodes()} node, {G.number_of_edges()} edge, {len(communities)} community')
print()
print('=== GOD NODES ===')
for g in gods[:10]:
    print(f'  {g["label"]} - {g["degree"]} edge')
