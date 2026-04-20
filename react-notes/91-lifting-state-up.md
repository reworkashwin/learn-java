# Lifting State Up

## Introduction

You've built a form that collects user input—great! But now you need that input data in a *different* component. The `UserInput` component holds the state, but the `Results` component needs it to calculate and display investment data. How do you share state between sibling components that don't have a direct parent-child relationship? This is where **lifting state up** comes in—one of the most fundamental patterns in React.

---

## The Problem: Data Trapped in the Wrong Component

Imagine this scenario:

- `UserInput` collects investment parameters (initial investment, annual investment, expected return, duration)
- `Results` needs those exact parameters to calculate and display a results table
- Both components are rendered inside `App`

The `UserInput` component currently manages its own state with `useState`. That state is *local* to `UserInput`—no other component can access it. But `Results` desperately needs that data.

Could you calculate the results inside `UserInput`? Technically, yes. But `Results` is a *separate* component that should be rendered *below* `UserInput` in the `App` component. The data needs to flow **up** from `UserInput` to `App`, and then **down** from `App` to `Results`.

---

## The Solution: Lift State Up

### 🧠 What Does "Lifting State Up" Mean?

Lifting state up means moving state from a child component to a common parent component so that the parent can share that state with multiple children.

Think of it like this: if two siblings need to share a toy, the parent holds the toy and gives it to whichever child needs it.

### ⚙️ How It Works Step by Step

**Step 1: Create the `Results` component**

```jsx
// Results.jsx
export default function Results({ input }) {
  console.log(input);
  return <p>Results</p>; // placeholder for now
}
```

**Step 2: Move state from `UserInput` to `App`**

Cut the `useState` call and the `handleChange` function from `UserInput` and paste them into `App`:

```jsx
// App.jsx
import { useState } from 'react';

function App() {
  const [userInput, setUserInput] = useState({
    initialInvestment: 15000,
    annualInvestment: 2100,
    expectedReturn: 6,
    duration: 10,
  });

  function handleChange(inputIdentifier, newValue) {
    setUserInput((prevInput) => ({
      ...prevInput,
      [inputIdentifier]: newValue,
    }));
  }

  return (
    <>
      <UserInput userInput={userInput} onChange={handleChange} />
      <Results input={userInput} />
    </>
  );
}
```

**Step 3: Pass state and handler as props to `UserInput`**

```jsx
// UserInput.jsx
export default function UserInput({ userInput, onChange }) {
  // Use onChange instead of the local handleChange
  // Use userInput prop instead of local state
}
```

Now `UserInput` doesn't manage state anymore. It receives the current values and a change handler via props. When the user types, `onChange` fires, which updates state in `App`, which re-renders both `UserInput` (with new values) and `Results` (with new input data).

**Step 4: Share state with `Results`**

```jsx
<Results input={userInput} />
```

Both `UserInput` and `Results` now receive the same state—they're sharing it through their common parent, `App`.

---

## Why Not Just Calculate Results in `UserInput`?

You *could*, but it violates the principle of separation of concerns. The `UserInput` component's job is to collect input. The `Results` component's job is to display results. Mixing those responsibilities makes components harder to maintain and reuse.

By lifting state up, each component stays focused on one job, and the parent orchestrates the data flow.

---

## Key Details to Remember

### Passing Functions as Props

When you pass `handleChange` to `UserInput`:

```jsx
<UserInput onChange={handleChange} />
```

You pass the function **as a value**—no parentheses. You're not *calling* it; you're handing it over so the child can call it later.

### Prop Naming

Inside `UserInput`, the prop is called `onChange`. Inside the component, you call `onChange(inputIdentifier, newValue)` which actually invokes `handleChange` from `App`. The name is up to you—it's your custom component.

---

## ✅ Key Takeaways

- **Lift state up** when two or more sibling components need access to the same state
- Move state to the **closest common parent** component
- Pass state **down** as props and pass **updater functions** as props for changes
- The child component that previously owned the state now becomes a "controlled" component

## ⚠️ Common Mistakes

- Calling the function when passing it as a prop: `onChange={handleChange()}` ← this calls it immediately!
- Forgetting to accept the new props in the child component after lifting state
- Trying to access state from a sibling component directly—React doesn't work that way

## 💡 Pro Tips

- If you find yourself needing to pass state through many intermediate components, consider React Context or a state management library
- The component that *lifts* state up doesn't have to *use* the state itself—it can simply act as a coordinator
- This pattern is one of the most common in React—you'll use it constantly
