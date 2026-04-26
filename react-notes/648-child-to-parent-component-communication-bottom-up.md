# Child-to-Parent Component Communication (Bottom-Up)

## Introduction

Up to now, we've passed data **downward** — from parent to child — using props. But what happens when a child component generates data that the parent needs? Think about it: our `ExpenseForm` collects user input, but the `App` component needs that data to add it to the expenses list. This lecture teaches the essential React pattern for **communicating upward** from child to parent.

---

## The Problem

### 🧠 What is it?

Data flows **one direction** in React — top to bottom via props. But sometimes a child component produces data (like form input) that a parent or even a grandparent component needs.

### ❓ Why can't we just pass data up directly?

Props only go downward. There's no built-in mechanism to pass data from child to parent... or is there? Actually, we've already been doing something very similar without realizing it.

---

## The Pattern — Props as Function Pointers

### ⚙️ How it works

Think about how `onChange` works on an `<input>`:
- You pass a **function** as a prop (`onChange={titleChangeHandler}`)
- The input **calls that function** when something happens, passing data (the event) as an argument

We can do the **exact same thing** with our own custom components!

1. **Parent defines a function** that expects to receive data
2. **Parent passes that function** to the child as a prop
3. **Child calls the function** and passes its data as an argument

### 🧪 Example — Step by Step

**Step 1: Define the handler in the parent (NewExpense)**
```jsx
const saveExpenseDataHandler = (enteredExpenseData) => {
  const expenseData = {
    ...enteredExpenseData,
    id: Math.random().toString(),
  };
  console.log(expenseData);
};
```

**Step 2: Pass it down as a prop**
```jsx
<ExpenseForm onSaveExpenseData={saveExpenseDataHandler} />
```

**Step 3: Call it from the child (ExpenseForm)**
```jsx
const submitHandler = (event) => {
  event.preventDefault();

  const expenseData = {
    title: enteredTitle,
    amount: enteredAmount,
    date: new Date(enteredDate),
  };

  props.onSaveExpenseData(expenseData); // call parent's function with data!
};
```

### 💡 Insight

> You're not breaking the one-way data flow. You're passing a **function reference** down (parent → child), and the child **invokes** it. The data travels up as a **function argument**, not as a prop going backwards.

---

## Chaining Communication Across Multiple Levels

What if you need data in a grandparent? You **chain** the pattern:

```
ExpenseForm → NewExpense → App
```

1. `App` defines `addExpenseHandler` and passes it to `NewExpense` via `onAddExpense` prop
2. `NewExpense` defines `saveExpenseDataHandler`, passes it to `ExpenseForm` via `onSaveExpenseData` prop
3. `ExpenseForm` calls `props.onSaveExpenseData(data)` — data reaches `NewExpense`
4. Inside `saveExpenseDataHandler`, `NewExpense` calls `props.onAddExpense(enrichedData)` — data reaches `App`

```jsx
// In App.js
const addExpenseHandler = (expense) => {
  console.log('In App.js:', expense);
};

<NewExpense onAddExpense={addExpenseHandler} />
```

```jsx
// In NewExpense.js
const saveExpenseDataHandler = (enteredExpenseData) => {
  const expenseData = { ...enteredExpenseData, id: Math.random().toString() };
  props.onAddExpense(expenseData); // forward up to App
};

<ExpenseForm onSaveExpenseData={saveExpenseDataHandler} />
```

---

## The Naming Convention

Props that hold function references are typically named starting with `on`:
- `onSaveExpenseData`
- `onAddExpense`
- `onChange`

This signals to other developers: "this prop expects a function that will be called when something happens."

---

## ✅ Key Takeaways

- To pass data **upward**, pass a function as a prop from parent to child, then call it in the child
- The child invokes the parent's function and passes data as an argument — that's how data flows up
- You can **chain** this pattern through multiple levels (child → parent → grandparent)
- You **cannot skip** intermediate components — each level must relay the function
- Name function props with an `on` prefix by convention (e.g., `onSaveExpenseData`)

## ⚠️ Common Mistakes

- **Executing the function** when passing it as a prop: `onSave={handler()}` — this runs immediately! Use `onSave={handler}` (no parentheses)
- Forgetting to accept `props` in the child component and then wondering why `props.onSaveExpenseData` is undefined
- Trying to skip levels — you must pass through each intermediate component

## 💡 Pro Tips

- This is one of the **most important patterns** in React — you'll use it constantly
- Later, you'll learn about Context API and state management libraries that can reduce prop drilling through many levels
- Think of it as: "the parent gives the child a phone number (function), and the child calls it when they have something to say (data)"
