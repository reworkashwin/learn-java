# Sharing State Across Components

## Introduction

The timer logic works, but the `ResultModal` doesn't have the right data yet. It needs to know the **remaining time** to determine if the player lost and to display accurate results. This lecture demonstrates how to share state between components by passing it as props — a fundamental React pattern you've seen before, but now applied in a richer context.

---

## Passing State Down as Props

The `timeRemaining` state lives in `TimerChallenge`. The `ResultModal` needs it. Solution: pass it as a prop.

```jsx
// TimerChallenge.jsx
<ResultModal
  ref={dialog}
  targetTime={targetTime}
  remainingTime={timeRemaining}
  onReset={handleReset}
/>
```

---

## Using the Shared Data in ResultModal

Inside `ResultModal`, we derive everything we need from `remainingTime` and `targetTime`:

```jsx
function ResultModal({ targetTime, remainingTime, onReset }) {
  const userLost = remainingTime <= 0;

  const formattedRemainingTime = (remainingTime / 1000).toFixed(2);

  return (
    <dialog ref={dialog}>
      {userLost && <h2>You lost</h2>}
      <p>
        The target time was <strong>{targetTime} seconds</strong>.
      </p>
      <p>
        You stopped the timer with{' '}
        <strong>{formattedRemainingTime} seconds</strong> left.
      </p>
      <form method="dialog" onSubmit={onReset}>
        <button>Close</button>
      </form>
    </dialog>
  );
}
```

### Key Details

- **`userLost`** — derived from `remainingTime <= 0`. No need for a separate prop.
- **`formattedRemainingTime`** — `remainingTime` is in milliseconds, so divide by 1000 for seconds. `.toFixed(2)` formats it to two decimal places.
- **`onReset`** — a function passed from the parent, triggered when the dialog form is submitted.

---

## The Reset Flow

There was a subtle bug: when the timer expires, `TimerChallenge` immediately resets `timeRemaining` — so by the time the modal opens, `remainingTime` is already back to the initial value, not zero!

### The Fix

Don't reset `timeRemaining` in the expiration check. Instead, only reset it when the modal is closed:

```jsx
// TimerChallenge.jsx
if (timeRemaining <= 0) {
  clearInterval(timer.current);
  dialog.current.open();
  // Do NOT reset timeRemaining here!
}

function handleReset() {
  setTimeRemaining(targetTime * 1000);  // Reset only on modal close
}
```

This ensures the modal sees the actual `timeRemaining` (zero or whatever was left) rather than the reset value.

---

## The onSubmit Pattern

The `onSubmit` prop on the `<form>` inside the dialog triggers when the form is submitted (i.e., when the Close button is clicked):

```jsx
<form method="dialog" onSubmit={onReset}>
  <button>Close</button>
</form>
```

This is a clean way to hook into the dialog-closing event without needing additional event handlers.

---

## Data Flow Summary

```
TimerChallenge (owns state)
    │
    ├── timeRemaining (state)
    ├── targetTime (prop from App)
    ├── handleReset (resets timer)
    │
    └── ResultModal (receives data as props)
         ├── remainingTime ← timeRemaining
         ├── targetTime ← targetTime
         ├── onReset ← handleReset
         │
         └── Derives: userLost, formattedRemainingTime
```

---

## ✅ Key Takeaways

- Share state between components by **passing it as props** — the owner manages it, consumers read it
- **Derive values** in the receiving component rather than passing pre-computed props
- Be careful about **when** state resets happen — resetting too early can cause stale data in dependent components
- The `onSubmit` callback on forms provides a clean hook for dialog close events

## ⚠️ Common Mistakes

- Resetting state before the consuming component has a chance to use it (the timing bug shown in this lecture)
- Forgetting unit conversions — `remainingTime` is in milliseconds, `targetTime` in seconds
- Not using `.toFixed()` to format decimal numbers for display

## 💡 Pro Tips

- When data flows down as props, always ask: "Who owns this state?" The owner should be the **lowest common ancestor** that needs the data
- `Number.toFixed(n)` returns a **string** — keep this in mind if you need to do further math with it
