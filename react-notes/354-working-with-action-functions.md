# Working with action() Functions

## Introduction

Time to actually build an action. This is where React Router really shines for form handling — it takes care of capturing form data, passing it to your action function, and even handles navigation after submission. Let's walk through the entire flow.

---

## Step 1: Set Up Your Form Inputs with name Attributes

Every input that should be part of the submission needs a `name` attribute. React Router uses these names to build the form data:

```jsx
<input type="text" name="title" />
<input type="url" name="image" />
<input type="date" name="date" />
<textarea name="description" />
```

---

## Step 2: Replace `<form>` with React Router's `<Form>`

Import `Form` from `react-router-dom` and use it instead of the native `<form>` element:

```jsx
import { Form } from "react-router-dom";

function EventForm() {
  return (
    <Form method="post">
      <input type="text" name="title" />
      {/* ...other inputs */}
      <button type="submit">Save</button>
    </Form>
  );
}
```

What `<Form>` does differently:
- **Prevents** the default browser form submission (no page reload)
- **Captures** the request that would have been sent
- **Forwards** it to your action function — including all form data

The `method` prop sets the HTTP method for the internal request (post, patch, delete, etc.). This request goes to your **action**, not directly to a server.

---

## Step 3: Define the Action Function

Export an action function from the page component file where the form is rendered:

```jsx
import { json, redirect } from "react-router-dom";

export async function action({ request, params }) {
  const data = await request.formData();

  const eventData = {
    title: data.get("title"),
    image: data.get("image"),
    date: data.get("date"),
    description: data.get("description"),
  };

  const response = await fetch("http://localhost:8080/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw json({ message: "Could not save event." }, { status: 500 });
  }

  return redirect("/events");
}
```

### Breaking this down:

1. **`request.formData()`** — Extract the submitted form data. This is why the `name` attributes matter.
2. **`data.get("title")`** — Get individual field values by their `name`.
3. **`fetch(...)`** — Send the data to your backend API.
4. **Error handling** — Throw a `json()` response for errors (triggers `errorElement`).
5. **`redirect("/events")`** — Navigate the user after success.

---

## Step 4: Register the Action in Your Route Definition

Just like loaders, actions must be registered:

```jsx
import { action as newEventAction } from "./pages/NewEvent";

{
  path: "new",
  element: <NewEventPage />,
  action: newEventAction,  // ← Register here
}
```

---

## Key Concepts

### Actions Run in the Browser
Just like loaders — this is client-side code. You're using `fetch()` from the browser to communicate with your backend.

### The request Object
React Router constructs a Request object from the form submission. It contains:
- `request.formData()` — the submitted data
- `request.method` — the HTTP method from the `<Form>` component
- `request.url` — the URL

### redirect() Creates a Special Response
`redirect()` is like `json()` — it creates a Response object. But instead of containing data, it tells React Router to navigate to a different route:

```jsx
return redirect("/events"); // Navigate to /events after success
```

---

## The Complete Flow

1. User fills out form and clicks "Save"
2. `<Form>` intercepts the submission
3. React Router calls the registered `action` function
4. Action receives `{ request, params }` — extracts form data from `request`
5. Action sends data to the backend
6. On success: `redirect()` navigates away
7. On failure: `json()` throw triggers `errorElement`

---

## ✅ Key Takeaways

- Use React Router's `<Form>` (capital F) instead of `<form>` for action-powered submissions
- All inputs need `name` attributes — that's how form data is identified
- Actions receive `{ request, params }` — use `request.formData()` to extract submitted values
- Use `redirect()` to navigate after successful submission
- Register actions in route definitions — they won't auto-discover

⚠️ **Common Mistake:** Forgetting to add `name` attributes to inputs. Without them, `formData.get()` returns `null`.

💡 **Pro Tip:** `<Form>` triggers the action of the **currently active route** by default. To trigger a different route's action, add the `action` prop: `<Form action="/other-path">`.
