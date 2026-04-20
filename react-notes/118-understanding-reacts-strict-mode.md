# Understanding React's "Strict Mode"

## Introduction

What if React could help you catch bugs **before** you even notice them? That's exactly what **StrictMode** does. It's a built-in React feature that activates additional checks during development to surface hidden problems in your code.

---

## A Sneaky Bug: State Outside the Component

Consider this code in `Results.jsx`:

```jsx
import { calculateInvestmentResults } from '../util/investment';

const results = []; // ← Created OUTSIDE the component function

export default function Results({ userInput }) {
  calculateInvestmentResults(userInput, results);
  // ... use results to build a table
}
```

What happens when you first load the app? Everything looks fine. But when you **edit an input**, the table gets longer and longer. Rows keep accumulating instead of being replaced.

Why? Because `results` is declared **outside** the component function. It's created **once** when the module loads. Every time the component re-renders, `calculateInvestmentResults` pushes more items into the **same array**. The array never gets reset.

The fix is simple — move it inside the component:

```jsx
export default function Results({ userInput }) {
  const results = [];
  calculateInvestmentResults(userInput, results);
  // ...
}
```

Now a fresh array is created on every render. Problem solved.

But here's the thing: you might **not notice** this bug immediately. On first load, the table looks correct. You'd only see the problem after editing inputs. StrictMode changes that.

---

## What Is StrictMode?

`StrictMode` is a React component that wraps part (or all) of your application and enables additional development-time checks.

### How to Enable It

```jsx
// index.jsx or main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

You can also wrap just a part of your app:

```jsx
<StrictMode>
  <Results userInput={userInput} />
</StrictMode>
```

But wrapping the root `<App />` is the most common approach.

---

## What Does StrictMode Actually Do?

### 1. Double-Invokes Component Functions

The most important behavior: StrictMode **renders every component twice** during development.

Why? To catch bugs caused by **side effects** or **impure rendering**.

In our bug example, with StrictMode enabled:
- The `Results` component renders twice
- `calculateInvestmentResults` pushes data into the shared `results` array twice  
- The table immediately shows **double the rows** on first load
- The bug is **visible immediately** instead of hiding until you edit an input

### 2. Development Only

StrictMode's double-rendering **only happens during development**. In production builds, components render once as usual. There's zero performance impact in production.

### 3. Other Checks

StrictMode also:
- Warns about deprecated lifecycle methods
- Detects unexpected side effects
- Warns about legacy string ref usage
- Detects legacy context API usage

---

## Why Double Rendering Catches Bugs

React component functions should be **pure** — given the same props and state, they should produce the same output without side effects.

If rendering a component twice produces different results than rendering it once, something is wrong. Common culprits:

- **Mutating external variables** (like our `results` array)
- **Modifying DOM directly** during rendering
- **Side effects** that should be in `useEffect`

StrictMode's double-rendering is essentially React saying: "If your component is pure, rendering it twice should be harmless. Let's find out."

---

## The Fix in Context

Before (buggy):
```jsx
const results = []; // Outside component - shared across renders

export default function Results({ userInput }) {
  calculateInvestmentResults(userInput, results);
  // results accumulates across re-renders
}
```

After (correct):
```jsx
export default function Results({ userInput }) {
  const results = []; // Inside component - fresh on every render
  calculateInvestmentResults(userInput, results);
  // results is always a clean array
}
```

With StrictMode enabled, the buggy version shows the problem **immediately** on first load.

---

## Should You Always Use StrictMode?

**Yes.** There's virtually no reason not to. It:
- Has zero cost in production
- Catches real bugs early
- Is recommended by the React team
- Takes one line to enable

---

## ✅ Key Takeaways

- **StrictMode** is a built-in React component that enables extra development-time checks
- Its most important feature: **double-rendering** every component to catch impure rendering
- This double-rendering only happens in **development**, not in production
- It catches bugs caused by mutating shared state, side effects during rendering, and other impurities
- Wrap your root `<App />` component with `<StrictMode>` — there's no reason not to
- Variables that should reset on every render **must** be inside the component function

## ⚠️ Common Mistake

Declaring arrays, objects, or variables **outside** the component function when they should be inside it. If a value needs to be "fresh" on every render, it must be created inside the component function.

## 💡 Pro Tip

If you see components rendering twice in your console logs during development and can't figure out why — it's probably StrictMode doing its job. This is expected behavior, not a bug.
