# Concept Repetition: Working with State

## Introduction

Now it's time to make our "Edit" button actually do something. When clicked, we want to show an input field so the user can update their player name, and the button should change from "Edit" to "Save." This requires **state** — data that, when changed, causes the UI to update.

---

## Setting Up State with `useState`

We need to track whether the player is currently being edited. Import `useState` and create a boolean state:

```jsx
import { useState } from 'react';

function Player({ name, symbol }) {
  const [isEditing, setIsEditing] = useState(false);
  // ...
}
```

- `isEditing` — the current value (`false` initially, meaning we're not editing)
- `setIsEditing` — the function to update this value and trigger a re-render

---

## Creating an Event Handler

We need a function that runs when the "Edit" button is clicked:

```jsx
function handleEditClick() {
  setIsEditing(true);
}
```

### Naming Convention

Start with `handle` to signal this is an event handler:
- `handleEditClick` — handles the edit button click
- `handleChange` — handles input changes
- `handleSubmit` — handles form submissions

This is a common convention in React that makes your code more readable.

---

## Connecting the Handler to the Button

```jsx
<button onClick={handleEditClick}>Edit</button>
```

### The Critical Rule: Don't Execute the Function!

```jsx
// ✅ Correct — pass the function reference
<button onClick={handleEditClick}>Edit</button>

// ❌ Wrong — this CALLS the function immediately during render
<button onClick={handleEditClick()}>Edit</button>
```

The parentheses `()` would execute the function right away during rendering, not when the button is clicked. You want to **pass** the function so React can call it later.

---

## Rendering Content Conditionally

We want to show either the player name (as a span) or an input field, depending on `isEditing`:

```jsx
let editablePlayerName = <span className="player-name">{name}</span>;

if (isEditing) {
  editablePlayerName = <input type="text" required />;
}
```

Then use the variable in the JSX:

```jsx
return (
  <li>
    <span className="player">
      {editablePlayerName}
      <span className="player-symbol">{symbol}</span>
    </span>
    <button onClick={handleEditClick}>Edit</button>
  </li>
);
```

### Why Store JSX in Variables?

JSX is just JavaScript expressions — you can store them in variables, pass them around, and use them conditionally. This keeps your return statement clean and readable.

---

## How State Updates Work

When `setIsEditing(true)` is called:

1. React **schedules** a state update
2. React **re-executes** the `Player` component function
3. The JSX is **re-evaluated** — now `isEditing` is `true`, so the input renders
4. React updates the **real DOM** with the changes

Importantly, only the component that owns the state re-renders. The parent `App` component is **not affected** when a child component's state changes.

---

## ✅ Key Takeaways

- `useState` returns a value and an updater function — always destructure both
- Event handlers should be passed by reference, not called with `()`
- JSX can be stored in variables for conditional rendering
- State updates trigger re-renders only in the component that owns the state

## ⚠️ Common Mistakes

- Adding parentheses to the event handler in `onClick` — `onClick={fn()}` executes immediately
- Forgetting that state updates don't happen instantly — they're scheduled by React
- Trying to read the updated state value immediately after calling the setter

## 💡 Pro Tip

Declare your event handler functions **inside** the component function. This gives them access to state, props, and other component-scoped variables through JavaScript closures.
