# More Examples: When to Use Refs & State

## Introduction

With the modal working, it's time to level up the timer system. Instead of just knowing "timer expired or not," we want to **track the remaining time** in real-time so we can calculate a score based on how close the player got. This lecture replaces `setTimeout` with `setInterval`, reworks the state model, and demonstrates a nuanced decision process for when to use refs vs. state vs. derived values.

---

## From setTimeout to setInterval

`setTimeout` fires once. But we need continuous time tracking — enter `setInterval`:

```jsx
function handleStart() {
  timer.current = setInterval(() => {
    setTimeRemaining((prevTime) => prevTime - 10);
  }, 10);  // Fire every 10 milliseconds
}
```

### Key Differences

| Feature | `setTimeout` | `setInterval` |
|---------|-------------|---------------|
| Fires | Once | Repeatedly |
| Stops | Automatically | Must be cleared manually |
| Best for | "Do X after Y seconds" | "Do X every Y milliseconds" |

We fire every **10ms** to get reasonably smooth tracking without killing performance.

---

## Reworking the State Model

We replace the old `timerExpired` and `timerStarted` states with a single, more useful piece of state:

```jsx
const [timeRemaining, setTimeRemaining] = useState(targetTime * 1000);
```

- Stored in **milliseconds** (multiply `targetTime` by 1000)
- Updated every 10ms by subtracting 10
- Used as the **single source of truth** for the timer

### Derived Values (Computed State)

Instead of managing separate `timerStarted` and `timerExpired` states, we **derive** them:

```jsx
const timerIsActive = timeRemaining > 0 && timeRemaining < targetTime * 1000;
```

This is elegant:
- `timeRemaining === targetTime * 1000` → Timer hasn't started
- `0 < timeRemaining < targetTime * 1000` → Timer is running
- `timeRemaining <= 0` → Timer expired

No extra state needed. One state value, two derived booleans.

---

## Auto-Stopping the Timer When Time Runs Out

`setInterval` doesn't stop on its own — it fires forever. We need to manually check and stop it:

```jsx
// Directly in the component function body:
if (timeRemaining <= 0) {
  clearInterval(timer.current);
  dialog.current.open();
}
```

### ⚠️ Calling State Updates Directly in the Component Function

This pattern — calling `clearInterval` and `dialog.current.open()` directly in the function body (not in an event handler) — can be dangerous. It could cause **infinite loops** if done wrong. But here it's safe because:

1. The `if` condition prevents it from running again after the state resets
2. The interval is cleared, preventing further updates

This is a taste of the pattern that hooks like `useEffect` formalize (a topic for later).

---

## Adding a Reset Function

When the modal closes, we need to reset the timer:

```jsx
function handleReset() {
  setTimeRemaining(targetTime * 1000);
}

// Pass to ResultModal:
<ResultModal ref={dialog} targetTime={targetTime} onReset={handleReset} />
```

Inside `ResultModal`, trigger it on form submit (which closes the dialog):

```jsx
<form method="dialog" onSubmit={onReset}>
  <button>Close</button>
</form>
```

---

## Ref for the Timer ID (Again)

The interval ID still goes in a ref — same reasoning as before:

```jsx
const timer = useRef();

function handleStart() {
  timer.current = setInterval(() => {
    setTimeRemaining((prevTime) => prevTime - 10);
  }, 10);
}

function handleStop() {
  clearInterval(timer.current);
  dialog.current.open();
}
```

Note: `clearInterval` (not `clearTimeout`) because we used `setInterval`.

---

## The Decision Framework

| Question | → Use | Why |
|----------|-------|-----|
| Does it affect the UI? | **State** | `timeRemaining` drives the display |
| Can it be calculated from other values? | **Derived value** | `timerIsActive` is derived from `timeRemaining` |
| Does it persist without causing re-renders? | **Ref** | Timer ID needs to survive re-renders |

---

## ✅ Key Takeaways

- `setInterval` fires repeatedly; it must be cleared manually with `clearInterval`
- A single `timeRemaining` state can replace multiple boolean states through **derived values**
- Calling state updates directly in the component body is valid if protected by conditions that prevent infinite loops
- Timer/interval IDs always go in refs — they need persistence without triggering re-renders

## ⚠️ Common Mistakes

- Using `clearTimeout` to stop a `setInterval` — they're different functions!
- Forgetting to reset the timer state when the modal closes, making the game non-replayable
- Not using the functional form of setState (`prevTime => prevTime - 10`) with intervals — stale closures will bite you

## 💡 Pro Tips

- Always prefer **derived/computed values** over extra state when a value can be calculated from existing state
- The functional update pattern (`setState(prev => ...)`) is essential when updates depend on the previous value, especially in intervals
- `setInterval` with small intervals (10ms) is fine for UI updates, but avoid going below that for performance
