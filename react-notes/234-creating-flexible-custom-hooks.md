# Creating Flexible Custom Hooks

## Introduction

Our `useFetch` hook is working in both `App.jsx` and `AvailablePlaces.jsx`. But `AvailablePlaces` has a twist: it doesn't just fetch data — it also **sorts places by distance** using the browser's Geolocation API. That sorting logic was inside the old `useEffect`, and we need to bring it back without breaking our generic hook.

The solution? We don't change the hook at all. We change what we **pass** to it.

---

## The Strategy: A Wrapper Function

Instead of passing `fetchAvailablePlaces` directly to `useFetch`, we create a new function that:

1. Calls `fetchAvailablePlaces` to get the raw data
2. Gets the user's position via `navigator.geolocation`
3. Sorts the places by distance
4. Returns the sorted result

```js
async function fetchSortedPlaces() {
  const places = await fetchAvailablePlaces();

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        places,
        position.coords.latitude,
        position.coords.longitude
      );
      resolve(sortedPlaces);
    });
  });
}
```

### Why the `new Promise()` wrapper?

`navigator.geolocation.getCurrentPosition` is callback-based, not promise-based. But `useFetch` expects the fetch function to return a promise (because it `await`s the result). So we **promisify** the geolocation call:

1. Create a new `Promise`
2. Inside it, call `getCurrentPosition`
3. When we have the position, sort the places and call `resolve(sortedPlaces)`

This is a standard JavaScript pattern for converting callback-based APIs into promise-based ones. It's not React-specific at all.

### Now use it:

```jsx
const {
  isFetching,
  error,
  fetchedData: availablePlaces,
} = useFetch(fetchSortedPlaces, []);
```

The hook doesn't know or care that sorting is happening. It just calls the function, waits for the result, and manages the state. **That's the beauty of flexible hooks.**

---

## The Power of This Pattern

Notice what we achieved:

| Component | Fetch Function | What It Does |
|-----------|---------------|-------------|
| `App.jsx` | `fetchUserPlaces` | Simple fetch |
| `AvailablePlaces.jsx` | `fetchSortedPlaces` | Fetch + sort by distance |

Same hook. Different behaviors. All configured through the function parameter.

The hook is a **generic engine**. The fetch function is the **specific fuel** you pour into it.

---

## The Finished Application

With this in place, the entire application works:

- Fetch and display available places (sorted by distance)
- Fetch and display user's saved places
- Add places (persist to backend)
- Remove places (persist to backend)

All powered by a single reusable `useFetch` hook.

---

## ✅ Key Takeaways

- Custom hooks don't need to handle every edge case — make them **generic** and let callers customize behavior through parameters
- **Promisifying** callback-based APIs (like `navigator.geolocation`) lets them integrate with promise-based hooks
- The same hook can power vastly different behaviors by accepting different functions

## ⚠️ Common Mistakes

- Trying to add sorting/transformation logic inside the generic `useFetch` hook — that defeats the purpose of making it generic
- Forgetting that `navigator.geolocation.getCurrentPosition` is callback-based and trying to `await` it directly

## 💡 Pro Tip

This "wrapper function" pattern is incredibly powerful. Whenever your hook needs slightly different behavior in different components, don't add special-case parameters to the hook. Instead, wrap the base function with extra logic and pass the wrapper to the hook. This keeps the hook simple and the customization explicit.
