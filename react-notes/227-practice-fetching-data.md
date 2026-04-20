# Practice: Fetching Data

## Introduction

We've learned how to fetch available places from the backend and how to add/remove places. But there's one critical piece missing: when the app loads, we never **fetch the user's saved places** from the backend. So even though the backend stores them, the app starts with an empty list every time. Let's fix that.

This is a practice exercise that ties together everything we've learned about HTTP requests, `useEffect`, and state management.

---

## Step 1: Create the Fetch Function

In your `http.js` utility file, the `fetchUserPlaces` function is almost identical to `fetchAvailablePlaces` — you just change the URL endpoint and the error message:

```js
export async function fetchUserPlaces() {
  const response = await fetch("http://localhost:3000/user-places");
  const resData = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch user places.");
  }

  return resData.places;
}
```

Same structure, different endpoint. That's the beauty of reusable patterns.

---

## Step 2: Use `useEffect` to Fetch on Mount

In `App.jsx`, we want to fetch user places **once** when the component first renders. That means `useEffect` with an empty dependency array:

```jsx
useEffect(() => {
  async function fetchPlaces() {
    setIsFetching(true);
    try {
      const places = await fetchUserPlaces();
      setUserPlaces(places);
    } catch (error) {
      setError({ message: error.message || "Failed to fetch user places." });
    }
    setIsFetching(false);
  }

  fetchPlaces();
}, []);
```

Why the inner `async` function? Because `useEffect` callbacks **cannot** be async directly. So we define an async helper inside and invoke it immediately.

---

## Step 3: Manage Loading and Error States

Just like in the `AvailablePlaces` component, we need:

- `isFetching` state — to show a loading indicator
- `error` state — to show an error message if fetching fails

```jsx
const [isFetching, setIsFetching] = useState(false);
const [error, setError] = useState();
```

Then in JSX, pass these to the `Places` component:

```jsx
{error && <Error title="An error occurred!" message={error.message} />}
{!error && (
  <Places
    isLoading={isFetching}
    loadingText="Fetching your places..."
    places={userPlaces}
    // ...
  />
)}
```

---

## Step 4: Verify It Works

Throttle the network to "Slow 3G" in the browser's dev tools to actually see the loading text. On a fast connection, the fetch completes so quickly you might miss it.

To test error handling, intentionally break the URL (add extra characters). You should see the error component render instead of the places list.

---

## The Big Picture

With this in place, the application is now **fully functional**:

- **Load** available places from the backend
- **Fetch** the user's saved places on startup
- **Add** places and persist them
- **Remove** places and persist the deletion

All data is stored on a separate backend, not locally in the browser. Multiple users from around the world could use this app and each would have their own saved places.

---

## ✅ Key Takeaways

- Use `useEffect` with `[]` to fetch data on component mount
- Always manage loading and error states alongside your data state
- The `useEffect` callback cannot be async — define an async helper inside it
- `setIsFetching(false)` goes **after** the try/catch block (not inside try) so it runs regardless of success or failure

## ⚠️ Common Mistakes

- Making the `useEffect` callback itself `async` — this doesn't work because `useEffect` expects either `undefined` or a cleanup function as a return value
- Forgetting to handle the error state in JSX — the user sees a blank screen instead of a helpful message

## 💡 Pro Tip

The pattern of `[data, isLoading, error]` state triplet is so common in React that it's practically a design pattern. Custom hooks (which we'll explore next) are often built to encapsulate exactly this trio.
