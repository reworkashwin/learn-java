# Adding a Reusable Button Component

## Introduction

We've got a Card wrapper — now let's build another reusable UI building block: a **custom Button component**. This component wraps the native HTML `<button>`, adds default styling via CSS Modules, and forwards key props like `type`, `onClick`, and `children`. It's a great example of how React composition works — you build small, focused pieces and assemble them into bigger features.

---

## Concept 1: Why Build a Custom Button?

### 🧠 What is it?

A custom Button component that wraps the built-in HTML `<button>` element with consistent styling and a clean API.

### ❓ Why do we need it?

Every app has buttons — submit buttons, cancel buttons, delete buttons. If you style each one individually, you end up with inconsistent designs and duplicated CSS. A reusable Button component ensures every button in your app looks and behaves the same way.

### ⚙️ How it works

The Button component:
1. Applies default styling via CSS Modules
2. Accepts a `type` prop (with a fallback to `"button"`)
3. Forwards `onClick` handlers to the native button
4. Renders `props.children` as the button text

### 💡 Insight

This is the wrapper pattern in action. You're not replacing the native button — you're enhancing it with default behavior and styling. Every React app eventually builds components like this.

---

## Concept 2: Building the Button Component

### 🧠 What is it?

The actual implementation — a functional component that renders a styled `<button>` element.

### ⚙️ How it works

```jsx
import React from 'react';
import classes from './Button.module.css';

const Button = (props) => {
  return (
    <button
      className={classes.button}
      type={props.type || 'button'}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
```

Let's break down each prop:

| Prop | Purpose | Fallback |
|---|---|---|
| `className` | Applies the styled `.button` class from CSS Modules | Always applied |
| `type` | Sets the button type (`submit`, `button`, `reset`) | `'button'` if not provided |
| `onClick` | Forwards click handler to the native button | `undefined` (no-op) |
| `children` | Renders the button's text/content | — |

### 🧪 Example

```jsx
// A submit button
<Button type="submit">Add User</Button>

// A button with a click handler
<Button onClick={cancelHandler}>Cancel</Button>

// Uses default type="button" if not specified
<Button onClick={doSomething}>Click Me</Button>
```

### 💡 Insight

The `props.type || 'button'` pattern provides a sensible default. Without it, an HTML button inside a form defaults to `type="submit"`, which might cause unexpected form submissions. By defaulting to `"button"`, we avoid that gotcha.

---

## Concept 3: Forwarding Props to Native Elements

### 🧠 What is it?

When you build a wrapper component, you need to pass relevant props through to the underlying native HTML element. This is called **prop forwarding**.

### ❓ Why do we need it?

If your Button component doesn't forward `onClick`, clicking the button does nothing. If it doesn't forward `type`, the button can't act as a submit button. The wrapper needs to be transparent — users of your component should feel like they're working with a regular button.

### ⚙️ How it works

```jsx
// What the user writes:
<Button type="submit" onClick={submitHandler}>Submit</Button>

// What actually renders in the DOM:
<button class="Button_button__2FnKz" type="submit">Submit</button>
```

The custom component acts as a middle layer — it receives the props, applies its own styling, and passes everything relevant down to the native element.

### 💡 Insight

We intentionally keep the prop names the same (`onClick`, `type`) as the native button's props. This makes our Button component feel familiar — anyone who knows how to use a native button can use our custom one without learning a new API.

---

## Concept 4: Using the Custom Button in AddUser

### 🧠 What is it?

Replacing the plain `<button>` in our AddUser form with our new styled `<Button>` component.

### ⚙️ How it works

```jsx
import Button from '../UI/Button';

// Before:
<button type="submit">Add User</button>

// After:
<Button type="submit">Add User</Button>
```

That's it! One character change (lowercase `b` → uppercase `B`) plus an import statement. The form still works because our Button forwards the `type="submit"` prop to the native button, so form submission is triggered as expected.

### 💡 Insight

This seamless swap is the beauty of well-designed components. The uppercase `B` tells React it's a custom component, the lowercase `b` would be a native HTML element. Convention matters!

---

## Concept 5: The Composition Philosophy

### 🧠 What is it?

At its core, every React component — no matter how complex — eventually renders native HTML elements (`div`, `button`, `input`, `p`, etc.). Custom components are just structured compositions of these primitives with added logic and styling.

### ❓ Why do we need it?

Understanding this helps demystify React. A Button component isn't magic — it's a function that returns a `<button>` with some extra features. A Card is just a `<div>` with styling. The power comes from how you combine them.

### 💡 Insight

Think of it like LEGO. Individual bricks (native elements) are simple and limited. But by combining them into structured assemblies (components), you build complex, reusable structures. React's component model is really just the LEGO instruction manual.

---

## ✅ Key Takeaways

- Build reusable UI components to ensure **consistent styling** and behavior across your app
- Use **prop forwarding** to pass relevant props through to native HTML elements
- Provide **sensible defaults** with the `||` operator: `props.type || 'button'`
- **`props.children`** renders whatever is placed between the component's tags
- Swapping a native element for a custom component should be a **minimal change** if the API is well-designed

## ⚠️ Common Mistakes

- Forgetting to forward `onClick` — the button renders but clicks do nothing
- Not providing a `type` fallback — buttons in forms default to `type="submit"`, causing accidental form submissions
- Adding parentheses when passing handlers: `onClick={handler()}` executes immediately instead of on click

## 💡 Pro Tips

- For more complex components, consider using the rest/spread pattern to forward all unknown props: `<button {...rest}>` — but keep it simple when you only need a few props
- CSS Module class names are guaranteed unique per component, so you can safely use generic names like `.button` without worrying about collisions
- Component names must start with an uppercase letter — React uses this to distinguish custom components from native HTML elements
