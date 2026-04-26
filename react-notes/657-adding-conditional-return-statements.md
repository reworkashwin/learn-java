# Adding Conditional Return Statements

## Introduction

We've seen how to conditionally render *parts* of JSX. But what if your **entire component output** changes based on a condition? This lesson introduces a fourth approach to conditional rendering — **early returns** — and shows how to extract list logic into a dedicated component for cleaner code.

---

## Extracting the List into Its Own Component

### 🧠 What is it?

Instead of cramming list logic and conditional content into the `Expenses` component, we extract it into a new `ExpensesList` component. This keeps each component focused on a single responsibility.

### ⚙️ How it works

Create `ExpensesList.js` and `ExpensesList.css`:

```jsx
import ExpenseItem from './ExpenseItem';
import './ExpensesList.css';

const ExpensesList = (props) => {
  if (props.items.length === 0) {
    return <h2 className="expenses-list__fallback">Found no expenses.</h2>;
  }

  return (
    <ul className="expenses-list">
      {props.items.map((expense) => (
        <ExpenseItem
          key={expense.id}
          title={expense.title}
          amount={expense.amount}
          date={expense.date}
        />
      ))}
    </ul>
  );
};

export default ExpensesList;
```

Then use it in `Expenses.js`:

```jsx
<ExpensesList items={filteredExpenses} />
```

---

## Conditional Return Statements — A New Pattern

### 🧠 What is it?

When your **entire returned JSX** changes based on a condition (not just a piece of it), you can use an `if` check with an **early return** before the main return.

### ❓ Why do we need it?

The previous approaches (ternary, `&&`, variables) work great when only a **portion** of the JSX changes. But when the whole component output is fundamentally different, an early return is more appropriate.

### ⚙️ How it works

```jsx
if (props.items.length === 0) {
  return <h2>Found no expenses.</h2>;  // Early return — completely different output
}

return (
  <ul>
    {props.items.map((item) => (
      <ExpenseItem key={item.id} {...item} />
    ))}
  </ul>
);
```

- If the condition is met, the component returns early with alternative JSX
- The main return statement only runs if the early return was skipped
- This is clean and readable — no nesting, no ternaries

### 💡 Insight

This pattern works best when the **entire component output** differs based on a condition. If only a small part changes, the variable or `&&` approach from the previous lesson is better.

---

## Semantic HTML Improvements

### ⚙️ How it works

Since the list is now wrapped in a `<ul>`, each `ExpenseItem` should render as a `<li>` instead of a `<div>`:

```jsx
// In ExpenseItem.js
return (
  <li>
    <Card className="expense-item">
      {/* ... */}
    </Card>
  </li>
);
```

This doesn't change the visual output but makes the HTML **semantically correct** — a list item inside an unordered list.

---

## The Bigger Picture — Component Responsibility

By extracting `ExpensesList`, the `Expenses` component now only handles:
- Managing the filter state
- Passing filtered data down

And `ExpensesList` handles:
- Deciding what to render (fallback vs. list)
- Rendering the actual list items

Each component has a clear, single purpose.

---

## ✅ Key Takeaways

- Use **early returns** when the entire component output changes based on a condition
- Extract list logic into dedicated components for cleaner, more focused code
- Early returns are **not appropriate** when only a portion of JSX changes — use ternaries, `&&`, or variables for that
- Use semantic HTML (`<ul>`, `<li>`) for list structures
- Keep components lean — each should have one clear responsibility

## ⚠️ Common Mistakes

- Using early returns for partial JSX changes — this leads to duplicated JSX
- Forgetting to pass the `key` prop when mapping inside the extracted component
- Not importing the CSS file in the new extracted component

## 💡 Pro Tips

- A good rule of thumb: if you're writing the same wrapping JSX in multiple return branches, you probably shouldn't use early returns
- Component extraction is one of the most powerful refactoring tools in React — don't be afraid to create small, focused components
- CSS class names with BEM notation (like `expenses-list__fallback`) help maintain clear styling boundaries
