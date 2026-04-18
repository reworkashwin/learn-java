const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'spring-springboot-jpa-hibernate-zero-to-master';
const COURSE_ID = 4364200;
const OUTPUT_DIR = path.join(__dirname, '..', 'transcripts');
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

const MISSING_LECTURE_IDS = [
  54558083,  // S2.17: Bean Creation the Easy Way - @Component
  54558169,  // S2.20: Meet Spring's Stereotypes
  54573553,  // S3.44: Mastering @RequestMapping
  54665113,  // S8.95: Spring JPA Auditing Part 2
  54665121,  // S8.96: SpringDoc OpenAPI & Swagger
  54707561,  // S13.144: Demo of Logging Part 1
  54764787,  // S16.169: Customizing Security Errors
  54753667,  // S17.175: @Transactional Demystified
  54753177,  // S18.191: Caffeine Cache
  54753183,  // S18.192: Job Management APIs Part 1
  54751571,  // S21.217: Actuator Beans, Config & Environment
  54751609,  // S21.223: Making Spring Boot Observable
  54745535,  // S22.231: HTTP Service Groups
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTranscriptWithRetry(page, lectureId, title, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`  Attempt ${attempt}/${maxRetries}...`);

    const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;

    try {
      await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
      console.log(`  Navigation timeout, retrying...`);
    }

    // Wait longer for the page to fully load
    await sleep(5000);

    // Try multiple ways to open the transcript panel
    // Method 1: Click the transcript sidebar button
    try {
      const transcriptBtn = page.getByRole('button', { name: 'Transcript in sidebar region' });
      if (await transcriptBtn.isVisible({ timeout: 5000 })) {
        await transcriptBtn.click();
        await sleep(3000);
      }
    } catch (e) {}

    // Method 2: Try the transcript tab if sidebar is already open
    try {
      const transcriptTab = page.getByRole('tab', { name: 'Transcript' });
      if (await transcriptTab.isVisible({ timeout: 3000 })) {
        await transcriptTab.click();
        await sleep(3000);
      }
    } catch (e) {}

    // Method 3: Try clicking any element that says "Transcript"
    try {
      const anyTranscript = page.locator('button:has-text("Transcript"), [role="tab"]:has-text("Transcript")').first();
      if (await anyTranscript.isVisible({ timeout: 3000 })) {
        await anyTranscript.click();
        await sleep(3000);
      }
    } catch (e) {}

    // Wait extra time for transcript to load
    await sleep(3000);

    // Try to wait for transcript content
    try {
      await page.waitForSelector('[class*="transcript--cue-container"]', { timeout: 8000 });
    } catch (e) {}

    await sleep(2000);

    // Extract transcript
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

      // Try broader search
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

    if (transcript && transcript.length > 50) {
      return transcript;
    }

    // Check if there's a "No transcript" message
    const noTranscript = await page.evaluate(() => {
      const el = document.querySelector('[class*="transcript"]');
      if (el && el.textContent.includes('No transcript')) return true;
      return false;
    });

    if (noTranscript) {
      console.log(`  Confirmed: No transcript exists for this lecture on Udemy`);
      return null;
    }

    if (attempt < maxRetries) {
      console.log(`  No transcript found, waiting before retry...`);
      await sleep(3000);
    }
  }

  return null;
}

async function main() {
  // Load existing data
  const data = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));

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

  // Navigate to course to ensure we're logged in
  console.log('Checking login...');
  await page.goto('https://www.udemy.com/course/' + COURSE_SLUG + '/learn/lecture/54765789');
  await sleep(3000);
  await page.waitForLoadState('networkidle').catch(() => {});

  if (page.url().includes('/learn/lecture/')) {
    console.log('Already logged in!\n');
  } else {
    console.log('ERROR: Not logged in. Please log in manually in the browser window.');
    await sleep(60000);
  }

  let recovered = 0;
  let stillMissing = 0;

  for (let i = 0; i < MISSING_LECTURE_IDS.length; i++) {
    const lectureId = MISSING_LECTURE_IDS[i];
    const lecture = data.lectures[lectureId];

    if (!lecture) {
      console.log(`[${i + 1}/${MISSING_LECTURE_IDS.length}] Lecture ID ${lectureId} not found in data, skipping`);
      continue;
    }

    console.log(`\n[${i + 1}/${MISSING_LECTURE_IDS.length}] S${lecture.sectionIndex}.${lecture.index}: ${lecture.title}`);

    const transcript = await getTranscriptWithRetry(page, lectureId, lecture.title);

    if (transcript && transcript.length > 50) {
      data.lectures[lectureId].transcript = transcript;
      recovered++;
      console.log(`  ✅ RECOVERED transcript (${transcript.length} chars)`);

      // Save individual file
      const sectionDir = path.join(OUTPUT_DIR, `section-${String(lecture.sectionIndex).padStart(2, '0')}`);
      if (!fs.existsSync(sectionDir)) fs.mkdirSync(sectionDir, { recursive: true });
      const filename = `${String(lecture.index).padStart(2, '0')}-${lecture.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
      fs.writeFileSync(path.join(sectionDir, filename), transcript);
    } else {
      stillMissing++;
      console.log(`  ❌ Still no transcript available`);
    }

    // Save progress after each lecture
    fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));
  }

  console.log(`\n========================================`);
  console.log(`Done! Recovered: ${recovered} | Still missing: ${stillMissing}`);
  console.log(`Total with transcripts: ${Object.values(data.lectures).filter(l => l.transcript).length}`);
  console.log(`========================================`);

  await context.close();
}

main().catch(console.error);
