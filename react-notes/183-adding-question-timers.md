# Adding Question Timers

## Introduction

Let's add pressure to our quiz! Each question should have a timer — say 10 seconds — with a visual progress bar that depletes. When time runs out, the question is skipped and we move on. This feature introduces a perfectly practical use case for `useEffect` and shows us exactly *when* to reach for it versus when basic code is fine.

---

## Building the QuestionTimer Component

Rather than cramming timer logic into the already-growing Quiz component, we create a dedicated `QuestionTimer` component. This is good React practice — **separate concerns into separate components**.

### The Progress Bar

The HTML `<progress>` element gives us a built-in visual timer:

```jsx
<progress id="question-time" max={timeout} value={remainingTime} />
```

- `max` = the total time (e.g., 10000 ms)
- `value` = how much time is left (starts at max, counts down to 0)

---

## Setting Up the Timeout

The component receives two props:

- `timeout` — how long the timer runs (in milliseconds)
- `onTimeout` — a callback to notify the parent when time's up

```jsx
export default function QuestionTimer({ timeout, onTimeout }) {
  setTimeout(onTimeout, timeout);
  // ...
}
```

Why not use `useEffect` here yet? Because at this point, we're not updating any state and not risking an infinite loop. The code is fine as-is. **Don't reach for `useEffect` preemptively** — only use it when you actually need it.

---

## Adding the Countdown with State

To animate the progress bar, we need state that updates every ~100 milliseconds:

```jsx
const [remainingTime, setRemainingTime] = useState(timeout);

setInterval(() => {
  setRemainingTime(prevTime => prevTime - 100);
}, 100);
```

And here's where the trouble starts. Every 100ms, `setRemainingTime` updates the state, which re-renders the component, which runs the function body again, which creates *another* `setInterval`… and now we have an infinite loop with multiplying intervals.

**This is exactly when `useEffect` becomes necessary.**

---

## Wrapping with useEffect

We need `useEffect` for two reasons:

1. **The interval** would multiply without it (state update → re-render → new interval → state update → …)
2. **The timeout** would also get recreated on every render

```jsx
import { useState, useEffect } from 'react';

export default function QuestionTimer({ timeout, onTimeout }) {
  const [remainingTime, setRemainingTime] = useState(timeout);

  // Effect for the timeout
  useEffect(() => {
    const timer = setTimeout(onTimeout, timeout);
    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  // Effect for the interval (progress bar animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prevTime => prevTime - 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);
```

### Why Two Separate Effects?

Each effect has different dependencies:

- The **timeout effect** depends on `timeout` and `onTimeout` — if either changes, we need to clear the old timer and set a new one
- The **interval effect** has no dependencies — it should run once when the component mounts and clean up when it unmounts

### The Dependency Array Explained

For the interval effect, the empty `[]` means "run this once on mount." We don't use any props or state values *inside* the effect function (the `setRemainingTime` updater function doesn't count — React guarantees it's stable).

For the timeout effect, `[timeout, onTimeout]` tells React: "Re-run this effect if either of these values changes." This makes sense — if the parent decides the timer should be 15 seconds instead of 10, we want to reset.

---

## Using It in the Quiz

```jsx
<QuestionTimer
  timeout={10000}
  onTimeout={() => handleSelectAnswer(null)}
/>
```

Passing `null` as the selected answer when the timer expires creates a "skipped" entry in our user answers array, which lets us distinguish between skipped and answered questions later.

---

## The Bug We'll Fix Next

If you run this, you'll notice the timer behaves strangely — it depletes too fast and doesn't reset between questions. These bugs are real and relate to **effect dependencies** and **cleanup functions**, which we'll tackle in the next lectures.

---

✅ **Key Takeaway**: Reach for `useEffect` when you have side effects that would cause infinite loops or need cleanup — not before. If your code works without it, leave it without it.

⚠️ **Common Mistake**: Forgetting cleanup functions in effects that set intervals or timeouts. Without cleanup, you'll accumulate multiple timers running simultaneously.

💡 **Pro Tip**: When you separate timer logic into its own component, you gain the ability to reset it independently using React's `key` prop — a trick we'll explore soon.
