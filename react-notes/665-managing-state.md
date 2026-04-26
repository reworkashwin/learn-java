# Managing State

## Introduction

Events are wired up — now it's time to actually **do something** with them. This lesson covers managing user input as state in the investment calculator, including the one-object-state approach, dynamic property updates, two-way binding, and resetting state to initial values.

---

## Identifying the State

### 🧠 What is it?

We need to track **four input values** as state:
- Current savings
- Yearly contribution
- Expected return rate
- Investment duration

### ❓ Why state?

- We need the values when the form is **submitted** (to run calculations)
- We need to **reset** them when the Reset button is clicked
- Input fields need to reflect the current state (**two-way binding**)

---

## One State Object vs. Multiple State Slices

### ⚙️ The two approaches

**Multiple state slices:**
```jsx
const [currentSavings, setCurrentSavings] = useState(10000);
const [yearlyContribution, setYearlyContribution] = useState(1200);
// ... two more
```

**One state object (chosen approach):**
```jsx
const [userInput, setUserInput] = useState({
  'current-savings': 10000,
  'yearly-contribution': 1200,
  'expected-return': 7,
  'duration': 10,
});
```

Both are valid. The one-object approach pairs nicely with the **generic change handler** from the previous lesson.

### 💡 Insight

Property names with dashes (like `current-savings`) must be wrapped in quotes in JavaScript objects. Alternatively, use camelCase — it's your choice, but be consistent.

---

## Updating State Dynamically

### ⚙️ How it works

Using the generic `inputChangeHandler` from before:

```jsx
const inputChangeHandler = (input, value) => {
  setUserInput((prevInput) => {
    return {
      ...prevInput,
      [input]: value,
    };
  });
};
```

### 🧪 Key syntax: Dynamic property names

```jsx
[input]: value
```

Square brackets around `input` mean: "use the **value stored in** `input` as the property name." So if `input` is `'current-savings'`, it sets the `current-savings` property.

Without square brackets, you'd set a property literally named `input` — not what we want.

### 💡 Insight — Function Form of setState

Always use the **function form** (`setUserInput((prev) => ...)`) when the new state depends on the previous state. This guarantees you're working with the **latest** state value, even if multiple updates are batched.

---

## Resetting State

### ⚙️ How it works

Extract the initial state into a constant **outside** the component:

```jsx
const initialUserInput = {
  'current-savings': 10000,
  'yearly-contribution': 1200,
  'expected-return': 7,
  'duration': 10,
};

const UserInput = () => {
  const [userInput, setUserInput] = useState(initialUserInput);

  const resetHandler = () => {
    setUserInput(initialUserInput);
  };
  // ...
};
```

### ❓ Why outside the component?

The initial value doesn't change and doesn't depend on props or state. Placing it outside avoids recreating the object on every render. It also provides a single source of truth for both initialization and reset.

---

## Two-Way Binding

### ⚙️ How it works

Set each input's `value` prop to the corresponding state property:

```jsx
<input
  type="number"
  value={userInput['current-savings']}
  onChange={(e) => inputChangeHandler('current-savings', e.target.value)}
/>
```

This creates a **two-way binding**:
- User types → `onChange` fires → state updates
- State updates → component re-renders → `value` prop reflects new state

### 🧪 Example — Reset in Action

After clicking Reset:
1. `setUserInput(initialUserInput)` runs
2. Component re-renders with the initial values
3. All inputs snap back to their defaults

---

## ✅ Key Takeaways

- Use `useState` with a **single object** when multiple related values need to be managed together
- **Dynamic property names** (`[variable]: value`) let you update specific keys in a state object
- Always use the **function form** of setState when new state depends on previous state
- Extract initial state **outside** the component for clean initialization and reset
- **Two-way binding** (setting `value` + listening to `onChange`) keeps inputs in sync with state

## ⚠️ Common Mistakes

- Forgetting the spread operator (`...prevInput`) and losing all other state values
- Using `setUserInput({ [input]: value })` without spreading — this replaces the entire object
- Not using the function form of setState and getting stale state issues
- Forgetting to wrap dashed property names in quotes

## 💡 Pro Tips

- `event.target.value` returns a **string** — if your initial state uses numbers, convert with `+value` or `Number(value)` to avoid type mismatches
- The bracket notation `userInput['current-savings']` is required for dashed keys — dot notation (`userInput.current-savings`) would be a syntax error
- Test two-way binding by checking: "If I change state programmatically, does the input update? If I type in the input, does state update?"
