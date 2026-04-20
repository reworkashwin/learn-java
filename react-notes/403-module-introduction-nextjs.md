# Module Introduction: Next.js

## Introduction

We're entering a completely new territory. So far in this course, everything we've built has been a **client-side React application** — the browser downloads JavaScript, React renders the UI, and all the logic runs in the user's browser.

Now we're going to build something fundamentally different: a **fullstack application** with **Next.js**.

---

## What is Next.js?

### 🧠 A Framework Built on React

Next.js is a **React framework** — a framework that builds on top of React to give you capabilities that React alone doesn't provide out of the box.

Think of it this way:
- **React** = a library for building user interfaces
- **Next.js** = a framework that uses React for the UI but adds routing, server-side rendering, data fetching, API routes, and much more

### ❓ Why Do We Need It?

With a standard React app (like those created with Vite or Create React App):
- Everything runs in the browser
- You need a **separate** backend (Express, Django, etc.)
- SEO can be tricky because the initial HTML is mostly empty
- Routing requires a third-party library (React Router)

With Next.js:
- Frontend and backend live in **one project**
- Pages can be rendered on the **server** (great for SEO and performance)
- Routing is built-in via the **file system**
- Data fetching happens on the server before the page reaches the browser

---

## What You'll Learn

This section covers:
- **What Next.js is** and why it exists
- **File-based routing** — how folder structure defines your routes
- **React Server Components** — components that run on the server
- **Data fetching** in Next.js — a different paradigm from client-side fetching
- **Styling, images, and metadata**

---

## The Project

We're building a **foodies community app** where users can:
- View meals shared by others
- Share their own meals
- Be part of a community

The special thing? It's a **fullstack application** — frontend and backend in one codebase, blending seamlessly thanks to Next.js.

---

## ✅ Key Takeaways

- Next.js is a **React framework** that adds fullstack capabilities
- It enables server-side rendering, file-based routing, and integrated API routes
- Your React knowledge carries over — Next.js enhances it, doesn't replace it
- This section takes you from client-side-only React to fullstack React

## 💡 Pro Tip

Don't think of Next.js as "something different from React." It **is** React — just with superpowers. Every component you've written, every hook you've learned, every pattern you know still applies. Next.js just gives you more tools to work with.
