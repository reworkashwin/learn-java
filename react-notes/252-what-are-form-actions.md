# What Are Form Actions?

## Introduction

You know the classic pattern: put `onSubmit` on a form, call `event.preventDefault()`, extract data. It works, it's been the standard for years. But React 19 introduced a feature that simplifies this flow by letting you pass a function directly to the **`action` prop** on a `<form>` element. React then handles the submission lifecycle for you — including preventing the browser default and providing you with FormData automatically.

---

## The Classic Way (Still Valid)

```jsx
function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  console.log(email);
}

<form onSubmit={handleSubmit}>
  <input type="email" name="email" />
  <button type="submit">Sign Up</button>
</form>
```

You get an event, prevent the default, manually create FormData, and extract values.

---

## The Form Actions Way

```jsx
function signUpAction(formData) {
  const email = formData.get('email');
  console.log(email);
}

<form action={signUpAction}>
  <input type="email" name="email" />
  <button type="submit">Sign Up</button>
</form>
```

Wait — that's it? Yes. Here's what React does for you:

1. **Prevents the default browser behavior** — no `event.preventDefault()` needed
2. **Creates a FormData object** from the form and passes it directly to your function
3. **Resets the form** after the action completes

### The `action` Prop Isn't New... But It's Different Now

The `action` attribute on `<form>` has existed in HTML forever — it normally specifies a URL to send the form data to. But in React 19+, when you pass a **function** to the `action` prop, React intercepts it. Instead of sending data to a URL, React calls your function with a FormData object.

---

## Key Differences from `onSubmit`

| Feature | `onSubmit` approach | `action` approach |
|---|---|---|
| Receives | Event object | FormData object |
| `preventDefault()` | You must call it | React does it for you |
| Form is reset after submit | No (you manage it) | Yes (automatically) |
| Available in | All React versions | React 19+ only |

---

## The `name` Prop Is Essential

For FormData to work, every input **must** have a `name` prop. The name becomes the key you use to extract values:

```jsx
<input type="email" name="email" />    // formData.get('email')
<input type="password" name="password" /> // formData.get('password')
```

Without `name`, the input's value won't be included in the FormData object.

---

## Naming Convention for Action Functions

Since you're no longer "handling a submit event," consider naming your function as an **action** rather than a handler:

```jsx
// Instead of:
function handleSubmit(formData) { ... }

// Use:
function signUpAction(formData) { ... }
```

This makes it clear that the function serves as a form action, not an event handler. It's just a naming convention — not a requirement.

---

## Automatic Form Reset

One important behavior: React **automatically resets the form** after the action function completes. All inputs return to their default values. This is great when you want a clean slate after submission, but it can be problematic if the form has validation errors — you don't want to throw away the user's input just because one field was wrong. We'll address that in upcoming notes.

---

## ✅ Key Takeaways

- In React 19+, pass a function to the `action` prop on `<form>` instead of using `onSubmit`
- Your function receives a **FormData** object (not an event), created automatically by React
- React calls `preventDefault()` for you and resets the form after the action completes
- Every input must have a `name` prop for its value to be included in FormData
- Name your functions as "actions" (e.g., `signUpAction`) rather than "handlers"
- The classic `onSubmit` approach still works and is still widely used — both are valid

⚠️ **Common Mistake:** Forgetting that form actions require React 19+. If you're on an older version and try to pass a function to `action`, it won't work as expected.
