# Using Effect Cleanup Functions & Using Keys for Resetting Components

## Introduction

Two powerful React concepts come together in this lecture: **effect cleanup functions** and the **`key` prop trick for resetting components**. The first solves the problem of lingering timers and intervals. The second reveals a hidden superpower of the `key` prop that goes far beyond lists.

---

## The StrictMode Bug Detective

Here's what's happening: our progress bar depletes in 5 seconds instead of 10. Open the console and you'll see the interval is being created *twice*. The culprit? React's `StrictMode`.

In development mode, `StrictMode` intentionally executes every component function **twice**. Why would React do this on purpose? To help you find bugs! If your app behaves differently when a component runs once versus twice, you have a bug.

And we do have a bug — two intervals are running simultaneously, both updating `remainingTime`, so the progress bar counts down at double speed.

---

## Cleanup Functions: The Solution

Every `useEffect` can return a **cleanup function**. React calls this function:
1. **Before re-running** the effect (if dependencies changed)
2. **When the component unmounts** (is removed from the DOM)

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    setRemainingTime(prevTime => prevTime - 100);
  }, 100);

  return () => {
    clearInterval(interval);  // ← cleanup!
  };
}, []);

useEffect(() => {
  const timer = setTimeout(onTimeout, timeout);

  return () => {
    clearTimeout(timer);  // ← cleanup!
  };
}, [timeout, onTimeout]);
```

### How Cleanup Works

Think of it as React being polite:

> "Before I set up a new interval (or when this component is leaving), let me clean up the old one first."

With `StrictMode`, React:
1. Mounts the component → creates the interval
2. Unmounts it → **runs cleanup** → clears the interval
3. Mounts it again → creates a fresh interval

Now only **one** interval is running. The progress bar works correctly.

Without cleanup, step 2 wouldn't clear anything, and by step 3 you'd have two intervals racing.

---

## The Timer Reset Problem

Cleanup solves the double-speed bug, but we still have another problem: when we move to a new question, the timer doesn't reset. The progress bar stays empty.

Why? Because the `QuestionTimer` component **isn't being recreated**. React sees it in the old JSX, sees it in the new JSX, and thinks "same component, no need to unmount/remount."

The timer, interval, and remaining time state all persist from the previous question.

---

## The Key Prop Trick

Here's where `key` becomes incredibly powerful. You already know `key` from lists — it helps React identify list items. But `key` has a second, equally important purpose:

> **When a `key` changes on a component, React destroys the old instance and creates a brand new one.**

It's like telling React: "This isn't the same component anymore — throw it away and start fresh."

```jsx
<QuestionTimer
  key={activeQuestionIndex}    // ← forces reset on question change
  timeout={10000}
  onTimeout={handleSkipAnswer}
/>
```

When `activeQuestionIndex` changes from 0 to 1:
1. React unmounts the old `QuestionTimer` (cleanup functions run, clearing old timers)
2. React mounts a fresh `QuestionTimer` (new state, new intervals, new timers)

The progress bar resets automatically. No additional code needed.

---

## When to Use the Key Trick

This pattern is useful whenever you want to **force a complete reset** of a component:

- Resetting a form when switching between items
- Resetting animations when content changes
- Resetting timers when the context changes
- Resetting any internal state when a parent's data changes

It's simpler and more reliable than trying to manually reset state with effects.

---

✅ **Key Takeaway**: Effect cleanup functions are essential for preventing resource leaks (timers, intervals, subscriptions, event listeners). Always clean up anything you set up in an effect.

✅ **Key Takeaway**: The `key` prop isn't just for lists. Setting `key` on any component forces React to destroy and recreate it when the key value changes. This is one of the most elegant patterns in React.

⚠️ **Common Mistake**: Trying to "reset" a component's state with `useEffect` when simply changing its `key` would do the job more cleanly and completely.

💡 **Pro Tip**: `StrictMode` double-rendering is your friend, not your enemy. If it causes bugs, those bugs exist in your production code too — `StrictMode` just makes them visible faster.
