# Preparing the App For Data Fetching

## Introduction

We have our backend running and our React app ready. Now comes the crucial question: how do we actually get the data from the backend into our React components? Before writing any fetching code, we need to understand a fundamental difference between **local data** and **remote data** — and how that changes the way we initialize state.

---

## The Key Difference: Local vs Remote Data

### Local Data (What We Did Before)

With local storage or hardcoded data, values are available **instantly**:

```jsx
const storedPlaces = localStorage.getItem('places');
// ✅ Data is immediately available — synchronous
const [places, setPlaces] = useState(JSON.parse(storedPlaces));
```

You can read the data and pass it directly as the initial state value. No waiting, no delays.

### Remote Data (What We Need Now)

When data comes from a backend server, it's a completely different story:

```
React App → sends HTTP request → travels through the internet → 
Backend receives it → does some work → sends response back → 
Response travels back → React App finally gets the data
```

This process takes **milliseconds to seconds**. The data is simply NOT available when the component first renders.

---

## The Consequence: You Can't Initialize State With Remote Data

A component function executes in one single pass. It doesn't "pause" and wait for data to arrive from a server. This means:

```jsx
// ❌ This WON'T work for remote data
const [availablePlaces, setAvailablePlaces] = useState(fetchFromBackend());
// The fetch hasn't completed yet — we'd get nothing or a Promise
```

### The Solution: Two-Phase Rendering

Instead, you must:

1. **Render first** with empty/default data
2. **Fetch the data** asynchronously
3. **Update state** once data arrives, triggering a re-render

```jsx
// ✅ Start with empty data
const [availablePlaces, setAvailablePlaces] = useState([]);

// Then fetch data and update state when it arrives
// (We'll implement this in the next notes)
```

This is a fundamental pattern in React: **render → fetch → update → re-render**.

---

## Setting Up the Component

In the `AvailablePlaces` component, we prepare for data fetching:

```jsx
import { useState } from 'react';

export default function AvailablePlaces() {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  // TODO: Fetch places from backend and call setAvailablePlaces

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
    />
  );
}
```

The component starts with an empty array. Once the HTTP request returns data, we'll call `setAvailablePlaces(fetchedData)` to update the UI.

---

## Why This Matters

This two-phase approach is not unique to React — it's how **every** frontend framework handles remote data. The browser simply cannot freeze the UI and wait for a server response. Instead:

- The UI renders immediately (possibly showing a loading indicator)
- Data is fetched in the background
- The UI updates when data arrives

This is the foundation for everything else in this module: loading states, error handling, and optimistic updates all build on this core concept.

---

## ✅ Key Takeaways

- Remote data is NOT available instantly — HTTP requests take time
- Component functions execute in one pass and don't wait for async operations
- Initialize state with empty/default values when data comes from a server
- Fetch the data separately, then update state to trigger a re-render
- This "render → fetch → update" pattern is fundamental to React data fetching

## ⚠️ Common Mistake

Don't try to make the component function `async` and `await` the data:

```jsx
// ❌ React does NOT allow async component functions
async function AvailablePlaces() {
  const data = await fetch('/api/places');
  // ...
}
```

React component functions must be synchronous. The asynchronous data fetching happens *inside* the component using different mechanisms (like `useEffect`).
