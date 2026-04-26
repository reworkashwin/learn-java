# Alternative: Creating a Shared Handler Function

## Introduction

So far, each input field has its own dedicated change handler function — `titleChangeHandler`, `amountChangeHandler`, `dateChangeHandler`. That works perfectly fine, but what if you want to **consolidate** them into a single, reusable handler? This lecture walks through an alternative pattern using a **shared handler function** with an identifier-based approach.

---

## The Current Approach — Separate Handlers

### 🧠 What is it?

Right now we have three specialized functions, each handling changes for one specific input:

```jsx
const titleChangeHandler = (event) => {
  setEnteredTitle(event.target.value);
};

const amountChangeHandler = (event) => {
  setEnteredAmount(event.target.value);
};

const dateChangeHandler = (event) => {
  setEnteredDate(event.target.value);
};
```

There's absolutely nothing wrong with this. It's clear, straightforward, and easy to read.

---

## The Alternative — One Shared Handler

### ❓ Why would we do this?

If your handlers all follow the same pattern (read `event.target.value`, update some state), you could avoid repetition by using one function that figures out *which* state to update based on an identifier.

### ⚙️ How it works

Create a single handler that accepts an **identifier** and a **value**:

```jsx
const inputChangeHandler = (identifier, value) => {
  if (identifier === 'title') {
    setEnteredTitle(value);
  } else if (identifier === 'date') {
    setEnteredDate(value);
  } else {
    setEnteredAmount(value);
  }
};
```

### 🧪 Example — Wiring It Up

You can't pass `inputChangeHandler` directly to `onChange` — React would call it with just an event object, not your identifier and value. The trick is to **wrap it in an arrow function**:

```jsx
<input
  type="text"
  onChange={(event) => inputChangeHandler('title', event.target.value)}
/>

<input
  type="number"
  onChange={(event) => inputChangeHandler('amount', event.target.value)}
/>

<input
  type="date"
  onChange={(event) => inputChangeHandler('date', event.target.value)}
/>
```

### 💡 Insight

> The wrapper arrow function is key. React calls *that* arrow function on change (passing the event), and inside it, **you** control how your shared handler is invoked — with whatever arguments you want.

---

## How the Wrapper Pattern Works

1. React fires the `onChange` event and calls the arrow function, passing the `event` object
2. Inside the arrow function, you extract `event.target.value`
3. You call `inputChangeHandler` with your custom identifier and the value
4. The shared handler uses the identifier to update the correct state

This pattern gives you full control over function invocation while still letting React manage the event lifecycle.

---

## Separate vs. Shared Handlers

| Aspect | Separate Handlers | Shared Handler |
|--------|------------------|----------------|
| Clarity | Very clear — each function has one job | Requires reading the identifier logic |
| Code duplication | Some repetition | DRY — one function |
| Flexibility | Easy to add unique logic per input | Harder to customize per input |
| Common in practice | More common | Used in some projects |

---

## ✅ Key Takeaways

- Having **separate handler functions** per input is perfectly fine and often preferred
- A **shared handler** with identifiers is a valid alternative that reduces repetition
- Use a **wrapper arrow function** in `onChange` to control how your shared handler gets called
- The wrapper receives the event from React, and you pass your own arguments to the handler
- Neither approach is "better" — pick what fits your team and project

## ⚠️ Common Mistakes

- Trying to pass `inputChangeHandler('title', event.target.value)` directly to `onChange` — this **executes immediately** instead of setting up a listener
- Forgetting that React passes an event object to `onChange` handlers, not custom arguments

## 💡 Pro Tips

- This wrapper arrow function pattern is useful anywhere you need to pass extra arguments to event handlers in React
- If inputs have very different logic (e.g., validation, formatting), separate handlers are usually cleaner
- You can also use `event.target.name` to identify inputs instead of passing a custom identifier — just add a `name` attribute to each input
