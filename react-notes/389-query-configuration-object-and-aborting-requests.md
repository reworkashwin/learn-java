# The Query Configuration Object & Aborting Requests

## Introduction

When you assign a function to `queryFn`, TanStack Query doesn't just call it blindly — it passes a **configuration object** with useful data. Understanding this object unlocks proper request abortion and cleaner code patterns.

---

## What TanStack Query Passes to Your Query Function

When TanStack Query calls your `queryFn`, it automatically passes an object containing:

```js
{
  queryKey: ['events', { search: 'city' }],  // The key you defined
  signal: AbortSignal,                        // For cancelling requests
  meta: undefined                             // Optional metadata
}
```

### The `signal` — Aborting Requests

The `signal` is an `AbortSignal` that TanStack Query uses to **cancel requests** that are no longer needed. For example:
- The user navigates away before the request completes
- A new request supersedes the current one (like typing a new search term)

To make this work, pass the `signal` to the browser's `fetch` function:

```js
export async function fetchEvents({ signal, searchTerm }) {
  let url = 'http://localhost:3000/events';
  if (searchTerm) {
    url += '?search=' + searchTerm;
  }
  
  const response = await fetch(url, { signal }); // ← Pass signal here
  // ...
}
```

Now if TanStack Query decides to abort the request, the browser will actually cancel the network request — saving bandwidth and preventing stale responses from overwriting fresh data.

---

## Two Patterns for Setting `queryFn`

### Pattern 1: Direct Assignment (No Custom Data)

When you don't need to pass extra parameters:

```jsx
useQuery({
  queryFn: fetchEvents,  // TanStack Query's object is passed directly
  queryKey: ['events'],
});
```

Your function receives TanStack Query's default object (`{ signal, queryKey, ... }`).

### Pattern 2: Wrapper Function (Custom Data Needed)

When you need to pass your own data alongside TanStack Query's:

```jsx
useQuery({
  queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
  queryKey: ['events', { search: searchTerm }],
});
```

Here you:
1. Accept TanStack Query's object in the anonymous function
2. Destructure `signal` from it
3. Forward `signal` plus your custom `searchTerm` to your fetch function

---

## The Bug: Default Object as Search Term

If you use Pattern 1 (direct assignment) but your fetch function expects a search term:

```jsx
// In NewEventsSection — no search term needed
queryFn: fetchEvents, // Works fine — TanStack Query passes { signal, queryKey }
```

But if `fetchEvents` tries to use the first argument as a search term, it gets TanStack Query's object instead — resulting in `[object Object]` in the URL.

### The Fix

Destructure properly in your fetch function:

```js
export async function fetchEvents({ signal, searchTerm }) {
  // signal comes from TanStack Query
  // searchTerm comes from your wrapper function (or is undefined if not passed)
}
```

When called with Pattern 1, `searchTerm` is simply `undefined` (since TanStack Query's object doesn't have that property), and your URL-building logic handles it gracefully.

---

## ⚠️ Common Mistakes

- Not passing `signal` to `fetch` — requests won't be cancelled when they should be
- Assuming your function receives nothing from TanStack Query (it always passes an object)
- Not handling the case where custom parameters might be undefined

## 💡 Pro Tip

Always destructure the TanStack Query object and explicitly list what you expect. This prevents confusion between what TanStack Query provides and what your code provides:

```js
export async function fetchEvents({ signal, searchTerm }) { ... }
```

## ✅ Key Takeaways

- TanStack Query passes `{ signal, queryKey }` to every query function
- Pass `signal` to `fetch()` to enable request abort/cancellation
- Use direct function assignment when no custom data is needed
- Wrap in an anonymous function when you need to forward custom parameters
- Always handle the case where custom parameters might be undefined
