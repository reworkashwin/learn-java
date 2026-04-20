# State Scheduling & Batching

## Introduction

When you call a state-updating function in React, do you think the state changes immediately? Many developers assume it does — and this leads to one of the most common misconceptions in React. In reality, state updates are **scheduled**, not instant. And when multiple state updates happen in the same function, React is smart enough to **batch** them into a single re-render. Let's demystify how this works.

---

## State Updates Are Scheduled, Not Instant

When you call `setState` or a setter from `useState`, React **schedules** the update. It does not immediately change the state variable:

```jsx
function App() {
  const [chosenCount, setChosenCount] = useState(0);

  function handleClick() {
    setChosenCount(5);
    console.log(chosenCount); // Still 0! Not 5!
  }
}
```

Why is `chosenCount` still `0` after calling `setChosenCount(5)`? Because:

1. `setChosenCount(5)` tells React: *"Schedule a state update to 5."*
2. The current function continues executing with the **old state values**.
3. React will process the scheduled update after the current execution.
4. A new component execution is triggered with the **new state value**.
5. In that new execution, `chosenCount` will be `5`.

The state doesn't change mid-function. It changes on the **next render**.

---

## Why the Function Form Matters

Because state updates are scheduled, you can run into problems when multiple updates depend on the previous state:

```jsx
// ❌ WRONG — both use the same old state snapshot
setChosenCount(newCount);
setChosenCount(chosenCount + 1); // chosenCount is still the OLD value!
```

If `chosenCount` was `0` and `newCount` is `10`:
- First call schedules: set to `10`.
- Second call schedules: set to `0 + 1 = 1` (because `chosenCount` is still `0`).
- Final result: `1` — not `11`!

The fix is to use the **function form**:

```jsx
// ✅ CORRECT — each update gets the latest scheduled state
setChosenCount(newCount);
setChosenCount(prevCount => prevCount + 1);
```

Now:
- First call schedules: set to `10`.
- Second call schedules: take whatever the latest state is (`10`) and add `1`.
- Final result: `11` ✅

React guarantees that the function form always receives the **most recent state value** at the time the update is processed.

---

## State Batching: Multiple Updates, One Render

What if you call multiple state-updating functions in the same function?

```jsx
function handleSetClick() {
  setChosenCount(newCount);
  setChosenCount(prevCount => prevCount + 1);
}
```

You might expect two re-renders — one for each `setChosenCount` call. But React is smarter than that. It performs **state batching**: all state updates triggered from the same function are grouped together and result in only **one component re-render**.

This means:
- Both updates are scheduled.
- React processes them in order.
- The component function executes **once** with the final state.

You can verify this with a console log:

```jsx
console.log("App component executing");
```

Even with two state updates, this log appears only once.

---

## Batching Across Different State Variables

Batching also works across **different** state variables:

```jsx
function handleSomething() {
  setName("Alice");       // State update 1
  setAge(30);             // State update 2
  setIsLoggedIn(true);    // State update 3
}
```

All three updates are batched → **one re-render**, not three.

---

## ✅ Key Takeaways

- State updates are **scheduled**, not executed instantly. You can't read the new state on the next line.
- Always use the **function form** (`setState(prev => ...)`) when the new state depends on the previous state.
- React **batches** multiple state updates from the same function into a single re-render.
- Batching works across different state variables too — not just multiple calls to the same setter.

## ⚠️ Common Mistakes

- **Logging state right after updating it** — You'll get the old value. The new value is only available on the next render.
- **Chaining state updates without function form** — Each call sees the old state snapshot, leading to incorrect results.
- **Worrying about multiple setState calls causing multiple renders** — React batches them. Don't split logic into separate functions just to "avoid re-renders."

## 💡 Pro Tip

A helpful mental model: think of `setState` as sending a **message** to React saying "please update this value." React collects all messages from the current function, processes them in order, and then re-renders the component once with all the updates applied. The re-render is where you finally see the new state.
