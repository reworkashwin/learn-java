# Controlled vs. Uncontrolled Components & Stateless vs. Stateful Components

## Introduction

As we wrap up this section on state and events, let's put names to two important React concepts you've already been using. Understanding the terminology — **controlled vs. uncontrolled** and **stateful vs. stateless** — will help you communicate clearly with other React developers and recognize these patterns everywhere.

---

## Controlled Components

### 🧠 What is it?

A **controlled component** is a component whose value and behavior are fully managed by a parent component through props. The component itself doesn't own its state — it receives the current value AND the change handler from its parent.

### ⚙️ How it works

When you use **two-way binding**, you create a controlled component:

```jsx
// Parent component
const [filteredYear, setFilteredYear] = useState('2020');

<ExpensesFilter
  selected={filteredYear}
  onChangeFilter={filterChangeHandler}
/>
```

`ExpensesFilter` doesn't manage its own state. It:
- Receives the current value via `selected` prop
- Reports changes via the `onChangeFilter` prop
- The **parent** decides what value is displayed and how changes are handled

### 💡 Insight

> A controlled component is like a puppet — it looks active, but the strings are pulled by the parent. It presents UI and forwards events, but the real logic lives elsewhere.

---

## Uncontrolled Components

An **uncontrolled component** manages its own internal state. It doesn't report its value back to a parent — the parent has no way to read or set the component's current value through props.

A classic example is a plain HTML input without a `value` prop:

```jsx
<input type="text" />  // uncontrolled — React doesn't manage its value
```

---

## Stateful vs. Stateless Components

### 🧠 What is it?

- **Stateful components** (also called "smart" components) — have at least one `useState` call and manage some internal state
- **Stateless components** (also called "presentational" or "dumb" components) — have no internal state; they just receive props and render UI

### 🧪 Examples

**Stateful:**
```jsx
// Expenses.js — manages filter state
const [filteredYear, setFilteredYear] = useState('2020');
```

**Stateless:**
```jsx
// ExpenseItem.js — just receives and displays data
const ExpenseItem = (props) => {
  return (
    <div>
      <h2>{props.title}</h2>
      <div>{props.amount}</div>
    </div>
  );
};
```

### 💡 Insight

> Despite the name "dumb," stateless components are **not** inferior. In fact, most components in a well-structured React app are stateless. They're simpler, more reusable, and easier to test.

---

## The Typical Distribution

In most React applications:

```
Stateful components:    ~20%   (manage state, contain logic)
Stateless components:   ~80%   (render UI, receive props)
```

A few components manage state and distribute it via props. The majority of components just focus on **presentation** — rendering JSX, applying styles, transforming data for display.

---

## The Terminology Map

| Term | Also Called | Meaning |
|------|-----------|---------|
| Controlled | — | Value + changes managed by parent via props |
| Uncontrolled | — | Manages its own internal state |
| Stateful | Smart | Has `useState` / manages state |
| Stateless | Presentational, Dumb | No internal state, just renders props |

---

## ✅ Key Takeaways

- A **controlled component** has its value and change handling managed by a parent through props (two-way binding)
- An **uncontrolled component** manages its own state internally
- **Stateful** components use `useState` and manage data; **stateless** components just render UI
- Most apps have **more stateless than stateful** components — that's a good thing
- "Dumb" doesn't mean bad — stateless components are simpler, more reusable, and easier to maintain
- State is managed in a few components and then **distributed via props** to the rest

## ⚠️ Common Mistakes

- Thinking every component needs its own state — most shouldn't
- Equating "stateless" with "useless" — stateless components are the backbone of React UIs
- Making every component stateful "just in case" — this leads to scattered, hard-to-track state

## 💡 Pro Tips

- Ask yourself: "Does this component need to own state, or can it just receive data as props?"
- If a component only needs to display data and maybe format it, keep it stateless
- Controlled components are preferred for forms — they make validation, resetting, and dynamic behavior much easier
