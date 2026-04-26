# Exploring Server-Side Rendering (SSR) with getServerSideProps

## Introduction

We've seen how `getStaticProps` lets us pre-render pages with data at build time, and how `revalidate` keeps those pages fresh. But what if even regular revalidation isn't enough? What if you need the page regenerated for **every single incoming request** — not during the build, not every few seconds, but truly on-the-fly?

That's exactly where **`getServerSideProps`** comes in. It's the server-side rendering counterpart to `getStaticProps`, and understanding when to use each one is a critical skill for any Next.js developer.

---

## Concept 1: getServerSideProps — The SSR Alternative

### 🧠 What is it?

`getServerSideProps` is a special, reserved function you can export from a Next.js page component. Unlike `getStaticProps` (which runs at build time), `getServerSideProps` runs **on the server for every incoming request** after deployment.

Think of it this way:
- `getStaticProps` = "Bake the cake once, serve slices to everyone"
- `getServerSideProps` = "Bake a fresh cake every time someone orders"

### ❓ Why do we need it?

Sometimes your data changes so rapidly that even ISR (Incremental Static Regeneration) with `revalidate` can't keep up. Or maybe you need to inspect the actual incoming request — like checking authentication cookies or reading headers. `getServerSideProps` exists for these exact scenarios.

### ⚙️ How it works

1. Export an `async` function named `getServerSideProps` from your page component
2. This function runs **on the server** for every request — never on the client
3. Return an object with a `props` key containing the data your component needs
4. The code inside can use credentials, access databases, or call internal APIs safely

```jsx
export async function getServerSideProps(context) {
  // Runs on the server for EVERY request
  // Fetch data, check auth, etc.

  return {
    props: {
      meetups: DUMMY_MEETUPS,
    },
  };
}
```

### 🧪 Example

```jsx
export async function getServerSideProps(context) {
  const { req, res } = context;

  // Access request headers, cookies, body, etc.
  // Useful for authentication checks

  const data = await fetch('https://api.example.com/meetups');
  const meetups = await data.json();

  return {
    props: {
      meetups,
    },
  };
}
```

Notice — there's **no `revalidate`** option here. Why? Because the page is regenerated on every request anyway, so revalidation is meaningless.

### 💡 Insight

The `context` parameter gives you access to `req` (request) and `res` (response) objects — just like in Node.js/Express middleware. This is incredibly useful for authentication flows where you need to check session cookies.

---

## Concept 2: getStaticProps vs getServerSideProps — Choosing the Right One

### 🧠 What is it?

This is the decision framework for choosing between static generation and server-side rendering in Next.js.

### ❓ Why do we need it?

Picking the wrong one can make your app either slow (unnecessary SSR) or stale (outdated static pages). You need to understand the trade-offs.

### ⚙️ How it works

Ask yourself two questions:

1. **Does my data change multiple times every second?**
   - Yes → `getServerSideProps`
   - No → `getStaticProps` (with `revalidate`)

2. **Do I need access to the incoming request object?** (e.g., for authentication)
   - Yes → `getServerSideProps`
   - No → `getStaticProps`

### 🧪 Example

| Scenario | Best Choice | Why |
|----------|------------|-----|
| Blog posts | `getStaticProps` | Content rarely changes |
| Meetup listings | `getStaticProps` + `revalidate` | Changes occasionally |
| User dashboard (auth required) | `getServerSideProps` | Needs request cookies |
| Live stock ticker | `getServerSideProps` | Data changes constantly |

### 💡 Insight

`getServerSideProps` might *sound* better because it's always fresh — but it's actually **slower**. With `getStaticProps`, the pre-generated HTML file gets cached and served via a CDN. With `getServerSideProps`, the server has to regenerate the page every single time. Caching beats regeneration for performance.

---

## ✅ Key Takeaways

- `getServerSideProps` runs on the server for **every incoming request** — never on the client
- It receives a `context` object with `req` and `res` — useful for auth and headers
- There's no `revalidate` option because the page is regenerated per-request anyway
- **Prefer `getStaticProps`** unless you need request access or have rapidly changing data
- Code inside `getServerSideProps` is secure — credentials won't leak to the client

## ⚠️ Common Mistakes

- Using `getServerSideProps` when `getStaticProps` with `revalidate` would suffice — this kills performance
- Trying to use `revalidate` inside `getServerSideProps` — it doesn't exist there
- Forgetting that `getServerSideProps` makes your page slower because it can't be cached by a CDN

## 💡 Pro Tips

- If you're unsure, start with `getStaticProps` + `revalidate`. Only switch to `getServerSideProps` when you have a concrete reason
- You can safely use database credentials and API keys inside both functions — they never reach the browser
- The `req` object in `getServerSideProps` gives you access to cookies, headers, and the request body — essential for authentication patterns
