# Passing Functions as Values to Props

## Introduction

We can now react to clicks — but the click handler is stuck inside the `TabButton` component. What if we need to react to those clicks **in a parent component** like `App`? We need to pass functions through props — and this is one of the **most important patterns** in React.

---

## The Problem

When a `TabButton` is clicked, we want to update content in the `App` component. But the click event happens inside `TabButton`, and the content lives in `App`.

How do we bridge that gap?

---

## The Solution: Pass a Function as a Prop

Since props can hold **any value** — including functions — we can pass an event handler function from the parent down to the child.

### Step 1: Define the Handler in the Parent

```jsx
function App() {
  function handleSelect() {
    console.log('Hello World - selected!');
  }

  return (
    <TabButton onSelect={handleSelect}>Components</TabButton>
  );
}
```

### Step 2: Accept and Use It in the Child

```jsx
function TabButton({ children, onSelect }) {
  return (
    <li>
      <button onClick={onSelect}>{children}</button>
    </li>
  );
}
```

Here's what happens:
1. `App` defines `handleSelect` and passes it as the `onSelect` prop
2. `TabButton` receives `onSelect` and forwards it to the built-in `onClick` prop
3. When the button is clicked, React calls `onSelect`, which is really `handleSelect` from `App`

> The function **originates** in the parent but **executes** when the child triggers the event.

---

## Why This Pattern Matters

This pattern lets a child component **communicate upward** to its parent. The parent says: "Here's a function — call it when something happens." The child calls it when the event occurs.

This is how React handles **child-to-parent communication**, since data normally flows top-down through props.

---

## The Naming Convention for Function Props

When a prop is meant to receive a function that's triggered by an event, start its name with `on`:

```jsx
// Good — clear this is an event-triggered prop:
<TabButton onSelect={handleSelect} />

// Less clear:
<TabButton selectAction={handleSelect} />
```

The `on` prefix signals: "this prop expects a function that will fire when something happens."

---

## The Flow Visualized

```
App                          TabButton
─────                        ──────────
handleSelect (defined here)
        │
        ▼
   onSelect={handleSelect}  ──→  onClick={onSelect}
                                       │
                                  (user clicks)
                                       │
                                       ▼
                              onSelect() is called
                                       │
                                       ▼
                              handleSelect() executes in App
```

---

## ✅ Key Takeaways

- You can pass **functions as prop values** from parent to child components
- This enables **child-to-parent communication** in React
- Use the `on` prefix for function props that respond to events (e.g., `onSelect`, `onDelete`)
- The child **forwards** the function to a built-in event prop like `onClick`
- The function executes in the **parent's scope** even though the child triggers it

## ⚠️ Common Mistakes

- Using a different prop name in the child than what the parent passes — the names must match
- Forgetting to actually use the prop on a built-in element — just accepting it isn't enough
- Executing the function with `()` in the prop instead of passing a reference

## 💡 Pro Tips

- This "functions as props" pattern is the foundation for most React interactivity
- As your app grows, you'll chain these patterns: grandchild → child → parent
- For very deep chains, React offers **Context** to avoid passing functions through every level
