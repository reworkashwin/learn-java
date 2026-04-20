# Navigating Between Pages with Links

## Introduction

Right now, users have to **manually type URLs** in the browser to navigate between pages. That's obviously not how real websites work. We need links. But not just any links — we need links that work **the SPA way**, without triggering full page reloads.

---

## The Problem with Regular Anchor Tags

You might think: "Just use an `<a>` tag!"

```jsx
<a href="/products">Go to Products</a>
```

This works — clicking it navigates to `/products`. But watch the browser's refresh icon carefully. It **flashes** briefly. That's because the browser sends a **new HTTP request** to the server, reloads the entire HTML page, re-downloads all JavaScript, and **restarts the React application from scratch**.

What we lose:
- **Application state** — everything in Redux, Context, or `useState` is gone
- **Performance** — the entire app has to boot up again
- **User experience** — there's a brief blank flash during the reload

This defeats the entire purpose of having a Single Page Application.

---

## The Solution: React Router's `Link` Component

Import `Link` from `react-router-dom` and use it instead of `<a>`:

```jsx
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <>
      <h1>My Home Page</h1>
      <p>Go to <Link to="/products">the list of products</Link></p>
    </>
  );
}
```

### Key Differences from `<a>`:

| Feature | `<a href="...">` | `<Link to="...">` |
|---------|------------------|--------------------|
| Attribute name | `href` | `to` |
| Sends HTTP request | ✅ Yes | ❌ No |
| Reloads React app | ✅ Yes | ❌ No |
| Updates URL | ✅ Yes | ✅ Yes |
| Preserves state | ❌ No | ✅ Yes |

### What `Link` Does Under the Hood

1. Renders a regular `<a>` element in the DOM (so it's still semantically a link)
2. Listens for click events on that element
3. **Prevents the browser's default behavior** (which would send an HTTP request)
4. Changes the URL using the browser's History API
5. Tells React Router to check the new URL and render the matching route

The user sees the URL change and the page content update, but **zero network requests** are made. That's the SPA magic.

---

## Testing the Difference

1. Use a regular `<a href="/products">` — watch the refresh icon flash
2. Switch to `<Link to="/products">` — the refresh icon stays still

Same visual result for the user, but vastly different under the hood.

---

## ✅ Key Takeaways

- Never use `<a href="...">` for internal navigation in a React Router app — it triggers a full page reload
- Use `<Link to="...">` from `react-router-dom` instead — it prevents the default browser behavior
- `Link` renders a real `<a>` tag but intercepts clicks to handle navigation client-side
- The URL changes, the correct component renders, but no HTTP request is sent

## ⚠️ Common Mistakes

- Using `href` with the `Link` component — it uses `to`, not `href`
- Using `<a>` tags for internal links out of habit — always use `Link` for in-app navigation
- Using `Link` for external links (to other websites) — use regular `<a>` tags for external URLs since those should trigger real navigation

## 💡 Pro Tips

- React Router also provides `NavLink`, which works like `Link` but adds CSS classes to indicate the currently active route — perfect for navigation menus
- For programmatic navigation (navigating after a form submission, for example), use the `useNavigate` hook instead of `Link`
