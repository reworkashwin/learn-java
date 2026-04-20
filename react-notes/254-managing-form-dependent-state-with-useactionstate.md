# Managing Form-dependent State with useActionState()

## Introduction

You've set up a form action that validates inputs and returns an errors object. But there's a problem: how do you *use* that returned value in your component's JSX? The action function runs when the form is submitted, it may return data, but there's no state connected to it. That's exactly what `useActionState` solves — it's a new React 19 hook that bridges form actions and component state.

---

## The Problem

Your action function returns `{ errors: [...] }` or `{ errors: null }`. But this return value goes nowhere. It's not stored in state. The UI can't react to it. You need a way to:

1. Capture the return value of the action
2. Store it as component state
3. Re-render the component when that state changes
4. Access the state in your JSX

---

## Enter `useActionState`

```jsx
import { useActionState } from 'react';

const [formState, formAction, pending] = useActionState(signUpAction, {
  errors: null
});
```

### What It Takes

1. **Your action function** — the function that processes the form data
2. **Initial state** — the state value before any form submission happens

### What It Returns (Array of 3)

1. **`formState`** — The current state. Initially the initial state you provided. After form submission, it's whatever your action function returned.
2. **`formAction`** — An enhanced version of your action function. React wraps your function to track its execution and manage state. **This** is what you pass to the `action` prop, not your original function.
3. **`pending`** — A boolean indicating whether the form is currently being submitted (useful for async actions).

---

## Wiring It Up

```jsx
// ❌ Don't use the original action
<form action={signUpAction}>

// ✅ Use the enhanced action from useActionState
<form action={formAction}>
```

This is crucial. The `formAction` returned by `useActionState` is your function enhanced by React. React uses it to capture the return value and update `formState`.

---

## The "Previous State" Parameter

Here's an important detail that catches people: when you use `useActionState`, your action function's **signature changes**.

**Without `useActionState`:**
```jsx
function signUpAction(formData) { ... }
```

**With `useActionState`:**
```jsx
function signUpAction(previousState, formData) { ... }
```

React now passes the **previous form state** as the first argument, and the FormData as the second. This lets you build new state based on the old state if needed. The previous state is the initial state object on the first submission.

⚠️ **Common Mistake:** Forgetting that `formData` moves to the **second** parameter when using `useActionState`. If you leave it as the first parameter, `formData.get` will throw an error because you're actually calling `.get()` on the previous state object.

---

## Displaying Errors

Now that `formState` contains your errors, render them:

```jsx
{formState.errors && (
  <ul className="error">
    {formState.errors.map(error => (
      <li key={error}>{error}</li>
    ))}
  </ul>
)}
```

Before any submission, `formState.errors` is `null` (from the initial state). After submission with errors, it's an array of strings. After a valid submission, it's `null` again.

---

## The Automatic Form Reset Problem

Remember: React resets the form after the action completes. So if the user fills out 8 fields correctly but gets 2 wrong, all 10 fields get cleared. The user has to re-enter everything. That's terrible UX.

This means you need to **preserve the entered values** in your returned state and use them to repopulate the form. We'll tackle that in the next note.

---

## The Full Picture

```jsx
import { useActionState } from 'react';
import { isEmail, isNotEmpty, hasMinLength } from '../util/validation';

function Signup() {
  function signUpAction(previousState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const errors = [];
    if (!isEmail(email)) errors.push('Invalid email address.');
    if (!hasMinLength(password, 6)) errors.push('Password must be at least 6 characters.');

    if (errors.length > 0) {
      return { errors };
    }
    return { errors: null };
  }

  const [formState, formAction] = useActionState(signUpAction, { errors: null });

  return (
    <form action={formAction}>
      <input type="email" name="email" />
      <input type="password" name="password" />

      {formState.errors && (
        <ul className="error">
          {formState.errors.map(err => <li key={err}>{err}</li>)}
        </ul>
      )}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

---

## ✅ Key Takeaways

- `useActionState` connects form actions to component state — it's the bridge between action return values and the UI
- It takes your action function and an initial state, and returns `[formState, formAction, pending]`
- **Always use the returned `formAction`** (not your original function) on the `<form action>` prop
- Your action function signature changes: `(previousState, formData)` — formData moves to the second parameter
- The initial state defines what `formState` looks like before any submission
- React automatically resets the form after each action — you'll need to handle value preservation
