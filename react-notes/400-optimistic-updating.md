# Optimistic Updating

## Introduction

This is one of the most sophisticated patterns in React Query — and one of the most satisfying for users. **Optimistic updating** means updating the UI *immediately* when the user makes a change, without waiting for the server to confirm. If the server later says "that didn't work," you roll back to the previous state.

The result? Instant, responsive UI that feels like a native app.

---

## The Three Pillars of Optimistic Updating

Optimistic updating with React Query involves three key callbacks on `useMutation`:

1. **`onMutate`** — Runs *before* the mutation completes. Update the cache here.
2. **`onError`** — Runs if the mutation fails. Roll back the cache here.
3. **`onSettled`** — Runs when the mutation finishes (success or failure). Sync with the server here.

---

## Step 1: onMutate — Update the Cache Immediately

```jsx
const { mutate } = useMutation({
  mutationFn: updateEvent,
  onMutate: async (data) => {
    const newEvent = data.event;

    // Cancel any in-flight queries for this event
    await queryClient.cancelQueries({ queryKey: ['events', params.id] });

    // Save the current data for rollback
    const previousEvent = queryClient.getQueryData(['events', params.id]);

    // Optimistically set the new data
    queryClient.setQueryData(['events', params.id], newEvent);

    // Return context for the onError callback
    return { previousEvent };
  },
});
```

### What's happening here?

1. **Cancel ongoing queries** — If React Query is currently fetching this event, cancel it. Otherwise the old data from that fetch could overwrite our optimistic update.

2. **Save old data** — `getQueryData` retrieves what's currently cached. We need this for rollback.

3. **Set new data** — `setQueryData` directly modifies the cache *without* making a network request. The UI updates instantly.

4. **Return context** — Whatever you return from `onMutate` becomes the `context` parameter in `onError`.

### ❓ Why does onMutate receive the mutation data?

React Query passes whatever you gave to `mutate()` into `onMutate`. So `data` here is `{ id: params.id, event: formData }` — the same object you passed when calling `mutate`.

---

## Step 2: onError — Roll Back if It Fails

```jsx
onError: (error, data, context) => {
  queryClient.setQueryData(['events', params.id], context.previousEvent);
},
```

If the server returns an error, we simply set the cache back to `previousEvent` — the data we saved in `onMutate`. The UI snaps back to the original state.

The three parameters `onError` receives:
- `error` — The error object
- `data` — The data that was submitted to the mutation
- `context` — Whatever was returned from `onMutate` (our `{ previousEvent }`)

---

## Step 3: onSettled — Ensure Consistency

```jsx
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['events', params.id] });
},
```

`onSettled` fires **regardless** of success or failure. It's your safety net:

> "No matter what happened, make sure the cache matches the server."

This triggers a background refetch to ensure frontend and backend are in sync.

---

## The Complete Pattern

```jsx
const { mutate } = useMutation({
  mutationFn: updateEvent,
  onMutate: async (data) => {
    const newEvent = data.event;
    await queryClient.cancelQueries({ queryKey: ['events', params.id] });
    const previousEvent = queryClient.getQueryData(['events', params.id]);
    queryClient.setQueryData(['events', params.id], newEvent);
    return { previousEvent };
  },
  onError: (error, data, context) => {
    queryClient.setQueryData(['events', params.id], context.previousEvent);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['events', params.id] });
  },
});
```

---

## Seeing It In Action

- Edit an event → the change is **instantly** reflected on the details page
- If the backend rejects the change (e.g., empty title), the UI **rolls back** automatically
- After everything settles, React Query refetches to confirm consistency

---

## ✅ Key Takeaways

- **`onMutate`** = update the cache before the server responds (optimistic)
- **`onError`** = roll back if the server says "no"
- **`onSettled`** = sync with the server no matter what
- Use `cancelQueries` to prevent in-flight fetches from overwriting your optimistic data
- Use `getQueryData` to save a snapshot for rollback
- Use `setQueryData` to directly modify the cache

## ⚠️ Common Mistakes

- Forgetting `cancelQueries` — an in-flight fetch can overwrite your optimistic update with stale data
- Not returning context from `onMutate` — `onError` won't have the data needed for rollback
- Skipping `onSettled` — your cache might be out of sync with the server permanently

## 💡 Pro Tip

Optimistic updating works best for operations that **usually succeed**. If your mutation has a high failure rate, the constant rollbacks will create a jarring user experience. Use `onSuccess` + `invalidateQueries` instead for unreliable operations.
