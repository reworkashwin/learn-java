# Reusing Actions via Request Methods

## Introduction

We have a form for creating events and a form for editing events. They're the same form component — same fields, same structure. The only differences are the HTTP method (POST vs. PATCH) and the URL (with or without an event ID). Can we share a single action for both? Absolutely — by making the action dynamic based on the request method.

---

## The Problem

Creating and editing events requires nearly identical code:

| | Create | Edit |
|---|---|---|
| URL | `/events` | `/events/:eventId` |
| Method | POST | PATCH |
| Form data | Same fields | Same fields |
| Redirect | Same | Same |

Duplicating the action for both routes violates DRY.

---

## Step 1: Use Different Methods on the Form

Pass a `method` prop to the shared form component:

```jsx
// NewEventPage → creating
<EventForm method="post" />

// EditEventPage → editing
<EventForm method="patch" />
```

In `EventForm`, use the prop on the `<Form>` component:

```jsx
function EventForm({ event, method }) {
  return (
    <Form method={method}>
      {/* ...inputs */}
    </Form>
  );
}
```

---

## Step 2: Write a Dynamic Action

Move the action to a shared location (e.g., the `EventForm` component file) and make it adapt based on the request method:

```jsx
export async function action({ request, params }) {
  const method = request.method;
  const data = await request.formData();

  const eventData = {
    title: data.get("title"),
    image: data.get("image"),
    date: data.get("date"),
    description: data.get("description"),
  };

  let url = "http://localhost:8080/events";

  if (method === "PATCH") {
    const eventId = params.eventId;
    url = `http://localhost:8080/events/${eventId}`;
  }

  const response = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (response.status === 422) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: "Could not save event." }, { status: 500 });
  }

  return redirect("/events");
}
```

### Key Details:

- **`request.method`** — gives you the HTTP method set on the `<Form>` component (uppercase: "POST", "PATCH", etc.)
- **URL construction** — for PATCH, append the event ID; for POST, use the base URL
- **`params.eventId`** — accessible because the edit route has `:eventId` in its path

⚠️ **Common Mistake:** The method from `request.method` is **UPPERCASE** ("PATCH", not "patch"). Compare accordingly.

---

## Step 3: Register the Same Action on Both Routes

```jsx
import { action as manipulateEventAction } from "../components/EventForm";

// Route definitions:
{ path: "new", element: <NewEventPage />, action: manipulateEventAction },
{ path: "edit", element: <EditEventPage />, action: manipulateEventAction },
```

One action, two routes, different behavior based on the method.

---

## The Full Pattern

```
NewEventPage                    EditEventPage
    ↓                               ↓
<EventForm method="post">      <EventForm method="patch">
    ↓                               ↓
action({ request })             action({ request })
request.method === "POST"       request.method === "PATCH"
    ↓                               ↓
POST /events                    PATCH /events/:eventId
    ↓                               ↓
redirect("/events")             redirect("/events")
```

---

## ✅ Key Takeaways

- Set different `method` props on `<Form>` to distinguish create vs. edit operations
- Access the method in the action via `request.method` (always uppercase)
- Conditionally construct the URL and extract params based on the method
- Register the **same action** on multiple routes for code reuse
- Move shared actions to a common file (like the form component file)

💡 **Pro Tip:** This pattern works for any action that handles multiple operation types. Set the method on the form, read it in the action, and branch your logic accordingly. One action to rule them all.
