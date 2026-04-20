# Creating React Projects

## Introduction

You know what React is and why it's useful. Now it's time to learn how to actually set up a React project so you can start writing code. There are two main approaches: browser-based and local.

---

## Option 1: Browser-Based (CodeSandbox)

The quickest way to start writing React code:

1. Type **`react.new`** in your browser URL bar
2. Hit Enter
3. A brand new React project opens in CodeSandbox

**What is CodeSandbox?**
An in-browser development environment where you can write code, edit files, and see a live preview — all without installing anything on your machine.

**When to use it:**
- You want to get started immediately
- You can't install software on your computer (e.g., company-issued machine)
- You're doing quick experiments or exercises

---

## Option 2: Local Project

For a more professional setup:

### Step 1: Install Node.js

Download from [nodejs.org](https://nodejs.org) — either the Latest or LTS version.

Why Node.js? Even though this isn't a Node.js course and you won't write Node.js code, the tools used to create React projects (like Vite) run on Node.js under the hood.

### Step 2: Create the Project

Using **Vite** (the most popular tool):

```bash
npm create vite@latest
```

This will prompt you with questions. Choose React when asked. An alternative is **Create React App**, though Vite is the modern standard.

### Step 3: Install Dependencies

```bash
cd your-project-name
npm install
```

This installs all the packages your project needs (including the React library itself).

### Step 4: Start the Development Server

```bash
npm run dev
```

This starts a local development server that:
- Serves your website at a local URL (e.g., `http://localhost:5173`)
- **Watches your files** — any changes you save are instantly reflected in the browser
- Should be kept running while you work

When you're done for the day, stop the server. When you're ready to work again, just run `npm run dev` again.

### Recommended Code Editor: Visual Studio Code

- Free and available on all major operating systems
- Highly customizable with extensions
- The most popular editor for React development

---

## CodeSandbox vs Local: Quick Comparison

| Feature | CodeSandbox | Local Project |
|---|---|---|
| Setup time | Instant | Minutes |
| Installation required | None | Node.js + editor |
| Customization | Limited | Full control |
| Performance | Depends on internet | Depends on your machine |
| Offline support | No | Yes |

---

## ✅ Key Takeaways

- **`react.new`** in the browser gives you an instant React project via CodeSandbox
- For local development, install **Node.js** first, then use **Vite** to create projects
- Always run `npm install` after creating or downloading a local project
- Run `npm run dev` to start the development server (keep it running while you work)
- Both approaches are supported throughout the course — use whichever you prefer

---

## ⚠️ Common Mistake

Forgetting to run `npm install` before `npm run dev` in a freshly created or downloaded local project. Without installing dependencies, the project won't have React and will fail to start.

---

## 💡 Pro Tip

If you're using CodeSandbox, you don't need to run any terminal commands — everything is already set up and the preview updates automatically. But for serious development, learning to work with a local project is essential.
