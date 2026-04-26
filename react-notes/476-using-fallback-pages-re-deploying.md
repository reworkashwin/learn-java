# Using Fallback Pages & Re-Deploying

## Introduction

You deployed your Next.js app — congrats! But then you add a new meetup, click on it, and... **404 error**. What happened? The problem is that `getStaticPaths` generated pages only at build time, and your new meetup didn't exist yet. The fix? The `fallback` option. Let's understand why this happens and how to solve it with one simple change.

---

## Concept 1: The 404 Problem with New Data

### 🧠 What is it?

When you deploy a Next.js app, `getStaticPaths` runs once during the build. It pre-generates pages only for the meetup IDs that exist *at that moment*. Any meetup added *after deployment* won't have a pre-generated page.

### ❓ Why does this happen?

With `fallback: false`, Next.js is strict: if a page wasn't pre-generated at build time, it returns a **404**. It's saying, "I don't know this page, so it doesn't exist."

During development, this isn't a problem because `getStaticPaths` runs on every request. But in production, it only runs during the build process.

### 💡 Insight

Think of it like printing a phone book. If someone gets a new phone number after the book was printed, they won't be listed. `fallback: false` means "if they're not in the book, they don't exist." Not very helpful in a dynamic world!

---

## Concept 2: The fallback Option

### 🧠 What is it?

The `fallback` property in `getStaticPaths` controls what happens when a user requests a page that wasn't pre-generated at build time.

### ⚙️ How it works

Three possible values:

| Value | Behavior |
|-------|----------|
| `false` | Unknown pages → **404 error** |
| `true` | Unknown pages → Immediately shows an **empty page**, then loads data in the background. You must handle the loading state. |
| `'blocking'` | Unknown pages → **Waits** until the page is fully generated on the server, then serves the complete page. No loading state needed. |

Both `true` and `'blocking'` tell Next.js: "My list of paths might not be complete — generate missing pages **on demand** when requested."

### 🧪 Example

```javascript
export async function getStaticPaths() {
  // ... fetch meetup IDs from database ...

  return {
    fallback: 'blocking',  // Generate missing pages on demand
    paths: meetups.map((meetup) => ({
      params: { meetupId: meetup._id.toString() },
    })),
  };
}
```

### 💡 Insight

With `'blocking'`, the first user to visit a new meetup page waits a moment while the page is generated. After that, the page is **cached** and served instantly to everyone else. It's the best of both worlds — no 404s, no loading states, and eventual static performance.

---

## Concept 3: true vs 'blocking'

### 🧠 What is it?

The difference between `fallback: true` and `fallback: 'blocking'` is about **what the user sees while the page is being generated**.

### ⚙️ How it works

**`fallback: true`:**
- Returns an empty page immediately
- You need to check `router.isFallback` and show a loading spinner
- Data loads in the background, then the page re-renders
- More work for you, but the user sees *something* right away

**`fallback: 'blocking':**
- The user sees nothing until the page is fully ready
- No extra code needed — the complete page is served once generated
- Simpler to implement but slightly slower perceived load

### 💡 Insight

For most cases, `'blocking'` is the easiest and safest choice. Use `true` only when you want to show a loading skeleton or placeholder while the page generates. `'blocking'` is the "just make it work" option.

---

## Concept 4: Redeploying After Changes

### 🧠 What is it?

When you make code changes (like updating `fallback`), you need to create a new commit and push to GitHub. Vercel automatically detects the push and redeploys.

### ⚙️ How it works

```bash
git add .
git commit -m "fixed fallback"
git push
```

Vercel watches your main branch. On every push:
1. It detects the new commit
2. Starts a new build
3. The **old site stays live** during the build
4. Once complete, the new version takes over seamlessly

### 💡 Insight

This automatic redeployment is one of Vercel's killer features. Your deployment workflow becomes: code → commit → push → done. No manual deploy steps, no downtime.

---

## ✅ Key Takeaways

- `fallback: false` returns 404 for pages not pre-generated at build time — problematic for dynamic data
- `fallback: 'blocking'` generates missing pages **on demand** and caches them — the simplest fix
- `fallback: true` also generates on demand but shows an empty page first (requires handling the loading state)
- After the first request, dynamically generated pages are cached and served statically
- Push to GitHub to trigger automatic redeployment on Vercel

## ⚠️ Common Mistakes

- Leaving `fallback: false` in production when new data can be added — causes 404 errors for new items
- Using `fallback: true` without handling `router.isFallback` — the component crashes trying to access undefined props
- Forgetting to push changes to GitHub after fixing the issue — Vercel won't know about your changes

## 💡 Pro Tips

- Use `'blocking'` as your default for most dynamic pages — it's the safest and simplest option
- Remember that `revalidate` in `getStaticProps` handles *data updates* to existing pages, while `fallback` handles *new pages* that didn't exist at build time — they solve different problems
- Test your fallback behavior by adding new items after deployment and visiting their pages
