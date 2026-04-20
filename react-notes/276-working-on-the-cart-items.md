# Working on the Cart Items

## Introduction

With the cart context and modal system in place, it's time to polish the cart's appearance and make those **+** and **−** buttons work. This lesson covers building a dedicated CartItem component, two different prop-passing patterns, and connecting the increase/decrease functionality to the cart context.

---

## Building the CartItem Component

Instead of embedding all the cart item markup inside the Cart component, we create a separate `CartItem` component to keep things clean:

```jsx
import { currencyFormatter } from '../util/formatting.js';

export default function CartItem({ name, quantity, price, onIncrease, onDecrease }) {
  return (
    <li className="cart-item">
      <p>
        {name} - {quantity} x {currencyFormatter.format(price)}
      </p>
      <p className="cart-item-actions">
        <button onClick={onDecrease}>-</button>
        <span>{quantity}</span>
        <button onClick={onIncrease}>+</button>
      </p>
    </li>
  );
}
```

Notice that this component uses **plain `<button>` elements** rather than the custom Button component. Why? Because the cart item buttons need a completely different visual style — sometimes it's simpler to use native elements than to over-configure a shared component.

---

## Two Prop-Passing Approaches

### Option 1: Spread the Item Object

The quick way — spread the entire item as props:

```jsx
<CartItem key={item.id} {...item} />
```

This passes `name`, `quantity`, `price`, `id`, and anything else on the item object. It works but passes extra data the component doesn't need.

### Option 2: Explicit Props

The explicit way — pass only what's needed:

```jsx
<CartItem
  key={item.id}
  name={item.name}
  quantity={item.quantity}
  price={item.price}
/>
```

More verbose, but makes the component's data requirements crystal clear. Both approaches are valid — choose based on your team's preferences.

---

## Handling Increase and Decrease

Instead of having CartItem directly tap into the cart context (which would work but couples it tightly), we pass callback functions as props:

```jsx
// In Cart component
<CartItem
  key={item.id}
  name={item.name}
  quantity={item.quantity}
  price={item.price}
  onIncrease={() => cartCtx.addItem(item)}
  onDecrease={() => cartCtx.removeItem(item.id)}
/>
```

### Why Pass Callbacks Instead of Using Context Directly?

- **CartItem stays lean** — no context imports, no hooks, just props in, UI out
- **Better separation** — the Cart component decides *what* to do; CartItem decides *how* to render
- **More reusable** — CartItem could be used in a different context (e.g., a wishlist) with different callbacks

This pattern of passing anonymous arrow functions that close over the current item data is extremely common in React:

```jsx
onIncrease={() => cartCtx.addItem(item)}       // Pass the full item
onDecrease={() => cartCtx.removeItem(item.id)} // Only need the ID
```

---

## The Result

After these changes:
- Each cart item shows its name, quantity, and formatted price
- Clicking **+** increases the quantity (via the existing ADD_ITEM reducer logic)
- Clicking **−** decreases the quantity (or removes the item if quantity is 1)
- The cart total and header badge update automatically

---

## ✅ Key Takeaways

- Separate CartItem into its own component to keep the Cart component's JSX clean
- Use native `<button>` elements when your custom Button component's styling doesn't fit the use case
- Pass callback props (`onIncrease`, `onDecrease`) to keep child components decoupled from specific contexts
- Both `{...item}` spread and explicit prop passing are valid — explicit is more readable, spread is more concise

## ⚠️ Common Mistakes

- Using the custom Button component everywhere, even when it adds unwanted styling — sometimes plain HTML is the right choice
- Passing the entire item to `removeItem` when it only needs the ID — be intentional about what data each function requires

## 💡 Pro Tips

- The pattern of passing `() => someFunction(specificData)` as a callback is how you handle item-specific actions in lists — it's one of React's most common patterns
- Keeping components "dumb" (just props in, UI out) makes them easier to test and reuse
