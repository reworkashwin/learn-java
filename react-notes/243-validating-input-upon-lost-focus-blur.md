# Validating Input Upon Lost Focus (Blur)

## Introduction

We saw that validating on every keystroke shows errors too early — the user barely starts typing and they're already scolded for an invalid value. A friendlier approach is to wait until the user **leaves** the input field. If they clicked into the email field, typed something, and then clicked away (or tabbed to the next field), *that's* when you check. This is called **blur-based validation**, and it strikes a much better balance between responsiveness and patience.

---

## What Is the Blur Event?

The **blur** event fires when an element **loses focus**. If a user clicks on an input, types into it, and then clicks somewhere else (or tabs away), the `blur` event fires on that input. It's a built-in browser event, and React exposes it via the `onBlur` prop.

Think of it this way: "blur" means "you were looking at me, but now you're not." It's the opposite of "focus."

---

## Tracking Whether the User Has Interacted

The key insight is this: you need a separate piece of state to track whether the user has **touched** each input. Only when they've interacted with it (and then left) should you show validation errors.

```jsx
const [didEdit, setDidEdit] = useState({
  email: false,
  password: false
});
```

When the blur event fires, you flip that flag to `true`:

```jsx
function handleInputBlur(identifier) {
  setDidEdit(prev => ({
    ...prev,
    [identifier]: true
  }));
}
```

And on your input:

```jsx
<input
  type="email"
  onBlur={() => handleInputBlur('email')}
  onChange={handleInputChange}
  value={enteredValues.email}
/>
```

---

## Combining Blur State with Validation

Now your validation logic checks **two conditions**: did the user edit the field AND is the value invalid?

```jsx
const emailIsInvalid =
  didEdit.email && !enteredValues.email.includes('@');
```

This means:

- **Before interaction**: `didEdit.email` is `false` → no error shown
- **After clicking away with invalid value**: `didEdit.email` is `true` and email is invalid → error shown
- **After clicking away with valid value**: no error shown

This is already a much better experience!

---

## The Remaining Problem: Errors Shown Too Long

There's still a UX issue. Once the error appears, it stays visible *while the user is typing a correction*. They see the error, click back in, start typing — and the error message persists until the value becomes valid. Some users find this annoying.

Wouldn't it be nicer if the error **disappeared while they're typing** and only came back if they leave the field with an invalid value again?

---

## The Best of Both Worlds: Reset on Keystroke

The fix is elegant: **reset `didEdit` to `false` on every keystroke**.

```jsx
function handleInputChange(identifier, value) {
  setEnteredValues(prev => ({
    ...prev,
    [identifier]: value
  }));

  // Reset the "edited" flag while the user is typing
  setDidEdit(prev => ({
    ...prev,
    [identifier]: false
  }));
}
```

Now the flow is:

1. User types into email → `didEdit.email` is `false` → no error
2. User clicks away with invalid email → `didEdit.email` becomes `true` → error appears
3. User clicks back and starts typing → `didEdit.email` resets to `false` → error disappears
4. User clicks away again → `didEdit.email` becomes `true` → error re-evaluates

This combination of **keystroke + blur validation** is considered a best-practice pattern for form validation UX.

---

## The Complete Pattern

```jsx
const [enteredValues, setEnteredValues] = useState({ email: '', password: '' });
const [didEdit, setDidEdit] = useState({ email: false, password: false });

function handleInputChange(identifier, value) {
  setEnteredValues(prev => ({ ...prev, [identifier]: value }));
  setDidEdit(prev => ({ ...prev, [identifier]: false }));
}

function handleInputBlur(identifier) {
  setDidEdit(prev => ({ ...prev, [identifier]: true }));
}

const emailIsInvalid = didEdit.email && !enteredValues.email.includes('@');
```

---

## ✅ Key Takeaways

- The `onBlur` event fires when an input **loses focus** — perfect for "the user is done editing" signals
- Track a `didEdit` state separately from the input value to know if the user has interacted
- Combine `didEdit` with value checks: only show errors after the user has touched the field
- Reset `didEdit` on every keystroke so the error disappears while the user is correcting their input
- This **keystroke + blur** pattern is the gold standard for inline form validation UX

💡 **Pro Tip:** Even with great keystroke + blur validation, always add submission-based validation too. A user might just click "Submit" without ever interacting with individual fields.
