# Adding Validation Checks to Form Actions

## Introduction

You've set up a form action that receives FormData and extracts values. Now comes the critical next step: **validating** those values before doing anything with them. The approach is similar to what you've done before — check each field, collect errors — but now you're working within the form action function rather than a traditional submit handler.

---

## Extracting All Form Values

With FormData, you extract each value using `.get()` with the input's `name` as the key:

```jsx
function signUpAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');
  const firstName = formData.get('first-name');
  const lastName = formData.get('last-name');
  const role = formData.get('role');
  const terms = formData.get('terms');
  const acquisitionChannel = formData.getAll('acquisition');
}
```

### `.get()` vs `.getAll()`

- **`.get(name)`** — Returns a single value. Use this for text inputs, selects, and single checkboxes.
- **`.getAll(name)`** — Returns an **array** of all values for inputs sharing the same name. Use this for checkbox groups where multiple options can be selected.

For example, if you have three checkboxes all named `"acquisition"`, and the user checks two of them, `.getAll('acquisition')` returns an array of two values.

---

## Building an Errors Array

A clean pattern for validation: start with an empty array, check each field, and push error messages for any that fail:

```jsx
function signUpAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  // ... extract other values

  const errors = [];

  if (!isEmail(email)) {
    errors.push('Invalid email address.');
  }

  if (!isNotEmpty(password) || !hasMinLength(password, 6)) {
    errors.push('Password must be at least 6 characters.');
  }

  if (!isEqualToOtherValue(password, confirmPassword)) {
    errors.push('Passwords do not match.');
  }

  if (!isNotEmpty(firstName) || !isNotEmpty(lastName)) {
    errors.push('Please provide both your first and last name.');
  }

  if (!isNotEmpty(role)) {
    errors.push('Please select a role.');
  }

  if (!terms) {
    errors.push('You must agree to the terms and conditions.');
  }

  if (acquisitionChannel.length === 0) {
    errors.push('Please select at least one acquisition channel.');
  }
}
```

### Using Utility Functions

Import the same validation utilities we created earlier:

```jsx
import { isEmail, isNotEmpty, isEqualToOtherValue, hasMinLength } from '../util/validation';
```

This keeps your validation consistent across the app whether you're using classic form handling or form actions.

---

## What to Do with the Errors

At this point, the `errors` array either has items (validation failed) or is empty (everything's valid). But how do you show these errors to the user?

The action function can **return a value** — and you can return the errors:

```jsx
if (errors.length > 0) {
  return { errors };
}

// No errors — proceed
return { errors: null };
```

The question is: how do you access this return value from inside your component's JSX? The form action is just a function — it's not connected to any state. That's where `useActionState` comes in, which we'll explore in the next note.

---

## ✅ Key Takeaways

- Use `formData.get('name')` to extract individual input values
- Use `formData.getAll('name')` for checkbox groups with the same name (returns an array)
- Build an errors array and push messages for each failed validation check
- Import reusable validation utility functions to keep logic consistent
- The action function can **return** data (like errors) that will be consumed via `useActionState`
- Checkbox values are falsy (null) when unchecked — use a simple truthiness check

💡 **Pro Tip:** The errors-array pattern scales well. Whether you have 3 fields or 30, you follow the same pattern: check each field, push an error message if invalid, return the array.
