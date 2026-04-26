# Using One State Instead — And What's Better?

## Introduction

So far, we've been managing form inputs with **multiple individual state slices** — one `useState` call per input field. But what if you could bundle everything into a **single state object** instead? This lecture explores that alternative approach, compares it with the multi-state approach, and helps you understand the tradeoffs so you can pick what works best for your projects.

---

## One State Object vs. Multiple State Slices

### 🧠 What is it?

Instead of calling `useState` three separate times (once for title, once for amount, once for date), you call it **once** with an **object** that holds all three values together.

### ❓ Why would we do this?

All three pieces of state are related — they're all user inputs for the same form. So you could argue they belong together as a single unit of state. Grouping them reduces the number of `useState` calls and keeps related data co-located.

### ⚙️ How it works

```jsx
const [userInput, setUserInput] = useState({
  enteredTitle: '',
  enteredAmount: '',
  enteredDate: '',
});
```

Now, instead of calling `setEnteredTitle(value)`, you call `setUserInput()` with a **new object** that includes all three keys.

### 🧪 Example

```jsx
const titleChangeHandler = (event) => {
  setUserInput({
    ...userInput,           // copy existing values first
    enteredTitle: event.target.value,  // then override the one that changed
  });
};
```

The **spread operator** (`...userInput`) pulls out all existing key-value pairs, and then you override just the one property that changed. Without this, the other two values would be **lost** — React replaces state entirely, it does **not** merge objects for you.

### 💡 Insight

> React's `useState` does **not** auto-merge objects like class-based `setState` used to. If you pass an object with only one key, that's your entire new state — the other keys are gone. You are responsible for preserving them.

---

## The Spread Operator Pattern

When updating one field in an object state, always spread in the previous state first, then override:

```jsx
setUserInput({
  ...userInput,           // keep everything
  enteredAmount: event.target.value,  // update just this one
});
```

This ensures the values you're *not* changing survive the update.

---

## Which Approach Is Better?

| Aspect | Multiple States | Single Object State |
|--------|----------------|-------------------|
| Simplicity | Each state is independent and simple | Must remember to spread previous state |
| Readability | Very clear what each state represents | All state grouped together |
| Common in practice | More commonly seen in React projects | Valid but less common |
| Risk of bugs | Low — updates are isolated | Higher — forgetting to spread loses data |

---

## ✅ Key Takeaways

- You can manage related state values in **one object** instead of multiple `useState` calls
- When using object state, you **must** manually preserve the other properties using the spread operator
- React does **not** merge state updates — it **replaces** the old state entirely
- Both approaches are valid; **multiple individual state slices** is more common and often simpler
- There's still a subtle problem with this approach when depending on previous state — covered in the next lesson

## ⚠️ Common Mistakes

- **Forgetting to spread the previous state** — this silently drops the other values without any error
- Assuming React auto-merges objects like class components did — it doesn't with `useState`

## 💡 Pro Tips

- Start with individual state slices — they're simpler and less error-prone
- Only merge into one state object if the states are truly coupled and always update together
- If you find yourself always updating all values at the same time, a single object state might make more sense
