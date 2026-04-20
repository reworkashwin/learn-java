# Refresher / Practice: Part 2 — Completing the Cart Logic

## Introduction

Part 1 set up the UI slice and the `addItemToCart` reducer. This lecture completes the picture: implementing the `removeItemFromCart` reducer, wiring up product items to dispatch actions, displaying cart items from Redux state, and connecting the plus/minus buttons inside cart items.

---

## The `removeItemFromCart` Reducer

```js
removeItemFromCart(state, action) {
  const id = action.payload;
  const existingItem = state.items.find(item => item.id === id);
  state.totalQuantity--;

  if (existingItem.quantity === 1) {
    state.items = state.items.filter(item => item.id !== id);
  } else {
    existingItem.quantity--;
    existingItem.totalPrice -= existingItem.price;
  }
}
```

The logic flow:
1. **Find the item** by ID
2. **Decrement `totalQuantity`** — always, regardless of whether we remove or just decrease
3. **If quantity is 1** → remove the entire item from the array using `filter`
4. **If quantity > 1** → decrease quantity by 1 and subtract one unit price from `totalPrice`

The `filter` approach creates a new array without the target item. Using `state.items = ...` is safe inside Redux Toolkit because Immer handles the immutability.

---

## Setting Up Product Data

Instead of managing products in Redux (since they don't change), use a simple local array:

```js
const DUMMY_PRODUCTS = [
  { id: 'p1', price: 6, title: 'My First Book', description: 'The first book I ever wrote.' },
  { id: 'p2', price: 5, title: 'My Second Book', description: 'The second book I ever wrote.' }
];
```

Map over them to render product items:

```jsx
{DUMMY_PRODUCTS.map(product => (
  <ProductItem
    key={product.id}
    id={product.id}
    title={product.title}
    price={product.price}
    description={product.description}
  />
))}
```

💡 Not everything needs to live in Redux. Static or local data that doesn't change and isn't shared across components is perfectly fine as a local constant or prop.

---

## Dispatching "Add to Cart" from Product Items

```js
// ProductItem.js
import { useDispatch } from 'react-redux';
import { cartActions } from '../../store/cart-slice';

const ProductItem = ({ id, title, price, description }) => {
  const dispatch = useDispatch();

  const addToCartHandler = () => {
    dispatch(cartActions.addItemToCart({ id, title, price }));
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={addToCartHandler}>Add to Cart</button>
    </div>
  );
};
```

The payload is an object with `id`, `title`, and `price` — exactly what the reducer expects.

---

## Displaying Cart Badge from Redux

```js
// CartButton.js
import { useSelector } from 'react-redux';

const CartButton = () => {
  const cartQuantity = useSelector(state => state.cart.totalQuantity);

  return (
    <button>
      My Cart <span>{cartQuantity}</span>
    </button>
  );
};
```

---

## Rendering Cart Items from Redux

```js
// Cart.js
import { useSelector } from 'react-redux';

const Cart = () => {
  const cartItems = useSelector(state => state.cart.items);

  return (
    <ul>
      {cartItems.map(item => (
        <CartItem
          key={item.id}
          item={{
            id: item.id,
            title: item.name,
            quantity: item.quantity,
            total: item.totalPrice,
            price: item.price
          }}
        />
      ))}
    </ul>
  );
};
```

---

## Plus/Minus Buttons in Cart Items

```js
// CartItem.js
import { useDispatch } from 'react-redux';
import { cartActions } from '../../store/cart-slice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const addItemHandler = () => {
    dispatch(cartActions.addItemToCart({
      id: item.id,
      title: item.title,
      price: item.price
    }));
  };

  const removeItemHandler = () => {
    dispatch(cartActions.removeItemFromCart(item.id));
  };

  return (
    <li>
      <span>{item.title} x{item.quantity} — ${item.total}</span>
      <button onClick={removeItemHandler}>−</button>
      <button onClick={addItemHandler}>+</button>
    </li>
  );
};
```

The "plus" button reuses `addItemToCart` — same action, same reducer. If the item exists, its quantity increments. The "minus" button dispatches `removeItemFromCart` with just the item ID as payload.

---

## ✅ Key Takeaways

- `removeItemFromCart` handles two cases: remove entirely (quantity === 1) or decrement
- Use `filter` to remove items from arrays in Redux Toolkit reducers
- The same `addItemToCart` action works for both "Add to Cart" buttons and "+" buttons
- Not all data needs to be in Redux — static product lists can be local constants
- Always add `key` props when mapping arrays to components

## ⚠️ Common Mistakes

- Forgetting to update `totalPrice` when decrementing quantity — easy to overlook
- Using different property names in the state vs. what components expect (e.g., `name` vs `title`)
- Storing `id` inconsistently between the slice state and action payloads

## 💡 Pro Tips

- When debugging, check that your `find()` comparisons use the correct property name — `item.id` not `item.itemId`
- The payload for `removeItemFromCart` is simpler (just `id`) because you only need to identify which item to remove
- Reuse reducers where possible — "add from product list" and "increment in cart" are the same operation
