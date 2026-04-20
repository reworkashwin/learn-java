# Validating Input on Every Keystroke via State

## Introduction

Now that you can extract data from forms, the next big challenge is making sure that data is **valid**. Form validation is how you guard the door — you don't let bad data through. And one of the most responsive ways to validate is to check user input on **every single keystroke**. This gives immediate feedback, but it comes with its own set of trade-offs.

---

## Why Keystroke-Based Validation?

Imagine a user typing their email. Instead of waiting until they click "Submit" to tell them something's wrong, you show them an error *as they type*. This can feel responsive and helpful — but only if done right.

To validate on every keystroke, you **must** be managing the input value via state, because you need to react to every change. If you're using refs or FormData, you only get the value when the form is submitted — not on each keypress.

---

## Setting Up Keystroke Validation

The idea is simple: derive a computed value from the current state and use it to conditionally render an error message.

```jsx
const [enteredValues, setEnteredValues] = useState({
  email: '',
  password: ''
});

const emailIsInvalid = enteredValues.email.includes('@') === false;
```

Every time the component re-renders (which happens on every keystroke because state changes), `emailIsInvalid` is recalculated. You then use it in your JSX:

```jsx
{emailIsInvalid && (
  <div className="control-error">
    <p>Please enter a valid email address.</p>
  </div>
)}
```

### What happens?

- The user types → state updates → component re-renders → `emailIsInvalid` is recalculated → UI updates

This is React's reactivity at work. No manual DOM manipulation needed.

---

## The Problem: Errors Show Too Early

With the basic setup above, the error message appears **immediately on page load** because an empty string doesn't contain `@`. The user hasn't even touched the field yet, and they're already seeing red.

That's a terrible user experience.

### First Fix: Don't Show Errors for Empty Fields

```jsx
const emailIsInvalid =
  enteredValues.email !== '' && !enteredValues.email.includes('@');
```

Now the error only appears once the user starts typing. If the field is empty, we assume they haven't interacted with it yet.

### But This Creates Two New Problems

1. **Empty after deleting**: If the user types a valid email, then erases everything, no error shows — even though the field is now empty and invalid.

2. **Too early still**: The error appears on the very first character. The user typed `a` and immediately sees "invalid email." They didn't even have a chance to type the full address!

---

## The Takeaway: Keystroke Validation Alone Isn't Enough

Validating on every keystroke gives you real-time feedback, but it tends to show errors **too early**. The user feels punished before they've had a chance to enter a correct value.

That's why best-practice validation usually **combines** keystroke validation with another approach — validating when the input **loses focus** (blur). And that's exactly what we'll explore next.

---

## ✅ Key Takeaways

- Keystroke validation requires **state-managed** inputs (not refs or FormData)
- Derive a computed boolean from state to check validity on every render
- Conditionally render error messages based on that boolean
- Raw keystroke validation shows errors too early — before the user has a fair chance
- Always check that the field isn't empty before showing validation errors
- For the best UX, combine keystroke validation with blur-based validation

⚠️ **Common Mistake:** Showing error messages immediately when the page loads because the initial empty state fails validation. Always account for the "untouched" state.
