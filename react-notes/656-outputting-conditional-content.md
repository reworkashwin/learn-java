# Outputting Conditional Content in React

## Introduction

What happens when your filtered list is empty? Showing... nothing? That's a lousy user experience. This lesson covers **conditional rendering** — how to show different content based on different conditions. You'll learn three distinct approaches, from ternary expressions to the `&&` trick to storing JSX in variables — and you'll understand when to reach for each one.

---

## The Problem — Empty Lists Show Nothing

### 🧠 What is it?

Conditional content means rendering **either A or B** (or C) depending on some condition — not about lists, but about what gets displayed based on your app's state.

### ❓ Why do we need it?

When filtering expenses by year and no expenses match, the user sees a blank screen. We should show a message like "No expenses found" instead.

---

## Approach 1: Ternary Expressions

### ⚙️ How it works

Use JavaScript's ternary operator directly in JSX:

```jsx
{filteredExpenses.length === 0 ? (
  <p>No expenses found.</p>
) : (
  filteredExpenses.map((expense) => (
    <ExpenseItem key={expense.id} {...expense} />
  ))
)}
```

- `condition ? ifTrue : ifFalse` — standard JavaScript
- Works perfectly, but long ternary expressions can get **hard to read**

### 💡 Insight

You can't use `if` statements or `for` loops inside JSX curly braces — only **expressions** that return a value. That's why we use ternaries.

---

## Approach 2: The `&&` Trick

### ⚙️ How it works

Split the ternary into two separate expressions using the logical AND operator:

```jsx
{filteredExpenses.length === 0 && <p>No expenses found.</p>}
{filteredExpenses.length > 0 &&
  filteredExpenses.map((expense) => (
    <ExpenseItem key={expense.id} {...expense} />
  ))}
```

- If the condition before `&&` is `true`, JavaScript returns the part **after** `&&`
- If it's `false`, the entire expression returns `false` (which React ignores)
- Results in **shorter, more readable** expressions

### 💡 Insight

This isn't "abusing" JavaScript — it's a widely-used pattern in React projects. The `&&` operator short-circuits: if the left side is falsy, it never evaluates the right side.

---

## Approach 3: JSX in Variables (The Cleanest Way)

### ⚙️ How it works

Store JSX in a variable, then conditionally overwrite it:

```jsx
let expensesContent = <p>No expenses found.</p>;

if (filteredExpenses.length > 0) {
  expensesContent = filteredExpenses.map((expense) => (
    <ExpenseItem key={expense.id} {...expense} />
  ));
}

return (
  <div>
    {expensesContent}
  </div>
);
```

### 🧠 What is it?

You can store JSX in variables — it's not limited to `return` statements. This lets you use regular `if` statements **above** the return, keeping the returned JSX clean and lean.

### 💡 Insight

This approach separates **logic** from **presentation**:
- Logic lives in the component function body (the `if` check)
- The returned JSX is simple and declarative

Both a single JSX element and an array of JSX elements are valid "renderables" — React handles both seamlessly.

---

## Comparing the Three Approaches

| Approach | Readability | Best For |
|---|---|---|
| Ternary (`? :`) | Medium — gets messy with complex JSX | Simple either/or conditions |
| `&&` operator | Good — short and clear | Show-or-hide a single block |
| JSX in variables | Best — clean returned JSX | Complex conditions, multiple branches |

---

## ✅ Key Takeaways

- You can't use `if/else` inside JSX curly braces — use expressions instead
- **Ternary expressions** work but get hard to read for complex content
- The **`&&` trick** is a popular shorthand for "render this if true"
- **Storing JSX in variables** is often the cleanest approach — logic stays separate from the template
- JSX can be stored in variables, passed as props, or returned — it's just JavaScript values

## ⚠️ Common Mistakes

- Trying to use `if/else` statements directly inside JSX curly braces
- Writing overly complex ternary expressions that are impossible to read
- Forgetting that `0 && <Component />` renders `0`, not nothing — use `length > 0` instead of just `length`

## 💡 Pro Tips

- Pick one approach and be consistent within a component — mixing all three gets confusing
- The variable approach shines when you have **three or more** conditional branches
- Regardless of approach, always provide meaningful fallback content for empty states
