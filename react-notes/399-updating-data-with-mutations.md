# Updating Data with Mutations

## Introduction

We can view events, create events, delete events — now let's **update** them. This lecture wires up the "Update" button on the edit page using `useMutation`, connecting the form submission to a PUT request on the backend.

---

## Setting Up the Update Mutation

### ⚙️ The Mutation

```jsx
import { useMutation } from '@tanstack/react-query';
import { updateEvent } from '../util/http.js';

function EditEvent() {
  const params = useParams();
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: updateEvent,
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../'); // navigate immediately — we'll change this approach later
  }
}
```

### 🧠 What's Different Here?

Notice we're navigating **immediately** after calling `mutate`, not inside `onSuccess`. This is intentional — and it's a setup for the next lecture on optimistic updating.

Why would you navigate immediately?
- It gives the user **instant feedback** — the modal closes right away
- But it has a drawback: the underlying page doesn't reflect the update yet

If you navigate without invalidating queries, the details page still shows the **old** cached data. You'd have to reload to see changes.

---

## The updateEvent Function

The `updateEvent` function expects an object with:
- `id` — which event to update
- `event` — the new event data

```js
export async function updateEvent({ id, event }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ event }),
    headers: { 'Content-Type': 'application/json' },
  });
  // ...
}
```

### Passing Data Through mutate

Just like with `createNewEvent`, the data you pass to `mutate()` gets forwarded to the `mutationFn`:

```jsx
mutate({ id: params.id, event: formData });
//       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//       This entire object is passed to updateEvent
```

---

## The Stale Data Problem

After updating and navigating back:
- The mutation succeeded ✅
- But the details page shows **old data** ❌

Why? Because we didn't:
1. Wait for `onSuccess` to invalidate queries
2. Tell React Query the cached data is outdated

We navigated away immediately, skipping all post-mutation cleanup.

This is the perfect segue into **optimistic updating** — a technique where we update the cache instantly without waiting for the server response, and roll back if it fails.

---

## ✅ Key Takeaways

- `useMutation` works the same way for updates as it does for creation — different `mutationFn`, same pattern
- The data shape you pass to `mutate()` must match what your mutation function expects
- Navigating immediately after `mutate()` (without `onSuccess`) gives instant feedback but leaves cached data stale
- Without query invalidation, the UI won't reflect the update until the next natural refetch

## ⚠️ Common Mistakes

- Forgetting to pass the event ID along with the updated data
- Assuming `mutate()` is synchronous — it fires the request but returns immediately
- Not invalidating queries after mutations — always ask "what cached data is now wrong?"

## 💡 Pro Tip

The choice between navigating in `handleSubmit` vs `onSuccess` depends on your UX goal. Immediate navigation = snappy but potentially shows stale data. `onSuccess` navigation = slightly slower but always accurate. Optimistic updating gives you both — and that's what's coming next.
