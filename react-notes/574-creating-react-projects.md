# Creating React Projects

## Introduction

Now that we understand *why* React projects need a special setup, let's actually create one. There are two popular tools for bootstrapping React projects, and you'll need one prerequisite installed on your system before you can use either of them. Let's walk through the whole process.

---

## Concept 1: Tools for Creating React Projects

### 🧠 What is it?

Two popular tools exist for creating React projects:

1. **Create React App (CRA)** — The original, long-established tool from the React team
2. **Vite** — A newer, faster alternative that's become the preferred choice for many developers

Both tools generate a project with all the necessary build tools, dev server, and configuration already set up for you.

### ❓ Why do we need it?

Setting up a build pipeline from scratch — configuring Babel, Webpack, dev servers, hot module replacement — is complex and tedious. These tools do it all for you with a single command. You get a ready-to-use project in seconds.

### ⚙️ How it works

Before using either tool, you need **Node.js** installed on your system:
- You don't need to *know* Node.js or write Node.js code
- Node.js is used **under the hood** by the project tools for building and serving your app
- Download the latest version or the LTS (Long-Term Support) version from the Node.js website

Once Node.js is installed, create a project with one command:

```bash
# Using Create React App
npx create-react-app my-project-name

# Using Vite
npm create vite@latest
```

### 🧪 Example

Here's the Vite workflow step by step:

1. Run `npm create vite@latest`
2. Choose a project name (e.g., `react-crash-course`)
3. Select the **React** template
4. Choose **JavaScript**
5. Navigate into the project folder: `cd react-crash-course`
6. Install dependencies: `npm install`
7. Start the dev server: `npm run dev`
8. Visit the URL shown in the terminal (e.g., `http://localhost:5173`)

### 💡 Insight

Vite is significantly faster than Create React App for both project creation and development. It uses a different bundling approach that makes hot-reloading nearly instant. If you're starting fresh, Vite is the recommended choice.

---

## Concept 2: Running Your React Project

### 🧠 What is it?

Once your project is created, you start a **development server** that watches your code, transforms it, and serves it in the browser with automatic reloading.

### ❓ Why do we need it?

The dev server is what makes the development experience smooth. Every time you save a file, the browser automatically updates to reflect your changes — no manual refreshing needed.

### ⚙️ How it works

| Tool | Install Dependencies | Start Dev Server |
|------|---------------------|-----------------|
| Create React App | Automatic during creation | `npm start` |
| Vite | `npm install` (manual step) | `npm run dev` |

The terminal will output a local URL where your app is running. Open that URL in your browser to see your React app live.

---

## ✅ Key Takeaways

- **Create React App** and **Vite** are the two main tools for bootstrapping React projects
- **Node.js** must be installed on your system (you don't need to know Node.js)
- Vite requires a manual `npm install` step after project creation
- Start the dev server with `npm start` (CRA) or `npm run dev` (Vite)
- The dev server provides auto-reloading — changes appear instantly in the browser

## ⚠️ Common Mistakes

- Forgetting to run `npm install` after creating a Vite project — your app won't start
- Not having Node.js installed — both tools depend on it
- Closing the terminal running the dev server — your app will stop being served

## 💡 Pro Tips

- Use VS Code's built-in terminal to run your dev server — it's already navigated to your project folder
- Keep the dev server running at all times while developing — it auto-reloads on save
- Vite is the modern choice and generally preferred for new projects
