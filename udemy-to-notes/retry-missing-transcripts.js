#!/usr/bin/env node
/**
 * Retry missing transcripts for a specific course.
 * Usage: node retry-missing.js <course-output-folder>
 * 
 * Reads all-transcripts.json, finds lectures without transcripts,
 * and retries extraction with more aggressive waiting.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node retry-missing.js <course-output-folder>');
  console.error('Example: node retry-missing.js multithreading-course');
  process.exit(1);
}

const FOLDER = args[0];
const OUTPUT_DIR = path.join(__dirname, 'output', FOLDER);
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

if (!fs.existsSync(ALL_TRANSCRIPTS_FILE)) {
  console.error(`File not found: ${ALL_TRANSCRIPTS_FILE}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));
const COURSE_SLUG = data.courseSlug;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(text) {
  return text.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase();
}

async function extractTranscriptText(page) {
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

async function openTranscriptPanel(page) {
  try {
    const btn = page.getByRole('button', { name: 'Transcript in sidebar region' });
    if (await btn.isVisible({ timeout: 5000 })) { await btn.click(); await sleep(2000); return true; }
  } catch (e) {}
  try {
    const tab = page.getByRole('tab', { name: 'Transcript' });
    if (await tab.isVisible({ timeout: 2000 })) { await tab.click(); await sleep(2000); return true; }
  } catch (e) {}
  return false;
}

async function playVideo(page) {
  try {
    const playBtn = page.locator('[data-purpose="play-button"], button[aria-label="Play"], button[aria-label="play"], [class*="play-button"], [class*="control-bar"] button:first-child');
    if (await playBtn.first().isVisible({ timeout: 3000 })) { await playBtn.first().click(); await sleep(1000); return; }
  } catch (e) {}
  try {
    const video = page.locator('video');
    if (await video.isVisible({ timeout: 2000 })) { await video.click(); await sleep(1000); return; }
  } catch (e) {}
  try { await page.keyboard.press('Space'); await sleep(1000); } catch (e) {}
}

async function getTranscriptAggressive(page, lectureId) {
  const url = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;
  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) {}
  await sleep(4000);

  // Play video
  await playVideo(page);
  await sleep(3000);

  // Open transcript
  await openTranscriptPanel(page);
  await sleep(3000);

  // MORE aggressive polling: 20 attempts, 5 sec each = 100 seconds max
  for (let attempt = 1; attempt <= 20; attempt++) {
    try { await page.waitForSelector('[class*="transcript--cue-container"]', { timeout: 5000 }); } catch (e) {}
    let transcript = await extractTranscriptText(page);
    if (transcript && transcript.length > 50) return transcript;

    if (attempt % 3 === 0) {
      await playVideo(page);
      await sleep(2000);
      await openTranscriptPanel(page);
    }
    await sleep(3000 + Math.random() * 2000);
  }

  return await extractTranscriptText(page);
}

async function main() {
  // Find missing
  const lectures = data.lectures;
  const missing = [];
  for (const [lid, lec] of Object.entries(lectures)) {
    if (!lec.transcript || !lec.transcript.trim()) {
      missing.push({ id: lid, ...lec });
    }
  }

  if (missing.length === 0) {
    console.log('All lectures already have transcripts!');
    process.exit(0);
  }

  // Sort by index
  missing.sort((a, b) => (a.index || 0) - (b.index || 0));

  console.log(`\nCourse: ${COURSE_SLUG}`);
  console.log(`Missing transcripts: ${missing.length}\n`);
  for (const m of missing) {
    console.log(`  [${m.index}] ${m.title}`);
  }
  console.log('');

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check']
  });

  const page = context.pages()[0] || await context.newPage();

  // Quick login check
  await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/`, { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  const loggedIn = await page.evaluate(() => {
    return document.cookie.includes('access_token') ||
      !!document.querySelector('[data-purpose="user-dropdown"]') ||
      !!document.querySelector('[class*="logged-in"]');
  });

  if (!loggedIn) {
    console.log('Login required — please log in on the browser window...');
    try {
      await page.goto('https://www.udemy.com/join/login-popup/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (e) {
      // Redirect is fine — may already be logged in
    }
    await page.waitForURL(url => !url.toString().includes('/join/') && !url.toString().includes('/login'), { timeout: 300000 });
    await sleep(2000);
    console.log('Login successful\n');
  }

  let recovered = 0;
  const pass1Missing = [];

  // Pass 1
  console.log(`--- Pass 1 of 3 ---\n`);
  for (let i = 0; i < missing.length; i++) {
    const lec = missing[i];
    process.stdout.write(`  [${i + 1}/${missing.length}] ${lec.title.substring(0, 55).padEnd(55)}...`);
    const transcript = await getTranscriptAggressive(page, lec.id);
    if (transcript && transcript.length > 50) {
      data.lectures[lec.id].transcript = transcript;
      recovered++;
      console.log(` ✅ ${transcript.length} chars`);
    } else {
      pass1Missing.push(lec);
      console.log(` ⚠️  miss`);
    }
    fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));
  }

  // Pass 2 — retry remaining
  if (pass1Missing.length > 0) {
    console.log(`\n--- Pass 2 of 3 (${pass1Missing.length} remaining) ---\n`);
    const pass2Missing = [];
    for (let i = 0; i < pass1Missing.length; i++) {
      const lec = pass1Missing[i];
      process.stdout.write(`  [${i + 1}/${pass1Missing.length}] ${lec.title.substring(0, 55).padEnd(55)}...`);
      const transcript = await getTranscriptAggressive(page, lec.id);
      if (transcript && transcript.length > 50) {
        data.lectures[lec.id].transcript = transcript;
        recovered++;
        console.log(` ✅ ${transcript.length} chars`);
      } else {
        pass2Missing.push(lec);
        console.log(` ⚠️  miss`);
      }
      fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));
    }

    // Pass 3
    if (pass2Missing.length > 0) {
      console.log(`\n--- Pass 3 of 3 (${pass2Missing.length} remaining) ---\n`);
      for (let i = 0; i < pass2Missing.length; i++) {
        const lec = pass2Missing[i];
        process.stdout.write(`  [${i + 1}/${pass2Missing.length}] ${lec.title.substring(0, 55).padEnd(55)}...`);
        const transcript = await getTranscriptAggressive(page, lec.id);
        if (transcript && transcript.length > 50) {
          data.lectures[lec.id].transcript = transcript;
          recovered++;
          console.log(` ✅ ${transcript.length} chars`);
        } else {
          console.log(` ❌ failed`);
        }
        fs.writeFileSync(ALL_TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));
      }
    }
  }

  // Update section .txt files for recovered ones
  const sections = data.sections || [];
  for (const [lid, lec] of Object.entries(data.lectures)) {
    if (lec.transcript) {
      const secIdx = lec.sectionIndex || 0;
      const sDir = path.join(OUTPUT_DIR, `section-${String(secIdx).padStart(2, '0')}`);
      fs.mkdirSync(sDir, { recursive: true });
      const fname = `${String(lec.index).padStart(2, '0')}-${slugify(lec.title)}.txt`;
      fs.writeFileSync(path.join(sDir, fname), lec.transcript);
    }
  }

  // Update manifest
  const allLectures = Object.values(data.lectures);
  const withT = allLectures.filter(l => l.transcript);
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.totalWithTranscripts = withT.length;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  const stillMissing = allLectures.filter(l => !l.transcript || !l.transcript.trim());

  console.log('\n══════════════════════════════════════════');
  console.log(`  Recovered: ${recovered}`);
  console.log(`  Still missing: ${stillMissing.length}`);
  console.log('══════════════════════════════════════════');
  if (stillMissing.length > 0) {
    for (const m of stillMissing) {
      console.log(`    [${m.index}] ${m.title}`);
    }
  }

  await context.close();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
