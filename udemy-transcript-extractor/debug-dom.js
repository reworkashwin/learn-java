const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'spring-springboot-jpa-hibernate-zero-to-master';
const USER_DATA_DIR = path.join(__dirname, 'chrome-profile');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages()[0] || await context.newPage();

  // Navigate to a lecture
  console.log('Navigating to lecture...');
  await page.goto(`https://www.udemy.com/course/${COURSE_SLUG}/learn/lecture/54765789`);
  await sleep(4000);

  // Click Transcript button
  console.log('Opening transcript...');
  try {
    const transcriptBtn = page.getByRole('button', { name: 'Transcript in sidebar region' });
    await transcriptBtn.click();
    await sleep(3000);
  } catch (e) {
    console.log('Could not find transcript button:', e.message);
  }

  // Dump the DOM structure of all tabpanels
  const debugInfo = await page.evaluate(() => {
    const result = {};
    
    // Check all tab roles
    const tabs = document.querySelectorAll('[role="tab"]');
    result.tabs = Array.from(tabs).map(t => ({
      text: t.textContent.trim(),
      selected: t.getAttribute('aria-selected'),
      controls: t.getAttribute('aria-controls'),
      id: t.id
    }));

    // Check all tabpanels
    const panels = document.querySelectorAll('[role="tabpanel"]');
    result.panels = Array.from(panels).map((p, i) => {
      const buttons = p.querySelectorAll('button');
      const btnTexts = Array.from(buttons).slice(0, 5).map(b => b.textContent.trim());
      return {
        index: i,
        id: p.id,
        labelledBy: p.getAttribute('aria-labelledby'),
        inDialog: !!p.closest('[role="dialog"]'),
        childCount: p.children.length,
        buttonCount: buttons.length,
        sampleButtons: btnTexts,
        classList: p.className.substring(0, 200),
        parentClass: p.parentElement ? p.parentElement.className.substring(0, 200) : null
      };
    });

    // Check dialogs
    const dialogs = document.querySelectorAll('[role="dialog"]');
    result.dialogs = Array.from(dialogs).map(d => ({
      label: d.getAttribute('aria-label'),
      classList: d.className.substring(0, 200),
      childTabs: Array.from(d.querySelectorAll('[role="tab"]')).map(t => t.textContent.trim()),
      childPanels: d.querySelectorAll('[role="tabpanel"]').length
    }));

    // Look for data-purpose attributes related to transcript
    const purposeEls = document.querySelectorAll('[data-purpose]');
    result.dataPurpose = Array.from(purposeEls).map(e => e.getAttribute('data-purpose')).filter(p => p.includes('transcript') || p.includes('cue'));

    // Try to find transcript container by class name
    const transcriptEls = document.querySelectorAll('[class*="transcript"]');
    result.transcriptClasses = Array.from(transcriptEls).map(e => ({
      tag: e.tagName,
      class: e.className.substring(0, 200),
      childButtons: e.querySelectorAll('button').length,
      textLength: e.textContent.length
    }));

    return result;
  });

  console.log('\n=== DEBUG INFO ===');
  console.log(JSON.stringify(debugInfo, null, 2));

  await context.close();
}

main().catch(console.error);
