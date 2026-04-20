# Finishing Touches

## Introduction

We're in the home stretch of the food ordering app. This lesson ties together everything we've built — the custom HTTP hook, cart context, user progress context, and checkout form — into a polished experience. We handle loading states during order submission, display success messages, clear the cart after checkout, and fix a subtle state issue with the custom hook.

---

## Using the Custom Hook in the Checkout Component

The Checkout component uses `useHttp` differently from Meals — it sends a POST request on demand, not on mount:

```jsx
const requestConfig = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};

export default function Checkout() {
  const { data, isLoading, error, sendRequest, clearData } = useHttp(
    'http://localhost:3000/orders',
    requestConfig
  );
  // ...
}
```

Key difference: since `method` is `'POST'`, the hook's internal `useEffect` won't fire automatically. The request only fires when we explicitly call `sendRequest`:

```jsx
function handleSubmit(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  const customerData = Object.fromEntries(fd.entries());

  sendRequest(
    JSON.stringify({
      order: {
        items: cartCtx.items,
        customer: customerData,
      },
    })
  );
}
```

The data is passed to `sendRequest`, which merges it into the config as the `body`.

---

## Conditional Button Display During Submission

While the order is being sent, we replace the action buttons with a loading message:

```jsx
let actions = (
  <>
    <Button type="button" textOnly onClick={handleClose}>Close</Button>
    <Button>Submit Order</Button>
  </>
);

if (isLoading) {
  actions = <span>Sending order data...</span>;
}

// In the JSX:
<p className="modal-actions">{actions}</p>
```

This pattern — storing JSX in a variable and conditionally reassigning it — is cleaner than inline ternaries for complex conditional content.

---

## Showing Error and Success States

### Error Display

```jsx
{error && <Error title="Failed to submit order." message={error} />}
```

This appears above the action buttons, keeping the user informed while still allowing them to retry.

### Success Modal

When data is returned and there's no error, we show a completely different modal:

```jsx
if (data && !error) {
  return (
    <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleFinish}>
      <h2>Success!</h2>
      <p>Your order was submitted successfully.</p>
      <p>We will get back to you with more details via email within the next few minutes.</p>
      <p className="modal-actions">
        <Button onClick={handleFinish}>Okay</Button>
      </p>
    </Modal>
  );
}
```

This is an early return — if the order succeeded, we render the success modal instead of the checkout form.

---

## Clearing the Cart After Checkout

When the user clicks "Okay" on the success modal, we need to:
1. Hide the checkout modal
2. Clear the cart

### Adding `clearCart` to the Context

```jsx
// In the cart reducer:
if (action.type === 'CLEAR_CART') {
  return { ...state, items: [] };
}

// In the provider:
function clearCart() {
  dispatchCartAction({ type: 'CLEAR_CART' });
}
```

### Using It in the Checkout Component

```jsx
function handleFinish() {
  userProgressCtx.hideCheckout();
  cartCtx.clearCart();
  clearData(); // Reset the hook's data state
}
```

---

## Fixing the Stale Data Bug

Without `clearData`, here's what happens:
1. User submits an order → success modal shows
2. User adds more items and goes to checkout again
3. The **old** success response is still in the hook's `data` state
4. The success modal shows immediately, skipping the form!

The fix: add a `clearData` function to the custom hook:

```jsx
// In useHttp:
function clearData() {
  setData(initialData);
}

return { data, isLoading, error, sendRequest, clearData };
```

Now calling `clearData()` in `handleFinish` resets the state, so the next checkout starts fresh.

---

## ✅ Key Takeaways

- Store conditional JSX in variables when the logic is complex — cleaner than nested ternaries
- Use early returns to render completely different UIs based on state (success vs. form)
- Always reset shared state (cart items, hook data) after completing a flow to prevent stale data
- The custom hook's `clearData` function is essential for components that reuse the hook across multiple submissions
- `CLEAR_CART` in the reducer is trivially simple — just return the state with an empty items array

## ⚠️ Common Mistakes

- Not clearing the hook's `data` state after success — causes the success modal to appear immediately on the next checkout
- Forgetting to clear the cart after checkout — users see stale items in their cart
- Not testing the "second order" flow — many bugs only appear when a feature is used twice

## 💡 Pro Tips

- Always test multi-step flows at least twice (place an order, then try placing another) — this catches stale state bugs
- The pattern of `handleFinish` (clean up multiple states in one function) keeps your cleanup logic centralized and maintainable
