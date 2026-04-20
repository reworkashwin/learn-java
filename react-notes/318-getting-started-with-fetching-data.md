# Getting Started with Fetching Data

## Introduction

We've been sending cart data to Firebase, but we never **fetch** it back when the app loads. That means every time you reload, your cart is empty — all that carefully synced data goes unused. Time to fix that by building a second thunk action creator: one that fetches data from the backend.

---

## Organizing Thunks in a Separate File

As your slice file grows, it makes sense to extract thunks into their own file. Create a `cart-actions.js` file alongside your `cart-slice.js`:

```
store/
  cart-slice.js      ← reducers & auto-generated actions
  cart-actions.js    ← custom thunk action creators
  ui-slice.js
```

Move `sendCartData` into `cart-actions.js` and add the new `fetchCartData` thunk there too.

---

## Building the fetchCartData Thunk

The structure mirrors `sendCartData` — it's a function that returns an async function:

```js
export const fetchCartData = () => {
  return async (dispatch) => {
    const fetchData = async () => {
      const response = await fetch(firebaseUrl);
      if (!response.ok) throw new Error('Could not fetch cart data!');
      const data = await response.json();
      return data;
    };

    try {
      const cartData = await fetchData();
      dispatch(cartActions.replaceCart(cartData));
    } catch (error) {
      dispatch(uiActions.showNotification({
        status: 'error',
        title: 'Error!',
        message: 'Fetching cart data failed!',
      }));
    }
  };
};
```

### Why the nested `fetchData` function?

By wrapping the fetch logic in a separate async function, we can use `try/catch` around its call. Errors from **any** part of the fetch chain (network failure, bad response, JSON parsing) get caught cleanly.

---

## Using PUT vs POST with Firebase

An important detail: because we used `PUT` (not `POST`) when sending data to Firebase, the data is stored **exactly as we sent it** — same structure, same keys. This means when we fetch it back, we get an object with `items` (an array) and `totalQuantity` — exactly the shape our Redux state expects.

If we had used `POST`, Firebase would have created a list with auto-generated IDs, giving us a different structure that we'd need to transform. Using `PUT` saves us from that headache.

---

## Dispatching fetchCartData on App Load

In `App.js`, add a **separate** `useEffect` for fetching:

```jsx
useEffect(() => {
  dispatch(fetchCartData());
}, [dispatch]);
```

This effect has no real changing dependencies (dispatch is stable), so it runs exactly **once** — when the component first mounts. Perfect for loading initial data.

---

## The Re-Send Bug

After adding this, you'll notice something annoying: when you reload the app, it fetches the cart from Firebase but then **immediately sends it back** to Firebase. Why?

Here's the chain of events:

1. App loads → `fetchCartData` runs → fetches cart from Firebase
2. `replaceCart` is dispatched → cart state in Redux changes
3. The other `useEffect` (which watches `cart` changes) fires → `sendCartData` runs
4. The same data gets sent right back to Firebase

Fetching the cart counts as "changing" the cart in Redux's eyes, which triggers the send effect. We need a way to distinguish between "the cart changed because the user did something" and "the cart changed because we loaded data from the backend."

We'll fix this in the next lecture.

---

## ✅ Key Takeaways

- Fetch data from the backend using thunks, just like sending data
- Organize thunks in a separate `*-actions.js` file to keep your slice files clean
- Using `PUT` with Firebase preserves your data structure, making fetch-and-restore straightforward
- Be careful about cascading effects: changing Redux state in one effect can trigger another effect

## ⚠️ Common Mistakes

- Forgetting that `replaceCart` changes the Redux state, which triggers any `useEffect` that depends on `cart`
- Using a single `useEffect` for both fetching and sending — keep them separate for clarity
- Not handling the case where the fetched data might have missing fields (like an empty cart with no `items` key)

## 💡 Pro Tips

- Always handle fallback values when fetching data: `items: cartData.items || []`
- Separate your "load on mount" effects from your "react to changes" effects — they serve fundamentally different purposes
