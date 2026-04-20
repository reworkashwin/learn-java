# Exposing Nested Functions From The Custom Hook

## Introduction

Our `useFetch` hook can fetch data and return `isFetching`, `error`, and `fetchedData`. But what if a component needs to **modify** the fetched data after it's been loaded? For example, when the user adds or removes a place, we need to update the `userPlaces` state — but that state now lives inside the hook. How do we give the component access to update it?

---

## The Problem

In `App.jsx`, the `handleSelectPlace` and `handleRemovePlace` functions need to update the user's list of places. Before the custom hook, we had `setUserPlaces` directly in the component. Now that state is managed inside `useFetch`, the component can't call `setUserPlaces` anymore.

---

## The Solution: Expose the State Updater

Custom hooks can return **anything** — not just state values. They can also expose state-updating functions:

```js
export function useFetch(fetchFn, initialValue) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();
  const [fetchedData, setFetchedData] = useState(initialValue);

  useEffect(() => { /* ... */ }, [fetchFn]);

  return {
    isFetching,
    fetchedData,
    setFetchedData,  // ← Expose the updater!
    error,
  };
}
```

Now in the component:

```jsx
const {
  isFetching,
  error,
  fetchedData: userPlaces,
  setFetchedData: setUserPlaces,  // alias it
} = useFetch(fetchUserPlaces, []);
```

The component can now call `setUserPlaces(newPlaces)` to update the state that lives inside the hook.

---

## But Wait — Does Updating State in One Component Affect Others?

Great question. If `App.jsx` and `AvailablePlaces.jsx` both use `useFetch`, and `App.jsx` calls `setUserPlaces` — does the available places list change too?

**No.** Absolutely not.

Every time you use a custom hook, **a completely independent copy** is created. Each component gets its own:
- `isFetching` state
- `error` state
- `fetchedData` state
- `setFetchedData` function

This is exactly how `useState` works too. If ten components all call `useState(0)`, they each get their own independent counter. Custom hooks work the same way.

Think of it like a **cookie cutter** — the hook defines the shape, but each usage creates a completely separate cookie.

---

## A Note About `useCallback` Dependencies

After exposing `setFetchedData` as `setUserPlaces`, you might see a warning that it should be added to the `useCallback` dependency array in `handleRemovePlace`:

```jsx
const handleRemovePlace = useCallback(async function handleRemovePlace() {
  // ... uses setUserPlaces
}, [userPlaces, setUserPlaces]);  // ← add setUserPlaces
```

Technically, React **guarantees** that state updating functions (from `useState`) never change identity. So adding `setUserPlaces` won't cause any behavioral difference. But the linting tool doesn't know that `setUserPlaces` refers to a state updater — it just sees a destructured property from an object. Adding it silences the warning.

---

## ✅ Key Takeaways

- Custom hooks can expose **state updaters**, not just state values
- Each component gets an **independent copy** of the hook's state — updating in one component doesn't affect another
- You can alias destructured properties for cleaner code: `setFetchedData: setUserPlaces`

## ⚠️ Common Mistakes

- Assuming that shared hooks mean shared state — each usage is fully independent
- Exposing the raw `setFetchedData` when you should add validation — consider wrapping it in a custom function if needed

## 💡 Pro Tip

If you want to restrict how the state can be modified, expose a **custom function** instead of the raw setter:

```js
function addItem(item) {
  setFetchedData(prev => [...prev, item]);
}
return { addItem }; // instead of { setFetchedData }
```

This gives you more control and better API design for your hook.
