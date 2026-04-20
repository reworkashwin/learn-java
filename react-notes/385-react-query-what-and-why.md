# React Query: What & Why?

## Introduction

Before writing a single line of TanStack Query code, let's really understand **what problem it solves** and **why it's worth adding to your project**. Because you already know how to fetch data with `useEffect` — so what's the point?

---

## The Traditional Approach: useEffect + fetch

Here's what data fetching typically looks like without TanStack Query:

```jsx
function EventsSection() {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/events');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err);
      }
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  return <EventList events={data} />;
}
```

This works. But look at how much code it takes **just to fetch some data**:
- Three separate state variables (`data`, `isLoading`, `error`)
- A `useEffect` hook with an async function inside
- Manual state updates at every step
- All of this repeated in **every component** that fetches data

### "But I Could Build a Custom Hook!"

True — you could extract this into a `useFetch` or `useHttp` hook. That would reduce repetition. But you'd still be missing features that are hard to build yourself.

---

## What's Missing from the DIY Approach?

### 1. Background Refetching

When a user switches tabs and comes back, the data might be stale. Ideally, you'd refetch it automatically. With `useEffect`? You'd need to add visibility change event listeners, manage when to refetch... it gets complex fast.

### 2. Caching

If a user visits a page, navigates away, then comes back — why fetch the same data again? With `useEffect`, you fetch every single time. TanStack Query **caches** responses and reuses them instantly while fetching fresh data in the background.

### 3. Request Deduplication

If two components need the same data and both use `useEffect`, you get **two identical requests**. TanStack Query deduplicates them automatically.

### 4. Optimistic Updates

Want the UI to update immediately when a user submits a form, before the server responds? That's optimistic updating — and it's very tricky to implement from scratch.

### 5. Automatic Retry

If a request fails due to a network glitch, TanStack Query can retry automatically.

---

## What TanStack Query Does

TanStack Query doesn't replace `fetch` or `axios`. It doesn't send requests for you. Instead, it **manages** the request lifecycle:

- You provide a function that sends the request
- TanStack Query calls that function at the right times
- It manages caching, loading states, error states, and refetching
- It gives you clean, minimal APIs to work with

Think of it as a smart orchestrator. You're the musician (you play the fetch function), and TanStack Query is the conductor (it tells you when to play, manages the tempo, and keeps everything in sync).

---

## ⚠️ Common Mistakes

- Thinking TanStack Query replaces fetch/axios — it doesn't; it wraps around them
- Not recognizing when an app is complex enough to benefit from it
- Over-engineering with custom hooks when TanStack Query could handle it

## 💡 Pro Tip

If your app has more than 2–3 components that fetch data, TanStack Query is almost certainly worth the small learning investment. The code reduction alone is significant.

## ✅ Key Takeaways

- `useEffect` + `fetch` works but requires lots of boilerplate
- TanStack Query adds: caching, background refetching, deduplication, optimistic updates
- It manages **when** to fetch, not **how** — you still write the fetch function
- It dramatically simplifies data-fetching code in React applications
