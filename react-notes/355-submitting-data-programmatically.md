# Submitting Data Programmatically

## Introduction

React Router's `<Form>` component is the go-to for form submissions. But what if you need to trigger an action **without a form**? For example, a delete button that should first prompt the user for confirmation before proceeding. You can't wrap that in a `<Form>` easily. Enter `useSubmit` — the programmatic way to trigger actions.

---

## The Use Case: Delete with Confirmation

Imagine a delete button on an event detail page. When clicked, you want to:
1. Show a confirmation dialog
2. Only delete if the user confirms
3. Trigger the action programmatically (not from a form)

```jsx
function EventItem({ event }) {
  function startDeleteHandler() {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      // Trigger the delete action here...
    }
  }

  return (
    <button onClick={startDeleteHandler}>Delete</button>
  );
}
```

Wrapping the button in a `<Form>` would bypass the confirmation dialog — the form would submit immediately on click.

---

## useSubmit Hook

`useSubmit` gives you a `submit` function that triggers an action programmatically:

```jsx
import { useSubmit } from "react-router-dom";

function EventItem({ event }) {
  const submit = useSubmit();

  function startDeleteHandler() {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      submit(null, { method: "delete" });
    }
  }

  return <button onClick={startDeleteHandler}>Delete</button>;
}
```

### The submit() function takes two arguments:

1. **Data** — the form data to submit (or `null` if no data is needed). This data gets wrapped in a `FormData` object automatically.
2. **Options** — an object where you can set:
   - `method` — the HTTP method ("post", "delete", "patch", etc.)
   - `action` — a path to target a different route's action

---

## Writing the Delete Action

```jsx
export async function action({ request, params }) {
  const eventId = params.eventId;

  const response = await fetch(`http://localhost:8080/events/${eventId}`, {
    method: request.method,  // Uses the method from submit()
  });

  if (!response.ok) {
    throw json({ message: "Could not delete event." }, { status: 500 });
  }

  return redirect("/events");
}
```

### Using request.method Dynamically

Notice `method: request.method`. The `method` you set in `submit(null, { method: "delete" })` becomes available on the `request` object passed to the action. This means your action can behave differently based on how it was triggered.

---

## Registering the Action

```jsx
import { action as deleteEventAction } from "./pages/EventDetail";

{
  path: ":eventId",
  id: "event-detail",
  loader: eventDetailLoader,
  action: deleteEventAction,  // ← Register the action
  children: [...]
}
```

---

## The Full Delete Flow

1. User clicks "Delete" button
2. `window.confirm()` prompts for confirmation
3. If confirmed, `submit(null, { method: "delete" })` fires
4. React Router calls the registered action
5. Action receives `{ request, params }` with `request.method === "DELETE"`
6. Action sends DELETE request to backend
7. On success: `redirect("/events")` navigates to the events list

---

## submit() vs. Form Component

| Feature | `<Form>` | `useSubmit` |
|---------|---------|-------------|
| Triggered by | Form submission (click/enter) | Any JavaScript code |
| Data source | Input `name` attributes | Passed as first argument |
| Use case | Standard form submissions | Conditional logic, confirmations, non-form UI |
| Route targeting | `action` prop | `action` option |

---

## ✅ Key Takeaways

- `useSubmit()` lets you trigger actions **programmatically** — no form required
- `submit(data, options)` takes data as the first argument and options (method, action) as the second
- Pass `null` as data when you don't need to send form data
- The `method` you set is accessible via `request.method` in the action
- Use this for delete operations, confirmation dialogs, or any action that shouldn't come from a standard form

⚠️ **Common Mistake:** Forgetting to register the action on the route. `useSubmit` triggers the action of the current route by default — make sure it exists.

💡 **Pro Tip:** You can set `action: "/some-path"` in the submit options to trigger a different route's action — useful when the action lives on a different route than the component.
