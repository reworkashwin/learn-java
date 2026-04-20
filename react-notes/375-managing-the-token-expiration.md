# Managing the Token Expiration

## Introduction

The automatic logout timer has a flaw: it always resets to 1 hour, even if the token is already 50 minutes old. Let's fix this by tracking the **actual expiration time** and calculating the remaining duration dynamically.

---

## The Flaw Revisited

```
Login at 2:00 PM → Token expires at 3:00 PM
User reloads at 2:50 PM → Timer resets to 1 hour (3:50 PM)
Token actually expires at 3:00 PM → 50 minutes of "dead token" time
```

The backend rejects the token at 3:00 PM, but the frontend doesn't know until 3:50 PM.

---

## Step 1: Store the Expiration Time

When the user logs in, calculate and store the expiration time alongside the token:

```jsx
// In the auth action (Authentication.js):
const resData = await response.json();
const token = resData.token;

// Store the token
localStorage.setItem('token', token);

// Calculate and store expiration (1 hour from now)
const expiration = new Date();
expiration.setHours(expiration.getHours() + 1);
localStorage.setItem('expiration', expiration.toISOString());

return redirect('/');
```

Now localStorage has both:
- `token` — the JWT string
- `expiration` — an ISO date string representing when the token expires

---

## Step 2: Calculate Remaining Duration

Create a helper function that returns how many milliseconds are left before the token expires:

```jsx
// util/auth.js
export function getTokenDuration() {
  const storedExpirationDate = localStorage.getItem('expiration');
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
}
```

### Understanding the Return Value

- **Positive number** → token is still valid (milliseconds remaining)
- **Negative number** → token has expired (past the expiration time)
- **Zero** → token is expiring right now

---

## Step 3: Update `getAuthToken` to Check Expiration

```jsx
// util/auth.js
export function getAuthToken() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    return 'EXPIRED';
  }

  return token;
}
```

If the token exists but has expired, return the special string `'EXPIRED'` instead of the actual token. This signals to the rest of the app that the token is no longer valid.

---

## Step 4: Update the Root Layout Effect

The root layout now handles three cases:

```jsx
// Root.js
import { getTokenDuration } from './util/auth';

useEffect(() => {
  if (!token) {
    return;
  }

  if (token === 'EXPIRED') {
    submit(null, { action: '/logout', method: 'post' });
    return;
  }

  const tokenDuration = getTokenDuration();

  setTimeout(() => {
    submit(null, { action: '/logout', method: 'post' });
  }, tokenDuration);
}, [token, submit]);
```

### The Three Cases

| Scenario | Behavior |
|----------|----------|
| No token | Do nothing |
| Token is `'EXPIRED'` | Immediately trigger logout |
| Valid token | Set timer for the **remaining** duration |

---

## Step 5: Clean Up on Logout

In the logout action, remove the expiration along with the token:

```jsx
// pages/Logout.js
export function action() {
  localStorage.removeItem('token');
  localStorage.removeItem('expiration');
  return redirect('/');
}
```

---

## The Complete Flow

```
1. User logs in
2. Token + expiration stored in localStorage
3. Root layout effect starts timer for remaining duration
4. User navigates normally...
5. User reloads page after 10 min
6. getTokenDuration() calculates: 50 min remaining
7. Timer set for 50 min (not 1 hour!)
8. When timer fires → logout action → token cleared → UI updates
```

---

## ✅ Key Takeaways

- Store the **expiration time** alongside the token in localStorage
- `getTokenDuration()` calculates the **remaining lifetime** by comparing expiration vs. now
- Return `'EXPIRED'` from `getAuthToken()` when the token is past its expiration — this triggers immediate logout
- The root layout timer uses the **actual remaining duration**, not a fixed 1-hour window
- Always clean up both `token` AND `expiration` from localStorage on logout

💡 **Pro Tip:** In production apps, you'd likely use refresh tokens to seamlessly extend sessions without forcing users to log in again. But the fundamental concept — tracking expiration and acting on it — remains the same.

---

## Authentication Section Complete! 🎉

With token expiration management in place, you now have a **complete authentication flow**:

1. **User creation and login** — sending credentials, receiving tokens
2. **Token storage** — saving to localStorage with expiration tracking
3. **Protected requests** — attaching tokens to outgoing API calls
4. **UI updates** — reactively showing/hiding elements based on auth status
5. **Route protection** — preventing access to pages that require authentication
6. **Manual logout** — clearing the token and redirecting
7. **Automatic logout** — expiring tokens after the correct duration
