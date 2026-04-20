# Time to Practice: Solution

## Introduction

Let's walk through the complete solution for the routing practice exercise, step by step. Each task builds on the previous one, so follow along in order.

---

## Task 1: Install react-router-dom

```bash
cd react-frontend
npm install react-router-dom
```

Nothing fancy — just installing the package.

---

## Task 2: Create Page Components

Create a `pages/` folder in `src/` and add these files:

```jsx
// pages/Home.js
export default function HomePage() {
  return <h1>HomePage</h1>;
}

// pages/Events.js
export default function EventsPage() {
  return <h1>EventsPage</h1>;
}

// pages/EventDetail.js
export default function EventDetailPage() {
  return <h1>EventDetailPage</h1>;
}

// pages/NewEvent.js
export default function NewEventPage() {
  return <h1>NewEventPage</h1>;
}

// pages/EditEvent.js
export default function EditEventPage() {
  return <h1>EditEventPage</h1>;
}
```

Simple placeholder components — the real content comes later.

---

## Task 3: Set Up Route Definitions

In `App.js`:

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:eventId', element: <EventDetailPage /> },
      { path: 'events/new', element: <NewEventPage /> },
      { path: 'events/:eventId/edit', element: <EditEventPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

### Smart Path Resolution

Notice that `events/new` and `events/:eventId` coexist. You might worry that `/events/new` matches the dynamic route (treating "new" as an eventId). React Router is **smart enough** to prefer the more specific path (`events/new`) over the dynamic one. Order doesn't matter.

---

## Task 4: Add Root Layout

```jsx
// pages/Root.js
import { Outlet } from 'react-router-dom';
import MainNavigation from '../components/MainNavigation';

export default function RootLayout() {
  return (
    <>
      <MainNavigation />
      <main>
        <Outlet />
      </main>
    </>
  );
}
```

`<Outlet />` is the placeholder where child route content renders.

---

## Task 5: Add Working Links

In `MainNavigation.js`, replace anchor tags with `Link`:

```jsx
import { Link } from 'react-router-dom';

// ...
<Link to="/">Home</Link>
<Link to="/events">Events</Link>
```

Using absolute paths here so links always navigate to the correct destination regardless of the current page.

---

## Task 6: Highlight Active Links

Upgrade `Link` to `NavLink`:

```jsx
import { NavLink } from 'react-router-dom';

<NavLink to="/" end className={({ isActive }) =>
  isActive ? classes.active : undefined
}>
  Home
</NavLink>

<NavLink to="/events" className={({ isActive }) =>
  isActive ? classes.active : undefined
}>
  Events
</NavLink>
```

The `end` prop on the Home link prevents it from being active on every page.

---

## Task 7: Display Events with Links

```jsx
// pages/Events.js
import { Link } from 'react-router-dom';

const DUMMY_EVENTS = [
  { id: 'e1', title: 'Some event' },
  { id: 'e2', title: 'Another event' },
];

export default function EventsPage() {
  return (
    <ul>
      {DUMMY_EVENTS.map((event) => (
        <li key={event.id}>
          <Link to={event.id}>{event.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

Using **relative paths** (`event.id` instead of `/events/${event.id}`) — they append to the current route path.

---

## Task 8: Show Event ID

```jsx
// pages/EventDetail.js
import { useParams } from 'react-router-dom';

export default function EventDetailPage() {
  const params = useParams();

  return (
    <div>
      <h1>Event Detail</h1>
      <p>Event ID: {params.eventId}</p>
    </div>
  );
}
```

---

## Bonus Task: Nested Layout Route

Create a layout wrapper specifically for event-related routes:

```jsx
// pages/EventsRoot.js
import { Outlet } from 'react-router-dom';
import EventsNavigation from '../components/EventsNavigation';

export default function EventsRootLayout() {
  return (
    <>
      <EventsNavigation />
      <Outlet />
    </>
  );
}
```

Then restructure routes in `App.js`:

```jsx
{
  path: '/',
  element: <RootLayout />,
  children: [
    { index: true, element: <HomePage /> },
    {
      path: 'events',
      element: <EventsRootLayout />,
      children: [
        { index: true, element: <EventsPage /> },
        { path: ':eventId', element: <EventDetailPage /> },
        { path: 'new', element: <NewEventPage /> },
        { path: ':eventId/edit', element: <EditEventPage /> },
      ],
    },
  ],
}
```

And fix the links in `EventsNavigation.js`:

```jsx
import { NavLink } from 'react-router-dom';

<NavLink to="/events" end className={({ isActive }) => ...}>
  All Events
</NavLink>
<NavLink to="/events/new" className={({ isActive }) => ...}>
  New Event
</NavLink>
```

---

## ✅ Key Takeaways

- Route definitions use an object-based structure with `createBrowserRouter`
- Layout routes use `<Outlet />` to render child content
- React Router smartly resolves conflicts between static and dynamic paths
- Nested layout routes add section-specific UI (like sub-navigation) around groups of routes
- Relative paths on child routes and links keep things maintainable

## 💡 Pro Tip

The nested layout pattern (EventsRootLayout wrapping event routes) is extremely powerful. It lets you add section-specific navigation, sidebars, or context providers that only apply to a subset of your routes — without affecting the rest of the app.
