# Outsourcing Validation Logic

## Introduction

You've built a reusable Input component for your UI. But what about the **validation logic** itself? Those checks like "is this an email?" or "does this have at least 6 characters?" — they're not specific to one component. You'll need them in login forms, signup forms, profile editors, and more across your app. So let's pull them out into reusable utility functions.

---

## The Problem: Validation Logic Scattered Across Components

Right now, your validation code might look like this inside a component:

```jsx
const emailIsInvalid = didEdit.email && !enteredValues.email.includes('@');
const passwordIsInvalid = didEdit.password && enteredValues.password.trim().length < 6;
```

This works, but these checks (email validation, minimum length) are **generic** operations. They'll be needed in your signup form too, and maybe in a settings form. Copying and pasting them is a recipe for bugs and inconsistency.

---

## Creating a Validation Utility File

Move your validation functions into a dedicated utility file:

```js
// util/validation.js

export function isEmail(value) {
  return value.includes('@');
}

export function isNotEmpty(value) {
  return value.trim() !== '';
}

export function hasMinLength(value, minLength) {
  return value.length >= minLength;
}

export function isEqualToOtherValue(value, otherValue) {
  return value === otherValue;
}
```

These are pure functions — they take input, return a boolean, and have no side effects. They're easy to test, easy to reuse, and easy to understand.

---

## Using the Utility Functions

Now in your component, import and use them:

```jsx
import { isEmail, isNotEmpty, hasMinLength } from '../util/validation';

const emailIsInvalid = didEdit.email && (!isEmail(enteredValues.email) || !isNotEmpty(enteredValues.email));
const passwordIsInvalid = didEdit.password && !hasMinLength(enteredValues.password, 6);
```

The behavior is exactly the same, but now:

- The validation rules are defined in **one place**
- Any component can import and use them
- If you need to change what "valid email" means, you change it once

---

## Why This Matters

This is a fundamental software engineering principle: **Don't Repeat Yourself (DRY)**. It applies not just to JSX (where we extracted the Input component) but also to logic.

Think of it as layers of reusability:

1. **UI layer** — Reusable Input component
2. **Logic layer** — Reusable validation functions
3. **State layer** — Coming next with a custom hook

Each layer eliminates a different kind of duplication.

---

## ✅ Key Takeaways

- Extract generic validation logic into a utility file (e.g., `util/validation.js`)
- Write validation functions as **pure functions** — input in, boolean out
- Import them wherever you need validation: login, signup, settings, etc.
- This follows the DRY principle and ensures consistency across your app
- Combine utility functions for compound checks (e.g., `isEmail(value) && isNotEmpty(value)`)

💡 **Pro Tip:** Keep validation functions simple and composable. Instead of one big `validateEmail()` function that checks everything, write small functions (`isEmail`, `isNotEmpty`, `hasMinLength`) and combine them as needed. This gives you maximum flexibility.
