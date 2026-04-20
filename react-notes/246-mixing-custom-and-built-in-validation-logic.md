# Mixing Custom & Built-in Validation Logic

## Introduction

You just learned that built-in HTML validation attributes like `required` and `minLength` can save you a lot of code. But what happens when you need a validation rule that HTML can't express? For example, "the confirm password must match the password." There's no `matches` attribute for that. The good news? You don't have to choose between built-in and custom validation — you can **mix them** freely.

---

## The Scenario: Passwords Must Match

Imagine a signup form with two password fields. The browser can enforce that both are filled in (`required`) and have a minimum length (`minLength`). But it has no idea that the values in the two fields should be identical. That's a **cross-field validation rule**, and you need custom logic for it.

---

## Adding Custom Validation Alongside Built-in Attributes

Your inputs still have their built-in validation:

```jsx
<input type="password" name="password" required minLength={6} />
<input type="password" name="confirm-password" required minLength={6} />
```

The browser handles the basics. But in your submit handler (or form action), you add your own check:

```jsx
const [passwordsAreNotEqual, setPasswordsAreNotEqual] = useState(false);

function handleSubmit(data) {
  if (data.password !== data['confirm-password']) {
    setPasswordsAreNotEqual(true);
    return; // Don't proceed with invalid data
  }

  setPasswordsAreNotEqual(false);
  // Continue with form processing...
}
```

And in your JSX, below the confirm password input:

```jsx
{passwordsAreNotEqual && (
  <div className="control-error">
    <p>Passwords must match.</p>
  </div>
)}
```

---

## How the Two Systems Work Together

Here's the flow when the user clicks Submit:

1. **Browser validation fires first** — if any `required` fields are empty or `minLength` isn't met, the browser blocks submission entirely. Your JavaScript never runs.

2. **If browser validation passes**, your `handleSubmit` function executes. Now your custom checks run.

3. If your custom checks fail, you update state, show error messages, and `return` to stop further processing.

4. If everything passes, you proceed with the valid data.

This layered approach means:

- **Simple rules** (required, min length, email format) are handled for free by the browser
- **Complex rules** (password matching, conditional logic, cross-field checks) are handled by your code
- Neither system interferes with the other

---

## Accessing FormData with Dashes in Names

A small but important detail: if your input has a name like `confirm-password` (with a dash), you can't use dot notation on the FormData entries object. You need bracket notation:

```jsx
// ❌ Won't work — dash is invalid in dot notation
data.confirm-password

// ✅ Works — bracket notation handles any string
data['confirm-password']
```

---

## ✅ Key Takeaways

- Built-in HTML validation and custom JavaScript validation complement each other perfectly
- Use built-in attributes for simple rules: `required`, `minLength`, `type="email"`
- Use custom logic for complex rules: password matching, conditional fields, business rules
- Browser validation runs **first** and blocks submission before your code even executes
- Use bracket notation (`data['my-field']`) for FormData keys that contain special characters

💡 **Pro Tip:** Think of validation as layers. Browser validation is your outer wall — it catches the obvious stuff. Custom validation is your inner gate — it catches the nuanced stuff. Together, they create a robust defense.
