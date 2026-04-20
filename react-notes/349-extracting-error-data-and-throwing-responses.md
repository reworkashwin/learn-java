# Extracting Error Data & Throwing Responses

## Introduction

We know that throwing an error in a loader triggers the nearest `errorElement`. But a generic "something went wrong" message isn't great UX. What if we want to distinguish between a 404 (page not found) and a 500 (server error)? What if we want to show the actual error message from our loader? The key is to **throw Response objects** instead of plain Error objects.

---

## Why Throw Responses Instead of Objects?

When you throw a regular object or an `Error` instance, the error element receives that exact object. But you don't get structured metadata like a status code.

When you throw a **Response object**, React Router adds special structure — including a `status` field that reflects the HTTP status you set. This makes it easy to build generic error handling:

```jsx
export async function loader() {
  const response = await fetch("http://localhost:8080/events");

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch events." }),
      { status: 500 }
    );
  }

  return response;
}
```

---

## Accessing Error Data with useRouteError

React Router provides the `useRouteError` hook to access the thrown error inside your error element:

```jsx
import { useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  // error.status → the status code (e.g., 500)
  // error.data  → the data included in the Response
}
```

### The Shape of the Error Object

The shape depends on **what** you threw:

| What you threw | `error.status` | `error.data` |
|---|---|---|
| A Response object | The status you set | The Response body |
| A regular JS object | `undefined` | N/A — the error IS the object |
| An Error instance | `undefined` | N/A — the error IS the Error |

This is exactly why throwing Responses is preferred — you get that `status` field for free.

---

## Building a Smart Error Page

With `useRouteError`, you can create a single error page that handles multiple scenarios:

```jsx
function ErrorPage() {
  const error = useRouteError();

  let title = "An error occurred!";
  let message = "Something went wrong.";

  if (error.status === 500) {
    title = "An error occurred!";
    message = JSON.parse(error.data).message;
  }

  if (error.status === 404) {
    title = "Not found!";
    message = "Could not find resource or page.";
  }

  return (
    <>
      <MainNavigation />
      <PageContent title={title}>
        <p>{message}</p>
      </PageContent>
    </>
  );
}
```

### Don't Forget JSON.parse!

Since we used `JSON.stringify()` when creating the Response, we need to `JSON.parse()` when reading `error.data` to get back a proper JavaScript object.

---

## 404 Status — The Default for Invalid Routes

React Router automatically uses status `404` when a user navigates to a path that doesn't match any route. So your error page can handle that case without you explicitly throwing a 404 anywhere:

- **Invalid URL** → React Router sets `error.status = 404`
- **Loader failure** → You set `error.status` to whatever you threw (e.g., 500)

---

## ✅ Key Takeaways

- Throw **Response objects** (not plain objects) from loaders for structured error handling
- Use `useRouteError()` in your error element to access the thrown error
- Response errors include a `status` field — perfect for conditional rendering
- React Router sets `status: 404` automatically for unmatched routes
- Remember to `JSON.parse(error.data)` when you used `JSON.stringify()` in the Response

💡 **Pro Tip:** Always include `<MainNavigation />` in your error page so users can navigate away from errors. A dead-end error page is bad UX.
