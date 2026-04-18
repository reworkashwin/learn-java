const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COURSE_SLUG = 'spring-springboot-jpa-hibernate-zero-to-master';
const COURSE_ID = 4364200;
const OUTPUT_DIR = path.join(__dirname, '..', 'transcripts');
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  console.log('Navigating to Udemy course page...');
  await page.goto('https://www.udemy.com/course/' + COURSE_SLUG + '/learn/lecture/54765789');
  await sleep(3000);
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // Check if already logged in
  if (page.url().includes('/learn/lecture/') && !page.url().includes('join')) {
    console.log('Already logged in!');
    return true;
  }

  // If on login page, use passwordless email auth
  console.log('Need to log in. Using email-based auth...');
  
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill('ashwin.madhu1996@gmail.com');
  await sleep(500);
  
  await page.getByRole('button', { name: 'Continue' }).click();
  
  console.log('\n========================================');
  console.log('CHECK YOUR EMAIL for the 6-digit code');  
  console.log('Enter it in the browser window that just opened');
  console.log('========================================\n');
  
  // Wait for the user to enter the code and get redirected to the course
  await page.waitForURL('**/learn/lecture/**', { timeout: 180000 });
  await sleep(2000);
  console.log('Login successful!');
  return true;
}

async function getCurriculum(page) {
  console.log('Fetching course curriculum...');
  let allItems = [];
  let url = `/api-2.0/courses/${COURSE_ID}/subscriber-curriculum-items/?page_size=200&fields[lecture]=id,title,object_index,is_published,sort_order,asset&fields[chapter]=id,title,object_index,sort_order&fields[asset]=asset_type,length`;
  
  while (url) {
    const data = await page.evaluate(async (fetchUrl) => {
      const resp = await fetch(fetchUrl);
      return resp.json();
    }, url);
    
    allItems = allItems.concat(data.results);
    url = data.next || null;
  }
  
  console.log(`Found ${allItems.length} curriculum items total`);
  return allItems;
}

async function getTranscript(page, lectureId) {
  const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;
  
  try {
    await page.goto(lectureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log(`  Navigation timeout for lecture ${lectureId}, continuing...`);
  }
  
  await sleep(3000);
  
  // Click the transcript button to open transcript panel
  try {
    const transcriptBtn = page.getByRole('button', { name: 'Transcript in sidebar region' });
    if (await transcriptBtn.isVisible({ timeout: 5000 })) {
      // Click it regardless - if already open it switches to Transcript tab
      await transcriptBtn.click();
      await sleep(2000);
    }
  } catch (e) {
    // Try clicking the Transcript tab directly if sidebar is already open
    try {
      const transcriptTab = page.getByRole('tab', { name: 'Transcript' });
      if (await transcriptTab.isVisible({ timeout: 2000 })) {
        await transcriptTab.click();
        await sleep(2000);
      }
    } catch (e2) {
      console.log(`  No transcript button/tab found for lecture ${lectureId}`);
      return null;
    }
  }

  // Wait for transcript content to load
  await sleep(2000);

  // Wait for transcript cue containers to appear
  try {
    await page.waitForSelector('[class*="transcript--cue-container"]', { timeout: 5000 });
  } catch (e) {}
  await sleep(1000);
  
  // Extract transcript text from cue containers
  const transcript = await page.evaluate(() => {
    // Primary method: get text from transcript cue containers
    const cues = document.querySelectorAll('[class*="transcript--cue-container"]');
    if (cues.length > 0) {
      const texts = Array.from(cues).map(c => {
        const p = c.querySelector('p') || c;
        return p.textContent.trim();
      }).filter(t => t.length > 0);
      if (texts.length > 0) return texts.join(' ');
    }
    
    // Fallback: get text from underline-cue paragraph tags
    const pTags = document.querySelectorAll('[class*="transcript--underline-cue"]');
    if (pTags.length > 0) {
      const texts = Array.from(pTags).map(p => p.textContent.trim()).filter(t => t.length > 0);
      if (texts.length > 0) return texts.join(' ');
    }
    
    // Fallback 2: any element with "transcript" in class that has text
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

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Use persistent context with real Chrome channel to avoid detection
  console.log('Launching browser (using real Chrome)...');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',  // Use the real Chrome browser installed on the system
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });
  
  const page = context.pages()[0] || await context.newPage();
  
  // Login
  await login(page);
  console.log('Authenticated successfully.\n');
  
  // Get curriculum  
  const curriculum = await getCurriculum(page);
  
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
  
  console.log(`Found ${lectures.length} video lectures across ${sections.length} sections`);
  console.log('Starting transcript extraction...\n');
  
  // Load existing progress
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
    // Skip if already extracted
    if (existingData.lectures && existingData.lectures[lecture.id] && existingData.lectures[lecture.id].transcript) {
      lecture.transcript = existingData.lectures[lecture.id].transcript;
      skipped++;
      console.log(`[SKIP] ${lecture.sectionIndex}.${lecture.index}: ${lecture.title}`);
      continue;
    }
    
    console.log(`[${extracted + skipped + 1}/${lectures.length}] ${lecture.sectionIndex}.${lecture.index}: ${lecture.title}`);
    
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
      courseId: COURSE_ID,
      courseSlug: COURSE_SLUG,
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
  
  console.log(`\n========================================`);
  console.log(`Done! Extracted: ${extracted} | Skipped: ${skipped} | Total: ${lectures.length}`);
  console.log(`Saved to: ${ALL_TRANSCRIPTS_FILE}`);
  console.log(`========================================\n`);
  
  // Save individual files per section
  for (const section of sections) {
    const sectionDir = path.join(OUTPUT_DIR, `section-${String(section.index).padStart(2, '0')}`);
    if (!fs.existsSync(sectionDir)) fs.mkdirSync(sectionDir, { recursive: true });
    
    for (const lecture of section.lectures) {
      if (lecture.transcript) {
        const filename = `${String(lecture.index).padStart(2, '0')}-${lecture.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
        fs.writeFileSync(path.join(sectionDir, filename), lecture.transcript);
      }
    }
  }
  
  console.log('Individual transcript files saved per section.');
  await context.close();
}

main().catch(console.error);
