# Project Setup & Route Setup

## Introduction

Time to get hands-on. This section builds on the routing project from the previous section, enhanced with a backend that now supports user creation and login. Let's set up the authentication page and route.

---

## Project Overview

The project is the same events application from the routing section with two key additions:

1. **Enhanced backend API** — now supports user creation, login, and token-based authentication
2. **New components** — an `AuthForm` component and an `Authentication` page (provided but not yet wired up with routes)

### Getting Started

You need **two terminals** running:

```bash
# Terminal 1: Start the backend
cd backend-api
npm install
npm start

# Terminal 2: Start the React frontend
cd frontend
npm install
npm start
```

⚠️ **Common Mistake:** Forgetting to keep the backend server running. You need both servers up simultaneously.

---

## Adding the Auth Route

The authentication page needs its own route. It should be part of the existing layout (with the navigation bar), so it's a **sibling** to the homepage and events routes.

### In `App.js`:

```jsx
import AuthenticationPage from './pages/Authentication';

// Inside your route definitions:
{
  path: 'auth',
  element: <AuthenticationPage />,
}
```

This route sits alongside your existing routes — as a sibling under the root layout route. This way, the main navigation still appears on top.

---

## Adding Navigation Link

In `MainNavigation.js`, add a new entry to the navigation bar:

```jsx
<li>
  <NavLink
    to="/auth"
    className={({ isActive }) => (isActive ? classes.active : undefined)}
  >
    Authentication
  </NavLink>
</li>
```

Now users can navigate to the auth page through the main navigation.

---

## ✅ Key Takeaways

- The auth route is a sibling route under the root layout — it gets the navigation bar like every other page
- Both the backend and frontend servers must be running simultaneously
- The `AuthForm` component handles the UI — we'll add the logic in upcoming lectures

💡 **Pro Tip:** Always go through the routing section first if you haven't already. This project builds directly on those concepts — loaders, actions, nested routes, and error handling.
