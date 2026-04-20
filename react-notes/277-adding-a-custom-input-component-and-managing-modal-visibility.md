# Adding a Custom Input Component & Managing Modal Visibility

## Introduction

This is a meaty lesson that covers three interconnected topics: building a reusable Input component, creating a Checkout form with proper validation, and solving a tricky modal synchronization bug involving the Escape key. The common thread is making components **configurable from outside** while maintaining sensible defaults inside.

---

## Conditionally Showing the "Go to Checkout" Button

A small but important UX detail — don't show "Go to Checkout" when the cart is empty:

```jsx
{cartCtx.items.length > 0 && (
  <Button onClick={handleGoToCheckout}>Go to Checkout</Button>
)}
```

The `&&` operator short-circuits: if the left side is falsy, React renders nothing. Simple, clean, and widely used in React for conditional rendering.

---

## Building a Reusable Input Component

Every form input in this checkout has the same structure: a label, an input field, and some shared behavior. Wrapping that into a component eliminates repetition:

```jsx
export default function Input({ label, id, ...props }) {
  return (
    <p className="control">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} required {...props} />
    </p>
  );
}
```

### Key Design Decisions

**`name={id}`** — The `name` attribute is critical for native `FormData` extraction. By defaulting it to `id`, we keep things consistent without requiring an extra prop.

**`required` hardcoded** — In this specific app, every input is always required. Hardcoding it *inside* the component is fine here. For a more generic library, you'd make it configurable.

**`...props` forwarded** — The rest/spread pattern lets the parent set `type`, `placeholder`, `minLength`, or any other attribute without the Input component needing to know about them explicitly.

> Note: `htmlFor` is React's version of the HTML `for` attribute — it has a different name because `for` is a reserved word in JavaScript.

---

## Building the Checkout Component

The Checkout component combines the Modal, Input component, and both contexts:

```jsx
export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const userProgressCtx = useContext(UserProgressContext);

  const cartTotal = cartCtx.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  return (
    <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleClose}>
      <form>
        <h2>Checkout</h2>
        <p>Total Amount: {currencyFormatter.format(cartTotal)}</p>
        
        <Input label="Full Name" type="text" id="name" />
        <Input label="E-Mail Address" type="email" id="email" />
        <Input label="Street" type="text" id="street" />
        
        <div className="control-row">
          <Input label="Postal Code" type="text" id="postal-code" />
          <Input label="City" type="text" id="city" />
        </div>

        <p className="modal-actions">
          <Button type="button" textOnly onClick={handleClose}>Close</Button>
          <Button>Submit Order</Button>
        </p>
      </form>
    </Modal>
  );
}
```

### Important: `type="button"` on the Close Button

Inside a `<form>`, any button without an explicit `type` will default to `type="submit"`. The Close button must have `type="button"` to prevent it from accidentally submitting the form.

---

## Navigating Between Cart and Checkout Modals

When the user clicks "Go to Checkout" in the Cart:

1. `showCheckout()` sets progress to `'checkout'`
2. The Cart modal's `open` prop becomes `false` (progress ≠ 'cart') → it closes
3. The Checkout modal's `open` prop becomes `true` (progress === 'checkout') → it opens

This seamless transition happens because both modals react to the *same* context value.

---

## The Escape Key Synchronization Bug

Here's the problem: pressing Escape closes the dialog natively, but our React state still thinks it's open. Clicking the cart button again won't work because React sees `progress === 'cart'` already set.

### The Fix (Revisited)

We handle the native `onClose` event to sync state:

```jsx
<Modal
  open={userProgressCtx.progress === 'cart'}
  onClose={userProgressCtx.progress === 'cart' ? handleCloseCart : null}
>
```

The conditional handler prevents a chain reaction: when transitioning from cart to checkout, the cart modal closing shouldn't reset the progress to `''` (which would prevent the checkout from opening).

---

## ✅ Key Takeaways

- Build shared Input components to eliminate form repetition — forward remaining props with `...props`
- Use `name={id}` on inputs to enable native `FormData` extraction later
- Always set `type="button"` on non-submit buttons inside forms
- The `&&` operator is the idiomatic React way to conditionally render elements
- When using multiple modals controlled by the same context, be careful about close event handlers interfering with transitions

## ⚠️ Common Mistakes

- Forgetting `type="button"` on Close buttons inside forms — they'll submit the form instead of closing the modal
- Not syncing the native dialog's close state (Escape key) with React's state — causes "frozen" modals
- Passing the `onClose` handler unconditionally, which can reset state during modal-to-modal transitions

## 💡 Pro Tips

- The `htmlFor` + `id` connection between labels and inputs improves accessibility — clicking the label focuses the input
- Hardcoding universal defaults (like `required`) inside shared components is fine for app-specific code — only make everything configurable if you're building a library
