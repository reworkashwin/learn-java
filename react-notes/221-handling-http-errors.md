# Handling HTTP Errors

## Introduction

So far we've handled the happy path: send request, get data, display it. But the real world isn't always happy. Networks go down, servers crash, endpoints get misspelled. If you don't handle errors, your app either shows a permanent spinner or crashes silently. This note covers the **complete error handling pattern** for HTTP requests in React.

---

## Two Types of Failures

When sending HTTP requests, things can fail in two distinct ways:

### 1. Network Failure
The request never reaches the server. Maybe the user lost internet, or the server is completely offline. The `fetch` function itself **throws an error**.

### 2. Error Response
The request reaches the server, but something goes wrong there. The server sends back an error status code (400s or 500s). `fetch` does NOT throw an error for these — it still "succeeds" from a network perspective. You have to check manually.

Both cases need handling.

---

## Implementing Error Handling

Here's the complete pattern using `try-catch` and response checking:

```jsx
const [availablePlaces, setAvailablePlaces] = useState([]);
const [isFetching, setIsFetching] = useState(false);
const [error, setError] = useState();

useEffect(() => {
  async function fetchPlaces() {
    setIsFetching(true);

    try {
      const response = await fetch('http://localhost:3000/places');

      if (!response.ok) {
        throw new Error('Failed to fetch places.');
      }

      const resData = await response.json();
      setAvailablePlaces(resData.places);
    } catch (error) {
      setError({
        message: error.message || 'Could not fetch places, please try again later.'
      });
    }

    setIsFetching(false);
  }

  fetchPlaces();
}, []);
```

### Walking Through the Logic

1. **`response.ok`** — This property is `true` for 200-299 status codes and `false` for 400-599. If it's `false`, we explicitly throw an error to jump to the catch block.

2. **`try { ... }`** — Wraps all code that might fail. This catches:
   - Network failures (fetch itself throws)
   - Our manually thrown error for bad status codes
   
3. **`catch (error) { ... }`** — Handles any error by updating state. We use a fallback message in case `error.message` is undefined.

4. **`setIsFetching(false)` lives outside try-catch** — This is deliberate! The loading state should end regardless of success or failure. If we got an error, we're still not "fetching" anymore.

---

## The Three States of Data Fetching

This is the fundamental pattern you'll use everywhere:

```jsx
const [data, setData] = useState(initialValue);      // The fetched data
const [isFetching, setIsFetching] = useState(false);  // Loading indicator
const [error, setError] = useState();                  // Error state
```

These three pieces of state work together like a state machine:

| State | data | isFetching | error |
|-------|------|------------|-------|
| **Initial** | `[]` | `false` | `undefined` |
| **Loading** | `[]` | `true` | `undefined` |
| **Success** | `[...places]` | `false` | `undefined` |
| **Error** | `[]` | `false` | `{ message: '...' }` |

---

## Rendering Error State in the UI

When an error occurs, show it to the user instead of the normal content:

```jsx
if (error) {
  return <Error title="An error occurred!" message={error.message} />;
}

return (
  <Places
    title="Available Places"
    places={availablePlaces}
    isLoading={isFetching}
    loadingText="Fetching place data..."
    fallbackText="No places available."
  />
);
```

The early return pattern is clean: if there's an error, render the error UI and exit. Otherwise, render the normal component.

---

## Why `setAvailablePlaces` Belongs Inside try

One subtle but important detail — the state update for the data must be **inside** the `try` block:

```jsx
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('...');
  const resData = await response.json();
  setAvailablePlaces(resData.places);  // ✅ Inside try
} catch (error) {
  setError({ message: error.message || 'Fallback message' });
}
setIsFetching(false);  // ✅ Outside try-catch
```

If we put `setAvailablePlaces` outside the `try` block, it would try to access `resData` which doesn't exist if an error occurred — causing a crash.

---

## ✅ Key Takeaways

- HTTP requests can fail two ways: network errors and error status codes
- `fetch` does NOT throw errors for 400/500 responses — check `response.ok` manually
- Use `try-catch` with the async/await pattern for clean error handling
- Always manage three pieces of state: `data`, `isFetching`, and `error`
- Keep `setIsFetching(false)` outside the try-catch block so loading ends regardless of outcome
- Keep data state updates inside the `try` block so they only execute on success
- Provide fallback error messages in case the error object lacks a message

## ⚠️ Common Mistake

Assuming `fetch` throws an error for 404 or 500 responses:

```jsx
// ❌ This catch block won't fire for 404/500 responses!
try {
  const response = await fetch('/api/wrong-endpoint');
  const data = await response.json();  // May fail or return error body
} catch (err) {
  // Only catches network failures, not bad status codes
}
```

Always check `response.ok` explicitly.

## 💡 Pro Tip

The data-loading-error trio is so prevalent that it has a name: the **"request state machine."** Libraries like React Query, SWR, and RTK Query abstract this pattern into hooks like `useQuery` that return `{ data, isLoading, error }` automatically. Understanding the manual approach makes using these libraries much more intuitive.
