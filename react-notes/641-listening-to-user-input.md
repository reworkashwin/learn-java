# Listening to User Input

## Introduction

You've got a form on screen — now how do you actually capture what the user types? This lesson connects the dots between **event listeners on inputs**, the **event object** provided by the browser, and extracting the **current value** from the input. It's the bridge between having a form and actually doing something with the data.

---

## Concept 1: The onChange Event for Inputs

### 🧠 What is it?

Just like `onClick` for buttons, React provides `onChange` for input elements. It fires every time the input value changes — on every keystroke for text inputs, on every adjustment for number inputs, and on every date selection for date pickers.

### ❓ Why do we need it?

You need to know when the user types something so you can capture and store that value. `onChange` is the universal listener that works across all input types — text, number, date, dropdowns, etc.

### ⚙️ How it works

1. Define a handler function (e.g., `titleChangeHandler`).
2. Add `onChange={titleChangeHandler}` to the input element.
3. React wires up the event listener behind the scenes.
4. Every time the input value changes, your handler function executes.

### 🧪 Example

```jsx
const titleChangeHandler = () => {
  console.log('Title changed!');
};

return (
  <input type="text" onChange={titleChangeHandler} />
);
```

Every keystroke in the text field logs "Title changed!" to the console.

### 💡 Insight

You might wonder: why `onChange` instead of `onInput`? In vanilla JavaScript, `change` and `input` events behave differently. But in React, `onChange` behaves like `input` — it fires on every change, not just on blur. And it works consistently across **all** input types, making it the go-to choice.

---

## Concept 2: The Event Object

### 🧠 What is it?

When an event occurs, the browser automatically passes an **event object** to your handler function. This object contains information about the event — most importantly, a reference to the element that triggered it.

### ❓ Why do we need it?

The event object is how you get the actual value the user entered. Without it, you'd know *that* something changed but not *what* changed to.

### ⚙️ How it works

1. Your handler function automatically receives the event object as its first argument.
2. `event.target` gives you the DOM element that triggered the event (the input).
3. `event.target.value` gives you the **current value** of that input at the moment the event fired.

### 🧪 Example

```jsx
const titleChangeHandler = (event) => {
  console.log(event.target.value);
};
```

Type "Hello" into the input — the console shows: `"H"`, `"He"`, `"Hel"`, `"Hell"`, `"Hello"`. Each keystroke gives you the complete current value.

### 💡 Insight

This is standard browser behavior, not a React feature. React just makes it easy to access. The event object is the same one you'd get in vanilla JavaScript with `addEventListener` — React doesn't modify it (well, it wraps it in a `SyntheticEvent`, but the API is identical).

---

## Concept 3: Storing Input Values with State

### 🧠 What is it?

Once you can read the input value from the event object, the next step is **storing** it. You use `useState` to create a state variable for the input, and update it inside the change handler.

### ❓ Why do we need it?

You need to store the value so it's available later — for example, when the form is submitted. Without state, the value exists only briefly during the event handler execution and is lost immediately after.

### ⚙️ How it works

1. Create state: `const [enteredTitle, setEnteredTitle] = useState('');`
2. In the handler, call `setEnteredTitle(event.target.value)`.
3. The value is now stored in state and survives re-renders.

### 🧪 Example

```jsx
import { useState } from 'react';

const ExpenseForm = () => {
  const [enteredTitle, setEnteredTitle] = useState('');

  const titleChangeHandler = (event) => {
    setEnteredTitle(event.target.value);
  };

  return (
    <form>
      <input type="text" onChange={titleChangeHandler} />
    </form>
  );
};
```

### 💡 Insight

We initialize with an empty string (`''`) because when the component first renders, nothing has been typed yet. Note that `event.target.value` always returns a **string** — even for number inputs. The value `42` comes through as `"42"`. Keep this in mind when you need to do math with it later.

---

## ✅ Key Takeaways

- Use `onChange` to listen for input value changes — it fires on every keystroke
- The handler function automatically receives an **event object** from the browser
- `event.target.value` gives you the current value of the input
- Store the value in state with `useState` so it persists and is available for form submission
- `event.target.value` is always a **string**, regardless of input type

## ⚠️ Common Mistakes

- Forgetting to accept the `event` parameter in the handler function — without it, you can't access the value
- Trying to access `event.value` instead of `event.target.value` — `target` is the element, `value` is a property of the element
- Not initializing state with an appropriate default — use `''` for text/number/date inputs

## 💡 Pro Tips

- Name your handlers to match the input: `titleChangeHandler`, `amountChangeHandler`, `dateChangeHandler`
- Log `event.target.value` during development to verify you're capturing the right data
- The same `onChange` + `event.target.value` pattern works for text, number, date, select, and textarea elements
