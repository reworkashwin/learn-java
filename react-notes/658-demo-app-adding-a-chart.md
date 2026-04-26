# Demo App — Adding a Chart

## Introduction

The expense tracker is nearly complete — but it's missing the visual punchline: a **chart** that shows expenses per month. This lesson puts everything you've learned together — dynamic lists, keys, props, component composition — to build a reusable chart with dynamic bar fills. It's a great capstone exercise for this module.

---

## Designing the Chart Components

### 🧠 What is it?

The chart is split into two components:
- **`Chart`** — The container that receives data points and renders bars
- **`ChartBar`** — An individual bar that visually represents a single data point

### ❓ Why split them?

Separation of concerns: the `Chart` handles layout and data flow, while `ChartBar` handles the visual rendering of a single bar. This also makes `Chart` **reusable** — it's not hardcoded to months.

---

## Building the Chart Component

### ⚙️ How it works

The `Chart` component receives a `dataPoints` array as a prop, maps through it, and renders a `ChartBar` for each data point:

```jsx
import ChartBar from './ChartBar';
import './Chart.css';

const Chart = (props) => {
  const dataPointValues = props.dataPoints.map(dp => dp.value);
  const totalMaximum = Math.max(...dataPointValues);

  return (
    <div className="chart">
      {props.dataPoints.map((dataPoint) => (
        <ChartBar
          key={dataPoint.label}
          value={dataPoint.value}
          maxValue={totalMaximum}
          label={dataPoint.label}
        />
      ))}
    </div>
  );
};
```

### 💡 Insight — Calculating the Maximum

To fill each bar proportionally, we need the **maximum value** across all data points:

```jsx
const dataPointValues = props.dataPoints.map(dp => dp.value);
const totalMaximum = Math.max(...dataPointValues);
```

- `.map()` transforms objects into just their values (numbers)
- The **spread operator** (`...`) pulls array elements out as individual arguments to `Math.max()`
- This max value is passed to every `ChartBar` so each bar can calculate its fill percentage

---

## Building the ChartBar Component

### ⚙️ How it works

Each bar calculates its fill height relative to the max value:

```jsx
const ChartBar = (props) => {
  let barFillHeight = '0%';

  if (props.maxValue > 0) {
    barFillHeight = Math.round((props.value / props.maxValue) * 100) + '%';
  }

  return (
    <div className="chart-bar">
      <div className="chart-bar__inner">
        <div className="chart-bar__fill" style={{ height: barFillHeight }}></div>
      </div>
      <div className="chart-bar__label">{props.label}</div>
    </div>
  );
};
```

### 🧪 Example — Dynamic Inline Styles

The `style` prop in React takes a **JavaScript object**, not a string:

```jsx
<div style={{ height: barFillHeight }}></div>
```

- Outer `{}` — dynamic expression in JSX
- Inner `{}` — JavaScript object literal
- CSS property names use **camelCase** (e.g., `backgroundColor`, not `background-color`)
- Or wrap dashed names in quotes: `{ 'background-color': 'red' }`

---

## Connecting Chart to Expenses Data

### ⚙️ How it works

The `ExpensesChart` component bridges expenses data and the chart:

```jsx
const ExpensesChart = (props) => {
  const chartDataPoints = [
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 0 },
    // ... all 12 months
    { label: 'Dec', value: 0 },
  ];

  for (const expense of props.expenses) {
    const expenseMonth = expense.date.getMonth(); // 0 = Jan, 11 = Dec
    chartDataPoints[expenseMonth].value += expense.amount;
  }

  return <Chart dataPoints={chartDataPoints} />;
};
```

- Initialize 12 data points with zero values
- Loop through expenses, use `getMonth()` (0-indexed) to find the right data point
- Add the expense amount to that month's value
- Pass the updated data points to `Chart`

### 💡 Insight

`getMonth()` returns 0 for January and 11 for December — which conveniently matches array indices. No offset math needed!

---

## Common Gotchas Encountered

| Bug | Cause | Fix |
|---|---|---|
| `Cannot read property 'getMonth' of undefined` | Using `for...in` instead of `for...of` | `for...of` iterates array values; `for...in` iterates object keys |
| Bars not filling | Checking `props.max` instead of `props.maxValue` | Prop name must match what was passed in the parent |

---

## ✅ Key Takeaways

- Split visual components into **container** (Chart) and **item** (ChartBar) components
- Use `.map()` to transform data and `Math.max(...values)` with spread to find maximums
- The `style` prop takes a **JavaScript object** with camelCase properties
- Always guard against division by zero when calculating percentages
- `for...of` loops iterate array **values** — `for...in` iterates **keys/indices**

## ⚠️ Common Mistakes

- Using `for...in` on arrays instead of `for...of`
- Mismatching prop names between parent and child components
- Forgetting that `getMonth()` is zero-indexed
- Setting `style` as a string instead of an object

## 💡 Pro Tips

- Building configurable components (like a chart that accepts any data points) makes them reusable across your entire app
- The `key` prop matters even in charts — use the label or a unique ID for each bar
- CSS styles set via the `style` prop override class-based styles — use them sparingly for truly dynamic values
