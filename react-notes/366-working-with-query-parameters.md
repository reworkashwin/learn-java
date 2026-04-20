# Working with Query Parameters

## Introduction

The auth form has two modes: **login** and **signup**. You could manage this with `useState` — and there's nothing wrong with that. But there's a better approach using **query parameters** (also called search parameters) that unlocks extra capabilities.

---

## What Are Query Parameters?

Query parameters are key-value pairs appended to a URL after a `?`:

```
/auth?mode=login
/auth?mode=signup
```

They don't change the route — you're still on `/auth`. But they carry **extra information** about how that page should behave.

### Why Use Them Instead of State?

With `useState`, the mode lives only in component memory. With query parameters:

- You can **link directly** to the signup page: `/auth?mode=signup`
- The mode is **visible in the URL** — users can bookmark it, share it
- It **survives page reloads** (state doesn't)
- It integrates naturally with React Router's navigation system

---

## Reading Query Parameters with `useSearchParams`

React Router provides the `useSearchParams` hook:

```jsx
import { useSearchParams } from 'react-router-dom';

function AuthForm() {
  const [searchParams] = useSearchParams();

  const isLogin = searchParams.get('mode') === 'login';

  // Now use isLogin to conditionally render...
}
```

The hook returns an array with two elements:

1. **`searchParams`** — an object with a `.get()` method to read parameter values
2. **A setter function** — to programmatically update parameters (we don't need it here)

---

## Switching Modes with a Link

Replace the toggle button with a `<Link>` that sets the query parameter to the opposite mode:

```jsx
import { Link, useSearchParams } from 'react-router-dom';

function AuthForm() {
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get('mode') === 'login';

  return (
    <>
      <h1>{isLogin ? 'Log in' : 'Create a new user'}</h1>
      {/* ... form fields ... */}
      <Link to={`?mode=${isLogin ? 'signup' : 'login'}`}>
        {isLogin ? 'Create new user' : 'Login'}
      </Link>
    </>
  );
}
```

Notice the `to` prop just starts with `?` — this is a **relative link** that stays on the current route and only changes the query parameter.

---

## Setting a Default Mode in Navigation

You can also set the default mode when linking from the main navigation:

```jsx
<NavLink to="/auth?mode=login">Authentication</NavLink>
```

Now clicking "Authentication" in the navbar always opens the form in login mode.

---

## ✅ Key Takeaways

- **Query parameters** are URL-appended key-value pairs (`?mode=login`) that don't change the route
- Use `useSearchParams` hook to **read** the current query parameters
- Use `<Link to="?key=value">` to **set** query parameters without leaving the page
- Query parameters are better than `useState` when the mode should be **shareable, bookmarkable, or URL-visible**
- You can access query parameters outside of components too (in loaders/actions) using `new URL(request.url).searchParams`

💡 **Pro Tip:** Not everything belongs in a query parameter. Use them for UI state that should be reflected in the URL. Things like modal open/close, active tabs, filter selections, and form modes are great candidates.
