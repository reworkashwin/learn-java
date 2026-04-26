# Working with Multiple States

## Introduction

A form with three inputs needs three pieces of state. But can you call `useState` multiple times in the same component? Absolutely. This lesson covers how to manage **multiple independent state slices** within a single component — one for each input field.

---

## Concept 1: Multiple useState Calls

### 🧠 What is it?

You can call `useState` as many times as you need inside a component. Each call creates a **separate, independent** piece of state. Updating one does not affect the others.

### ❓ Why do we need it?

Our expense form has three inputs: title, amount, and date. Each needs its own state to track what the user has entered. Without separate states, we'd have no way to independently manage and access each value.

### ⚙️ How it works

Just call `useState` once per piece of data:

```jsx
const [enteredTitle, setEnteredTitle] = useState('');
const [enteredAmount, setEnteredAmount] = useState('');
const [enteredDate, setEnteredDate] = useState('');
```

Each pair (`enteredTitle`/`setEnteredTitle`, etc.) is completely independent. Updating the title doesn't touch the amount or date.

### 🧪 Example

```jsx
import { useState } from 'react';

const ExpenseForm = () => {
  const [enteredTitle, setEnteredTitle] = useState('');
  const [enteredAmount, setEnteredAmount] = useState('');
  const [enteredDate, setEnteredDate] = useState('');

  const titleChangeHandler = (event) => {
    setEnteredTitle(event.target.value);
  };

  const amountChangeHandler = (event) => {
    setEnteredAmount(event.target.value);
  };

  const dateChangeHandler = (event) => {
    setEnteredDate(event.target.value);
  };

  return (
    <form>
      <div>
        <label>Title</label>
        <input type="text" onChange={titleChangeHandler} />
      </div>
      <div>
        <label>Amount</label>
        <input type="number" min="0.01" step="0.01" onChange={amountChangeHandler} />
      </div>
      <div>
        <label>Date</label>
        <input type="date" min="2019-01-01" max="2022-12-31" onChange={dateChangeHandler} />
      </div>
    </form>
  );
};
```

### 💡 Insight

This pattern — one `useState` per input — is extremely common in React. You'll see it in virtually every form component. Each state slice has its own handler, its own setter, and its own value. Clean, simple, independent.

---

## Concept 2: State Independence

### 🧠 What is it?

Each `useState` call creates a completely isolated piece of state. They don't know about each other, they don't interfere with each other, and updating one has zero effect on the others.

### ❓ Why do we need to know this?

Because it gives you confidence that your form won't behave weirdly. When you type a title, only `enteredTitle` changes. The amount and date remain exactly as they were. There are no side effects or cross-contamination between state slices.

### ⚙️ How it works

React internally tracks each `useState` call by the **order** in which it's called within the component. Call #1 → first state, Call #2 → second state, Call #3 → third state. This is why hooks must always be called in the same order (no conditionals!).

### 💡 Insight

This order-based tracking is why React has the "Rules of Hooks" — hooks must be called at the top level of your component, never inside conditionals or loops. If the order changes between renders, React would mix up which state belongs to which variable.

---

## Concept 3: All Input Values Are Strings

### 🧠 What is it?

Regardless of the input type — text, number, or date — `event.target.value` always returns a **string**. A number input with value `42` gives you `"42"`. A date input gives you `"2022-05-15"`.

### ❓ Why do we need to know this?

Because if you later need to do math with the amount or create a `Date` object from the date, you'll need to convert the string. Initializing all states with `''` (empty string) is consistent with this behavior.

### ⚙️ How it works

```jsx
const amountChangeHandler = (event) => {
  setEnteredAmount(event.target.value); // Always a string like "42.50"
};

// Later, when submitting:
const amount = +enteredAmount; // Convert to number with unary +
const date = new Date(enteredDate); // Convert to Date object
```

### 💡 Insight

This is a browser behavior, not a React thing. HTML inputs always store their value as a string. This is why it makes sense to initialize all input states as empty strings — you're matching the data type that will come back from the input.

---

## ✅ Key Takeaways

- You can call `useState` **multiple times** in a single component — once per piece of data
- Each state slice is **independent** — updating one doesn't affect the others
- Match each input to its own state and handler: `enteredTitle`/`titleChangeHandler`, etc.
- All input values from `event.target.value` are **strings**, regardless of input type
- This "multiple independent states" pattern is the standard approach for React forms

## ⚠️ Common Mistakes

- Calling `useState` inside a conditional or loop — hooks must always be called in the same order
- Assuming number inputs give you numbers — they give you strings
- Forgetting to wire up `onChange` on all inputs — easy to miss one when copy-pasting
- Mixing up handler names — make sure `amountChangeHandler` is attached to the amount input, not the date input

## 💡 Pro Tips

- There's an alternative approach: using a **single state object** with all three values. We'll explore that next — but multiple `useState` calls is perfectly valid and often preferred for simplicity
- When you have many inputs, consider if the form is getting complex enough to warrant a custom hook or form library
- Always test each input independently during development — type in each field and verify the correct handler fires
