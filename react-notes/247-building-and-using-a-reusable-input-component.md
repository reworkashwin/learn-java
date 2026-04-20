# Building & Using a Reusable Input Component

## Introduction

If you look at a typical form component with state management, you'll notice something: the JSX for each input field follows the **exact same pattern**. A wrapping div, a label, the input element, and an error message area. The only things that differ are the label text, the input type, the name, and the specific error. That's a classic signal that you should extract a **reusable component**.

---

## Spotting the Duplication

Consider a login form with email and password fields. The JSX for each looks like:

```jsx
<div className="control">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    name="email"
    onBlur={() => handleInputBlur('email')}
    onChange={(e) => handleInputChange('email', e.target.value)}
    value={enteredValues.email}
  />
  {emailIsInvalid && (
    <div className="control-error">
      <p>Please enter a valid email.</p>
    </div>
  )}
</div>
```

The password field has the same structure with different label, type, name, and error content. When you see this pattern, it's time to abstract.

---

## Building the Input Component

Create a new component that wraps this repeating pattern:

```jsx
// Input.jsx
export default function Input({ label, id, error, ...props }) {
  return (
    <div className="control">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
      {error && (
        <div className="control-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
```

### Breaking Down the Design Decisions

**Explicit props (`label`, `id`, `error`)** — These are pulled out because they're used in multiple places within the component. `label` is rendered as text. `id` is used on both the `<label>` (as `htmlFor`) and the `<input>`. `error` controls both the conditional rendering and the message text.

**Rest props (`...props`)** — Everything else (`type`, `name`, `value`, `onChange`, `onBlur`) is gathered into a single object and spread onto the `<input>`. This makes the component incredibly flexible — you can set any standard input attribute from the outside without the component needing to know about it.

This is a powerful React pattern: **explicit destructuring for props you use in multiple places, rest/spread for everything that just passes through**.

---

## Using the Component

Now your form becomes much cleaner:

```jsx
import Input from './Input';

// Before: ~20 lines of JSX per input field
// After: ~8 lines per input field

<Input
  label="Email"
  id="email"
  type="email"
  name="email"
  onBlur={() => handleInputBlur('email')}
  onChange={(e) => handleInputChange('email', e.target.value)}
  value={enteredValues.email}
  error={emailIsInvalid ? 'Please enter a valid email.' : undefined}
/>

<Input
  label="Password"
  id="password"
  type="password"
  name="password"
  onBlur={() => handleInputBlur('password')}
  onChange={(e) => handleInputChange('password', e.target.value)}
  value={enteredValues.password}
  error={passwordIsInvalid ? 'Please enter a valid password.' : undefined}
/>
```

---

## Adding Password Validation

With the component in place, adding validation for the password is easy. Just compute the validity:

```jsx
const passwordIsInvalid =
  didEdit.password && enteredValues.password.trim().length < 6;
```

And pass the error message as a prop. The Input component handles the rest.

---

## The Big Picture: Why Reusable Components Matter

This isn't just about saving a few lines of code. It's about:

- **Consistency** — Every input looks the same. Change the style once, it changes everywhere.
- **Maintainability** — Error display logic lives in one place. If you redesign how errors look, you only change the Input component.
- **Composability** — You can drop this Input component into any form in your app and it just works.

---

## ✅ Key Takeaways

- When JSX patterns repeat with minor differences, extract a reusable component
- Use explicit destructuring for props that are used in multiple places (label, id, error)
- Use the rest/spread pattern (`...props`) to forward all other attributes to the underlying element
- The `error` prop does double duty: it controls conditional rendering AND provides the error message text
- Reusable form components enforce consistency across your entire application

💡 **Pro Tip:** The `...props` spread pattern is one of the most useful techniques in React. It lets you build wrapper components that are transparent — they accept any prop and pass it through to the underlying element, making them behave just like native elements with extra features.
