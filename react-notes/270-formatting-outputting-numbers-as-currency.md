# Formatting & Outputting Numbers as Currency

## Introduction

Our meals are displayed with prices, but raw numbers like `12.99` look unprofessional. We could slap a dollar sign in front — `$12.99` — and call it a day. But what about prices like `8.5` (should be `$8.50`) or `12` (should be `$12.00`)? And what if we need currency formatting in multiple components?

The smart move: create a **reusable currency formatter** using JavaScript's built-in `Intl.NumberFormat` API.

---

## The Intl.NumberFormat API

JavaScript provides a powerful internationalization API for formatting numbers, dates, and more. For currency, we use `Intl.NumberFormat`:

```js
// src/util/formatting.js
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
```

This creates a formatter that:
- Formats numbers according to US English conventions
- Adds the `$` sign
- Ensures exactly **two decimal places**
- Handles thousands separators (e.g., `$1,234.56`)

---

## How to Use It

```jsx
import { currencyFormatter } from '../util/formatting';

// In your JSX:
<p className="meal-item-price">
  {currencyFormatter.format(meal.price)}
</p>
```

The `.format()` method takes a number and returns a formatted string:

| Input | Output |
|-------|--------|
| `12.99` | `$12.99` |
| `8.5` | `$8.50` |
| `12` | `$12.00` |
| `1234.5` | `$1,234.50` |

---

## Why Not Just Use String Concatenation?

```jsx
// ❌ Fragile approach
<p>${meal.price}</p>
```

This works for `12.99` but fails for edge cases:
- `8.5` renders as `$8.5` (missing trailing zero)
- `12` renders as `$12` (missing decimal places)
- `1234.56` renders as `$1234.56` (missing comma)

`Intl.NumberFormat` handles all of these consistently.

---

## Why a Separate Utility File?

We're putting this in `src/util/formatting.js` because:
1. **Reusability**: We'll need it in the cart, the checkout, and the order summary — not just the meal list
2. **Single source of truth**: If the currency or locale changes, update one file
3. **Performance**: Creating the formatter once and reusing it is more efficient than creating a new one on every render

---

## Customization Options

`Intl.NumberFormat` is highly configurable:

```js
// Euros
new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
// → 12,99 €

// Japanese Yen (no decimals)
new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
// → ￥1,300

// Compact notation
new Intl.NumberFormat('en-US', { notation: 'compact' });
// → 1.2K for 1234
```

For this project, USD with two decimal places is all we need.

---

## ✅ Key Takeaways

- Use `Intl.NumberFormat` for consistent currency formatting across your app
- Create the formatter **once** in a utility file and import it wherever needed
- The `.format()` method handles decimal places, currency symbols, and thousands separators automatically
- This is a built-in browser API — no libraries needed

## ⚠️ Common Mistakes

- Creating a new `Intl.NumberFormat` instance on every render — create it once outside of components
- Using string concatenation (`$` + price) instead of proper formatting — edge cases will bite you
- Forgetting that `Intl.NumberFormat` returns a **string**, not a number — don't try to do math with the result

## 💡 Pro Tip

The `Intl` API isn't just for numbers. Check out `Intl.DateTimeFormat` for dates, `Intl.RelativeTimeFormat` for "3 days ago" style strings, and `Intl.ListFormat` for joining arrays into human-readable lists ("apples, oranges, and bananas"). These built-in formatters save you from installing moment.js or similar libraries.
