# Module Introduction — Building a Multi-Page SPA with React Router

## Introduction

Everything we've built so far shares one characteristic: it all happens on a **single URL**. The address bar never changes, no matter how much the UI shifts. Click a button, open a modal, switch a tab — the URL stays the same.

That's the core idea of a Single Page Application (SPA). But it comes with a significant downside: **you can't link to specific parts of your app**. You can't bookmark a page, share a URL to a product detail page, or navigate directly to a settings screen.

Think about it — on most websites, you can share a URL like `example.com/products/42` and someone can jump straight to that product. In our React apps so far? Everyone starts at the same place every time.

---

## What Is Client-Side Routing?

Client-side routing gives us the **best of both worlds**:

1. **SPA benefits** — no full page reloads, fast transitions, persistent state
2. **Multi-page feel** — different URLs load different content, URLs are bookmarkable and shareable

Instead of the server sending different HTML files for different URLs (traditional multi-page approach), the React app itself watches the URL and decides what to render.

```
Traditional Web:
  /home     → server sends home.html
  /products → server sends products.html
  (each navigation = new HTTP request + full page reload)

SPA with Routing:
  /home     → React renders <HomePage />
  /products → React renders <ProductsPage />
  (URL changes, but no new HTTP request — JavaScript handles it)
```

---

## What We'll Learn

In this section, we'll cover:

1. **What client-side routing is** and why it matters
2. **React Router** — the most popular routing library for React
3. How to define routes, navigate between pages, and build layouts
4. **Data fetching and sending** with React Router's built-in capabilities

---

## Why React Router?

React doesn't include routing out of the box. The `react-router-dom` package is the de facto standard for adding routing to React applications. It provides:

- URL watching and matching
- Declarative route definitions
- Navigation components (links that don't trigger page reloads)
- Nested routes and layouts
- Data loading and form handling
- Error boundaries for routes

---

## ✅ Key Takeaways

- SPAs are powerful but lose the ability to link to specific pages — routing brings that back
- Client-side routing changes the URL and renders different components without fetching new HTML from the server
- React Router (`react-router-dom`) is the standard library for routing in React
- You get SPA performance with multi-page navigation — the best of both worlds

## 💡 Pro Tips

- Even if your app is small, setting up routing early makes it easier to grow
- URLs are part of your user experience — treat them as a first-class feature of your app design
