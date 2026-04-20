# React Projects Use a Build Process

## Introduction

If you peek inside a React project's `index.html`, you'll notice something strange: **there are no `<script>` tags at all**. Yet the app clearly works — JavaScript is executing, React is running. How is this possible?

The answer: **a build process is running behind the scenes.**

---

## What You'll Find in a React Project's HTML

Open the `index.html` of a React project:

```html
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  <!-- No script tags! -->
</body>
```

No script tags. Just a `<div id="root">` and a fallback `<noscript>` message. We never manually add script tags to this file either.

But if you inspect the running page in the browser's developer tools, you **will** see script tags — multiple of them. They were **injected automatically** by the build process.

---

## What is a Build Process?

A build process means: **the code you write is NOT the code that gets executed in the browser.**

Your source code goes through a transformation pipeline before being served to the user.

### The Pipeline

```
Your Source Code → Build Tool (transformation) → Optimized Code → Browser
```

### What Runs This?

In the `package.json` of a React project, you'll find dependencies like:
- `react` and `react-dom` — the React library itself
- `react-scripts` (or `vite`) — the build toolchain

The build tool:
1. **Watches** your source code for changes
2. **Transforms** the code (JSX → valid JavaScript)
3. **Optimizes** the code (minification, bundling)
4. **Injects** script tags into the HTML
5. **Serves** everything through a development server

---

## Why Do We Need a Build Process?

### Reason 1: JSX is Not Valid JavaScript

React code relies heavily on JSX — HTML-like syntax inside JavaScript:

```jsx
function App() {
  return <div>Hello World</div>;
}
```

If you try this in a regular JavaScript file without a build process, you get an error. The browser simply doesn't understand HTML tags inside JavaScript.

The build process **converts JSX** into valid JavaScript function calls that the browser can execute.

### Reason 2: Code Optimization

The code you write is human-readable — with descriptive variable names, comments, and whitespace. But this makes files larger than necessary.

**Minification** shrinks your code by:
- Shortening variable and function names
- Removing whitespace and comments
- Reducing the total file size

This means faster downloads for your users = better performance.

---

## How Does This Work with CodeSandbox?

In CodeSandbox:
- The build process runs automatically in the background
- The development server is already started
- You see a live preview without running any commands

In a local project:
- You run `npm run dev` to start the development server
- The build process watches your files automatically
- You keep the server running while working

---

## ✅ Key Takeaways

- React projects use a **build process** that transforms your code before it reaches the browser
- **JSX is not valid JavaScript** — it must be converted by the build tools
- **Minification** optimizes code for production by reducing file sizes
- Script tags are **injected automatically** — you never add them manually
- **Node.js** powers these build tools behind the scenes
- In CodeSandbox, everything is pre-configured; locally, you start it with `npm run dev`

---

## ⚠️ Common Mistake

Trying to use JSX in a regular JavaScript project without a build process. If you write `<div>Hello</div>` in a plain `.js` file and load it in the browser, you'll get a syntax error. JSX **only works** in projects with a proper React build setup.

---

## 💡 Pro Tip

Don't stress about understanding the build process internals. You don't need to configure Webpack or Babel yourself. Tools like Vite and Create React App handle all of this out of the box. Just know *that* it exists and *why* — so you're not confused when things work differently than vanilla JavaScript.
