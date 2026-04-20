# Installing & Using TanStack Query — And Seeing Why It's Great!

## Introduction

Time to get our hands dirty. Let's install TanStack Query, replace our `useEffect`-based fetching code, and see firsthand how much simpler things become.

---

## Step 1: Installation

```bash
npm install @tanstack/react-query
```

Make sure you get **version 5** (check `package.json` after installing). If you need version 5 specifically during beta periods, you can use:

```bash
npm install @tanstack/react-query@beta
```

---

## Step 2: Extract the Fetch Function

Before using TanStack Query, extract your data-fetching logic into a separate utility file. This keeps things clean and reusable:

```js
// src/util/http.js
export async function fetchEvents() {
  const response = await fetch('http://localhost:3000/events');
  if (!response.ok) {
    const error = new Error('An error occurred');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  const { events } = await response.json();
  return events;
}
```

The key requirement: your function must **return a promise** and **throw errors** for non-OK responses.

---

## Step 3: Use `useQuery` in Your Component

Replace all the state management and `useEffect` code with a single `useQuery` call:

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../util/http.js';

function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryFn: fetchEvents,
    queryKey: ['events'],
  });

  if (isPending) return <LoadingIndicator />;
  if (isError) return <ErrorBlock message={error.info?.message || 'Failed to fetch events.'} />;
  return <EventList events={data} />;
}
```

Look at that. Three state variables, a `useEffect` hook, and an async function — all replaced by one `useQuery` call.

### The Configuration Object

`useQuery` takes an object with two essential properties:

**`queryFn`** — The function that sends the request. TanStack Query doesn't care how you fetch data; it just needs a function that returns a promise. Use `fetch`, `axios`, anything.

**`queryKey`** — A unique identifier for this query. It's an **array** (which can contain strings, numbers, objects, etc.). TanStack Query uses this key to:
- Cache the response data
- Deduplicate identical queries
- Match invalidation requests

### What `useQuery` Returns

The returned object has many useful properties:

| Property | Description |
|----------|-------------|
| `data` | The resolved response data |
| `isPending` | `true` while the request is in-flight |
| `isError` | `true` if the request failed |
| `error` | The error object (if the request failed) |
| `refetch` | A function to manually re-trigger the query |

---

## Step 4: Set Up the QueryClientProvider

TanStack Query requires a **provider** wrapping your app:

```jsx
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

Without this, you'll get an error: *"No QueryClient set, use QueryClientProvider to set one."*

The `QueryClient` is a central configuration and cache manager. You create it once and pass it to the provider.

---

## The Automatic Refetching Bonus

Here's where TanStack Query starts showing its magic. Without any extra code:

- Switch to another browser tab, then come back → **data refetches automatically**
- If the backend data changed while you were away, the UI updates silently

With `useEffect`? You'd need event listeners, manual refetch logic, and state management to achieve this. With TanStack Query, it's built in.

---

## ⚠️ Common Mistakes

- Forgetting to wrap your app with `QueryClientProvider`
- Not throwing errors in your fetch function for non-OK responses (TanStack Query won't know something went wrong)
- Using `queryKey: 'events'` instead of `queryKey: ['events']` — it must be an array

## 💡 Pro Tip

Keep your fetch functions in a separate `util/http.js` file. This separates **how** you fetch from **where** you use the data, making your code cleaner and your fetch functions reusable.

## ✅ Key Takeaways

- Install with `npm install @tanstack/react-query`
- Use `useQuery({ queryFn, queryKey })` to fetch data
- `queryFn` is your fetch function; `queryKey` is a unique array identifier
- Wrap your app with `QueryClientProvider` and a `QueryClient` instance
- TanStack Query handles loading states, errors, caching, and refetching automatically
