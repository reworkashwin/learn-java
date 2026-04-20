# Handling Events & Using Two-Way-Binding

## Introduction

We have the input fields on screen, but they're not connected to anything. In this lesson, we wire them up with **two-way binding** — state flows into the input (via `value`), and user changes flow back into state (via `onChange`). We also build a single, reusable change handler for all four inputs.

---

## Setting Up State

### ⚙️ One State Object for All Inputs

```jsx
import { useState } from 'react';

const [userInput, setUserInput] = useState({
  initialInvestment: 10000,
  annualInvestment: 1200,
  expectedReturn: 6,
  duration: 10,
});
```

Each property corresponds to one input field. The initial values serve as defaults that the user can change.

---

## The Generic Change Handler

### 🧠 One Function, Four Inputs

Instead of writing four separate handlers, we write one **generic handler** that works for any input:

```jsx
function handleChange(inputIdentifier, newValue) {
  setUserInput((prevUserInput) => ({
    ...prevUserInput,
    [inputIdentifier]: newValue,
  }));
}
```

Let's break this down:

**1. Two parameters:**
- `inputIdentifier` — A string like `'initialInvestment'` or `'duration'` that tells us **which** input changed
- `newValue` — The new value the user entered

**2. Function form of `setState`:**
- We use `(prevUserInput) => ...` because the new state depends on the old state
- We don't want to lose the other three values when one changes

**3. Spread operator:**
- `...prevUserInput` copies all existing values into the new object

**4. Computed property name:**
- `[inputIdentifier]: newValue` dynamically sets the property that matches the changed input

### 🧪 How It Works in Practice

If the user changes the duration to 15:
```js
handleChange('duration', '15');
// prevUserInput: { initialInvestment: 10000, annualInvestment: 1200, expectedReturn: 6, duration: 10 }
// New state:     { initialInvestment: 10000, annualInvestment: 1200, expectedReturn: 6, duration: '15' }
```

---

## Connecting Inputs with Two-Way Binding

### ⚙️ The `value` and `onChange` Props

For each input, we need two things:

```jsx
<input
  type="number"
  required
  value={userInput.initialInvestment}
  onChange={(event) => handleChange('initialInvestment', event.target.value)}
/>
```

**`value={userInput.initialInvestment}`** — The displayed value comes from state (state → UI)

**`onChange={(event) => handleChange('initialInvestment', event.target.value)}`** — User changes flow back to state (UI → state)

### ❓ Why the Anonymous Arrow Function?

We can't just write `onChange={handleChange}` because:
1. React would call `handleChange` with only the event object
2. We need to pass **two** custom arguments: the identifier and the value

The anonymous function lets us control **exactly** how `handleChange` is called:

```jsx
onChange={(event) => handleChange('initialInvestment', event.target.value)}
```

This creates a wrapper that:
1. Receives the event object from React
2. Calls `handleChange` with our custom identifier and `event.target.value`

### 🧠 What's `event.target.value`?

- `event` — The event object React automatically provides
- `event.target` — The DOM element that triggered the event (the `<input>`)
- `event.target.value` — The current text/value in that input field

---

## Applying to All Four Inputs

Repeat the pattern for each input, changing only the identifier and the state property:

```jsx
{/* Input 1 */}
<input
  type="number"
  required
  value={userInput.initialInvestment}
  onChange={(e) => handleChange('initialInvestment', e.target.value)}
/>

{/* Input 2 */}
<input
  type="number"
  required
  value={userInput.annualInvestment}
  onChange={(e) => handleChange('annualInvestment', e.target.value)}
/>

{/* Input 3 */}
<input
  type="number"
  required
  value={userInput.expectedReturn}
  onChange={(e) => handleChange('expectedReturn', e.target.value)}
/>

{/* Input 4 */}
<input
  type="number"
  required
  value={userInput.duration}
  onChange={(e) => handleChange('duration', e.target.value)}
/>
```

---

## Two-Way Binding: The Full Picture

```
State (userInput)
    ↓ value prop
  Input Field
    ↓ user types
  onChange fires
    ↓ handleChange called
  setUserInput updates state
    ↓ component re-renders
  Input shows new value
```

This creates a **controlled component** — React state is the single source of truth for the input's value. The input always reflects the state, and user changes always go through state.

---

## ✅ Key Takeaways

- **Two-way binding** = `value` prop (state → input) + `onChange` handler (input → state)
- A single generic handler with a dynamic identifier avoids code duplication for multiple inputs
- Use anonymous functions in `onChange` to pass custom arguments to your handler
- `event.target.value` gives you the current value of the input element
- Always use the function form of `setState` when the new state depends on the old state

## ⚠️ Common Mistakes

- Forgetting the `value` prop — without it, the input becomes "uncontrolled" and React doesn't manage it
- Passing `handleChange` directly to `onChange` without wrapping it — you'd lose the custom identifier argument
- Note that `event.target.value` is always a **string**, even for `type="number"` inputs — you may need to convert it with `+value` or `Number(value)` for calculations

## 💡 Pro Tips

- The generic handler pattern scales beautifully — whether you have 4 inputs or 40, the same handler works
- Controlled components give you full control: you can validate, transform, or reject input changes before they reach state
- If you find yourself writing nearly identical handlers for multiple inputs, that's a strong signal to use this generic pattern instead
