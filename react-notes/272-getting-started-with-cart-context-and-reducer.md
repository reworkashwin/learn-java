# Getting Started with Cart Context & Reducer

## Introduction

When building a food ordering app, the shopping cart data needs to be accessible from *many* places: the meal items (to add), the header (to show count), the cart modal (to display items), and the checkout page (to finalize). Managing this in one component and drilling props everywhere would be painful. This is exactly the scenario where **React Context** combined with **useReducer** shines — centralizing complex state management and making it available across your entire component tree.

---

## Why Context for Cart Data?

Think about where cart data is needed:

1. **MealItem** — to add items when "Add to Cart" is clicked
2. **Header** — to display the total number of items in the cart badge
3. **Cart modal** — to show all cart items with details
4. **Checkout page** — to submit the order

If you managed this state in `App`, you'd bloat that component *and* pass props through several layers of components that don't even care about the cart. That's the classic "prop drilling" problem.

**Context** solves this by letting any component in the tree directly access and modify the cart — no intermediary components required.

---

## Setting Up the Cart Context

### Creating the Context

```jsx
import { createContext } from 'react';

const CartContext = createContext({
  items: [],
  addItem: (item) => {},
  removeItem: (id) => {},
});

export default CartContext;
```

The default value passed to `createContext` is technically only used if a component reads the context *without* a provider above it. But defining it serves two important purposes:

1. **IDE auto-completion** — your editor knows what shape this context has
2. **Planning** — it forces you to think about the API upfront

---

### The Context Provider Component

Context alone doesn't manage state — it just *distributes* data. The actual state management happens inside a **Provider component**:

```jsx
export function CartContextProvider({ children }) {
  // State management will go here...
  
  return (
    <CartContext.Provider value={/* context value */}>
      {children}
    </CartContext.Provider>
  );
}
```

> **React 19 note:** Since React 19, you can use `<CartContext>` directly as a wrappable component instead of `<CartContext.Provider>`. The older `.Provider` syntax still works and is backwards-compatible.

---

## Why useReducer Instead of useState?

The cart state involves multiple related operations: adding items (with quantity tracking), removing items (with quantity decreasing or item removal), and clearing. When state updates depend on the *current* state and involve complex logic, `useReducer` is typically cleaner than `useState` because:

- It **centralizes** all update logic in one function (the reducer)
- It **separates** the "what happened" (action) from "how to update" (reducer logic)
- It's easier to **test** and **reason about**

---

## Building the Cart Reducer

### The Reducer Structure

```jsx
function cartReducer(state, action) {
  if (action.type === 'ADD_ITEM') {
    // ... add item logic
  }

  if (action.type === 'REMOVE_ITEM') {
    // ... remove item logic
  }

  return state; // fallback: return unchanged state
}
```

React calls this function automatically when you dispatch an action. It receives the current `state` and the dispatched `action`, and must return the **new state**.

---

### The ADD_ITEM Logic (Immutable Updates)

This is where things get interesting. We can't just `push` onto `state.items` because:

1. **Mutation is dangerous** — `push` modifies the existing array in memory *before* the reducer finishes executing. If later logic returned a different state, the items would already be corrupted.
2. **Quantity tracking** — clicking "Add to Cart" multiple times shouldn't add 10 separate pizza entries. Instead, we want one entry with `quantity: 10`.

Here's the full logic:

```jsx
if (action.type === 'ADD_ITEM') {
  const existingCartItemIndex = state.items.findIndex(
    (item) => item.id === action.item.id
  );
  const existingCartItem = state.items[existingCartItemIndex];
  
  const updatedItems = [...state.items]; // create a copy

  if (existingCartItemIndex > -1) {
    // Item exists — update quantity
    const updatedItem = {
      ...existingCartItem,
      quantity: existingCartItem.quantity + 1,
    };
    updatedItems[existingCartItemIndex] = updatedItem;
  } else {
    // New item — add with quantity 1
    updatedItems.push({ ...action.item, quantity: 1 });
  }

  return { ...state, items: updatedItems };
}
```

### Why Spread Instead of Push?

`[...state.items]` creates a **new array** in memory. We never touch the original. This is the immutable update pattern — React relies on reference comparisons to detect changes, so creating new objects/arrays is essential.

---

### Connecting useReducer to the Provider

```jsx
export function CartContextProvider({ children }) {
  const [cart, dispatchCartAction] = useReducer(cartReducer, { items: [] });
  
  const cartContext = {
    items: cart.items,
    addItem: (item) => dispatchCartAction({ type: 'ADD_ITEM', item }),
    removeItem: (id) => dispatchCartAction({ type: 'REMOVE_ITEM', id }),
  };
  
  return (
    <CartContext.Provider value={cartContext}>
      {children}
    </CartContext.Provider>
  );
}
```

The second argument to `useReducer` is the **initial state** — here, an object with an empty `items` array. This is where you define your state shape.

---

## ✅ Key Takeaways

- Use **Context** when data needs to be accessed by many components at different levels of the tree
- Use **useReducer** when state updates involve complex logic, multiple sub-values, or depend on previous state
- Always update state **immutably** — create new arrays/objects instead of modifying existing ones with `push` or direct assignment
- The reducer pattern separates "what happened" (dispatched action) from "how to update" (reducer logic)
- New cart items should start with `quantity: 1`; subsequent adds should increment the quantity rather than duplicating the item

## ⚠️ Common Mistakes

- Using `state.items.push()` in a reducer — this mutates the existing state, which is a bug waiting to happen
- Forgetting to add `quantity: 1` when adding a brand new item, causing `undefined + 1 = NaN` later
- Not spreading the old state when returning from the reducer — if you add more state properties later, they'd get lost

## 💡 Pro Tips

- `findIndex` returns `-1` when the item isn't found — always check for `> -1` (not just truthy, since index `0` is falsy!)
- Spread the existing state into the returned object (`{ ...state, items: updatedItems }`) even if there's only one property — it future-proofs your reducer
