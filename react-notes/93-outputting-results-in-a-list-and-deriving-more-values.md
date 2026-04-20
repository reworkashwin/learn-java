# Outputting Results in a List & Deriving More Values

## Introduction

Now that we have correct investment results as an array of objects, it's time to display them in a proper HTML table. This lecture ties together several concepts: rendering lists with `.map()`, formatting numbers for display, and deriving additional values from existing data. By the end, you'll have a complete, polished results table.

---

## Building the Table Structure

### Setting Up the HTML Table

An HTML table in JSX uses the same tags as regular HTML:

```jsx
<table id="result">
  <thead>
    <tr>
      <th>Year</th>
      <th>Investment Value</th>
      <th>Interest (Year)</th>
      <th>Total Interest</th>
      <th>Invested Capital</th>
    </tr>
  </thead>
  <tbody>
    {/* dynamic rows go here */}
  </tbody>
</table>
```

Five columns: the year number, the investment value at year's end, interest earned that year, total interest accumulated across all years, and total capital invested.

---

## Rendering Dynamic Rows with `.map()`

### ⚙️ How It Works

You take the `resultsData` array and transform each entry into a `<tr>` element:

```jsx
<tbody>
  {resultsData.map((yearData) => (
    <tr key={yearData.year}>
      <td>{yearData.year}</td>
      <td>{yearData.valueEndOfYear}</td>
      <td>{yearData.interest}</td>
      {/* more columns... */}
    </tr>
  ))}
</tbody>
```

Each `<tr>` needs a unique `key` prop—`yearData.year` works perfectly since each year has a distinct number.

---

## Formatting Numbers for Display

Raw numbers like `17884.319999999998` look ugly. The utility file provides a `formatter` object that formats numbers into a readable currency-like format:

```jsx
import { calculateInvestmentResults, formatter } from '../util/investment.js';
```

Wrap any number with `formatter.format()`:

```jsx
<td>{formatter.format(yearData.valueEndOfYear)}</td>
<td>{formatter.format(yearData.interest)}</td>
```

This transforms `17884.32` into something like `$17,884.32`—much better.

---

## Deriving Values That Aren't Stored

Two of our five columns—**Total Interest** and **Invested Capital**—aren't directly available in the data. But they can be calculated from what we have.

### Total Interest

Total interest earned up to a given year is:

```
totalInterest = valueEndOfYear - annualInvestment × year - initialInvestment
```

The initial investment isn't stored directly in each year's data, but you can derive it from the first year's results:

```jsx
const initialInvestment =
  resultsData[0].valueEndOfYear -
  resultsData[0].interest -
  resultsData[0].annualInvestment;
```

Then inside the `.map()`:

```jsx
const totalInterest =
  yearData.valueEndOfYear -
  yearData.annualInvestment * yearData.year -
  initialInvestment;
```

### Invested Capital

Invested capital is the opposite of total interest—it's the portion of the total value that came from your actual contributions, not from interest:

```jsx
const totalAmountInvested = yearData.valueEndOfYear - totalInterest;
```

---

## The Complete Component

```jsx
export default function Results({ input }) {
  const resultsData = calculateInvestmentResults(input);
  const initialInvestment =
    resultsData[0].valueEndOfYear -
    resultsData[0].interest -
    resultsData[0].annualInvestment;

  return (
    <table id="result">
      <thead>
        <tr>
          <th>Year</th>
          <th>Investment Value</th>
          <th>Interest (Year)</th>
          <th>Total Interest</th>
          <th>Invested Capital</th>
        </tr>
      </thead>
      <tbody>
        {resultsData.map((yearData) => {
          const totalInterest =
            yearData.valueEndOfYear -
            yearData.annualInvestment * yearData.year -
            initialInvestment;
          const totalAmountInvested = yearData.valueEndOfYear - totalInterest;

          return (
            <tr key={yearData.year}>
              <td>{yearData.year}</td>
              <td>{formatter.format(yearData.valueEndOfYear)}</td>
              <td>{formatter.format(yearData.interest)}</td>
              <td>{formatter.format(totalInterest)}</td>
              <td>{formatter.format(totalAmountInvested)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

---

## ✅ Key Takeaways

- Use `.map()` to render arrays of data as lists of JSX elements
- Always provide a unique `key` prop for list items
- **Derive values** from existing data instead of storing redundant state
- Use formatter utilities to make numbers human-readable

## ⚠️ Common Mistakes

- Forgetting the `key` prop on list items—React will warn you and performance suffers
- Trying to store derived values in state (like total interest) when you can calculate them on the fly
- Not formatting numbers for display, leading to ugly decimals

## 💡 Pro Tips

- You can use `Intl.NumberFormat` to create custom formatters for currencies, percentages, etc.
- If your `.map()` callback needs to compute intermediate values (like `totalInterest`), use curly braces and an explicit `return` instead of the arrow function shorthand
- Deriving values in the render keeps your code in sync—no stale data
