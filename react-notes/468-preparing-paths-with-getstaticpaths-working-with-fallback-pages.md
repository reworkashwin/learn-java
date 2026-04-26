# Preparing Paths with getStaticPaths & Working with Fallback Pages

## Introduction

We learned that using `getStaticProps` on a dynamic page triggers an error demanding `getStaticPaths`. But what exactly is this function, what does it return, and what's this mysterious `fallback` key it requires?

`getStaticPaths` is the third pillar of Next.js data fetching — alongside `getStaticProps` and `getServerSideProps`. It tells Next.js which versions of a dynamic page should be pre-generated. Let's break it down completely.

---

## Concept 1: Understanding getStaticPaths

### 🧠 What is it?

`getStaticPaths` is a reserved async function you export from a dynamic page component file. Its job is to return a list of all the parameter values for which Next.js should pre-generate pages at build time.

Think of it like a guest list for a party — you're telling Next.js: "These are the pages that should exist. Generate them."

### ❓ Why do we need it?

Remember: `getStaticProps` runs during the **build process**, not when a user visits. So for a dynamic page like `[meetupId].js`, Next.js has a problem — it doesn't know what values `meetupId` can take. Should it generate a page for `m1`? `m2`? `abc123`?

Without `getStaticPaths`, Next.js simply can't pre-generate dynamic pages because it doesn't know which ones to create.

### ⚙️ How it works

1. Export `getStaticPaths` from your dynamic page file
2. Return an object with a `paths` array
3. Each element in `paths` is an object with a `params` key
4. The `params` object mirrors the dynamic segments in your filename

```jsx
export async function getStaticPaths() {
  return {
    paths: [
      { params: { meetupId: 'm1' } },
      { params: { meetupId: 'm2' } },
    ],
    fallback: false,
  };
}
```

For every object in the `paths` array, Next.js will call `getStaticProps` and generate a page.

### 🧪 Example

If your file is `pages/[meetupId]/index.js` and you return paths for `m1` and `m2`:
- Next.js pre-generates `/m1` and `/m2`
- `getStaticProps` runs for each, receiving `context.params.meetupId` as `"m1"` or `"m2"`
- Visiting `/m1` or `/m2` → works perfectly
- Visiting `/m3` → behavior depends on `fallback` setting

### 💡 Insight

In a real app, you'd never hard-code the paths. You'd fetch all valid IDs from a database or API and dynamically build the `paths` array. The hard-coded version is just for learning.

---

## Concept 2: The Fallback Key

### 🧠 What is it?

The `fallback` key is a required property in the object returned by `getStaticPaths`. It tells Next.js what to do when a user requests a page for a parameter value that **isn't** in the `paths` array.

### ❓ Why do we need it?

Imagine you have 10,000 products. Do you really want to pre-generate all 10,000 pages at build time? Probably not — that would take forever. You might want to pre-generate the top 100 and handle the rest on-demand. The `fallback` key enables exactly this.

### ⚙️ How it works

| Value | Behavior |
|-------|----------|
| `false` | Only paths in the array are valid. Everything else → **404 page** |
| `true` | Missing pages are generated **on-demand** when first requested. Shows a fallback/loading state initially |
| `'blocking'` | Missing pages are generated on-demand, but the server **waits** until the page is ready before responding (no loading state) |

```jsx
export async function getStaticPaths() {
  return {
    paths: [
      { params: { meetupId: 'm1' } },
      { params: { meetupId: 'm2' } },
    ],
    fallback: false, // m3, m4, etc. → 404
  };
}
```

### 🧪 Example

With `fallback: false`:
- Visit `/m1` → ✅ Works (pre-generated)
- Visit `/m2` → ✅ Works (pre-generated)
- Visit `/m3` → ❌ 404 page

With `fallback: true`:
- Visit `/m1` → ✅ Works instantly (pre-generated)
- Visit `/m3` → ⏳ Shows loading state, then generates and displays the page
- Next visit to `/m3` → ✅ Works instantly (now cached)

### 💡 Insight

`fallback: true` is a brilliant optimization strategy. Pre-generate your most popular pages at build time, and let the less popular ones be generated on-demand. Once generated, they're cached just like the pre-built ones. It's the best of both worlds.

---

## Concept 3: When getStaticPaths Is (and Isn't) Needed

### 🧠 What is it?

A decision rule for knowing when you need `getStaticPaths` in your page component.

### ⚙️ How it works

You need `getStaticPaths` **only when**:
- ✅ The page is dynamic (filename uses `[brackets]`)
- ✅ AND you're using `getStaticProps`

You do **not** need it when:
- ❌ The page is static (no dynamic segments)
- ❌ You're using `getServerSideProps` (it handles every request dynamically anyway)
- ❌ You're not using any data-fetching function

### 💡 Insight

`getServerSideProps` doesn't need `getStaticPaths` because it doesn't pre-generate anything — it builds the page fresh on every request. There's nothing to "plan ahead" for.

---

## Concept 4: The Complete SSG Flow for Dynamic Pages

### ⚙️ How it works

Here's the full picture of how `getStaticPaths` and `getStaticProps` work together:

1. **Build starts** → Next.js finds `[meetupId].js`
2. **Calls `getStaticPaths`** → Gets the list of all meetup IDs to pre-generate
3. **For each path** → Calls `getStaticProps` with that specific `params`
4. **`getStaticProps` fetches data** → Returns props for that meetup
5. **Next.js generates HTML** → One static HTML file per meetup
6. **At runtime** → Serves pre-built HTML instantly from CDN

```
getStaticPaths()          getStaticProps({ params })
     │                           │
     ├─ { meetupId: 'm1' } ──── ├─ fetch data for m1 → HTML for /m1
     │                           │
     └─ { meetupId: 'm2' } ──── └─ fetch data for m2 → HTML for /m2
```

---

## ✅ Key Takeaways

- `getStaticPaths` tells Next.js **which** dynamic pages to pre-generate at build time
- It returns a `paths` array with objects containing `params` for each page version
- The `fallback` key controls what happens when a user visits a non-pre-generated path
- `fallback: false` → 404 for unknown paths; `fallback: true` → on-demand generation
- Only required on dynamic pages using `getStaticProps` — not with `getServerSideProps`

## ⚠️ Common Mistakes

- Forgetting the `fallback` key — Next.js will throw an error without it
- Hard-coding paths in production — always fetch valid IDs dynamically from your data source
- Using `fallback: true` without handling the loading state in your component — users will see errors
- Adding `getStaticPaths` to non-dynamic pages — it's only for pages with `[brackets]` in the filename

## 💡 Pro Tips

- Use `fallback: 'blocking'` for a simpler experience — no need to handle loading states, but the user waits slightly longer
- For large sites (e-commerce, blogs), combine `fallback: true` with pre-generating only your top pages to dramatically reduce build times
- In development mode, `getStaticPaths` runs on every request; in production, it only runs at build time
- Console logs inside `getStaticPaths` and `getStaticProps` appear in the **terminal**, not the browser
