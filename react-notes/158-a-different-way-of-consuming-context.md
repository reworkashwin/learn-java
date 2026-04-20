# A Different Way Of Consuming Context

## Introduction

You've learned that `useContext` is the standard way to consume context. But there's an older alternative that you may encounter in existing codebases: the **Consumer component**. Let's understand it so you recognize it when you see it — but also understand why you probably shouldn't use it.

---

## The Consumer Component Pattern

Every context object has a `.Consumer` component, just like it has a `.Provider`. The Consumer wraps JSX code and provides the context value via a **render function**:

```jsx
import { CartContext } from '../store/shopping-cart-context.jsx';

function Cart() {
  return (
    <CartContext.Consumer>
      {(cartCtx) => {
        const totalPrice = cartCtx.items.reduce(
          (acc, item) => acc + item.price * item.quantity, 0
        );

        return (
          <div>
            <p>Total: ${totalPrice}</p>
            {cartCtx.items.length === 0 && <p>No items in cart.</p>}
            {cartCtx.items.map(item => <CartItem key={item.id} {...item} />)}
          </div>
        );
      }}
    </CartContext.Consumer>
  );
}
```

### How it works:
1. Wrap your JSX with `<CartContext.Consumer>`
2. Inside the tags, pass a **function** (not JSX) as children
3. That function receives the context value as its argument
4. The function returns the actual JSX you want to render

---

## Why It's Worse Than `useContext`

| Aspect | `useContext` | Consumer Component |
|---|---|---|
| Readability | Clean, top-level hook | Nested function wrapper |
| Code amount | Minimal | More boilerplate |
| Flexibility | Access context value anywhere in the function | Access only inside the render function |
| Modern best practice | ✅ Yes | ❌ No (legacy pattern) |

The Consumer pattern requires an extra level of nesting and forces all your logic inside a render function. It's harder to read, harder to maintain, and simply unnecessary with hooks available.

---

## When You Might See It

- **Older React codebases** (pre-hooks, before React 16.8)
- **Class components** (which can't use hooks — Consumer was the only option)
- **Legacy tutorials** that haven't been updated

---

## ✅ Key Takeaways

- `CartContext.Consumer` is an alternative way to consume context using a **render function** pattern
- It works, but it's **more verbose and harder to read** than `useContext`
- Use `useContext` as your default — it's cleaner, more modern, and best practice
- Know the Consumer pattern exists so you can recognize it in older codebases

---

## 💡 Pro Tip

> If you inherit a codebase using the Consumer pattern and you're on React 16.8+, consider refactoring to `useContext`. It's a quick win for code readability with zero behavior change.
