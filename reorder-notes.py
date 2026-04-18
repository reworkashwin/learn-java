#!/usr/bin/env python3
"""Reorder notes to match the actual course lecture sequence.
Uses slug-based matching to find each lecture's note file."""
import json, os, sys, shutil, re

def slugify(text):
    """Convert title to a normalized slug for matching."""
    s = text.lower()
    s = re.sub(r'[<>()!?,\'\"]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s

def match_file_to_title(title, files_remaining):
    """Find the best matching file for a lecture title."""
    title_slug = slugify(title)
    title_words = set(title_slug.split('-'))

    best_match = None
    best_score = 0

    for f in files_remaining:
        file_slug = re.sub(r'^\d+-', '', f.replace('.md', ''))

        # Exact slug match
        if file_slug == title_slug:
            return f

        # Check if one contains the other
        if title_slug in file_slug or file_slug in title_slug:
            score = len(title_slug) + 100
            if score > best_score:
                best_score = score
                best_match = f
                continue

        # Word overlap scoring
        file_words = set(file_slug.split('-'))
        overlap = title_words & file_words
        # Weight by significant words (>3 chars)
        sig_overlap = [w for w in overlap if len(w) > 3]
        score = len(sig_overlap) * 10 + len(overlap)
        if score > best_score:
            best_score = score
            best_match = f

    # Require minimum match quality
    if best_score >= 10:
        return best_match
    return None


def reorder_course(transcripts_path, notes_dir, course_name):
    print(f"\n{'='*60}")
    print(f"  Reordering: {course_name}")
    print(f"{'='*60}")

    with open(transcripts_path) as f:
        data = json.load(f)

    # Get full ordered lecture list
    all_lecs = list(data['lectures'].values())
    all_lecs.sort(key=lambda x: x.get('index', 0))

    all_files = sorted([f for f in os.listdir(notes_dir) if f.endswith('.md')])

    print(f"  Total lectures: {len(all_lecs)}")
    print(f"  Total note files: {len(all_files)}")

    # Match each lecture to a file using slug matching
    files_remaining = list(all_files)
    lecture_to_file = {}
    unmatched_lectures = []

    for lec in all_lecs:
        title = lec['title']
        match = match_file_to_title(title, files_remaining)
        if match:
            lecture_to_file[title] = match
            files_remaining.remove(match)
        else:
            unmatched_lectures.append(title)

    print(f"  Matched: {len(lecture_to_file)}")
    print(f"  Unmatched lectures: {len(unmatched_lectures)}")
    print(f"  Unmatched files: {len(files_remaining)}")

    if unmatched_lectures:
        print(f"\n  UNMATCHED LECTURES:")
        for t in unmatched_lectures:
            print(f"    - {t}")
    if files_remaining:
        print(f"\n  UNMATCHED FILES:")
        for f in files_remaining:
            print(f"    - {f}")

    # Build rename plan
    print(f"\n  New ordering:")
    renames = []
    for new_num, lec in enumerate(all_lecs, 1):
        title = lec['title']
        old_file = lecture_to_file.get(title)
        if not old_file:
            print(f"  {new_num:3d}. !! MISSING: {title}")
            continue
        old_slug = re.sub(r'^\d+-', '', old_file)
        new_file = f"{new_num:02d}-{old_slug}"
        renames.append((old_file, new_file))
        changed = "" if old_file == new_file else " *"
        print(f"  {new_num:3d}. {old_file}  ->  {new_file}{changed}")

    # Execute renames via temp directory
    print(f"\n  Executing {len(renames)} renames...")
    tmp_dir = os.path.join(notes_dir, '__tmp_reorder__')
    os.makedirs(tmp_dir, exist_ok=True)

    # Phase 1: move all .md files to temp
    for f in os.listdir(notes_dir):
        if f.endswith('.md'):
            shutil.move(os.path.join(notes_dir, f), os.path.join(tmp_dir, f))

    # Phase 2: move back with new names
    rename_map = {old: new for old, new in renames}
    for f in os.listdir(tmp_dir):
        new_name = rename_map.get(f, f)
        shutil.move(os.path.join(tmp_dir, f), os.path.join(notes_dir, new_name))

    os.rmdir(tmp_dir)

    final_count = len([f for f in os.listdir(notes_dir) if f.endswith('.md')])
    print(f"\n  Done! {final_count} notes in correct order.")


BASE = "/Users/ashwin-14876/My Files"

# Multithreading course
reorder_course(
    f"{BASE}/udemy-to-notes/output/multithreading-course/all-transcripts.json",
    f"{BASE}/multithreading-notes",
    "Multithreading & Parallel Computing"
)

# Generics course
reorder_course(
    f"{BASE}/udemy-to-notes/output/generics-course/all-transcripts.json",
    f"{BASE}/generics-notes",
    "Java Generics & Collections"
)
