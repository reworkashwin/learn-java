# Handling HTTP States & Feedback with Redux

## Introduction

So you're sending HTTP requests from your Redux-powered React app — great! But what happens when a request is in-flight? What about errors? Right now, you're probably just firing and forgetting. That's a problem. Users deserve feedback: "Sending...", "Success!", or "Something went wrong."

In this lesson, we tackle the complete lifecycle of an HTTP request — pending, success, and error — and manage all that state through Redux. We also solve a sneaky bug: preventing the app from overwriting backend data with an empty cart on initial load.

---

## The Problem: No User Feedback

When we dispatch an action that triggers an HTTP request (like sending cart data to Firebase), the user sees... nothing. No loading spinner, no success toast, no error message. That's a poor UX.

We need to track the **status** of our request and display appropriate feedback at each stage.

---

## Option 1: Local State in the Component

The most obvious approach is to use `useState` inside the component:

```jsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

Set these states at various points in your fetch cycle, then conditionally render a `<Notification>` component. **This works fine** — there's nothing wrong with it.

But wait — we already have a Redux UI slice. Why not leverage Redux for this?

---

## Option 2: Managing Notification State in Redux

### Adding Notification to the UI Slice

In your `uiSlice`, add a `notification` property to the initial state:

```js
const uiSlice = createSlice({
  name: 'ui',
  initialState: { notification: null },
  reducers: {
    showNotification(state, action) {
      state.notification = {
        status: action.payload.status,   // 'pending' | 'success' | 'error'
        title: action.payload.title,
        message: action.payload.message,
      };
    },
  },
});
```

Now you have a centralized place to manage notification state — any component can dispatch `showNotification` and any component can read the current notification.

### Dispatching at Each Stage

In `App.js`, where you send cart data inside `useEffect`:

```jsx
// 1. Before the request — PENDING
dispatch(uiActions.showNotification({
  status: 'pending',
  title: 'Sending...',
  message: 'Sending cart data',
}));

// 2. After success
dispatch(uiActions.showNotification({
  status: 'success',
  title: 'Success!',
  message: 'Sent cart data successfully',
}));

// 3. On error (in a catch block)
dispatch(uiActions.showNotification({
  status: 'error',
  title: 'Error!',
  message: 'Sending cart data failed',
}));
```

### Rendering the Notification

In `App.js`, select the notification from Redux and conditionally render it:

```jsx
const notification = useSelector((state) => state.ui.notification);

return (
  <Fragment>
    {notification && (
      <Notification
        status={notification.status}
        title={notification.title}
        message={notification.message}
      />
    )}
    <Layout>...</Layout>
  </Fragment>
);
```

### Catching ALL Errors

A subtle but important point: wrap your entire async logic in a function and use `.catch()` on it. This catches errors from **anywhere** in the chain — not just from an invalid HTTP response:

```jsx
const sendCartData = async () => {
  // dispatch pending...
  const response = await fetch(url, { method: 'PUT', body: JSON.stringify(cart) });
  if (!response.ok) throw new Error('Sending cart data failed');
  // dispatch success...
};

sendCartData().catch((error) => {
  dispatch(uiActions.showNotification({ status: 'error', ... }));
});
```

---

## The Sneaky Bug: Sending Empty Cart on Load

When the app first loads, `useEffect` runs and sends the (empty) cart to Firebase — **overwriting whatever was stored there**. That's disastrous.

### The Fix: A Simple Guard Variable

```jsx
let isInitial = true; // defined OUTSIDE the component

function App() {
  useEffect(() => {
    if (isInitial) {
      isInitial = false;
      return; // skip the first execution
    }
    dispatch(sendCartData(cart));
  }, [cart, dispatch]);
}
```

Why outside the component? Because if you put it inside, it would get re-initialized to `true` on every render. Defined outside, it persists across renders but is only set once when the file is first parsed.

---

## Testing the Error State

Want to see the error notification in action? Temporarily break your Firebase URL (remove `.json` from the end). Add something to the cart and watch the red error bar appear. Then fix the URL and things work again.

---

## ✅ Key Takeaways

- You can manage HTTP request lifecycle states (pending/success/error) in Redux just like any other UI state
- Local component state (`useState`) is also perfectly valid for this — pick what fits your app
- Always catch errors from the entire async chain, not just from response status checks
- Use a guard variable **outside** the component to prevent `useEffect` from running unwanted logic on first render

## ⚠️ Common Mistakes

- Using `useState` instead of `useSelector` (easy typo that causes confusing errors)
- Forgetting that `dispatch` should be in the `useEffect` dependency array (it won't cause re-runs, but ESLint expects it)
- Not handling the initial load case, which silently overwrites backend data with an empty state

## 💡 Pro Tips

- The `Notification` component can use the `status` prop to apply different CSS classes (green for success, red for error, yellow for pending)
- `dispatch` from `useDispatch()` is stable — React Redux guarantees it never changes, so it's safe in dependency arrays
