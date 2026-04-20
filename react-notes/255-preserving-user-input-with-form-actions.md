# Preserving User Input with Form Actions

## Introduction

Form actions have an automatic convenience: React resets the form after each submission. That's great when the submission succeeds — a clean slate for the next entry. But when validation fails, this behavior is **destructive**. The user carefully filled out 8 fields, got one wrong, and now all their inputs are gone. To fix this, you need to return the entered values in your action's state and use them to repopulate the form.

---

## The Problem

When you use the `action` prop on a `<form>`, React resets all inputs back to their default values after the action function runs. If the form has validation errors, the user's correctly-entered values are lost.

This is different from the classic `onSubmit` approach, where the form keeps its values by default.

---

## The Solution: Return Entered Values in Your State

In your action function, include all the entered values in the returned state object:

```jsx
function signUpAction(previousState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const firstName = formData.get('first-name');
  const lastName = formData.get('last-name');
  const role = formData.get('role');
  // ... extract all values

  const errors = [];
  // ... validation checks ...

  if (errors.length > 0) {
    return {
      errors,
      enteredValues: {
        email,
        password,
        firstName,
        lastName,
        role,
        // ... all other values
      }
    };
  }

  // Valid submission — don't return entered values (form should reset)
  return { errors: null };
}
```

When the form is valid, you intentionally **don't** return `enteredValues`. This allows the form to reset to empty fields as intended.

---

## Repopulating Inputs with `defaultValue`

Use the `defaultValue` prop (not `value`) on each input. The `defaultValue` prop sets the initial/reset value of an uncontrolled input. Since React resets the form, `defaultValue` determines what the input resets *to*.

```jsx
<input
  type="email"
  name="email"
  defaultValue={formState.enteredValues?.email}
/>
```

### Why `defaultValue` and Not `value`?

- **`value`** makes the input **controlled** — you'd need `onChange` handlers and state to manage it
- **`defaultValue`** sets the initial value of an **uncontrolled** input — perfect for the form actions pattern where React manages resets

### Safe Access with Optional Chaining (`?.`)

`formState.enteredValues` might be `undefined` (initial state doesn't include it, and valid submissions don't either). Use optional chaining to safely access nested properties:

```jsx
defaultValue={formState.enteredValues?.email}
```

If `enteredValues` is `undefined`, this evaluates to `undefined`, and the input defaults to empty.

---

## Handling Different Input Types

### Text Inputs

```jsx
<input type="text" name="first-name" defaultValue={formState.enteredValues?.firstName} />
```

### Select Elements

```jsx
<select name="role" defaultValue={formState.enteredValues?.role}>
  <option value="">Select a role</option>
  <option value="student">Student</option>
  <option value="teacher">Teacher</option>
</select>
```

### Checkboxes

For checkboxes, use `defaultChecked` instead of `defaultValue`:

```jsx
<input
  type="checkbox"
  name="terms"
  defaultChecked={formState.enteredValues?.terms}
/>
```

For checkbox groups, check if the stored array includes the specific value:

```jsx
<input
  type="checkbox"
  name="acquisition"
  value="google"
  defaultChecked={formState.enteredValues?.acquisitionChannel?.includes('google')}
/>
```

---

## What About the Reset Button?

There's an interesting side effect: the Reset button now resets fields to their **default values** — which are now the previously entered values, not empty strings. So pressing Reset after a failed submission doesn't actually clear the form.

If you need a true "clear all fields" button, you'd need custom JavaScript logic to manually clear each input.

---

## The Complete Flow

1. User fills out the form and submits
2. Action function extracts and validates all values
3. **If invalid**: Returns `{ errors: [...], enteredValues: { ... } }` → form resets but inputs repopulate from `enteredValues`
4. **If valid**: Returns `{ errors: null }` → form resets to empty fields (no `enteredValues` returned)
5. `formState` updates and UI re-renders, showing errors (or not) and preserving input values

---

## ✅ Key Takeaways

- React resets forms after every action — you must return entered values in your state to preserve them
- Use `defaultValue` on text inputs and selects, `defaultChecked` on checkboxes
- Use optional chaining (`?.`) when accessing nested state properties that might not exist
- Don't return `enteredValues` on valid submissions — let the form reset naturally
- The Reset button resets to `defaultValue`, not to empty — plan accordingly
- This pattern is specific to form actions; the classic `onSubmit` approach doesn't auto-reset

💡 **Pro Tip:** Think of the returned state from your action as a "snapshot" of the form at submission time. On invalid submissions, you restore from the snapshot. On valid submissions, you discard it.
