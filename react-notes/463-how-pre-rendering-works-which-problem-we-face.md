# How Pre-Rendering Works & Which Problem We Face

## Introduction

Next.js pre-renders pages by default — that's one of its biggest selling points. But what happens when a page depends on data that needs to be fetched? You might think `useEffect` and `useState` solve this, just like in regular React. But here's the catch: the pre-rendered HTML doesn't wait for your data. This creates a real SEO problem that we need to understand before we can solve it.

---

## Concept 1: The Typical React Data Fetching Pattern

### 🧠 What is it?

In standard React apps, you fetch data using `useEffect` combined with `useState`. The component renders first (with empty/initial state), then the effect runs, fetches data, updates state, and the component re-renders with the actual data.

### ⚙️ How it works

```jsx
import { useState, useEffect } from 'react';

function HomePage() {
  const [loadedMeetups, setLoadedMeetups] = useState([]);

  useEffect(() => {
    // Simulate fetching data from a server
    setLoadedMeetups(DUMMY_MEETUPS);
  }, []);

  return <MeetupList meetups={loadedMeetups} />;
}
```

### 💡 Insight

This pattern produces **two render cycles**:
1. **First render** — `loadedMeetups` is an empty array `[]`
2. **Second render** — after `useEffect` runs and state is updated, the component re-renders with actual data

In a regular React SPA, this is fine — the user sees a brief loading state, then the data appears. But in Next.js, this two-cycle behavior has serious implications for pre-rendering.

---

## Concept 2: The Pre-Rendering Problem

### 🧠 What is it?

Next.js automatically pre-renders pages into static HTML. But here's the critical detail: **it only captures the result of the first render cycle**. It doesn't wait for `useEffect` to run or for state to update.

### ❓ Why is this a problem?

If your component starts with empty state and populates it via `useEffect`, the pre-rendered HTML will contain... the empty state. No data. An empty `<ul>`. Nothing useful for search engines.

### ⚙️ How it works

Here's what happens step by step:

1. Next.js executes the component function for pre-rendering
2. On the **first render**, `loadedMeetups` is `[]` (empty array)
3. Next.js takes this HTML snapshot → **empty list** → sends it as pre-rendered HTML
4. The browser receives this HTML (empty)
5. React hydrates the page, takes over, and runs `useEffect`
6. Data is fetched, state updates, component re-renders **in the browser**
7. The user now sees the data — but the **initial HTML** never had it

### 🧪 Example

If you "View Page Source" in the browser after loading the page, you'll see something like:

```html
<ul>
  <!-- Empty! No meetup items here -->
</ul>
```

Even though the meetups appear on screen (because React hydrated and re-rendered), the **HTML source** — the one search engines crawl — is empty.

### 💡 Insight

This is the fundamental tension: `useEffect` runs **after** render, but Next.js captures the HTML **from** render. So any data loaded via `useEffect` will **never** appear in the pre-rendered output.

---

## Concept 3: Why This Matters for SEO

### 🧠 What is it?

Search Engine Optimization (SEO) depends on search engine crawlers being able to read meaningful content from your HTML. If the pre-rendered HTML is empty, crawlers see an empty page — no matter what appears on screen after JavaScript executes.

### ❓ Why do we need to care?

- Google and other crawlers primarily read the initial HTML
- If your meetup titles, descriptions, and images aren't in that HTML, they won't be indexed
- This defeats the entire purpose of using Next.js for server-side rendering

### ⚙️ How it works

| What the user sees | What the crawler sees |
|--------------------|-----------------------|
| List of meetups (after hydration) | Empty `<ul></ul>` |
| Images, titles, addresses | Nothing |

### 💡 Insight

This is why plain `useEffect` data fetching is **not enough** in Next.js when you care about SEO. You need Next.js's built-in data fetching methods (`getStaticProps` or `getServerSideProps`) to ensure data is available **before** the HTML is generated.

---

## Concept 4: Hydration — The Bridge Between Server and Client

### 🧠 What is it?

Hydration is the process where React "takes over" a pre-rendered HTML page in the browser. It attaches event listeners, hooks up state management, and turns the static HTML into a fully interactive React application.

### ⚙️ How it works

1. Server sends pre-rendered HTML → user sees content immediately
2. React loads in the browser → "hydrates" the page
3. React attaches to the existing DOM instead of rebuilding it
4. From this point on, it's a regular React SPA with client-side navigation

After hydration, `useEffect` runs, data is fetched client-side, and the page updates. But the initial HTML (the one served to crawlers) remains as-is.

### 💡 Insight

Hydration gives you the best of both worlds — fast initial page load (from HTML) and full interactivity (from React). But it only works well if the pre-rendered HTML already contains meaningful content. Otherwise, you get fast... emptiness.

---

## ✅ Key Takeaways

- `useEffect` runs **after** the component renders — Next.js pre-rendering only captures the **first** render
- Data fetched via `useEffect` will **not** appear in the pre-rendered HTML
- This means empty HTML is sent to search engines, hurting SEO
- "View Page Source" reveals the actual pre-rendered HTML — use it to verify what crawlers see
- Next.js has built-in solutions (`getStaticProps`, `getServerSideProps`) to solve this exact problem

## ⚠️ Common Mistakes

- **Assuming `useEffect` data will be pre-rendered** — It won't. Pre-rendering only captures the first synchronous render
- **Relying on "View Page Source" vs DevTools** — DevTools shows the live DOM (after hydration and JS execution). "View Page Source" shows the actual HTML sent from the server. Always check the source for SEO verification

## 💡 Pro Tips

- If your page doesn't need SEO (like a dashboard behind authentication), client-side fetching with `useEffect` is perfectly fine
- For public-facing pages that need SEO, always use `getStaticProps` or `getServerSideProps` to fetch data before rendering
