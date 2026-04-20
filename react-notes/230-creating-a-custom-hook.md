# Creating a Custom Hook

## Introduction

Now that we understand **why** custom hooks exist, let's actually build one. We'll create a `useFetch` hook that encapsulates all the data-fetching logic we've been repeating across components — the HTTP request, loading state, error state, and the `useEffect` orchestration.

---

## Step 1: Create the File

By convention, custom hooks live in a `hooks/` folder inside `src/`:

```
src/
  hooks/
    useFetch.js
```

The folder name is optional, but it helps keep things organized. The **file name** should match the hook name.

---

## Step 2: The Naming Rule — Why `use`?

Your custom hook function **must** start with `use`. This isn't just a convention — it's how React's tooling enforces the Rules of Hooks on your function.

```js
// ✅ This works — recognized as a hook
function useFetch() { ... }

// ❌ This will cause warnings — NOT recognized as a hook
function fetch() { ... }
```

When a function starts with `use`, React's linting tools:
- Allow you to call other hooks (like `useState`, `useEffect`) inside it
- Warn if you try to use the hook itself in invalid places (loops, conditions, etc.)

Without the `use` prefix, calling `useState` inside your function would trigger an error: *"React Hook must be called in a React function component or a custom hook function."*

---

## Step 3: Move the Logic In

Take the `useEffect` code from `App.jsx` and move it into the custom hook:

```js
import { useEffect } from "react";

export function useFetch(fetchFn) {
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchFn();
        // ... store the data
      } catch (error) {
        // ... handle the error
      }
    }
    fetchData();
  }, [fetchFn]);
}
```

### Why accept `fetchFn` as a parameter?

Because we want this hook to be **generic**. Instead of hardcoding `fetchUserPlaces()` inside the hook, we accept any async function. This way, we can use the same hook for fetching user places, available places, or anything else.

### Why is `fetchFn` in the dependency array?

Because it's an external value used inside `useEffect`. If the fetch function changes, the effect should re-run with the new function. This is the standard `useEffect` dependency rule.

---

## What We Have So Far

The hook accepts a fetch function, calls it inside `useEffect`, and handles the async flow. But we're not doing anything with the results yet — we're not managing state, and we're not returning anything.

That's what we'll tackle next: adding state management and returning values from the hook.

---

## ✅ Key Takeaways

- Custom hooks are **just functions** that start with `use`
- The `use` prefix enables React's linting to enforce hook rules on your function
- Accept parameters to make hooks **generic and reusable**
- Move the relevant `useEffect` logic from components into the hook

## ⚠️ Common Mistakes

- Forgetting to start the function name with `use` — the hook won't be recognized
- Naming your custom hook the same as a built-in hook (`useState`, `useEffect`) — name collisions

## 💡 Pro Tip

Think of custom hooks as **behavior blueprints**. The hook defines the pattern (fetch, load, error). The parameters customize what specific work gets done. The component just plugs in and gets results.
