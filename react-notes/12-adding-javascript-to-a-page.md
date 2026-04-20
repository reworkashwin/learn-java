# Adding JavaScript To A Page & How React Projects Differ

## Introduction

Let's start from the basics: how does JavaScript actually get added to a webpage? And more importantly, how does this differ in React projects? Understanding this distinction is crucial before we go further.

---

## Where JavaScript Can Run

JavaScript isn't limited to the browser anymore:

- **Browser** — where it originated in the 1990s, and the focus of this course
- **Server-side** — via Node.js and Deno
- **Mobile apps** — via technologies like React Native and Capacitor

The general syntax and rules remain the same across environments, but this course focuses on JavaScript in the browser (since React is a client-side library).

---

## Two Ways to Add JavaScript to a Page

Both methods use the `<script>` tag:

### 1. Inline Script (Rarely Used)

```html
<script>
  console.log("Hello World");
</script>
```

Put your JavaScript directly between script tags. This approach is almost never used in practice because it makes HTML files messy and hard to maintain.

### 2. External File (The Standard Approach)

```html
<script src="assets/scripts/app.js"></script>
```

JavaScript lives in a dedicated `.js` file and is imported via the `src` attribute. This keeps your project organized and maintainable.

**Important:** You must use both opening and closing `<script>` tags — self-closing script tags (`<script />`) are not valid.

---

## Important Script Attributes

### `defer`

```html
<script src="app.js" defer></script>
```

Ensures the script executes **after** the HTML document has been fully parsed. Without `defer`, if your script tries to access an HTML element that hasn't been rendered yet, it will fail.

### `type="module"`

```html
<script src="app.js" type="module"></script>
```

Treats the JavaScript file as a **module**, which unlocks a critical feature: the **import/export syntax**.

With modules, you can:
- **Export** code from one file
- **Import** and use it in another file

```javascript
// util.js
export const apiKey = "abc123";

// app.js
import { apiKey } from './util.js';
```

This is essential for organizing code across multiple files.

---

## How React Projects Differ

Here's the key difference: **in React projects, you almost never manually add `<script>` tags to your HTML file.**

Why? Because React projects use a **build process** that:

1. Takes all your separate JavaScript files
2. Transforms the code (including JSX → valid JS)
3. Bundles everything into optimized files
4. **Automatically injects** the necessary `<script>` tags into the HTML

### Why No `type="module"` in React?

If you inspect a running React app, the injected `<script>` tags don't have `type="module"`. That's because the build process:

- Reads all your imports and exports
- Merges separate files into larger bundles
- Uses the old-school script approach (without modules) for broader browser compatibility
- This also means the browser downloads fewer, larger files instead of many small ones — which is typically more efficient

---

## ✅ Key Takeaways

- JavaScript is added to pages via `<script>` tags — use external files, not inline scripts
- The `defer` attribute ensures scripts run after the HTML is fully loaded
- `type="module"` enables the import/export syntax for splitting code across files
- In React projects, **you don't add script tags manually** — the build process handles everything
- The build process bundles your modules into optimized files automatically

---

## ⚠️ Common Mistake

In vanilla JavaScript projects (without a build process), forgetting to add `type="module"` to your script tag when using `import`/`export` syntax. Without it, imports will fail with errors.

---

## 💡 Pro Tip

In plain JavaScript, the file extension (`.js`) is required in import paths. In React projects with a build process, the extension is typically omitted because the build tool adds it automatically. Keep this difference in mind when switching between vanilla JS and React.
