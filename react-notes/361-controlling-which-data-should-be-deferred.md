# Controlling Which Data Should Be Deferred

## Introduction

You've learned that `defer` lets you show a page before all data has loaded. But what if you have **multiple requests** with different speeds? What if one request is blazing fast and another takes two seconds? Do you really want to defer *everything*?

This is where `defer` truly shines — it gives you **fine-grained control** over which data to wait for before navigation and which data to load *after* the page renders.

---

## The Scenario: Multiple Data Sources on One Page

Imagine an **Event Detail** page that needs two pieces of data:

1. **A single event** — fetched quickly from the backend
2. **A list of all events** — takes 2 seconds because the backend has a timeout

Without `defer`, the user stares at a blank screen for 2 seconds waiting for both to load. With `defer`, you can show the fast data immediately while the slow data loads in the background.

---

## Setting Up Multiple Deferred Requests

### Step 1: Create Helper Functions

Extract your data fetching logic into reusable helper functions:

```jsx
// Helper to load a single event
async function loadEvent(id) {
  const response = await fetch('http://localhost:8080/events/' + id);
  const resData = await response.json();
  return resData.event;
}

// Helper to load all events
async function loadEvents() {
  const response = await fetch('http://localhost:8080/events');
  const resData = await response.json();
  return resData.events;
}
```

### Step 2: Defer Multiple Requests in the Loader

```jsx
import { defer } from 'react-router-dom';

export function loader({ params }) {
  const id = params.eventId;
  return defer({
    event: loadEvent(id),
    events: loadEvents(),
  });
}
```

Both requests are now bundled into one `defer` object with separate keys: `event` and `events`.

---

## Rendering with Multiple `<Await>` Blocks

Here's the critical part — each `<Await>` block **must be wrapped in its own `<Suspense>`** component:

```jsx
import { Suspense } from 'react';
import { useRouteLoaderData, Await } from 'react-router-dom';

function EventDetailPage() {
  const { event, events } = useRouteLoaderData('event-detail');

  return (
    <>
      <Suspense fallback={<p>Loading event details...</p>}>
        <Await resolve={event}>
          {(loadedEvent) => <EventItem event={loadedEvent} />}
        </Await>
      </Suspense>

      <Suspense fallback={<p>Loading events list...</p>}>
        <Await resolve={events}>
          {(loadedEvents) => <EventsList events={loadedEvents} />}
        </Await>
      </Suspense>
    </>
  );
}
```

### Why Separate `<Suspense>` Wrappers?

If you wrap both `<Await>` blocks in **one** `<Suspense>`, React will wait for **both** to complete before showing anything. That defeats the whole purpose. Separate `<Suspense>` components means each section can resolve independently.

⚠️ **Common Mistake:** Wrapping multiple `<Await>` components in a single `<Suspense>`. This makes them behave as if nothing was deferred at all.

---

## The `await` Keyword — Your Fine-Grained Control Lever

Here's the powerful part most developers miss. When your loader is an `async` function, you can use the **`await`** keyword to tell React Router:

> "Wait for THIS data before navigating. But defer THAT data."

```jsx
export async function loader({ params }) {
  const id = params.eventId;
  return defer({
    event: await loadEvent(id),   // ← Wait BEFORE navigating
    events: loadEvents(),          // ← Load AFTER navigating
  });
}
```

### What This Does

| Data | Behavior |
|------|----------|
| `await loadEvent(id)` | React Router waits for this to complete **before** rendering the page. No loading indicator for event details. |
| `loadEvents()` (no await) | Loads **after** the page is already rendered. Shows a loading fallback while it resolves. |

This is the ideal user experience: the critical data (event details) is there instantly, while the secondary data (event list) loads in the background.

---

## When to Use `await` Inside `defer`

Think of it as a **priority system**:

- **`await` a request** = critical data the user needs immediately. Navigation is delayed until it's ready.
- **Don't `await`** = secondary data that can load after the page is displayed.

💡 **Pro Tip:** Ask yourself: "Can the user meaningfully interact with this page without this data?" If no — `await` it. If yes — defer it.

---

## ✅ Key Takeaways

- `defer` can handle **multiple requests** with different speeds
- Each `<Await>` block needs its **own `<Suspense>` wrapper**
- Use the `await` keyword inside `defer` to control **which data blocks navigation** and which loads after
- `await` = "wait before showing the page." No `await` = "show the page, load this in the background"
- Don't always use `defer` — use it when you genuinely need to show partial data before everything is ready
