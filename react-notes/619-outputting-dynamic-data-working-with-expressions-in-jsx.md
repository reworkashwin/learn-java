# Outputting Dynamic Data — Working with Expressions in JSX

## Introduction

So far, we've been hard-coding data directly into our JSX — the date, the title, the amount — all baked right into the HTML. But in a real application, data is almost never static like that. It comes from users, databases, APIs. How do we output *dynamic* data in React? That's exactly what this section is about, and it introduces one of JSX's most powerful features: **curly brace expressions**.

---

## Concept 1: The Problem with Hard-Coded Data

### 🧠 What is it?

When you write something like `<h2>Car Insurance</h2>` directly in your JSX, that's hard-coded data. It never changes, no matter what.

### ❓ Why do we need to fix it?

Think about an expense tracker. You don't want every expense to say "Car Insurance" forever — you want it to show whatever the user entered. Hard-coded data makes your component **rigid and unreusable**. To build real applications, you need a way to inject values dynamically.

### 💡 Insight

Remember — a React component is just a JavaScript function. And in a function, you can write any JavaScript code you want *before* the return statement. That's where your dynamic data lives.

---

## Concept 2: Adding JavaScript Logic Before the Return

### 🧠 What is it?

Inside your component function, before the `return` statement, you can declare variables, constants, perform calculations — anything that's valid JavaScript.

### ⚙️ How it works

```jsx
function ExpenseItem() {
  const expenseDate = new Date(2021, 2, 28);
  const expenseTitle = 'Car Insurance';
  const expenseAmount = 294.67;

  return (
    // JSX code here...
  );
}
```

This is just regular JavaScript. `new Date(2021, 2, 28)` creates a date object (remember, months are zero-indexed, so `2` = March). These constants could later be replaced by data from a database, an API call, user input — anything.

### 💡 Insight

The area above the `return` is your playground. Later in the course, this is where you'll send HTTP requests, validate inputs, and run all kinds of logic. For now, it's just dummy data — but it's the first step toward dynamic content.

---

## Concept 3: Curly Brace Expressions in JSX

### 🧠 What is it?

JSX lets you embed JavaScript expressions using **single curly braces** `{}`. Whatever you put between those braces gets evaluated and rendered on screen.

### ❓ Why do we need it?

Without curly braces, JSX is just static HTML. Curly braces are the bridge between your JavaScript logic and your HTML output. They let you say: "Hey, don't render this text literally — *evaluate* it as JavaScript first."

### ⚙️ How it works

```jsx
<h2>{expenseTitle}</h2>
<div>{expenseAmount}</div>
<div>{expenseDate.toISOString()}</div>
```

Between `{}`, you can put:
- **Variable/constant references**: `{expenseTitle}` → outputs the value stored in that constant
- **Expressions**: `{1 + 1}` → outputs `2`
- **Function calls**: `{Math.random()}` → outputs a random number
- **Method calls**: `{expenseDate.toISOString()}` → converts the date to a readable string

### 🧪 Example

```jsx
function ExpenseItem() {
  const expenseDate = new Date(2021, 2, 28);
  const expenseTitle = 'Car Insurance';
  const expenseAmount = 294.67;

  return (
    <div>
      <div>{expenseDate.toISOString()}</div>
      <h2>{expenseTitle}</h2>
      <div>${expenseAmount}</div>
    </div>
  );
}
```

Now `expenseTitle` isn't hard-coded in the HTML — it's pulled from the constant. Change the constant, and the output changes.

### ⚠️ Common Mistakes

- **Trying to output a Date object directly**: `{expenseDate}` will break because React can't render a raw Date object as text. You must call a method like `.toISOString()` to convert it to a string first.
- **Using statements instead of expressions**: You can't put `if/else` or `for` loops inside curly braces. Only *expressions* (things that produce a value) are allowed.

### 💡 Insight

The curly braces are your dynamic placeholders. The concrete value could be from a calculation, an HTTP request, user input, or — as it is right now — a constant. The mechanism is always the same: `{someExpression}`.

---

## ✅ Key Takeaways

- Components are just functions — you can write any JavaScript above the `return`
- Use `{}` in JSX to output dynamic values instead of hard-coding them
- Only JavaScript **expressions** work inside curly braces (not statements)
- Date objects need to be converted to strings before rendering (e.g., `.toISOString()`)
- This is the foundation for making components reusable — the next step is learning **props**

## 💡 Pro Tips

- Keep complex expressions out of JSX. Instead, store the result in a constant above the return and reference the constant — it keeps your JSX clean and readable.
- Think of `{}` as "escape hatches" from HTML back into JavaScript. Whenever you need something dynamic, reach for the curly braces.
