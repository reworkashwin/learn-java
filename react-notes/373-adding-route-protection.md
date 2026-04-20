# Adding Route Protection

## Introduction

Hiding buttons is nice UX — but users can still type `/events/new` directly into the address bar and reach the form. The form submission would fail (no token), but it's better to **prevent access entirely**. This is where route protection comes in.

---

## The Problem

Even with conditional UI rendering, **routes are still accessible** by manually entering URLs:

```
localhost:3000/events/new       ← Still reachable without login
localhost:3000/events/:id/edit  ← Still reachable without login
```

The backend would reject the submission, but why let the user reach a page they can't use?

---

## The Solution: A `checkAuthLoader`

Create a loader that checks for a token and redirects if none exists:

```jsx
// util/auth.js
import { redirect } from 'react-router-dom';

export function checkAuthLoader() {
  const token = getAuthToken();

  if (!token) {
    return redirect('/auth');
  }

  return null;
}
```

If there's no token → redirect to the auth page.
If there is a token → return `null` (do nothing, let the route load).

---

## Applying It to Protected Routes

Add this loader to any route that requires authentication:

```jsx
// App.js
import { checkAuthLoader } from './util/auth';

// Protected routes:
{
  path: 'new',
  element: <NewEventPage />,
  action: newEventAction,
  loader: checkAuthLoader,
},
{
  path: ':eventId/edit',
  element: <EditEventPage />,
  action: editEventAction,
  loader: checkAuthLoader,
}
```

Now, navigating to `/events/new` while logged out immediately redirects to `/auth`.

---

## How It Works

1. User types `/events/new` in the address bar
2. React Router runs `checkAuthLoader` before rendering the component
3. No token found → `redirect('/auth')` is returned
4. User lands on the auth page to log in
5. After login, they can now access `/events/new` normally

---

## Alternative: Throw an Error

Instead of redirecting, you could throw an error and show the error page:

```jsx
if (!token) {
  throw json({ message: 'Not authenticated.' }, { status: 401 });
}
```

This depends on your UX preference — redirect to login or show an error page.

---

## ✅ Key Takeaways

- **Loaders run before components render** — they're the perfect place for route guards
- Create a reusable `checkAuthLoader` and apply it to all protected routes
- No token → redirect to auth page (or throw an error)
- This is a **frontend convenience** — backend validation remains the true security layer
- Apply the loader to every route that requires authentication, not just the ones with hidden buttons

💡 **Pro Tip:** Keep your `checkAuthLoader` in a shared utility file. As your app grows, you might add role-based checks (admin vs. user) — having a centralized auth check makes that easy to extend.
