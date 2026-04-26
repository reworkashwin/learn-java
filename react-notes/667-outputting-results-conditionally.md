# Outputting Results Conditionally

## Introduction

We've built a results table component, but right now it renders even when there's no data — which looks broken. In this section, we learn how to **conditionally render content** based on state, pass calculated data via props, format numbers as currencies, and display meaningful fallback text. This is a crucial skill — almost every React app needs to show or hide UI elements based on some condition.

---

## Concept 1: Conditional Rendering Based on State

### 🧠 What is it?

Conditional rendering means showing or hiding parts of your UI depending on some value — typically a piece of state. In our case, we want to show the `ResultsTable` only when we actually have investment data to display, and show a fallback message otherwise.

### ❓ Why do we need it?

Think about it — what happens if you try to render a table full of calculations when there's no user input yet? You'd get empty rows, broken numbers, or even errors. Conditional rendering lets us protect against that and give the user a much better experience.

### ⚙️ How it works

We check if `userInput` is `null` (the initial state). If it is, we haven't done any calculations, so we show a fallback paragraph. If it's not null, we know the user submitted data, and we render the table.

```jsx
{!userInput && <p style={{ textAlign: 'center' }}>No investment calculated yet.</p>}
{userInput && <ResultsTable data={yearlyData} initialInvestment={userInput['current-savings']} />}
```

- `!userInput` — if `userInput` is `null` (falsy), show the fallback text
- `userInput` — if it's truthy (user submitted data), show the results table

### 🧪 Example

Initially, the user sees: **"No investment calculated yet."**

Once they fill the form and press Calculate, the state changes from `null` to an object. React re-renders, the condition flips, and the table appears with all the calculated data.

### 💡 Insight

This is one of the most common patterns in React — the **short-circuit evaluation** with `&&`. If the left side is falsy, React renders nothing. If it's truthy, React renders whatever's on the right side.

---

## Concept 2: Passing Calculated Data to Child Components via Props

### 🧠 What is it?

Once we have our calculation results (`yearlyData` — an array of objects, one per year), we need to get that data into the `ResultsTable` component. We do this by passing it as a prop.

### ❓ Why do we need it?

The calculations happen in `App.js`, but the rendering happens in `ResultsTable`. React's data flow is **top-down** — parent components pass data to children via props.

### ⚙️ How it works

In `App.js`, we pass the data:

```jsx
<ResultsTable data={yearlyData} initialInvestment={userInput['current-savings']} />
```

In `ResultsTable.js`, we accept it and loop through:

```jsx
const ResultsTable = (props) => {
  return (
    <table>
      <tbody>
        {props.data.map((yearData) => (
          <tr key={yearData.year}>
            <td>{yearData.year}</td>
            <td>{yearData.savingsEndOfYear}</td>
            <td>{yearData.yearlyInterest}</td>
            <td>{yearData.savingsEndOfYear - props.initialInvestment - yearData.yearlyContribution * yearData.year}</td>
            <td>{props.initialInvestment + yearData.yearlyContribution * yearData.year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 🧪 Example

Each object in `yearlyData` has keys like `year`, `savingsEndOfYear`, `yearlyInterest`, and `yearlyContribution`. The table maps over these and computes:

- **Total Interest Gained** = Savings at end of year − initial investment − (yearly contribution × years)
- **Total Invested Capital** = Initial investment + (yearly contribution × years)

### 💡 Insight

Notice we needed to pass `initialInvestment` as a separate prop because that data isn't part of the `yearlyData` array — it comes from `userInput`. Don't be afraid to pass multiple props when a component needs data from different sources.

---

## Concept 3: Adding a Key Prop to List Items

### 🧠 What is it?

When rendering lists with `.map()`, React needs a `key` prop on each element to efficiently track and update individual items in the DOM.

### ❓ Why do we need it?

Without a unique key, React can't tell which items changed, were added, or were removed. This leads to performance issues and sometimes bugs with component state.

### ⚙️ How it works

```jsx
<tr key={yearData.year}>
```

Since `yearData.year` is unique for every row (year 1, year 2, etc.), it's a perfect candidate for the key.

### 💡 Insight

Always use a value that's **stable and unique** within the list. Array indices work in a pinch, but a domain-specific identifier (like `year`) is always better.

---

## Concept 4: Formatting Numbers as Currency

### 🧠 What is it?

Raw numbers like `15234.567` aren't user-friendly. JavaScript's built-in `Intl.NumberFormat` API lets you format numbers as properly localized currencies.

### ❓ Why do we need it?

When displaying financial data, users expect to see `$15,234.57`, not `15234.567`. Proper formatting builds trust and readability.

### ⚙️ How it works

```javascript
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Usage:
formatter.format(yearData.savingsEndOfYear);
formatter.format(yearData.yearlyInterest);
```

You wrap each numeric value with `formatter.format(...)` to get a nicely formatted currency string.

### 🧪 Example

| Before | After |
|--------|-------|
| `15234.567` | `$15,234.57` |
| `1200` | `$1,200.00` |

### 💡 Insight

`Intl.NumberFormat` is a **vanilla JavaScript feature**, not a React thing. It works everywhere — Node.js, browser, etc. Knowing built-in APIs like this saves you from installing extra libraries.

---

## ✅ Key Takeaways

- Use **conditional rendering** (`&&` short-circuit) to show/hide UI based on state
- Pass data from parent to child via **props** — React's data flow is always top-down
- Always add a **unique `key` prop** when rendering lists with `.map()`
- Use `Intl.NumberFormat` for **professional number/currency formatting** without external libraries
- Show **fallback content** when data isn't available yet — it's a better user experience

## ⚠️ Common Mistakes

- Forgetting to add a `key` prop to list items — React warns you, but developers often ignore it
- Not checking for `null` or `undefined` before rendering data-dependent components — leads to crashes
- Passing data that lives in one object (like `initialInvestment`) as part of another array — keep your data sources clean and pass them as separate props

## 💡 Pro Tips

- Inline styles in React use a JavaScript object: `style={{ textAlign: 'center' }}` — note the double curly braces (one for JSX expression, one for the object literal)
- When computing derived values in JSX (like total interest), consider extracting them into variables above the return statement for readability
- `Intl.NumberFormat` supports many locales and currencies — adjust `'en-US'` and `'USD'` for internationalized apps
