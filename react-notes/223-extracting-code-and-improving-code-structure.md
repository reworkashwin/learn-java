# Extracting Code & Improving Code Structure

## Introduction

Our `AvailablePlaces` component works — it fetches data, handles loading, manages errors, and even sorts by location. But the component is getting **crowded**. The actual HTTP request logic is sitting right alongside UI logic, making the file harder to read and the code harder to reuse. Let's fix that by extracting the HTTP logic into a utility module.

---

## The Problem: HTTP Logic Mixed Into Components

Right now, the `fetch` call, response checking, and JSON parsing all live inside the component:

```jsx
// Inside AvailablePlaces.jsx — too much responsibility
const response = await fetch('http://localhost:3000/places');
if (!response.ok) throw new Error('Failed to fetch places.');
const resData = await response.json();
```

If another component needs the same data, you'd copy-paste this code. And if the API URL changes, you'd have to update it in multiple places. That's a maintenance problem waiting to happen.

---

## The Solution: A Utility HTTP Module

Create a separate `http.js` file for all HTTP-related helper functions:

```jsx
// http.js
export async function fetchAvailablePlaces() {
  const response = await fetch('http://localhost:3000/places');

  if (!response.ok) {
    throw new Error('Failed to fetch places.');
  }

  const resData = await response.json();
  return resData.places;
}
```

### What This Function Does

- Sends the GET request to the backend
- Checks for error responses
- Parses the JSON
- Returns just the places array (or throws an error)

The caller doesn't need to know about `response.ok` or `.json()` parsing — those details are encapsulated.

---

## Using It in the Component

Now the component becomes much cleaner:

```jsx
// AvailablePlaces.jsx
import { fetchAvailablePlaces } from '../http.js';

useEffect(() => {
  async function fetchPlaces() {
    setIsFetching(true);

    try {
      const places = await fetchAvailablePlaces();

      navigator.geolocation.getCurrentPosition((position) => {
        const sortedPlaces = sortPlacesByDistance(
          places,
          position.coords.latitude,
          position.coords.longitude
        );
        setAvailablePlaces(sortedPlaces);
        setIsFetching(false);
      });
    } catch (error) {
      setError({ message: error.message || 'Could not fetch places.' });
      setIsFetching(false);
    }
  }

  fetchPlaces();
}, []);
```

### What Changed

- The `fetch`, `response.ok` check, and `.json()` parsing are gone from the component
- Replaced with a single `await fetchAvailablePlaces()` call
- The component now focuses on what it should: **managing state and UI**
- `try-catch` still works because `fetchAvailablePlaces` throws errors

---

## Why This Extraction Matters

### 1. Separation of Concerns
Components handle **UI logic**. Utility modules handle **data access logic**. Each file has a clear purpose.

### 2. Reusability
Need the same places data in another component? Just import `fetchAvailablePlaces`. No code duplication.

### 3. Maintainability
If the API URL changes or you need to add authentication headers, you update **one file**, not every component that fetches places.

### 4. Testability
Utility functions are easy to unit test in isolation. Testing HTTP calls inside components with state and effects is much harder.

---

## ✅ Key Takeaways

- Extract HTTP request logic into separate utility modules (`http.js`)
- Each utility function handles one request: send, validate, parse, return
- Components call the utility function and focus on state management and rendering
- Errors thrown in utility functions are caught by `try-catch` in the component
- This pattern improves reusability, readability, and maintainability

## 💡 Pro Tip

As your app grows, you might organize HTTP functions by domain:

```
utils/
  http/
    places.js    → fetchAvailablePlaces, updateUserPlaces
    users.js     → fetchUser, updateProfile
    orders.js    → createOrder, fetchOrders
```

This keeps related API calls together and makes the codebase navigable.
