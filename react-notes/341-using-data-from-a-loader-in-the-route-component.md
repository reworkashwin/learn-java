# Using Data From A Loader In The Route Component

## Introduction

We've seen how to define a loader and return data from it. Now let's look more closely at **how and where** you can access that data with `useLoaderData`, and how the component becomes dramatically simpler when you delegate data fetching to a loader.

---

## The Simplified Component

With the loader handling data fetching, the EventsPage component becomes remarkably clean:

```jsx
import { useLoaderData } from 'react-router-dom';
import EventsList from '../components/EventsList';

function EventsPage() {
  const events = useLoaderData();
  return <EventsList events={events} />;
}

export default EventsPage;
```

No `useState`. No `useEffect`. No loading checks. No error handling (yet — we'll add that later). Just **receive and render**.

### Why This Works

The loader runs to completion **before** this component renders. By the time React calls this component function, `useLoaderData()` already has the resolved data ready. There's no "loading" state because the data is guaranteed to exist.

---

## You Can Use `useLoaderData` in Child Components Too

Here's something powerful — you're not limited to using `useLoaderData` only in the page component. You can use it in **any child component** rendered by that route:

```jsx
// Inside EventsList component (not the page — a child component)
import { useLoaderData } from 'react-router-dom';

function EventsList() {
  const events = useLoaderData();  // This works!

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>{event.title}</li>
      ))}
    </ul>
  );
}
```

This means you don't have to pass loader data through props at all if you don't want to. The child component can directly access the nearest loader's data.

---

## The "Closest Loader" Rule

`useLoaderData` returns data from the **closest loader** in the route hierarchy — specifically, the loader defined on the route that rendered the current component or its nearest ancestor route.

### Where You CAN Access Loader Data

- The page component for that route ✅
- Any child component rendered by that page ✅
- Any component rendered by a child route ✅

### Where You CANNOT Access Loader Data

- A **parent** route's component ❌

If a loader is defined on a deeply nested route, you **cannot** access its data from a higher-level layout component. Data flows **down**, not up.

```jsx
// Root layout trying to access child route's loader data
function RootLayout() {
  const data = useLoaderData();  // undefined! ❌
  // The loader is on a child route, not this route
}
```

---

## Props vs Direct Hook Usage

You have two design choices:

### Option A: Use loader data in the page, pass via props

```jsx
function EventsPage() {
  const events = useLoaderData();
  return <EventsList events={events} />;
}
```

### Option B: Use loader data directly in the child

```jsx
function EventsList() {
  const events = useLoaderData();
  return <ul>{/* ... */}</ul>;
}
```

Both work. Option A is more explicit (you can see the data flow) and keeps EventsList reusable with props. Option B is more concise but couples EventsList to React Router.

---

## ✅ Key Takeaways

- `useLoaderData` gives you the data returned by the closest route's loader
- It works in the route component AND any child components
- It does NOT work in parent/ancestor route components (data flows down only)
- The component doesn't need loading state — data is guaranteed available

## ⚠️ Common Mistakes

- Using `useLoaderData` in a component that's rendered by a parent route and expecting to get a child route's loader data — it won't work
- Coupling child components to `useLoaderData` when you might want them to be reusable with props elsewhere

## 💡 Pro Tip

If you need loader data from a route that's not the closest one, React Router provides `useRouteLoaderData(routeId)` — which lets you access loader data from a specific named route. You give your route an `id` property and reference it.
