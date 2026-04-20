# Dynamic Routes & loader()s

## Introduction

We've loaded a list of events. Now it's time to tackle the next challenge: loading data for a **single event** when the user clicks on it. This means working with dynamic route parameters inside loader functions — and since we can't use hooks in loaders, React Router provides its own mechanism for accessing route params.

---

## Setting Up Navigation to Dynamic Routes

First, we need our event list to link to individual event detail pages. In the events list component, replace `<a>` tags with React Router's `<Link>`:

```jsx
import { Link } from "react-router-dom";

function EventsList({ events }) {
  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <Link to={event.id}>{event.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

Here `to={event.id}` is a **relative path** — it appends the event ID to the current route. If we're at `/events`, clicking a link navigates to `/events/some-event-id`, which matches our dynamic route definition: `path: ":eventId"`.

---

## Accessing Route Parameters in Loaders

Here's the problem: we need the `eventId` from the URL to fetch the right event, but we **can't use `useParams()`** in a loader — hooks only work in components.

The solution? React Router **passes an object** to every loader function when it calls it, and that object contains two properties:

- **`request`** — the Request object (useful for query params, URL info)
- **`params`** — an object with all route parameter values

```jsx
export async function loader({ request, params }) {
  const eventId = params.eventId; // matches ":eventId" in route definition

  const response = await fetch(`http://localhost:8080/events/${eventId}`);

  if (!response.ok) {
    throw json(
      { message: "Could not fetch details for selected event." },
      { status: 500 }
    );
  }

  return response;
}
```

The `params` object works exactly like `useParams()` — the keys match your dynamic segment names (`:eventId` → `params.eventId`).

---

## Registering the Loader

Defining a loader function in your component file does **nothing** by itself. You must **register** it in your route definition:

```jsx
import EventDetailPage, { loader as eventDetailLoader } from "./pages/EventDetail";

{
  path: ":eventId",
  element: <EventDetailPage />,
  loader: eventDetailLoader,  // Don't forget this!
}
```

⚠️ **Common Mistake:** Forgetting to register the loader in the route definition. The loader won't run automatically just because it's exported from the component file.

---

## Using the Loaded Data

```jsx
import { useLoaderData } from "react-router-dom";

function EventDetailPage() {
  const data = useLoaderData();
  return <EventItem event={data.event} />;
}
```

The API returns `{ event: { ... } }`, so we access `data.event` to get the individual event object.

---

## The Full Flow

1. User clicks an event link → navigates to `/events/abc123`
2. React Router matches the `:eventId` route
3. Before rendering, React Router calls the loader with `{ params: { eventId: "abc123" } }`
4. Loader fetches data from the backend using that ID
5. Component renders with the loaded data via `useLoaderData()`

---

## ✅ Key Takeaways

- React Router passes `{ request, params }` to every loader function
- `params` gives you access to dynamic route segments — just like `useParams()` but outside components
- `request` gives you access to the Request object (URL, query params, etc.)
- Always **register** your loader in the route definition — it won't auto-discover
- Use alias imports to avoid name clashes: `import { loader as eventDetailLoader }`

💡 **Pro Tip:** The `request` object in loaders is useful for extracting query parameters via `new URL(request.url).searchParams`. Keep it in mind for search/filter functionality.
