# Which Kind Of Code Goes Into loader()s?

## Introduction

We've spent a lot of time with loader functions, and they might start to feel like backend code — separate from your components, handling HTTP requests, dealing with responses. But there's a critical distinction you must never forget about where this code actually runs and what you can (and can't) do inside a loader.

---

## Loaders Run in the Browser, Not on a Server

This is the single most important thing to understand:

> **Loader code executes in the browser.** It is client-side code.

Even though it looks decoupled from your React components, even though it handles data fetching in a way that feels "server-ish" — it's still JavaScript running in the user's browser. Nothing about React Router magically moves your code to a server.

---

## What You CAN Use in Loaders

Because loaders run in the browser, you have access to **all browser APIs**:

- **`localStorage`** — read or write cached data
- **`sessionStorage`** — session-scoped storage
- **Cookies** — via `document.cookie`
- **`fetch()`** — make HTTP requests
- **`navigator`** — access device/browser info
- **`window.location`** — URL information
- Any other standard Web API

```jsx
export function loader() {
  const token = localStorage.getItem("authToken");
  // Use the token to make an authenticated request
  return fetch("http://api.example.com/data", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

---

## What You CANNOT Use in Loaders

There's exactly **one major restriction**: you cannot use **React Hooks** inside loaders.

No `useState`, no `useEffect`, no `useContext`, no custom hooks — none of them. Why? Because hooks are designed to work inside React components, and a loader function is **not** a React component. It's just a regular JavaScript function.

```jsx
// ❌ This will NOT work
export function loader() {
  const [data, setData] = useState([]); // ERROR — hooks can't be used here
}
```

---

## ✅ Key Takeaways

- Loader functions run **entirely in the browser** — they are client-side code
- You can use **any browser API** (localStorage, cookies, fetch, etc.)
- You **cannot use React Hooks** — loaders are not React components
- Don't confuse the "separated" feel of loaders with server-side execution

💡 **Pro Tip:** Think of loaders as "component preparation functions." They run before your component mounts, have access to everything the browser offers, but aren't part of the React rendering tree — so hooks are off limits.
