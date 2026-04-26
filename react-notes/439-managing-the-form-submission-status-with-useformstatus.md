# Managing the Form Submission Status with useFormStatus

## Introduction

We can now save meals, but there's a UX problem: after clicking "Share Meal," the user stares at an unresponsive button for several seconds with no feedback. Is it working? Did it fail? Did the click even register? In this section, we'll use React's `useFormStatus` hook to show a loading state during form submission — and we'll learn why this requires a specific component architecture to work correctly.

---

## Concept 1: The UX Problem — No Submission Feedback

### 🧠 What is it?

When a user submits a form that triggers a Server Action, the request takes time (image upload, database write, etc.). During that time, the UI is completely static — the button looks the same, nothing indicates progress.

### ❓ Why do we need to fix this?

Users need feedback. Without it, they might:
- Click the button multiple times (causing duplicate submissions)
- Think the app is broken and leave
- Get frustrated with what feels like a non-responsive interface

Even a simple text change from "Share Meal" to "Submitting..." makes a world of difference.

---

## Concept 2: The `useFormStatus` Hook

### 🧠 What is it?

`useFormStatus` is a hook from `react-dom` (not `react` or `next`) that gives you information about the submission status of the **nearest parent `<form>`**. It returns an object with a `pending` property that's `true` while a form submission is in progress.

### ❓ Why do we need it?

It's the React-native way to track form submission state without manually managing loading states with `useState`. It integrates directly with Server Actions and the form's built-in submission lifecycle.

### ⚙️ How it works

```js
import { useFormStatus } from "react-dom";

const { pending } = useFormStatus();
```

- `pending` is `true` while the form is being submitted
- `pending` becomes `false` once the submission completes (or fails)

### 💡 Insight

This hook only works with forms that use Server Actions (the `action` prop). It won't track traditional `onSubmit` handlers.

---

## Concept 3: The Critical Rule — It Must Be Inside the Form

### 🧠 What is it?

Here's the catch that trips many people up: `useFormStatus` reports the status of the **nearest parent `<form>`**. That means it **must be used inside a component that is rendered within that form**. It won't work if you call it in the same component that renders the form itself.

### ❓ Why?

The hook needs to look "up" the component tree to find its parent form. If you call it at the same level as the form, there's no parent form to find.

### ⚙️ How it works

```jsx
// ❌ Won't work — useFormStatus is at the same level as the form
function ShareMealPage() {
  const { pending } = useFormStatus(); // No parent form!
  return <form action={shareMeal}>...</form>;
}

// ✅ Works — useFormStatus is inside a child component rendered within the form
function SubmitButton() {
  const { pending } = useFormStatus(); // Finds parent <form>
  return <button disabled={pending}>{pending ? "Submitting..." : "Share Meal"}</button>;
}

function ShareMealPage() {
  return (
    <form action={shareMeal}>
      {/* ... fields ... */}
      <SubmitButton />
    </form>
  );
}
```

### 💡 Insight

This is a common pattern in React: when a hook needs to interact with a parent element, you extract the hook usage into a child component. It's the same reason you can't use `useContext` to read a context from the same component that provides it.

---

## Concept 4: Building the MealsFormSubmit Component

### 🧠 What is it?

Since `useFormStatus` needs to be in a child component within the form, and since it requires `"use client"` (it's a hook that updates client-side UI), we create a dedicated submit button component.

### ⚙️ How it works

```jsx
// components/meals/meals-form-submit.js
"use client";

import { useFormStatus } from "react-dom";

export default function MealsFormSubmit() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending}>
      {pending ? "Submitting..." : "Share Meal"}
    </button>
  );
}
```

Then use it in your form:

```jsx
import MealsFormSubmit from "@/components/meals/meals-form-submit";

export default function ShareMealPage() {
  return (
    <form action={shareMeal}>
      {/* ... form fields ... */}
      <MealsFormSubmit />
    </form>
  );
}
```

### ❓ Why a separate component instead of adding `"use client"` to the page?

Two reasons:

1. **Minimize client-side code** — Only the button becomes a Client Component, not the entire page. The page and the rest of the form stay as Server Components
2. **The hook requirement** — `useFormStatus` must be *inside* the form via a child component anyway, so we need a separate component regardless

### 🧪 Example — The User Experience

1. User fills out the form and clicks "Share Meal"
2. Button text changes to "Submitting..." and the button becomes **disabled** (preventing double-clicks)
3. After the Server Action completes, the user is redirected to `/meals`

### 💡 Insight

Setting `disabled={pending}` is a small but important detail. It prevents users from clicking the button multiple times during submission, which would fire the Server Action multiple times.

---

## ✅ Key Takeaways

- `useFormStatus` comes from `react-dom` — not `react` or `next`
- It returns `{ pending }` which is `true` during form submission
- It **must** be used inside a component that's a **child** of the `<form>` — not at the same level
- It requires `"use client"` since it updates client-side UI
- Extract the submit button into its own Client Component to keep the rest of the page as a Server Component
- Always disable the submit button during submission to prevent duplicate requests

## ⚠️ Common Mistakes

- Calling `useFormStatus` in the same component that renders the `<form>` — it won't find a parent form and `pending` will always be `false`
- Adding `"use client"` to the entire page just to use this hook — extract a small child component instead
- Importing from `react` instead of `react-dom`
- Forgetting to disable the button, allowing users to submit multiple times

## 💡 Pro Tips

- The `useFormStatus` object also includes `data`, `method`, and `action` properties — useful for more advanced submission tracking
- This pattern of extracting a small Client Component inside a Server Component is a core Next.js architecture pattern — get comfortable with it
- You can use the same approach for showing spinners, progress bars, or any other loading indicator — not just button text changes
