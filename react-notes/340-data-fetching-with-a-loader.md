# Data Fetching with a loader()

## Introduction

Up until now, data fetching in React has followed a familiar pattern: render the component, fire off `useEffect`, manage loading/error/data states, and finally display the data. It works, but it's **verbose** and has a fundamental limitation — the data fetching only starts **after** the component renders. React Router v6.4+ introduces a game-changing alternative: **loader functions**. They let you fetch data **before** a component renders, eliminating boilerplate and improving user experience.

---

## The Traditional Approach (and Its Problems)

Here's the typical pattern you're used to:

```jsx
function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      const response = await fetch('http://localhost:8080/events');
      if (!response.ok) {
        setError('Failed to fetch');
      } else {
        const data = await response.json();
        setEvents(data.events);
      }
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return <EventsList events={events} />;
}
```

### What's Wrong with This?

1. **Boilerplate overload** — Three pieces of state, a useEffect, an async function, error handling, loading indicators. This repeats on every page that fetches data.
2. **Late data fetching** — The component must render first, then the effect runs, then the request fires. The component renders in a "loading" state before any data arrives.
3. **Suboptimal UX** — The user sees a blank page or loading spinner while the component and all its children render just to kick off a fetch.

Wouldn't it be better to **start fetching before the component even renders**?

---

## Enter the `loader` Property

React Router lets you add a `loader` function directly to your route definition:

```jsx
{
  path: 'events',
  element: <EventsPage />,
  loader: async () => {
    const response = await fetch('http://localhost:8080/events');
    const resData = await response.json();
    return resData.events;
  }
}
```

### How This Changes Everything

1. **React Router calls the loader** as soon as navigation to this route begins — before the component renders
2. **Whatever you return** from the loader is automatically made available to the component
3. **No `useState`, no `useEffect`** needed for the data fetching itself
4. If the loader returns a promise (which `async` functions do), React Router resolves it automatically

---

## Getting Loader Data in the Component

Use the `useLoaderData` hook to access the data returned by the loader:

```jsx
import { useLoaderData } from 'react-router-dom';

function EventsPage() {
  const events = useLoaderData();

  return <EventsList events={events} />;
}
```

That's it. Compare this to the 25+ lines of the traditional approach. The component is **lean** — it just receives data and renders it. All the fetching logic lives in the loader.

### Promise Resolution is Automatic

Since the loader is `async`, it technically returns a promise. But you don't need to `.then()` or `await` anything when using `useLoaderData` — React Router resolves the promise and gives you the final data.

---

## The Key Insight: Fetch-Then-Render

The traditional approach is **Render-Then-Fetch**: render the component first, then fetch data inside it.

The loader approach is **Fetch-Then-Render**: fetch the data first, then render the component with that data already available.

This means:
- No loading state needed in the component
- No `useEffect` for data fetching
- The component can **trust** that the data exists when it renders

---

## ✅ Key Takeaways

- `loader` is a route-level property that runs **before** the component renders
- Return data from the loader, and it becomes available via `useLoaderData()`
- This eliminates `useState`, `useEffect`, and loading state boilerplate for data fetching
- React Router automatically resolves promises returned by the loader

## ⚠️ Common Mistakes

- Trying to use React hooks (like `useState`) inside a loader — loaders are **not** React components, they're plain functions
- Forgetting that the loader runs before the component — you can't access component state or refs from inside a loader

## 💡 Pro Tip

The loader function receives an object with `request` and `params` properties. You can use `params` to access dynamic route segments (e.g., `params.eventId`) for fetching specific data. We'll explore this in upcoming lectures.
