# Adding Normal JavaScript Logic to Components

## Introduction

Props give us the raw data, but raw data isn't always ready to display. A `Date` object isn't human-readable. An amount might need formatting. This is where you add **regular JavaScript logic** to your component — transforming and preparing data before rendering it. Let's see how to keep your JSX clean while adding meaningful logic.

---

## Concept 1: Extracting Logic into Helper Constants

### 🧠 What is it?

Instead of cramming complex expressions directly into your JSX curly braces, you create helper variables/constants above the `return` statement that hold the processed values.

### ❓ Why do we need it?

You *could* put everything inline:

```jsx
<div>{props.date.toLocaleString('en-US', { month: 'long' })}</div>
```

But this makes your JSX hard to read. Extracting it into a constant keeps JSX lean and logic separated.

### ⚙️ How it works

```jsx
function ExpenseItem(props) {
  const month = props.date.toLocaleString('en-US', { month: 'long' });
  const day = props.date.toLocaleString('en-US', { day: '2-digit' });
  const year = props.date.getFullYear();

  return (
    <div>
      <div>
        <div>{month}</div>
        <div>{year}</div>
        <div>{day}</div>
      </div>
      <h2>{props.title}</h2>
      <div>${props.amount}</div>
    </div>
  );
}
```

### 🧪 Example

`toLocaleString('en-US', { month: 'long' })` converts a date into a human-readable month name like "March" or "August". `getFullYear()` extracts the four-digit year. These are standard JavaScript — nothing React-specific.

### 💡 Insight

This pattern — compute above, render below — is the bread and butter of React components. The area above `return` is for logic: formatting, filtering, calculations. The `return` block is for structure: what gets rendered.

---

## Concept 2: Building a Calendar-Style Date Display

### 🧠 What is it?

Instead of showing a raw date string, we can break the date into month, day, and year and display them in a calendar-like layout with individual `<div>` elements for each part.

### ⚙️ How it works

```jsx
<div className="expense-date">
  <div className="expense-date__month">{month}</div>
  <div className="expense-date__year">{year}</div>
  <div className="expense-date__day">{day}</div>
</div>
```

Each part of the date gets its own container, which CSS can style independently — giving you that polished calendar look.

### 💡 Insight

This is a perfect example of how combining simple JavaScript (date methods) with JSX structure (divs with class names) lets you build rich UI from plain data. No fancy libraries needed.

---

## ✅ Key Takeaways

- Write your data transformation logic above the `return` statement, not inside JSX
- Use helper constants to keep JSX clean and readable
- `toLocaleString()` and `getFullYear()` are built-in JavaScript methods — not React features
- The pattern is: **compute → store → render**

## ⚠️ Common Mistakes

- Stuffing long method chains inside JSX curly braces — it works but kills readability
- Forgetting that `toLocaleString` options like `{ month: 'long' }` are case-sensitive

## 💡 Pro Tips

- When your "above the return" logic grows, that's often a signal to extract the code into a separate component — which is exactly what we'll do next
- MDN's documentation on `toLocaleString` is your best friend for date formatting options
