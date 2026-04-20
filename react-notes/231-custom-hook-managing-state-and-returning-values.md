# Custom Hook: Managing State & Returning State Values

## Introduction

Our `useFetch` hook can call a fetch function inside `useEffect`, but it's not very useful yet. It doesn't manage any state, and it doesn't return anything to the component that uses it. Let's fix that by adding `useState` for loading, error, and data — and then returning those values so components can use them.

---

## Adding State to the Custom Hook

Every component that uses our hook needs three pieces of information:

1. **Is the data loading?** → `isFetching`
2. **Did something go wrong?** → `error`
3. **What's the actual data?** → `fetchedData`

```js
import { useState, useEffect } from "react";

export function useFetch(fetchFn, initialValue) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();
  const [fetchedData, setFetchedData] = useState(initialValue);

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const data = await fetchFn();
        setFetchedData(data);
      } catch (error) {
        setError({ message: error.message || "Failed to fetch data." });
      }
      setIsFetching(false);
    }
    fetchData();
  }, [fetchFn]);

  return { isFetching, fetchedData, error };
}
```

### Why use generic names like `fetchedData` instead of `userPlaces`?

Because this hook is meant to be reusable. It shouldn't know or care about what kind of data is being fetched. That's the caller's concern.

### Why accept an `initialValue` parameter?

Different components need different initial values. The `App` component might want an empty array `[]` (because it expects a list of places). Another component might want `null` or `undefined`. By accepting this as a parameter, the hook stays flexible.

---

## Returning Values from a Custom Hook

Just like any JavaScript function, a custom hook can `return` values. And just like `useState` returns an array `[value, setter]`, your hook can return whatever structure makes sense:

```js
// Return an object (named access)
return { isFetching, fetchedData, error };

// Or return an array (positional access)
return [isFetching, fetchedData, error];
```

Objects are often preferred for custom hooks because the caller can destructure only what they need, and the names are self-documenting.

---

## Using the Custom Hook in a Component

Back in `App.jsx`, replace all the manual state + `useEffect` code with a single hook call:

```jsx
import { useFetch } from "./hooks/useFetch";
import { fetchUserPlaces } from "./http";

function App() {
  const {
    isFetching,
    error,
    fetchedData: userPlaces,  // alias for clarity
  } = useFetch(fetchUserPlaces, []);

  // ... rest of the component
}
```

That's it. One line replaces three `useState` calls and a `useEffect` block.

### What does `fetchedData: userPlaces` do?

It's **object destructuring with an alias**. We extract the `fetchedData` property but assign it to a local variable named `userPlaces`. This way, the rest of the component can still use the familiar `userPlaces` name.

---

## The Magic: State Belongs to the Component

Here's the key insight that makes custom hooks work:

> When you use a custom hook in a component, the **state managed by that hook belongs to that component**.

If `useFetch` calls `setIsFetching(true)`, the component that uses `useFetch` **re-renders**. It behaves exactly as if `useState` was called directly inside the component. The custom hook is just an organizational layer — it doesn't create a separate "state universe."

---

## ✅ Key Takeaways

- Custom hooks can manage state with `useState` — that state belongs to the calling component
- Return values from custom hooks using objects (preferred) or arrays
- Accept parameters like `initialValue` to make hooks flexible
- Use destructuring with aliases (`fetchedData: userPlaces`) for cleaner component code

## ⚠️ Common Mistakes

- Forgetting to provide an `initialValue` — leads to `undefined` errors when the component tries to use the data before it's fetched (e.g., calling `.length` on `undefined`)
- Thinking state updates in a custom hook won't re-render the component — they absolutely will

## 💡 Pro Tip

The pattern of returning `{ data, isLoading, error }` from a custom hook is so universal that libraries like React Query (TanStack Query) and SWR are essentially production-grade versions of this exact pattern.
