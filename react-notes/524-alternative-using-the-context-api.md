# Alternative: Using the Context API

## Introduction

The first approach to replacing Redux is using React's built-in **Context API**. If you've used context before for things like theming or authentication, this will feel familiar — but here we're pushing it further to manage product state globally. Let's build it step by step and see how it compares to Redux.

---

### Concept 1: Setting Up the Context

#### 🧠 What is it?

We create a React Context object that holds our product data and wrap our entire app with a Provider component — just like we did with Redux's `<Provider>`.

#### ⚙️ How it works

1. Create a `context/` folder with a `products-context.js` file
2. Use `React.createContext()` to create a context object with an initial shape
3. Build a **functional component** that serves as the Provider
4. Use `useState` inside that component to manage the products list
5. Pass the state as the `value` prop to `ProductsContext.Provider`

```jsx
// context/products-context.js
import React, { useState } from 'react';

export const ProductsContext = React.createContext({
  products: [],
});

const ProductsProvider = (props) => {
  const [productsList, setProductsList] = useState([
    { id: 'p1', title: 'Red Scarf', description: 'A pretty red scarf.', isFavorite: false },
    // ... more products
  ]);

  return (
    <ProductsContext.Provider value={{ products: productsList }}>
      {props.children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
```

#### 💡 Insight

Notice how the initial value passed to `createContext()` is just for IDE autocomplete support. The *real* value comes from the `value` prop on the Provider — which is our dynamic state managed by `useState`.

---

### Concept 2: Providing the Context

#### 🧠 What is it?

We replace Redux's `<Provider>` with our own `<ProductsProvider>` in `index.js` to make the context available throughout the entire component tree.

#### ⚙️ How it works

```jsx
// index.js
import ProductsProvider from './context/products-context';

ReactDOM.render(
  <ProductsProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ProductsProvider>,
  document.getElementById('root')
);
```

- Remove `react-redux`'s `Provider` and the store import
- Wrap the app with `ProductsProvider` instead
- No props needed — the Provider manages everything internally

---

### Concept 3: Consuming the Context

#### 🧠 What is it?

Any child component can now "tap into" the context using the `useContext` hook — no more `useSelector` from `react-redux`.

#### ⚙️ How it works

```jsx
// containers/Products.js
import React, { useContext } from 'react';
import { ProductsContext } from '../context/products-context';

const Products = () => {
  const { products } = useContext(ProductsContext);

  return (
    <ul>
      {products.map(p => <ProductItem key={p.id} {...p} />)}
    </ul>
  );
};
```

- Import the context object (not the Provider)
- Call `useContext(ProductsContext)` to get the current value
- Access `products` from the returned object
- The component **automatically re-renders** when the context value changes

#### 💡 Insight

This is remarkably similar to `useSelector` from Redux — you're reaching into a global store and pulling out the data you need. The difference? No extra library required.

---

## ✅ Key Takeaways

- The Context API can replace Redux's Provider/useSelector pattern for distributing state
- Create a context with `React.createContext()`, manage state with `useState` inside a Provider component
- Consume with `useContext()` — components re-render when the context value changes
- At this point, we can read data but can't yet modify it (favoriting doesn't work yet)

## ⚠️ Common Mistakes

- Forgetting that the initial value in `createContext()` is only used when there's no Provider above in the tree — it's not your "real" state
- Not wrapping the app with the Provider — `useContext` will return the default value and won't be reactive

## 💡 Pro Tips

- Use the initial value in `createContext()` to define the *shape* of your context — this helps with IDE autocomplete and type checking
- Keep your Provider component in a separate file to keep things organized, just like you would with Redux store configuration
