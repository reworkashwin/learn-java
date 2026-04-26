# Lifting the State Up

## Introduction

You've just learned how to pass data from child to parent using function props. Now let's zoom out and understand the **bigger concept** behind that pattern. It's called **Lifting State Up**, and it's one of the most fundamental ideas in React architecture. If two sibling components need access to the same data, where should that data live? The answer: lift it up to their closest common ancestor.

---

## The Core Problem

### 🧠 What is it?

Imagine you have two sibling components — `NewExpense` (which generates expense data) and `Expenses` (which displays expense data). They need to share data, but **sibling components cannot communicate directly** in React.

### ❓ Why can't siblings talk to each other?

React's data flow is strictly **parent → child** via props. There's no mechanism for `NewExpense` to send props to `Expenses` directly. They're on the same level — they're siblings, not parent-child.

```
        App
       /   \
NewExpense  Expenses    ← These can't talk directly!
```

---

## The Solution — Lift the State Up

### ⚙️ How it works

Find the **closest common ancestor** that has access to both components. Move (or "lift") the state to that ancestor. Then:
1. The data-producing child **passes data up** to the parent (via function props)
2. The parent **passes data down** to the data-consuming child (via regular props)

```
        App           ← State lives HERE
       /   \
NewExpense  Expenses
  ↑ data      ↓ data
  goes up     goes down
```

### 🧪 Example

In our expense tracker app:
- `ExpenseForm` collects user input (generates data)
- `Expenses` displays the list of expenses (needs data)
- `App` is the closest common ancestor

The chain works like this:
1. `ExpenseForm` passes data up to `NewExpense` (via `onSaveExpenseData`)
2. `NewExpense` passes data up to `App` (via `onAddExpense`)
3. `App` stores the data and passes the expenses array down to `Expenses` (via `items` prop)

### 💡 Insight

> Lifting state up doesn't always mean going all the way to the root `App` component. You only lift to the **lowest common ancestor** — the first parent that has access to both the producer and consumer of the data.

---

## Multi-Level Lifting

Sometimes the component generating data isn't a direct child of the common ancestor. In our app:

```
        App
         |
    NewExpense
         |
    ExpenseForm    ← Data is generated HERE
```

The data must travel through **two levels** — from `ExpenseForm` to `NewExpense` to `App`. You can't skip `NewExpense`. Each level must relay the data upward using the function-as-prop pattern.

---

## The Two Parts of Lifting State

1. **Passing data UP** — using function props (child calls parent's function with data)
2. **Passing data DOWN** — using regular props (parent passes data to another child)

Both parts together form the complete "Lifting State Up" pattern.

---

## When to Lift State

Ask yourself:
- Does component A produce data that component B needs?
- Are A and B not in a direct parent-child relationship?

If yes to both → lift the state to their closest common ancestor.

---

## ✅ Key Takeaways

- **Lifting State Up** means moving state to the closest common ancestor that has access to both the producer and consumer of that data
- Sibling components cannot communicate directly — they need a shared parent
- Data goes **up** via function props and **down** via regular props
- Don't lift higher than necessary — find the **lowest** common ancestor
- This is not always the root `App` component

## ⚠️ Common Mistakes

- Lifting state too high — putting everything in `App` when a closer ancestor exists, leading to unnecessary prop drilling
- Trying to skip intermediate components — each level must participate in the chain
- Confusing "lifting state" with "just logging data" — truly lifting state means the parent **stores and manages** that data

## 💡 Pro Tips

- You'll hear "Lifting State Up" constantly in React discussions — it's a foundational concept
- As your app grows, if prop drilling gets painful (passing through 5+ levels), consider **Context API** or state management libraries
- A good mental model: state should live as **close as possible** to where it's used, but **high enough** that all components that need it can access it
