# 🎓 Udemy Course → Learning Notes AI Agent

A portable, self-contained toolkit that extracts transcripts from any Udemy course and converts them into high-quality, beginner-friendly learning notes using AI.

## How It Works

```
Udemy Course URL
      │
      ▼
┌─────────────────────┐
│  1. EXTRACT          │  Playwright opens Chrome, logs into Udemy,
│     (extract-course) │  scrapes every video transcript automatically
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  2. CONVERT          │  Feed each transcript + the AI prompt to any
│     (AI of choice)   │  AI tool (ChatGPT, Claude, Gemini, etc.)
└─────────┬───────────┘
          │
          ▼
   📁 Beautiful Markdown
      learning notes
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Google Chrome** installed on your machine
- A **Udemy account** with the course purchased/enrolled

### Setup (one time)

```bash
cd udemy-to-notes
npm install
```

### Step 1: Extract Transcripts

```bash
node extract-course.js "https://www.udemy.com/course/YOUR-COURSE-SLUG/"
```

Or with a custom output folder name:

```bash
node extract-course.js "https://www.udemy.com/course/react-the-complete-guide/" "react-notes"
```

**What happens:**
1. Chrome opens automatically
2. Log in to your Udemy account if prompted (first time only — session is saved)
3. The script discovers the course structure via Udemy's API
4. Navigates to each video lecture and extracts the transcript
5. Saves progress after every lecture (safe to interrupt and resume)
6. Retries any failed extractions automatically
7. Outputs everything to `output/<course-slug>/`

**Output structure:**
```
output/<course-slug>/
├── all-transcripts.json          # Master file with all data
├── manifest.json                 # Lecture → transcript → note file mapping
├── section-01/
│   ├── 01-lecture-title.txt      # Individual transcript files
│   ├── 02-another-lecture.txt
│   └── ...
├── section-02/
│   └── ...
└── ...
```

### Step 2: Generate Notes with AI

Use the `manifest.json` + `ai-prompt.md` with your preferred AI tool.

#### Option A: Copy-Paste (Any AI Tool)

1. Open `ai-prompt.md` — this is your system/custom instruction
2. Copy its contents into your AI tool's system prompt or custom instructions
3. For each transcript file, paste the content and ask the AI to convert it

#### Option B: Batch with AI (Claude/ChatGPT with file upload)

1. Upload `ai-prompt.md` as context
2. Upload a transcript `.txt` file
3. Say: *"Convert this transcript into learning notes following the instructions"*
4. Save the output as a `.md` file

#### Option C: VS Code Copilot (Automated)

If using VS Code with GitHub Copilot:
1. Copy this entire folder into your workspace
2. The `udemy-notes` agent is auto-available in the chat agent picker
3. Just paste a Udemy URL and it handles everything end-to-end

#### Option D: API Script (if you have an API key)

```bash
# Set your API key
export ANTHROPIC_API_KEY="sk-..."  # or OPENAI_API_KEY="sk-..."

# Generate all notes automatically
node generate-notes.js output/<course-slug>/

# Generate a specific range only
node generate-notes.js output/<course-slug>/ --start 50 --end 100

# Use a specific provider/model
node generate-notes.js output/<course-slug>/ --provider openai --model gpt-4o
```

Notes are saved to `output/<course-slug>/notes/`.

---

## File Reference

| File | Purpose |
|------|---------|
| `extract-course.js` | Playwright script — extracts transcripts from any Udemy course |
| `generate-notes.js` | Optional API-based batch note generator (needs API key) |
| `ai-prompt.md` | The AI instruction prompt — copy into any AI tool |
| `package.json` | Node.js dependencies |
| `README.md` | This file |

---

## Tips

- **Resume support**: If the script crashes or you close it, just run it again. It picks up where it left off.
- **Chrome profile**: Login session is saved in `chrome-profile/`. Delete it to start fresh.
- **Missing transcripts**: Some lectures (quizzes, coding exercises) don't have transcripts. The script skips them automatically.
- **Rate limiting**: The script has built-in delays to avoid triggering Udemy's rate limits.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not discover course ID" | Make sure you're enrolled in the course |
| Browser doesn't open | Ensure Chrome is installed at the default location |
| Login keeps failing | Delete `chrome-profile/` folder and try again |
| Some transcripts missing | Run the script again — it retries automatically |
| `playwright` not found | Run `npm install` in this folder |
