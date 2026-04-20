# Error Handling with Custom Errors

## Introduction

Data fetching can fail. Networks go down, APIs return 500s, URLs get mistyped. When we were using `useEffect` and `useState` for fetching, we handled errors manually with state variables. But now with React Router loaders — how do we handle errors? React Router gives us two approaches, and both are worth understanding.

---

## Approach 1: Return Error Data to the Component

The simplest approach is to check the response in your loader and return different data when something goes wrong:

```jsx
export async function loader() {
  const response = await fetch("http://localhost:8080/events");

  if (!response.ok) {
    return { isError: true, message: "Could not fetch events." };
  }

  return response;
}
```

Then in your component, check for that error flag:

```jsx
function EventsPage() {
  const data = useLoaderData();

  if (data.isError) {
    return <p>{data.message}</p>;
  }

  return <EventsList events={data.events} />;
}
```

This works, and the component stays lean. But there's a more powerful alternative.

---

## Approach 2: Throw Errors and Use Error Elements

Instead of returning error data, you can **throw** an error in your loader:

```jsx
export async function loader() {
  const response = await fetch("http://localhost:8080/events");

  if (!response.ok) {
    throw new Error("Could not fetch events.");
  }

  return response;
}
```

When you throw an error inside a loader, something special happens: **React Router renders the closest `errorElement`**.

### What's an Error Element?

Remember when we added an `errorElement` to our root route for 404 pages? That same mechanism handles loader errors too!

```jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,  // ← This catches ALL errors
    children: [
      // ...nested routes
    ],
  },
]);
```

### Error Bubbling

Here's the elegant part: errors **bubble up** through your route hierarchy. If a deeply nested route's loader throws an error, and that route doesn't have its own `errorElement`, the error travels up to the parent route, then the grandparent, all the way to the root — until it finds an `errorElement` to render.

You can add `errorElement` to specific routes for targeted error handling, or rely on a single root-level error element as a catch-all.

```jsx
// Error thrown here...
{ path: "events", loader: eventsLoader }  // No errorElement on this route

// ...bubbles up to here
{ path: "/", errorElement: <ErrorPage /> }  // Caught!
```

---

## Building a Basic Error Page

```jsx
function ErrorPage() {
  return (
    <MainNavigation />
    <PageContent title="An error occurred!">
      <p>Something went wrong.</p>
    </PageContent>
  );
}
```

This same page renders for 404 errors (invalid routes) AND for loader errors — a single component handles both cases.

---

## ✅ Key Takeaways

- **Two approaches:** return error data to the component, or throw errors for React Router to catch
- Thrown errors trigger the nearest `errorElement` in the route hierarchy
- Errors **bubble up** from nested routes to parent routes
- `errorElement` handles both invalid route paths (404s) AND loader errors
- Adding navigation to your error page improves UX — users can navigate away from errors

⚠️ **Common Mistake:** Don't forget that throwing an error replaces the entire page with the error element. If you want to show an inline error message while keeping the rest of the page visible, return error data instead of throwing.
