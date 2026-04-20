# User Input & Two-Way-Binding

## Introduction

We can show and hide the input field, and it's pre-populated with the player name — but you can't actually **type** in it! That's because React is controlling the input's value. Let's fix this by learning one of React's most important patterns: **two-way binding**.

---

## The Problem: Controlled Inputs

When you set the `value` prop on an input:

```jsx
<input type="text" value={name} />
```

React **enforces** that value. Every keystroke the user types gets immediately overwritten by the value React set. The input appears "frozen."

### Why Not Use `defaultValue`?

You could use `defaultValue` instead — it sets an initial value but allows free editing:

```jsx
<input type="text" defaultValue={name} />
```

But the problem is that React doesn't know about the changes. When you click "Save," the original name comes back because there's no state tracking the edits.

---

## The Solution: Two-Way Binding

Two-way binding means:
1. **Data flows INTO the input** — via the `value` prop
2. **Data flows OUT of the input** — via an `onChange` handler

It's a loop: state → input → event → state update → input updates.

---

## Step 1: Add a Second Piece of State

We need state to track what the user is typing:

```jsx
const [playerName, setPlayerName] = useState(initialName);
```

We renamed the `name` prop to `initialName` to clarify that it's only the starting value.

---

## Step 2: Create a Change Handler

```jsx
function handleChange(event) {
  setPlayerName(event.target.value);
}
```

How this works:
- `onChange` fires on **every keystroke**
- React passes an **event object** automatically
- `event.target` is the input element that triggered the event
- `event.target.value` is the value the user tried to enter

---

## Step 3: Wire Everything Together

```jsx
let editablePlayerName = <span className="player-name">{playerName}</span>;

if (isEditing) {
  editablePlayerName = (
    <input type="text" required value={playerName} onChange={handleChange} />
  );
}
```

The flow:
1. User types "M" → `onChange` fires → `setPlayerName("M")` → React re-renders → input shows "M"
2. User types "a" → `onChange` fires → `setPlayerName("Ma")` → React re-renders → input shows "Ma"
3. User types "x" → `onChange` fires → `setPlayerName("Max")` → React re-renders → input shows "Max"
4. User clicks "Save" → `isEditing` becomes `false` → the span shows "Max"

---

## What Is Two-Way Binding?

It's the pattern of:
- **Getting** a value out of an input (via `onChange`)
- **Feeding** a value back into that input (via `value`)

This creates a controlled component — React is the single source of truth for the input's value.

---

## Multiple `useState` Calls

Notice we now have **two** state hooks in the same component:

```jsx
const [isEditing, setIsEditing] = useState(false);
const [playerName, setPlayerName] = useState(initialName);
```

This is perfectly fine! Use as many `useState` calls as you need — each manages a separate, independent piece of state.

---

## ✅ Key Takeaways

- **Two-way binding** = `value` prop + `onChange` handler on an input
- `event.target.value` gives you the value the user entered
- You can use `useState` multiple times in the same component
- Controlled inputs make React the **single source of truth** for form data

## ⚠️ Common Mistakes

- Setting `value` without `onChange` — the input becomes read-only
- Forgetting to rename props when they conflict with state variable names
- Using `defaultValue` when you need React to track changes

## 💡 Pro Tip

Two-way binding is the foundation of form handling in React. Master this pattern — you'll use it in every form input, textarea, select dropdown, and any controlled component.
