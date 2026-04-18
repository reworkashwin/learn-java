#!/usr/bin/env node
/**
 * Universal Udemy Transcript Extractor
 * 
 * Usage:
 *   node extract-course.js <course-url-or-slug> [output-folder-name]
 * 
 * Examples:
 *   node extract-course.js https://www.udemy.com/course/spring-springboot-jpa-hibernate-zero-to-master/
 *   node extract-course.js spring-springboot-jpa-hibernate-zero-to-master spring-boot-notes
 *   node extract-course.js https://www.udemy.com/course/react-the-complete-guide/ react-notes
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

// Extract slug from URL or use as-is
let COURSE_SLUG = args[0];
const urlMatch = COURSE_SLUG.match(/udemy\.com\/course\/([^/?#]+)/);
if (urlMatch) COURSE_SLUG = urlMatch[1].replace(/\/$/, '');

const OUTPUT_FOLDER_NAME = args[1] || `${COURSE_SLUG}-notes`;
const BASE_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(BASE_DIR, 'transcripts', COURSE_SLUG);
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const NOTES_DIR = path.join(BASE_DIR, OUTPUT_FOLDER_NAME);
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

console.log(`Course slug: ${COURSE_SLUG}`);
console.log(`Transcripts dir: ${OUTPUT_DIR}`);
console.log(`Notes dir: ${NOTES_DIR}`);
console.log('');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Login ───────────────────────────────────────────────────────────────────
async function login(page) {
  console.log('Navigating to Udemy...');
  await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/`);
  await sleep(3000);
  await page.waitForLoadState('networkidle').catch(() => {});

  // Check if already logged in by looking for enrolled course access
  const loggedIn = await page.evaluate(() => {
    return document.cookie.includes('access_token') || 
           !!document.querySelector('[data-purpose="user-dropdown"]') ||
           !!document.querySelector('[class*="logged-in"]');
  });

  if (loggedIn) {
    console.log('Already logged in!');
    return true;
  }

  // Navigate to login page
  console.log('Need to log in...');
  await page.goto('https://www.udemy.com/join/login-popup/');
  await sleep(2000);

  const emailInput = page.locator('input[name="email"], input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  
  console.log('\n========================================');
  console.log('BROWSER WINDOW IS OPEN');
  console.log('Please log in manually (email + code/password)');
  console.log('The script will continue once you are on the course page');
  console.log('========================================\n');

  // Wait for the user to complete login — watch for course page or dashboard
  await page.waitForURL(url => {
    const href = url.toString();
    return href.includes('/learn/') || href.includes('/home/') || href.includes('/my-courses/');
  }, { timeout: 300000 }); // 5 minutes

  await sleep(2000);
  console.log('Login successful!');
  return true;
}

// ─── Discover Course ID ──────────────────────────────────────────────────────
async function discoverCourseId(page) {
  console.log('Discovering course ID...');

  // Navigate to the course page to find the course ID
  await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/`, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  // Try to get course ID from page metadata
  let courseId = await page.evaluate(() => {
    // Method 1: data attribute on body or elements
    const bodyId = document.body.getAttribute('data-course-id');
    if (bodyId) return parseInt(bodyId);

    // Method 2: look in script tags for course data
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const s of scripts) {
      try {
        const data = JSON.parse(s.textContent);
        if (data['@type'] === 'Course' && data.url) {
          // Course ID might be elsewhere
        }
      } catch (e) {}
    }

    // Method 3: check for course ID in any data attribute
    const el = document.querySelector('[data-clp-course-id]');
    if (el) return parseInt(el.getAttribute('data-clp-course-id'));

    // Method 4: search page source for course ID pattern
    const match = document.documentElement.innerHTML.match(/"id"\s*:\s*(\d{5,8})/);
    if (match) return parseInt(match[1]);

    return null;
  });

  if (!courseId) {
    // Method 5: Use the API to search for course by slug
    courseId = await page.evaluate(async (slug) => {
      try {
        const resp = await fetch(`/api-2.0/courses/${slug}/?fields[course]=id`);
        if (resp.ok) {
          const data = await resp.json();
          return data.id;
        }
      } catch (e) {}
      return null;
    }, COURSE_SLUG);
  }

  if (!courseId) {
    console.error('Could not discover course ID. Please check the course URL.');
    process.exit(1);
  }

  console.log(`Course ID: ${courseId}`);
  return courseId;
}

// ─── Get Curriculum ──────────────────────────────────────────────────────────
async function getCurriculum(page, courseId) {
  console.log('Fetching course curriculum...');
  let allItems = [];
  let url = `/api-2.0/courses/${courseId}/subscriber-curriculum-items/?page_size=200&fields[lecture]=id,title,object_index,is_published,sort_order,asset&fields[chapter]=id,title,object_index,sort_order&fields[asset]=asset_type,length`;

  while (url) {
    const data = await page.evaluate(async (fetchUrl) => {
      const resp = await fetch(fetchUrl);
      return resp.json();
    }, url);

    if (!data.results) {
      console.error('Failed to fetch curriculum. Are you enrolled in this course?');
      process.exit(1);
    }

    allItems = allItems.concat(data.results);
    url = data.next || null;
  }

  console.log(`Found ${allItems.length} curriculum items total`);
  return allItems;
}

// ─── Get Transcript ──────────────────────────────────────────────────────────
async function getTranscript(page, lectureId) {
  const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;

  try {
    await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log(`  Navigation timeout for lecture ${lectureId}, continuing...`);
  }

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

  // Extract transcript text
  const transcript = await page.evaluate(() => {
    const cues = document.querySelectorAll('[class*="transcript--cue-container"]');
    if (cues.length > 0) {
      const texts = Array.from(cues).map(c => {
        const p = c.querySelector('p') || c;
        return p.textContent.trim();
      }).filter(t => t.length > 0);
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

  return transcript;
}

// ─── Retry failed transcripts ────────────────────────────────────────────────
async function retryMissing(page, lectures, saveData) {
  const missing = lectures.filter(l => !l.transcript);
  if (missing.length === 0) return 0;

  console.log(`\nRetrying ${missing.length} missing transcripts...`);
  let recovered = 0;

  for (const lecture of missing) {
    console.log(`  [RETRY] ${lecture.sectionIndex}.${lecture.index}: ${lecture.title}`);
    const transcript = await getTranscript(page, lecture.id);
    if (transcript && transcript.length > 50) {
      lecture.transcript = transcript;
      saveData.lectures[lecture.id].transcript = transcript;
      recovered++;
      console.log(`    ✅ Recovered (${transcript.length} chars)`);
      fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(saveData, null, 2));
    } else {
      console.log(`    ⚠️  Still no transcript`);
    }
  }

  return recovered;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(NOTES_DIR, { recursive: true });

  console.log('Launching browser (using real Chrome)...');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    // Step 1: Login
    await login(page);
    console.log('');

    // Step 2: Discover course ID
    const courseId = await discoverCourseId(page);

    // Step 3: Navigate to first lecture to ensure we're in the player context
    await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/learn/`, { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    // Step 4: Get curriculum
    const curriculum = await getCurriculum(page, courseId);

    // Build organized structure
    let currentSection = null;
    const sections = [];
    const lectures = [];

    for (const item of curriculum) {
      if (item._class === 'chapter') {
        currentSection = {
          id: item.id,
          title: item.title,
          index: item.object_index,
          lectures: []
        };
        sections.push(currentSection);
      } else if (item._class === 'lecture' && item.asset && item.asset.asset_type === 'Video') {
        const lecture = {
          id: item.id,
          title: item.title,
          index: item.object_index,
          section: currentSection ? currentSection.title : 'Unknown',
          sectionIndex: currentSection ? currentSection.index : 0,
          duration: item.asset.length,
          transcript: null
        };
        if (currentSection) currentSection.lectures.push(lecture);
        lectures.push(lecture);
      }
    }

    console.log(`\nFound ${lectures.length} video lectures across ${sections.length} sections`);
    console.log('Starting transcript extraction...\n');

    // Load existing progress (resume support)
    let existingData = {};
    if (fs.existsSync(ALL_TRANSCRIPTS_FILE)) {
      try {
        existingData = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));
        const existingCount = Object.values(existingData.lectures || {}).filter(l => l.transcript).length;
        console.log(`Resuming: ${existingCount} transcripts already extracted\n`);
      } catch (e) {}
    }

    let extracted = 0;
    let skipped = 0;

    for (const lecture of lectures) {
      if (existingData.lectures && existingData.lectures[lecture.id] && existingData.lectures[lecture.id].transcript) {
        lecture.transcript = existingData.lectures[lecture.id].transcript;
        skipped++;
        continue;
      }

      console.log(`[${extracted + skipped + 1}/${lectures.length}] S${lecture.sectionIndex}.${lecture.index}: ${lecture.title}`);

      const transcript = await getTranscript(page, lecture.id);

      if (transcript && transcript.length > 50) {
        lecture.transcript = transcript;
        extracted++;
        console.log(`  ✅ Got transcript (${transcript.length} chars)`);
      } else {
        console.log(`  ⚠️  No transcript available`);
      }

      // Save progress after each lecture
      const saveData = {
        courseId,
        courseSlug: COURSE_SLUG,
        extractedAt: new Date().toISOString(),
        sections: sections.map(s => ({ id: s.id, title: s.title, index: s.index })),
        lectures: {}
      };
      for (const l of lectures) {
        saveData.lectures[l.id] = {
          id: l.id,
          title: l.title,
          index: l.index,
          section: l.section,
          sectionIndex: l.sectionIndex,
          duration: l.duration,
          transcript: l.transcript
        };
      }
      fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(saveData, null, 2));
    }

    // Build final save data
    const saveData = {
      courseId,
      courseSlug: COURSE_SLUG,
      extractedAt: new Date().toISOString(),
      sections: sections.map(s => ({ id: s.id, title: s.title, index: s.index })),
      lectures: {}
    };
    for (const l of lectures) {
      saveData.lectures[l.id] = {
        id: l.id,
        title: l.title,
        index: l.index,
        section: l.section,
        sectionIndex: l.sectionIndex,
        duration: l.duration,
        transcript: l.transcript
      };
    }
    fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(saveData, null, 2));

    // Retry missing transcripts (one retry pass)
    const recovered = await retryMissing(page, lectures, saveData);

    const totalWithTranscripts = lectures.filter(l => l.transcript).length;
    const totalMissing = lectures.length - totalWithTranscripts;

    console.log(`\n========================================`);
    console.log(`EXTRACTION COMPLETE`);
    console.log(`  Total lectures: ${lectures.length}`);
    console.log(`  With transcripts: ${totalWithTranscripts}`);
    console.log(`  Missing: ${totalMissing}`);
    console.log(`  New this run: ${extracted}`);
    console.log(`  Recovered on retry: ${recovered}`);
    console.log(`  Skipped (already had): ${skipped}`);
    console.log(`  Saved to: ${ALL_TRANSCRIPTS_FILE}`);
    console.log(`========================================\n`);

    // Save individual .txt files per section
    for (const section of sections) {
      const sectionDir = path.join(OUTPUT_DIR, `section-${String(section.index).padStart(2, '0')}`);
      fs.mkdirSync(sectionDir, { recursive: true });

      for (const lecture of section.lectures) {
        if (lecture.transcript) {
          const filename = `${String(lecture.index).padStart(2, '0')}-${lecture.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
          fs.writeFileSync(path.join(sectionDir, filename), lecture.transcript);
        }
      }
    }

    console.log('Individual transcript files saved per section.');

    // Write a manifest for the notes agent to use
    const manifest = {
      courseSlug: COURSE_SLUG,
      courseId,
      notesDir: NOTES_DIR,
      transcriptsDir: OUTPUT_DIR,
      totalLectures: lectures.length,
      totalWithTranscripts: totalWithTranscripts,
      sections: sections.map(s => ({
        index: s.index,
        title: s.title,
        lectureCount: s.lectures.length,
        transcriptDir: path.join(OUTPUT_DIR, `section-${String(s.index).padStart(2, '0')}`)
      })),
      lectures: lectures.filter(l => l.transcript).sort((a, b) => {
        if (a.sectionIndex !== b.sectionIndex) return a.sectionIndex - b.sectionIndex;
        return a.index - b.index;
      }).map((l, i) => ({
        noteNumber: String(i + 1).padStart(3, '0'),
        lectureId: l.id,
        title: l.title,
        section: l.section,
        sectionIndex: l.sectionIndex,
        lectureIndex: l.index,
        transcriptFile: path.join(
          OUTPUT_DIR,
          `section-${String(l.sectionIndex).padStart(2, '0')}`,
          `${String(l.index).padStart(2, '0')}-${l.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`
        ),
        noteFile: path.join(
          NOTES_DIR,
          `${String(i + 1).padStart(3, '0')}-${l.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.md`
        )
      }))
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`Manifest saved to: ${path.join(OUTPUT_DIR, 'manifest.json')}`);

  } finally {
    await context.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
