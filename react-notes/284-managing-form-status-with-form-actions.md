# Managing Form Status with Form Actions

## Introduction

Now that we've migrated to form actions, we can take advantage of React's **`useActionState`** hook to track whether the form is currently being submitted. This replaces the manual `isLoading` state we were extracting from the custom HTTP hook, letting React handle the pending state tracking automatically.

---

## The Problem

With form actions, our async `checkoutAction` takes time to complete (network request). During that time, the user sees no feedback — the same UX problem we solved earlier with `isLoading`, but now we need a form-action-compatible solution.

---

## Enter `useActionState`

This hook wraps your form action and provides:
1. **Updated form state** — the return value of your action (for showing results or validation errors)
2. **A wrapped action function** — to use on the form's `action` prop
3. **Pending state** — `true` while the action is running

```jsx
import { useActionState } from 'react';

const [formState, formAction, isSending] = useActionState(checkoutAction, null);
```

- **First argument**: your action function
- **Second argument**: initial form state (we use `null` since we don't need it yet)

### Important Signature Change

When using `useActionState`, your action function receives an additional **first parameter** — the previous form state:

```jsx
// Before useActionState:
async function checkoutAction(formData) { ... }

// After useActionState:
async function checkoutAction(prevState, formData) { ... }
```

The `formData` shifts to the second parameter. Forgetting this causes a subtle bug where `formData` is actually the previous state object.

---

## Using the Pending State

Replace the manual `isLoading` from the HTTP hook with `isSending` from `useActionState`:

```jsx
if (isSending) {
  actions = <span>Sending order data...</span>;
}
```

And use the wrapped `formAction` on the form:

```jsx
<form action={formAction}>
```

The beauty of this approach is that React **automatically** tracks when the async action starts and finishes. No manual `setIsLoading(true)` / `setIsLoading(false)` needed.

---

## Testing with Network Delay

To see the pending state in action, you can add a delay to the backend:

```js
// In the backend route handler:
await new Promise((resolve) => setTimeout(resolve, 1000));
```

This gives you a one-second window to observe the "Sending order data..." text before the success modal appears.

---

## Browser Validation Still Works

Form actions don't break native browser validation. The `required` attributes and `type="email"` validation still trigger before the action fires. You only need to add custom JavaScript validation if you want something beyond what the browser provides.

---

## Both Approaches Are Valid

The manual `onSubmit` approach and the form actions approach are both legitimate:

| Feature | `onSubmit` Manual | Form Actions |
|---------|------------------|--------------|
| **Boilerplate** | More (preventDefault, FormData) | Less |
| **Pending state** | Manual (useState) | Automatic (useActionState) |
| **React version** | Any | 19+ |
| **Server actions** | No | Yes (with frameworks) |
| **Browser validation** | Works | Works |

Choose based on your React version and team preferences.

---

## ✅ Key Takeaways

- `useActionState` wraps a form action and provides: form state, a wrapped action function, and a pending boolean
- The action function's signature changes when using `useActionState` — `prevState` becomes the first parameter, `formData` becomes the second
- Use the wrapped `formAction` (not the original) on the form's `action` prop
- The `isSending` (pending) state is managed entirely by React — no manual loading state needed
- Browser-native validation (`required`, `type="email"`) continues to work with form actions

## ⚠️ Common Mistakes

- Forgetting the `prevState` parameter shift — your action receives the wrong data and silently fails
- Using the original action function on the form instead of the wrapped one from `useActionState`
- Trying to use `useActionState` with React versions below 19 — it's a React 19+ feature

## 💡 Pro Tips

- `useActionState` is especially powerful in server-side rendering frameworks where the form state can persist across server roundtrips
- You can use the `formState` return value to implement server-side validation feedback — return error objects from your action
- For nested components that need the pending state, look into `useFormStatus` as an alternative
