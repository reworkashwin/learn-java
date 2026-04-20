# Managing & Getting User Input via State & Generic Handlers

## Introduction

Now that we can handle form submission, the next step is **extracting the values** the user typed in. The most fundamental React approach is using `useState` — setting up two-way binding between state and input fields. But if you have a complex form with many inputs, managing separate state and handlers for each one quickly becomes tedious. Let's explore both the basic and the **generic handler** pattern.

---

## Approach 1: Separate State per Input

The most straightforward approach — one `useState` per input:

```jsx
const [enteredEmail, setEnteredEmail] = useState("");
const [enteredPassword, setEnteredPassword] = useState("");

function handleEmailChange(event) {
  setEnteredEmail(event.target.value);
}

function handleSubmit(event) {
  event.preventDefault();
  console.log(enteredEmail, enteredPassword);
}
```

Then bind each input with two-way binding:

```jsx
<input
  type="email"
  value={enteredEmail}
  onChange={handleEmailChange}
/>
```

### What is two-way binding?

1. **State → Input**: The `value` prop sets what's displayed in the input
2. **Input → State**: The `onChange` handler updates state on every keystroke

This creates a loop: user types → state updates → React re-renders → input shows new value.

This works perfectly for simple forms. But for a form with 10 fields, you'd need 10 `useState` calls and 10 handler functions. That's a lot of boilerplate.

---

## Approach 2: Combined State + Generic Handler

Instead of separate states, use **one state object** for all fields:

```jsx
const [enteredValues, setEnteredValues] = useState({
  email: "",
  password: "",
});
```

Then create **one handler** that works for all inputs:

```jsx
function handleInputChange(identifier, value) {
  setEnteredValues((prevValues) => ({
    ...prevValues,
    [identifier]: value,
  }));
}
```

### How does `[identifier]` work?

This is **computed property names** — a JavaScript feature (not React-specific):

```js
const key = "email";
const obj = { [key]: "test@example.com" };
// Creates: { email: "test@example.com" }
```

The square brackets tell JavaScript: "the property name is whatever's stored in this variable."

---

## Connecting the Generic Handler to Inputs

Since React's `onChange` only passes the event object (not our custom identifier), we need an anonymous wrapper function:

```jsx
<input
  type="email"
  value={enteredValues.email}
  onChange={(event) => handleInputChange("email", event.target.value)}
/>

<input
  type="password"
  value={enteredValues.password}
  onChange={(event) => handleInputChange("password", event.target.value)}
/>
```

### What's happening here?

1. React calls the anonymous arrow function with the `event`
2. The arrow function calls `handleInputChange` with **both** the identifier (`"email"`) and the value (`event.target.value`)
3. `handleInputChange` updates only the targeted property while preserving the rest

---

## Extracting Values on Submit

```jsx
function handleSubmit(event) {
  event.preventDefault();
  console.log(enteredValues);
  // { email: "test@example.com", password: "secret123" }
}
```

Clean, simple, and all your form data is in one place.

---

## When to Use Which Approach?

| Form Complexity | Recommended Approach |
|----------------|---------------------|
| 2-3 inputs | Separate state per input (clearer) |
| 4+ inputs | Combined state + generic handler (less boilerplate) |
| Dynamic inputs | Combined state is practically required |

---

## ✅ Key Takeaways

- **Two-way binding** = `value` prop (state → input) + `onChange` handler (input → state)
- Use **computed property names** `[identifier]` for a generic handler that works with any input
- The **spread operator** `...prevValues` preserves existing fields when updating one
- Use an **anonymous function** in `onChange` when you need to pass extra arguments

## ⚠️ Common Mistakes

- Forgetting the spread operator `...prevValues` — this overwrites ALL other fields
- Wrapping the returned object in curly braces without parentheses — JavaScript thinks it's a function body, not an object literal
- Not matching the identifier string (`"email"`) with the state property name — nothing updates

## 💡 Pro Tip

The parentheses in the arrow function shorthand are crucial:

```js
// ✅ Returns an object
(prevValues) => ({ ...prevValues, [id]: value })

// ❌ JavaScript thinks these braces are the function body
(prevValues) => { ...prevValues, [id]: value }
```

Always wrap immediately-returned objects in `()` when using arrow functions.
