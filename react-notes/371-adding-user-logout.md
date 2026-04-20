# Adding User Logout

## Introduction

Users can log in — but they can't log out. At the moment, the only way to remove the token is through the browser DevTools. Let's add a proper logout mechanism using React Router's action pattern.

---

## The Logout Strategy

Logging out means one thing: **removing the token from localStorage**. There's no backend request needed — we just clear the local state.

You could handle this with a simple `onClick` handler, but let's use the **React Router approach** — a dedicated route with only an action (no component).

---

## Step 1: Create a Logout Action

Create a new file that exports just an action — no component:

```jsx
// pages/Logout.js
import { redirect } from 'react-router-dom';

export function action() {
  localStorage.removeItem('token');
  return redirect('/');
}
```

That's the entire file. No component, no JSX — just a function that clears the token and redirects home.

---

## Step 2: Register the Logout Route

In `App.js`, add a route that has **only an action**, no element:

```jsx
import { action as logoutAction } from './pages/Logout';

// In route config:
{
  path: 'logout',
  action: logoutAction,
}
```

Routes without elements are perfectly valid. They exist solely to handle form submissions or data operations.

---

## Step 3: Add a Logout Button in Navigation

In `MainNavigation.js`, trigger the logout action by wrapping a button in React Router's `<Form>`:

```jsx
import { Form } from 'react-router-dom';

// In the navigation:
<li>
  <Form action="/logout" method="post">
    <button>Logout</button>
  </Form>
</li>
```

When clicked, this submits a form to the `/logout` route, triggering the action that clears the token.

### Why a `<Form>` Instead of `onClick`?

Using `<Form>` integrates with React Router's data pipeline. When the form submits and the action completes:
- React Router re-runs all active loaders
- Components that depend on loader data (like the token) **automatically re-render**
- The UI updates to reflect the logged-out state

An `onClick` handler wouldn't trigger this automatic re-evaluation.

---

## ✅ Key Takeaways

- Logout = removing the token from localStorage + redirecting
- Create a **route with only an action** — no component needed
- Use `<Form action="/logout" method="post">` to trigger the action via React Router's data pipeline
- This approach ensures all loaders re-run after logout, automatically updating the UI
- Routes without elements are a legitimate React Router pattern for data-only operations

💡 **Pro Tip:** The `<Form>` approach is superior to `onClick` for state-changing operations because it integrates with React Router's automatic re-evaluation cycle. Any component using `useLoaderData` or `useRouteLoaderData` will get fresh data after the action completes.
