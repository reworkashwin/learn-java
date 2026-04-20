# Disabling Automatic Refetching After Invalidations

## Introduction

Here's a subtle but important gotcha: when you invalidate queries and then navigate away, React Query might try to refetch data for the **page you're leaving**, causing unnecessary (and sometimes failing) requests. Let's understand why and how to fix it.

---

## The Problem

When we delete an event from the details page and call:

```jsx
queryClient.invalidateQueries({ queryKey: ['events'] });
```

React Query invalidates **all** event-related queries. But here's the thing — we're still on the event details page when this runs. That page has its own `useQuery` with a key like `['events', 'abc123']`.

Since the component is still mounted, React Query immediately tries to refetch that specific event. But we just deleted it! The backend returns a 404, and we see a failing request in the Network tab.

---

## The Fix: refetchType: 'none'

```jsx
queryClient.invalidateQueries({
  queryKey: ['events'],
  refetchType: 'none',
});
```

### 🧠 What does refetchType: 'none' do?

By default, `invalidateQueries` does two things:
1. **Marks** queries as stale
2. **Immediately refetches** any matching queries for currently rendered components

Setting `refetchType: 'none'` tells React Query:

> "Mark these queries as stale, but **don't** refetch them right now. Just let them refetch naturally the next time they're needed."

### ⚙️ How It Plays Out

1. User clicks Delete on the event details page
2. Mutation sends DELETE request → succeeds
3. `invalidateQueries` marks all event queries as stale (but doesn't refetch)
4. User is navigated to `/events` (the all-events page)
5. The all-events page component renders → its queries are stale → React Query refetches them
6. The now-deleted event details query? It's stale but its component isn't rendered anymore, so no refetch happens

No 404 error. Clean behavior.

---

## ✅ Key Takeaways

- `invalidateQueries` by default **immediately refetches** queries for visible components
- When navigating away after a mutation, this can cause unwanted refetches on the page you're leaving
- Use `refetchType: 'none'` to mark as stale without triggering immediate refetches
- Queries will naturally refetch when their component renders again

## ⚠️ Common Mistakes

- Ignoring 404 errors in the Network tab after deletions — they're a sign of unnecessary refetches
- Using `refetchType: 'none'` everywhere — only use it when you know you're about to navigate away from the component that owns the query

## 💡 Pro Tip

Think of `refetchType: 'none'` as a "lazy invalidation." The data is marked outdated, but React Query waits until someone actually *needs* it before fetching again. This is exactly what you want after deletions where the source data no longer exists.
