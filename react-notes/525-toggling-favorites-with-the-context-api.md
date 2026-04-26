# Toggling Favorites with the Context API

## Introduction

We've set up our context to *distribute* product data — but we can't *change* it yet. Favoriting a product does nothing. Now it's time to add the ability to toggle favorites through the Context API, completing the two-way data flow that Redux gave us. Let's wire up the mutation logic.

---

### Concept 1: Adding a Toggle Function to the Context

#### 🧠 What is it?

We add a `toggleFavorite` function inside our Provider component that updates the products list — and then expose that function through the context value so any child component can call it.

#### ❓ Why do we need it?

With Redux, we dispatched actions to change state. With the Context API, we need a different mechanism — a function stored in the context that any consumer can invoke to trigger state updates.

#### ⚙️ How it works

Inside `products-context.js`, add the toggle logic:

```jsx
const toggleFavorite = (productId) => {
  setProductsList((currentProdList) => {
    const prodIndex = currentProdList.findIndex(p => p.id === productId);
    const newFavStatus = !currentProdList[prodIndex].isFavorite;
    const updatedProducts = [...currentProdList];
    updatedProducts[prodIndex] = {
      ...currentProdList[prodIndex],
      isFavorite: newFavStatus
    };
    return updatedProducts;
  });
};
```

Key details:
- Uses the **function form** of `setProductsList` to guarantee we're working with the latest state
- Finds the product by ID, flips its `isFavorite` status
- Creates a new array (immutable update) with the modified product
- Returns the new list, which triggers a re-render of the Provider and all consumers

#### 💡 Insight

The toggle logic is essentially the same code we had in the Redux reducer — the only difference is where it lives. Instead of a reducer function, it's a regular function inside our Provider component.

---

### Concept 2: Exposing the Function Through Context

#### 🧠 What is it?

We add the `toggleFavorite` function to the context value object so any component that consumes the context can call it.

#### ⚙️ How it works

Update the context definition and the Provider value:

```jsx
// Add to the createContext initial value (for IDE support):
export const ProductsContext = React.createContext({
  products: [],
  toggleFav: (id) => {},  // dummy function for autocomplete
});

// In the Provider's return:
<ProductsContext.Provider value={{ products: productsList, toggleFav: toggleFavorite }}>
  {props.children}
</ProductsContext.Provider>
```

- The initial `toggleFav: (id) => {}` is a dummy — it's there so your IDE knows this key exists and expects an `id` parameter
- The *real* function is passed in the `value` prop

---

### Concept 3: Using toggleFav in ProductItem

#### 🧠 What is it?

In the `ProductItem` component, we replace `useDispatch` from Redux with `useContext` to get the `toggleFav` function and call it when the user clicks the favorite button.

#### ⚙️ How it works

```jsx
// components/Products/ProductItem.js
import React, { useContext } from 'react';
import { ProductsContext } from '../../context/products-context';

const ProductItem = (props) => {
  const { toggleFav } = useContext(ProductsContext);

  const toggleFavHandler = () => {
    toggleFav(props.id);
  };

  return (
    // ... JSX with onClick={toggleFavHandler}
  );
};
```

- Import the context and `useContext`
- Extract `toggleFav` from the context
- Call it with `props.id` when the button is clicked

---

### Concept 4: Fixing the Favorites Page

#### 🧠 What is it?

The Favorites page also needs to switch from Redux to Context to display only favorited products.

#### ⚙️ How it works

```jsx
// containers/Favorites.js
import React, { useContext } from 'react';
import { ProductsContext } from '../context/products-context';

const Favorites = () => {
  const { products } = useContext(ProductsContext);
  const favoriteProducts = products.filter(p => p.isFavorite);

  return (
    // ... render favoriteProducts
  );
};
```

- Access all products from context
- Filter to get only favorites
- The component re-renders automatically when the context value changes

---

## ✅ Key Takeaways

- You can expose **functions** through context, not just data — this replaces Redux's dispatch mechanism
- The toggle logic is the same as a Redux reducer, just placed inside the Provider component
- Use the function form of `setState` to ensure you're working with the latest state
- Any component consuming the context can both **read** state and **trigger** changes

## ⚠️ Common Mistakes

- Forgetting to pass the function in the Provider's `value` — you'll get the dummy function from `createContext` instead
- Mutating the array directly instead of creating a new one — React won't detect the change

## 💡 Pro Tips

- Adding a dummy function with parameters in `createContext()` gives your IDE the information it needs for autocomplete and parameter hints
- This pattern (state + updater function in context) is the foundation of many React state management patterns
