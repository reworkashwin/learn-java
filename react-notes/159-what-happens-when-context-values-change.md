# What Happens When Context Values Change?

## Introduction

Here's a critical detail about how context works under the hood: when a context value changes, **every component that consumes that context gets re-executed**. This is essential to understand for both correctness and performance.

---

## The Re-Render Rule

React re-executes a component function in three situations:

1. **Its internal state changes** (via `useState` or `useReducer`)
2. **Its parent component re-renders** (and passes new props or just executes again)
3. **A consumed context value changes** ← This one

When you call `useContext(CartContext)` in a component, you're telling React: "I depend on this context. If it changes, re-run me."

---

## Why This Makes Sense

Think about it — if the context value changes but the component doesn't re-render, the UI would be **stale**. You'd see old data on screen. That would break React's entire model of keeping the UI in sync with the data.

So React intelligently watches for context changes and triggers re-renders on all consuming components. This is how the cart updates instantly when you add an item, even though the Cart component didn't receive any new props.

---

## The Flow of a Context Update

```
1. User clicks "Add to Cart" in Product component
2. Product calls addItemToCart() from context
3. addItemToCart() calls setState — state updates
4. Provider re-renders with new value
5. All components using useContext(CartContext) re-execute
6. UI updates to show the new cart state
```

This is the same reactivity model as props and state — context just adds another trigger for component re-execution.

---

## ✅ Key Takeaways

- Components that consume a context value via `useContext` will **re-render when that value changes**
- This is by design — it keeps the UI in sync with shared state
- It follows the same model as state and prop changes triggering re-renders
- This is why context "just works" for reactive shared data

---

## ⚠️ Common Mistake

> Putting too much unrelated data into a single context. If you bundle user settings, cart data, and theme preferences into one giant context, *every* component consuming it re-renders whenever *any* part changes. Keep contexts focused on related data, or split them into separate contexts.
