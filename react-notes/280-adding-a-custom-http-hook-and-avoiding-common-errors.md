# Adding a Custom HTTP Hook & Avoiding Common Errors

## Introduction

This is one of the most educational lessons in the entire course — not because the final code is complex, but because of the **journey of debugging** along the way. We build a custom `useHttp` hook that handles GET and POST requests with loading, error, and data states. Along the way, we encounter and fix five separate bugs, each teaching a critical lesson about React's reactivity model.

---

## Why a Custom Hook?

Both the Meals component (GET) and Checkout component (POST) need to:
1. Send an HTTP request
2. Track loading state
3. Handle errors
4. Store the response data

That's the same stateful logic in two places. A regular helper function won't work because it can't trigger component re-renders — only hooks can manage state.

---

## The Helper Function: `sendHttpRequest`

First, a non-hook utility that wraps `fetch`:

```jsx
async function sendHttpRequest(url, config) {
  const response = await fetch(url, config);
  const resData = await response.json();

  if (!response.ok) {
    throw new Error(
      resData.message || 'Something went wrong, failed to send request.'
    );
  }

  return resData;
}
```

This extracts the response data *before* checking for errors, because even error responses often contain useful messages from the backend.

---

## The Custom Hook: `useHttp`

```jsx
import { useState, useEffect, useCallback } from 'react';

export default function useHttp(url, config, initialData) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const sendRequest = useCallback(
    async function sendRequest(data) {
      setIsLoading(true);
      try {
        const resData = await sendHttpRequest(url, {
          ...config,
          body: data,
        });
        setData(resData);
      } catch (error) {
        setError(error.message || 'Something went wrong!');
      }
      setIsLoading(false);
    },
    [url, config]
  );

  useEffect(() => {
    if (!config || config.method === 'GET' || !config.method) {
      sendRequest();
    }
  }, [sendRequest, config]);

  return { data, isLoading, error, sendRequest };
}
```

---

## The Five Bugs (And Their Lessons)

### Bug 1: "Cannot read properties of undefined (calling map)"

**Cause:** `data` starts as `undefined` (default `useState`). The Meals component tries to `map` over it before the request completes.

**Fix:** Accept `initialData` as a third parameter to `useHttp`, and pass `[]` from the Meals component:

```jsx
const { data: loadedMeals } = useHttp(url, requestConfig, []);
```

### Bug 2: No request sent at all

**Cause:** The config object is `{}` (empty). The hook checks `config.method === 'GET'`, but method is `undefined`.

**Fix:** Add a check for `!config.method` — treat missing method as GET:

```jsx
if (!config || config.method === 'GET' || !config.method) {
  sendRequest();
}
```

### Bug 3: Data is a Promise object, not the actual data

**Cause:** `sendHttpRequest` is async and returns a Promise. Without `await`, we store the Promise itself.

**Fix:** Add `await` before calling `sendHttpRequest`:

```jsx
const resData = await sendHttpRequest(url, config);
```

### Bug 4: Infinite loop of requests

**Cause:** The config object is created *inside* the component function:

```jsx
// BAD - creates a new object every render
function Meals() {
  const { data } = useHttp(url, {}, []);
}
```

Every render creates a new object → `config` dependency changes → `useCallback` recreates `sendRequest` → useEffect fires → state updates → component re-renders → repeat forever.

**Fix:** Create the config *outside* the component:

```jsx
const requestConfig = {};

function Meals() {
  const { data } = useHttp(url, requestConfig, []);
}
```

### Bug 5: Missing `await` in the `sendRequest` function (from the hook)

This was the Promise bug — the async chain must be complete all the way through.

---

## Using the Hook in the Meals Component

```jsx
const requestConfig = {}; // Outside component!

export default function Meals() {
  const { data: loadedMeals, isLoading, error } = useHttp(
    'http://localhost:3000/meals',
    requestConfig,
    []
  );

  if (isLoading) return <p className="center">Fetching meals...</p>;
  if (error) return <Error title="Failed to fetch meals" message={error} />;

  return (
    <ul id="meals">
      {loadedMeals.map((meal) => (
        <MealItem key={meal.id} meal={meal} />
      ))}
    </ul>
  );
}
```

---

## ✅ Key Takeaways

- Custom hooks let you share stateful logic (loading/error/data) across components
- `useCallback` prevents function re-creation on every render — essential when functions are useEffect dependencies
- Object/array values created inside a component are **new references** every render — move them outside if they're constants
- Always `await` async functions in the chain — missing one turns your data into a Promise object
- Accept `initialData` as a parameter to prevent "undefined is not iterable" errors during the first render

## ⚠️ Common Mistakes

- Creating config objects inside component functions — causes infinite loops because `useEffect` sees a "new" dependency every render
- Forgetting `await` when calling async functions — you get a Promise stored in state instead of the actual data
- Setting `isLoading` to `true` initially — this breaks components that don't send requests on mount (like POST forms)

## 💡 Pro Tips

- When debugging infinite loops, check if any `useEffect` or `useCallback` dependency is an object/array created inside the component
- Extract response data *before* checking `response.ok` — error responses often contain useful messages
- The `sendRequest` function is exposed in the return object specifically so POST-type requests can be triggered on demand
