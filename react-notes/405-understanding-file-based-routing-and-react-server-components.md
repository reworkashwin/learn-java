# Understanding File-based Routing & React Server Components

## Introduction

Two concepts set Next.js apart from plain React right from the start: **file-based routing** (your folder structure IS your routing) and **React Server Components** (components that execute on the server, not in the browser). Let's understand both.

---

## File-based Routing

### 🧠 What is it?

In a standard React app, you define routes in code:

```jsx
// React Router approach
<Route path="/" element={<Home />} />
<Route path="/about" element={<About />} />
```

In Next.js, you don't write route definitions at all. Instead, your **file system** defines the routes:

```
app/
├── page.js          →  /
├── about/
│   └── page.js      →  /about
├── meals/
│   └── page.js      →  /meals
```

Every folder in the `app/` directory becomes a route segment. Every `page.js` file inside a folder becomes the page rendered for that route.

### ❓ Why file-based routing?

- **Zero configuration** — no route setup code needed
- **Intuitive** — the folder structure mirrors the URL structure
- **Co-location** — styles, components, and tests can live next to their page
- **Automatic code splitting** — Next.js only loads what's needed for each page

---

## Reserved Filenames

Next.js gives special meaning to certain filenames in the `app/` directory:

| Filename | Purpose |
|---|---|
| `page.js` | Renders a page (the content for a route) |
| `layout.js` | Wraps pages with shared UI (headers, sidebars) |
| `loading.js` | Shows while the page is loading |
| `error.js` | Shows when something goes wrong |

These aren't arbitrary conventions — Next.js looks for these specific files to build its routing and rendering system.

---

## React Server Components

### 🧠 What are they?

By default, **every component in a Next.js app is a Server Component**. This means:

- The component function runs **on the server**
- The JSX it returns is rendered to HTML on the server
- That HTML is sent to the browser

```jsx
// app/page.js — this is a Server Component by default
export default function Home() {
  console.log('This runs on the SERVER');
  return <h1>Welcome!</h1>;
}
```

### 🧪 Proof: Where does console.log appear?

If you add `console.log('executing')` to a page component:
- ❌ You will **NOT** see it in the browser's developer console
- ✅ You **WILL** see it in the terminal where `npm run dev` is running

That terminal is your server. The component executed there, and only the resulting HTML was sent to the browser.

### ❓ Why Server Components?

- **Performance** — No JavaScript for that component is sent to the browser
- **Security** — Sensitive logic (API keys, database queries) stays on the server
- **SEO** — Fully rendered HTML arrives at the browser (search engines can read it)
- **Data fetching** — You can fetch data directly in the component (no `useEffect`, no loading states)

### What About Interactivity?

Server Components can't use:
- `useState`
- `useEffect`
- Event handlers (`onClick`, etc.)

For interactive features, you'll use **Client Components** (marked with `'use client'`). We'll cover that later — but the key insight is: **default to Server Components, add client components only where needed**.

---

## ✅ Key Takeaways

- Next.js uses **file-based routing** — folders and `page.js` files define your routes
- Reserved filenames (`page.js`, `layout.js`, etc.) have special meaning in Next.js
- Every component is a **Server Component** by default — it runs on the server
- Server Components send HTML, not JavaScript, to the browser
- `console.log` in Server Components appears in the terminal, not the browser

## ⚠️ Common Mistakes

- Expecting `console.log` to appear in the browser dev tools — Server Components log on the server
- Trying to use `useState` or `onClick` in Server Components — you'll need `'use client'` for that
- Creating files named `page.jsx` with React Router mindset — Next.js uses its own routing conventions

## 💡 Pro Tip

Think of Server Components as "HTML factories." They run on the server, produce HTML, and stop existing. No JavaScript bundle is sent for them. This is fundamentally different from traditional React where every component becomes part of the client-side JavaScript bundle. It's a paradigm shift — and a powerful one.
