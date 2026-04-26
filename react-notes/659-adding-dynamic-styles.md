# Adding Dynamic Styles in React

## Introduction

Sometimes CSS classes aren't enough — you need styles that change based on **runtime data**. How do you set the height of a bar to exactly 73%? Or change a color based on a value? This lesson covers React's `style` prop and how to apply **inline dynamic styles** to elements.

---

## The `style` Prop in React

### 🧠 What is it?

The `style` prop lets you apply inline CSS styles to any JSX element. Unlike regular HTML where `style` takes a string, in React it takes a **JavaScript object**.

### ❓ Why do we need it?

When a style value depends on **data** — like filling a chart bar to a calculated percentage — you can't define it in a static CSS file. You need to compute it at runtime and apply it dynamically.

### ⚙️ How it works

```jsx
<div style={{ height: barFillHeight }}></div>
```

The double curly braces aren't special syntax:
- **First `{}`** — opens a dynamic JSX expression
- **Second `{}`** — creates a JavaScript object literal

### 🧪 Example

```jsx
const ChartBar = (props) => {
  let barFillHeight = '0%';

  if (props.maxValue > 0) {
    barFillHeight = Math.round((props.value / props.maxValue) * 100) + '%';
  }

  return (
    <div className="chart-bar">
      <div className="chart-bar__inner">
        <div
          className="chart-bar__fill"
          style={{ height: barFillHeight }}
        ></div>
      </div>
      <div className="chart-bar__label">{props.label}</div>
    </div>
  );
};
```

---

## CSS Property Names in the Style Object

### ⚙️ How it works

| CSS Property | In React `style` Object |
|---|---|
| `height` | `height` |
| `background-color` | `backgroundColor` (camelCase) |
| `font-size` | `fontSize` |
| `border-radius` | `borderRadius` |

Dashed CSS names become **camelCase** in the JavaScript object. Alternatively, wrap them in quotes:

```jsx
style={{ 'background-color': 'red' }}  // works but less common
style={{ backgroundColor: 'red' }}     // preferred
```

---

## Calculating Dynamic Values

### ⚙️ How it works

For the chart bar, we calculate the fill percentage:

```jsx
let barFillHeight = '0%';

if (props.maxValue > 0) {
  barFillHeight = Math.round((props.value / props.maxValue) * 100) + '%';
}
```

- Default to `'0%'` to handle the zero-data case
- Guard against division by zero with the `if` check
- `Math.round()` gives a clean integer percentage
- Concatenate `'%'` to create a valid CSS value string

### 💡 Insight

The overall chart bar has a fixed height (from CSS). The `chart-bar__fill` div inside it gets a **dynamic height** — so a value of `'50%'` fills half the bar, `'100%'` fills the whole thing.

---

## ✅ Key Takeaways

- React's `style` prop takes a **JavaScript object**, not a CSS string
- Use **camelCase** for multi-word CSS properties (`backgroundColor`, not `background-color`)
- Dynamic styles are perfect for values that depend on runtime data
- Always guard against edge cases (like division by zero) when computing style values
- The "double curly brace" syntax is just a JSX expression containing an object literal

## ⚠️ Common Mistakes

- Passing a string to `style` like in HTML: `style="height: 50%"` — this won't work in React
- Forgetting to convert CSS property names to camelCase
- Not appending units (`'px'`, `'%'`) to numeric style values that need them

## 💡 Pro Tips

- Prefer CSS classes for static styles — only use inline `style` for truly **dynamic** values
- React automatically appends `px` to numeric values for most properties (e.g., `{ width: 100 }` becomes `width: 100px`), but percentage values must be strings (`'50%'`)
- Later in the course, you'll learn about CSS Modules and styled-components for scoped, dynamic styling without inline styles
