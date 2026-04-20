# Using Redux Data in React Components

## Introduction

The store is created and provided. Now comes the exciting part — actually **reading data from the Redux store** inside a React component. This is where `useSelector` comes in, one of the most important hooks from the `react-redux` library.

---

## The `useSelector` Hook

`useSelector` is a custom hook provided by `react-redux` that lets you extract (select) data from the Redux store.

```jsx
import { useSelector } from 'react-redux';

const Counter = () => {
  const counter = useSelector((state) => state.counter);

  return (
    <div>
      <h1>Redux Counter</h1>
      <div>{counter}</div>
    </div>
  );
};
```

### How It Works

1. You pass a **selector function** to `useSelector`
2. This function receives the **entire Redux state** as its argument
3. You return the **specific piece of state** you want
4. `useSelector` returns that value to your component

The selector function `(state) => state.counter` says: "From the entire Redux state object, give me just the `counter` property."

---

## Why Not Just Get the Whole State?

In a real application, your Redux state might look like:

```js
{
  counter: 42,
  isAuthenticated: true,
  theme: 'dark',
  cart: { items: [...], total: 99.99 },
  notifications: [...]
}
```

You don't want every component re-rendering when *any* piece of state changes. `useSelector` lets you grab **only the slice you need**, and your component only re-renders when *that specific slice* changes.

---

## Automatic Subscriptions

Here's the magic: when you use `useSelector`, React-Redux automatically:

1. **Sets up a subscription** to the Redux store for this component
2. **Re-renders the component** whenever the selected data changes
3. **Cleans up the subscription** if the component unmounts

You don't need to manually subscribe or unsubscribe. It's all handled for you.

This means your component is **reactive** — whenever the counter changes in the Redux store (because some action was dispatched somewhere), this component automatically gets the new value and re-renders.

---

## Using `useSelector` Multiple Times

You can call `useSelector` multiple times in the same component to extract different pieces of state:

```jsx
const counter = useSelector((state) => state.counter);
const isVisible = useSelector((state) => state.showCounter);
```

Each call creates its own subscription. The component re-renders if *any* of the selected values change.

---

## The Alternative: `useStore`

There's also a `useStore` hook that gives you direct access to the store object. But `useSelector` is almost always preferred because:
- It's more targeted (you select exactly what you need)
- It handles re-rendering automatically based on your selection
- It's more performance-friendly

---

## ✅ Key Takeaways

- `useSelector` extracts specific data from the Redux store
- Pass it a function: `(state) => state.someProperty`
- It automatically subscribes the component to store changes
- The component re-renders only when the selected data changes
- Subscriptions are cleaned up automatically on component unmount
- You can call `useSelector` multiple times for different state slices

## ⚠️ Common Mistake

Selecting the entire state object when you only need one property. This causes unnecessary re-renders because your component will update whenever *anything* in the state changes, not just the data you care about.
