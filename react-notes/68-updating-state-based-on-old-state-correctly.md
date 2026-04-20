# Best Practice: Updating State Based On Old State Correctly

## Introduction

This is one of the **most important best practices** in React. When your new state depends on the previous state value, you should use the **function form** of the state updater. This lesson explains why and shows you the difference with a clear demonstration.

---

## The Rule

> When updating state based on the previous value of that state, **pass a function** to the state updating function.

```jsx
// ❌ Suboptimal — uses the state variable directly
setIsEditing(!isEditing);

// ✅ Best practice — uses the function form
setIsEditing((editing) => !editing);
```

---

## How the Function Form Works

When you pass a function to `setIsEditing`:

1. **React calls your function** automatically
2. **React passes the current state** as the argument (`editing`)
3. **Your function returns** the new state value

```jsx
function handleEditClick() {
  setIsEditing((editing) => !editing);
}
```

The parameter name (`editing`) is up to you — React just passes the latest state value to whatever parameter you define.

---

## Why Does This Matter?

React **schedules** state updates — they don't happen instantly. This is usually measured in milliseconds, but the distinction is critical.

### The Problem Without the Function Form

```jsx
function handleEditClick() {
  setIsEditing(!isEditing);   // Both see isEditing as false
  setIsEditing(!isEditing);   // Both schedule "set to true"
}
```

Both calls reference the same `isEditing` value (the value at the time the function runs). Since state hasn't actually changed yet, both lines compute `!false = true`. Result: **two identical updates scheduled**.

### The Solution With the Function Form

```jsx
function handleEditClick() {
  setIsEditing((editing) => !editing);  // Gets false → returns true
  setIsEditing((editing) => !editing);  // Gets true → returns false
}
```

Each function receives the **latest state value** at the time it executes — including updates from previous scheduled updates. The second call sees the result of the first, so it correctly returns `false`.

---

## Visual Summary

| Approach | 1st Update Sees | 2nd Update Sees | Final State |
|---|---|---|---|
| `!isEditing` (direct) | `false` | `false` | `true` |
| `(prev) => !prev` (function) | `false` | `true` | `false` |

---

## When to Use the Function Form

Use it whenever your new state **depends on** the previous state:

```jsx
// Toggling a boolean
setIsOpen((prev) => !prev);

// Incrementing a counter
setCount((prev) => prev + 1);

// Adding to an array
setItems((prev) => [...prev, newItem]);

// Updating an object property
setUser((prev) => ({ ...prev, name: 'New Name' }));
```

If the new state is **completely independent** of the old state, the direct form is fine:

```jsx
// Setting to a fixed value — no dependency on previous state
setName('Max');
setIsEditing(true);
```

---

## ✅ Key Takeaways

- **Always** use the function form when the new state depends on the old state
- React schedules state updates — they are **not instant**
- The function form guarantees you're working with the **latest** state value
- This is a **strong recommendation** from the React team — memorize this pattern

## ⚠️ Common Mistakes

- Using the state variable directly when computing the next state (`setCount(count + 1)`)
- Assuming state changes are applied immediately after calling the setter
- Calling the setter multiple times in a row without the function form and expecting sequential behavior

## 💡 Pro Tip

Make it a habit: every time you type a state setter and you're about to reference the current state value, switch to the function form. It costs nothing in readability but saves you from subtle, hard-to-debug issues.
