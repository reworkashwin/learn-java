# React Query & React Router

## Introduction

This is a power-user lecture. If you've worked through the React Router section and understand **loaders** and **actions**, this shows you how to combine them with React Query for the best of both worlds: React Router's pre-fetching + React Query's caching and background updates.

If you haven't covered React Router's data loading features yet, skip this and come back later.

---

## Using React Router Loaders with React Query

### 🧠 The Idea

React Router loaders let you fetch data **before** a route component renders — so the user never sees a loading spinner. React Query gives you **caching, background refetching, and stale management**. Combined, you get instant page loads with smart caching.

### ⚙️ Setting Up the Loader

```jsx
// EditEvent.jsx
import { queryClient, fetchEvent } from '../util/http.js';

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    queryKey: ['events', params.id],
  });
}
```

**`queryClient.fetchQuery`** is the programmatic equivalent of `useQuery` — it can be called outside of components. It:
- Sends the request
- Stores the result in React Query's cache
- Returns a promise (which React Router awaits)

### Connecting to the Route

```jsx
// App.jsx
import EditEvent, { loader as editEventLoader } from './components/EditEvent';

<Route path=":id/edit" element={<EditEvent />} loader={editEventLoader} />
```

### Keep useQuery in the Component!

Here's the critical insight — **don't remove `useQuery`** from the component:

```jsx
function EditEvent() {
  const { data, isError, error } = useQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    queryKey: ['events', params.id],
  });
  // ...
}
```

Why keep both? Because:
- The **loader** pre-fetches and populates the cache
- **`useQuery`** reads from that cache (instant!) and continues managing background refetches, staleness, and re-renders

You get loader speed + React Query intelligence.

---

## Using React Router Actions with React Query

### ⚙️ Setting Up the Action

Actions handle form submissions in React Router:

```jsx
export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);

  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries({ queryKey: ['events'] });

  return redirect('../');
}
```

### Submitting the Form Programmatically

Replace `mutate` with React Router's `useSubmit`:

```jsx
import { useSubmit } from 'react-router-dom';

function EditEvent() {
  const submit = useSubmit();

  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });
  }
}
```

This triggers the `action` function — no `useMutation` needed.

### Showing Loading State with useNavigation

```jsx
import { useNavigation } from 'react-router-dom';

const { state } = useNavigation();

// In JSX:
{state === 'submitting' ? (
  <p>Sending data...</p>
) : (
  <>
    <button type="button">Cancel</button>
    <button type="submit">Update</button>
  </>
)}
```

---

## Avoiding Redundant Requests with staleTime

When using both a loader and `useQuery` with the same key, React Query sends **two requests**: one from the loader and one background refetch from `useQuery`.

Fix this with `staleTime`:

```jsx
const { data } = useQuery({
  queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  queryKey: ['events', params.id],
  staleTime: 10000, // Data is "fresh" for 10 seconds
});
```

If the cached data is less than 10 seconds old, `useQuery` won't trigger a background refetch.

---

## Global Fetching Indicator with useIsFetching

Show a progress bar whenever React Query is fetching *anywhere* in the app:

```jsx
import { useIsFetching } from '@tanstack/react-query';

function Header() {
  const fetching = useIsFetching();

  return (
    <header>
      {fetching > 0 && <progress />}
      {/* ... */}
    </header>
  );
}
```

`useIsFetching` returns a number — 0 if idle, higher if queries are active. Simple and powerful.

---

## ✅ Key Takeaways

- **Loaders** pre-fetch data before rendering → no loading spinners
- **`queryClient.fetchQuery`** populates the cache from outside components
- Keep `useQuery` in components even with loaders — for caching, refetching, and reactivity
- **Actions** replace `useMutation` when using React Router's form handling
- `staleTime` prevents redundant requests when loader + `useQuery` share a key
- `useIsFetching` provides a global loading indicator for all React Query activity

## ⚠️ Common Mistakes

- Removing `useQuery` from the component after adding a loader — you lose React Query's ongoing management
- Forgetting `staleTime` when combining loaders and queries — causes duplicate requests
- Thinking `submit()` sends an HTTP request — it doesn't; it triggers the client-side action function

## 💡 Pro Tip

The loader + React Query combo is ideal for **critical data** that should never show a loading spinner. Use loaders for the main content, and keep `useQuery` alone for supplementary data (like image lists) where a brief spinner is acceptable.
