# Acting on Mutation Success & Invalidating Queries

## Introduction

Our mutation works — events are created on the backend. But the UI just... sits there. No navigation, no updated event list. We need two things:

1. **Navigate away** after a successful mutation
2. **Tell React Query** that the cached event data is now stale and needs to be refetched

This is where `onSuccess` and `invalidateQueries` come in — two of the most important patterns in React Query.

---

## Navigating After Success with onSuccess

### ❓ Why not navigate immediately in handleSubmit?

You *could* call `navigate('/events')` right in `handleSubmit`, but that creates a problem:

```jsx
function handleSubmit(formData) {
  mutate({ event: formData });
  navigate('/events'); // ❌ This runs immediately, even if mutation fails!
}
```

If the mutation fails and you've already navigated away, the user never sees the error message. Bad UX.

### ⚙️ The onSuccess approach

Instead, use the `onSuccess` callback in the mutation config:

```jsx
const { mutate } = useMutation({
  mutationFn: createNewEvent,
  onSuccess: () => {
    // Only runs if mutation succeeded
    navigate('/events');
  },
});
```

Now navigation only happens **after** a confirmed success. If the mutation fails, you stay on the page and the error message is displayed.

---

## Invalidating Queries

### 🧠 The Problem

Even after creating an event and navigating back, the new event doesn't appear in the list. Why? Because React Query is still using **cached data** — it doesn't know the data changed.

You have to explicitly tell React Query: "Hey, this data is outdated. Go fetch it again."

### ⚙️ How invalidateQueries Works

```jsx
import { queryClient } from '../util/http.js';

// Inside onSuccess:
queryClient.invalidateQueries({ queryKey: ['events'] });
navigate('/events');
```

`invalidateQueries` does two things:
1. **Marks** all matching queries as stale
2. **Triggers an immediate refetch** for any queries that belong to currently visible components

### 🧪 Query Key Matching

Here's something crucial — `invalidateQueries` uses **fuzzy matching** by default:

```jsx
queryClient.invalidateQueries({ queryKey: ['events'] });
```

This invalidates **any** query whose key **includes** `'events'`:
- `['events']` ✅
- `['events', { searchTerm: 'react' }]` ✅
- `['events', 'abc123']` ✅

This is usually what you want! If you added a new event, ALL event-related queries should refetch.

If you only want to invalidate an **exact** key match:

```jsx
queryClient.invalidateQueries({ queryKey: ['events'], exact: true });
```

---

## Sharing the QueryClient

To use `queryClient` outside of components, you need to make it importable. Move it to a shared file:

```js
// util/http.js
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();
```

Then import it wherever needed — in `App.jsx` for the provider, and in mutation files for invalidation.

---

## ✅ Key Takeaways

- Use **`onSuccess`** to run code only after a mutation succeeds — perfect for navigation
- Use **`queryClient.invalidateQueries()`** to mark cached data as stale and trigger refetches
- Query key matching is **fuzzy** by default — `['events']` invalidates any key containing `'events'`
- Export your `queryClient` from a shared module so both provider and mutation logic can use it

## ⚠️ Common Mistakes

- Navigating away in `handleSubmit` instead of `onSuccess` — you'll miss error messages
- Forgetting to invalidate queries after mutations — your UI will show stale data
- Using `exact: true` when you actually want all related queries to refresh

## 💡 Pro Tip

Think of `invalidateQueries` as saying "this data might be wrong now — go check." It's the bridge between mutations and queries. Every time you change something on the backend with a mutation, ask yourself: "Which queries are now stale?"
