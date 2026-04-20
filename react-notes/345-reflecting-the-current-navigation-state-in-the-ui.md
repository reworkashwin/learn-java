# Reflecting The Current Navigation State in the UI

## Introduction

We identified the problem: when a loader takes time to fetch data, the user sees **no feedback** that anything is happening. The old page stays on screen, and for all the user knows, their click didn't register. React Router solves this with the `useNavigation` hook, which lets you detect ongoing route transitions and show appropriate loading indicators.

---

## The `useNavigation` Hook

This hook gives you real-time information about the current navigation state of the router:

```jsx
import { useNavigation } from 'react-router-dom';

function RootLayout() {
  const navigation = useNavigation();

  return (
    <>
      <MainNavigation />
      <main>
        {navigation.state === 'loading' && <p>Loading...</p>}
        <Outlet />
      </main>
    </>
  );
}
```

### The `state` Property

`navigation.state` is a string with three possible values:

| State | Meaning |
|---|---|
| `'idle'` | No navigation in progress — everything is stable |
| `'loading'` | A route transition is happening and a loader is running |
| `'submitting'` | A form submission is in progress (covered in later lectures) |

---

## Where to Use It

The key insight: **the loading indicator goes on a component that's already visible**, not on the page you're navigating to. Why? Because the target page hasn't rendered yet — the loader is still running.

The `RootLayout` component is a perfect place because it's always visible during any route transition:

```jsx
function RootLayout() {
  const navigation = useNavigation();

  return (
    <>
      <MainNavigation />
      <main>
        {navigation.state === 'loading' && (
          <div className="loading-bar">Loading...</div>
        )}
        <Outlet />
      </main>
    </>
  );
}
```

### Why Not on the Target Page?

Because the target page doesn't exist yet! The loader runs **before** the page renders. You can't show a loading indicator on a page that hasn't been created. Instead, you show it on whatever's currently visible — typically a persistent layout component.

---

## This vs the Traditional Approach

| Feature | `useEffect` + `useState` | `loader` + `useNavigation` |
|---|---|---|
| Loading indicator location | On the target page (after it renders empty) | On the current page (before transition) |
| Data availability | Must check if data exists | Guaranteed when component renders |
| Loading state management | Manual `useState` | Automatic via `navigation.state` |
| Where code lives | Inside the component | Outside the component (loader + layout) |

---

## Alternative Approaches (Preview)

The simple "Loading..." text works but isn't elegant. Later in the section, you'll learn about:

- **`defer`** — start rendering the page immediately with a loading placeholder, while data streams in
- **`Suspense` + `Await`** — React's built-in patterns for handling async data in the UI

These provide smoother, more polished loading experiences.

---

## ✅ Key Takeaways

- `useNavigation` returns a `navigation` object with a `state` property (`idle`, `loading`, `submitting`)
- Use `navigation.state === 'loading'` to conditionally render a loading indicator
- Place the loading indicator in an **already-visible** component (like a layout), not the target page
- This replaces the need for manual loading state management in individual page components

## ⚠️ Common Mistakes

- Trying to show a loading indicator on the page being navigated to — it doesn't exist yet during the loader phase
- Confusing `useNavigation` (router navigation state) with `useNavigate` (programmatic navigation function) — they're different hooks

## 💡 Pro Tip

For a polished UX, instead of a simple "Loading..." text, consider a thin progress bar at the top of the page (like YouTube's red bar or GitHub's blue bar). Libraries like `nprogress` integrate well with `useNavigation` for this pattern.
