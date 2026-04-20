# Refresher / Practice: Part 1 — Setting Up Redux for a New App

## Introduction

Before diving into async Redux patterns, this lecture builds a fresh Redux-powered application from scratch — a shopping cart app with toggle functionality, product listing, and cart management. This is a comprehensive practice of everything covered in the Redux basics module.

---

## Project Setup

Install the required packages:

```bash
npm install @reduxjs/toolkit react-redux
```

Create a `store/` folder with three files:
- `index.js` — main store configuration
- `ui-slice.js` — UI-related state (cart visibility toggle)
- `cart-slice.js` — cart data state (items, quantities)

---

## UI Slice — Toggling Cart Visibility

```js
// store/ui-slice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartIsVisible: false },
  reducers: {
    toggle(state) {
      state.cartIsVisible = !state.cartIsVisible;
    }
  }
});

export const uiActions = uiSlice.actions;
export default uiSlice;
```

One piece of state, one reducer method. Clean and focused.

---

## Store Configuration

```js
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from './ui-slice';

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer
  }
});

export default store;
```

---

## Providing the Store

```js
// src/index.js
import { Provider } from 'react-redux';
import store from './store/index';

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

---

## Wiring Up the Cart Toggle Button

```js
// CartButton.js
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/ui-slice';

const CartButton = () => {
  const dispatch = useDispatch();

  const toggleCartHandler = () => {
    dispatch(uiActions.toggle());
  };

  return <button onClick={toggleCartHandler}>My Cart</button>;
};
```

---

## Conditionally Rendering the Cart

```js
// App.js
import { useSelector } from 'react-redux';

function App() {
  const showCart = useSelector(state => state.ui.cartIsVisible);

  return (
    <Layout>
      {showCart && <Cart />}
      <Products />
    </Layout>
  );
}
```

The path `state.ui.cartIsVisible` breaks down as:
- `ui` → the key in the reducer map
- `cartIsVisible` → the property in the slice's state

---

## Cart Slice — Managing Cart Items

This is where the more complex logic lives:

```js
// store/cart-slice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalQuantity: 0 },
  reducers: {
    addItemToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      state.totalQuantity++;

      if (!existingItem) {
        state.items.push({
          id: newItem.id,
          price: newItem.price,
          quantity: 1,
          totalPrice: newItem.price,
          name: newItem.title
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice += newItem.price;
      }
    }
  }
});
```

Key points in the `addItemToCart` reducer:
1. **Check if item exists** — `find()` searches by ID
2. **New item** → push to array with quantity 1
3. **Existing item** → increment quantity, add to total price
4. **Always increment `totalQuantity`** — regardless of new or existing

Using `push` and direct object mutation is safe here because of Immer.

---

## ✅ Key Takeaways

- Split state by concern: UI logic in one slice, data in another
- The cart slice demonstrates real-world reducer logic — conditional updates based on existing state
- `state.items.push(...)` and `existingItem.quantity++` are safe inside Redux Toolkit reducers
- Always update aggregate values (like `totalQuantity`) alongside item-level changes

## ⚠️ Common Mistakes

- Using `push` in plain Redux — only safe with Redux Toolkit (Immer)
- Forgetting to update `totalQuantity` when adding/removing items
- Not storing the item `id` consistently — use the same field name everywhere

## 💡 Pro Tips

- Store derived data (like `totalPrice` per item) to avoid recalculating it in components
- Create dummy data arrays in components for prototyping — move to a backend later
- Use meaningful property names in your state — they'll show up in Redux DevTools
