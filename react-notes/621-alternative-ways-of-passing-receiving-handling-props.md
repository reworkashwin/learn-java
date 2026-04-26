# Alternative Ways of Passing & Receiving Props

## Introduction

We've seen the standard way of working with props — setting individual attributes and accessing them via `props.title`, `props.amount`, etc. But React (and JavaScript) give you flexibility. There are alternative patterns for both *sending* and *receiving* props that you'll encounter in real-world projects. Let's explore them so nothing catches you off guard.

---

## Concept 1: Passing a Single Object Instead of Multiple Props

### 🧠 What is it?

Instead of passing each piece of data as a separate prop, you can pass the entire data object as one prop.

### ⚙️ How it works

**Multiple props approach (what we've been doing):**
```jsx
<ExpenseItem
  title={expenses[0].title}
  amount={expenses[0].amount}
  date={expenses[0].date}
/>
```

**Single prop approach (the alternative):**
```jsx
<ExpenseItem expense={expenses[0]} />
```

Here, you pass the whole expense object through one prop called `expense`.

### ⚙️ What changes in the receiving component?

With the single prop approach, you no longer have `props.title` directly. Instead:

```jsx
function ExpenseItem(props) {
  return (
    <div>
      <h2>{props.expense.title}</h2>
      <div>${props.expense.amount}</div>
      <div>{props.expense.date.toISOString()}</div>
    </div>
  );
}
```

Notice the extra `.expense` in the path — because everything is nested inside that one prop.

### 💡 Insight

Both approaches are perfectly valid. Passing individual props gives you clearer, more explicit component interfaces. Passing a single object is more concise when a component needs almost all fields from a data object. Choose what feels cleaner for your use case.

---

## Concept 2: Object Destructuring in the Parameter List

### 🧠 What is it?

Instead of accepting the whole `props` object and accessing its properties with dot notation, you can use **JavaScript object destructuring** right in the function parameter list to pull out individual values.

### ❓ Why do we need it?

It's less typing, and it makes the component body cleaner — you reference `title` instead of `props.title` everywhere. Many React developers prefer this style.

### ⚙️ How it works

**Standard approach:**
```jsx
function ExpenseItem(props) {
  return (
    <div>
      <h2>{props.title}</h2>
      <div>${props.amount}</div>
      <div>{props.date.toISOString()}</div>
    </div>
  );
}
```

**Destructuring approach:**
```jsx
function ExpenseItem({ date, title, amount }) {
  return (
    <div>
      <h2>{title}</h2>
      <div>${amount}</div>
      <div>{date.toISOString()}</div>
    </div>
  );
}
```

The `{ date, title, amount }` syntax extracts those properties from the incoming props object and creates local variables with those names.

### ⚠️ Common Mistakes

- **Thinking this is special React syntax** — it's not! It's standard JavaScript object destructuring. Works the same way in any JS function.
- **Misspelling a destructured key** — if your prop is called `title` but you destructure `{ titl }`, you'll get `undefined`.

### 💡 Insight

Destructuring also serves as self-documentation. When you see `function ExpenseItem({ date, title, amount })`, you immediately know exactly which props this component expects — without reading the entire function body.

---

## ✅ Key Takeaways

- You can pass one object prop or multiple individual props — both are valid
- Object destructuring in the parameter list is a popular alternative to `props.x` dot notation
- Destructuring is plain JavaScript, not a React-specific feature
- Choose the approach that makes your code most readable for you and your team

## 💡 Pro Tips

- If your component only uses 2-3 props, destructuring keeps things tidy
- If a component passes most of its props down to a child, the single-object approach can reduce boilerplate
- You'll see destructuring in practically every modern React codebase — get comfortable with it
