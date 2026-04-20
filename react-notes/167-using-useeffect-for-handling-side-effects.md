# Using useEffect for Handling (Some) Side Effects

## Introduction

In the previous lecture, we saw how putting a side effect directly in a component function can create an infinite loop. Now it's time to meet the solution: the **`useEffect` hook**. This is one of the most important hooks in React, and understanding how it works — truly understanding it — will save you from countless bugs.

---

## Importing and Using `useEffect`

First, import it from React:

```jsx
import { useEffect } from 'react';
```

Like all hooks, `useEffect` must be called inside your component function — not in a nested function, not conditionally, but directly in the component body.

---

## The Two Arguments of `useEffect`

`useEffect` takes **two arguments**:

### 1. The Effect Function (what to run)

This is an anonymous function that wraps your side effect code:

```jsx
useEffect(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    // sort places by distance...
    setAvailablePlaces(sortedPlaces);
  });
}, []);
```

You move your side effect code — the geolocation fetching, the state update — into this function.

### 2. The Dependencies Array (when to re-run)

The second argument is an array that tells React **when** to re-execute the effect function:

```jsx
useEffect(() => { /* ... */ }, []); // empty array = run once
```

---

## How `useEffect` Breaks the Infinite Loop

Here's the key insight about `useEffect`:

> The effect function runs **after** the component function finishes executing — not during it.

So the flow is:

1. Component function runs → returns JSX
2. React renders the JSX to the DOM
3. **Then** the effect function runs
4. If the effect updates state, the component re-renders
5. But React checks the **dependencies array** before running the effect again

With an **empty dependencies array** `[]`:
- There are no dependencies to change
- So the effect function runs exactly **once** — after the first render
- It never runs again, no matter how many times the component re-renders

This is what breaks the loop. The geolocation code runs once, gets the location, updates state, and that's it.

---

## Putting It All Together

```jsx
function App() {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );
      setAvailablePlaces(sortedPlaces);
    });
  }, []);

  return (
    <Places
      places={availablePlaces}
      fallbackText="Sorting places by distance..."
    />
  );
}
```

The `fallbackText` prop handles the initial empty state while we wait for the location. Once the effect runs and state updates, the sorted places appear.

---

## What Happens If You Omit the Dependencies Array?

If you leave out the second argument entirely:

```jsx
useEffect(() => { /* ... */ }); // NO second argument
```

The effect runs **after every render**. You'd still have an infinite loop! The dependencies array is what gives you control.

---

## ✅ Key Takeaways

- `useEffect` runs its function **after** the component render cycle, not during it
- The **dependencies array** controls when the effect re-runs
- An empty array `[]` means "run once after the first render, never again"
- Omitting the array entirely means "run after every render" — usually not what you want
- `useEffect` does **not** return a value (unlike `useState` or `useRef`)

## ⚠️ Common Mistakes

- Forgetting the dependencies array and accidentally creating an infinite loop anyway
- Confusing "runs after render" with "runs before render" — the effect always runs *after*

## 💡 Pro Tip

Think of `useEffect` as a way of saying: *"After you're done rendering, React, please also do this thing for me."* It's a post-render instruction, not an inline command.
