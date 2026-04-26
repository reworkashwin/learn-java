#!/usr/bin/env node
/**
 * Retry missing transcripts with extended video playback (60s+) before checking.
 * Plays the video for a full minute to trigger auto-caption generation, then checks.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'java-collections-framework-core-advanced-interview-prep';
const BASE_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(BASE_DIR, 'transcripts', COURSE_SLUG);
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

// The 2 missing lectures
const MISSING_LECTURES = [
  { id: 46747019, title: '3.9 TreeSet', sectionIndex: 3, index: 26 },
  { id: 46747113, title: '7.4 Shifting Reversing and Roatating Operations in Collections', sectionIndex: 7, index: 55 }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playVideo(page) {
  try {
    const playBtn = page.locator('[data-purpose="play-button"], button[aria-label="Play"], button[aria-label="play"]');
    if (await playBtn.first().isVisible({ timeout: 3000 })) {
      await playBtn.first().click();
      return true;
    }
  } catch (e) {}

  try {
    const video = page.locator('video');
    if (await video.first().isVisible({ timeout: 2000 })) {
      await video.first().click();
      return true;
    }
  } catch (e) {}

  try {
    await page.keyboard.press('Space');
    return true;
  } catch (e) {}

  return false;
}

async function isVideoPlaying(page) {
  try {
    return await page.evaluate(() => {
      const video = document.querySelector('video');
      return video && !video.paused && !video.ended && video.currentTime > 0;
    });
  } catch (e) {
    return false;
  }
}

async function openTranscriptPanel(page) {
  try {
    const transcriptBtn = page.getByRole('button', { name: 'Transcript in sidebar region' });
    if (await transcriptBtn.isVisible({ timeout: 3000 })) {
      await transcriptBtn.click();
      await sleep(2000);
      return true;
    }
  } catch (e) {}

  try {
    const transcriptTab = page.getByRole('tab', { name: 'Transcript' });
    if (await transcriptTab.isVisible({ timeout: 2000 })) {
      await transcriptTab.click();
      await sleep(2000);
      return true;
    }
  } catch (e) {}

  try {
    const transcriptEl = page.locator('button:has-text("Transcript"), [role="tab"]:has-text("Transcript"), [data-purpose*="transcript"]');
    if (await transcriptEl.first().isVisible({ timeout: 2000 })) {
      await transcriptEl.first().click();
      await sleep(2000);
      return true;
    }
  } catch (e) {}

  return false;
}

async function extractTranscriptText(page) {
  return await page.evaluate(() => {
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
}

async function getTranscriptWithLongPlay(page, lectureId, title) {
  const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;
  const MAX_ATTEMPTS = 3;

  console.log(`\n  Navigating to lecture ${lectureId}: ${title}`);

  try {
    await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log(`  Navigation timeout, continuing...`);
  }

  await sleep(5000);
  await page.waitForLoadState('networkidle').catch(() => {});

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\n  --- Attempt ${attempt}/${MAX_ATTEMPTS} ---`);

    // Play the video
    console.log(`  Playing video...`);
    await playVideo(page);
    await sleep(2000);

    // Ensure video is actually playing
    let playing = await isVideoPlaying(page);
    if (!playing) {
      console.log(`  Video not playing, trying again...`);
      await playVideo(page);
      await sleep(2000);
      playing = await isVideoPlaying(page);
    }
    console.log(`  Video playing: ${playing}`);

    // Let video play for 60 seconds
    console.log(`  Letting video play for 60 seconds...`);
    for (let i = 0; i < 6; i++) {
      await sleep(10000);
      const currentTime = await page.evaluate(() => {
        const v = document.querySelector('video');
        return v ? v.currentTime.toFixed(1) : 'N/A';
      }).catch(() => 'N/A');
      console.log(`    ${(i + 1) * 10}s elapsed (video at ${currentTime}s)`);
    }

    // Now try to open transcript panel
    console.log(`  Opening transcript panel...`);
    const opened = await openTranscriptPanel(page);
    console.log(`  Transcript panel opened: ${opened}`);

    if (opened) {
      // Wait for transcript content
      try {
        await page.waitForSelector('[class*="transcript--cue-container"]', { timeout: 10000 });
      } catch (e) {
        console.log(`  No transcript cue containers found after waiting`);
      }
      await sleep(3000);

      const transcript = await extractTranscriptText(page);
      if (transcript && transcript.length > 50) {
        console.log(`  ✅ Got transcript! (${transcript.length} chars)`);
        return transcript;
      } else {
        console.log(`  No transcript text extracted`);
      }
    }

    // Check if there's a "no transcript" message
    const noTranscriptMsg = await page.evaluate(() => {
      const el = document.querySelector('[class*="transcript"]');
      if (el && el.textContent.includes('No transcript')) return true;
      if (el && el.textContent.includes('not available')) return true;
      return false;
    }).catch(() => false);

    if (noTranscriptMsg) {
      console.log(`  ⛔ "No transcript" message detected — this lecture has no captions`);
      return null;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(`  Reloading page for next attempt...`);
      try {
        await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (e) {}
      await sleep(5000);
    }
  }

  return null;
}

async function main() {
  console.log('Launching browser...');
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
    // Quick login check
    console.log('Checking login...');
    await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/learn/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(5000);

    // Load existing data
    const data = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));
    let recovered = 0;

    for (const lecture of MISSING_LECTURES) {
      console.log(`\n========================================`);
      console.log(`Processing: S${lecture.sectionIndex}.${lecture.index}: ${lecture.title}`);
      console.log(`========================================`);

      const transcript = await getTranscriptWithLongPlay(page, lecture.id, lecture.title);

      if (transcript && transcript.length > 50) {
        data.lectures[lecture.id].transcript = transcript;
        recovered++;
        console.log(`\n  ✅ RECOVERED: ${lecture.title} (${transcript.length} chars)`);

        // Save immediately
        fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));

        // Also save individual file
        const sectionDir = path.join(OUTPUT_DIR, `section-${String(lecture.sectionIndex).padStart(2, '0')}`);
        fs.mkdirSync(sectionDir, { recursive: true });
        const filename = `${String(lecture.index).padStart(2, '0')}-${lecture.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
        fs.writeFileSync(path.join(sectionDir, filename), transcript);
        console.log(`  Saved to: ${path.join(sectionDir, filename)}`);
      } else {
        console.log(`\n  ❌ FAILED: ${lecture.title} — no transcript available`);
      }
    }

    console.log(`\n========================================`);
    console.log(`RETRY COMPLETE`);
    console.log(`  Recovered: ${recovered}/${MISSING_LECTURES.length}`);
    console.log(`========================================`);

  } finally {
    await context.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
