# Adding Automatic Logout

## Introduction

Right now, once you log in, you stay logged in **forever** — or at least until you manually click "Logout." But the backend token expires after 1 hour. After that, the token is invalid but still sitting in localStorage, giving the user a false sense of being authenticated. Let's fix this with automatic logout.

---

## The Problem

The backend creates tokens that expire after 1 hour. After that:
- The token still exists in localStorage
- The UI still shows the user as logged in
- But every protected request will **fail** because the server rejects expired tokens

We need to automatically clear the token and update the UI when it expires.

---

## The Solution: A Timer in the Root Layout

The root layout (`Root.js`) is the **one component** that renders for every route. It's the perfect place to set up an expiration timer.

### Using `useEffect` with `useSubmit`

```jsx
// Root.js
import { useEffect } from 'react';
import { Outlet, useLoaderData, useSubmit } from 'react-router-dom';

function RootLayout() {
  const token = useLoaderData();
  const submit = useSubmit();

  useEffect(() => {
    if (!token) {
      return;
    }

    setTimeout(() => {
      submit(null, { action: '/logout', method: 'post' });
    }, 1 * 60 * 60 * 1000); // 1 hour in milliseconds
  }, [token, submit]);

  return <Outlet />;
}
```

### How It Works

1. When the root layout renders (on app start), the effect runs
2. If there's a token, it starts a **1-hour timer**
3. When the timer fires, it programmatically submits the logout form
4. The logout action clears the token from localStorage
5. React Router re-runs loaders → UI updates to logged-out state

### `useSubmit` — Programmatic Form Submission

`useSubmit` lets you submit forms from code, without user interaction:

```jsx
submit(null, { action: '/logout', method: 'post' });
```

- First argument: form data (`null` here — no data needed)
- Second argument: the action URL and method — same as what the `<Form>` component would send

---

## The Flaw with a Fixed Timer

There's a subtle bug with the approach above. What if:

1. User logs in → timer starts (1 hour)
2. User leaves for 10 minutes
3. User reloads the page → effect runs again → timer resets to 1 hour!

But the token only has **50 minutes** left. The timer is now wrong.

This is fixed in the next lecture by tracking the actual token expiration time.

---

## ✅ Key Takeaways

- Set up automatic logout using `useEffect` + `setTimeout` in the root layout
- Use `useSubmit` to programmatically trigger the logout action
- The root layout is ideal because it's the one component guaranteed to render for all routes
- A fixed 1-hour timer has a flaw — it resets on page reload regardless of when the user actually logged in
- The token dependency on `useEffect` ensures the timer restarts when the token changes

⚠️ **Common Mistake:** Setting up timers without thinking about page reloads. A simple `setTimeout(1 hour)` only works if the user never refreshes the page between login and expiration.
