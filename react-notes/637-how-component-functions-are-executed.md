# How Component Functions Are Executed

## Introduction

Here's a question that trips up many beginners: you changed a variable in your event handler, so why doesn't the screen update? The answer lies in understanding **how React executes component functions**. This lesson reveals that React only calls your component function once by default — and if you want it to run again, you need something special.

---

## Concept 1: The Initial Render Cycle

### 🧠 What is it?

When your React app loads, React starts at the root component (typically `App`, referenced in `index.js`) and calls that component function. If the JSX returned by that function includes custom components, React calls those component functions too — and so on, recursively, until there are no more custom components to evaluate.

### ❓ Why do we need to understand this?

Because it explains a crucial limitation: **React doesn't re-run your component functions automatically**. After the initial render, React is done. If you change a variable inside a click handler, React has no idea anything changed — it already executed your function, got the JSX, and rendered it.

### ⚙️ How it works

1. The app starts via `index.js`, which points React to the `App` component.
2. React calls `App()`, which returns JSX.
3. If that JSX contains `<ExpenseItem />`, React calls the `ExpenseItem()` function.
4. If `ExpenseItem` returns JSX with more custom components, React calls those too.
5. This continues until the entire tree is resolved into plain HTML/DOM instructions.
6. React renders the final result to the screen — **and then stops**.

### 🧪 Example

```
App() → returns JSX with <Expenses />
  └── Expenses() → returns JSX with <ExpenseItem />, <ExpenseItem />, ...
        └── ExpenseItem() → returns JSX with <Card />, <ExpenseDate />
              └── Card() → returns final HTML
              └── ExpenseDate() → returns final HTML
```

React traverses this tree once, evaluates everything, and paints the result.

### 💡 Insight

Think of the initial render like baking a cake. React follows the recipe (your component functions), produces the cake (the DOM), and puts it on the table. After that, it walks away. If you secretly swap an ingredient (change a variable), the cake on the table doesn't magically change — you'd need to bake it again.

---

## Concept 2: Why Changing a Variable Doesn't Update the UI

### 🧠 What is it?

If you create a variable with `let` and change its value inside an event handler, the value does change in memory — but React doesn't know about it and doesn't re-render the component.

### ❓ Why do we need it?

This is the most common "aha moment" for React beginners. You'll write code like this, expect it to work, and be confused when nothing happens on screen. Understanding *why* it fails points you directly to **state** as the solution.

### ⚙️ How it works

```jsx
function ExpenseItem(props) {
  let title = props.title;

  const clickHandler = () => {
    title = 'Updated!';    // ✅ The variable changes in memory
    console.log(title);     // ✅ Logs "Updated!"
  };

  return (
    <div>
      <h2>{title}</h2>       {/* ❌ Still shows the original value */}
      <button onClick={clickHandler}>Change Title</button>
    </div>
  );
}
```

The variable changes, the `console.log` proves it — but the screen stays the same. Why?

Because React already called `ExpenseItem()`, got the JSX, and rendered it. Changing `title` later doesn't trigger React to call the function again. And even if it did, `let title = props.title` would reinitialize it back to the original value!

### 💡 Insight

There are actually **two problems** here:
1. React doesn't re-execute the component function when a regular variable changes.
2. Even if it did, the variable would be re-initialized from `props.title` on every execution.

This is exactly why React provides **state** — a mechanism that solves both problems.

---

## Concept 3: Enter the State Concept

### 🧠 What is it?

State is React's answer to the "I changed something, now update the screen" problem. It's a special kind of variable that, when updated, tells React: "Hey, re-run this component function and re-evaluate the JSX."

### ❓ Why do we need it?

Because regular variables can't trigger re-renders. You need a way to:
1. Store data that persists across renders
2. Signal to React that the data changed and the UI needs updating

State does both.

### 💡 Insight

This is the fundamental insight of React: your component function is just a function. It runs, produces output, and is done. If you want it to run again with different data, you need a mechanism that React is aware of — and that mechanism is **state**. We'll dive deep into how to use it in the next lesson.

---

## ✅ Key Takeaways

- React calls your component functions during the initial render, then stops
- Changing a regular variable does **not** trigger a re-render
- Even if re-rendering occurred, `let title = props.title` would reinitialize the variable
- React needs to be explicitly **told** when something changed — that's what state is for
- The entire component tree is evaluated top-down, starting from the root in `index.js`

## ⚠️ Common Mistakes

- Expecting a regular `let` variable to update the UI when changed — it won't
- Assuming React "watches" variables for changes — it doesn't
- Confusing "the variable changed" with "the UI updated" — they're completely separate without state

## 💡 Pro Tips

- Use `console.log` to verify your handler is running and the variable is changing — this confirms the issue is rendering, not logic
- This understanding of React's execution model is essential for debugging — when the UI doesn't update, your first question should be: "Am I using state?"
