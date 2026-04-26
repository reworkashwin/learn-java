# Our Starting Project

## Introduction

Before diving into React code, let's get familiar with the project structure we'll be working with. Understanding what each file does and how the project is organized will save you confusion later. This is our launchpad — once we understand the starting setup, we can focus entirely on learning React concepts.

---

## Concept 1: Project Structure Overview

### 🧠 What is it?

A Vite-created React project comes with a specific folder structure. After cleaning it up, our starting project has just a few key files:

- **`index.html`** — The single HTML file for the entire app (we won't touch this)
- **`src/`** folder — Where all our React code lives
  - **`.jsx` files** — JavaScript files that support HTML (JSX) syntax inside them
  - **`.css` files** — Standard CSS stylesheets

### ❓ Why do we need it?

React is a **single-page application** framework. That single `index.html` file is the only HTML file in the entire project. Everything else — every component, every page, every piece of UI — is built with JavaScript (JSX) files in the `src/` folder.

### ⚙️ How it works

The project setup (Vite) does several things behind the scenes:

1. **JSX transformation** — Converts the HTML-in-JavaScript syntax into valid browser JavaScript
2. **CSS imports** — Detects when you import CSS files into JavaScript and injects those styles into the final page
3. **Bundling** — Combines and optimizes all your code into efficient files for the browser

### 💡 Insight

If you open your browser's developer tools on the running project, you'll see the magic in action. In the `<head>` section, you'll find injected styles (from your CSS imports) and a loaded JavaScript file containing fully transformed code — no JSX in sight, just optimized JavaScript that the browser can execute.

---

## Concept 2: JSX Files and the `.jsx` Extension

### 🧠 What is it?

Files with the `.jsx` extension are JavaScript files that also support writing HTML-like code (JSX syntax) inside them. This is the special syntax React relies on.

### ❓ Why do we need it?

JSX lets you write your UI structure directly in JavaScript. Instead of creating DOM elements manually with `document.createElement()`, you write what looks like HTML — and the build tools convert it to actual JavaScript under the hood.

### ⚙️ How it works

- **In Vite projects**: You **must** use the `.jsx` extension for files containing JSX code
- **In Create React App projects**: The `.js` extension also works for JSX

The `.jsx` extension is a signal to the build tools: "This file contains JSX syntax — please transform it."

### 🧪 Example

```jsx
// This is valid JSX in a .jsx file
function App() {
  return <h1>Hello World</h1>;
}
```

The build tools transform this into something like:
```javascript
// What the browser actually receives
function App() {
  return React.createElement('h1', null, 'Hello World');
}
```

---

## Concept 3: CSS Imports in JavaScript

### 🧠 What is it?

In a React project, you can **import CSS files directly into JavaScript files**. This is not something browsers support natively — it's a feature provided by the build tools.

### ⚙️ How it works

```jsx
import './index.css';  // Importing CSS into a JS file
```

The build tools detect this import, read the CSS file, and inject those styles into the final HTML page. You get the convenience of co-locating styles with components without any manual `<link>` tags.

### 💡 Insight

This is one of those "it just works" features that feels natural after a while. But always remember — it's the build tools making this possible, not the browser. Without Vite or CRA, this import would fail.

---

## ✅ Key Takeaways

- The project has a single `index.html` — everything else is JavaScript and CSS in the `src/` folder
- `.jsx` files are JavaScript files that support HTML-like (JSX) syntax
- Vite projects require the `.jsx` extension for files with JSX code
- CSS files can be imported directly into JavaScript — the build tools handle the injection
- The browser never sees JSX — it receives fully transformed, optimized JavaScript

## ⚠️ Common Mistakes

- Editing `index.html` directly — in React, you build your UI in JSX files, not HTML
- Using `.js` instead of `.jsx` in Vite projects — Vite requires `.jsx` for JSX support
- Forgetting that the dev server (`npm run dev`) must be running to see changes

## 💡 Pro Tips

- Keep the browser developer tools open to see how your code gets transformed
- The `src/` folder is your workspace — almost all your coding happens there
