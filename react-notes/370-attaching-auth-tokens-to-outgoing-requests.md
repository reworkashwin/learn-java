# Attaching Auth Tokens to Outgoing Requests

## Introduction

You can log in, but the app still crashes when you try to delete or edit events. The reason? Protected backend routes expect a **token** in the request headers. Let's store the token after login and attach it to every request that needs it.

---

## Step 1: Store the Token After Login

In the auth action, after a successful login/signup, extract the token from the response and save it to `localStorage`:

```jsx
// In the auth action (Authentication.js), before the redirect:
const resData = await response.json();
const token = resData.token;

localStorage.setItem('token', token);

return redirect('/');
```

Why `localStorage`?
- It's a **browser API** — and since action functions run in the browser, you have full access to it
- Data persists across page reloads
- It's simple and straightforward for token storage

---

## Step 2: Create a Token Helper Function

Create a utility function for retrieving the token. It may seem like overkill now, but you'll add more logic to it later:

```jsx
// util/auth.js
export function getAuthToken() {
  const token = localStorage.getItem('token');
  return token;
}
```

---

## Step 3: Attach the Token to Protected Requests

Any request to a **protected** backend route needs the token in the `Authorization` header using the `Bearer` format:

```jsx
import { getAuthToken } from '../util/auth';

// In an action that sends a protected request:
const token = getAuthToken();

const response = await fetch('http://localhost:8080/events/' + eventId, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + token,
  },
});
```

### The `Bearer` Format

The header format `Bearer <token>` is a standard convention:
- `Bearer` tells the server this is a token-based authentication scheme
- The space and then the token string follow

This format is what the backend expects — it's not arbitrary.

---

## Where to Add the Token

Add the `Authorization` header to **every action that targets a protected backend route**:

| Action | File | Protected? |
|--------|------|------------|
| Delete event | `EventDetail.js` | ✅ |
| Edit event | `EventForm.js` | ✅ |
| Create event | `EventForm.js` | ✅ |
| Fetch events | `Events.js` | ❌ (public) |
| Fetch single event | `EventDetail.js` | ❌ (public) |

For the event form action (handles both create and edit):

```jsx
const token = getAuthToken();

const response = await fetch(url, {
  method: method,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify(eventData),
});
```

---

## Verifying It Works

1. Log in with valid credentials
2. Open DevTools → Application → Local Storage → you should see your token stored
3. Try deleting, editing, or creating an event — it should work without errors

---

## ✅ Key Takeaways

- Store the token in `localStorage` immediately after successful authentication
- Create a centralized `getAuthToken()` helper to retrieve it — you'll extend this function later
- Attach the token as `Authorization: Bearer <token>` to all protected requests
- Not all routes need the token — only those the backend has protected
- `localStorage` is accessible in actions and loaders because they run in the browser

⚠️ **Common Mistake:** Forgetting to add the `Authorization` header to one of your protected requests. Map out which backend routes require authentication and ensure every corresponding frontend action includes the token.
