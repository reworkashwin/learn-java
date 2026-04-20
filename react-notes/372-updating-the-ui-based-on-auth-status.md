# Updating the UI Based on Auth Status

## Introduction

With login and logout working, the next step is making the UI **react** to the authentication status. Show "Logout" when logged in, "Authentication" when not. Show edit/delete buttons only for authenticated users. The key question: how do you make this reactive across the entire app?

---

## The Problem with Calling `getAuthToken()` Directly

You might think: "Just call `getAuthToken()` in any component that needs to know the auth status."

The problem? That function is called **once** when the component renders. If the token is later removed (via logout), the component **won't re-render** — it has no way of knowing the token changed.

You need a **reactive** solution.

---

## The Solution: A Root Route Loader

Add a **loader** to the root route that checks for the token. Because React Router automatically re-runs loaders when navigation actions occur (like submitting the logout form), every component using that loader data will automatically re-render with the latest value.

### Step 1: Create the Token Loader

```jsx
// util/auth.js
export function tokenLoader() {
  return getAuthToken();
}
```

### Step 2: Add It to the Root Route with an ID

```jsx
// App.js
import { tokenLoader } from './util/auth';

// Root route:
{
  id: 'root',
  path: '/',
  element: <RootLayout />,
  loader: tokenLoader,
  children: [/* ... */],
}
```

The `id: 'root'` is critical — it allows **any** nested route component to access this loader's data using `useRouteLoaderData('root')`.

### Step 3: Use the Token in Components

```jsx
import { useRouteLoaderData } from 'react-router-dom';

function MainNavigation() {
  const token = useRouteLoaderData('root');

  return (
    <nav>
      {!token && (
        <li><NavLink to="/auth?mode=login">Authentication</NavLink></li>
      )}
      {token && (
        <li>
          <Form action="/logout" method="post">
            <button>Logout</button>
          </Form>
        </li>
      )}
    </nav>
  );
}
```

---

## Conditional Rendering Pattern

The token's existence is your boolean flag:
- **Token exists** → user is logged in
- **Token is `undefined`/`null`** → user is not logged in

### Navigation Bar

```jsx
{!token && <li>Authentication link</li>}
{token && <li>Logout button</li>}
```

### "New Event" Button (EventsNavigation)

```jsx
const token = useRouteLoaderData('root');

{token && <Link to="new">New Event</Link>}
```

### Edit/Delete Buttons (EventItem)

```jsx
const token = useRouteLoaderData('root');

{token && (
  <menu>
    <Link to="edit">Edit</Link>
    <button onClick={deleteHandler}>Delete</button>
  </menu>
)}
```

---

## Why This Works Reactively

The magic is in React Router's data pipeline:

1. User clicks "Logout" → `<Form>` submits to `/logout`
2. Logout action clears the token from localStorage
3. React Router re-runs all active loaders, including the root `tokenLoader`
4. `tokenLoader` returns `undefined` (no token in storage)
5. Every component using `useRouteLoaderData('root')` re-renders with the new value
6. UI updates: "Logout" disappears, "Authentication" appears, edit/delete buttons hide

All automatic. No manual state management needed.

---

## ✅ Key Takeaways

- Add a `tokenLoader` to the root route — it makes auth status available to **every** component in the app
- Assign an `id` to the root route so child components can use `useRouteLoaderData('root')`
- React Router **automatically re-evaluates** loaders after actions complete — this makes the auth status reactive
- `token` (truthy) = logged in, `!token` (falsy) = not logged in
- Conditional rendering based on token existence handles: nav items, action buttons, form visibility

⚠️ **Common Mistake:** Hiding UI elements gives a better user experience, but it is NOT security. The backend must always validate the token regardless of what the frontend shows.
