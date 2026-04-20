# Validating Input Upon Form Submission

## Introduction

So far we've seen how to validate inputs as the user types and when they leave a field. But there's a third strategy that's simpler, more direct, and arguably the most common: just validate **when the form is submitted**. No tracking blur states, no keystroke-by-keystroke checking. You wait until the user says "I'm done" by clicking submit, and *then* you check everything.

---

## Why Validate on Submission?

Submission-based validation is **the simplest approach** to implement. You don't need to track whether inputs were touched, you don't need onChange handlers for validation — you just check the values once, inside your submit handler.

This strategy works particularly well when:

- You're using **refs** to get input values (since refs don't give you keystroke-level access)
- You want **minimal code** for validation
- The form is short and errors after submission aren't a big UX problem

---

## How It Works with Refs

Since refs only give you the value at read time (not on every change), they naturally pair with submission-based validation.

```jsx
function handleSubmit(event) {
  event.preventDefault();

  const enteredEmail = emailRef.current.value;
  const emailIsValid = enteredEmail.includes('@');

  if (!emailIsValid) {
    setEmailIsInvalid(true);
    return; // Stop execution — don't send bad data
  }

  setEmailIsInvalid(false);
  // Proceed with valid data...
  console.log('Sending data:', enteredEmail);
}
```

The `return` statement is crucial — it stops the function from continuing if validation fails. This prevents invalid data from being sent to a backend.

---

## Showing Error Messages

You need a small piece of state to trigger a UI update when validation fails:

```jsx
const [emailIsInvalid, setEmailIsInvalid] = useState(false);
```

Then in your JSX:

```jsx
{emailIsInvalid && (
  <div className="control-error">
    <p>Please enter a valid email address.</p>
  </div>
)}
```

When the user submits with a bad email, `emailIsInvalid` becomes `true`, the component re-renders, and the error message appears. When they submit again with a valid email, you set it back to `false`.

---

## Submission Validation + Keystroke/Blur Validation

Here's an important insight: even if you already have beautiful keystroke + blur validation, **you should still validate on submission**.

Why? Because a user can simply click the Submit button without ever interacting with any input field. Your blur-based validation would never fire. Your keystroke validation would never trigger. The form would submit with completely empty, invalid data.

That's why submission-based validation acts as your **safety net**.

```jsx
function handleSubmit(event) {
  event.preventDefault();

  // Always validate here, even if you validate elsewhere
  if (emailHasError || passwordHasError) {
    return;
  }

  // Safe to proceed
}
```

---

## Trade-offs

| Approach | When Errors Appear | Code Complexity | UX Quality |
|---|---|---|---|
| **Keystroke only** | Immediately (too early) | Medium | Fair |
| **Blur only** | After leaving field | Medium | Good |
| **Keystroke + Blur** | After leaving, hides while typing | Higher | Best |
| **Submission only** | After clicking submit | Lowest | Acceptable |
| **All combined** | Context-dependent | Highest | Best + Safe |

---

## ✅ Key Takeaways

- Submission-based validation is the simplest: check values in `handleSubmit`, update state for errors
- Use `return` to stop execution after finding invalid values — prevents bad data from being processed
- This approach pairs naturally with **ref-based** forms since refs don't support keystroke tracking
- **Always add submission validation as a safety net**, even if you already validate on keystroke/blur
- A user can skip all your inline validation by just clicking Submit

⚠️ **Common Mistake:** Relying solely on keystroke/blur validation and forgetting to validate on submit. Users who jump straight to the Submit button will bypass your inline checks.
