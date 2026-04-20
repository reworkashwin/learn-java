# Using the Query Key As Query Function Input

## Introduction

As our app grows, we start noticing some redundancy — we're passing the same values to both `queryKey` and `queryFn`. React Query has an elegant solution: the query key is automatically passed to the query function, so you can reference it directly inside your function. Let's also add a practical feature — limiting the number of recently added events shown.

---

## The Feature: Limiting Recent Events

### 🧠 The Goal

Instead of showing *all* events under "Recently Added Events," show only the latest 3. The backend supports a `max` query parameter: `GET /events?max=3` returns the 3 most recently added events.

### ⚙️ Updating the HTTP Function

The `fetchEvents` function needs to handle both `searchTerm` and `max` query parameters:

```js
export async function fetchEvents({ signal, searchTerm, max }) {
  let url = 'http://localhost:3000/events';

  if (searchTerm && max) {
    url += '?search=' + searchTerm + '&max=' + max;
  } else if (searchTerm) {
    url += '?search=' + searchTerm;
  } else if (max) {
    url += '?max=' + max;
  }

  const response = await fetch(url, { signal });
  // ...
}
```

---

## The Redundancy Problem

Look at this query setup:

```jsx
const { data } = useQuery({
  queryKey: ['events', { max: 3 }],
  queryFn: ({ signal }) => fetchEvents({ signal, max: 3 }),
});
```

We're passing `max: 3` in **two places** — the key and the function call. That's duplication. If we change it in one place but forget the other, things break silently.

---

## The Solution: Spread the Query Key

React Query passes the full `queryKey` as part of the object your query function receives. You can use it:

```jsx
const { data } = useQuery({
  queryKey: ['events', { max: 3 }],
  queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
});
```

### What's happening?

1. `queryKey` is `['events', { max: 3 }]`
2. `queryKey[1]` is `{ max: 3 }` — the second element in the array
3. `...queryKey[1]` spreads it into the object: `{ signal, max: 3 }`
4. `fetchEvents` receives exactly what it needs

Now the `max` value lives in **one place** — the query key — and is automatically forwarded to the function.

### Applying the Same Pattern to Search

```jsx
// In FindEventsSection:
const { data } = useQuery({
  queryKey: ['events', { searchTerm }],
  queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
});
```

Same pattern, different data. One source of truth for the query parameters.

---

## ✅ Key Takeaways

- The `queryFn` automatically receives `queryKey` alongside `signal`
- Use `queryKey[index]` to access specific elements of your key array
- Spread operator (`...queryKey[1]`) is the cleanest way to forward key data to your function
- This eliminates duplication between `queryKey` and `queryFn` parameters

## ⚠️ Common Mistakes

- Forgetting that `queryKey` is an **array** — access elements by index
- Using string keys instead of object keys for complex parameters — objects are easier to spread
- Inconsistent naming between query key properties and function parameters — they must match

## 💡 Pro Tip

Think of the query key as the **single source of truth** for "what data does this query represent?" By deriving the function input *from* the key, you ensure they can never get out of sync. Your query key already describes the data — let it describe the request too.
