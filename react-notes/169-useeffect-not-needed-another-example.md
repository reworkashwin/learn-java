# useEffect Not Needed: Another Example

## Introduction

We've established that not every side effect needs `useEffect`. Now let's look at another common scenario where beginners instinctively reach for `useEffect` — but shouldn't. This time it's about **loading data from `localStorage` on app startup**.

---

## The Scenario: Loading Saved Places on App Start

We already save selected places to `localStorage`. Now we want to **load** them when the app starts, so the user sees their previously selected places immediately.

You might think: "I need to load data when the component mounts — that sounds like a `useEffect` with an empty dependency array!"

And yes, you *could* do it with `useEffect`:

```jsx
useEffect(() => {
  const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
  const storedPlaces = storedIds.map((id) =>
    AVAILABLE_PLACES.find((place) => place.id === id)
  );
  setPickedPlaces(storedPlaces);
}, []);
```

This works. But it's **redundant**.

---

## Why `useEffect` Is Overkill Here

The critical difference between `localStorage.getItem()` and `navigator.geolocation.getCurrentPosition()` is that **`localStorage` is synchronous**.

When you call `localStorage.getItem('selectedPlaces')`, the result is available **instantly**. There's no callback, no promise, no delay. The line executes, and you have your data right then and there.

Compare that to geolocation, where you pass a callback function that gets called *sometime in the future*. The component function finishes executing before that callback fires.

Since `localStorage` is synchronous, you can simply **use the data to initialize state**:

```jsx
const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
const storedPlaces = storedIds.map((id) =>
  AVAILABLE_PLACES.find((place) => place.id === id)
);

function App() {
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
  // ...
}
```

---

## Moving Code Outside the Component

Notice how the `localStorage` reading code is placed **outside** the component function. This is intentional and smart:

- It only runs **once** — when the JavaScript file is first parsed
- It doesn't re-run on every component re-render
- It saves performance by avoiding redundant `localStorage` reads
- The result (`storedPlaces`) is still available inside the component function

This works because JavaScript executes top-to-bottom. By the time React calls the `App` function, `storedPlaces` already has its value.

---

## The Decision Framework: Sync vs Async

| Data Source | Timing | Need `useEffect`? |
|-------------|--------|-------------------|
| `localStorage.getItem()` | Synchronous (instant) | ❌ No |
| `navigator.geolocation.getCurrentPosition()` | Asynchronous (delayed) | ✅ Yes |
| `fetch()` API calls | Asynchronous (delayed) | ✅ Yes |
| Reading from a variable or constant | Synchronous (instant) | ❌ No |

If the data is available immediately, just use it directly. No need for the extra `useEffect` dance.

---

## Deleting From localStorage

For completeness, here's how to update `localStorage` when removing a place:

```jsx
function handleRemovePlace() {
  const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
  localStorage.setItem(
    'selectedPlaces',
    JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current))
  );
}
```

This code lives in an event handler, so — as we learned — it doesn't need `useEffect` either.

---

## ✅ Key Takeaways

- **Synchronous** side effects (like `localStorage`) don't need `useEffect` — just read the data directly
- Use synchronous data to **initialize state** via `useState(initialValue)` instead of updating it via `useEffect`
- Move one-time setup code **outside** the component function for better performance
- `useEffect` is for **asynchronous** operations where data isn't available during the initial render

## ⚠️ Common Mistakes

- Using `useEffect` + `setState` for synchronous data that could simply initialize state
- Keeping one-time setup code inside the component function, causing it to run on every render

## 💡 Pro Tip

Every time you're about to write `useEffect(() => { setState(someValue) }, [])`, ask yourself: *"Is `someValue` available synchronously?"* If yes, just pass it as the initial value to `useState`.
