# Using Stateful Lists

## Introduction

We can render lists dynamically with `map()` — great! But what if the list itself needs to **change**? When a user adds a new expense, we need to update the array and have React **re-render** the list automatically. That's where **stateful lists** come in — managing your array data with `useState` so changes trigger UI updates.

---

## The Problem — Static Arrays Don't Trigger Re-Renders

### 🧠 What is it?

If your array is just a regular variable or constant, modifying it (e.g., pushing a new item) won't cause React to update the UI. React only re-renders when **state** changes.

```jsx
const expenses = [/* ... */]; // regular variable
expenses.push(newExpense);    // React doesn't know or care
```

### ❓ Why doesn't this work?

React's rendering cycle is driven by state changes. Mutating a regular variable doesn't tell React anything changed. The component function doesn't re-execute, and the DOM stays the same.

---

## The Solution — Manage the Array as State

### ⚙️ How it works

1. Move your array data into `useState`
2. Use the state updating function to add new items
3. React detects the state change and re-renders the component
4. The `map()` call now operates on the updated array

### 🧪 Example

```jsx
import React, { useState } from 'react';

const DUMMY_EXPENSES = [
  { id: 'e1', title: 'Book', amount: 29.99, date: new Date(2021, 2, 28) },
  { id: 'e2', title: 'Car Insurance', amount: 294.67, date: new Date(2021, 5, 12) },
];

const App = () => {
  const [expenses, setExpenses] = useState(DUMMY_EXPENSES);

  const addExpenseHandler = (expense) => {
    setExpenses((prevExpenses) => {
      return [expense, ...prevExpenses];
    });
  };

  return (
    <div>
      <NewExpense onAddExpense={addExpenseHandler} />
      <Expenses items={expenses} />
    </div>
  );
};
```

### 💡 Insight

> Notice two things: (1) the dummy data is defined **outside** the component function so it's only created once, and (2) the state update uses the **function form** because we depend on the previous state.

---

## Breaking Down the State Update

```jsx
const addExpenseHandler = (expense) => {
  setExpenses((prevExpenses) => {
    return [expense, ...prevExpenses];
  });
};
```

What's happening here:
1. `expense` — the new expense object passed up from the form
2. `setExpenses()` — triggers a state update and re-render
3. `prevExpenses` — React provides the latest state snapshot
4. `[expense, ...prevExpenses]` — creates a new array with the new expense first, followed by all existing expenses
5. The spread operator `...prevExpenses` unpacks the old array into the new one

### Why the function form?

Because we're building the new state **based on the previous state**. As you learned earlier, whenever your update depends on the previous state, use the function form to guarantee you're working with the latest snapshot.

---

## The Complete Flow

1. User fills out the form and clicks "Add Expense"
2. `ExpenseForm` calls `props.onSaveExpenseData(expenseData)`
3. `NewExpense` enriches the data and calls `props.onAddExpense(enrichedData)`
4. `App`'s `addExpenseHandler` receives the data
5. `setExpenses()` creates a new array with the new expense prepended
6. React re-renders `App`, which passes the updated `expenses` to `<Expenses>`
7. `Expenses` calls `.map()` on the new array
8. The new expense appears in the list!

---

## ✅ Key Takeaways

- Regular variables and constants don't trigger re-renders — use `useState` for dynamic data
- Initialize state with your existing data (dummy data or empty array)
- Use the **function form** of the state setter when the new state depends on the previous state
- The spread operator works on arrays too: `[newItem, ...oldArray]` prepends, `[...oldArray, newItem]` appends
- Define initial/dummy data **outside** the component function to avoid re-creating it on every render

## ⚠️ Common Mistakes

- Mutating the array directly (`expenses.push(newItem)`) instead of creating a new array — React won't detect the change
- Forgetting the function form: `setExpenses([expense, ...expenses])` can use stale state under rapid updates
- Defining dummy data inside the component function — it gets re-created on every render (wasteful)

## 💡 Pro Tips

- Always treat state as **immutable** — create new arrays/objects instead of modifying existing ones
- Use `[newItem, ...prev]` to add items at the **beginning** or `[...prev, newItem]` to add at the **end**
- The `key` prop warning you'll see in the console is addressed in the next lecture — it's important for performance and correctness
