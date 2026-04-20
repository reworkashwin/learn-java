# More loader() Data Usage

## Introduction

We've established that `useLoaderData` works in the same component and child components. But there's a nuance worth exploring: **where exactly can and can't you use it**, and what's the best architecture for accessing loader data?

---

## Using `useLoaderData` in Child Components

As we saw, you can use `useLoaderData` directly inside a child component:

```jsx
function EventsList() {
  const events = useLoaderData();  // ✅ Works — directly accesses the loader data

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>{event.title}</li>
      ))}
    </ul>
  );
}
```

This works because `EventsList` is rendered as part of the events page route, and `useLoaderData` finds the nearest loader going **up** the route tree from the component's position.

---

## What You CANNOT Do: Access Data from a Higher Level

If you try to use `useLoaderData` in a component that belongs to a **parent** route, you'll get `undefined`:

```jsx
function RootLayout() {
  const events = useLoaderData();
  console.log(events);  // undefined! ❌

  return (
    <>
      <MainNavigation />
      <Outlet />
    </>
  );
}
```

Why? Because the loader is defined on the events child route, not on the root route. Data from a child route's loader isn't accessible to parent route components.

Think of it like scope in programming — inner functions can access outer variables, but outer functions can't access inner variables.

---

## Best Practice: Use Loader Data in the Page Component

While you **can** use `useLoaderData` in child components, the recommended pattern is to use it in the **page component** and pass the data down via props:

```jsx
// Page component — owns the data
function EventsPage() {
  const events = useLoaderData();
  return <EventsList events={events} />;
}

// Child component — receives data via props (reusable)
function EventsList({ events }) {
  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>{event.title}</li>
      ))}
    </ul>
  );
}
```

### Why This Pattern?

- **Reusability**: `EventsList` can be used anywhere — not just in a loader-powered route
- **Clarity**: It's immediately obvious where data comes from when reading the page component
- **Testability**: `EventsList` with props is trivial to test; one tightly coupled to `useLoaderData` requires a router context

---

## ✅ Key Takeaways

- `useLoaderData` works at the same level or below the route with the loader
- It returns `undefined` if used at a higher route level
- Prefer consuming loader data in the page component and passing it down as props
- Direct usage in child components works but reduces reusability

## 💡 Pro Tip

The data access rule is simple: **loaders push data down, never up**. If you find yourself needing loader data in a parent route, consider moving the loader to the parent route instead — or using React context for shared state.
