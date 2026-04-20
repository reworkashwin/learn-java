# Understanding the useMemo() Hook

## Introduction

You've learned that `memo()` prevents **component functions** from re-executing unnecessarily, and `useCallback()` prevents **functions** from being recreated. But what about **expensive computations** inside your components? If a component re-renders for any reason, every line of code in that component runs again — including heavy calculations that might produce the exact same result. That's wasteful, and that's exactly the problem `useMemo()` solves.

---

## The Problem: Unnecessary Recalculations

Imagine you have a function called `isPrime()` that checks whether a number is a prime number. This function is called directly inside your component:

```jsx
function Counter({ initialCount }) {
  const result = isPrime(initialCount); // Runs on EVERY render!
  // ...
}
```

Every time the `Counter` component re-renders — say, because the counter value changed — `isPrime()` runs again. But `initialCount` hasn't changed! The result will be exactly the same. If `isPrime()` involves a complex calculation (imagine checking if a number like 1,000,000 is prime), you're wasting performance for nothing.

This is the core issue: **normal functions inside component functions re-execute on every render**, regardless of whether their inputs changed.

---

## The Solution: `useMemo()`

`useMemo()` is a React hook that **caches the result of a function call** and only recalculates when its dependencies change.

### How It Works

```jsx
import { useMemo } from 'react';

function Counter({ initialCount }) {
  const result = useMemo(() => {
    return isPrime(initialCount);
  }, [initialCount]);
  // ...
}
```

### Breaking It Down

1. **Wrap the function call** in an anonymous function and pass it to `useMemo()`.
2. Pass a **dependencies array** as the second argument.
3. `useMemo()` executes the function **and stores the result**.
4. On subsequent renders, it **skips execution** unless a dependency changed.
5. If a dependency changes, it re-executes and stores the new result.

So in this case:
- If `initialCount` changes → `isPrime()` runs again. ✅
- If the counter state changes (but `initialCount` stays the same) → `isPrime()` is **skipped**. 🚀

---

## `memo()` vs `useMemo()` — Don't Confuse Them!

These are two completely different things despite the similar naming:

| Feature | `memo()` | `useMemo()` |
|---------|----------|-------------|
| What it wraps | Component functions | Regular functions / computations |
| Purpose | Prevents component re-execution | Prevents expensive recalculations |
| How it works | Compares props | Compares dependencies |
| Usage | `memo(MyComponent)` | `useMemo(() => compute(), [deps])` |

Think of it this way:
- `memo()` = "Don't re-render this **component** unless its props changed."
- `useMemo()` = "Don't re-run this **calculation** unless its inputs changed."

---

## When to Use `useMemo()`

`useMemo()` shines when you have:

- A **computationally expensive function** (sorting large arrays, complex math, data transformations).
- The function's inputs **don't change on every render**.
- Re-running the function would be **wasteful** because the result would be the same.

### When NOT to Use It

Don't wrap every function with `useMemo()`. Here's why:

- `useMemo()` itself has overhead — it needs to store the previous result and compare dependencies.
- If the function is **cheap** or its dependencies change on **almost every render**, `useMemo()` adds cost without benefit.
- Premature optimization makes code harder to read for no real gain.

---

## ✅ Key Takeaways

- `useMemo()` caches the **result** of a function and only recalculates when dependencies change.
- It's different from `memo()` (component-level) and `useCallback()` (function reference-level).
- Use it for **expensive calculations** where the result doesn't change on every render.
- Always provide a correct dependencies array — list all values the function depends on.

## ⚠️ Common Mistakes

- **Confusing `memo()` with `useMemo()`** — They serve different purposes entirely.
- **Overusing `useMemo()`** — Wrapping trivial calculations adds overhead without benefit.
- **Empty dependencies when inputs exist** — If your function uses `initialCount`, it must be in the array.

## 💡 Pro Tip

A good rule of thumb: if you're mapping, filtering, or sorting a large dataset inside a component, or doing any math that takes more than a trivial amount of time, that's a candidate for `useMemo()`. For simple variable assignments or one-liners, just let them recalculate — it's cheaper than the overhead of memoization.
