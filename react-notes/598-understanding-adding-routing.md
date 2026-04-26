# Understanding & Adding Routing

## Introduction

Our React app looks great — we can fetch and send data. But there's a big problem: the entire app lives on a **single URL**. No matter what you click, the address bar never changes. You can't share a link to the "create new post" page because that page doesn't have its own URL. You can't bookmark a specific view. Everything is just... one page.

That's where **routing** comes in. Even though React apps are Single Page Applications (SPAs), routing lets us simulate a multi-page experience by mapping different URL paths to different components. And the most popular tool for this? **React Router**.

---

## Concept 1: What Is Routing?

### 🧠 What is it?

Routing is the process of **matching a URL path to a specific component** that should be displayed. When the URL changes, the app renders a different component — without actually loading a new HTML page from the server.

### ❓ Why do we need it?

- **Shareability**: Users should be able to share links to specific pages
- **Bookmarking**: Users should be able to bookmark specific views
- **Navigation**: Users expect the back/forward buttons to work
- **Organization**: Complex apps need to be broken into logical pages

### ⚙️ How it works conceptually

| URL Path | Component to Render |
|---|---|
| `/` | Landing page with all posts |
| `/create-post` | New post form |
| `/products` | Products listing |

The app evaluates the current URL and loads the matching component — all on the **client side**, without sending a new request to the server.

### 💡 Insight

Even though React builds SPAs (Single Page Applications), users still expect a multi-page experience. Routing bridges this gap — one HTML page, but the illusion of many.

---

## Concept 2: React Router

### 🧠 What is it?

**React Router** is the most popular routing library for React. React itself has **no built-in routing** — it's just a UI library. React Router adds the ability to define routes, navigate between them, and keep the URL in sync with what's displayed.

### ❓ Why use it instead of building your own?

You *could* manually read `window.location`, parse the path, and conditionally render components. But React Router handles:
- URL parsing and matching
- History management (back/forward buttons)
- Nested routes and layouts
- Data loading and submission (v6.4+)
- Redirects, error handling, and much more

### ⚙️ How to install it

```bash
npm install react-router-dom
```

Note: it's `react-router-dom`, not just `react-router`. The `-dom` suffix indicates it's specifically for web (browser) applications.

### 💡 Insight

React Router has gone through major version changes. Version 5 and version 6 work quite differently. Version 6.4 added even more features like loaders and actions (which we'll explore later). Make sure you're using v6.4+ for the latest features.

---

## Concept 3: Client-Side Routing vs Server-Side Routing

### 🧠 What is it?

Traditional websites use **server-side routing**: the browser sends a request to the server for each page, and the server responds with a new HTML document. With **client-side routing**, the browser loads the app once, and all subsequent "page changes" happen via JavaScript — no new requests to the server.

### ❓ Why does this distinction matter?

Client-side routing means:
- **Faster navigation** — no full page reloads
- **Preserved state** — your app's in-memory state survives between "pages"
- **Better UX** — smooth transitions, no white flash between pages

But you're still in a single-page application. The routing is just an elegant illusion managed by JavaScript.

### 💡 Insight

Think of it like a book with tabbed dividers. Server-side routing is like closing the book, going to the shelf, and grabbing a different book for each chapter. Client-side routing is like just flipping to a different tab — same book, different section, much faster.

---

## ✅ Key Takeaways

- React apps are SPAs by default — one HTML page, no URL-based navigation
- **Routing** lets you map different URL paths to different components
- **React Router** (`react-router-dom`) is the standard library for routing in React
- All routing happens **on the client side** — no new HTML pages are fetched from the server
- Install with `npm install react-router-dom`
- Version 6.4+ includes powerful data-loading features (loaders and actions)

## ⚠️ Common Mistakes

- Installing `react-router` instead of `react-router-dom` — you need the DOM-specific package for web apps
- Confusing React Router v5 syntax with v6 — they're significantly different
- Thinking routing means you're building a traditional multi-page app — it's still an SPA

## 💡 Pro Tips

- Always check which version of React Router you're using — tutorials for v5 won't work with v6
- React Router's official docs at [reactrouter.com](https://reactrouter.com) are an excellent reference
- Consider frameworks like Next.js or Remix if you want file-based routing built on top of React
