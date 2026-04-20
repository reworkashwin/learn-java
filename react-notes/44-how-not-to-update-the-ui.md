# How NOT to Update the UI — A Look Behind The Scenes of React

## Introduction

We've been building towards interactive content — clicking a button should change what's displayed on screen. The obvious approach is to use a regular JavaScript variable. But this **doesn't work** in React, and understanding *why* is essential to grasping React's core architecture.

---

## The Attempt (That Fails)

Let's try the straightforward approach:

```jsx
function App() {
  let tabContent = 'Please click a button';

  function handleSelect(selectedButton) {
    tabContent = selectedButton;
    console.log(tabContent);  // ← This DOES update
  }

  return (
    <div>
      {/* ... buttons ... */}
      <p>{tabContent}</p>   {/* ← This does NOT update on screen */}
    </div>
  );
}
```

When you click a button:
- ✅ `console.log` shows the updated value
- ❌ The text on screen **stays the same**

The variable changes, but the UI doesn't. Why?

---

## Why Regular Variables Don't Update the UI

Here's the key insight:

> **React only executes a component function ONCE** — when it first encounters the component.

Let's trace what happens:

1. React encounters `<App />` in `index.jsx`
2. React calls `App()` — the function executes, JSX is rendered, `tabContent` is `"Please click a button"`
3. The UI appears on screen
4. You click a button → `handleSelect` runs → `tabContent` is updated in memory
5. **But `App()` is NOT called again** → React never sees the new value → the UI stays stale

The component function ran once, produced its JSX, and React is done with it. Changing a local variable doesn't tell React to re-render.

---

## Proof: console.log Inside the Component

Add a log right inside the component function (not inside the handler):

```jsx
function App() {
  console.log('App component executing');
  // ...
}
```

You'll see:
- `"App component executing"` prints **once** on page load
- Clicking buttons does **NOT** print it again
- Only the handler's `console.log` appears

This proves the component function isn't re-running.

---

## What We Actually Need

To update the UI, we need two things:

1. **A way to store data** that React is "aware of"
2. **A way to tell React** "this data changed — please re-execute my component function and update the UI"

Regular variables fail on both counts. React doesn't track them, and changing them doesn't trigger re-renders.

> We need a mechanism that says: "Hey React, something changed! Please run my component again so the JSX reflects the new data."

That mechanism is called **State** — and it's the subject of the next lesson.

---

## The Mental Model

Think of a component function like a **recipe**:

- React follows the recipe **once** to cook the initial meal (render the UI)
- If you quietly change an ingredient (a variable), the meal that's already been served doesn't change
- You need to tell the chef (React): "Hey, an ingredient changed — please cook a fresh version!"

That's what State does.

---

## ✅ Key Takeaways

- React executes component functions **only once** by default (on initial render)
- Changing a regular variable inside a handler does **NOT** cause a re-render
- The UI only updates when React **re-executes** the component function
- Regular variables are invisible to React — it doesn't track them
- You need React's **State** system to trigger re-renders

## ⚠️ Common Mistakes

- Expecting the UI to update automatically when you change a `let` variable inside a handler
- Thinking `console.log` proving the value changed means the UI should also change
- Not understanding that "render" means "execute the component function"

## 💡 Pro Tips

- This is one of the most important concepts in React — understanding *why* local variables don't work is the foundation for understanding State
- React's re-rendering model is what makes it efficient — it only updates when told to
- "Re-render" doesn't mean the entire page refreshes — React smartly updates only what changed in the DOM
