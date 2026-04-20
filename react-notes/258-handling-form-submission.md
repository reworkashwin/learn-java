# Handling Form Submission with Form Actions

## Introduction

Time to get hands-on. We have a form for submitting opinions and we need to handle its submission using everything we've learned about form actions — extracting data from `formData`, validating user input, showing errors, and clearing the form on success.

This lecture puts together all the pieces: `useActionState`, validation logic, error display, and form repopulation.

---

## Setting Up the Form Action

In the `NewOpinion` component (the component that contains our opinion form), we create a form action function. Later, this function will be async and send HTTP requests, so we define it **inside** the component right from the start:

```jsx
function NewOpinion() {
  function shareOpinionAction(prevState, formData) {
    const title = formData.get('title');
    const body = formData.get('body');
    const userName = formData.get('userName');
    
    // ... validation coming next
  }
}
```

Why inside the component? Because soon we'll need access to context functions (like `addOpinion`), which are only available through hooks — and hooks only work inside components.

---

## Adding Validation

Validation follows the same pattern we used before — build an errors array and push messages when inputs fail checks:

```jsx
const errors = [];

if (title.trim().length < 5) {
  errors.push('Title must be at least 5 characters long.');
}

if (body.trim().length < 10 || body.trim().length > 300) {
  errors.push('Opinion must be between 10 and 300 characters long.');
}

if (!userName.trim()) {
  errors.push('Please provide your name.');
}
```

Notice the pattern: **trim first, then check**. This prevents users from submitting strings that are just whitespace.

---

## Returning Form State

If there are errors, we return an object with both the errors and the entered values (so the form can be repopulated):

```jsx
if (errors.length > 0) {
  return {
    errors,
    enteredValues: { title, body, userName }
  };
}

// If no errors — success!
return { errors: null };
```

Why return the entered values? Because `useActionState` will reset the form. Without preserving these values, users would lose everything they typed when an error occurs. That's a terrible experience.

---

## Wiring Up useActionState

Now connect the action to the form using `useActionState`:

```jsx
import { useActionState } from 'react';

function NewOpinion() {
  function shareOpinionAction(prevState, formData) {
    // ... extraction and validation logic
  }

  const [formState, formAction] = useActionState(shareOpinionAction, {
    errors: null
  });

  return <form action={formAction}>...</form>;
}
```

Remember the key change: once you use `useActionState`, the action function signature changes from `(formData)` to `(prevState, formData)`. The previous state becomes the first parameter.

---

## Displaying Errors in the UI

Use the `formState` to conditionally render error messages:

```jsx
{formState.errors && (
  <ul className="errors">
    {formState.errors.map((error) => (
      <li key={error}>{error}</li>
    ))}
  </ul>
)}
```

---

## Preserving Entered Values

Set `defaultValue` on each input to repopulate them when validation fails:

```jsx
<input
  name="userName"
  defaultValue={formState.enteredValues?.userName}
/>

<input
  name="title"
  defaultValue={formState.enteredValues?.title}
/>

<textarea
  name="body"
  defaultValue={formState.enteredValues?.body}
/>
```

The optional chaining (`?.`) is important — on the first render, `enteredValues` doesn't exist yet (it's just `{ errors: null }`).

---

## The Complete Flow

1. User fills in the form and clicks Submit
2. React calls `shareOpinionAction` with the previous state and form data
3. The function validates all inputs
4. **If invalid**: returns errors + entered values → form shows errors, inputs keep their values
5. **If valid**: returns `{ errors: null }` → form is cleared, no errors shown

---

## ✅ Key Takeaways

- Extract form values using `formData.get('fieldName')` where the field name matches the `name` attribute on the input
- Always **trim** values before validation to catch whitespace-only inputs
- Return **both errors and entered values** from the action to preserve user input on failure
- Use `defaultValue` (not `value`) with `formState` to repopulate inputs
- The `useActionState` hook changes the function signature: `(prevState, formData)`

## ⚠️ Common Mistakes

- Forgetting to add `prevState` as the first parameter when using `useActionState` — this shifts `formData` to the wrong position
- Using `value` instead of `defaultValue` — this creates a controlled input that needs `onChange`, defeating the purpose of form actions
- Not using optional chaining on `formState.enteredValues?.fieldName` — this crashes on the initial render

## 💡 Pro Tip

The error array pattern (`const errors = []; ... errors.push(...)`) is clean and scalable. You can easily add or remove validation rules without restructuring your code. It also works well if you later want to map errors to specific fields.
