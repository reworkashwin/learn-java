# Linking the Context to State

## Introduction

Right now, our context value is static — it's always an empty array. A read-only value isn't very useful for a shopping cart. The real magic happens when you **link context to state**, making the context value dynamic and reactive. And thankfully, it's surprisingly simple.

---

## The Simple Link: State as Context Value

If your state has the same shape as your context value, linking them is a one-liner:

```jsx
function App() {
  const [shoppingCart, setShoppingCart] = useState({ items: [] });

  return (
    <CartContext.Provider value={shoppingCart}>
      <Header />
      <Shop />
    </CartContext.Provider>
  );
}
```

That's it. Instead of passing a hard-coded object to the `value` prop, you pass your **state**. Now every component consuming this context gets live, reactive data. When the state updates, all consuming components re-render with the new values.

---

## Going Further: Sharing Functions Through Context

Reading values is only half the story. Components also need to **update** the cart — add items, change quantities, remove things. With prop drilling, you'd pass update functions as props. With context, you expose them as part of the context value.

```jsx
function App() {
  const [shoppingCart, setShoppingCart] = useState({ items: [] });

  function handleAddItemToCart(id) {
    setShoppingCart(prevCart => {
      // ... logic to add item
    });
  }

  const ctxValue = {
    items: shoppingCart.items,
    addItemToCart: handleAddItemToCart,
  };

  return (
    <CartContext.Provider value={ctxValue}>
      <Header />
      <Shop />
    </CartContext.Provider>
  );
}
```

Now any component can call `addItemToCart` directly from context:

```jsx
function Product({ id, title, price }) {
  const { addItemToCart } = useContext(CartContext);

  return (
    <button onClick={() => addItemToCart(id)}>Add to Cart</button>
  );
}
```

No prop drilling. No forwarding. The `Product` component reaches directly into context and calls the function.

---

## Update the Default Value for Auto-Completion

When you add new properties to your context value (like `addItemToCart`), also add them to the default value in `createContext()`. They won't actually be called — it's just for IDE auto-completion:

```jsx
export const CartContext = createContext({
  items: [],
  addItemToCart: () => {},  // dummy function for IDE hints
});
```

---

## The Flow

```
1. State changes (via addItemToCart)
2. React re-renders the Provider with the new value
3. All components using useContext(CartContext) re-render
4. UI updates automatically
```

This is the same reactive model you know from `useState` — but now the state is accessible from **anywhere** in the wrapped tree, not just where props happen to reach.

---

## ✅ Key Takeaways

- Link context to state by passing your state (or a derived object) as the Provider's `value`
- Expose **functions** through context too — not just data — so components can update state
- Add dummy entries to `createContext()` defaults for IDE auto-completion
- When the state changes, all consuming components automatically re-render with new data

---

## 💡 Pro Tip

> Create a separate object for your context value (like `ctxValue`) instead of building it inline. It's more readable and easier to extend as your context grows:
> ```jsx
> const ctxValue = {
>   items: shoppingCart.items,
>   addItemToCart: handleAddItemToCart,
>   updateItemQuantity: handleUpdateCartItemQuantity,
> };
> ```
