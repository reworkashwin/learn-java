# Module Introduction: Handling Forms via Form Actions

## Introduction

In the previous section, you mastered form handling the "classic" way — using `onSubmit`, `event.preventDefault()`, state, refs, and FormData. You know how to extract values, validate them, and provide great UX. Now it's time to learn a **different approach** that's built directly into React itself.

Starting with **React 19**, a new feature called **Form Actions** provides an alternative way to handle form submissions. Instead of listening to the submit event and manually preventing the default browser behavior, you can pass a function directly to the `action` prop on a `<form>` element, and React handles the rest.

---

## What You'll Learn in This Section

- **Form Actions** — what they are and how they replace `onSubmit`
- **`useActionState` hook** — how to manage form-related state with actions
- **Synchronous and asynchronous actions** — handling both instant and server-based operations
- **Optimistic updates** — showing expected results before the server confirms them
- How to **extract values, validate inputs, and manage form state** using this new approach

---

## Important: Version Requirement

Form Actions are a **React 19+** feature. If your project uses React 18 or earlier, this feature is not available. Check your `package.json`:

```json
{
  "dependencies": {
    "react": "^19.0.0"
  }
}
```

---

## Both Approaches Are Valid

This is not a replacement for what you learned before. The `onSubmit` approach works in every React version and you'll encounter it in the vast majority of existing codebases. Form Actions are a newer alternative that can simplify certain patterns, especially those involving async operations and server interactions.

As a React developer, you should know **both** approaches because you'll encounter both in the wild.

---

## ✅ Key Takeaways

- Form Actions are a React 19+ feature for handling form submissions
- They're an **alternative** to `onSubmit` + `event.preventDefault()`, not a replacement
- You'll learn to use the `action` prop on forms and the `useActionState` hook
- Both approaches (classic and form actions) are valid — know both
