# Migrating the Entire Demo Project to Use the Context API

## Introduction

We've seen how to create, provide, and consume context — and how to link it to state. Now let's put it all together and **fully migrate** the demo project to use Context everywhere, eliminating every last bit of prop drilling.

---

## The Migration Plan

Currently, the app still passes some props for cart-related data. Let's remove them all and use context exclusively:

| Component | Before (Props) | After (Context) |
|---|---|---|
| `App → Header` | Passes cart data + update functions | No cart-related props |
| `Header → CartModal` | Forwards cartItems + onUpdateQuantity | No forwarded props |
| `CartModal → Cart` | Forwards cart data | No forwarded props |
| `App → Product` | Passes onAddToCart | No prop — uses context |

---

## Step-by-Step Migration

### 1. Update the Context Value

First, make sure all needed functions are exposed through context:

```jsx
const ctxValue = {
  items: shoppingCart.items,
  addItemToCart: handleAddItemToCart,
  updateItemQuantity: handleUpdateCartItemQuantity,  // NEW
};
```

Also update the `createContext` default for auto-completion:

```jsx
export const CartContext = createContext({
  items: [],
  addItemToCart: () => {},
  updateItemQuantity: () => {},
});
```

### 2. Clean Up `App`

Remove all cart-related props from `Header` and `Product`:

```jsx
<CartContext.Provider value={ctxValue}>
  <Header />   {/* no more cart props */}
  <Shop>
    {DUMMY_PRODUCTS.map(product => (
      <Product key={product.id} {...product} />  {/* no more onAddToCart */}
    ))}
  </Shop>
</CartContext.Provider>
```

### 3. Update Each Component to Use Context

In **Header**: import and use context to get `items.length` for the cart badge.

In **CartModal**: remove all cart-related props — it's just a modal wrapper.

In **Cart**: use context to get `items` and `updateItemQuantity`.

In **Product**: use context to get `addItemToCart`.

---

## The Key Insight

Notice how each component only imports context **if it actually needs the data**. `CartModal` doesn't need cart data — it's just a wrapper for `Cart`. So `CartModal` has zero context imports. It's clean.

This is the beauty of context: **use it exactly where you need it, nowhere else**. Compare that to prop drilling, where every component in the chain had to accept and forward data it didn't care about.

---

## The Result

After migration:
- `App` — manages state, provides context, no cart-related props on children
- `Header` — reads `items.length` from context for the cart badge
- `CartModal` — no cart-related props or context at all
- `Cart` — reads `items` and `updateItemQuantity` from context
- `Product` — reads `addItemToCart` from context

The app works identically — but the code is cleaner, leaner, and easier to maintain.

---

## ✅ Key Takeaways

- Fully migrating to context means removing **all** prop-drilled cart data from every component
- Each component imports and uses context **only if it needs the data**
- Intermediate wrapper components (like `CartModal`) become simpler — no more forwarding
- The behavior is identical; only the data flow architecture improves

---

## 💡 Pro Tip

> When migrating to context, delete props from the *inside out*. Start with the leaf components (like `Cart`, `Product`), connect them to context, then work your way up removing the now-unnecessary props from parent components. This way the app never fully breaks during migration.
