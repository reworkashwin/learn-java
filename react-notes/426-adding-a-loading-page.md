# Adding A Loading Page

## Introduction

When your page fetches data that takes time (like a database query or API call), users are left staring at a blank screen. That's a terrible experience. Next.js solves this with a built-in loading states mechanism — just create a special `loading.js` file, and Next.js automatically shows fallback content while your page is loading.

---

## The Problem: Blank Screen While Loading

When a Server Component fetches data asynchronously (using `await`), Next.js waits for the data to arrive before rendering the page. If that fetch takes 2 or 5 seconds, the user sees **nothing** during that time.

Navigate to the meals page, and you'll just sit there wondering if your click even worked. No spinner, no message — just emptiness. That's because the server is busy fetching data and hasn't sent the page to the browser yet.

---

## The Solution: `loading.js`

Next.js has a convention: place a file named `loading.js` next to a `page.js` file (or at a higher level in the `app` directory), and its contents will automatically be shown **while the page or any nested page is loading data**.

```jsx
// app/meals/loading.js
import classes from './loading.module.css';

export default function MealsLoadingPage() {
  return <p className={classes.loading}>Fetching meals...</p>;
}
```

That's it. No state management. No `isLoading` boolean. No conditional rendering in your page component. Just create the file, export a component, and Next.js handles the rest.

---

## How It Works

1. User navigates to `/meals`
2. Next.js sees that the page component needs to load data (the `await` call)
3. Instead of showing nothing, it immediately renders the content from `loading.js`
4. Once the data arrives, the loading content is **replaced** with the actual page

This works for:
- Initial page loads (when you visit the URL directly)
- Client-side navigations (clicking a `<Link>`)
- Any nested page or layout that's loading

---

## Caching Behavior

You might notice something interesting: if you visit the meals page, go to another page, and come back — the meals appear **instantly**. No loading screen.

That's because Next.js performs **aggressive caching**. Once a page is loaded (including its data), it's cached. Returning to that page serves the cached version. The loading state only appears when:
- You hard-reload the page
- You visit the page for the first time in a session
- The cache has been invalidated

---

## Scope of `loading.js`

The `loading.js` file applies to:
- The `page.js` in the **same directory**
- Any **nested** pages and layouts below it

If you place `loading.js` at the root `app/` level, it covers your entire application. If you place it in `app/meals/`, it only covers the meals page and its nested routes.

---

## ✅ Key Takeaways

- Create a `loading.js` file next to your page to show fallback content during data loading
- It's a **reserved file name** in Next.js — just like `page.js` and `layout.js`
- It applies to sibling and nested pages automatically
- Next.js caches visited pages, so loading states only appear on first/fresh visits

## ⚠️ Common Mistakes

- Placing `loading.js` at the wrong level in the folder hierarchy — be intentional about scope
- Forgetting that `loading.js` replaces the **entire page area**, including content that doesn't depend on data

## 💡 Pro Tip

The `loading.js` approach is a quick win, but it replaces the full page content with the fallback. For more granular control — like showing a header immediately while only the data section loads — use `<Suspense>` boundaries, which we'll explore next.
