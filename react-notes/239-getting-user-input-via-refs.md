# Getting User Input via Refs

## Introduction

Using `useState` for form inputs is the most common approach, but it's not the only one. **Refs** offer a lighter alternative — especially when you don't need to track the input value on every keystroke and just want the final value when the form is submitted.

---

## The Ref Approach

```jsx
import { useRef } from "react";

function Login() {
  const email = useRef();
  const password = useRef();

  function handleSubmit(event) {
    event.preventDefault();
    const enteredEmail = email.current.value;
    const enteredPassword = password.current.value;
    console.log(enteredEmail, enteredPassword);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" ref={email} />
      <input type="password" ref={password} />
      <button>Login</button>
    </form>
  );
}
```

### How it works:

1. **Create refs** with `useRef()` — one per input field
2. **Connect refs** using the `ref` prop on input elements
3. **Read values** on submit via `refName.current.value`

That's it. No `onChange` handlers. No `value` props. No state updates on every keystroke.

---

## Why `.current.value`?

Refs always store their connected value in the `.current` property. When you connect a ref to an input element, `ref.current` becomes the **DOM element node** itself — the actual `<input>` HTML element.

And every input DOM element has a `.value` property that contains whatever the user has typed.

So: `email.current` = the DOM input element, `email.current.value` = the text inside it.

---

## State vs. Refs: When to Use Which?

| Feature | State (`useState`) | Refs (`useRef`) |
|---------|-------------------|-----------------|
| **Re-renders on change** | Yes (every keystroke) | No |
| **Code required** | More (onChange, value, state) | Less (ref, read on submit) |
| **Live validation** | Easy (value always available) | Harder (value only read on demand) |
| **Resetting fields** | Clean (`setState("")`) | Discouraged (`ref.current.value = ""`) |
| **Best for** | Complex forms, live validation | Simple forms, submit-only extraction |

---

## The Downside: Resetting Is Messy

With state, resetting an input is clean:

```jsx
setEnteredEmail("");  // ✅ React way
```

With refs, you'd have to directly manipulate the DOM:

```jsx
email.current.value = "";  // ⚠️ Works, but not recommended
```

This is **imperative DOM manipulation** — something React generally discourages because React expects to be in control of the DOM. Directly modifying DOM elements can lead to inconsistencies.

---

## Scaling Concern

For a form with 2 fields, refs are fine. For 10+ fields, you'd need 10 refs, 10 `ref` props, and 10 `.current.value` reads. The boilerplate adds up, and you don't get the benefits of a generic handler like the state approach offers.

---

## ✅ Key Takeaways

- Refs connect directly to DOM elements; read values with `ref.current.value`
- No `onChange` handlers or `value` props needed — less code for simple forms
- Refs don't cause re-renders, which can be a performance benefit in large forms
- Refs are best suited for **submit-only** value extraction, not live validation

## ⚠️ Common Mistakes

- Forgetting `.current` — `email.value` doesn't exist; it's `email.current.value`
- Using refs to directly reset input values (`ref.current.value = ""`) — this is discouraged in React
- Trying to validate on every keystroke with refs — refs don't trigger re-renders, so the UI won't update

## 💡 Pro Tip

Use refs for "read-only" form handling — where you just need the values on submit and don't need real-time validation or live UI updates based on the input. For everything else, state is the better tool.
