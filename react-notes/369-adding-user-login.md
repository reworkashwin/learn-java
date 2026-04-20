# Adding User Login

## Introduction

Here's the pleasant surprise — if you built the auth action correctly, **login already works**. The same action handles both signup and login because it dynamically routes to the correct backend endpoint based on the `mode` query parameter.

---

## Why It Already Works

The action we created sends requests to different backend endpoints based on the mode:

```jsx
const response = await fetch('http://localhost:8080/' + mode, { ... });
```

- When `mode === 'signup'` → sends POST to `/signup`
- When `mode === 'login'` → sends POST to `/login`

Both endpoints expect the same data format (`email` and `password`), so the same action handles both cases. Switch to login mode, enter valid credentials, and you're redirected on success.

---

## What Happens with Invalid Credentials

The backend returns different error codes:

| Scenario | Status Code | What User Sees |
|----------|-------------|----------------|
| Invalid password | 401 | Error message from `useActionData` |
| Non-existent email | 401 | Error message |
| Valid credentials | 200 + redirect | Redirected to homepage |

The error display logic we added in the previous lecture handles these cases automatically.

---

## The Missing Piece: Tokens

Login works — but we're not doing anything with the **token** the backend sends back. Right now, if you try to delete or edit an event after logging in, the app crashes. Why?

Because those backend routes are **protected** — they require a valid authentication token in the request headers. We haven't stored or attached that token yet.

That's the next step: extracting, storing, and using the token.

---

## ✅ Key Takeaways

- A well-designed action can handle **multiple related operations** (login and signup) through dynamic configuration
- Login and signup use the same form, same action, different backend endpoint
- Just because login succeeds doesn't mean the user is fully authenticated — you must **store and use the token** for protected requests
- The backend is the ultimate gatekeeper — frontend "login" is meaningless without attaching tokens to protected requests
