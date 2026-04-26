# Working with Params for SSG Data Fetching

## Introduction

So far we've used `getStaticProps` on our main page to pre-render a list of meetups. But what about **dynamic pages** — like an individual meetup detail page? How do we know *which* meetup to fetch data for when the page is being pre-generated at build time?

The answer lies in the `context` parameter that `getStaticProps` receives. It gives us access to URL parameters, allowing us to fetch the right data for each version of a dynamic page. Let's see how this works — and discover an important gotcha along the way.

---

## Concept 1: Choosing Between getStaticProps and getServerSideProps for Dynamic Pages

### 🧠 What is it?

Before writing any code, you need to decide which data-fetching function to use on your dynamic page. This decision applies per-page — different pages in the same app can use different strategies.

### ❓ Why do we need it?

Not every page in your app has the same data requirements. A meetup detail page might update rarely, while a live dashboard needs fresh data every request. Choosing wisely affects performance.

### ⚙️ How it works

For the meetup detail page, ask:
- Does meetup data change multiple times per second? **No** — users can add meetups, but they don't change constantly
- Do we need access to the request object? **No** — no auth checks needed here

So `getStaticProps` is the better choice — the page can be cached and served fast.

### 💡 Insight

You don't have to use the same data-fetching strategy across your entire app. Pick the right tool for each page based on its specific needs.

---

## Concept 2: Accessing URL Params in getStaticProps

### 🧠 What is it?

The `context` parameter in `getStaticProps` provides a `params` object containing the dynamic route segments from the URL. This lets you know *which* specific page is being generated.

### ❓ Why do we need it?

On a dynamic page like `[meetupId].js`, we need to know the actual meetup ID to fetch the correct data. We can't use the `useRouter` hook inside `getStaticProps` because React hooks only work inside component functions — not in data-fetching functions.

### ⚙️ How it works

1. Accept the `context` parameter in `getStaticProps`
2. Access `context.params` to get the dynamic route values
3. The property names on `params` match the filename's bracket segments

```jsx
// File: pages/[meetupId]/index.js

export async function getStaticProps(context) {
  const meetupId = context.params.meetupId;
  // meetupId matches the [meetupId] in the filename

  // Fetch data for this specific meetup
  // ...

  return {
    props: {
      meetupData: {
        id: meetupId,
        title: 'First Meetup',
        image: 'https://example.com/image.jpg',
        address: '123 Main Street',
        description: 'This is a first meetup!',
      },
    },
  };
}
```

### 🧪 Example

If your file is named `[meetupId].js` and a user visits `/m1`:
- `context.params.meetupId` → `"m1"`

If your file were named `[slug].js`:
- `context.params.slug` → `"m1"`

The property name always matches what's between the square brackets.

### 💡 Insight

Any `console.log` inside `getStaticProps` shows up in the **terminal** (server-side), not in the browser console. This is because the code runs at build time (or on the dev server), never on the client.

---

## Concept 3: The getStaticPaths Requirement

### 🧠 What is it?

When you use `getStaticProps` on a dynamic page, Next.js throws an error: `getStaticPaths is required`. This is because Next.js needs to know **all possible parameter values** upfront to pre-generate every version of the page at build time.

### ❓ Why do we need it?

Think about it — `getStaticProps` runs during the build process, not when a user visits the page. So if you have a page like `[meetupId].js`, Next.js needs to know: "Should I generate pages for `m1`, `m2`, `m3`? Or just `m1`?" Without this information, it can't pre-render anything.

### ⚙️ How it works

Next.js requires you to export a `getStaticPaths` function alongside `getStaticProps` on any dynamic page. This function tells Next.js which parameter values to pre-generate pages for.

**Important:** `getStaticPaths` is only required when:
- The page is dynamic (uses `[brackets]` in the filename)
- AND you're using `getStaticProps`

It is **not** needed with `getServerSideProps` or when no data-fetching function is used.

### 💡 Insight

This is the missing piece of the SSG puzzle for dynamic routes. `getStaticPaths` defines *which* pages exist, and `getStaticProps` defines *what data* each page gets. They work as a pair.

---

## ✅ Key Takeaways

- `getStaticProps` receives a `context` parameter with `context.params` for accessing URL segments
- The keys on `context.params` match the dynamic segments in your filename (e.g., `[meetupId]` → `params.meetupId`)
- You **cannot** use `useRouter` inside `getStaticProps` — use `context.params` instead
- Using `getStaticProps` on a dynamic page **requires** `getStaticPaths` — Next.js needs to know all possible values at build time
- Console logs in `getStaticProps` appear in the terminal, not the browser

## ⚠️ Common Mistakes

- Trying to use `useRouter()` inside `getStaticProps` — hooks only work inside React component functions
- Forgetting to add `getStaticPaths` when using `getStaticProps` on a dynamic page — this causes a build error
- Confusing `context` in `getStaticProps` (has `params`) with `context` in `getServerSideProps` (has `req` and `res`)

## 💡 Pro Tips

- The `context.params` object in `getStaticProps` is different from the one in `getServerSideProps` — `getStaticProps` gets `params` but NOT `req`/`res`
- In development mode, `getStaticProps` runs on every request for convenience, but in production it only runs at build time (or during ISR)
- Use `console.log` inside `getStaticProps` to debug — just remember to check the terminal, not the browser
