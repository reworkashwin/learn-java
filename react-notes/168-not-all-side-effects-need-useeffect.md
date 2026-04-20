# Not All Side Effects Need useEffect

## Introduction

Now that you've learned about `useEffect`, there's a critical nuance you need to understand right away: **not every side effect requires `useEffect`**. In fact, overusing `useEffect` is considered a bad practice in the React community. Why? Because every `useEffect` call triggers an extra execution cycle after the component renders. If you don't need that extra cycle, you're just wasting performance.

Let's look at a concrete example to understand when you **don't** need `useEffect`.

---

## The Scenario: Storing Selected Places in localStorage

Imagine you want to persist the user's selected places in the browser's `localStorage` so they survive page reloads. This is clearly a side effect — `localStorage` has nothing to do with rendering JSX.

Here's the code, inside a click handler:

```jsx
function handleSelectPlace(id) {
  setPickedPlaces((prevPlaces) => {
    // ... update state for UI
  });

  // Side effect: store in localStorage
  const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
  if (storedIds.indexOf(id) === -1) {
    localStorage.setItem(
      'selectedPlaces',
      JSON.stringify([id, ...storedIds])
    );
  }
}
```

This uses `localStorage.setItem()` — a browser API, not related to JSX rendering. It's a side effect.

---

## Why This Side Effect Doesn't Need `useEffect`

Two reasons:

### 1. It can't cause an infinite loop

This code only runs when the user **clicks** on a place. It doesn't run automatically when the component renders. Even if you update state in this handler, the handler itself doesn't re-execute on re-render — only the component function does.

Compare this with the geolocation example: that code ran in the component body, so every re-render triggered it again. This handler code is **event-driven**, not render-driven.

### 2. You literally can't use `useEffect` here

Hooks must be called at the **top level** of your component function. Calling `useEffect` inside a nested function like `handleSelectPlace` would violate the Rules of Hooks.

---

## The Rule: When Do You Actually Need `useEffect`?

You need `useEffect` when:

1. **Your side effect would create an infinite loop** — it runs on render, updates state, which triggers another render
2. **Your code must run after the component has rendered** — for example, when you need a ref to be connected to a DOM element first

If neither of these applies, skip `useEffect`.

---

## A Mental Model

Ask yourself two questions:

| Question | If Yes... |
|----------|-----------|
| Does this code run as part of the render cycle (not in an event handler)? | You might need `useEffect` |
| Does this code update state that triggers a re-render? | You might need `useEffect` |

If both answers are "no," you almost certainly don't need `useEffect`.

---

## ✅ Key Takeaways

- `useEffect` is not for *every* side effect — only for side effects that would cause problems without it
- Code inside **event handlers** (click, submit, etc.) doesn't need `useEffect` because it doesn't run on every render
- Overusing `useEffect` is a known anti-pattern — it adds unnecessary re-render cycles
- `localStorage` operations in event handlers are perfectly fine without `useEffect`

## ⚠️ Common Mistakes

- Wrapping every piece of non-JSX code in `useEffect` "just to be safe"
- Forgetting that event handler code only runs on user interaction, not on re-render

## 💡 Pro Tip

A good rule of thumb: if your side effect is triggered by a **user action** (click, type, submit), you almost never need `useEffect`. If it's triggered by **component rendering or data changing**, that's when `useEffect` enters the picture.
