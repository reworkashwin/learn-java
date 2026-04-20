# React Server Components vs Client Components — When To Use What

## Introduction

One of the most fundamental concepts in Next.js is the distinction between **Server Components** and **Client Components**. This isn't just a Next.js thing — it's actually a React feature — but it only truly comes alive when you use a framework like Next.js that unlocks it. Understanding when and why to use each type is critical to building performant, SEO-friendly applications.

---

## What Are Server Components?

In a vanilla React app (built with Create React App or Vite), every component is a **client component** by default. React runs entirely in the browser — it's a pure client-side library. All your component functions execute in the browser, all your JSX renders there, and all your logic lives there.

Next.js changes the game. Because it's a **full-stack framework** with both a frontend and a backend, it unlocks the ability to render components **only on the server**. These are called **React Server Components**.

### The Default in Next.js

By default, **every React component in a Next.js project is a Server Component** — pages, layouts, and regular components alike. Their component functions execute on the server, not in the browser.

How can you verify this? Add a `console.log("executing")` inside a component. You won't see it in the browser's developer tools — you'll see it in the **terminal** where your Next.js development server is running. That's because the component function never runs in the browser.

### Even During Client-Side Navigation

Here's what might surprise you: even when you navigate between pages using Next.js's `<Link>` component (staying in the single-page application mode), the components are **still rendered on the server**. The finished HTML is generated server-side and streamed to the client. You're not re-rendering the components in the browser — the server does the heavy lifting.

---

## Why Do Server Components Matter?

### 1. Less Client-Side JavaScript

Since server components don't ship their JavaScript to the browser, the user downloads **less code**. This can significantly improve page load performance, especially on slower connections or devices.

### 2. Better SEO

With a vanilla React app, if you view the page source, it's essentially an **empty HTML page** — all content is injected by JavaScript at runtime. Search engine crawlers may not see your content.

With Server Components, the page source contains **all the rendered content**. Crawlers see the full page, which dramatically improves search engine optimization.

Think of it like this: a vanilla React app is like handing someone a recipe and expecting them to cook the meal. Server Components hand them the **finished dish**.

---

## What Are Client Components?

Client Components are components that **must execute in the browser** because they use features that only exist on the client side:

- **React hooks** like `useState`, `useEffect`
- **Event handlers** like `onClick`, `onChange`
- **Browser APIs** like `window`, `document`

Even though Client Components are technically pre-rendered on the server (for the initial HTML), they **also hydrate and run on the client** — that's where their interactive behavior lives.

### How to Create a Client Component

Since all components are Server Components by default in Next.js, you must **explicitly opt in** to making a component a Client Component by adding a special directive at the very top of the file:

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function ImageSlideshow() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return <img src={images[currentImage]} alt="Slideshow" />;
}
```

Without `'use client'`, this component would throw an error because `useState` and `useEffect` aren't available in Server Components.

---

## When to Use What?

| Feature / Need | Server Component | Client Component |
|---|---|---|
| Fetching data from a database | ✅ | ❌ |
| Using `useState` or `useEffect` | ❌ | ✅ |
| Event handlers (`onClick`, etc.) | ❌ | ✅ |
| Accessing browser APIs | ❌ | ✅ |
| Displaying static content | ✅ | ✅ |
| SEO-critical content | ✅ | ⚠️ |
| Reducing JS bundle size | ✅ | ❌ |

---

## ✅ Key Takeaways

- In Next.js, **all components are Server Components by default** — they only execute on the server
- Use the `'use client'` directive at the top of a file to make a component a Client Component
- Server Components improve performance (less JS) and SEO (full HTML in source)
- Client Components are needed for interactivity: state, effects, event handlers, browser APIs
- You **can use Client Components inside Server Components** — just not the other way around

## ⚠️ Common Mistakes

- Forgetting to add `'use client'` when using hooks like `useState` or `useEffect` — you'll get a clear error from Next.js
- Assuming all components need to be Client Components — keep as many as possible as Server Components

## 💡 Pro Tip

Next.js is helpful here: if you accidentally use a client-side feature (like `useEffect`) in a Server Component, it will **tell you** with a clear error message, guiding you to add the `'use client'` directive. Let the framework guide you.
