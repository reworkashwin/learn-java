# Using the Custom Store

## Introduction

The store is built, the products store is configured — now let's actually *use* it in our components. This is where everything comes together: we'll replace both the Context API and Redux imports with our custom `useStore` hook and see the app work with our hand-built state management system.

---

### Concept 1: Initializing the Store

#### 🧠 What is it?

Before any component can use the store, we need to call `configureStore()` to initialize the global state and register our actions. This happens once in the app's entry point.

#### ⚙️ How it works

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import configureStore from './hooks-store/products-store';

configureStore();  // Initialize the store — no Provider wrapper needed!

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
```

Key difference from Redux and Context API: **no wrapper component needed**. No `<Provider>`, no `<ProductsProvider>`. Just call the function and the store is ready globally.

#### 💡 Insight

This is beautifully simple. The store works because of module-level variables in JavaScript — not because of React's component tree. That's why we don't need a Provider to pass data down.

---

### Concept 2: Reading State — Products Page

#### 🧠 What is it?

To read from the store, components import `useStore` and destructure the first element (the state) from the returned array.

#### ⚙️ How it works

```jsx
// containers/Products.js
import React from 'react';
import { useStore } from '../hooks-store/store';
import ProductItem from '../components/Products/ProductItem';

const Products = () => {
  const [state] = useStore();  // only need state, not dispatch

  return (
    <ul className="products-list">
      {state.products.map(prod => (
        <ProductItem
          key={prod.id}
          id={prod.id}
          title={prod.title}
          description={prod.description}
          isFav={prod.isFavorite}
        />
      ))}
    </ul>
  );
};
```

- `useStore()` returns `[globalState, dispatch]`
- We only destructure the first element: `[state]`
- Access `state.products` because that's the key we set up in `products-store.js`

---

### Concept 3: Dispatching Actions — ProductItem

#### 🧠 What is it?

To change state, components import `useStore` and destructure the second element (the dispatch function). Then they call `dispatch` with an action identifier and payload.

#### ⚙️ How it works

```jsx
// components/Products/ProductItem.js
import React from 'react';
import { useStore } from '../../hooks-store/store';

const ProductItem = (props) => {
  const [, dispatch] = useStore();  // only need dispatch, not state

  const toggleFavHandler = () => {
    dispatch('TOGGLE_FAV', props.id);
  };

  return (
    // ... JSX with onClick={toggleFavHandler}
  );
};
```

- `[, dispatch]` skips the first element (state) and takes only dispatch
- `dispatch('TOGGLE_FAV', props.id)` triggers the action we defined in `products-store.js`
- The store updates, all listeners are notified, and subscribed components re-render

---

### Concept 4: Reading Filtered State — Favorites Page

#### 🧠 What is it?

The Favorites page needs to read state and filter it to show only favorited products.

#### ⚙️ How it works

```jsx
// containers/Favorites.js
import React from 'react';
import { useStore } from '../hooks-store/store';

const Favorites = () => {
  const [state] = useStore();
  const favoriteProducts = state.products.filter(p => p.isFavorite);

  return (
    // ... render favoriteProducts
  );
};
```

- Same pattern as Products page — get state from `useStore`
- Apply `.filter()` to get only favorites
- Component re-renders whenever the global state changes

---

### Concept 5: Multiple Store Slices

#### 🧠 What is it?

If you had multiple features (products, auth, cart), you'd create separate store files and call each `configureStore` in your entry point.

#### ⚙️ How it works

```jsx
// index.js
import configureProductsStore from './hooks-store/products-store';
import configureAuthStore from './hooks-store/auth-store';

configureProductsStore();
configureAuthStore();

// Both slices are now merged into the single globalState
```

Each store file calls `initStore` which **merges** (not replaces) its state and actions into the global store.

---

## ✅ Key Takeaways

- No Provider wrapper needed — just call `configureStore()` and the store is globally available
- Use `const [state] = useStore()` to read state
- Use `const [, dispatch] = useStore()` to dispatch actions
- `dispatch('ACTION_NAME', payload)` triggers the corresponding action
- Multiple store slices work by calling multiple `configureStore` functions

## ⚠️ Common Mistakes

- Forgetting to call `configureStore()` before rendering — the store will have no state or actions
- Forgetting parentheses on `useStore()` — it's a function call, not just a reference
- Using the wrong action identifier string — must match exactly what's defined in the store file

## 💡 Pro Tips

- The destructuring pattern `[state]` vs `[, dispatch]` is clean and intentional — only extract what you need
- Since there's no Provider, you can use the store in any file, even utility functions (though that's not recommended for React state)
