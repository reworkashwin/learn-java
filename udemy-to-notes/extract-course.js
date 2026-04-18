#!/usr/bin/env node
/**
 * Universal Udemy Transcript Extractor
 *
 * Usage:
 *   node extract-course.js <course-url-or-slug> [output-folder-name]
 *
 * Examples:
 *   node extract-course.js https://www.udemy.com/course/spring-springboot-jpa-hibernate-zero-to-master/
 *   node extract-course.js react-the-complete-guide react-notes
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Parse arguments ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node extract-course.js <course-url-or-slug> [output-folder-name]');
  console.error('Example: node extract-course.js https://www.udemy.com/course/my-course/');
  process.exit(1);
}

let COURSE_SLUG = args[0];
const urlMatch = COURSE_SLUG.match(/udemy\.com\/course\/([^/?#]+)/);
if (urlMatch) COURSE_SLUG = urlMatch[1].replace(/\/$/, '');

const OUTPUT_FOLDER_NAME = args[1] || COURSE_SLUG;
const OUTPUT_DIR = path.join(__dirname, 'output', OUTPUT_FOLDER_NAME);
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

console.log('╔══════════════════════════════════════════╗');
console.log('║   Udemy Transcript Extractor             ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`  Course: ${COURSE_SLUG}`);
console.log(`  Output: ${OUTPUT_DIR}`);
console.log('');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(text) {
  return text.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase();
}

// ─── Login ───────────────────────────────────────────────────────────────────
async function login(page) {
  console.log('[1/5] Checking login...');
  await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/`);
  await sleep(3000);
  await page.waitForLoadState('networkidle').catch(() => {});

  const loggedIn = await page.evaluate(() => {
    return document.cookie.includes('access_token') ||
      !!document.querySelector('[data-purpose="user-dropdown"]') ||
      !!document.querySelector('[class*="logged-in"]');
  });

  if (loggedIn) {
    console.log('  ✅ Already logged in');
    return;
  }

  console.log('  ⏳ Login required — browser window is open');
  try {
    await page.goto('https://www.udemy.com/join/login-popup/', { timeout: 15000 });
  } catch {
    // Fallback: try alternative login URLs
    try {
      await page.goto('https://www.udemy.com/join/login-popup/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch {
      await page.goto('https://www.udemy.com/', { timeout: 15000 });
    }
  }
  await sleep(2000);

  console.log('');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │  LOG IN to Udemy in the browser window   │');
  console.log('  │  (email + password or verification code) │');
  console.log('  │  The script will continue automatically  │');
  console.log('  └─────────────────────────────────────────┘');
  console.log('');

  await page.waitForURL(url => {
    const href = url.toString();
    return !href.includes('/join/') && !href.includes('/login') &&
      (href.includes('/learn/') || href.includes('/home/') || href.includes('/my-courses/') ||
       href.includes('/course/') || href === 'https://www.udemy.com/' ||
       href.includes('/dashboard') || href.includes('/occupation/'));
  }, { timeout: 300000 });

  await sleep(2000);
  console.log('  ✅ Login successful');
}

// ─── Discover Course ID ──────────────────────────────────────────────────────
async function discoverCourseId(page) {
  console.log('[2/5] Discovering course ID...');

  await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/`, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  let courseId = await page.evaluate(() => {
    const bodyId = document.body.getAttribute('data-course-id');
    if (bodyId) return parseInt(bodyId);

    const el = document.querySelector('[data-clp-course-id]');
    if (el) return parseInt(el.getAttribute('data-clp-course-id'));

    const match = document.documentElement.innerHTML.match(/"id"\s*:\s*(\d{5,8})/);
    if (match) return parseInt(match[1]);

    return null;
  });

  if (!courseId) {
    courseId = await page.evaluate(async (slug) => {
      try {
        const resp = await fetch(`/api-2.0/courses/${slug}/?fields[course]=id`);
        if (resp.ok) return (await resp.json()).id;
      } catch (e) {}
      return null;
    }, COURSE_SLUG);
  }

  if (!courseId) {
    console.error('  ❌ Could not find course ID. Are you enrolled?');
    process.exit(1);
  }

  console.log(`  ✅ Course ID: ${courseId}`);
  return courseId;
}

// ─── Get Curriculum ──────────────────────────────────────────────────────────
async function getCurriculum(page, courseId) {
  console.log('[3/5] Fetching curriculum...');
  let allItems = [];
  let url = `/api-2.0/courses/${courseId}/subscriber-curriculum-items/?page_size=200&fields[lecture]=id,title,object_index,is_published,sort_order,asset&fields[chapter]=id,title,object_index,sort_order&fields[asset]=asset_type,length`;

  while (url) {
    const data = await page.evaluate(async (fetchUrl) => {
      const resp = await fetch(fetchUrl);
      return resp.json();
    }, url);

    if (!data.results) {
      console.error('  ❌ Failed to fetch curriculum. Are you enrolled?');
      process.exit(1);
    }

    allItems = allItems.concat(data.results);
    url = data.next || null;
  }

  console.log(`  ✅ Found ${allItems.length} curriculum items`);
  return allItems;
}

// ─── Get Transcript ──────────────────────────────────────────────────────────
async function getTranscript(page, lectureId) {
  const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;

  try {
    await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {}

  await sleep(3000);

  // Open transcript panel
  try {
    const transcriptBtn = page.getByRole('button', { name: 'Transcript in sidebar region' });
    if (await transcriptBtn.isVisible({ timeout: 5000 })) {
      await transcriptBtn.click();
      await sleep(2000);
    }
  } catch (e) {
    try {
      const transcriptTab = page.getByRole('tab', { name: 'Transcript' });
      if (await transcriptTab.isVisible({ timeout: 2000 })) {
        await transcriptTab.click();
        await sleep(2000);
      }
    } catch (e2) {
      return null;
    }
  }

  await sleep(2000);
  try {
    await page.waitForSelector('[class*="transcript--cue-container"]', { timeout: 5000 });
  } catch (e) {}
  await sleep(1000);

  return await page.evaluate(() => {
    const cues = document.querySelectorAll('[class*="transcript--cue-container"]');
    if (cues.length > 0) {
      const texts = Array.from(cues).map(c => (c.querySelector('p') || c).textContent.trim()).filter(t => t.length > 0);
      if (texts.length > 0) return texts.join(' ');
    }

    const pTags = document.querySelectorAll('[class*="transcript--underline-cue"]');
    if (pTags.length > 0) {
      const texts = Array.from(pTags).map(p => p.textContent.trim()).filter(t => t.length > 0);
      if (texts.length > 0) return texts.join(' ');
    }

    const transcriptEls = document.querySelectorAll('[class*="transcript"]');
    for (const el of transcriptEls) {
      if (el.textContent.length > 200 && el.querySelectorAll('p, span').length > 3) {
        const items = el.querySelectorAll('p, span');
        const texts = Array.from(items).map(i => i.textContent.trim()).filter(t => t.length > 3);
        if (texts.length > 3) return texts.join(' ');
      }
    }

    return null;
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching Chrome...\n');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check']
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    await login(page);
    const courseId = await discoverCourseId(page);

    await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/learn/`, { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    const curriculum = await getCurriculum(page, courseId);

    // Build structure
    let currentSection = null;
    const sections = [];
    const lectures = [];

    for (const item of curriculum) {
      if (item._class === 'chapter') {
        currentSection = { id: item.id, title: item.title, index: item.object_index, lectures: [] };
        sections.push(currentSection);
      } else if (item._class === 'lecture' && item.asset && item.asset.asset_type === 'Video') {
        const lecture = {
          id: item.id, title: item.title, index: item.object_index,
          section: currentSection ? currentSection.title : 'Unknown',
          sectionIndex: currentSection ? currentSection.index : 0,
          duration: item.asset.length, transcript: null
        };
        if (currentSection) currentSection.lectures.push(lecture);
        lectures.push(lecture);
      }
    }

    console.log(`\n[4/5] Extracting transcripts (${lectures.length} lectures)...\n`);

    // Resume support
    let existingData = {};
    if (fs.existsSync(ALL_TRANSCRIPTS_FILE)) {
      try {
        existingData = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));
        const c = Object.values(existingData.lectures || {}).filter(l => l.transcript).length;
        console.log(`  Resuming — ${c} already extracted\n`);
      } catch (e) {}
    }

    let extracted = 0, skipped = 0;

    for (const lecture of lectures) {
      if (existingData.lectures?.[lecture.id]?.transcript) {
        lecture.transcript = existingData.lectures[lecture.id].transcript;
        skipped++;
        continue;
      }

      const n = extracted + skipped + 1;
      process.stdout.write(`  [${n}/${lectures.length}] ${lecture.title.substring(0, 60)}...`);

      const transcript = await getTranscript(page, lecture.id);

      if (transcript && transcript.length > 50) {
        lecture.transcript = transcript;
        extracted++;
        console.log(` ✅ ${transcript.length} chars`);
      } else {
        console.log(` ⚠️  no transcript`);
      }

      // Save after every lecture
      const saveData = buildSaveData(courseId, sections, lectures);
      fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(saveData, null, 2));
    }

    // Retry missing
    const missing = lectures.filter(l => !l.transcript);
    let recovered = 0;
    if (missing.length > 0) {
      console.log(`\n  Retrying ${missing.length} missing...`);
      const saveData = buildSaveData(courseId, sections, lectures);
      for (const lec of missing) {
        const t = await getTranscript(page, lec.id);
        if (t && t.length > 50) {
          lec.transcript = t;
          saveData.lectures[lec.id].transcript = t;
          recovered++;
          fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(saveData, null, 2));
        }
      }
    }

    // Final save
    const finalData = buildSaveData(courseId, sections, lectures);
    fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(finalData, null, 2));

    // Save individual .txt files
    for (const section of sections) {
      const sectionDir = path.join(OUTPUT_DIR, `section-${String(section.index).padStart(2, '0')}`);
      fs.mkdirSync(sectionDir, { recursive: true });
      for (const lec of section.lectures) {
        if (lec.transcript) {
          const fname = `${String(lec.index).padStart(2, '0')}-${slugify(lec.title)}.txt`;
          fs.writeFileSync(path.join(sectionDir, fname), lec.transcript);
        }
      }
    }

    // Create manifest
    const withTranscripts = lectures.filter(l => l.transcript).sort((a, b) => {
      if (a.sectionIndex !== b.sectionIndex) return a.sectionIndex - b.sectionIndex;
      return a.index - b.index;
    });

    const manifest = {
      courseSlug: COURSE_SLUG,
      courseId,
      totalLectures: lectures.length,
      totalWithTranscripts: withTranscripts.length,
      outputDir: OUTPUT_DIR,
      sections: sections.map(s => ({
        index: s.index, title: s.title,
        lectureCount: s.lectures.length,
        dir: `section-${String(s.index).padStart(2, '0')}`
      })),
      lectures: withTranscripts.map((l, i) => ({
        noteNumber: String(i + 1).padStart(3, '0'),
        lectureId: l.id, title: l.title,
        section: l.section, sectionIndex: l.sectionIndex,
        transcriptFile: `section-${String(l.sectionIndex).padStart(2, '0')}/${String(l.index).padStart(2, '0')}-${slugify(l.title)}.txt`,
        noteFile: `${String(i + 1).padStart(3, '0')}-${slugify(l.title)}.md`
      }))
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

    const total = withTranscripts.length + missing.length - recovered;
    console.log('');
    console.log('[5/5] Done!');
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log(`║  Lectures:     ${String(lectures.length).padStart(4)}                      ║`);
    console.log(`║  Transcripts:  ${String(withTranscripts.length).padStart(4)}                      ║`);
    console.log(`║  Missing:      ${String(lectures.length - withTranscripts.length).padStart(4)}                      ║`);
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Output: ${OUTPUT_DIR.substring(0, 31).padEnd(31)} ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    console.log('Next: Use ai-prompt.md with your AI tool to convert transcripts → notes');

  } finally {
    await context.close();
  }
}

function buildSaveData(courseId, sections, lectures) {
  const data = {
    courseId, courseSlug: COURSE_SLUG,
    extractedAt: new Date().toISOString(),
    sections: sections.map(s => ({ id: s.id, title: s.title, index: s.index })),
    lectures: {}
  };
  for (const l of lectures) {
    data.lectures[l.id] = {
      id: l.id, title: l.title, index: l.index,
      section: l.section, sectionIndex: l.sectionIndex,
      duration: l.duration, transcript: l.transcript
    };
  }
  return data;
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
