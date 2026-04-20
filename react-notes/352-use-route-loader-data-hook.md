# The useRouteLoaderData() Hook & Accessing Data From Other Routes

## Introduction

What happens when two different routes need the **same data**? For example, both the "Event Detail" page and the "Edit Event" page need the same event data. Do you duplicate the loader? No — React Router has an elegant solution using nested routes and `useRouteLoaderData()`.

---

## The Problem: Shared Data Across Routes

Consider this scenario:
- `/events/:eventId` → Shows event details (needs event data)
- `/events/:eventId/edit` → Shows edit form (also needs event data)

These are two different routes. Each would normally need its own loader. But writing the same fetch logic twice is bad practice.

---

## The Solution: A Parent Route with a Shared Loader

We can create a **wrapper route** that doesn't render any element but holds the loader:

```jsx
{
  path: ":eventId",
  id: "event-detail",           // ← Give it a unique ID
  loader: eventDetailLoader,     // ← Shared loader lives here
  children: [
    { index: true, element: <EventDetailPage /> },
    { path: "edit", element: <EditEventPage /> },
  ],
}
```

Key points:
- The parent route has **no `element`** — it's purely structural
- It has a **loader** that fetches the event data
- Both child routes can access that loader's data
- The `id` property is critical — we'll use it in a moment

---

## Why useLoaderData() Doesn't Work Here

`useLoaderData()` looks for loader data starting at the **current route level**. If you're on the "Edit Event" page, it looks for a loader on that edit route — and finds nothing. It does NOT automatically look at parent routes.

```jsx
// In EditEventPage:
const data = useLoaderData(); // ❌ Returns undefined — no loader on this route!
```

---

## Enter useRouteLoaderData()

This hook lets you access a loader from **any route** by referencing its `id`:

```jsx
import { useRouteLoaderData } from "react-router-dom";

function EditEventPage() {
  const data = useRouteLoaderData("event-detail"); // ← Use the route's ID
  return <EventForm event={data.event} />;
}
```

And in the detail page component, use the same hook:

```jsx
function EventDetailPage() {
  const data = useRouteLoaderData("event-detail");
  return <EventItem event={data.event} />;
}
```

Both components access the **same loader data** through the route's unique `id`.

---

## How Route IDs Work

The `id` property on a route definition is:
- A string you choose (e.g., `"event-detail"`)
- Must be **unique** across all routes
- Used as a reference key for `useRouteLoaderData()`

```jsx
{
  path: ":eventId",
  id: "event-detail",  // ← Your chosen identifier
  loader: eventDetailLoader,
  children: [...]
}
```

---

## Pre-Populating Forms with Loaded Data

A common use case: the edit form should be pre-filled with existing event data.

```jsx
function EventForm({ event }) {
  return (
    <form>
      <input
        type="text"
        name="title"
        defaultValue={event ? event.title : ""}
      />
      <input
        type="url"
        name="image"
        defaultValue={event ? event.image : ""}
      />
      {/* ... more fields */}
    </form>
  );
}
```

Use `defaultValue` (not `value`) for uncontrolled inputs that should be pre-populated but still editable.

---

## ✅ Key Takeaways

- Use **wrapper routes** (no element, just loader + children) to share loaders across sibling routes
- Give shared routes a unique `id` property
- Use `useRouteLoaderData(id)` to access data from any route's loader
- `useLoaderData()` only searches the **current route level** — it won't look at parents
- This pattern eliminates code duplication when multiple routes need the same data

⚠️ **Common Mistake:** Forgetting to add the `id` property to the route. Without it, `useRouteLoaderData()` has no way to find the right loader.

💡 **Pro Tip:** Think of `useRouteLoaderData()` as "reach across the route tree" and `useLoaderData()` as "grab what's right here." Use the right one for the job.
