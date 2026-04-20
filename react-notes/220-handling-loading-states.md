# Handling Loading States

## Introduction

Data fetching works, but there's a user experience problem. Try throttling your network to "Slow 3G" in DevTools and reload the page. What do you see? An empty screen with "No places available" — then suddenly the data appears. That's confusing and unprofessional. Users need **feedback** that something is happening. Enter **loading states**.

---

## The Problem: The Awkward Silence

When a React component starts fetching data, there's a gap between the initial render (with empty data) and the moment the data arrives. During this gap, the user sees... nothing useful. Or worse, a message like "No places available" which is **misleading** — the places aren't unavailable, they just haven't loaded yet.

---

## The Solution: A Dedicated Loading State

We need to track whether data is currently being fetched and show appropriate UI:

```jsx
const [availablePlaces, setAvailablePlaces] = useState([]);
const [isFetching, setIsFetching] = useState(false);

useEffect(() => {
  async function fetchPlaces() {
    setIsFetching(true);  // Start loading

    const response = await fetch('http://localhost:3000/places');
    const resData = await response.json();

    setAvailablePlaces(resData.places);
    setIsFetching(false);  // Done loading
  }
  fetchPlaces();
}, []);
```

### The Three States of Data Fetching

1. **Before fetch starts**: `isFetching = false`, `places = []` → maybe show nothing or a prompt
2. **While fetching**: `isFetching = true`, `places = []` → show "Loading..." or a spinner
3. **After fetch completes**: `isFetching = false`, `places = [...]` → show the actual data

---

## Updating the UI Component

The `Places` component needs to support this loading state. We add `isLoading` and `loadingText` props:

```jsx
function Places({ places, isLoading, loadingText, fallbackText, ... }) {
  return (
    <section>
      <h2>{title}</h2>
      {isLoading && <p className="fallback-text">{loadingText}</p>}
      {!isLoading && places.length === 0 && <p className="fallback-text">{fallbackText}</p>}
      {!isLoading && places.length > 0 && (
        <ul>
          {places.map(place => (
            // render each place
          ))}
        </ul>
      )}
    </section>
  );
}
```

### Three Conditional Branches

| Condition | What Renders |
|-----------|-------------|
| `isLoading` is `true` | Loading text/spinner |
| Not loading, no places | Fallback "No places available" text |
| Not loading, has places | The actual list of places |

### Using It in AvailablePlaces

```jsx
<Places
  title="Available Places"
  places={availablePlaces}
  isLoading={isFetching}
  loadingText="Fetching place data..."
  fallbackText="No places available."
/>
```

---

## Why the Gap Between setIsFetching Calls?

Looking at the code, `setIsFetching(true)` and `setIsFetching(false)` seem to be just three lines apart. But remember — the `await` keyword pauses execution until the response comes back. That pause could be **milliseconds or seconds**:

```jsx
setIsFetching(true);                              // Instant
const response = await fetch('...');              // ⏳ Could take seconds
const resData = await response.json();            // ⏳ Could take more time
setAvailablePlaces(resData.places);               // Instant
setIsFetching(false);                             // Instant
```

During that wait, the component is showing the loading state — exactly what we want.

---

## ✅ Key Takeaways

- Always show a loading indicator while fetching data — never leave the user staring at an empty screen
- Manage loading state with a separate `useState` boolean (`isFetching`)
- Set it to `true` before the request and `false` after the response arrives
- Use conditional rendering to show loading text, fallback text, or actual data based on state
- The `await` keyword creates the actual time gap between the two state updates

## ⚠️ Common Mistake

Setting `isFetching` to `false` only inside the success path. If an error occurs, the loading state would never end, leaving the user with a permanent spinner:

```jsx
// ⚠️ If an error occurs, isFetching stays true forever
try {
  const response = await fetch(url);
  const data = await response.json();
  setData(data);
  setIsFetching(false);  // Only reached on success
} catch (err) {
  // isFetching is still true!
}
```

We'll address this properly in the error handling note.

## 💡 Pro Tip

The pattern of `data + loading + error` states is so common in data fetching that libraries like React Query (TanStack Query) and SWR manage all three automatically for you. For now, learn the manual approach — it builds understanding of what those libraries do under the hood.
