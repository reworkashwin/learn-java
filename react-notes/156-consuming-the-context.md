# Consuming the Context

## Introduction

We've created context and provided it to our component tree. Now comes the fun part: **consuming** it. This is where components actually read the shared data — directly, without any props passing through intermediate layers.

---

## The `useContext` Hook

The primary way to consume context is React's `useContext` hook. It connects your component to a context and gives you the current value.

```jsx
import { useContext } from 'react';
import { CartContext } from '../store/shopping-cart-context.jsx';

function Cart() {
  const cartCtx = useContext(CartContext);
  
  // Now you have full access to the context value
  const totalPrice = cartCtx.items.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );
  
  return (
    <div>
      {cartCtx.items.length === 0 && <p>No items in cart.</p>}
      {cartCtx.items.map(item => <CartItem key={item.id} {...item} />)}
    </div>
  );
}
```

### How it works:
1. Import `useContext` from React
2. Import your context object (e.g. `CartContext`)
3. Call `useContext(CartContext)` inside your component
4. You get back the current value of the context — whatever was set on the `value` prop of the Provider

---

## The `use` Hook (React 19+)

React 19 introduced a newer alternative: the `use` hook.

```jsx
import { use } from 'react';
import { CartContext } from '../store/shopping-cart-context.jsx';

function Cart() {
  const cartCtx = use(CartContext);
  // ... same usage
}
```

### What's different about `use`?

- **Shorter name** — less to type
- **Can be used inside `if` blocks and loops** — unlike every other React hook

```jsx
// This is valid with `use` (but NOT with `useContext`)
if (showCart) {
  const cartCtx = use(CartContext);
}
```

- **Only available in React 19+** — if you need backward compatibility, stick with `useContext`

For this course (and for maximum compatibility), `useContext` is the recommended choice. But knowing about `use` is valuable for newer projects.

---

## Destructuring the Context Value

Since the context value is an object, you can destructure it for cleaner code:

```jsx
const { items } = useContext(CartContext);

// Now use `items` directly
const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
```

If you set a good default value in `createContext()`, your IDE will even auto-complete the property names inside the destructuring braces.

---

## Why the Default Value in `createContext()` Matters

Remember when we set `{ items: [] }` as the default? That's primarily for **developer experience**:

```jsx
export const CartContext = createContext({
  items: []
});
```

When you type `cartCtx.` in your editor, it suggests `items` as a property. Without the default, you'd get no auto-completion. The default value acts as a type hint for your IDE.

---

## Don't Forget the `value` Prop on Provider

Even with a default value in `createContext()`, you **must** set the `value` prop on your Provider component. Otherwise, React throws an error:

```
Did not add the required value prop to our Context.Provider component.
```

The default in `createContext()` is for auto-completion and edge cases — not a replacement for the Provider's `value` prop.

---

## ✅ Key Takeaways

- **`useContext(MyContext)`** is the standard way to consume context — works in all React versions
- **`use(MyContext)`** is a React 19+ alternative that can be used conditionally (inside `if` blocks)
- Destructure the context value for cleaner code: `const { items } = useContext(CartContext)`
- Set a default value in `createContext()` for better auto-completion
- Context consumption is direct — no props needed in intermediate components

---

## ⚠️ Common Mistake

> Using `use` in a project that targets React 18 or earlier. The `use` hook doesn't exist before React 19. If you're not sure which version you're on, stick with `useContext` — it works everywhere.
