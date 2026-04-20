# Reserved File Names, Custom Components & How To Organize A Next.js Project

## Introduction

The `app/` folder in Next.js is special — certain file names trigger specific behavior. We've seen `page.js` and `layout.js`. But there are more reserved names, and understanding them helps you unlock Next.js features without extra configuration. At the same time, you can still use regular React components that Next.js won't treat specially.

Let's explore reserved names, how to use custom components, and how to organize your project.

---

## Reserved File Names in the App Directory

### `page.js`
Defines the rendered content for a route. Required if you want a folder to be visitable.

### `layout.js`
Defines the wrapper shell around one or more pages. At minimum, you need one root layout.

### `icon.png`
Place an image named `icon` (e.g., `icon.png`) directly in the `app/` folder and Next.js automatically uses it as the **favicon** — that little icon in the browser tab. No configuration needed.

### `globals.css`
Not technically reserved by name, but commonly used. Import it in the root `layout.js` to make styles globally available across all pages:

```jsx
import './globals.css';
```

---

## Custom (Non-Reserved) Components

Here's the key insight: **only reserved file names trigger special behavior**. Any other `.js` file you add is just a regular React component that Next.js ignores from a routing perspective.

### Example: Extracting a Header Component

Say you want to pull an image and heading out of `page.js` into a separate component:

```jsx
// components/header.js
export default function Header() {
  return (
    <>
      <img src="/logo.png" alt="Logo" />
      <h1>Welcome</h1>
    </>
  );
}
```

Then import and use it:

```jsx
// app/page.js
import Header from '@/components/header';

export default function HomePage() {
  return <Header />;
}
```

This works exactly like vanilla React. The file `header.js` is not a reserved name, so Next.js doesn't treat it as a page or layout.

### Proof: Folders Without `page.js` Don't Create Routes

If you add a `components/` folder inside `app/`, you **cannot** visit `/components` in the browser. Without a `page.js`, the folder is invisible to the router.

---

## Where to Store Components

You can store custom components:
- **Inside** the `app/` folder (Next.js ignores non-reserved files for routing)
- **Outside** the `app/` folder (this is often preferred)

Many developers, and the instructor here, prefer keeping components **outside** `app/` so the app folder is purely dedicated to routing.

```
project-root/
├── app/              ← Only routing files
│   ├── layout.js
│   └── page.js
├── components/       ← Custom components
│   └── header.js
└── assets/
    └── logo.png
```

The official Next.js documentation has a full article on different project organization strategies — pick the one you prefer.

---

## The `@` Path Alias

Next.js projects typically come with a `jsconfig.json` (or `tsconfig.json`) that configures the `@` alias to point to the project root:

```jsx
import Header from '@/components/header';
```

This simplifies imports — no need for long relative paths like `../../components/header`. The `@` always refers to the root of your project.

---

## ✅ Key Takeaways

- Reserved file names (`page.js`, `layout.js`, `icon.png`) unlock specific Next.js features
- Any file that doesn't use a reserved name is just a regular React component
- Folders inside `app/` without `page.js` don't create routes
- You can store components anywhere — inside or outside the `app/` folder
- Use the `@` alias to simplify import paths from the project root

## ⚠️ Common Mistakes

- Assuming every file in the `app/` folder affects routing (only reserved names do)
- Forgetting to update import paths when moving component files

## 💡 Pro Tip

You can use either `.js` or `.jsx` extensions in Next.js projects. The default is `.js`, and since all other reserved files use `.js`, sticking with that extension keeps things consistent. But `.jsx` works identically.
