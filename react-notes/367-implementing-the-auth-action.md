# Implementing the Auth Action

## Introduction

Now it's time to actually send authentication requests to the backend. We'll create a React Router **action** that handles form submission — determining whether to sign up or log in based on the query parameter, sending the request, and handling various response scenarios.

---

## The Action Function

The auth form uses React Router's `<Form>` component, which means we need an **action** function registered on the auth route. This action runs when the form is submitted.

```jsx
// pages/Authentication.js
import { json, redirect } from 'react-router-dom';

export async function action({ request }) {
  // 1. Extract the mode from query parameters
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode') || 'login';

  // 2. Validate the mode
  if (mode !== 'login' && mode !== 'signup') {
    throw json({ message: 'Unsupported mode.' }, { status: 422 });
  }

  // 3. Extract form data
  const data = await request.formData();
  const authData = {
    email: data.get('email'),
    password: data.get('password'),
  };

  // 4. Send the request
  const response = await fetch('http://localhost:8080/' + mode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authData),
  });

  // 5. Handle validation errors (422) or auth failures (401)
  if (response.status === 422 || response.status === 401) {
    return response;
  }

  // 6. Handle unexpected errors
  if (!response.ok) {
    throw json({ message: 'Could not authenticate user.' }, { status: 500 });
  }

  // 7. Success — redirect
  return redirect('/');
}
```

Let's break down each part.

---

## Reading Query Parameters in Actions

You can't use `useSearchParams` in an action — hooks only work in components. Instead, use the browser's built-in `URL` constructor:

```jsx
const searchParams = new URL(request.url).searchParams;
const mode = searchParams.get('mode') || 'login';
```

This gives you the same `searchParams` object with the same `.get()` method.

---

## Dynamic URL Based on Mode

Since the backend has `/signup` and `/login` routes, and our `mode` query parameter is conveniently named "signup" or "login", we can build the URL dynamically:

```jsx
const response = await fetch('http://localhost:8080/' + mode, { ... });
```

### Defending Against Invalid Modes

Users could manually type `?mode=abc` in the URL. Validate it:

```jsx
if (mode !== 'login' && mode !== 'signup') {
  throw json({ message: 'Unsupported mode.' }, { status: 422 });
}
```

---

## Handling Different Response Scenarios

### Validation Errors (422) or Invalid Credentials (401)
```jsx
if (response.status === 422 || response.status === 401) {
  return response;  // Return to the component so we can show errors
}
```

Returning the response makes it available via `useActionData` in the form component.

### Unexpected Errors
```jsx
if (!response.ok) {
  throw json({ message: 'Could not authenticate user.' }, { status: 500 });
}
```

Throwing triggers the nearest error element.

### Success
```jsx
return redirect('/');
```

Redirect the user to the homepage.

---

## Registering the Action

Don't forget to connect the action to the route in `App.js`:

```jsx
import { action as authAction } from './pages/Authentication';

// In route config:
{
  path: 'auth',
  element: <AuthenticationPage />,
  action: authAction,
}
```

---

## ⚠️ Common Mistakes

- **`header` vs `headers`** — It's `headers` (plural) in the fetch config. Using `header` silently fails and the backend won't extract the data correctly
- **Forgetting to register the action** on the route definition — the action won't fire without it
- **Not handling all response status codes** — always handle validation errors gracefully instead of letting them crash the app

---

## ✅ Key Takeaways

- Actions handle form submissions in React Router — they're the counterpart to loaders
- Use `new URL(request.url).searchParams` to read query parameters inside actions (hooks don't work outside components)
- **Return** error responses (422, 401) to show errors in the UI; **throw** for unexpected errors to trigger error pages
- The mode query parameter conveniently maps directly to backend route names (`/login`, `/signup`)
- Always validate user-controlled inputs like query parameters
