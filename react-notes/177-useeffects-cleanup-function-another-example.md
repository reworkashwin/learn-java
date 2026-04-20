# useEffect's Cleanup Function: Another Example

## Introduction

We've already seen cleanup functions used with `setTimeout`. Now let's tackle a more dynamic scenario using `setInterval` — and build a visual progress bar that counts down to the auto-deletion. This ties together `useEffect`, cleanup functions, and state updates in a practical, real-world feature.

---

## The Feature: A Countdown Progress Bar

When the delete confirmation modal opens, we want a progress bar that visually counts down from 3 seconds to 0, showing the user how much time they have before the place is auto-deleted.

To make this work, we need:
1. **State** that tracks the remaining time
2. **`setInterval`** to update that state many times per second
3. **`useEffect`** to manage the interval properly
4. **Cleanup** to stop the interval when the component unmounts

---

## `setTimeout` vs `setInterval`

| Feature | `setTimeout` | `setInterval` |
|---------|-------------|--------------|
| Runs | Once, after delay | Repeatedly, every X ms |
| Use case | Delayed action | Repeated updates |
| Cancel with | `clearTimeout` | `clearInterval` |

For a smooth progress bar, we need `setInterval` running every 10ms to update the remaining time.

---

## The Implementation

```jsx
const TIMER = 3000;

function DeleteConfirmation({ onConfirm, onCancel }) {
  const [remainingTime, setRemainingTime] = useState(TIMER);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 10);
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <progress value={remainingTime} max={TIMER} />
      <p>Do you really want to remove this place?</p>
      <button onClick={onCancel}>No</button>
      <button onClick={onConfirm}>Yes</button>
    </div>
  );
}
```

### What's happening:

1. **State**: `remainingTime` starts at 3000 (milliseconds)
2. **`setInterval`**: Every 10ms, deduct 10 from the remaining time
3. **`<progress>`**: The HTML progress element displays the countdown visually
4. **Cleanup**: `clearInterval(interval)` stops the interval when the component unmounts

---

## Why `useEffect` Is Required

Without `useEffect`, the `setInterval` call would run directly in the component body. Since `setInterval` updates state every 10ms, and state updates trigger re-renders, each re-render would create **another** interval. You'd end up with hundreds of intervals running simultaneously — an infinite loop.

With `useEffect` and an empty dependency array, the interval is set up **once** after the first render.

---

## Why Cleanup Is Essential

If the user clicks "No" or the modal closes, the component unmounts. But the interval? It keeps running in the browser, calling `setRemainingTime` on a component that no longer exists.

This wastes performance and can cause warnings about state updates on unmounted components. The cleanup function stops it:

```jsx
return () => {
  clearInterval(interval);
};
```

---

## The Setup/Cleanup Pattern

This is the same pattern we saw with `setTimeout`:

```
Component mounts  → Setup:   setInterval starts
Component unmounts → Cleanup: clearInterval stops it
```

Every resource you acquire in the setup phase must be released in the cleanup phase.

---

## ✅ Key Takeaways

- `setInterval` is used for repeated operations (unlike `setTimeout` which runs once)
- Always wrap `setInterval` in `useEffect` to prevent multiplying intervals on re-render
- The cleanup function must call `clearInterval` to prevent memory leaks and performance issues
- The functional form of state updates (`prevTime => prevTime - 10`) is essential in intervals to avoid stale closures
- The HTML `<progress>` element is a simple, built-in way to display progress bars

## ⚠️ Common Mistakes

- Calling `setInterval` directly in the component body — creates new intervals on every render
- Forgetting to clear the interval in cleanup — leads to ghost intervals running after unmount
- Using `remainingTime` directly inside `setInterval` instead of the functional updater — causes stale state

## 💡 Pro Tip

The functional form of state updates (`setState(prev => ...)`) is especially important inside `setInterval`. Without it, the callback captures the initial `remainingTime` value and never sees updates. The functional form always gets the latest state.
