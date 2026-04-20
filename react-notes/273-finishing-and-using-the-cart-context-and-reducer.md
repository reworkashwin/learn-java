# Finishing & Using the Cart Context & Reducer

## Introduction

We've built the ADD_ITEM logic for our cart reducer. Now it's time to complete the picture: implement REMOVE_ITEM, wire up the context to actual components, and see the whole system working end-to-end. By the end of this lesson, clicking "Add to Cart" will update the cart, and the header badge will reflect the total item count — all powered by context and reducer.

---

## Implementing REMOVE_ITEM in the Reducer

When removing items, the logic depends on the item's **quantity**:
- If quantity is **1** → remove the entire item from the array
- If quantity is **greater than 1** → just decrease the quantity by one

```jsx
if (action.type === 'REMOVE_ITEM') {
  const existingCartItemIndex = state.items.findIndex(
    (item) => item.id === action.id
  );
  const existingCartItem = state.items[existingCartItemIndex];

  const updatedItems = [...state.items];

  if (existingCartItem.quantity === 1) {
    // Last one — remove entirely
    updatedItems.splice(existingCartItemIndex, 1);
  } else {
    // Reduce quantity
    const updatedItem = {
      ...existingCartItem,
      quantity: existingCartItem.quantity - 1,
    };
    updatedItems[existingCartItemIndex] = updatedItem;
  }

  return { ...state, items: updatedItems };
}
```

Notice that we don't check whether the item exists — in this app, the remove button is only visible inside the cart, so the item *must* already be there.

The key difference from ADD_ITEM: we use `splice(index, 1)` to remove one element at the given index when the quantity hits zero.

---

## Wiring Up the Context

### Wrapping the App with the Provider

For context to work, the provider must wrap all components that need access:

```jsx
// App.jsx
import { CartContextProvider } from './store/CartContext.jsx';

function App() {
  return (
    <CartContextProvider>
      <Header />
      <Meals />
    </CartContextProvider>
  );
}
```

Now `Header`, `Meals`, and all their children can tap into the cart context.

---

### Adding Items from MealItem

In the `MealItem` component, we use `useContext` to access the cart and call `addItem`:

```jsx
import { useContext } from 'react';
import CartContext from '../store/CartContext.jsx';

function MealItem({ meal }) {
  const cartCtx = useContext(CartContext);

  function handleAddMealToCart() {
    cartCtx.addItem(meal);
  }

  return (
    // ...
    <Button onClick={handleAddMealToCart}>Add to Cart</Button>
  );
}
```

That's it — no prop drilling needed. Any component wrapped by the provider can directly call `addItem`.

---

### Displaying Cart Count in the Header

The header needs to show the **total quantity** across all items (not just the array length, since each item has a `quantity` property):

```jsx
import { useContext } from 'react';
import CartContext from '../store/CartContext.jsx';

function Header() {
  const cartCtx = useContext(CartContext);

  const totalCartItems = cartCtx.items.reduce(
    (totalNumberOfItems, item) => totalNumberOfItems + item.quantity,
    0
  );

  return (
    // ...
    <Button textOnly>Cart ({totalCartItems})</Button>
  );
}
```

### Understanding `reduce()`

The `reduce` method walks through an array, accumulating a single value:

- **First argument**: a function receiving the accumulator (`totalNumberOfItems`) and the current `item`
- **Second argument**: the starting value (`0`)
- Each iteration returns the updated accumulator, which feeds into the next iteration

So if you have `[{quantity: 3}, {quantity: 2}]`, reduce computes: `0 + 3 = 3`, then `3 + 2 = 5`.

---

## Verifying It Works

A quick `console.log` in the provider confirms everything:

1. Initially, `items` is an empty array
2. Clicking "Add to Cart" adds the item with `quantity: 1`
3. Clicking again on the same item increases `quantity` to `2` (doesn't duplicate)
4. The header badge updates in real time

---

## ✅ Key Takeaways

- REMOVE_ITEM checks the item's quantity — if it's the last one, remove the entire entry; otherwise, decrement the quantity
- `splice(index, 1)` removes one element at the given index from an array (used on a *copy* to maintain immutability)
- Wrap your app (or relevant subtree) with the context provider to give all child components access
- `useContext(CartContext)` gives any component direct access to the context value — no props needed
- Use `reduce()` to compute derived values like total item count from an array of objects

## ⚠️ Common Mistakes

- Using `items.length` for the cart badge — this only counts unique items, not total quantity
- Forgetting that `reduce()` needs a starting value (second argument) — without it, the first array element becomes the initial value, which is an object, not a number

## 💡 Pro Tips

- You can call `useContext` as many times as needed in a single component — tapping into multiple contexts is perfectly fine
- The `reduce()` pattern for computing totals from cart items is extremely common in e-commerce applications — memorize it
