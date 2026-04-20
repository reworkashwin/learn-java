# Computing Values & Properly Handling Number Values

## Introduction

With the user input now successfully lifted up and shared between components, it's time to actually *use* that input to compute investment results. But there's a sneaky JavaScript bug lurking in HTML input fields that catches almost every beginner: **input values are always strings**, even when you set `type="number"`. Let's derive computed values from state and squash this common bug.

---

## Deriving Values from State

### 🧠 What Does "Deriving" Mean?

In React, **deriving** means computing new values based on existing state rather than storing those values in separate state. You don't need a `useState` for every piece of data—if a value can be calculated from state, just calculate it.

### ⚙️ How to Derive Results

Inside the `Results` component, you receive the user input as a prop. You can pass it directly to the `calculateInvestmentResults` utility function:

```jsx
import { calculateInvestmentResults } from '../util/investment.js';

export default function Results({ input }) {
  const resultsData = calculateInvestmentResults(input);
  console.log(resultsData);
  return <p>Results</p>;
}
```

This works because the `input` prop is an object with exactly the shape that `calculateInvestmentResults` expects: `initialInvestment`, `annualInvestment`, `expectedReturn`, and `duration`.

The function returns an array of objects—one for each year—containing:
- `year` — the year number
- `interest` — interest earned that year
- `valueEndOfYear` — total investment value at year's end
- `annualInvestment` — the annual contribution

---

## The String Bug 🐛

### What Happens?

If you test this and change the initial investment, you'll notice something bizarre: the numbers look absurdly large, and eventually you start seeing `NaN`.

For example, instead of `17,100` for the first year's value, you might see `150002100` — that's not a number, that's two strings concatenated!

### ❓ Why Does This Happen?

In JavaScript, **every value from an HTML input field is a string**. Yes, even when you set `type="number"` on the input element. The `type` attribute only controls the browser UI (showing a number keyboard, spinners, etc.)—it does **not** convert the value to a JavaScript number.

So when you do:

```js
initialInvestment + annualInvestment
// "15000" + "2100" → "150002100" (string concatenation!)
```

The `+` operator, when one operand is a string, performs concatenation instead of addition.

### 🔧 The Fix

Go to the `App` component where you store user input values and add a **unary plus** operator to force the conversion:

```jsx
function handleChange(inputIdentifier, newValue) {
  setUserInput((prevInput) => ({
    ...prevInput,
    [inputIdentifier]: +newValue, // ← the + converts string to number
  }));
}
```

That single `+` in front of `newValue` converts the string `"15000"` to the number `15000`. Simple, elegant, and it fixes everything.

### Other Conversion Options

| Method | Example | Notes |
|--------|---------|-------|
| Unary `+` | `+newValue` | Shortest, most common |
| `Number()` | `Number(newValue)` | More explicit |
| `parseInt()` | `parseInt(newValue, 10)` | Only for integers |
| `parseFloat()` | `parseFloat(newValue)` | For decimals |

---

## ✅ Key Takeaways

- **Derive values** from state instead of creating extra state—React re-computes them on every render
- HTML `<input type="number">` still returns **string** values in JavaScript
- Use the unary `+` operator to convert input strings to numbers before storing them in state
- The `+` operator in JS performs concatenation if either operand is a string

## ⚠️ Common Mistakes

- Assuming `type="number"` gives you a number in JavaScript—it doesn't
- Storing raw string values from inputs in state and then doing math with them
- Forgetting to convert when combining values from multiple inputs

## 💡 Pro Tips

- Always convert input values to numbers **at the point where you store them**, not where you use them—this prevents bugs from spreading
- If you see impossibly large numbers or `NaN` in your calculations, check your types first
- `console.log(typeof value)` is your best friend when debugging type issues
