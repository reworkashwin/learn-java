# Deferring Data Fetching with defer()

## Introduction

Up to now, when a loader fetches data, React Router **waits** until the data is fully loaded before rendering the route component. The page doesn't appear at all until the fetch completes. For slow requests, this creates a blank screen — not ideal. What if you want to show the page immediately and let the data fill in as it arrives? That's what `defer()` does.

---

## The Problem

With a standard loader, the user experience looks like this:

```
Click "Events" → [blank/old page for 2 seconds] → Events page appears with data
```

There's no indication of loading. The `useNavigation` approach shows a spinner, but the target page itself doesn't render until data is ready. What if you want to show the page shell (buttons, headers, layout) **immediately** and load the data in the background?

---

## Step 1: Extract the Fetch Logic into a Separate Function

Move your data-fetching code out of the loader into its own async function:

```jsx
async function loadEvents() {
  const response = await fetch("http://localhost:8080/events");

  if (!response.ok) {
    throw json({ message: "Could not fetch events." }, { status: 500 });
  }

  const resData = await response.json();
  return resData.events;
}
```

⚠️ **Important:** When using `defer`, you **must** manually parse the response with `response.json()`. You can't return the raw Response object because `defer` handles things differently than a direct loader return.

---

## Step 2: Use defer() in Your Loader

Import `defer` from `react-router-dom` and wrap your async calls:

```jsx
import { defer } from "react-router-dom";

export function loader() {
  return defer({
    events: loadEvents(),  // ← Pass the promise, don't await it!
  });
}
```

**Critical detail:** You call `loadEvents()` with parentheses (executing it) but you do **not** `await` it. You're passing the **promise itself** to `defer`. The loader is no longer `async` — it returns immediately with a deferred value.

The object passed to `defer` can have multiple keys for multiple parallel requests:

```jsx
return defer({
  events: loadEvents(),
  categories: loadCategories(),  // multiple deferred values
});
```

---

## Step 3: Render with Suspense and Await

In your component, wrap the deferred content with `<Suspense>` and `<Await>`:

```jsx
import { Suspense } from "react";
import { useLoaderData, Await } from "react-router-dom";

function EventsPage() {
  const { events } = useLoaderData();

  return (
    <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
      <Await resolve={events}>
        {(loadedEvents) => <EventsList events={loadedEvents} />}
      </Await>
    </Suspense>
  );
}
```

### Breaking this down:

1. **`useLoaderData()`** — returns the deferred object. `events` is still a promise at this point.
2. **`<Suspense>`** — shows the `fallback` content while waiting for the data.
3. **`<Await resolve={events}>`** — waits for the promise to resolve.
4. **`{(loadedEvents) => ...}`** — a render function that receives the resolved data.

---

## How It All Fits Together

```
User clicks "Events"
    ↓
Loader runs → defer({ events: loadEvents() })
    ↓ (returns immediately with a promise)
Component renders with <Suspense>
    ↓
<Suspense fallback="Loading..."> shown
    ↓ (promise resolves after 2 seconds)
<Await> calls render function with resolved data
    ↓
<EventsList> renders with the loaded events
```

The page appears **immediately** with the fallback. Once data arrives, it seamlessly replaces the fallback.

---

## When defer() Really Shines

`defer` is most powerful with **multiple requests of different speeds**:

```jsx
export function loader() {
  return defer({
    criticalData: await loadCriticalData(),  // ← Await this! Block for critical data
    slowData: loadSlowData(),                // ← Don't await! Load in background
  });
}
```

You can **mix** awaited and deferred values:
- `await loadCriticalData()` — the page won't render until this resolves
- `loadSlowData()` — the page renders immediately, this fills in later

This gives you fine-grained control: show the page when the important stuff is ready, and let the secondary content stream in.

---

## The Complete Pattern

```jsx
// Helper function
async function loadEvents() {
  const response = await fetch("http://localhost:8080/events");
  if (!response.ok) throw json({ message: "Could not fetch events." }, { status: 500 });
  const resData = await response.json();
  return resData.events;
}

// Loader
export function loader() {
  return defer({ events: loadEvents() });
}

// Component
function EventsPage() {
  const { events } = useLoaderData();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Await resolve={events}>
        {(loadedEvents) => <EventsList events={loadedEvents} />}
      </Await>
    </Suspense>
  );
}
```

---

## ✅ Key Takeaways

- `defer()` lets you render a page **before** all data is loaded
- Pass **promises** (not awaited values) to `defer()` for deferred loading
- Use `<Suspense>` for the loading fallback and `<Await>` to wait for the data
- **Must manually parse** responses with `.json()` — can't return raw Response objects with defer
- Mix deferred and awaited values to load critical data first and secondary data later
- `<Await>` takes a render function as children — it receives the resolved data

⚠️ **Common Mistake:** Returning a raw Response object from the helper function. With `defer`, you must parse it yourself with `response.json()` and return the actual data.

💡 **Pro Tip:** `defer` shines on pages with multiple data sources. Await the fast/critical data, defer the slow/secondary data. The user sees a useful page immediately while slower content streams in.
