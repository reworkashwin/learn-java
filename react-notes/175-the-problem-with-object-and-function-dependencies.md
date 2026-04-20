# The Problem with Object & Function Dependencies

## Introduction

We've been avoiding a thorny issue: what happens when your `useEffect` dependency is a **function**? This is where JavaScript's object identity rules collide with React's dependency comparison, and it can silently reintroduce the infinite loop we thought we'd fixed. Understanding this is crucial for writing production-quality React code.

---

## The Problem Setup

In the `DeleteConfirmation` component, we use `onConfirm` inside our effect. According to the dependency rules, we should add it to the array:

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    onConfirm();
  }, 3000);

  return () => clearTimeout(timer);
}, [onConfirm]); // Added as dependency
```

Seems reasonable. But this can create an **infinite loop**. Why?

---

## Functions Are Objects in JavaScript

Here's the fundamental JavaScript concept that causes the problem:

```js
const hello = () => console.log("Hello");
const hello2 = () => console.log("Hello");

hello === hello2  // false!
```

Even though `hello` and `hello2` have **identical code**, JavaScript treats them as two different objects. Object comparison in JavaScript is based on **reference identity**, not content.

The same applies to regular objects:

```js
const a = { name: "Max" };
const b = { name: "Max" };

a === b  // false!
```

---

## How This Causes an Infinite Loop

Here's the chain of events:

1. `App` component renders → creates `handleRemovePlace` function
2. Passes it to `DeleteConfirmation` as `onConfirm`
3. `DeleteConfirmation`'s effect runs with `onConfirm` as a dependency
4. Effect calls `onConfirm()` → triggers state update in `App`
5. `App` re-renders → creates a **new** `handleRemovePlace` function
6. New function ≠ old function (different references)
7. React says: "dependency changed!" → re-runs the effect
8. Go back to step 4

Every render creates a brand new function object. React sees it as "changed" every time. The effect keeps re-running. Infinite loop.

---

## Why You Might Not See It Immediately

In some cases, the loop gets interrupted by other behavior. For example, if `onConfirm` causes the `DeleteConfirmation` component to be **unmounted** (removed from the DOM), the loop stops because the component is gone.

But that's fragile. If you comment out the state update that unmounts the component, the infinite loop appears immediately. Relying on the component being removed is not a safe solution.

---

## Verifying the Problem

You can see it in action:

1. Remove the `setModalIsOpen(false)` call from `handleRemovePlace` so the modal stays open
2. Open the modal and wait for the timer
3. Watch the console — "timer set" logs appear repeatedly, endlessly

The fix? A special React hook called `useCallback`, which we'll explore in the next lecture.

---

## The General Rule

This problem applies to **any** dependency that is:
- An object
- An array
- A function

All of these are recreated on every render, and all of them fail JavaScript's reference equality check even if their content is identical.

---

## ✅ Key Takeaways

- Functions in JavaScript are objects; two identical function definitions are **not equal** by reference
- When a function is passed as a prop and used as a `useEffect` dependency, it causes the effect to re-run on every render
- This can create **infinite loops** when the effect triggers state updates that cause re-renders
- The same problem applies to objects and arrays used as dependencies

## ⚠️ Common Mistakes

- Adding function props to the dependency array without stabilizing them with `useCallback`
- Thinking two functions with the same code are "equal" — they're not in JavaScript
- Ignoring ESLint warnings about dependencies and removing functions from the array (hides the bug, doesn't fix it)

## 💡 Pro Tip

Open your browser console and type `(() => {}) === (() => {})` — you'll get `false`. This single experiment explains one of the most confusing React pitfalls.
