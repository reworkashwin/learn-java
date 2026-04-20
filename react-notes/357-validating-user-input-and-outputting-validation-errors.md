# Validating User Input & Outputting Validation Errors

## Introduction

Client-side validation with HTML attributes like `required` is good for UX but can easily be disabled through browser dev tools. **Server-side validation is non-negotiable.** The question is: when the backend rejects form data, how do we show those validation errors to the user without losing their input? React Router has a clean solution with `useActionData`.

---

## The Problem

Our backend validates submitted data and returns a **422 status code** with error details if validation fails. We need to:
1. Catch that 422 response in our action
2. Show the errors **inline** (not on a separate error page)
3. Keep the user on the same form so they can fix their input

Throwing an error response would show the error page — bad UX because the user loses all their form input.

---

## The Solution: Return (Don't Throw) Validation Errors

In your action, check for the 422 status code and **return** the response instead of throwing:

```jsx
export async function action({ request }) {
  // ...extract and send form data...

  const response = await fetch("http://localhost:8080/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (response.status === 422) {
    return response;  // ← Return, don't throw!
  }

  if (!response.ok) {
    throw json({ message: "Could not save event." }, { status: 500 });
  }

  return redirect("/events");
}
```

The key distinction:
- **Throw** → renders `errorElement` (replaces the page)
- **Return** → data is accessible via `useActionData()` (stays on the page)

---

## useActionData — The Action Counterpart to useLoaderData

Just as `useLoaderData()` gives you data from loaders, `useActionData()` gives you data returned from actions:

```jsx
import { useActionData } from "react-router-dom";

function EventForm() {
  const data = useActionData();

  return (
    <Form method="post">
      {data && data.errors && (
        <ul>
          {Object.values(data.errors).map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      {/* ...form inputs */}
    </Form>
  );
}
```

### Important: data might be undefined

`useActionData()` returns `undefined` if:
- The form hasn't been submitted yet
- The action redirected (no data returned)

Always check `if (data && data.errors)` before trying to render errors.

---

## How the Backend Response Looks

A typical validation error response from the backend:

```json
{
  "message": "Invalid input data",
  "errors": {
    "title": "Title is required",
    "date": "Invalid date format",
    "description": "Description must be at least 10 characters"
  }
}
```

React Router automatically parses this response (just like with loader data), so `data.errors` gives you the errors object directly.

---

## Rendering Validation Errors

Loop through the errors object and display each message:

```jsx
{data && data.errors && (
  <ul>
    {Object.values(data.errors).map((err) => (
      <li key={err}>{err}</li>
    ))}
  </ul>
)}
```

`Object.values()` extracts all values from the errors object into an array, which we then map to list items.

---

## Two-Layer Validation Strategy

| Layer | Purpose | Can be bypassed? |
|-------|---------|-----------------|
| Client-side (HTML attributes) | Good UX, fast feedback | Yes — via dev tools |
| Server-side (backend) | Security, data integrity | No |

Always have both. Never trust client-side validation alone.

---

## ✅ Key Takeaways

- **Return** validation error responses from actions (don't throw them) to stay on the form
- Use `useActionData()` to access data returned by the action
- `useActionData()` returns `undefined` until the action runs and returns data
- Always check if `data` exists before rendering — the form may not have been submitted yet
- Combine client-side (HTML attributes) and server-side validation for robust form handling

⚠️ **Common Mistake:** Throwing a `json()` error for validation failures. This shows the error page and the user loses all their form input. Return the response instead.

💡 **Pro Tip:** `useActionData()` works in any component rendered by the route that has the action — including child components like your form. You don't need to prop-drill the data.
