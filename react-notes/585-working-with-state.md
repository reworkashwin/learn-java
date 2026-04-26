# Working with State

## Introduction

Here's a scenario that trips up every React beginner: you change a variable inside an event handler, that variable is used in your JSX, but... nothing updates on the screen. Why? Because React doesn't know about your variable. It rendered a snapshot of your JSX once and moved on. To make React **re-render** when data changes, you need **state** — React's built-in mechanism for managing dynamic data that affects the UI.

This is the concept that makes React... well, *reactive*.

---

## Concept 1: Why Regular Variables Don't Work

### 🧠 What is it?

When you declare a regular variable inside a component function and update it in an event handler, the JSX that references that variable **will not update** on the screen.

### ❓ Why do we need it?

Understanding *why* this fails is essential to understanding *why* state exists.

### ⚙️ How it works

```jsx
function NewPost() {
  let enteredBody = ''; // regular variable

  function changeBodyHandler(event) {
    enteredBody = event.target.value; // updated on every keystroke
  }

  return (
    <form>
      <textarea onChange={changeBodyHandler} />
      <p>{enteredBody}</p>  {/* Never updates! */}
    </form>
  );
}
```

When you type, `enteredBody` *does* get updated in memory. But React doesn't care. It took a **snapshot** of your JSX when the component first rendered, and it won't take another snapshot just because a variable changed.

### 💡 Insight

React's component function runs once to produce the initial UI. After that, React needs a **signal** to run it again. Changing a plain variable is not that signal. Only state updates are.

---

## Concept 2: The `useState` Hook

### 🧠 What is it?

`useState` is a **React Hook** — a special function provided by React that lets you register a piece of **state** inside a component. When that state changes, React re-executes the component function and updates the UI.

### ❓ Why do we need it?

Without `useState`, there's no way to make React aware of data changes. It's the bridge between your data and React's rendering engine.

### ⚙️ How it works

1. Import `useState` from React
2. Call it inside your component function with an initial value
3. It returns an array with exactly **two elements**:
   - The **current state value**
   - A **state updating function**

```jsx
import { useState } from 'react';

function NewPost() {
  const [enteredBody, setEnteredBody] = useState('');

  function changeBodyHandler(event) {
    setEnteredBody(event.target.value);
  }

  return (
    <form>
      <textarea onChange={changeBodyHandler} />
      <p>{enteredBody}</p>  {/* Now it updates! */}
    </form>
  );
}
```

### 🧪 Example

- `useState('')` — registers a state variable with an empty string as the default
- `enteredBody` — holds the current value of the state
- `setEnteredBody(newValue)` — updates the state and triggers a re-render
- Every keystroke now updates the paragraph below the textarea in real-time

### 💡 Insight

The initial value you pass to `useState` can be anything: a string, number, boolean, array, object, or even `undefined`. It sets the starting point before any user interaction.

---

## Concept 3: What Are React Hooks?

### 🧠 What is it?

**Hooks** are special functions in React that all start with `use` (like `useState`, `useEffect`, `useRef`). They allow you to "hook into" React features from within component functions.

### ❓ Why do we need it?

Hooks provide a clean, functional way to add features like state management, side effects, and more to your components — without using class-based components.

### ⚙️ How it works

**Rules of Hooks:**
- Must be called **inside component functions** (not regular JS functions)
- Must be called at the **top level** of the component (not inside loops, conditions, or nested functions)
- All hook names start with `use`

```jsx
// ✅ Correct — inside a component function
function MyComponent() {
  const [value, setValue] = useState(0);
}

// ❌ Wrong — inside a regular function
function regularFunction() {
  const [value, setValue] = useState(0); // Error!
}
```

### 💡 Insight

The `use` prefix isn't just a naming convention — it's a signal to React (and React's linting tools) that this function follows the rules of hooks.

---

## Concept 4: Array Destructuring with `useState`

### 🧠 What is it?

`useState` returns an array with two elements. Instead of accessing them by index, we use **array destructuring** to give them meaningful names.

### ❓ Why do we need it?

It makes the code far more readable. Without destructuring, you'd be working with `stateData[0]` and `stateData[1]` — not very descriptive.

### ⚙️ How it works

**Without destructuring:**
```jsx
const stateData = useState('');
const enteredBody = stateData[0];        // current value
const setEnteredBody = stateData[1];     // updating function
```

**With destructuring (preferred):**
```jsx
const [enteredBody, setEnteredBody] = useState('');
```

The naming convention is: `[value, setValue]` — the setter function starts with `set` followed by the state name.

### 💡 Insight

Using `const` here is intentional and correct. Each time React re-executes the component function, it creates a **brand new** constant. The previous one is gone. So you never need to reassign it — that's what `setEnteredBody` is for.

---

## Concept 5: How State Updates Trigger Re-Renders

### 🧠 What is it?

When you call the state updating function (like `setEnteredBody`), React doesn't just store a new value — it **re-executes the entire component function**. This produces a new JSX snapshot, which React compares with the previous one and updates only the parts of the DOM that changed.

### ❓ Why do we need it?

This is the core of React's reactivity. Without this mechanism, your UI would be static and you'd be back to manually manipulating the DOM.

### ⚙️ How it works

1. You call `setEnteredBody('Hello')`
2. React stores `'Hello'` as the new state value
3. React calls the `NewPost` function again
4. `useState('')` now returns `'Hello'` as the current value (not the initial `''`)
5. A new JSX snapshot is produced
6. React **diffs** the new snapshot against the old one
7. Only the changed parts of the DOM get updated

### 💡 Insight

React's diffing algorithm is what makes it efficient. It doesn't re-render the entire page — just the parts that actually changed. This is why React is called a library for building user interfaces, not a library for updating the DOM.

---

## ✅ Key Takeaways

- Regular variables don't trigger UI updates — use `useState` instead
- `useState` returns `[currentValue, updatingFunction]`
- Calling the updating function re-executes the component and produces a new JSX snapshot
- React compares snapshots and only updates the DOM where changes occurred
- Hooks must be called inside component functions, at the top level
- Use `const` for state variables — they're recreated on every render

## ⚠️ Common Mistakes

- Trying to update state by reassigning a variable (`enteredBody = 'new value'`) — this does nothing
- Adding parentheses when passing handler functions to event props
- Calling hooks inside conditions or loops — this breaks React's internal tracking
- Forgetting to import `useState` from `'react'`

## 💡 Pro Tips

- Follow the `[value, setValue]` naming convention for clarity
- The initial value passed to `useState` is only used on the **first render** — subsequent renders use the updated state
- You can have multiple `useState` calls in a single component — each manages an independent piece of state
