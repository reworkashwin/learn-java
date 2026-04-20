# Transforming Fetched Data

## Introduction

You've fetched data from the backend — great! But often the raw data isn't quite ready for display. You might need to **sort** it, **filter** it, **enrich** it, or **transform** it before handing it to the UI. This note demonstrates how to add data transformation steps between fetching and setting state, using a practical example: sorting places by distance to the user.

---

## The Use Case: Sorting by User Location

Instead of displaying places in whatever order the backend returns them, we want to sort them by **proximity to the user's current location**. That means:

1. Fetch the place data from the backend
2. Get the user's current location (using the browser's Geolocation API)
3. Sort the places by distance
4. *Then* set state with the sorted data

---

## Getting the User's Location

The browser provides `navigator.geolocation.getCurrentPosition()` — an async API that uses a **callback pattern** instead of Promises:

```jsx
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Use the coordinates here
});
```

This function doesn't return a Promise, so you can't `await` it. Instead, you pass a callback that the browser calls once the location is available (which may also involve asking the user for permission).

---

## Combining Fetch + Geolocation + Sort

Here's how all the pieces fit together inside the `useEffect`:

```jsx
useEffect(() => {
  async function fetchPlaces() {
    setIsFetching(true);

    try {
      const response = await fetch('http://localhost:3000/places');
      if (!response.ok) throw new Error('Failed to fetch places.');
      const resData = await response.json();

      // Get user's location, THEN sort and set state
      navigator.geolocation.getCurrentPosition((position) => {
        const sortedPlaces = sortPlacesByDistance(
          resData.places,
          position.coords.latitude,
          position.coords.longitude
        );

        setAvailablePlaces(sortedPlaces);
        setIsFetching(false);  // ← Moved here!
      });
    } catch (error) {
      setError({
        message: error.message || 'Could not fetch places.'
      });
      setIsFetching(false);  // Also set false on error
    }
  }

  fetchPlaces();
}, []);
```

### Key Point: Where to Put `setIsFetching(false)`

This is where things get tricky. Since `getCurrentPosition` uses a callback and not a Promise, we can't `await` it. If we put `setIsFetching(false)` after the `getCurrentPosition` call, it would execute **immediately** — before the callback runs:

```jsx
// ❌ Wrong placement
navigator.geolocation.getCurrentPosition((position) => {
  // This runs later...
  setAvailablePlaces(sortedPlaces);
});
setIsFetching(false);  // This runs immediately! Too early!
```

Instead, `setIsFetching(false)` must go **inside the callback**, after we've finished all the work:

```jsx
// ✅ Correct placement
navigator.geolocation.getCurrentPosition((position) => {
  const sortedPlaces = sortPlacesByDistance(resData.places, ...);
  setAvailablePlaces(sortedPlaces);
  setIsFetching(false);  // Now it's after everything is done
});
```

We also need `setIsFetching(false)` in the catch block for error cases.

---

## The Bigger Lesson: Transform Before Setting State

The specific example here is sorting by distance, but the principle applies broadly. Between fetching raw data and calling `setState`, you can:

- **Sort** — order items by relevance, date, price, distance
- **Filter** — remove items the user doesn't need to see
- **Map/Transform** — reshape data to match your component's needs
- **Combine** — merge data from multiple endpoints
- **Enrich** — add computed properties (like distance calculations)

```jsx
const response = await fetch(url);
const rawData = await response.json();

// Transform the data however you need
const transformedData = processData(rawData);

// THEN set state with the processed result
setState(transformedData);
```

---

## The User Experience Flow

Here's what the user sees with the location-based sorting:

1. Page loads → "Fetching place data..." (loading state)
2. Browser asks "Allow location access?" → still loading
3. User grants permission → location is fetched → places are sorted
4. Places appear, ordered by distance from the user

If the user has already granted permission, steps 2-3 happen automatically and quickly.

---

## ✅ Key Takeaways

- You can (and should) transform fetched data before setting it in state
- Be careful with callback-based APIs like `getCurrentPosition` — they don't work with `await`
- Place `setIsFetching(false)` where execution actually finishes, not just at the bottom of the function
- The pattern is: fetch → transform → setState
- Keep the loading state active through the entire process (fetch + transformation)

## ⚠️ Common Mistake

Putting `setIsFetching(false)` outside a callback function, thinking JavaScript will wait for the callback to complete:

```jsx
navigator.geolocation.getCurrentPosition(callback);
setIsFetching(false);  // ⚠️ Runs BEFORE the callback!
```

JavaScript doesn't wait for callbacks. Move `setIsFetching(false)` inside the callback.

## 💡 Pro Tip

If you want to use `await` with callback-based APIs, you can wrap them in a Promise:

```jsx
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Now you can await it!
const position = await getPosition();
```

This is called "promisifying" a callback-based API.
