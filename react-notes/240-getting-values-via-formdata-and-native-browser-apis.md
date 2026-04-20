# Getting Values via FormData & Native Browser APIs

## Introduction

We've seen state and refs for extracting form values. But what about forms with **10, 15, or 20 fields**? Setting up that many `useState` calls or refs is tedious. There's a third approach that leverages a **built-in browser API** called `FormData` — and it's often the most elegant solution for complex forms.

---

## What Is `FormData`?

`FormData` is a **browser-native constructor** (not a React or third-party feature) that can automatically gather all the values from a form's input fields into a single object.

```jsx
function handleSubmit(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  // fd now contains ALL form field values!
}
```

### How does it know which fields to include?

It reads the **`name` attribute** on each input. Every input you want `FormData` to capture **must** have a `name` prop:

```jsx
<input type="email" name="email" />
<input type="password" name="password" />
<input type="text" name="first-name" />
```

Without the `name` attribute, `FormData` won't see that field.

---

## Extracting Individual Values

You can get a single value with the `.get()` method:

```js
const fd = new FormData(event.target);
const email = fd.get("email");       // "test@example.com"
const password = fd.get("password"); // "secret123"
```

But for complex forms, reading each value one by one defeats the purpose.

---

## The Power Move: `Object.fromEntries()`

This is the pattern you'll see in production React code:

```js
function handleSubmit(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  const data = Object.fromEntries(fd.entries());
  console.log(data);
}
```

What's happening:

1. `fd.entries()` → gives you an iterable of `[name, value]` pairs
2. `Object.fromEntries()` → converts those pairs into a plain object

Result:

```js
{
  email: "test@example.com",
  password: "secret123",
  "first-name": "John",
  "last-name": "Doe",
  role: "student"
}
```

**One line** to extract ALL form values. No state, no refs, no individual handlers.

---

## Handling Multi-Value Inputs (Checkboxes)

There's one gotcha. If you have a group of checkboxes with the **same name**:

```jsx
<input type="checkbox" name="acquisition" value="google" />
<input type="checkbox" name="acquisition" value="friend" />
<input type="checkbox" name="acquisition" value="other" />
```

`Object.fromEntries()` will only keep the **last checked value** (since object keys are unique). To get ALL checked values, use `.getAll()`:

```js
const fd = new FormData(event.target);
const data = Object.fromEntries(fd.entries());

// Manually extract multi-value fields
data.acquisition = fd.getAll("acquisition");
// ["google", "friend"]  (array of all checked values)
```

---

## When to Use `FormData`

| Scenario | Best Approach |
|----------|--------------|
| Simple form (2-3 fields) | State or Refs |
| Complex form (many fields) | **FormData** |
| Need live validation | State |
| Only need values on submit | **FormData** or Refs |
| Dynamic/generated fields | **FormData** |

---

## Complete Example

```jsx
function handleSubmit(event) {
  event.preventDefault();

  const fd = new FormData(event.target);
  const data = Object.fromEntries(fd.entries());

  // Handle checkbox groups separately
  data.acquisition = fd.getAll("acquisition");

  console.log(data);
  // Send to backend, validate, etc.
}
```

---

## ✅ Key Takeaways

- `FormData` is a **browser-native** API — no libraries needed
- It requires the `name` attribute on every input field
- `Object.fromEntries(fd.entries())` converts all form data to a plain object in one line
- Use `.getAll("name")` for multi-value inputs like checkbox groups

## ⚠️ Common Mistakes

- Forgetting the `name` attribute on inputs — `FormData` silently skips them
- Expecting checkbox groups to work with `Object.fromEntries()` — they need `.getAll()` separately
- Trying to use `FormData` for live validation — it only captures values at the moment you create it

## 💡 Pro Tip

`FormData` is especially powerful for forms where inputs are **dynamically generated** (e.g., from an API response). You don't need to know the field names in advance — `FormData` captures whatever `name` attributes exist in the form at submission time.
