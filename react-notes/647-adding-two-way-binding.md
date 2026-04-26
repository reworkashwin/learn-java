# Adding Two-Way Binding

## Introduction

We can now collect form data and handle submission — but after submitting, the inputs still show the old values. Wouldn't it be nice to **clear them automatically**? That's exactly what **two-way binding** enables. It's a key React pattern that lets you not only *read* from inputs but also *write back* to them programmatically.

---

## Two-Way Binding

### 🧠 What is it?

Two-way binding means your input is connected to state in **both directions**:
1. **Input → State:** When the user types, the state updates (via `onChange`)
2. **State → Input:** When the state changes programmatically, the input reflects that change (via `value`)

### ❓ Why do we need it?

Without two-way binding, you can listen to what the user types, but you can't **control** the input's displayed value. You need two-way binding to:
- Clear form inputs after submission
- Reset forms to default values
- Pre-fill inputs with existing data
- Implement any kind of programmatic input control

### ⚙️ How it works

Add the `value` attribute to your input and bind it to your state variable:

```jsx
<input
  type="text"
  value={enteredTitle}
  onChange={titleChangeHandler}
/>
```

Now the input always displays whatever `enteredTitle` holds. Change the state, change the input.

### 🧪 Example — Clearing Inputs After Submission

```jsx
const submitHandler = (event) => {
  event.preventDefault();

  const expenseData = {
    title: enteredTitle,
    amount: enteredAmount,
    date: new Date(enteredDate),
  };

  console.log(expenseData);

  // Reset the inputs
  setEnteredTitle('');
  setEnteredAmount('');
  setEnteredDate('');
};
```

Because each input's `value` prop is bound to its respective state, setting the state back to empty strings instantly clears the form.

### 💡 Insight

> This might sound like it would create an infinite loop — "the input updates state, state updates the input, which updates state..." — but it doesn't. React is smart enough to know that setting the same value doesn't trigger another change event.

---

## Before and After Two-Way Binding

**Without two-way binding:**
```jsx
<input type="text" onChange={titleChangeHandler} />
// You can READ from the input, but can't WRITE to it
```

**With two-way binding:**
```jsx
<input type="text" value={enteredTitle} onChange={titleChangeHandler} />
// You can both READ and WRITE — full control
```

---

## Applying to All Inputs

```jsx
<input type="text" value={enteredTitle} onChange={titleChangeHandler} />
<input type="number" value={enteredAmount} onChange={amountChangeHandler} />
<input type="date" value={enteredDate} onChange={dateChangeHandler} />
```

Each input now shows the current state and can be cleared or changed programmatically.

---

## ✅ Key Takeaways

- Two-way binding = listening to changes (`onChange`) + feeding state back into the input (`value`)
- It gives you **full programmatic control** over input values
- Setting state back to initial values after submission **clears the form** automatically
- No infinite loop — React handles this gracefully
- This is a fundamental React pattern, especially for forms

## ⚠️ Common Mistakes

- Forgetting to add the `value` prop — the input becomes "uncontrolled" and you can't reset it via state
- Setting `value` without an `onChange` handler — React will warn you about a read-only input
- Using `defaultValue` instead of `value` — `defaultValue` only sets the initial value and doesn't update

## 💡 Pro Tips

- Two-way binding makes inputs **controlled components** — React state is the single source of truth for the input's value
- This pattern is essential for any form that needs resetting, validation, or dynamic value changes
- You'll use two-way binding extensively when building filters, search bars, edit forms, and more
