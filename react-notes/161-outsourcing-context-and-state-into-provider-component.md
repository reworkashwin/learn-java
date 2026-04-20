# Outsourcing Context & State Into a Separate Provider Component

## Introduction

Our context works perfectly — but there's a structural problem. All the state management logic, all the update functions, and the context value construction are sitting inside the `App` component. For one context, that's manageable. But imagine having 3-4 contexts for auth, theme, cart, and notifications. `App` would become an unreadable monster.

The solution? **Extract context + state into a dedicated provider component.**

---

## The Problem with Keeping Everything in App

```jsx
// App.jsx — this is getting bloated
function App() {
  const [shoppingCart, setShoppingCart] = useState({ items: [] });

  function handleAddItemToCart(id) { /* 15 lines of logic */ }
  function handleUpdateCartItemQuantity(productId, amount) { /* 20 lines of logic */ }

  const ctxValue = {
    items: shoppingCart.items,
    addItemToCart: handleAddItemToCart,
    updateItemQuantity: handleUpdateCartItemQuantity,
  };

  return (
    <CartContext.Provider value={ctxValue}>
      <Header />
      <Shop>...</Shop>
    </CartContext.Provider>
  );
}
```

Now multiply this by multiple contexts. The `App` component becomes a dumping ground for all shared state. That's not scalable.

---

## The Solution: A Custom Provider Component

Move the state and context value construction into a **separate component** in the same file as your context:

```jsx
// store/shopping-cart-context.jsx
import { createContext, useState } from 'react';
import { DUMMY_PRODUCTS } from '../dummy-products.js';

export const CartContext = createContext({
  items: [],
  addItemToCart: () => {},
  updateItemQuantity: () => {},
});

export function CartContextProvider({ children }) {
  const [shoppingCart, setShoppingCart] = useState({ items: [] });

  function handleAddItemToCart(id) {
    // ... all the state update logic
  }

  function handleUpdateCartItemQuantity(productId, amount) {
    // ... all the state update logic
  }

  const ctxValue = {
    items: shoppingCart.items,
    addItemToCart: handleAddItemToCart,
    updateItemQuantity: handleUpdateCartItemQuantity,
  };

  return (
    <CartContext.Provider value={ctxValue}>
      {children}
    </CartContext.Provider>
  );
}
```

### What changed:

1. State (`useState`) moved from `App` into `CartContextProvider`
2. Update functions moved along with it
3. Context value construction moved too
4. The provider component accepts `children` and wraps them with the Context.Provider

---

## Using It in App

Now `App` becomes beautifully lean:

```jsx
// App.jsx
import { CartContextProvider } from './store/shopping-cart-context.jsx';

function App() {
  return (
    <CartContextProvider>
      <Header />
      <Shop>...</Shop>
    </CartContextProvider>
  );
}
```

No state management. No functions. No context value construction. Just clean component rendering.

---

## Why This Pattern Matters

### Separation of Concerns
Each context file is self-contained: it creates the context, manages the state, and provides the value. Everything related to "shopping cart data" lives in one file.

### Scalability
Need a second context for authentication? Create `auth-context.jsx` with its own `AuthContextProvider`. In `App`, just nest them:

```jsx
<AuthContextProvider>
  <CartContextProvider>
    <Header />
    <Shop>...</Shop>
  </CartContextProvider>
</AuthContextProvider>
```

### Testability
You can test the provider component in isolation — wrap a test component with it and verify behavior.

---

## ✅ Key Takeaways

- **Extract** state + context logic into a custom provider component (e.g., `CartContextProvider`)
- Export **both** the context object and the provider component from the same file
- The provider component accepts `children` and wraps them with `Context.Provider`
- `App` stays lean — it just nests provider components around the content
- This pattern scales beautifully for apps with multiple contexts

---

## 💡 Pro Tip

> This is the pattern used in production React apps. Whenever you create a context, create a corresponding provider component in the same file. It's a habit that keeps your codebase organized from day one.
