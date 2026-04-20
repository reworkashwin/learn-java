# Setting Timers & Managing State

## Introduction

Our TimerChallenge component has the look, but no brains yet. Time to add the actual timer logic! This lecture wires up `setTimeout` to create a countdown, introduces state to track whether the timer started and whether it expired, and sets up the scenario where we'll desperately need refs — because stopping a timer is harder than starting one.

---

## Starting the Timer

We use JavaScript's built-in `setTimeout` to set a timer that fires after the target time:

```jsx
import { useState } from 'react';

export default function TimerChallenge({ title, targetTime }) {
  const [timerExpired, setTimerExpired] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  function handleStart() {
    setTimerStarted(true);
    setTimeout(() => {
      setTimerExpired(true);
    }, targetTime * 1000);
  }

  // ...
}
```

### How setTimeout Works

```
setTimeout(callback, delayInMs)
```

- **`callback`** — the function to execute when time's up
- **`delayInMs`** — how long to wait (in milliseconds)
- `targetTime` is in seconds, so we multiply by `1000`

When the timer expires, `setTimerExpired(true)` fires, marking that the player lost.

---

## Managing Two Pieces of State

We need **two** independent state values:

### 1. `timerExpired` — Did time run out?
```jsx
const [timerExpired, setTimerExpired] = useState(false);
```
- Set to `true` inside the `setTimeout` callback (when time runs out)
- Used to show "You lost" message

### 2. `timerStarted` — Is the timer currently running?
```jsx
const [timerStarted, setTimerStarted] = useState(false);
```
- Set to `true` in `handleStart`, **before/after** setting the timer (not inside the callback!)
- Used to update button text and show status

### Important Distinction

```jsx
function handleStart() {
  setTimerStarted(true);        // Executes IMMEDIATELY
  setTimeout(() => {
    setTimerExpired(true);      // Executes AFTER targetTime seconds
  }, targetTime * 1000);
}
```

Code **outside** the `setTimeout` callback runs immediately. Code **inside** waits for the timer to expire. This is a common source of confusion.

---

## Updating the UI Conditionally

With both states in place, the UI responds dynamically:

```jsx
<button onClick={timerStarted ? handleStop : handleStart}>
  {timerStarted ? 'Stop Challenge' : 'Start Challenge'}
</button>

<p className={timerStarted ? 'active' : undefined}>
  {timerStarted ? 'Time is running...' : 'Timer inactive'}
</p>
```

---

## The Looming Problem: How Do We Stop the Timer?

We can add a `handleStop` function:

```jsx
function handleStop() {
  // clearTimeout(???) — but where's the timer reference?
}
```

JavaScript's `clearTimeout(timerId)` can stop a timer, but it needs the **timer ID** returned by `setTimeout`. Where do we store it?

- A **regular variable** inside the component? It gets recreated on every re-render.
- A **variable outside** the component? It's shared across all instances.
- **State**? It would cause unnecessary re-renders.

This is exactly the problem that refs solve — and the subject of the next lecture.

---

## ✅ Key Takeaways

- `setTimeout(fn, ms)` schedules a function to run once after `ms` milliseconds
- Code **outside** `setTimeout` executes immediately; code **inside** the callback executes after the delay
- Use separate state values for independent pieces of information (`timerStarted` vs `timerExpired`)
- Stopping a timer requires `clearTimeout(timerId)` — but storing that `timerId` is tricky in React

## ⚠️ Common Mistakes

- Confusing `targetTime * 1000` — always remember `setTimeout` takes milliseconds, not seconds
- Putting `setTimerStarted(true)` inside the `setTimeout` callback — that would only mark it as started *after* it expires

## 💡 Pro Tips

- When you need to store a value that persists across re-renders but doesn't affect the UI, that's a textbook ref use case (coming next!)
- `setTimeout` returns a numeric ID — you'll need it for `clearTimeout`
