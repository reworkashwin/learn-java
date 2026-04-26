# Handling Form Submission

## Introduction

We've been capturing user input with state, but what good is collecting data if we can't **submit** the form? This lecture covers how to properly handle form submission in React — listening to the submit event, preventing the default browser behavior, and gathering all state slices into a single data object.

---

## Listening to Form Submission

### 🧠 What is it?

HTML forms have a built-in `submit` event that fires when a button (especially with `type="submit"`) inside the form is pressed. In React, we listen to this with the `onSubmit` prop on the `<form>` element.

### ❓ Why not use onClick on the button?

You *could*, but listening on the `<form>` itself is better because:
- It captures submission via Enter key too, not just button clicks
- It follows standard web form behavior
- It's the idiomatic React approach

### ⚙️ How it works

```jsx
const submitHandler = (event) => {
  event.preventDefault(); // crucial!
  // gather and process data here
};

return (
  <form onSubmit={submitHandler}>
    {/* inputs here */}
    <button type="submit">Add Expense</button>
  </form>
);
```

---

## Preventing Default Browser Behavior

### 🧠 What is it?

By default, the browser **sends an HTTP request** to the server and **reloads the page** when a form is submitted. That's classic multi-page app behavior, but we don't want that in a React SPA.

### ⚙️ How it works

The `event` object has a `preventDefault()` method (standard JavaScript, not React-specific) that stops this default behavior:

```jsx
const submitHandler = (event) => {
  event.preventDefault(); // no page reload, no request sent
};
```

### 💡 Insight

> Without `event.preventDefault()`, your entire React app would reload on form submission, losing all state. This is the **first thing** you should do in any form submit handler.

---

## Gathering State Into a Data Object

### 🧪 Example

Once you've prevented the default behavior, combine your state slices into a single object:

```jsx
const submitHandler = (event) => {
  event.preventDefault();

  const expenseData = {
    title: enteredTitle,
    amount: enteredAmount,
    date: new Date(enteredDate),
  };

  console.log(expenseData);
};
```

Notice how `enteredDate` is passed to `new Date()` to convert the date string into a proper JavaScript `Date` object.

---

## The Complete Flow

1. User fills in the form fields → state updates via `onChange` handlers
2. User clicks "Add Expense" (or presses Enter) → `onSubmit` fires
3. `event.preventDefault()` stops the page from reloading
4. State values are combined into an object
5. That object can be logged, sent to a server, or passed to a parent component

---

## ✅ Key Takeaways

- Use `onSubmit` on the `<form>` element, not `onClick` on the button
- **Always** call `event.preventDefault()` to stop the browser from reloading the page
- `preventDefault()` is vanilla JavaScript — not a React invention
- Gather your individual state slices into a unified data object upon submission
- Use `new Date(dateString)` to convert date input strings into Date objects

## ⚠️ Common Mistakes

- Forgetting `event.preventDefault()` — the page reloads and all state is lost
- Listening for `onClick` on the submit button instead of `onSubmit` on the form — misses Enter key submissions
- Not converting date strings to `Date` objects when you need date operations later

## 💡 Pro Tips

- The submit handler is a great place to add validation before processing the data
- After submission, you'll typically want to clear the form inputs — that's where two-way binding comes in (next lesson)
- The data object property names are up to you, but keep them consistent with what the rest of your app expects
