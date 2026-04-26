# More on Static Site Generation (SSG)

## Introduction

We've learned how `getStaticProps` pre-renders pages with data at build time. But what happens when your data changes after you deploy? Does the page stay frozen forever? And how do you actually see which pages Next.js generates statically? In this section, we'll dig deeper into the build output, understand the difference between SSG pages with and without data, and discover **Incremental Static Regeneration (ISR)** — a feature that lets your static pages stay fresh without redeploying.

---

## Concept 1: Understanding the Build Output

### 🧠 What is it?

When you run `npm run build`, Next.js creates a production build and shows you exactly which pages were generated and how.

### ⚙️ How it works

Running `npm run build` produces output like:

```
Route                          Size
┌ ● /                          5.2 kB
├ ○ /404                       3.1 kB
├ ○ /[meetupId]                2.8 kB
└ ○ /new-meetup                3.5 kB

● (SSG) - Static Site Generation (uses getStaticProps)
○ Static  - Automatically rendered as static HTML (no data)
```

### ❓ What do the icons mean?

| Icon | Meaning | Description |
|------|---------|-------------|
| ● (filled) | SSG with data | Statically generated with `getStaticProps` — HTML + JSON |
| ○ (empty) | Static (no data) | Statically generated automatically — no data fetching needed |

### 🧪 Example

- `/` → ● SSG — Uses `getStaticProps` to fetch meetup data
- `/new-meetup` → ○ Static — Just renders a form, no data fetching required
- `/[meetupId]` → ○ Static — Not yet configured with `getStaticProps`
- `/404` → ○ Static — Auto-generated error page

### 💡 Insight

Not every page needs `getStaticProps`. Pages that just render forms, static content, or UI without external data are automatically static — and that's perfectly fine. Only add `getStaticProps` when you actually need to fetch data for pre-rendering.

---

## Concept 2: The Stale Data Problem

### 🧠 What is it?

Since Static Generation happens at **build time**, the pre-rendered pages contain data from when you last built the project. If data changes after deployment (new meetups added, existing ones updated), the pre-rendered pages become **outdated**.

### ❓ Why is this a problem?

Imagine you deploy your meetup app on Monday with 5 meetups. On Tuesday, 3 new meetups are added to the database. But the pre-rendered homepage still shows only 5 meetups — because it was built on Monday and doesn't know about the new ones.

### ⚙️ Your options

1. **Rebuild and redeploy** — Works for sites with infrequent updates (blogs, documentation)
2. **Use Incremental Static Regeneration** — The smart solution for frequently changing data

### 💡 Insight

For a personal blog where you publish once a week, rebuilding is perfectly fine. For a meetup platform where events are added hourly? You need something better.

---

## Concept 3: Incremental Static Regeneration (ISR)

### 🧠 What is it?

ISR is a Next.js feature that allows static pages to be **regenerated on the server** at regular intervals — without rebuilding the entire site. It's the best of both worlds: the speed of static pages with the freshness of server-rendered ones.

### ❓ Why do we need it?

Because rebuilding and redeploying every time data changes is impractical for most real-world applications. ISR lets your static pages update themselves in the background.

### ⚙️ How it works

Add a `revalidate` property to the object returned by `getStaticProps`:

```jsx
export async function getStaticProps() {
  // Fetch data...
  return {
    props: {
      meetups: DUMMY_MEETUPS,
    },
    revalidate: 10, // Regenerate this page every 10 seconds
  };
}
```

Here's what happens:
1. At build time, the page is generated normally (just like before)
2. After deployment, when a request comes in, Next.js serves the pre-built page
3. If more than `revalidate` seconds have passed since the last generation, Next.js regenerates the page **in the background** on the server
4. The next request gets the freshly regenerated page
5. This cycle continues — the page stays up-to-date without redeployment

### 🧪 Example

```jsx
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/meetups');
  const data = await res.json();

  return {
    props: {
      meetups: data,
    },
    revalidate: 3600, // Regenerate at most once per hour
  };
}
```

### 💡 Insight

Think of `revalidate` as a **freshness timer**. You're telling Next.js: "This page is good for X seconds. After that, make a fresh one the next time someone asks for it." The stale page is still served while the new one is being built — so users never see a loading state.

---

## Concept 4: Choosing the Right `revalidate` Value

### 🧠 What is it?

The `revalidate` value (in seconds) controls how often a page can be regenerated. Choosing the right number depends on how frequently your data changes.

### ⚙️ How it works

| Data Change Frequency | Suggested `revalidate` | Example |
|-----------------------|------------------------|---------|
| Rarely (weekly) | `604800` (1 week) | Blog posts |
| Occasionally (daily) | `86400` (1 day) | Product catalog |
| Frequently (hourly) | `3600` (1 hour) | Meetup listings |
| Constantly (real-time) | `1` (1 second) | Stock prices, live scores |

### ⚠️ Common Mistakes

- **Setting `revalidate` too low unnecessarily** — A value of `1` means the server regenerates the page on almost every request. That's fine for truly dynamic data, but wasteful for content that changes once a day.
- **Forgetting `revalidate` entirely** — Without it, the page is generated **only** at build time and never updates after deployment.
- **Confusing `revalidate` with real-time updates** — ISR doesn't push updates to users instantly. It regenerates on the next request after the timer expires. For true real-time, you'd need client-side fetching or WebSockets.

### 💡 Insight

ISR is not a replacement for real-time data — it's a way to keep static pages **reasonably fresh**. For most applications, having data that's at most a few seconds or minutes old is perfectly acceptable.

---

## ✅ Key Takeaways

- `npm run build` shows which pages are statically generated (●) vs plain static (○)
- Pages with `getStaticProps` are marked as SSG — they include pre-fetched data in their HTML
- Without `revalidate`, static pages are frozen at build time — they won't reflect data changes until you rebuild
- `revalidate: N` enables **Incremental Static Regeneration** — the page is regenerated on the server every N seconds
- ISR gives you static performance with near-dynamic freshness
- Choose `revalidate` based on how frequently your data actually changes

## 💡 Pro Tips

- You can combine ISR with client-side fetching — use `getStaticProps` with `revalidate` for SEO-critical data, and `useEffect` for real-time updates that don't need to be crawled
- ISR only regenerates pages that are actually requested — unused pages don't waste server resources
- In development mode (`npm run dev`), `getStaticProps` runs on every request regardless of `revalidate` — you'll only see the actual behavior in production builds
