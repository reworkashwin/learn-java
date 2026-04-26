# Lifting the State Up

## Introduction

The user input state lives in `UserInput`, but the calculation results need to appear in `ResultsTable`. These are **sibling components** — they can't talk to each other directly. The solution? **Lift the state up** to their common parent. This lesson walks through the process and introduces derived state as a cleaner alternative to explicitly managed result state.

---

## The Problem — Siblings Need Shared Data

### 🧠 What is it?

- `UserInput` has the input values (state)
- `ResultsTable` needs the calculated results (derived from those input values)
- Both are children of `App` — but they can't communicate directly

### ❓ Why can't they just share?

React's data flow is **one-directional** — data flows down via props, and events flow up via callback functions. Sibling components have no direct connection.

---

## The Solution — Lift State to App

### ⚙️ How it works

1. **Pass a callback function** from `App` to `UserInput` as a prop
2. `UserInput` calls that function with the user input data on form submit
3. `App` receives the data and stores it as state
4. `App` passes the calculated results down to `ResultsTable` as props

```
App (owns state, performs calculations)
├── UserInput (sends data UP via callback prop)
└── ResultsTable (receives data DOWN via props)
```

### 🧪 Example — In UserInput

```jsx
const submitHandler = (event) => {
  event.preventDefault();
  props.onCalculate(userInput);  // Send state UP to parent
};
```

### 🧪 Example — In App

```jsx
const calculateHandler = (userInput) => {
  // Use the input to calculate results...
  setUserInput(userInput);
};

<UserInput onCalculate={calculateHandler} />
```

---

## Two Approaches to Results State

### Approach 1: Explicitly Managed State

```jsx
const [results, setResults] = useState(null);

const calculateHandler = (userInput) => {
  // Run calculations...
  setResults(yearlyData);
};
```

Store the calculation results directly as state. Simple and straightforward.

### Approach 2: Derived State (More Elegant)

```jsx
const [userInput, setUserInput] = useState(null);

// Derived — recalculated on every render
let yearlyData = [];
if (userInput) {
  // Run calculations using userInput...
}
```

Instead of storing results, store only the **user input** as state. The results are **derived** from it on every render.

### 💡 Insight — Why Derived State?

- **Single source of truth** — only the raw input is stored
- **Always in sync** — results are recalculated whenever input changes
- **Leaner state** — fewer state variables to manage
- The calculation code runs inside the component function body, not in an event handler

### ⚠️ Important guard clause

Since `userInput` starts as `null`, wrap the calculation in an `if` check:

```jsx
if (userInput) {
  // Safe to access userInput['current-savings'] etc.
}
```

Without this, you'll get `Cannot read property of null` errors on initial render.

---

## Passing Results Down

### ⚙️ How it works

Once `App` has the yearly data (either as explicit state or derived), pass it to `ResultsTable`:

```jsx
<ResultsTable results={yearlyData} />
```

`ResultsTable` can then:
- Show a **fallback message** if `results` is empty or null
- **Map through** the results to render one table row per year

---

## The Full Data Flow

```
User types in input
  → onChange fires in UserInput
  → Local state updates in UserInput

User clicks Calculate
  → onSubmit fires
  → props.onCalculate(userInput) sends data to App

App receives data
  → setUserInput(data) stores it as state
  → Component re-renders
  → Derived calculation runs
  → yearlyData is computed

App passes yearlyData to ResultsTable via props
  → ResultsTable renders the table rows
```

---

## ✅ Key Takeaways

- **Lift state up** to the nearest common ancestor when siblings need shared data
- Pass **callback functions** as props to send data from child to parent
- **Derived state** (calculating values from stored state) is often cleaner than storing computed results
- Always guard against `null` state when using derived calculations
- The parent component orchestrates data flow — children just receive and send

## ⚠️ Common Mistakes

- Trying to pass data directly between sibling components without going through a parent
- Forgetting to add the `if (userInput)` guard and crashing on initial render
- Storing both the raw input AND the calculated results as separate state — this creates redundancy and potential sync issues
- Mismatching property names between what `UserInput` sends and what `calculateHandler` expects

## 💡 Pro Tips

- If lifting state feels like it's going too many levels up, that's a signal you might need **React Context** (covered in later modules)
- Derived state works best when the calculation is fast — for expensive computations, you'd use `useMemo` (also covered later)
- The pattern of "callback prop up, data prop down" is the backbone of React data flow — master it and everything else clicks
