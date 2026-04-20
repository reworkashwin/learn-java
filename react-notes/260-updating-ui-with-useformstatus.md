# Updating the UI with useFormStatus()

## Introduction

When a user submits a form connected to an async action, there's a gap — the request is in flight, but the UI shows nothing. The button still says "Submit," it's still clickable, and users might click it again. That's not a great experience.

React provides a dedicated hook for this: **`useFormStatus`**. It tells you whether the surrounding form is currently being submitted, and you can use that to update buttons, show spinners, or disable inputs.

---

## The Catch: useFormStatus Can't Live in the Form Component

Here's something that trips people up: `useFormStatus` **cannot** be used in the same component that contains the `<form>`. It must be used in a **child component** that's rendered inside the form.

Why? Because `useFormStatus` works by looking at the nearest parent `<form>` element. If you call it in the same component as the form, there's no parent form yet — the component *is* the form.

---

## Creating a Reusable Submit Component

The solution is elegant: extract the submit button into its own component.

```jsx
// Submit.jsx
import { useFormStatus } from 'react-dom';

export default function Submit() {
  const { pending } = useFormStatus();

  return (
    <p className="actions">
      <button type="submit" disabled={pending}>
        {pending ? 'Submitting...' : 'Submit'}
      </button>
    </p>
  );
}
```

Notice two things:
1. **Import from `react-dom`**, not `react`. This is one of the few hooks that lives in the `react-dom` package.
2. The `pending` property is `true` while the form is being submitted and `false` otherwise.

---

## Using the Submit Component

Now in your form component, replace the button section with the `Submit` component:

```jsx
import Submit from './Submit';

function NewOpinion() {
  // ... action setup, useActionState, etc.

  return (
    <form action={formAction}>
      {/* ... inputs ... */}
      {formState.errors && (
        <ul className="errors">
          {formState.errors.map(error => <li key={error}>{error}</li>)}
        </ul>
      )}
      <Submit />
    </form>
  );
}
```

That's it. The `Submit` component automatically knows about the submission status of whatever form it's placed inside.

---

## What useFormStatus Returns

The `useFormStatus` hook returns an object with several properties:

| Property | Type | Description |
|----------|------|-------------|
| `pending` | boolean | `true` if the form is being submitted |
| `data` | FormData or null | The form data being submitted |
| `method` | string | The HTTP method of the form |
| `action` | function | The action function being used |

For most cases, you'll only need `pending`.

---

## The Alternative: pending from useActionState

Remember that `useActionState` also returns a `pending` value as the third element:

```jsx
const [formState, formAction, pending] = useActionState(action, initialState);
```

This is an alternative approach that doesn't require a separate component. Both work — choose based on your needs:

- **`useFormStatus`**: Best for reusable submit button components that work with any form
- **`useActionState` pending**: Best when you need pending state in the same component as the form (e.g., to disable inputs too)

---

## The Reusability Win

The beauty of the `Submit` component is that it's **completely reusable**. Drop it into any form that uses form actions, and it automatically adapts:

```jsx
<form action={loginAction}>
  {/* login fields */}
  <Submit />  {/* Works here too! */}
</form>

<form action={signupAction}>
  {/* signup fields */}
  <Submit />  {/* And here! */}
</form>
```

No props needed. No configuration. It just works because `useFormStatus` reads the status from the nearest parent form.

---

## ✅ Key Takeaways

- `useFormStatus` is imported from **`react-dom`**, not `react`
- It must be used in a **child component** rendered inside the form, NOT in the form's own component
- `pending` is `true` while the async form action is executing
- This only works because async actions use `await` — without it, pending would be instantaneous

## ⚠️ Common Mistakes

- Calling `useFormStatus` in the same component as the `<form>` — it won't work, `pending` will always be `false`
- Importing from `react` instead of `react-dom`
- Forgetting that `useFormStatus` requires the form to use form actions (the `action` prop) — it doesn't work with `onSubmit`

## 💡 Pro Tip

Build a generic `SubmitButton` component early in your project. Accept props for the button text and loading text, and you'll never have to think about submission states again:

```jsx
function SubmitButton({ text = 'Submit', loadingText = 'Submitting...' }) {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? loadingText : text}</button>;
}
```
