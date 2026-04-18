const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'spring-springboot-jpa-hibernate-zero-to-master';
const OUTPUT_DIR = path.join(__dirname, '..', 'transcripts');
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

const LECTURE_ID = 54753177; // S18.191: Caffeine Cache

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const data = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));

  console.log('Launching browser...');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages()[0] || await context.newPage();
  const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${LECTURE_ID}`;

  console.log('Navigating to lecture...');
  await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(8000);

  // Try clicking transcript button multiple ways
  const attempts = [
    async () => {
      const btn = page.getByRole('button', { name: 'Transcript in sidebar region' });
      if (await btn.isVisible({ timeout: 3000 })) { await btn.click(); return true; }
    },
    async () => {
      const tab = page.getByRole('tab', { name: 'Transcript' });
      if (await tab.isVisible({ timeout: 3000 })) { await tab.click(); return true; }
    },
    async () => {
      const btn = page.locator('button:has-text("Transcript")').first();
      if (await btn.isVisible({ timeout: 3000 })) { await btn.click(); return true; }
    },
    async () => {
      // Try keyboard shortcut or search panel
      const searchBtn = page.locator('[data-purpose="transcript-toggle"]');
      if (await searchBtn.isVisible({ timeout: 3000 })) { await searchBtn.click(); return true; }
    }
  ];

  for (const attempt of attempts) {
    try { await attempt(); } catch (e) {}
    await sleep(2000);
  }

  await sleep(5000);

  // Dump what we see for debugging
  const debug = await page.evaluate(() => {
    const all = document.querySelectorAll('[class*="transcript"]');
    return Array.from(all).map(el => ({
      tag: el.tagName,
      class: el.className,
      textLen: el.textContent.length,
      text: el.textContent.slice(0, 100)
    }));
  });
  console.log('Transcript elements found:', JSON.stringify(debug, null, 2));

  // Try extracting
  const transcript = await page.evaluate(() => {
    const cues = document.querySelectorAll('[class*="transcript--cue-container"]');
    if (cues.length > 0) {
      return Array.from(cues).map(c => (c.querySelector('p') || c).textContent.trim()).filter(t => t).join(' ');
    }
    const pTags = document.querySelectorAll('[class*="transcript--underline-cue"]');
    if (pTags.length > 0) {
      return Array.from(pTags).map(p => p.textContent.trim()).filter(t => t).join(' ');
    }
    return null;
  });

  if (transcript && transcript.length > 50) {
    console.log(`✅ RECOVERED! (${transcript.length} chars)`);
    data.lectures[LECTURE_ID].transcript = transcript;
    fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));

    const lecture = data.lectures[LECTURE_ID];
    const sectionDir = path.join(OUTPUT_DIR, `section-${String(lecture.sectionIndex).padStart(2, '0')}`);
    if (!fs.existsSync(sectionDir)) fs.mkdirSync(sectionDir, { recursive: true });
    const filename = `${String(lecture.index).padStart(2, '0')}-${lecture.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
    fs.writeFileSync(path.join(sectionDir, filename), transcript);
  } else {
    console.log('❌ No transcript exists for this lecture. It likely has no captions on Udemy.');
  }

  await context.close();
}

main().catch(console.error);
