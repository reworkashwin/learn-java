# Dynamic & Conditional Inline Styles

## Introduction

One of the strongest advantages of inline styles is how naturally they work with dynamic values. Since the `style` prop takes a JavaScript object, you can use any JavaScript expression—including ternary operators and state variables—to set styles conditionally. Let's see this in action with input validation styling.

---

## The Scenario

When a user submits the form with an invalid email, we want the email input's background to turn red. When the email is valid, it should have its normal background color.

We have a variable `emailNotValid` that is `true` when the email is invalid and `false` when it's valid.

---

## Applying Conditional Inline Styles

### Using a Ternary Expression

```jsx
<input
  type="email"
  style={{
    backgroundColor: emailNotValid ? '#fed2d2' : '#d1d5db',
  }}
/>
```

Here's what's happening:
1. `emailNotValid` is evaluated
2. If `true` → `backgroundColor` is set to the reddish color `#fed2d2`
3. If `false` → `backgroundColor` is set to the default gray `#d1d5db`

React re-evaluates this expression on every render. When the user types a valid email and the state updates, `emailNotValid` becomes `false`, and the background color changes back to gray—automatically.

### Multiple Conditional Properties

You can conditionally set multiple CSS properties in the same object:

```jsx
<input
  style={{
    backgroundColor: emailNotValid ? '#fed2d2' : '#d1d5db',
    color: emailNotValid ? '#ef4444' : '#374151',
    borderColor: emailNotValid ? '#f87171' : 'transparent',
  }}
/>
```

Each property independently checks the condition and applies the appropriate value.

---

## Why This Works So Well

Since inline styles are just JavaScript objects, you have the full power of JavaScript available:

```jsx
// Using variables
const bgColor = emailNotValid ? '#fed2d2' : '#d1d5db';

<input style={{ backgroundColor: bgColor }} />
```

```jsx
// Using a function
function getInputStyle(isInvalid) {
  return {
    backgroundColor: isInvalid ? '#fed2d2' : '#d1d5db',
    color: isInvalid ? '#ef4444' : '#374151',
  };
}

<input style={getInputStyle(emailNotValid)} />
```

---

## The Downside: Duplication

If you have both an email input and a password input that need the same conditional styling, you end up duplicating the style logic:

```jsx
<input style={{ backgroundColor: emailNotValid ? '#fed2d2' : '#d1d5db' }} />
{/* ...later... */}
<input style={{ backgroundColor: passwordNotValid ? '#fed2d2' : '#d1d5db' }} />
```

This repetition is one of the key reasons developers look for alternatives to inline styles.

---

## ✅ Key Takeaways

- Use **ternary expressions** inside the style object to apply styles conditionally
- The style object is re-evaluated on every render, so it reacts to state changes automatically
- You can conditionally set as many CSS properties as you need in a single style object
- Inline styles make dynamic styling simple but lead to duplication

## ⚠️ Common Mistakes

- Forgetting to provide **both** sides of the ternary—always specify the default/fallback style
- Using `&&` instead of a ternary for style values: `emailNotValid && '#fed2d2'` gives you `false` as a color value, not what you want

## 💡 Pro Tips

- Extract conditional style objects into helper functions to reduce duplication
- If you find yourself repeating the same conditional styles across many components, it's a signal to consider a different styling approach
- Inline styles are great for prototyping conditional styles before implementing them in CSS
