# Using an Action Creator Thunk

## Introduction

We just learned how to handle HTTP states and side effects directly inside a component. It works, but it makes the component fat — lots of dispatching, lots of async logic, lots of responsibility. What if we could move all that heavy lifting elsewhere and keep our components lean?

Enter **thunks** — a powerful Redux pattern that lets you write action creators which return functions instead of plain action objects. This is one of the most important patterns in Redux development.

---

## What Is a Thunk?

A **thunk** is simply a function that **delays an action** until later — until something else finishes first.

In Redux terms, a thunk is an action creator that doesn't immediately return an action object `{ type: '...', payload: ... }`. Instead, it returns **another function** that eventually dispatches one or more actions.

Think of it like placing an order at a restaurant: you don't get your food immediately. The waiter (thunk) takes your order, goes to the kitchen (async work), and eventually brings you the result (dispatches an action).

---

## How Redux Toolkit Supports Thunks

Here's the magic: Redux Toolkit's `dispatch` doesn't only accept plain action objects. If you dispatch a **function**, Redux will automatically **execute that function for you** and pass `dispatch` as an argument.

This means you can write:

```js
dispatch(someFunction(args));
```

Where `someFunction` returns another function — and Redux handles the rest.

---

## Building a Thunk Action Creator

### Step 1: Create the Function

In your `cart-slice.js` (or a separate `cart-actions.js` file):

```js
export const sendCartData = (cart) => {
  return async (dispatch) => {
    // Step 1: Dispatch a "pending" notification
    dispatch(uiActions.showNotification({
      status: 'pending',
      title: 'Sending...',
      message: 'Sending cart data',
    }));

    // Step 2: Define the async request logic
    const sendRequest = async () => {
      const response = await fetch(firebaseUrl, {
        method: 'PUT',
        body: JSON.stringify(cart),
      });
      if (!response.ok) throw new Error('Sending cart data failed.');
    };

    // Step 3: Try the request, dispatch success or error
    try {
      await sendRequest();
      dispatch(uiActions.showNotification({
        status: 'success',
        title: 'Success!',
        message: 'Sent cart data successfully',
      }));
    } catch (error) {
      dispatch(uiActions.showNotification({
        status: 'error',
        title: 'Error!',
        message: 'Sending cart data failed',
      }));
    }
  };
};
```

### Step 2: Dispatch the Thunk from the Component

Now `App.js` becomes incredibly clean:

```jsx
import { sendCartData } from './store/cart-actions';

useEffect(() => {
  if (isInitial) {
    isInitial = false;
    return;
  }
  dispatch(sendCartData(cart));
}, [cart, dispatch]);
```

One dispatch. One line. The component doesn't care about HTTP requests, notifications, or error handling. All the hard work lives in the action creator.

---

## Breaking Down the Pattern

```
sendCartData(cart)                    ← outer function (action creator)
  └── returns async (dispatch) => {  ← inner function (the thunk)
        dispatch(pending)
        try { await sendRequest() }
        dispatch(success or error)
      }
```

1. **Outer function** — receives arguments (like `cart`), returns the inner function
2. **Inner function** — receives `dispatch` from Redux, performs side effects, dispatches real actions

The inner function is where all the async work happens. Since it's just a regular JavaScript function (not a reducer), we can use `async/await`, `fetch`, and any side effects we want.

---

## Why Use Thunks?

| Approach | Pros | Cons |
|----------|------|------|
| Logic in component | Simple, direct | Fat components, repeated logic |
| Thunk action creator | Lean components, reusable logic | Extra abstraction, nested functions |

Neither approach is "wrong." But thunks help you:
- Keep components focused on rendering
- Make async logic reusable across components
- Centralize related actions (notification + HTTP + state update) in one place

---

## ✅ Key Takeaways

- A thunk is an action creator that returns a function instead of an action object
- Redux Toolkit automatically supports thunks — no middleware setup needed
- The returned function receives `dispatch` as a parameter, letting you dispatch multiple actions
- This pattern keeps components lean and moves side-effect logic to Redux files

## ⚠️ Common Mistakes

- Trying to use `async` directly on a reducer — that's still forbidden. Thunks live **outside** the slice
- Forgetting that the thunk returns a function **that returns another function** — the nesting is intentional
- Confusing auto-generated action creators (`cartActions.addItem`) with custom thunks (`sendCartData`) — they serve different purposes

## 💡 Pro Tips

- For larger apps, create a separate `cart-actions.js` file for thunks to keep your slice file clean
- You can dispatch other thunks from within a thunk — they compose naturally
- Think of thunks as "orchestrators" — they coordinate multiple actions and side effects into a single dispatchable unit
