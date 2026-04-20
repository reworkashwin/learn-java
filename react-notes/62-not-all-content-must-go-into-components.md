# Not All Content Must Go Into Components

## Introduction

When you start working with React, it's easy to fall into the trap of putting **everything** inside components. But here's a secret: **not all content needs to live in a React component.** Some static markup belongs right in your `index.html` file — and understanding when to use which approach is an important architectural decision.

---

## The Scenario: Adding a Header

We want a simple header at the top of our Tic-Tac-Toe page — just an image and a title. Your first instinct might be to create this inside the `App` component:

```jsx
function App() {
  return (
    <header>
      <img src="game-logo.png" alt="Hand drawn tic tac toe game board" />
      <h1>Tic-Tac-Toe</h1>
    </header>
  );
}
```

This would work — but is it the best approach?

---

## When to Use `index.html` Instead

Ask yourself two questions about the markup:

1. **Does it depend on any props or state?** → No
2. **Does it ever need to change dynamically?** → No

If both answers are "no," then this markup can go directly into `index.html`. React controls the `<div id="root">` element, but everything **outside** that div is regular HTML that gets served to visitors.

```html
<!-- index.html -->
<body>
  <header>
    <img src="game-logo.png" alt="Hand drawn tic tac toe game board" />
    <h1>Tic-Tac-Toe</h1>
  </header>
  <div id="root"></div>
</body>
```

The header sits **above** the root div, completely outside React's control — and that's perfectly fine.

---

## The `public` Folder and Static Assets

The starting project has a `public` folder containing images. Here's how it works:

- All files in `public/` are **automatically served** alongside `index.html` to website visitors
- You reference them by **filename only** — no path prefix needed

```html
<!-- ✅ Correct -->
<img src="game-logo.png" />

<!-- ❌ Wrong — don't include public/ in the path -->
<img src="public/game-logo.png" />
```

Why? Because the build tool automatically surfaces files from `public/` to the root of your web application.

---

## The Decision Framework

| Criterion | Use `index.html` | Use a Component |
|---|---|---|
| Static content, never changes | ✅ | Overkill |
| Depends on props or state | ❌ | ✅ |
| Needs dynamic behavior | ❌ | ✅ |
| Application logic involved | ❌ | ✅ |

Most of your app's markup **will** go into components. But for truly static elements — headers, footers, meta content — `index.html` is a perfectly valid home.

---

## ✅ Key Takeaways

- Not everything needs to be a React component — static markup can live in `index.html`
- React only controls content inside the root `<div>` — HTML outside it is untouched
- Files in the `public/` folder are served at the root level — reference them by name, not by path
- Most markup and **all** logic should still go in components

## ⚠️ Common Mistakes

- Putting `public/` in the file path when referencing assets from the public folder
- Forgetting that `index.html` is still a valid place for static content
- Over-componentizing everything, even content that will never change

## 💡 Pro Tip

Use `index.html` for content that is truly "set and forget" — like a brand logo or a static navigation bar that doesn't depend on application state. The moment content needs to react to data changes, move it into a component.
