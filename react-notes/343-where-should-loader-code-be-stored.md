# Where Should loader() Code Be Stored?

## Introduction

We've been writing loader functions directly inside `App.js`, right next to the route definitions. That works, but as your app grows with more routes and more loaders, `App.js` becomes a dumping ground for fetch logic from every page. There's a better pattern — and it's both intuitive and widely adopted.

---

## The Problem: Bloated App.js

Imagine you have 10 pages, each with its own loader. That's 10 async functions stuffed into `App.js`:

```jsx
// App.js — getting out of hand
const router = createBrowserRouter([
  {
    path: 'events',
    element: <EventsPage />,
    loader: async () => {
      const res = await fetch('http://localhost:8080/events');
      const data = await res.json();
      return data.events;
    },
  },
  {
    path: 'users',
    element: <UsersPage />,
    loader: async () => {
      // more fetch logic...
    },
  },
  // ... 8 more loaders
]);
```

This file is now doing too many things. It's defining the route structure AND containing data fetching logic for every page.

---

## The Solution: Co-locate Loaders with Their Pages

The recommended pattern is to **export the loader function from the page component file** where it's used:

```jsx
// pages/Events.js
import { useLoaderData } from 'react-router-dom';
import EventsList from '../components/EventsList';

function EventsPage() {
  const events = useLoaderData();
  return <EventsList events={events} />;
}

export default EventsPage;

// Export the loader from the same file
export async function loader() {
  const response = await fetch('http://localhost:8080/events');
  const resData = await response.json();
  return resData.events;
}
```

Then import it in `App.js` with an alias:

```jsx
// App.js
import EventsPage, { loader as eventsLoader } from './pages/Events';

const router = createBrowserRouter([
  {
    path: 'events',
    element: <EventsPage />,
    loader: eventsLoader,
  },
]);
```

---

## Why This Pattern Works

### 1. Separation of Concerns
`App.js` only cares about **route structure** — which paths map to which components and which loaders. The actual fetching logic stays with the page that needs it.

### 2. Co-location
The data fetching code lives right next to the component that consumes it. When you open `Events.js`, you see both the component and how its data is fetched. No jumping between files.

### 3. Clean App.js
The route configuration stays lean and readable — a clear map of your app's structure without implementation details.

---

## The Naming Convention

The loader function can be named anything, but the common convention is:

- Name it `loader` in the page file (simple and consistent)
- Import it with an alias like `eventsLoader` in `App.js` to avoid naming collisions between multiple loaders

```jsx
import { loader as eventsLoader } from './pages/Events';
import { loader as eventDetailLoader } from './pages/EventDetail';
import { loader as usersLoader } from './pages/Users';
```

---

## ✅ Key Takeaways

- Export loader functions from the **page component file** where they're used
- Import them with aliases in `App.js` and assign to the `loader` property
- This keeps `App.js` focused on routing structure and page files self-contained
- The function name inside the page file doesn't matter — `loader` is conventional

## 💡 Pro Tip

This co-location pattern extends to other route properties too. When we cover `action` functions for form submissions later, the same principle applies — export them from the page file and import them in `App.js`.
