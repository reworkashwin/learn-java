# Navigating Between Pages

## Introduction

So you've got multiple pages in your Next.js app. Great! But how do users actually move between them? You could use a plain old `<a>` tag — it works, but it throws away one of the biggest advantages Next.js gives you. Let's understand why and what to use instead.

---

## The Problem with Regular Anchor Tags

You can absolutely use a standard HTML anchor element to navigate:

```jsx
<a href="/about">About Us</a>
```

Click it, and you go to `/about`. Mission accomplished... right?

Not quite. Watch closely: when you click that link, the browser's refresh icon briefly turns into a cross (X). That's a tell-tale sign — the browser is **downloading a brand new page** from the server. You've left the current page entirely.

### Why This Matters

When the browser loads a completely new page, you lose the **single-page application (SPA)** experience. All client-side state is gone. Any JavaScript that was running? Gone. The entire React app unmounts and a fresh one loads.

Think of it like leaving a building to enter the one next door, instead of walking from one room to another inside the same building.

---

## The Best of Both Worlds with Next.js

Here's the beauty of Next.js: it gives you both server-rendered pages **and** a smooth SPA experience.

- **First visit** (typing a URL manually): The page is fully rendered on the server and sent as finished HTML. Great for SEO and initial load time.
- **Subsequent navigation** (clicking links): The content of the next page is pre-rendered on the server, but the **update happens on the client side** using JavaScript. No full page reload.

But you only get this benefit if you use the right tool for navigation.

---

## The `Link` Component from Next.js

Instead of `<a>`, use the `Link` component:

```jsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <p>
      <Link href="/about">About Us</Link>
    </p>
  );
}
```

### What `Link` Does Under the Hood

- Renders a regular `<a>` tag in the browser (so it's fully accessible and SEO-friendly)
- **Intercepts the click** and prevents a full page reload
- Fetches the new page content behind the scenes
- Updates the visible content using client-side JavaScript

The result? The refresh icon **never changes to a cross**. The page transitions are instant. You stay inside the SPA.

### Props You Can Use

The `Link` component accepts all the same props as a regular anchor:

```jsx
<Link href="/about" className="nav-link">About Us</Link>
```

---

## When to Use `Link` vs `<a>`

| Scenario | Use |
|---|---|
| Navigating to another page **within your site** | `Link` from `next/link` |
| Linking to an **external website** | Regular `<a>` tag |

If the destination is internal (part of your Next.js app), always use `Link`. If it's external (another domain), a regular `<a>` tag is perfectly fine.

---

## ✅ Key Takeaways

- Regular `<a>` tags cause a **full page reload**, breaking the SPA experience
- Next.js's `Link` component keeps you inside the single-page application
- Behind the scenes, the next page is still rendered on the server, but the client handles the UI update
- Import `Link` from `next/link` and use `href` just like you would on an anchor tag

## ⚠️ Common Mistakes

- Using `<a>` for internal navigation — works but kills SPA behavior
- Forgetting to import `Link` from `next/link`

## 💡 Pro Tip

Next.js also **prefetches** linked pages in the background when `Link` components become visible in the viewport. So by the time your user clicks, the page content may already be loaded and ready. That's why navigation feels nearly instant.
