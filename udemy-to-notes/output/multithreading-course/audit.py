import json

with open('all-transcripts.json') as f:
    data = json.load(f)

lectures = data['lectures']
all_lecs = list(lectures.values())
all_lecs.sort(key=lambda x: x.get('index', 0))

with_t = [l for l in all_lecs if l.get('transcript') and len(l['transcript'].strip()) > 50]
without_t = [l for l in all_lecs if not l.get('transcript') or len(l['transcript'].strip()) <= 50]

print("=== MULTITHREADING COURSE AUDIT ===")
print(f"Total video lectures: {len(all_lecs)}")
print(f"With transcript: {len(with_t)}")
print(f"Without transcript: {len(without_t)}")
print()

with open('manifest.json') as f:
    manifest = json.load(f)
note_titles = {l['title'] for l in manifest['lectures']}
print(f"Notes generated (from manifest): {len(manifest['lectures'])}")
print()

print("=== ALL LECTURES - FULL STATUS ===")
for l in all_lecs:
    has_t = "T" if l.get('transcript') and len(l['transcript'].strip()) > 50 else "-"
    has_note = "N" if l['title'] in note_titles else " "
    tlen = len(l['transcript'].strip()) if l.get('transcript') else 0
    print(f"  [{has_t}][{has_note}] [{l.get('section','?')}] {l['title']} ({tlen} chars)")

print()
print("=== VIDEOS WITHOUT TRANSCRIPTS (NO NOTES) ===")
for i, l in enumerate(without_t, 1):
    in_notes = "HAS NOTE" if l['title'] in note_titles else "NO NOTE"
    print(f"  {i:2}. [{l.get('section','?')}] {l['title']} -- {in_notes}")
