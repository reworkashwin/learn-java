# Avoiding Component Function Executions with memo()

## Introduction

Now that you understand *how* and *why* React re-executes component functions, a natural question arises: can we prevent unnecessary re-executions? The answer is yes — and one of the primary tools for this is React's `memo()` function.

But like any optimization tool, using it wisely requires understanding when it helps and when it hurts. Let's dig in.

---

## The Problem: Unnecessary Re-renders

Consider this scenario. You have an `App` component with an input field where the user types a number. Every keystroke updates state in `App`, causing `App` to re-execute. And since `App` contains child components like `Header` and `Counter`, **they all re-execute too** — even though the thing that changed (the input value) has nothing to do with them.

```
User types in input
→ App state changes (enteredNumber)
→ App re-executes
→ Header re-executes (unnecessarily!)
→ Counter re-executes (unnecessarily!)
  → IconButton re-executes
  → CounterOutput re-executes
  → etc...
```

The Counter component receives `initialCount` as a prop, and that prop *didn't change*. So why should Counter and all its children re-execute? They shouldn't.

---

## Enter memo()

`memo()` is a function provided by React that wraps around a component to prevent unnecessary re-executions:

```jsx
import { memo } from 'react';

const Counter = memo(function Counter({ initialCount }) {
  // component logic...
});

export default Counter;
```

### How It Works

Before React re-executes a memoized component, it **compares the previous props with the new props**:

- If all props are **exactly the same** → skip the re-execution entirely
- If any prop **changed** → re-execute the component as normal

This comparison uses **strict equality** (`===`), which means:
- Primitive values (numbers, strings, booleans) are compared by value
- Objects and arrays are compared by **reference** (are they the exact same object in memory?)

### What memo Does NOT Prevent

`memo()` only prevents re-executions triggered by **parent components**. If the wrapped component's **own internal state** changes, it will *always* re-execute — memo doesn't interfere with that. And that makes sense: if your own state changed, you definitely need to re-render.

---

## The Cascade Effect

Here's what makes `memo()` so powerful when used strategically. If you memo a component that's **high up** in the tree:

```
App
├── Header
└── Counter (memoized ✅)
    ├── IconButton
    │   └── MinusIcon
    ├── CounterOutput
    └── IconButton
        └── PlusIcon
```

When `App` re-renders due to input changes, `Counter` checks its props. If `initialCount` hasn't changed, Counter **and all its children** are skipped. One `memo()` call prevented six unnecessary function executions.

---

## When NOT to Use memo()

Here's where many developers go wrong — they wrap `memo()` around everything. Don't do that. Here's why:

### 1. The Comparison Has a Cost

Every time the parent re-renders, `memo()` has to compare all the previous props with the new props. This comparison isn't free. If the component *always* receives different props (which is common), you're paying the cost of comparison *plus* the cost of re-rendering. You've made things worse, not better.

### 2. Objects and Functions as Props

Because `memo()` uses strict equality, objects and functions that are recreated on every render will *always* appear "new" even if they contain the same data:

```jsx
// This creates a NEW object every render — memo won't help
<MyComponent style={{ color: 'red' }} />

// This creates a NEW function every render — memo won't help
<MyComponent onClick={() => doSomething()} />
```

For `memo()` to work with object/function props, you'd need to stabilize them with `useMemo` or `useCallback` (covered elsewhere).

### 3. Simple Components

If a component is cheap to render (just returns a few HTML elements), the cost of the memo comparison might exceed the cost of just re-rendering it. Don't optimize what doesn't need optimizing.

---

## Best Practices for memo()

Use `memo()` when:

- The component is **expensive to render** (complex calculations, large trees)
- The component is **high in the tree** (preventing it prevents many children from re-rendering)
- The component's **props rarely change** relative to how often the parent re-renders
- The props are **primitive values** or **stable references**

Avoid `memo()` when:

- The component almost always receives new props
- The component is cheap to render
- You'd need to memoize every prop to make it work

---

## Implementation Pattern

```jsx
import { memo } from 'react';

// Define the component
const Counter = memo(function Counter({ initialCount }) {
  console.log('Counter EXECUTING');
  // ... component logic
  return <div>{/* JSX */}</div>;
});

// Export the memoized version
export default Counter;
```

⚠️ **Note:** Define the component as a named function (not just an arrow function assigned to memo) to get proper component names in React DevTools.

---

## ✅ Key Takeaways

- `memo()` prevents a component from re-executing when its props haven't changed
- It only prevents re-executions triggered by **parent re-renders**, not internal state changes
- Use it on components **high in the component tree** for maximum impact
- Props are compared using strict equality (`===`) — objects and functions need special handling
- Don't wrap every component in `memo()` — the comparison itself has a cost

## ⚠️ Common Mistakes

- Wrapping *every* component in `memo()` — this adds overhead without benefit
- Using `memo()` on a component that receives new object/function props every render
- Expecting `memo()` to prevent re-renders caused by internal state changes
- Using `memo()` on trivially simple components where re-rendering is cheaper than comparing

## 💡 Pro Tip

Before reaching for `memo()`, consider whether you can solve the problem with **better component structure** instead. Moving state closer to where it's needed (into a child component) often eliminates unnecessary parent re-renders entirely — no `memo()` required. That's the topic of the next lesson.
