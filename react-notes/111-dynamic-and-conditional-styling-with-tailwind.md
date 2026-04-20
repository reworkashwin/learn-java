# Dynamic & Conditional Styling with Tailwind

## Introduction

So you know how to style elements with Tailwind utility classes and how to handle hover states and responsive breakpoints. But what about **conditional styling** — changing classes based on some prop or state? Like turning an input border red when validation fails?

This is where Tailwind meets React's dynamic nature, and the approach is surprisingly straightforward.

---

## The Challenge

Consider an `Input` component that needs two visual states:
- **Default**: gray border, gray background, neutral text
- **Invalid**: red border, red background, red label text

With styled components, you'd use props and interpolation. With Tailwind, you use **JavaScript string logic** to build your class names dynamically.

---

## The Approach: Conditional Class Strings

The basic idea is to build your `className` value using JavaScript expressions:

```jsx
export default function Input({ label, invalid, ...props }) {
  const labelClasses = `block mb-2 text-xs font-bold tracking-wide uppercase ${
    invalid ? 'text-red-400' : 'text-stone-300'
  }`;

  const inputClasses = `w-full px-3 py-2 leading-tight border rounded shadow ${
    invalid
      ? 'text-red-500 bg-red-100 border-red-300'
      : 'text-gray-700 bg-stone-300 border-stone-300'
  }`;

  return (
    <p>
      <label className={labelClasses}>{label}</label>
      <input className={inputClasses} {...props} />
    </p>
  );
}
```

### How This Works

1. **Base classes** — Classes that are always applied regardless of state (`block`, `mb-2`, `w-full`, `px-3`, etc.)
2. **Conditional classes** — Classes that change based on the `invalid` prop
3. **Template literals** — JavaScript template strings combine the base and conditional parts

The key insight: **separate the classes that never change from the ones that do**.

---

## Step-by-Step Breakdown

### Step 1: Identify the base classes

These are the classes that apply in ALL states:

```js
const base = 'w-full px-3 py-2 leading-tight border rounded shadow';
```

### Step 2: Define the conditional classes

These change depending on a condition:

```js
const conditional = invalid
  ? 'text-red-500 bg-red-100 border-red-300'
  : 'text-gray-700 bg-stone-300 border-stone-300';
```

### Step 3: Combine them

```js
const inputClasses = `${base} ${conditional}`;
```

⚠️ **Common Mistake:** Forgetting the **space** between base classes and conditional classes. Without it, you'd get something like `shadowtext-red-500` — one garbled class instead of two separate ones.

---

## Alternative: Using an If Statement

If you prefer more explicit logic over ternary operators:

```jsx
let labelClasses = 'block mb-2 text-xs font-bold tracking-wide uppercase text-stone-300';

if (invalid) {
  labelClasses = 'block mb-2 text-xs font-bold tracking-wide uppercase text-red-400';
}
```

This works but **repeats all the base classes**, which violates DRY. The template literal approach from earlier is cleaner.

---

## The Complete Input Component

```jsx
export default function Input({ label, invalid, ...props }) {
  const labelClasses = `block mb-2 text-xs font-bold tracking-wide uppercase ${
    invalid ? 'text-red-400' : 'text-stone-300'
  }`;

  const inputClasses = `w-full px-3 py-2 leading-tight border rounded shadow ${
    invalid
      ? 'text-red-500 bg-red-100 border-red-300'
      : 'text-gray-700 bg-stone-300 border-stone-300'
  }`;

  return (
    <p>
      <label className={labelClasses}>{label}</label>
      <input className={inputClasses} {...props} />
    </p>
  );
}
```

Using it:

```jsx
<Input label="Email" invalid={emailIsInvalid} type="email" onChange={handleEmailChange} />
<Input label="Password" invalid={passwordIsInvalid} type="password" onChange={handlePasswordChange} />
```

The JSX stays clean and readable. All the conditional class logic is handled **inside** the component.

---

## Why This Works Well in React

This pattern meshes perfectly with React's philosophy:
- Logic lives inside the **component function**, not in CSS files
- Props drive the visual state
- The component's **public API** is simple (`label`, `invalid`, and whatever other props you forward)
- The complexity of multiple class names is **encapsulated**

---

## ✅ Key Takeaways

- Build `className` strings dynamically using **template literals** and **ternary operators**
- **Separate** base classes (always applied) from conditional classes (state-dependent)
- Always ensure there's a **space** between combined class strings
- Keep the conditional logic inside the component — the consumer just passes a prop
- This pattern works with any number of conditions, not just boolean true/false

## 💡 Pro Tip

For components with many conditional states, consider a helper library like `clsx` or `classnames`:

```jsx
import clsx from 'clsx';

const inputClasses = clsx(
  'w-full px-3 py-2 border rounded',
  invalid && 'text-red-500 bg-red-100 border-red-300',
  !invalid && 'text-gray-700 bg-stone-300'
);
```

This keeps things readable even when you have many conditions.
