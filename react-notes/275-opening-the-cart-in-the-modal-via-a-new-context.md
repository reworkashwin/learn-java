# Opening the Cart in the Modal via a New Context

## Introduction

We have a modal component and a cart context, but how do we *show* the cart when the user clicks the "Cart" button in the header? The challenge is that the button lives in the Header component while the modal lives elsewhere. We need a way to coordinate visibility across unrelated components. The answer: a **second context** dedicated to tracking the user's UI progress (viewing cart, checking out, or doing neither).

---

## Building the Cart Component

The Cart component displays cart items inside a Modal:

```jsx
import { useContext } from 'react';
import Modal from './UI/Modal.jsx';
import CartContext from '../store/CartContext.jsx';
import { currencyFormatter } from '../util/formatting.js';
import Button from './UI/Button.jsx';

export default function Cart() {
  const cartCtx = useContext(CartContext);

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  return (
    <Modal className="cart">
      <h2>Your Cart</h2>
      <ul>
        {cartCtx.items.map((item) => (
          <li key={item.id}>{item.name} - {item.quantity}</li>
        ))}
      </ul>
      <p className="cart-total">{currencyFormatter.format(cartTotal)}</p>
      <p className="modal-actions">
        <Button textOnly>Close</Button>
        <Button>Go to Checkout</Button>
      </p>
    </Modal>
  );
}
```

But there's a problem — the `open` prop on Modal is never set. Without controlling *when* this modal is visible, we're stuck.

---

## Why a Second Context? The User Progress Context

Rather than lifting more state into the App component and drilling props, we create a **UserProgressContext** that tracks where the user is in their journey:

- `''` (empty) — not viewing anything special
- `'cart'` — viewing the cart modal
- `'checkout'` — on the checkout page

```jsx
import { createContext, useState } from 'react';

const UserProgressContext = createContext({
  progress: '',
  showCart: () => {},
  hideCart: () => {},
  showCheckout: () => {},
  hideCheckout: () => {},
});

export function UserProgressContextProvider({ children }) {
  const [userProgress, setUserProgress] = useState('');

  function showCart() { setUserProgress('cart'); }
  function hideCart() { setUserProgress(''); }
  function showCheckout() { setUserProgress('checkout'); }
  function hideCheckout() { setUserProgress(''); }

  const ctx = {
    progress: userProgress,
    showCart,
    hideCart,
    showCheckout,
    hideCheckout,
  };

  return (
    <UserProgressContext.Provider value={ctx}>
      {children}
    </UserProgressContext.Provider>
  );
}

export default UserProgressContext;
```

This is intentionally simpler than the cart context — just `useState` with string values. No reducer needed because the logic is straightforward.

---

## Connecting Everything

### Wrapping the App

Both providers wrap the app's components:

```jsx
function App() {
  return (
    <UserProgressContextProvider>
      <CartContextProvider>
        <Header />
        <Meals />
        <Cart />
      </CartContextProvider>
    </UserProgressContextProvider>
  );
}
```

### Opening the Cart from the Header

```jsx
function Header() {
  const userProgressCtx = useContext(UserProgressContext);

  function handleShowCart() {
    userProgressCtx.showCart();
  }

  return (
    <Button textOnly onClick={handleShowCart}>Cart ({totalCartItems})</Button>
  );
}
```

### Controlling Modal Visibility in Cart

```jsx
<Modal open={userProgressCtx.progress === 'cart'} onClose={handleCloseCart}>
```

The modal opens when progress is `'cart'` and closes when it changes to anything else.

---

## Fixing the Escape Key Bug

When the user presses Escape, the browser closes the `<dialog>` natively — but our React state doesn't know about it. The progress stays at `'cart'`, so clicking the cart button again does nothing (React thinks the modal is already open).

The fix: listen for the native `onClose` event on the dialog and sync our state:

```jsx
// In Modal component
<dialog onClose={onClose}>...</dialog>

// In Cart component
<Modal
  open={userProgressCtx.progress === 'cart'}
  onClose={handleCloseCart}
>
```

### The "Go to Checkout" Edge Case

When clicking "Go to Checkout", the progress changes from `'cart'` to `'checkout'`. This causes the cart modal to close, which fires `onClose`, which calls `hideCart()`, which resets progress to `''` — and the checkout never opens!

The solution: only run `hideCart` if we're actually on the cart screen:

```jsx
<Modal
  open={userProgressCtx.progress === 'cart'}
  onClose={userProgressCtx.progress === 'cart' ? handleCloseCart : null}
>
```

If we've already transitioned to checkout, passing `null` prevents the close handler from firing.

---

## ✅ Key Takeaways

- Multiple contexts are perfectly fine — use separate contexts for separate concerns (cart data vs. UI state)
- Tracking UI progress in context lets any component control what's visible without prop drilling
- The native `<dialog>` fires an `onClose` event when dismissed via Escape — always sync your React state with it
- Conditionally passing event handlers (or `null`) prevents unwanted state resets during transitions

## ⚠️ Common Mistakes

- Forgetting to handle the Escape key — leads to "stuck" modals that can't reopen
- Not including the component (like `<Cart />`) in the JSX tree — the context works but nothing renders
- Unconditionally calling `hideCart` on every modal close, even when transitioning to checkout

## 💡 Pro Tips

- The pattern of using string-based "progress" state to control which modal is active is scalable to any multi-step UI flow
- You can tap into as many contexts as you need in a single component — there's no limit
