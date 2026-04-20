# Migrating To Form Actions

## Introduction

We've been handling form submission manually with `onSubmit` and `event.preventDefault()`. React offers an alternative: **form actions**. By passing a function to the `action` prop on a `<form>`, React handles the FormData extraction for you. This lesson shows how to migrate from the manual approach to form actions — and it's simpler than you might expect.

---

## The Manual Approach (Before)

```jsx
function handleSubmit(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  const customerData = Object.fromEntries(fd.entries());
  // ...send request
}

<form onSubmit={handleSubmit}>
```

This requires:
1. `event.preventDefault()` to stop the browser's default behavior
2. Manually constructing `FormData` from `event.target`

---

## The Form Actions Approach (After)

```jsx
async function checkoutAction(formData) {
  const customerData = Object.fromEntries(formData.entries());
  
  await sendRequest(
    JSON.stringify({
      order: {
        items: cartCtx.items,
        customer: customerData,
      },
    })
  );
}

<form action={checkoutAction}>
```

### What Changed?

1. **`action` instead of `onSubmit`** — React intercepts the form submission and calls your function
2. **No `event.preventDefault()`** — React handles this automatically
3. **FormData passed directly** — you receive the `FormData` object as a parameter instead of extracting it from `event.target`
4. **Async support** — the action function can be `async`, and React tracks when it's pending

The migration is incredibly straightforward — remove the event handling boilerplate and let React do the work.

---

## Why Use Form Actions?

- **Less boilerplate** — no `preventDefault`, no manual FormData construction
- **Built-in pending state tracking** — React knows when your async action is running (useful with `useActionState`)
- **Consistent pattern** — aligns with React's declarative philosophy
- **Progressive enhancement potential** — form actions can work without JavaScript in server-side React frameworks

---

## ✅ Key Takeaways

- Form actions replace `onSubmit` with the `action` prop on `<form>`
- React passes `FormData` directly to your action function — no need to construct it manually
- `event.preventDefault()` is automatic with form actions — you don't need to call it
- Async form actions are fully supported — React tracks the pending state
- The migration from `onSubmit` to `action` is minimal — mostly removing boilerplate

## ⚠️ Common Mistakes

- Using both `onSubmit` and `action` on the same form — pick one approach
- Forgetting that the manual approach still works fine — form actions are an option, not a requirement

## 💡 Pro Tips

- Form actions are a great match for server-side React frameworks (Next.js, Remix) where they enable server actions
- The `action` prop on forms is a React feature (not standard HTML behavior for functions) — it was introduced to simplify form handling
