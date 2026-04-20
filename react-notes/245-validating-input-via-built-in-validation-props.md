# Validating Input via Built-in Validation Props

## Introduction

What if I told you there's a way to validate forms **without writing a single line of JavaScript**? It sounds too good to be true, but it's not. Browsers come with a built-in form validation system, and you can tap into it just by adding a few HTML attributes to your input elements. These attributes work as React props, and they can save you a ton of code for common validation scenarios.

---

## Built-in Validation Attributes

HTML form elements support a set of validation attributes that the browser enforces automatically. You don't need React state, event handlers, or error message logic. The browser handles everything — including showing native error tooltips.

### `required`

The most basic one. It prevents the form from being submitted if the field is empty.

```jsx
<input type="email" name="email" required />
```

If the user tries to submit without filling this in, the browser blocks submission and shows a tooltip like *"Please fill out this field."*

### `type` (works with `required`)

When you set `type="email"`, the browser not only renders an email-specific keyboard on mobile but also validates that the entered value looks like an email address.

```jsx
<input type="email" name="email" required />
```

If the user types `hello` and submits, the browser says something like *"Please include an '@' in the email address."*

### `minLength`

Sets a minimum character count. Great for passwords:

```jsx
<input type="password" name="password" required minLength={6} />
```

If the user enters fewer than 6 characters, the browser blocks submission with a helpful message.

### Other Useful Attributes

- **`maxLength`** — Maximum number of characters
- **`pattern`** — A regex pattern the value must match
- **`min` / `max`** — For number and date inputs
- **`step`** — For number inputs, defines valid increments

---

## It's Not Just for Inputs

These validation attributes work on **all form control elements**, not just `<input>`. You can add `required` to:

- `<select>` elements — forces the user to pick a non-empty option
- `<textarea>` elements — ensures they write something
- Checkboxes — forces the user to check the box (e.g., terms and conditions)

```jsx
<select name="role" required>
  <option value="">Select a role</option>
  <option value="student">Student</option>
  <option value="teacher">Teacher</option>
</select>
```

```jsx
<input type="checkbox" name="terms" required />
```

---

## How It Works Under the Hood

When a form with built-in validation is submitted:

1. The browser checks **every** form control element with validation attributes
2. If **any** field is invalid, submission is **blocked**
3. The browser shows a native error tooltip on the first invalid field
4. Your `onSubmit` handler **never fires** if validation fails

This is important: the browser prevents `onSubmit` from being called entirely. Your JavaScript code doesn't need to do anything.

---

## When to Use This Approach

Built-in validation is perfect for:

- Simple forms where native error tooltips are acceptable
- Quick prototyping when you don't want to write validation logic
- As a **first line of defense** combined with custom validation

It's less ideal when:

- You need custom-styled error messages (native tooltips can't be styled)
- You need complex cross-field validation (e.g., "passwords must match")
- You want error messages that appear inline, below each input

---

## ✅ Key Takeaways

- HTML `required`, `minLength`, `type`, `pattern` attributes validate forms without any JavaScript
- These work as regular React props on `<input>`, `<select>`, and `<textarea>` elements
- The browser blocks form submission and shows native tooltips for invalid fields
- Your `onSubmit` handler won't fire if built-in validation catches an error
- This approach is great for simple forms and as a baseline safety net

💡 **Pro Tip:** You can combine built-in validation with custom JavaScript validation. Use the built-in attributes for simple checks (required, minLength, email format) and add custom logic for complex rules (password matching, conditional fields).
