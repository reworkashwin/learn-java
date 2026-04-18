import json

with open('all-transcripts.json') as f:
    data = json.load(f)

lectures = data['lectures']
all_lecs = list(lectures.values())
all_lecs.sort(key=lambda x: x.get('index', 0))

with_t = [l for l in all_lecs if l.get('transcript') and len(l['transcript'].strip()) > 50]
without_t = [l for l in all_lecs if not l.get('transcript') or len(l['transcript'].strip()) <= 50]

print("=== GENERICS COURSE AUDIT ===")
print(f"Total video lectures: {len(all_lecs)}")
print(f"With transcript: {len(with_t)}")
print(f"Without transcript: {len(without_t)}")
print()

with open('manifest.json') as f:
    manifest = json.load(f)
note_titles = {l['title'] for l in manifest['lectures']}
print(f"Notes generated (from manifest): {len(manifest['lectures'])}")
print()

print("=== VIDEOS WITHOUT TRANSCRIPTS ===")
for i, l in enumerate(without_t, 1):
    print(f"  {i:2}. [{l.get('section','?')}] {l['title']}")
