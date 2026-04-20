# Validating User Input & Outputting Validation Errors

## Introduction

The authentication action is working, but when something goes wrong — duplicate email, invalid password — the user sees nothing. No feedback, no error messages. Let's fix that by displaying validation errors and adding a submission indicator.

---

## Displaying Action Errors with `useActionData`

When the action returns a response (instead of redirecting), that response data becomes available in the component via `useActionData`:

```jsx
import { useActionData } from 'react-router-dom';

function AuthForm() {
  const data = useActionData();

  return (
    <>
      <h1>{isLogin ? 'Log in' : 'Create a new user'}</h1>

      {/* Show validation errors */}
      {data && data.errors && (
        <ul>
          {Object.values(data.errors).map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {/* Show general error message */}
      {data && data.message && <p>{data.message}</p>}

      {/* ... rest of the form ... */}
    </>
  );
}
```

### Why the Conditional Checks?

- `data` is `undefined` until the form has been submitted at least once
- `data.errors` is an **object** — use `Object.values()` to extract the error messages into an array for mapping
- `data.message` is a simple string for general error messages (like "email already exists")

---

## Adding a Submission Indicator with `useNavigation`

Users should know when the form is being submitted. The `useNavigation` hook tells you the current navigation/submission state:

```jsx
import { useNavigation } from 'react-router-dom';

function AuthForm() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <>
      {/* ... form fields ... */}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Save'}
      </button>
    </>
  );
}
```

### What `navigation.state` Can Be

| State | Meaning |
|-------|---------|
| `'idle'` | Nothing happening |
| `'submitting'` | A form is being submitted (action is running) |
| `'loading'` | A navigation/redirect is in progress |

---

## The Complete Pattern

Every form that uses React Router actions should follow this pattern:

1. **`useActionData`** — to display errors returned by the action
2. **`useNavigation`** — to show loading/submitting states
3. **Conditional rendering** — check if data exists before accessing properties

---

## ✅ Key Takeaways

- `useActionData` returns whatever the action **returned** (not threw) — use it for validation errors
- It's `undefined` until the form has been submitted
- `useNavigation().state === 'submitting'` tells you if a form is currently being processed
- Always disable the submit button during submission to prevent double-submits
- `Object.values()` is your friend for iterating over error objects

💡 **Pro Tip:** This error display + submission indicator pattern is something you'll use on virtually every form in a React Router app. Consider abstracting it into a reusable form wrapper component.
