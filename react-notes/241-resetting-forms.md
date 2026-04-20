# Resetting Forms

## Introduction

You've learned how to extract user input using state, refs, and FormData. But what happens after the user submits a form or wants to start fresh? That's where **resetting forms** comes in. It sounds simple — just clear the inputs, right? But React gives you several ways to do this, and choosing the right one depends on how you're managing your form data.

---

## The Built-in Reset Button

The simplest way to reset a form is one you might already have in your HTML — a button with `type="reset"`.

```jsx
<button type="reset">Reset</button>
```

When placed inside a `<form>`, this button automatically clears every input field back to its default value. You don't write a single line of JavaScript for this to work — it's pure browser behavior.

There are three possible `type` values for buttons inside forms:

- **`submit`** (default) — submits the form
- **`button`** — does nothing special, just acts as a clickable button
- **`reset`** — clears all form fields

💡 **Pro Tip:** If you ever wondered why a button inside a form seems to submit the form when you click it, it's because `submit` is the default type. Always set `type="button"` explicitly if you don't want a button to submit the form.

---

## Resetting When Managing Input via State

If you're using React state to manage input values, resetting is straightforward — just set the state back to its initial value.

```jsx
const [enteredValues, setEnteredValues] = useState({
  email: '',
  password: ''
});

function handleSubmit() {
  // Process form data...

  // Reset by restoring initial state
  setEnteredValues({ email: '', password: '' });
}
```

Because these state values are bound to the `value` prop of each input, resetting the state immediately clears the UI. This is **declarative** — you describe what the state should be, and React updates the DOM for you.

---

## Resetting When Using Refs

With refs, you don't have state controlling the input values. So how do you clear them?

### The Naive (Not Recommended) Approach

You *could* manually set each ref's value to an empty string:

```jsx
emailRef.current.value = '';
passwordRef.current.value = '';
```

But this is **imperative DOM manipulation** — you're reaching into the DOM and changing it directly. React's philosophy is to let React manage the DOM. Doing this for one or two inputs might seem harmless, but it's a pattern you should avoid in principle.

### The Better Approach: `event.target.reset()`

When a form is submitted, the `event.target` is the form element itself. And form elements have a built-in `.reset()` method:

```jsx
function handleSubmit(event) {
  event.preventDefault();
  // Extract data...

  event.target.reset(); // Resets the entire form
}
```

This is essentially what the `type="reset"` button does, but triggered programmatically. Yes, it's still *technically* imperative, but it's a single line of code versus manually resetting every ref. It's the pragmatic choice.

⚠️ **Common Mistake:** Don't confuse `event.target.reset()` with setting individual ref values. The `.reset()` method is far cleaner and resets the entire form in one go.

---

## Which Approach to Choose?

| Form Management Style | Best Reset Strategy |
|---|---|
| **State-managed** | Set state back to initial values |
| **Refs** | Use `event.target.reset()` |
| **FormData approach** | Use `event.target.reset()` |
| **Any approach** | Add a `<button type="reset">` for user-triggered resets |

---

## ✅ Key Takeaways

- A `<button type="reset">` inside a `<form>` resets all fields automatically — no code needed
- When using state, reset by updating state to initial values
- When using refs, prefer `event.target.reset()` over manually clearing each ref
- Avoid imperative DOM updates (`ref.current.value = ''`) — let React or the browser handle resets
- `event.target` in a form submit handler is the form element itself, which has a `.reset()` method
