# Using useEffect with Redux

## Introduction

Here's the elegant solution to the "reducers can't have side effects" problem: **let the reducer update state first, then use `useEffect` to sync that state to the backend**. It's simple, it's clean, and it leverages tools you already know — `useSelector` and `useEffect`.

---

## The Core Idea

Instead of fighting Redux's rules, work *with* them:

1. User clicks "Add to Cart"
2. Action dispatches → reducer transforms state → Redux store updates
3. `useSelector` picks up the new cart state
4. `useEffect` detects the change and sends an HTTP request to the backend

The reducer does its job (transformation). The component does its job (side effects). Everyone stays in their lane.

---

## Implementation

```js
// App.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function App() {
  const cart = useSelector(state => state.cart);

  useEffect(() => {
    fetch('https://your-project.firebaseio.com/cart.json', {
      method: 'PUT',
      body: JSON.stringify(cart)
    });
  }, [cart]);

  return (
    <Layout>
      {/* ... */}
    </Layout>
  );
}
```

Let's break this down:

### `useSelector` Sets Up a Subscription

`useSelector(state => state.cart)` doesn't just read the cart once — it **subscribes** to it. Whenever the cart slice in Redux changes, this component re-renders with the latest cart.

### `useEffect` Reacts to Changes

The dependency array `[cart]` means this effect runs every time `cart` changes. Since `useSelector` gives us the latest cart after every Redux update, the effect fires after every cart modification.

### `PUT` Overwrites the Server Data

Using `PUT` (not `POST`) tells Firebase to **replace** the existing cart with the new one. This is exactly what we want — the server always has the latest version of the cart.

---

## Why This Works So Well

The beauty of this approach is the **order of operations**:

```
Action dispatched
    ↓
Reducer transforms state (pure, sync, side-effect free ✅)
    ↓
Redux store updates
    ↓
useSelector triggers re-render with new state
    ↓
useEffect detects change, sends HTTP request (side effect ✅)
```

Each piece does what it's supposed to do. Reducers stay pure. Side effects stay in components. And the data flows in one direction.

---

## Where to Put This Effect

The example puts it in `App.js` (the root component), but you could put it in *any* component. `App` is a natural choice because:
- It's always mounted (never unmounts during the app lifecycle)
- It's the logical "orchestrator" of the application
- Cart changes should always sync, regardless of which component triggered them

---

## What About Fetching?

This pattern handles **sending** data to the backend. For **fetching** data on load (hydrating the cart from the server), you'd add another `useEffect` that runs once on mount:

```js
useEffect(() => {
  fetch('https://your-project.firebaseio.com/cart.json')
    .then(res => res.json())
    .then(data => dispatch(cartActions.replaceCart(data)));
}, []);
```

But that's covered in upcoming lectures.

---

## The Takeaway Pattern

This is a broadly useful pattern beyond just carts:

```
useSelector → useEffect → side effect
```

Anytime you need to run a side effect in response to Redux state changes, this is your go-to approach. Logging, analytics, localStorage sync, WebSocket messages — all follow this pattern.

---

## ✅ Key Takeaways

- Let reducers transform state first, then sync to the backend with `useEffect`
- `useSelector` subscribes to Redux state — re-renders on every change
- `useEffect` with `[cart]` dependency fires whenever the cart updates
- Use `PUT` to overwrite server data with the latest state
- This approach keeps reducers pure and side effects in components

## ⚠️ Common Mistakes

- Using `POST` instead of `PUT` — creates a new entry on every cart change instead of updating
- Forgetting to add `cart` to the `useEffect` dependency array — the effect won't re-run
- Sending the HTTP request inside the reducer — always use `useEffect` or action creators instead
- Not handling the initial render — `useEffect` also runs when the component first mounts, which may send the empty initial cart to the server (this is addressed later)

## 💡 Pro Tips

- This `useSelector → useEffect` pattern is one of the most practical React-Redux patterns you'll use
- You can add error handling, loading states, and retry logic around the `fetch` call
- For complex sync requirements, consider the action creator (thunk) approach instead — covered in upcoming lectures
- The `useEffect` approach is great for "fire and forget" syncing where you don't need the server's response to update Redux
