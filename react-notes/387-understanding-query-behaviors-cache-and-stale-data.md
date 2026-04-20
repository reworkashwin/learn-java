# Understanding & Configuring Query Behaviors — Cache & Stale Data

## Introduction

Caching is arguably **the most important feature** of TanStack Query. It's what makes your app feel instant — users see data immediately instead of staring at loading spinners. But how does it work, and how do you control it? Let's dig in.

---

## How Caching Works

### The Two-Step Dance

When TanStack Query encounters a `useQuery` call, it follows this logic:

1. **Check the cache** — Is there cached data for this `queryKey`?
   - **Yes** → Return the cached data **immediately**. Also send a background request to check for updates.
   - **No** → Show loading state. Send the request. Cache the response when it arrives.

2. **Background refetch** — Even when cached data exists, a new request is sent behind the scenes. If the response is different from the cached data, the UI updates silently.

This is the "best of both worlds" approach:
- Users see data **instantly** (from cache)
- Data stays **fresh** (from background refetch)

### Seeing It in Action

Navigate to a page, then go somewhere else, then come back:
- **Without TanStack Query**: Loading spinner → fetch → data appears
- **With TanStack Query**: Data appears **instantly** (from cache) → background refetch happens silently

Even with slow networks (try throttling in DevTools), cached data appears immediately. Only images and other non-cached assets need to load again.

---

## Controlling Cache Behavior

### `staleTime` — When to Refetch?

`staleTime` controls how long cached data is considered "fresh." While data is fresh, no background refetch is sent.

```jsx
useQuery({
  queryFn: fetchEvents,
  queryKey: ['events'],
  staleTime: 5000, // 5 seconds
});
```

| Value | Behavior |
|-------|----------|
| `0` (default) | Always refetch in background when component renders |
| `5000` | Don't refetch if data was fetched less than 5 seconds ago |
| `Infinity` | Never refetch (data stays cached until invalidated manually) |

**Example**: If you set `staleTime: 5000` and navigate away and back within 5 seconds, no new request is sent. After 5 seconds, a background refetch happens.

### `gcTime` — How Long to Keep Cached Data?

`gcTime` (Garbage Collection Time) controls how long data stays in the cache **after it's no longer being used** (no component is subscribed to it).

```jsx
useQuery({
  queryFn: fetchEvents,
  queryKey: ['events'],
  gcTime: 300000, // 5 minutes (default)
});
```

| Value | Behavior |
|-------|----------|
| `300000` (default) | Keep data for 5 minutes after last use |
| `30000` | Keep data for 30 seconds |
| `1000` | Keep data for 1 second (almost no caching) |
| `Infinity` | Never garbage collect |

**What happens when cache expires?** If a component needs the data again after `gcTime` has passed, it's back to square one — loading spinner, fresh request, waiting for response. The data was thrown away.

---

## Practical Guidance

### When to Increase `staleTime`

- Data that changes rarely (user profile, app settings)
- Expensive queries that you don't want to repeat often
- Data that a user views repeatedly in quick succession

### When to Keep `staleTime` at 0

- Data that changes frequently (live feeds, dashboards)
- Data where freshness is critical (e-commerce inventory, pricing)

### When to Adjust `gcTime`

- Increase it for data that users navigate to repeatedly
- Decrease it if you're worried about memory usage in long sessions

---

## ⚠️ Common Mistakes

- Confusing `staleTime` and `gcTime` — stale time controls **when to refetch**, gc time controls **when to discard**
- Setting `gcTime` too low and losing the instant-load benefit
- Not understanding that `staleTime: 0` still uses the cache — it just also sends a background request

## 💡 Pro Tip

Think of it this way:
- **`staleTime`** = "How long can I show old data without checking for new data?"
- **`gcTime`** = "How long should I keep data in memory after no one's looking at it?"

## ✅ Key Takeaways

- TanStack Query caches responses and serves them instantly on repeat visits
- Background refetches keep cached data up-to-date without loading spinners
- `staleTime` controls how often background refetches happen (default: 0)
- `gcTime` controls how long cached data is kept in memory (default: 5 minutes)
- The combination of instant cache + background refetch creates a smooth user experience
