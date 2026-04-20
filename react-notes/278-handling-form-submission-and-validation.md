# Handling Form Submission & Validation

## Introduction

We've built the checkout form with inputs, modals, and context. Now comes the critical part: actually *submitting* the form. This lesson covers preventing default browser behavior, extracting form values using the native `FormData` API, and preparing data for the backend — all without managing individual state values for each input.

---

## Handling Form Submission with `onSubmit`

React gives us two main approaches:
1. **`onSubmit` prop** — manual handling (shown here)
2. **Form actions** — declarative React 19 feature (we'll migrate to this later)

```jsx
function handleSubmit(event) {
  event.preventDefault();
  // Extract data and send request
}

return (
  <form onSubmit={handleSubmit}>
    {/* inputs... */}
  </form>
);
```

### Why `event.preventDefault()`?

Without it, the browser does what it's always done with forms — creates an HTTP request and sends it to the *same server that served the page*. That's our dev server, which has no idea what to do with checkout data. `preventDefault()` stops this default behavior so we can handle the submission ourselves.

---

## Extracting Form Values with FormData

Instead of wiring up `useState` or `useRef` for every input, we leverage the browser's built-in **FormData API**:

```jsx
function handleSubmit(event) {
  event.preventDefault();

  const fd = new FormData(event.target);
  const customerData = Object.fromEntries(fd.entries());
}
```

Let's unpack this:

### Step 1: `new FormData(event.target)`
`event.target` is the `<form>` element itself. The `FormData` constructor scans all inputs inside the form and collects their values, keyed by the `name` attribute.

### Step 2: `Object.fromEntries(fd.entries())`
`fd.entries()` returns an iterator of `[name, value]` pairs. `Object.fromEntries()` converts that into a plain object:

```js
{
  name: "John Doe",
  email: "john@example.com",
  street: "123 Main St",
  "postal-code": "12345",
  city: "Springfield"
}
```

This is why setting `name` on every input was so important — it's the key used to extract values.

---

## Validation with `required`

Since we added the `required` attribute in our Input component, the browser handles basic validation for us:

- Empty fields show a native validation message
- The form won't submit until all required fields are filled
- `type="email"` validates email format automatically

For this app, that's sufficient. In production apps, you'd likely add JavaScript validation for more complex rules (password strength, matching fields, etc.).

---

## Preparing the Order Data

The backend expects a specific shape:

```js
{
  order: {
    items: [...],     // cart items
    customer: {...}   // form data
  }
}
```

So we combine `customerData` from the form with `cartCtx.items` from context:

```jsx
fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order: {
      items: cartCtx.items,
      customer: customerData,
    },
  }),
});
```

### Field Name Alignment

The backend code looks for specific field names (like `name`, not `full-name`). Always ensure your form input `name` attributes match what the API expects. A mismatch here causes silent data loss — no error, just missing fields.

---

## ✅ Key Takeaways

- Use `event.preventDefault()` to stop the browser from submitting the form to the wrong server
- `new FormData(event.target)` + `Object.fromEntries(fd.entries())` is the cleanest way to extract all form values without per-input state
- The `name` attribute on inputs is what makes FormData work — always set it
- Browser-native validation (`required`, `type="email"`) provides solid baseline validation for free
- Always match form field names to what the backend API expects

## ⚠️ Common Mistakes

- Forgetting `event.preventDefault()` — the page will reload and the request will go to the wrong server
- Not setting the `name` attribute on inputs — `FormData` won't capture those values
- Mismatching field names between frontend form and backend API — leads to missing data with no obvious error

## 💡 Pro Tips

- `Object.fromEntries(new FormData(form).entries())` is a one-liner for extracting all form data as a plain object — remember this pattern
- For forms where you only need values on submit (not on every keystroke), the FormData approach is far simpler than managing state for each input
