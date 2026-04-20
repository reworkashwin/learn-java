# Introducing useEffect's Cleanup Function

## Introduction

We set up the problem: a timer that keeps running even after the component unmounts. Now let's solve it with one of `useEffect`'s most powerful features — the **cleanup function**. This is the mechanism that lets you undo or cancel side effects when they're no longer needed.

---

## Wrapping the Timer in `useEffect`

First, let's move the `setTimeout` into `useEffect`:

```jsx
import { useEffect } from 'react';

function DeleteConfirmation({ onConfirm, onCancel }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onConfirm();
    }, 3000);
  }, []);

  return (/* ... */);
}
```

But wrapping the timer isn't enough on its own. The real point here isn't to prevent an infinite loop (we don't have one) or to sync with a DOM API. The point is to get access to the **cleanup function**.

---

## Defining a Cleanup Function

Inside the effect function, you can **return another function**. This returned function is the cleanup function:

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    onConfirm();
  }, 3000);

  // Cleanup function
  return () => {
    clearTimeout(timer);
  };
}, []);
```

---

## When Does the Cleanup Function Run?

React calls the cleanup function in two situations:

1. **Right before the effect runs again** — if dependencies change and the effect re-executes, the cleanup from the *previous* execution runs first
2. **When the component unmounts** — when the component is removed from the DOM

It does **NOT** run before the very first execution of the effect.

### In Our Timer Example

With an empty `[]` dependency array, the effect only runs once. So the cleanup function only runs when the component **unmounts** (when the modal closes). That's exactly when we want to cancel the timer.

The flow:
1. Modal opens → `DeleteConfirmation` mounts → effect runs → timer starts
2. User clicks "No" → `DeleteConfirmation` unmounts → **cleanup runs** → `clearTimeout(timer)` → timer cancelled
3. No phantom deletion!

---

## The Big Picture

```jsx
useEffect(() => {
  // 🟢 SETUP: runs after render
  const timer = setTimeout(() => {
    onConfirm();
  }, 3000);

  // 🔴 CLEANUP: runs before re-execution or unmount
  return () => {
    clearTimeout(timer);
  };
}, []);
```

Think of setup and cleanup as **paired operations**:

| Setup | Cleanup |
|-------|---------|
| `setTimeout` | `clearTimeout` |
| `setInterval` | `clearInterval` |
| `addEventListener` | `removeEventListener` |
| Open WebSocket | Close WebSocket |
| Subscribe to store | Unsubscribe |

Every setup should have a matching cleanup.

---

## A Note on Dependencies

You might notice the linter warning about `onConfirm` not being listed in the dependencies. We're deliberately ignoring that for now — it will be addressed in a later lecture about `useCallback`. For this example, the empty array is sufficient because the cleanup behavior works correctly.

---

## ✅ Key Takeaways

- The cleanup function is **returned** from inside the effect function
- It runs before the effect re-executes (if dependencies change) and when the component unmounts
- It does **NOT** run before the first execution
- Use cleanup to cancel timers, intervals, subscriptions, or any ongoing process
- Every `setTimeout` should have a matching `clearTimeout` in the cleanup

## ⚠️ Common Mistakes

- Forgetting to store the timer reference (`const timer = setTimeout(...)`) — without it, you can't clear it
- Thinking cleanup runs on first mount — it doesn't
- Not returning the cleanup function (just writing code after a `return` statement won't work — you must return a *function*)

## 💡 Pro Tip

If your effect creates something, your cleanup should destroy it. If your effect starts something, your cleanup should stop it. Always think in setup/teardown pairs.
