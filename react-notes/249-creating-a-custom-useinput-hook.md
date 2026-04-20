# Creating a Custom useInput Hook

## Introduction

We've outsourced the UI into a reusable Input component and the validation logic into utility functions. But there's still a big chunk of repetitive code left: the **state management** for each input — tracking the entered value, tracking whether the user has interacted with it, handling onChange, handling onBlur. All of this follows the same pattern for every single input field. That's where a **custom hook** comes in.

---

## The Problem: Repetitive State Logic

For each input in a form, you're doing the same dance:

1. Managing an `enteredValue` state
2. Managing a `didEdit` state
3. Writing a `handleInputChange` function
4. Writing a `handleInputBlur` function
5. Computing whether the input has an error

With two inputs, it's manageable. With ten? It's a nightmare of boilerplate.

---

## Building the `useInput` Hook

The idea: wrap all the per-input state management into a custom hook that you call **once per input field**.

```js
// hooks/useInput.js
import { useState } from 'react';

export function useInput(defaultValue, validationFn) {
  const [enteredValue, setEnteredValue] = useState(defaultValue);
  const [didEdit, setDidEdit] = useState(false);

  const valueIsValid = validationFn(enteredValue);
  const hasError = didEdit && !valueIsValid;

  function handleInputChange(event) {
    setEnteredValue(event.target.value);
    setDidEdit(false); // Reset while typing
  }

  function handleInputBlur() {
    setDidEdit(true);
  }

  return {
    value: enteredValue,
    handleInputChange,
    handleInputBlur,
    hasError
  };
}
```

### Key Design Decisions

**One hook per input** — Unlike the previous approach that managed multiple inputs in one state object, this hook is focused. It manages one value, one edit flag, one set of handlers. This makes it composable.

**Validation function as a parameter** — Instead of hardcoding what "valid" means, you pass a validation function. This makes the hook work for emails, passwords, names — anything.

**Computed `hasError`** — Combines `didEdit` and `valueIsValid` into a single boolean that the component can use directly. The hook does the thinking; the component just reads the result.

**`didEdit` resets on keystroke** — The same pattern from our blur + keystroke validation: errors disappear while the user is typing and reappear on the next blur.

---

## Using the Hook

Now your form component becomes dramatically simpler:

```jsx
import { useInput } from '../hooks/useInput';
import { isEmail, hasMinLength } from '../util/validation';

function StateLogin() {
  const {
    value: emailValue,
    handleInputChange: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    hasError: emailHasError
  } = useInput('', (value) => isEmail(value) && isNotEmpty(value));

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    hasError: passwordHasError
  } = useInput('', (value) => hasMinLength(value, 6));

  function handleSubmit(event) {
    event.preventDefault();

    if (emailHasError || passwordHasError) {
      return;
    }

    console.log(emailValue, passwordValue);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        id="email"
        type="email"
        name="email"
        onBlur={handleEmailBlur}
        onChange={handleEmailChange}
        value={emailValue}
        error={emailHasError ? 'Please enter a valid email.' : undefined}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        name="password"
        onBlur={handlePasswordBlur}
        onChange={handlePasswordChange}
        value={passwordValue}
        error={passwordHasError ? 'Please enter a valid password.' : undefined}
      />
      <button>Log In</button>
    </form>
  );
}
```

### What Disappeared

- No `useState` calls in the component
- No `handleInputChange` function
- No `handleInputBlur` function
- No `didEdit` tracking
- No computed validation booleans

All of that now lives inside `useInput`. The component just **uses** it.

---

## Passing Multiple Validation Functions

If you need to run multiple checks (e.g., email must be non-empty AND be a valid email), there are two approaches:

**Approach 1: Wrapper function**

```jsx
useInput('', (value) => isEmail(value) && isNotEmpty(value));
```

**Approach 2: Accept an array of validators** (more advanced)

```js
export function useInput(defaultValue, validators) {
  const valueIsValid = validators.every(fn => fn(enteredValue));
  // ...
}
```

The wrapper function approach is simpler and usually sufficient.

---

## The Three Layers of Reusability

With this hook, you've now abstracted away three layers:

| Layer | Abstraction | What It Handles |
|---|---|---|
| **UI** | `Input` component | Label, input element, error display |
| **Logic** | `validation.js` utilities | Validation rules (isEmail, hasMinLength) |
| **State** | `useInput` hook | Value tracking, edit tracking, change/blur handlers |

Each layer is independently reusable and testable. This is clean architecture in a React application.

---

## ✅ Key Takeaways

- Custom hooks eliminate repetitive state management logic from components
- `useInput` manages value state, edit tracking, change/blur handling, and error computation for a single input
- Pass a validation function as a parameter to keep the hook generic
- Use destructuring with aliases to get uniquely-named values for each input
- The hook must start with `use` so React enforces the rules of hooks
- This completes the three-layer reusability pattern: UI component + validation utilities + state hook

⚠️ **Common Mistake:** Trying to manage all inputs in a single hook call. The power of `useInput` is that it's called **once per input**, keeping concerns separated and composable.
