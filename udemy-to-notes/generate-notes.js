#!/usr/bin/env node
/**
 * Automated Note Generator — calls OpenAI or Anthropic API to convert transcripts → notes.
 *
 * Usage:
 *   node generate-notes.js <output-folder> [--provider openai|anthropic] [--model <model>] [--start <n>] [--end <n>]
 *
 * Environment variables:
 *   OPENAI_API_KEY     — required if using openai provider
 *   ANTHROPIC_API_KEY  — required if using anthropic provider
 *
 * Examples:
 *   OPENAI_API_KEY=sk-... node generate-notes.js output/my-course
 *   ANTHROPIC_API_KEY=sk-... node generate-notes.js output/my-course --provider anthropic
 *   node generate-notes.js output/my-course --start 50 --end 100
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Parse arguments ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node generate-notes.js <output-folder> [--provider openai|anthropic] [--model <model>] [--start <n>] [--end <n>]');
  process.exit(1);
}

const outputDir = path.resolve(args[0]);
const manifestPath = path.join(outputDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`manifest.json not found in ${outputDir}. Run extract-course.js first.`);
  process.exit(1);
}

function getFlag(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const provider = getFlag('provider', process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai');
const startAt = parseInt(getFlag('start', '1'));
const endAt = parseInt(getFlag('end', '99999'));

let model;
if (provider === 'anthropic') {
  model = getFlag('model', 'claude-sonnet-4-20250514');
} else {
  model = getFlag('model', 'gpt-4o');
}

const apiKey = provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(`Set ${provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'} environment variable.`);
  process.exit(1);
}

// ─── Load prompt & manifest ─────────────────────────────────────────────────
const systemPrompt = fs.readFileSync(path.join(__dirname, 'ai-prompt.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const notesDir = path.join(outputDir, 'notes');
fs.mkdirSync(notesDir, { recursive: true });

console.log('╔══════════════════════════════════════════╗');
console.log('║   Note Generator                         ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`  Provider: ${provider} (${model})`);
console.log(`  Course:   ${manifest.courseSlug}`);
console.log(`  Range:    ${startAt} - ${Math.min(endAt, manifest.lectures.length)}`);
console.log(`  Output:   ${notesDir}`);
console.log('');

// ─── API Calls ───────────────────────────────────────────────────────────────
function httpPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(text)); } catch (e) { reject(new Error(`Parse error: ${text.substring(0, 500)}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function callOpenAI(transcript, title) {
  const resp = await httpPost('api.openai.com', '/v1/chat/completions', {
    'Authorization': `Bearer ${apiKey}`
  }, {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Convert this transcript into learning notes.\n\nLecture title: "${title}"\n\nTranscript:\n${transcript}` }
    ],
    max_tokens: 4096,
    temperature: 0.7
  });

  if (resp.error) throw new Error(resp.error.message);
  return resp.choices[0].message.content;
}

async function callAnthropic(transcript, title) {
  const resp = await httpPost('api.anthropic.com', '/v1/messages', {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }, {
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: `Convert this transcript into learning notes.\n\nLecture title: "${title}"\n\nTranscript:\n${transcript}` }
    ]
  });

  if (resp.error) throw new Error(resp.error.message || JSON.stringify(resp.error));
  return resp.content[0].text;
}

async function generateNote(transcript, title) {
  if (provider === 'anthropic') return callAnthropic(transcript, title);
  return callOpenAI(transcript, title);
}

// ─── Main ────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const lectures = manifest.lectures.filter((_, i) => {
    const num = i + 1;
    return num >= startAt && num <= endAt;
  });

  let done = 0, skipped = 0, failed = 0;

  for (const lecture of lectures) {
    const noteFile = path.join(notesDir, lecture.noteFile);

    if (fs.existsSync(noteFile)) {
      skipped++;
      continue;
    }

    const transcriptFile = path.join(outputDir, lecture.transcriptFile);
    if (!fs.existsSync(transcriptFile)) {
      console.log(`  ⚠️  [${lecture.noteNumber}] No transcript: ${lecture.title}`);
      failed++;
      continue;
    }

    const transcript = fs.readFileSync(transcriptFile, 'utf8');
    if (transcript.length < 50) {
      console.log(`  ⚠️  [${lecture.noteNumber}] Transcript too short: ${lecture.title}`);
      failed++;
      continue;
    }

    process.stdout.write(`  [${lecture.noteNumber}/${manifest.totalWithTranscripts}] ${lecture.title.substring(0, 55)}...`);

    try {
      const note = await generateNote(transcript, lecture.title);
      fs.writeFileSync(noteFile, note);
      done++;
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌ ${err.message.substring(0, 80)}`);
      failed++;
    }

    // Rate limiting — be conservative
    const delay = provider === 'anthropic' ? 1500 : 1000;
    await sleep(delay);
  }

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log(`║  Generated: ${String(done).padStart(4)}                        ║`);
  console.log(`║  Skipped:   ${String(skipped).padStart(4)} (already exist)      ║`);
  console.log(`║  Failed:    ${String(failed).padStart(4)}                        ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nNotes saved to: ${notesDir}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
