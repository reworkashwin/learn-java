const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'spring-springboot-jpa-hibernate-zero-to-master';
const COURSE_ID = 4364200;
const OUTPUT_DIR = path.join(__dirname, '..', 'transcripts');
const ALL_TRANSCRIPTS_FILE = path.join(OUTPUT_DIR, 'all-transcripts.json');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  console.log('Navigating to Udemy login...');
  await page.goto('https://www.udemy.com/join/passwordless-auth/?next=/course/' + COURSE_SLUG + '/learn/lecture/54765789&action=login');
  await page.waitForLoadState('networkidle');
  
  // Check if already logged in
  if (page.url().includes('/learn/lecture/')) {
    console.log('Already logged in!');
    return true;
  }

  // Fill email
  const emailInput = page.locator('input[name="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('ashwin.madhu1996@gmail.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    console.log('\n========================================');
    console.log('CHECK YOUR EMAIL for the 6-digit code');
    console.log('Enter it in the browser window');
    console.log('========================================\n');
    
    // Wait for the user to enter the code and get redirected to the course
    await page.waitForURL('**/learn/lecture/**', { timeout: 120000 });
    console.log('Login successful!');
    return true;
  }
  
  return false;
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
  // Navigate to the lecture
  const lectureUrl = `https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/${lectureId}`;
  
  try {
    await page.goto(lectureUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`  Navigation timeout for lecture ${lectureId}, continuing...`);
  }
  
  await sleep(2000);
  
  // Click the transcript button
  try {
    const transcriptBtn = page.getByRole('button', { name: 'Transcript in sidebar region' });
    if (await transcriptBtn.isVisible({ timeout: 5000 })) {
      await transcriptBtn.click();
      await sleep(2000);
    }
  } catch (e) {
    console.log(`  No transcript button found for lecture ${lectureId}`);
    return null;
  }
  
  // Extract transcript text from the sidebar
  const transcript = await page.evaluate(() => {
    // The transcript panel contains buttons with text
    const panel = document.querySelector('[data-purpose="transcript-panel"]') || 
                  document.querySelector('[class*="transcript"]');
    
    if (panel) {
      const buttons = panel.querySelectorAll('button');
      if (buttons.length > 0) {
        return Array.from(buttons).map(b => b.textContent.trim()).filter(t => t.length > 0).join(' ');
      }
    }
    
    // Fallback: look for transcript tab panel content
    const tabPanel = document.querySelector('[role="tabpanel"][aria-labelledby*="transcript"], [role="tabpanel"]');
    if (tabPanel) {
      const spans = tabPanel.querySelectorAll('span, p, button');
      const texts = Array.from(spans).map(s => s.textContent.trim()).filter(t => t.length > 5);
      if (texts.length > 0) return texts.join(' ');
    }
    
    // Fallback 2: look for any visible transcript content
    const allBtns = document.querySelectorAll('[class*="transcript"] button, [class*="cue"] button, [class*="cue"] span');
    if (allBtns.length > 0) {
      return Array.from(allBtns).map(b => b.textContent.trim()).filter(t => t.length > 0).join(' ');
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

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1280,800']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: fs.existsSync(path.join(__dirname, 'auth.json')) ? path.join(__dirname, 'auth.json') : undefined
  });
  
  const page = await context.newPage();
  
  // Login
  await login(page);
  
  // Save auth state for future runs
  await context.storageState({ path: path.join(__dirname, 'auth.json') });
  console.log('Auth state saved.');
  
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
  
  console.log(`\nFound ${lectures.length} video lectures across ${sections.length} sections`);
  console.log('Starting transcript extraction...\n');
  
  // Load existing progress if any
  let existingData = {};
  if (fs.existsSync(ALL_TRANSCRIPTS_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(ALL_TRANSCRIPTS_FILE, 'utf8'));
      const existingCount = Object.values(existingData.lectures || {}).filter(l => l.transcript).length;
      console.log(`Found existing progress: ${existingCount} transcripts already extracted`);
    } catch (e) {}
  }
  
  // Extract transcripts
  let extracted = 0;
  let skipped = 0;
  
  for (const lecture of lectures) {
    // Skip if already extracted
    if (existingData.lectures && existingData.lectures[lecture.id] && existingData.lectures[lecture.id].transcript) {
      lecture.transcript = existingData.lectures[lecture.id].transcript;
      skipped++;
      console.log(`[SKIP] Section ${lecture.sectionIndex}, Lecture ${lecture.index}: ${lecture.title}`);
      continue;
    }
    
    console.log(`[${extracted + skipped + 1}/${lectures.length}] Section ${lecture.sectionIndex}, Lecture ${lecture.index}: ${lecture.title}`);
    
    const transcript = await getTranscript(page, lecture.id);
    
    if (transcript) {
      lecture.transcript = transcript;
      extracted++;
      console.log(`  ✅ Transcript extracted (${transcript.length} chars)`);
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
  console.log(`Extraction complete!`);
  console.log(`Extracted: ${extracted} | Skipped (already done): ${skipped} | Total lectures: ${lectures.length}`);
  console.log(`Saved to: ${ALL_TRANSCRIPTS_FILE}`);
  console.log(`========================================\n`);
  
  // Also save individual transcript files per section
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
  
  await browser.close();
}

main().catch(console.error);
