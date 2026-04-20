# The useCallback Hook

## Introduction

In the last lecture, we uncovered a nasty problem: functions used as `useEffect` dependencies get recreated on every render, causing React to think the dependency changed, potentially creating infinite loops. Now let's meet the solution: **`useCallback`** — a React hook specifically designed to stabilize function references across renders.

---

## What Does `useCallback` Do?

`useCallback` wraps a function and tells React: *"Don't recreate this function on every render. Store it in memory and reuse the same reference."*

Without `useCallback`:
```
Render 1 → creates handleRemovePlace (object A)
Render 2 → creates handleRemovePlace (object B)  ← different reference!
Render 3 → creates handleRemovePlace (object C)  ← different reference!
```

With `useCallback`:
```
Render 1 → creates handleRemovePlace (object A) → stores it
Render 2 → reuses handleRemovePlace (object A)  ← same reference!
Render 3 → reuses handleRemovePlace (object A)  ← same reference!
```

---

## Syntax

```jsx
import { useCallback } from 'react';

const handleRemovePlace = useCallback(function handleRemovePlace() {
  setPickedPlaces((prevPlaces) =>
    prevPlaces.filter((place) => place.id !== selectedPlace.current)
  );
  setModalIsOpen(false);

  const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
  localStorage.setItem(
    'selectedPlaces',
    JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current))
  );
}, []);
```

### Two Arguments:

1. **The function to stabilize** — passed as the first argument
2. **A dependencies array** — just like `useEffect`

---

## The Dependencies Array

`useCallback`'s dependency array works exactly like `useEffect`'s:

- Add any **prop or state values** used inside the wrapped function
- React will only recreate the function if those dependencies change
- With an empty array `[]`, the function is never recreated

In our example, the function uses:
- `setPickedPlaces` — a state updater function (doesn't need to be listed)
- `selectedPlace` — a ref (doesn't need to be listed)
- `setModalIsOpen` — a state updater function (doesn't need to be listed)
- `localStorage` — a browser global (doesn't need to be listed)

No props or state values are used directly, so `[]` is correct.

---

## The Result

Now when `handleRemovePlace` is passed to `DeleteConfirmation` as `onConfirm`, and `onConfirm` is listed as a `useEffect` dependency:

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    onConfirm();
  }, 3000);
  return () => clearTimeout(timer);
}, [onConfirm]);
```

React compares the old `onConfirm` reference to the new one. Since `useCallback` ensures they're the **same reference**, React says: *"Nothing changed, no need to re-run the effect."*

No more infinite loop.

---

## When to Use `useCallback`

| Scenario | Use `useCallback`? |
|----------|-------------------|
| Function passed as a `useEffect` dependency | ✅ Yes — prevents infinite loops |
| Function passed to memoized child components | ✅ Yes — prevents unnecessary re-renders |
| Function only used locally, not passed down | ❌ Usually no — no benefit |
| Simple event handlers | ❌ Usually no — overkill |

The primary use case: **stabilize function references** that are used as dependencies or passed to optimized child components.

---

## ✅ Key Takeaways

- `useCallback` prevents a function from being recreated on every render
- It returns the **same function reference** across renders (unless dependencies change)
- Its dependency array works exactly like `useEffect`'s — list prop/state values used inside
- Use it when passing functions as `useEffect` dependencies to prevent infinite loops
- State updater functions, refs, and browser globals don't need to be listed as dependencies

## ⚠️ Common Mistakes

- Wrapping **every** function in `useCallback` — only wrap functions that need stable references
- Forgetting dependencies in `useCallback`'s array — leads to stale closures (the function captures outdated values)
- Confusing `useCallback` with `useMemo` — `useCallback` memorizes the function itself; `useMemo` memorizes the function's return value

## 💡 Pro Tip

A simple mental model: `useCallback(fn, deps)` is essentially `useMemo(() => fn, deps)`. Both are about caching, but `useCallback` is specifically for functions. Reach for it whenever a function needs to maintain the same identity across renders.
