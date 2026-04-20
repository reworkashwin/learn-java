# Managing State & Using Hooks

## Introduction

We've seen that regular variables can't update the UI. Now it's time to learn the solution — **React State**. State is the mechanism that lets React components hold, update, and react to changing data. Combined with **Hooks**, it's the key to building truly interactive UIs.

---

## What is State?

State is a special kind of variable that:

1. Is **managed by React** (not just plain JavaScript)
2. When updated, **triggers a re-render** of the component
3. **Persists** across re-renders (unlike regular variables that reset)

> Think of State as a component's **memory** — it remembers values between re-renders.

---

## Introducing `useState` — Your First Hook

To create State, you use the `useState` function imported from React:

```jsx
import { useState } from 'react';
```

### What is a Hook?

`useState` is a **React Hook**. Hooks are special functions (all starting with `use`) that let you "hook into" React's internal features. They follow two strict rules:

### The Rules of Hooks

1. **Only call Hooks inside component functions** (or inside other custom Hooks)
2. **Only call Hooks at the top level** — never inside loops, conditions, or nested functions

```jsx
function App() {
  // ✅ Top level of component — correct
  const [value, setValue] = useState('initial');

  function handleClick() {
    // ❌ Inside a nested function — NOT allowed
    const [bad, setBad] = useState('nope');
  }

  if (true) {
    // ❌ Inside a condition — NOT allowed
    const [also bad, setAlsoBad] = useState('nope');
  }
}
```

---

## How `useState` Works

`useState` takes one argument (the **initial value**) and returns an **array with exactly two elements**:

```jsx
const [currentValue, updaterFunction] = useState(initialValue);
```

| Element | What It Is | Purpose |
|---------|-----------|---------|
| First (`currentValue`) | The current state snapshot | Use this to read the data |
| Second (`updaterFunction`) | A function provided by React | Call this to update the data AND trigger a re-render |

### Naming Convention

The second element is conventionally named `set` + the first element's name:

```jsx
const [selectedTopic, setSelectedTopic] = useState('Please click a button');
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
```

---

## Using State in Practice

```jsx
import { useState } from 'react';

function App() {
  const [selectedTopic, setSelectedTopic] = useState('Please click a button');

  function handleSelect(selectedButton) {
    setSelectedTopic(selectedButton);  // Update state + trigger re-render
  }

  return (
    <div>
      <TabButton onSelect={() => handleSelect('components')}>Components</TabButton>
      <TabButton onSelect={() => handleSelect('jsx')}>JSX</TabButton>
      <p>{selectedTopic}</p>  {/* This NOW updates when buttons are clicked! */}
    </div>
  );
}
```

When `setSelectedTopic` is called:
1. React **schedules** a state update with the new value
2. React **re-executes** the `App` component function
3. `useState` now returns the **updated value** as the first element
4. The JSX is re-evaluated with the new data
5. React updates the **DOM** where differences exist

---

## The "Stale State" Gotcha

Here's something that trips up many beginners:

```jsx
function handleSelect(selectedButton) {
  setSelectedTopic(selectedButton);
  console.log(selectedTopic);  // ⚠️ Logs the OLD value!
}
```

After calling `setSelectedTopic`, the state update is **scheduled**, not instant. The current function execution still has the old value. The new value is only available **after the component re-renders**.

> Think of `setSelectedTopic` as placing an order at a restaurant. The food (new value) isn't ready instantly — it arrives when the next render "serving" happens.

---

## Why `const` Works

You might wonder: if the value changes, why do we use `const`?

```jsx
const [selectedTopic, setSelectedTopic] = useState('initial');
```

Because `const` is **recreated** on each function execution. When React re-renders the component, it calls the function again, creates a *new* `const`, and gives it the *updated* value. The old `const` from the previous render is gone.

---

## The Complete Mental Model

```
1st Render:  App() executes → selectedTopic = "Please click a button" → UI rendered
                                        │
                               (user clicks "Components")
                                        │
                               setSelectedTopic("components") → React schedules update
                                        │
2nd Render:  App() executes again → selectedTopic = "components" → UI updated
```

---

## ✅ Key Takeaways

- **State** is data managed by React that triggers re-renders when updated
- `useState` returns `[currentValue, setterFunction]` — always two elements
- Calling the setter function **updates the value AND re-renders the component**
- State updates are **scheduled**, not immediate — the new value is available on the next render
- Hooks must be called at the **top level** of component functions — never inside conditions or loops

## ⚠️ Common Mistakes

- Logging state right after setting it and expecting the new value — you'll see the old value
- Calling Hooks inside `if` statements, loops, or nested functions — this breaks React
- Forgetting to import `useState` from `'react'`
- Using `=` to update state instead of the setter function — this won't trigger a re-render

## 💡 Pro Tips

- `useState` is just the first Hook — React offers many others (`useEffect`, `useContext`, `useRef`, etc.)
- You can have **multiple** `useState` calls in one component — each manages independent state
- State is **local** to each component instance — two `<App />` components would each have their own state
- The initial value passed to `useState` is only used on the **first render** — it's ignored on re-renders
