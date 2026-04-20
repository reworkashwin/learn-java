# Setting Up The Starting Project

## Introduction

Now that we understand the philosophy behind components, it's time to get our hands dirty with actual code. This lecture walks you through setting up the starting project for the demo application we'll build throughout the React Essentials section. Whether you prefer coding in the browser (CodeSandbox) or locally on your machine, here's everything you need to know.

---

## Two Options for Following Along

### Option 1: CodeSandbox (Browser-Based)

- Open the CodeSandbox link provided with the lecture
- Everything runs in the browser — no setup needed
- Dependencies are installed and the dev server starts automatically
- Great for quick access and no-install convenience

### Option 2: Local Development (Recommended for Real-World Experience)

- Download the attached zip file
- Extract it to a folder on your machine
- Open in your code editor (e.g., Visual Studio Code)

---

## Local Setup Steps

### Step 1: Install Dependencies

Open your terminal, navigate to the extracted project folder, and run:

```bash
npm install
```

This downloads all the third-party packages the project needs:
- **React libraries** — the core React framework
- **Build tools** — the development server and code transformation tools

You only need to run `npm install` **once** when you first set up the project.

### Step 2: Start the Development Server

```bash
npm run dev
```

This starts a local development server that:
- Serves your React app at a local URL (shown in the terminal output, typically `http://localhost:5173`)
- **Watches your code** for changes and automatically reloads the browser
- Transforms your React code (JSX) into browser-compatible JavaScript

### Step 3: View Your App

Open the URL displayed in the terminal output in your browser. You should see the starting project — the same demo app visible in the CodeSandbox environment.

---

## Daily Workflow

| Action | Command |
|--------|---------|
| First-time setup | `npm install` (once) |
| Start coding | `npm run dev` |
| Stop for the day | `Ctrl + C` in the terminal |
| Resume next time | `npm run dev` again |

---

## Why Do We Need a Build Process?

React code uses **JSX** — that HTML-like syntax inside JavaScript that we'll learn about. Browsers don't understand JSX natively. The development server runs a build process that:

1. Watches your source files for changes
2. Transforms JSX into regular JavaScript the browser can run
3. Serves the transformed code to the browser
4. Automatically reloads the page when you make changes

This all happens behind the scenes — you write React/JSX code, and the build tool handles the rest.

---

## ✅ Key Takeaways

- You can follow along using CodeSandbox (browser) or a local setup
- Local setup: `npm install` (once) → `npm run dev` (every time you code)
- The dev server watches for changes and automatically reloads
- A build process transforms JSX into browser-compatible JavaScript
- Keep the dev server running while you're working on the project

## ⚠️ Common Mistakes

- Forgetting to run `npm install` before `npm run dev` — you'll get errors about missing packages
- Closing the terminal running the dev server and wondering why changes aren't reflected
- Not navigating to the correct project folder before running commands

## 💡 Pro Tips

- Use VS Code's integrated terminal so you don't have to switch between windows
- If the dev server seems stuck or behaves oddly, stop it (`Ctrl + C`) and restart with `npm run dev`
- Bookmark the local URL — you'll visit it hundreds of times throughout this course
