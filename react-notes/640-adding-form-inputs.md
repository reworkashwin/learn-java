# Adding Form Inputs

## Introduction

An expense tracker needs a way to **collect new expenses** from the user. That means building a form with input fields for the title, amount, and date. This lesson focuses on setting up the form components and structuring the inputs — the groundwork that makes event handling and state management possible in the next steps.

---

## Concept 1: Creating the Form Component Structure

### 🧠 What is it?

We're creating two new components: `NewExpense` (a wrapper that provides layout and styling) and `ExpenseForm` (the actual form with input fields). This separation keeps each component focused on a single responsibility.

### ❓ Why do we need it?

Separating the form into its own component keeps things clean. The form logic (inputs, validation, submission) lives in `ExpenseForm`, while `NewExpense` handles the outer shell. This also makes the form component reusable if you ever need it elsewhere.

### ⚙️ How it works

1. Create a `new-expense/` folder inside `components/`.
2. Add `NewExpense.js` — this wraps the form in a styled container.
3. Add `ExpenseForm.js` — this contains the actual `<form>` element and inputs.
4. `NewExpense` renders `ExpenseForm` inside a styled `<div>`.
5. `App.js` renders `NewExpense` at the top of the page.

### 🧪 Example

```jsx
// NewExpense.js
import ExpenseForm from './ExpenseForm';
import './NewExpense.css';

const NewExpense = () => {
  return (
    <div className="new-expense">
      <ExpenseForm />
    </div>
  );
};

export default NewExpense;
```

### 💡 Insight

Splitting the form into a wrapper and a form component is optional for a small app. But it's a good habit — when you later need to add animations, toggle visibility, or handle submission logic at a higher level, having this separation pays off.

---

## Concept 2: Building the Form Inputs

### 🧠 What is it?

The form needs three inputs: a **text** input for the title, a **number** input for the amount, and a **date** input for the date. These are standard HTML `<input>` elements with appropriate `type` attributes.

### ❓ Why do we need it?

Each expense has three pieces of data. The form must collect all three from the user. Using the right input types gives you built-in browser features like number validation and date pickers for free.

### ⚙️ How it works

Each input is wrapped in a `<div>` for styling, paired with a `<label>`:

- **Title**: `<input type="text" />` — freeform text
- **Amount**: `<input type="number" min="0.01" step="0.01" />` — only accepts numbers, with decimal precision
- **Date**: `<input type="date" min="2019-01-01" max="2022-12-31" />` — provides a date picker, restricted to a range

### 🧪 Example

```jsx
const ExpenseForm = () => {
  return (
    <form>
      <div className="new-expense__controls">
        <div className="new-expense__control">
          <label>Title</label>
          <input type="text" />
        </div>
        <div className="new-expense__control">
          <label>Amount</label>
          <input type="number" min="0.01" step="0.01" />
        </div>
        <div className="new-expense__control">
          <label>Date</label>
          <input type="date" min="2019-01-01" max="2022-12-31" />
        </div>
      </div>
      <div className="new-expense__actions">
        <button type="submit">Add Expense</button>
      </div>
    </form>
  );
};
```

### 💡 Insight

In React, `<input>` is written as a **self-closing tag** (`<input />`), because input elements don't have content between opening and closing tags. This is required in JSX — unlike HTML where `<input>` without a closing slash is valid.

---

## Concept 3: Wiring It All Up in App.js

### 🧠 What is it?

The `NewExpense` component needs to be imported and rendered in `App.js` so it appears on the page. This connects the new form to the rest of the application.

### ⚙️ How it works

```jsx
// App.js
import NewExpense from './components/new-expense/NewExpense';

function App() {
  return (
    <div>
      <NewExpense />
      <Expenses items={expenses} />
    </div>
  );
}
```

### 💡 Insight

Watch your import paths carefully. A common mistake when first building this is importing from the wrong file — e.g., importing `ExpenseForm` from `NewExpense.js` instead of `ExpenseForm.js`. This can cause infinite loops or blank screens.

---

## ✅ Key Takeaways

- Build forms by combining standard HTML `<input>` elements with labels inside a `<form>` tag
- Use appropriate `type` attributes (`text`, `number`, `date`) for built-in browser validation and UX
- Split form components: wrapper for layout, inner component for form logic
- In JSX, always self-close void elements: `<input />`, not `<input>`
- The `min`, `max`, and `step` attributes on inputs control allowed values

## ⚠️ Common Mistakes

- Importing a component from the wrong file (double-check the file name matches the component)
- Forgetting to self-close `<input>` tags in JSX
- Not adding `type="submit"` to the form button — without it, the button may not trigger form submission

## 💡 Pro Tips

- Always pair `<input>` with `<label>` for accessibility
- The `min` and `max` on date inputs restrict the date picker range — useful for business logic constraints
- CSS class names with BEM-style naming (`new-expense__control`) help keep styles organized and scoped
