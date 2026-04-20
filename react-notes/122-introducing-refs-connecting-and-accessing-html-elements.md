# Introducing Refs: Connecting & Accessing HTML Elements via Refs

## Introduction

After seeing how verbose state-based input handling can be, it's time to meet **refs** — one of React's most useful (and often underused) features. A ref gives you a direct line to a DOM element without the overhead of tracking every keystroke in state.

In this lecture, we dramatically simplify the Player component by replacing most of our state logic with a single `useRef`.

---

## What Is a Ref?

A **ref** (short for reference) is a special value managed by React. Like state, it persists across re-renders. Unlike state, **changing a ref does NOT cause a re-render**.

You create a ref using the `useRef` hook:

```jsx
import { useRef } from 'react';

function Player() {
  const playerName = useRef();
  // ...
}
```

The `useRef` hook returns an object with a single property: **`current`**. That's where the actual value lives — always.

```js
// The ref object always looks like this:
{ current: <whatever-value> }
```

---

## Connecting a Ref to a DOM Element

Here's where refs get powerful. You can **connect** a ref to any JSX element using the special `ref` prop:

```jsx
<input ref={playerName} />
```

Once React renders this component, `playerName.current` will hold a reference to the actual, native HTML `<input>` element in the DOM. That means you can access all the properties and methods that a real input element has — `value`, `focus()`, `select()`, etc.

> Think of it like putting a name tag on a DOM element. Instead of searching through the DOM to find it, you already have a direct reference sitting in your pocket.

---

## Simplifying the Player Component

With refs, the Player component becomes drastically simpler:

```jsx
import { useState, useRef } from 'react';

function Player() {
  const playerName = useRef();
  const [enteredPlayerName, setEnteredPlayerName] = useState('');

  function handleClick() {
    setEnteredPlayerName(playerName.current.value);
  }

  return (
    <section>
      <h2>Welcome {enteredPlayerName || 'unknown entity'}</h2>
      <input ref={playerName} />
      <button onClick={handleClick}>Set Name</button>
    </section>
  );
}
```

### What Changed?

- **No `onChange` handler** — we're not tracking keystrokes anymore
- **No `value` prop on input** — no two-way binding needed
- **No `submitted` state** — we simply check if `enteredPlayerName` is truthy
- **One state, one ref** — clean and simple

### How It Works

1. The user types into the input (React doesn't know or care about each keystroke)
2. When the button is clicked, `handleClick` reads the current value directly from the DOM via `playerName.current.value`
3. That value is stored in state, which triggers a re-render and updates the UI

---

## The `||` vs `??` Shortcut

Instead of a ternary expression, you can use the **nullish coalescing operator** (`??`) or the **logical OR** (`||`):

```jsx
// These are similar but subtly different:
enteredPlayerName || 'unknown entity'   // falsy check (empty string = falsy)
enteredPlayerName ?? 'unknown entity'   // null/undefined check only
```

For our case, `||` works because an empty string is falsy, which is exactly when we want to show "unknown entity."

---

## Why Refs Exist

Refs exist for situations where you need to **read** a value without **reacting** to every change. The classic use case is form inputs where you only care about the value at submission time.

| Feature | useState | useRef |
|---------|----------|--------|
| Persists across re-renders | ✅ | ✅ |
| Triggers re-render on change | ✅ | ❌ |
| Best for UI-driving values | ✅ | ❌ |
| Best for "read on demand" | ❌ | ✅ |

---

## ✅ Key Takeaways

- `useRef()` creates a ref object with a `.current` property
- Connect a ref to a DOM element via the `ref` prop — `playerName.current` then holds the actual DOM element
- Refs let you **read** DOM values directly without tracking every change in state
- You still need `useState` when values should be reflected in the UI — refs alone won't trigger re-renders

## ⚠️ Common Mistakes

- Forgetting to access `.current` — `playerName` is the ref object, `playerName.current` is the actual element
- Trying to access `ref.current` before the component has mounted (it's `undefined` on the first render)

## 💡 Pro Tips

- Use refs for **reading** values on demand (form submissions, measurements)
- Use state for values that **drive the UI** and need to trigger re-renders
- You can pass any initial value to `useRef(initialValue)` — it doesn't have to be connected to an element
