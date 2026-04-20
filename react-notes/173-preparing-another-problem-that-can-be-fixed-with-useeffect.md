# Preparing Another Problem That Can Be Fixed with useEffect

## Introduction

We've explored `useEffect` for preventing infinite loops and syncing with browser APIs. Now let's uncover another important feature of `useEffect` — the **cleanup function**. To understand why it exists, we first need to set up a problem worth solving.

---

## The Feature: Auto-Delete After 3 Seconds

Here's the goal: when the delete confirmation modal opens, we want to automatically confirm the deletion after 3 seconds. A countdown timer that auto-removes the selected place if the user doesn't click "No."

To implement this, we use `setTimeout` — a browser function that executes a callback after a specified delay:

```jsx
function DeleteConfirmation({ onConfirm, onCancel }) {
  setTimeout(() => {
    onConfirm();
  }, 3000); // 3 seconds

  return (
    <div>
      <p>Do you really want to remove this place?</p>
      <button onClick={onCancel}>No</button>
      <button onClick={onConfirm}>Yes</button>
    </div>
  );
}
```

---

## Problem 1: The Timer Starts Too Early

The `DeleteConfirmation` component is always rendered in the JSX tree — it's inside the `Modal`, which is always in the DOM. The modal just controls its visibility.

So `setTimeout` fires immediately when the app first loads, not when the modal opens. The 3-second timer starts ticking before the user even sees the modal.

### The Fix

Ensure `DeleteConfirmation` is only mounted when the modal is actually open. In the `Modal` component:

```jsx
function Modal({ open, children }) {
  return (
    <dialog ref={dialog}>
      {open ? children : null}
    </dialog>
  );
}
```

Now `DeleteConfirmation` only mounts (and starts the timer) when the modal is visible.

---

## Problem 2: The Timer Doesn't Stop

This is the bigger problem. Here's the scenario:

1. User clicks a place → modal opens → timer starts (3 seconds)
2. User clicks "No" at 1.5 seconds → modal closes
3. But the timer is **still running**!
4. At 3 seconds, `onConfirm()` fires anyway → the place gets deleted

The user said "No," but the place still disappears. That's a bug.

### Why Does This Happen?

`setTimeout` is a browser API. Once you start it, it runs independently of React. When the `DeleteConfirmation` component unmounts (modal closes), the component is gone from the DOM — but the timer is still ticking in the background. JavaScript's timer doesn't care about React's component lifecycle.

---

## What We Need: A Way to Clean Up

We need a mechanism to say: *"When this component is removed from the DOM, cancel any running timers."*

And that's exactly what `useEffect`'s cleanup function provides. We'll implement it in the next lecture.

---

## ✅ Key Takeaways

- `setTimeout` runs independently of React's component lifecycle
- A timer started in a component **keeps running** even after the component unmounts
- Conditionally rendering components (mounting/unmounting) is one way to control when side effects start
- We need a **cleanup mechanism** to stop side effects when a component disappears

## ⚠️ Common Mistakes

- Assuming that removing a component from the DOM automatically cancels its timers or intervals
- Setting timers directly in the component body without considering the component's lifecycle

## 💡 Pro Tip

Any browser resource you start (timers, intervals, event listeners, WebSocket connections) must be explicitly stopped. React won't do it for you. That's what cleanup functions are for.
