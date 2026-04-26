# Splitting Components into Multiple Components

## Introduction

As your components grow — more JSX, more logic, more styles — they become harder to manage. React's answer? **Split them.** Extract parts of a component into new, smaller components. There's no hard rule for *when* to split, but this section shows you *how* — and why it's a powerful habit.

---

## Concept 1: When to Split a Component

### 🧠 What is it?

Splitting a component means taking a chunk of JSX and its related logic out of one component and creating a brand new component for it.

### ❓ Why do we need it?

- **Readability**: Smaller components are easier to understand at a glance
- **Reusability**: An extracted component can be used in other places too
- **Maintainability**: Changes to the date display? Edit one file, not hunt through a massive component

### 💡 Insight

There's no magic threshold. If a section of your component has its own helper constants, its own styles, and its own logical identity (like "the date part"), it's probably a good candidate for extraction.

---

## Concept 2: Creating the ExpenseDate Component

### 🧠 What is it?

We take the date-related JSX and logic out of `ExpenseItem` and move it into a new `ExpenseDate` component.

### ⚙️ How it works

**1. Create a new file: `ExpenseDate.js`**

```jsx
function ExpenseDate(props) {
  const month = props.date.toLocaleString('en-US', { month: 'long' });
  const day = props.date.toLocaleString('en-US', { day: '2-digit' });
  const year = props.date.getFullYear();

  return (
    <div>
      <div>{month}</div>
      <div>{year}</div>
      <div>{day}</div>
    </div>
  );
}

export default ExpenseDate;
```

**2. Use it inside `ExpenseItem`**

```jsx
import ExpenseDate from './ExpenseDate';

function ExpenseItem(props) {
  return (
    <div>
      <ExpenseDate date={props.date} />
      <h2>{props.title}</h2>
      <div>${props.amount}</div>
    </div>
  );
}
```

Notice how `ExpenseItem` passes the date *forward* to `ExpenseDate` via props. The data flows: **App → ExpenseItem → ExpenseDate**.

### 🧪 Example: Self-Closing Tags

When a component has no content between its opening and closing tags, you can use a self-closing tag:

```jsx
<ExpenseDate date={props.date} />
```

This is equivalent to `<ExpenseDate date={props.date}></ExpenseDate>` — just cleaner.

---

## Concept 3: Data Forwarding Through Component Layers

### 🧠 What is it?

When you split components, data often needs to travel through multiple levels. App passes data to ExpenseItem, and ExpenseItem forwards part of it to ExpenseDate.

### ⚙️ How it works

```
App  ──(title, amount, date)──>  ExpenseItem  ──(date)──>  ExpenseDate
```

ExpenseItem uses `title` and `amount` itself, but *forwards* `date` to ExpenseDate. This is a normal pattern — a component can consume some props and pass others along.

### ⚠️ Common Mistakes

- **Trying to skip levels**: You can't pass data directly from App to ExpenseDate if ExpenseDate is used inside ExpenseItem. Props flow from parent to direct child only.
- **Forgetting to pass the prop**: You create `ExpenseDate` and use it in `ExpenseItem`, but forget to set the `date` prop — and get `undefined` errors.

### 💡 Insight

This prop "forwarding" pattern is something you'll see everywhere. Later in the course, you'll learn about tools like Context that can help with deeply nested data, but for now, props are the standard approach.

---

## ✅ Key Takeaways

- Split components when they grow too large or have clearly separable concerns
- Naming convention: `PascalCase` file names matching the component name (e.g., `ExpenseDate.js`)
- Data flows through the component tree via props — parent to child, one level at a time
- Self-closing tags (`<Component />`) are preferred when there's no children content
- There's no hard rule on when to split — it comes with experience

## 💡 Pro Tips

- A good heuristic: if a section of JSX has its own dedicated styles and helper logic, it's a candidate for a new component
- Every extracted component is automatically reusable elsewhere in your app — even if that's not your original goal
