# Updating State That Depends on the Previous State

## Introduction

Here's a subtle but critical rule in React: **whenever your state update depends on the previous state, you must use the function form of the state setter.** This lecture explains why the simpler approach can fail, how React schedules updates behind the scenes, and the correct pattern you should memorize and use everywhere.

---

## The Problem with Direct State Updates

### 🧠 What is it?

When you update state by referencing the current state variable directly (e.g., `...userInput`), you might be working with a **stale snapshot** of state.

### ❓ Why is this a problem?

React **schedules** state updates — it doesn't apply them instantly. If you schedule multiple state updates at the same time, each one might be reading the **same outdated snapshot** instead of the latest one. This means some updates could get lost.

### 🧪 Example — The Wrong Way

```jsx
const titleChangeHandler = (event) => {
  setUserInput({
    ...userInput,  // ⚠️ userInput might be outdated!
    enteredTitle: event.target.value,
  });
};
```

This works *most* of the time, but in edge cases — especially when multiple rapid state updates are batched — `userInput` might not reflect the most recent state.

---

## The Function Form — The Correct Way

### ⚙️ How it works

Instead of passing an object directly, **pass a function** to your state setter. React will call that function with the **guaranteed latest state snapshot** as an argument.

```jsx
const titleChangeHandler = (event) => {
  setUserInput((prevState) => {
    return {
      ...prevState,
      enteredTitle: event.target.value,
    };
  });
};
```

### 💡 Insight

> When you pass a function to a state setter, React guarantees that `prevState` is always the **most recent snapshot**, including all pending scheduled updates. This eliminates race conditions entirely.

---

## When to Use the Function Form

The rule is simple:

> **If your new state depends on the previous state in any way, use the function form.**

This applies to:
- **Object state** where you spread in previous values
- **Counters** — `setCount(prev => prev + 1)`
- **Arrays** — `setItems(prev => [...prev, newItem])`
- **Toggles** — `setOpen(prev => !prev)`

---

## Side by Side Comparison

```jsx
// ❌ Risky — could use stale state
setCount(count + 1);

// ✅ Safe — always uses latest state
setCount((prevCount) => prevCount + 1);
```

```jsx
// ❌ Risky — userInput might be outdated
setUserInput({ ...userInput, enteredTitle: value });

// ✅ Safe — prevState is guaranteed current
setUserInput((prevState) => ({
  ...prevState,
  enteredTitle: value,
}));
```

---

## ✅ Key Takeaways

- React **schedules** state updates — they don't happen synchronously
- Referencing the state variable directly can give you a **stale snapshot**
- The **function form** (`setState(prev => ...)`) guarantees you always have the latest state
- **Memorize this rule:** if your update depends on previous state, use the function form
- This applies universally — objects, arrays, counters, toggles, anything

## ⚠️ Common Mistakes

- Using `setState(currentState + 1)` instead of `setState(prev => prev + 1)` — works most of the time but can fail under rapid updates
- Thinking "it works fine so it must be correct" — the bug only appears in specific timing scenarios, making it hard to catch

## 💡 Pro Tips

- Make it a habit to **always** use the function form when depending on previous state — even if the simpler form seems to work
- This pattern becomes even more critical in complex apps with many state updates happening in quick succession
- The function form works the same whether you're using individual states or a combined object state
