# Understanding the useCallback() Hook

## Introduction

You've learned about `memo()` and how it prevents unnecessary component re-executions by comparing prop values. But here's the catch — what happens when one of those props is a **function**? Even if the function's logic hasn't changed, React will still see it as a "new" prop value. Why? Because in JavaScript, functions are objects, and every time a component re-renders, any functions defined inside it are **recreated as brand new objects in memory**. This is where `useCallback()` steps in to save the day.

---

## The Problem: Functions Break `memo()`

Imagine you have a `Counter` component with buttons that increment and decrement a counter. You wrap the button component (`IconButton`) with `memo()` to prevent unnecessary re-renders. Seems like a solid optimization, right?

But when you click a button, **the icon buttons still re-render**. What gives?

Let's think about what's happening:

- The `Counter` component re-renders because its state changed.
- Inside `Counter`, you have handler functions like `handleDecrement` and `handleIncrement`.
- These functions are **defined inside** the component function — they're nested functions.
- Every time `Counter` re-executes, these functions are **recreated**.
- Even though the code inside them is identical, JavaScript treats them as **different objects** in memory.
- `memo()` sees these as new prop values → re-renders the child components anyway.

```jsx
// Every re-render creates NEW function objects
function Counter() {
  const handleDecrement = () => setCounter(prev => prev - 1); // New object each time!
  const handleIncrement = () => setCounter(prev => prev + 1); // New object each time!

  return (
    <>
      <IconButton onClick={handleDecrement}>-</IconButton>
      <IconButton onClick={handleIncrement}>+</IconButton>
    </>
  );
}
```

So `memo()` is doing its job correctly — a prop **did** change (the function reference). The problem is that the function shouldn't be considered "changed" because its logic is the same.

---

## The Solution: `useCallback()`

`useCallback()` is a React hook that **prevents a function from being recreated** on every render. React "remembers" the function and returns the **same function object** as long as its dependencies haven't changed.

### How It Works

```jsx
import { useCallback } from 'react';

function Counter() {
  const handleDecrement = useCallback(() => {
    setCounter(prev => prev - 1);
  }, []);

  const handleIncrement = useCallback(() => {
    setCounter(prev => prev + 1);
  }, []);

  return (
    <>
      <IconButton onClick={handleDecrement}>-</IconButton>
      <IconButton onClick={handleIncrement}>+</IconButton>
    </>
  );
}
```

### Breaking It Down

1. **Wrap your function** with `useCallback()`.
2. **Pass a dependencies array** as the second argument — just like `useEffect`.
3. If **none of the dependencies change**, React returns the **exact same function object** from the previous render.
4. If a dependency **does change**, React creates a new function with the updated value.

### What About Dependencies?

In the example above, the dependencies array is empty `[]`. Why? Because the only thing used inside these functions is `setCounter` — a state updating function. React **guarantees** that state updating functions never change, so you don't need to list them as dependencies.

If your function used a prop or some other state value, you'd need to include it:

```jsx
const handleSomething = useCallback(() => {
  console.log(someValue); // uses external value
}, [someValue]); // must be listed as dependency
```

---

## The Result

After wrapping the handler functions with `useCallback()`, clicking increment or decrement **no longer causes the `IconButton` components to re-render**. Only the `CounterOutput` re-renders — which makes sense because the displayed value actually changed.

`memo()` + `useCallback()` = a powerful optimization combo.

---

## When Do You Need `useCallback()`?

There are two primary scenarios:

1. **With `memo()`** — When you pass functions as props to memoized child components. Without `useCallback()`, `memo()` is essentially defeated for those props.

2. **With `useEffect`** — When a function is listed as a dependency of `useEffect`. Without `useCallback()`, the effect would re-run on every render because the function reference keeps changing.

---

## ✅ Key Takeaways

- Functions defined inside a component are **recreated on every render** — they are new objects in memory.
- This breaks `memo()` because `memo()` sees new function references as changed props.
- `useCallback()` tells React to **reuse the same function object** across renders unless dependencies change.
- State updater functions (like `setCounter`) are guaranteed stable — no need to list them as dependencies.

## ⚠️ Common Mistakes

- **Forgetting the dependencies array** — Always provide it, even if it's empty.
- **Not listing all dependencies** — If your function uses props, state, or context values, they must be in the array.
- **Using `useCallback()` everywhere** — Don't wrap every function. Only use it when the function is passed to a memoized child or used as a `useEffect` dependency.

## 💡 Pro Tip

Think of `useCallback()` as telling React: *"Hey, this function hasn't changed — please give me back the same one you gave me last time."* It's not about preventing the function from being created in your source code — it's about preventing React from seeing it as a **new value** during prop comparison.
