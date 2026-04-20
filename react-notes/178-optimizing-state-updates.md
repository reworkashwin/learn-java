# Optimizing State Updates

## Introduction

In the previous lecture, we built a progress bar that updates every 10 milliseconds. That means the `DeleteConfirmation` component re-renders **100 times per second**. While this works on modern computers, it's not optimal. Every re-render means React has to re-evaluate all the JSX, compare all dependencies, and check all effects in that component. Let's fix this with a simple but powerful optimization pattern.

---

## The Problem: Unnecessary Re-renders

When `remainingTime` updates every 10ms in `DeleteConfirmation`, the **entire** component re-renders each time. That includes:

- Checking the `onConfirm` dependency in the `useEffect` for the timer
- Re-evaluating all the JSX (buttons, text, progress bar)
- Running any other logic in the component body

Most of that work is wasted. Only the progress bar actually needs to update.

---

## The Solution: Extract Into a Separate Component

Move the progress bar and its associated state/effect into its own component:

```jsx
// ProgressBar.jsx
import { useState, useEffect } from 'react';

export default function ProgressBar({ timer }) {
  const [remainingTime, setRemainingTime] = useState(timer);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 10);
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return <progress value={remainingTime} max={timer} />;
}
```

Now `DeleteConfirmation` becomes leaner:

```jsx
import ProgressBar from './ProgressBar';

const TIMER = 3000;

function DeleteConfirmation({ onConfirm, onCancel }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onConfirm();
    }, TIMER);

    return () => clearTimeout(timer);
  }, [onConfirm]);

  return (
    <div>
      <ProgressBar timer={TIMER} />
      <p>Do you really want to remove this place?</p>
      <button onClick={onCancel}>No</button>
      <button onClick={onConfirm}>Yes</button>
    </div>
  );
}
```

---

## What This Achieves

Before the refactor:
- `DeleteConfirmation` re-renders 100 times/second
- All JSX, effects, and dependency checks run every 10ms

After the refactor:
- Only `ProgressBar` re-renders 100 times/second
- `ProgressBar` has minimal JSX (just a `<progress>` element)
- `DeleteConfirmation` only re-renders when its own props/state change

This is a significant performance improvement because you've **isolated the frequently-changing state** into the smallest possible component.

---

## The Principle: Colocate State with Its Consumer

This is a general React optimization principle:

> If a piece of state only affects a small part of the UI, manage it in the component that renders that UI — not in a parent component.

When state lives too high in the component tree, changes to it cause unnecessary re-renders in sibling and child components that don't actually need the updated value.

---

## ✅ Key Takeaways

- Frequently updating state (like every 10ms) should be **isolated** in its own component
- Extracting state into a smaller component prevents unnecessary re-renders of the parent
- This is a form of **component composition** for performance optimization
- The principle: keep state as close as possible to where it's consumed

## ⚠️ Common Mistakes

- Keeping all state in one big component and wondering why performance suffers
- Over-optimizing components that don't actually have performance issues — only optimize when you have a measurable problem

## 💡 Pro Tip

Before reaching for `React.memo`, `useMemo`, or other advanced optimization tools, first try the simplest optimization: **move the state down** into a smaller component. It's the most effective and easiest performance fix in React.
