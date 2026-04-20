# Using useEffect for Syncing With Browser APIs

## Introduction

In the last lecture, we set up the problem: we want to show/hide a `<dialog>` based on an `open` prop, but we need to call the browser's `showModal()` method to get the backdrop. Simply setting the `open` attribute won't cut it. Now let's solve this with `useEffect`.

---

## The Naive Approach (And Why It Fails)

Your first instinct might be to add a simple `if/else` directly in the component:

```jsx
function Modal({ open, children }) {
  const dialog = useRef();

  if (open) {
    dialog.current.showModal();
  } else {
    dialog.current.close();
  }

  return <dialog ref={dialog}>{children}</dialog>;
}
```

If you try this, you'll get an **error** — `dialog.current` is `undefined`.

Why? Because the first time the component function runs, the JSX hasn't been returned yet. The `ref` hasn't been connected to the `<dialog>` element. You're trying to call `showModal()` on something that doesn't exist yet.

---

## The Fix: `useEffect`

`useEffect` runs **after** the component renders. By that point, the ref is connected to the DOM element, and you can safely call `showModal()` or `close()`.

```jsx
import { useEffect, useRef } from 'react';

function Modal({ open, children }) {
  const dialog = useRef();

  useEffect(() => {
    if (open) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [open]);

  return <dialog ref={dialog}>{children}</dialog>;
}
```

---

## Breaking Down the Solution

### The Effect Function
The function inside `useEffect` checks the `open` prop and calls the appropriate DOM method. Since this runs *after* render, `dialog.current` is guaranteed to be connected.

### The Dependencies Array: `[open]`
This is crucial. We're saying: *"Re-run this effect whenever the `open` prop changes."*

- When `open` goes from `false` → `true`: call `showModal()`
- When `open` goes from `true` → `false`: call `close()`
- When `open` stays the same: do nothing

This is **not** the same as an empty array `[]`. With an empty array, the effect only runs once. We need it to run every time `open` changes.

---

## A New Mental Model for `useEffect`

We've now seen `useEffect` used for two different purposes:

| Purpose | Example | Dependencies |
|---------|---------|-------------|
| Prevent infinite loops | Geolocation fetching | `[]` (run once) |
| Sync prop/state with DOM APIs | Dialog `showModal()` / `close()` | `[open]` (run when `open` changes) |

In both cases, the core concept is the same: run code **after** render, **when needed**.

The word "synchronize" is key here. You're *syncing* the value of a React prop to an imperative browser API. That's exactly what `useEffect` is designed for.

---

## ✅ Key Takeaways

- `useEffect` is perfect for syncing React prop/state values with imperative browser APIs
- The effect runs **after** the component renders, so refs are connected and DOM elements are available
- Add the prop you're syncing as a **dependency** so the effect re-runs when it changes
- This is different from the "prevent infinite loops" use case — here we *want* the effect to re-run

## ⚠️ Common Mistakes

- Using an empty dependency array `[]` when you actually need the effect to respond to prop changes
- Trying to call DOM methods directly in the component body, before the JSX is rendered

## 💡 Pro Tip

Think of `useEffect` with dependencies as a **reactive bridge**: "Whenever THIS value changes, DO this DOM operation." It's React's way of connecting its declarative world to the browser's imperative one.
