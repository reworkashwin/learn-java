# Showing Error Pages with errorElement

## Introduction

What happens when a user visits a URL that doesn't exist? Right now, React Router shows an ugly default error message. Let's replace that with a proper, user-friendly error page.

---

## The Default Behavior

If you visit `localhost:3000/abc` (an unsupported route), React Router generates an error and displays a default error screen with a technical message. Not exactly the experience you want for your users.

---

## Creating a Custom Error Page

Create an error page component:

```jsx
// pages/Error.js
import MainNavigation from '../components/MainNavigation';

export default function ErrorPage() {
  return (
    <>
      <MainNavigation />
      <main>
        <h1>An error occurred!</h1>
        <p>Could not find this page.</p>
      </main>
    </>
  );
}
```

Note that we include `<MainNavigation />` directly here — we can't rely on the root layout's `<Outlet />` because the error page **replaces** the normal route rendering.

---

## Adding `errorElement` to Route Definitions

Add the `errorElement` property to your route definition:

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,     // ← catches errors for this route and children
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
    ],
  },
]);
```

### How Error Bubbling Works

When React Router can't find a matching route, it generates an error. That error **bubbles up** through the route tree until it finds a route with an `errorElement`.

By adding `errorElement` to the root route (`path: '/'`), we catch:
- 404 errors (visiting URLs that don't exist)
- Any errors thrown by child routes

This is similar to how JavaScript's `try/catch` works — errors bubble up until they're caught.

---

## When Does `errorElement` Activate?

It activates when:

1. **No matching route** — user visits an unsupported URL (404)
2. **A route throws an error** — a page component or its data loader throws an error (we'll see this later)
3. **Any unhandled error** in a child route bubbles up to the parent

---

## Where to Place `errorElement`

You can add `errorElement` at different levels:

```jsx
// On the root route — catches all unhandled errors
{
  path: '/',
  element: <RootLayout />,
  errorElement: <ErrorPage />,      // catches everything
  children: [
    { path: '/products', element: <ProductsPage /> },
  ],
}

// On a specific child route — catches errors just for that route
{
  path: '/products',
  element: <ProductsPage />,
  errorElement: <ProductError />,   // catches only product-related errors
}
```

More specific `errorElement` placements override more general ones for that branch of the route tree.

---

## ✅ Key Takeaways

- Use `errorElement` on route definitions to display custom error pages instead of React Router's default error message
- Errors bubble up the route tree — place `errorElement` on your root route to catch all unhandled errors
- The error page replaces the normal route rendering completely (including layouts)
- This handles 404s (non-existent URLs) and any errors thrown by route components

## ⚠️ Common Mistakes

- Forgetting to include navigation in the error page — since it replaces the layout, you need to add navigation explicitly
- Only adding `errorElement` to child routes but not the root — root-level errors won't be caught

## 💡 Pro Tips

- React Router provides a `useRouteError` hook that gives you access to the error object in your error page — useful for displaying different messages based on the error type (404 vs 500, etc.)
- You can have different error pages for different sections of your app by placing `errorElement` at different levels of the route tree
