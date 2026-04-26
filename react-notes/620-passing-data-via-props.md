# Passing Data via Props

## Introduction

We can now output dynamic data inside a component, but there's a catch — the data is still defined *inside* the component. Every `ExpenseItem` renders the same thing. What if you want four expense items showing four different expenses? You need a way to **pass data into a component from outside**. Enter **props** — one of the most fundamental concepts in React.

---

## Concept 1: The Reusability Problem

### 🧠 What is it?

You can already reuse a component by placing it multiple times in JSX:

```jsx
<ExpenseItem />
<ExpenseItem />
<ExpenseItem />
```

But all three render the exact same data because it's baked into the component.

### ❓ Why do we need to fix it?

Think about regular JavaScript functions. A function that always returns the same value isn't very useful. We make functions flexible by accepting **parameters**. React components need the same mechanism — and that mechanism is called **props**.

---

## Concept 2: What Are Props?

### 🧠 What is it?

**Props** (short for **properties**) are React's way of passing data from a parent component to a child component. They work just like HTML attributes, but for your custom components.

### ❓ Why do we need it?

Props make components **configurable**. Instead of hard-coding "Car Insurance" inside `ExpenseItem`, the parent component tells it *what* to display. Same component, different data, different output.

### ⚙️ How it works

It's a two-step process:

**Step 1 — Set attributes on the custom component (in the parent)**

```jsx
// In App.js
<ExpenseItem
  title={expenses[0].title}
  amount={expenses[0].amount}
  date={expenses[0].date}
/>
```

You're adding custom attributes — `title`, `amount`, `date` — just like you'd add `href` to an `<a>` tag. The names are entirely up to you.

**Step 2 — Accept the `props` object (in the child)**

```jsx
// In ExpenseItem.js
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

React automatically bundles all attributes into a single `props` object and passes it as the first argument to your component function. The attribute names become the keys.

### 🧪 Example

```jsx
// App.js
const expenses = [
  { id: 'e1', title: 'Car Insurance', amount: 294.67, date: new Date(2021, 2, 28) },
  { id: 'e2', title: 'Toilet Paper', amount: 94.12, date: new Date(2021, 7, 14) },
];

function App() {
  return (
    <div>
      <ExpenseItem title={expenses[0].title} amount={expenses[0].amount} date={expenses[0].date} />
      <ExpenseItem title={expenses[1].title} amount={expenses[1].amount} date={expenses[1].date} />
    </div>
  );
}
```

Now each `ExpenseItem` renders different data — all from the same component!

### 💡 Insight

The `props` parameter name is just a convention — you could call it `data` or `banana`. But `props` is universally used in the React community, and it immediately signals "this is the incoming data object."

---

## Concept 3: How the Props Object Works

### 🧠 What is it?

The `props` object is a plain JavaScript object where:
- **Keys** = the attribute names you set on the component
- **Values** = the values you assigned to those attributes

### ⚙️ How it works

If you write:
```jsx
<ExpenseItem title="Car Insurance" amount={294.67} />
```

Then inside `ExpenseItem`, `props` looks like:
```js
{ title: "Car Insurance", amount: 294.67 }
```

You access values with dot notation: `props.title`, `props.amount`.

### ⚠️ Common Mistakes

- **Mismatched names**: If you set `title` as the attribute but try to access `props.name`, you'll get `undefined`. The key on `props` must match the attribute name exactly.
- **Forgetting the `props` parameter**: If you don't add `props` to the function signature, you have no way to access the passed data.

---

## ✅ Key Takeaways

- Props are how you pass data from a parent component to a child component
- They work like custom HTML attributes on your components
- React bundles all attributes into a single `props` object
- The attribute names become the keys on that object
- Props make components **reusable** and **configurable** — this is a core React pattern you'll use constantly

## ⚠️ Common Mistakes

- Setting a prop on a component but forgetting to use `props.propName` inside it
- Assuming prop names are fixed — they're entirely your choice (just be consistent)

## 💡 Pro Tips

- You can pass any JavaScript value as a prop — strings, numbers, arrays, objects, even functions
- Props are **read-only** inside the receiving component — you should never modify them
- Use self-explanatory prop names like `title`, `amount`, `date` — future you will thank present you
