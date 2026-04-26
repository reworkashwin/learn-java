# Creating a Concrete Store

## Introduction

We've built the generic store infrastructure — now it's time to create an actual, concrete store for our products. Think of the `store.js` file as the engine, and now we're building the car body around it. We'll define specific actions and initial state for managing products and their favorite status.

---

### Concept 1: The Products Store File

#### 🧠 What is it?

A separate file (`products-store.js`) that defines the **specific actions** and **initial state** for managing products. It imports `initStore` from our generic store and calls it with product-specific configuration.

#### ❓ Why do we need it?

Separation of concerns. The generic `store.js` handles the mechanics (listeners, dispatch, state merging). The `products-store.js` handles the *business logic* (what products look like, how favorites are toggled). This is the same separation Redux has between its core library and your reducers.

#### ⚙️ How it works

```jsx
// hooks-store/products-store.js
import { initStore } from './store';

const configureStore = () => {
  const actions = {
    TOGGLE_FAV: (curState, productId) => {
      const prodIndex = curState.products.findIndex(p => p.id === productId);
      const newFavStatus = !curState.products[prodIndex].isFavorite;
      const updatedProducts = [...curState.products];
      updatedProducts[prodIndex] = {
        ...curState.products[prodIndex],
        isFavorite: newFavStatus
      };
      return { products: updatedProducts };
    }
  };

  const initialState = {
    products: [
      { id: 'p1', title: 'Red Scarf', description: 'A pretty red scarf.', isFavorite: false },
      { id: 'p2', title: 'Blue T-Shirt', description: 'A pretty blue t-shirt.', isFavorite: false },
      // ... more products
    ]
  };

  initStore(actions, initialState);
};

export default configureStore;
```

---

### Concept 2: Understanding the Action Structure

#### 🧠 What is it?

Each action in the `actions` object is a function that receives the **current global state** and a **payload**, and returns the **portion of state** that should change.

#### ⚙️ How it works

```jsx
TOGGLE_FAV: (curState, productId) => {
  // curState = the entire globalState object
  // productId = the payload passed from dispatch

  // 1. Find the product
  const prodIndex = curState.products.findIndex(p => p.id === productId);

  // 2. Flip its favorite status
  const newFavStatus = !curState.products[prodIndex].isFavorite;

  // 3. Create a new array with the updated product
  const updatedProducts = [...curState.products];
  updatedProducts[prodIndex] = {
    ...curState.products[prodIndex],
    isFavorite: newFavStatus
  };

  // 4. Return ONLY what changed
  return { products: updatedProducts };
}
```

#### 💡 Insight

Notice we only return `{ products: updatedProducts }` — not the entire state. The `dispatch` function in `store.js` handles merging this with the existing global state. This means if you have other state slices (auth, cart, etc.), they won't be affected.

---

### Concept 3: The Payload Pattern

#### 🧠 What is it?

The `payload` parameter in actions is how we pass data along with an action — like the product ID to toggle. This was added to the `dispatch` function in `store.js` as the second argument.

#### ⚙️ How it works

In `store.js`, dispatch forwards the payload:
```jsx
const dispatch = (actionIdentifier, payload) => {
  const newState = actions[actionIdentifier](globalState, payload);
  // ...
};
```

In `products-store.js`, the action receives it:
```jsx
TOGGLE_FAV: (curState, productId) => { ... }
//                       ^^^^^^^^^ this is the payload
```

When dispatching:
```jsx
dispatch('TOGGLE_FAV', props.id);
//                     ^^^^^^^^ passed as payload
```

#### 💡 Insight

The payload can be anything — a string, number, object, or array. For `TOGGLE_FAV`, we just need the product ID. For more complex actions, you could pass an entire object with multiple fields.

---

## ✅ Key Takeaways

- Create separate store files for each feature/slice (products, auth, cart, etc.)
- Each file defines its own actions and initial state, then calls `initStore`
- Actions receive `(currentState, payload)` and return only the changed portion of state
- The `configureStore` function is exported and called once during app initialization
- This mirrors Redux's pattern of separate reducers for different state domains

## ⚠️ Common Mistakes

- Returning the entire state from an action instead of just the changed part — this works but defeats the purpose of the merge strategy
- Mutating the state directly instead of creating new objects/arrays — always use spread operators for immutable updates
- Forgetting to pass the payload when dispatching — your action will receive `undefined`

## 💡 Pro Tips

- Keep action identifiers as constants to avoid typos: `const TOGGLE_FAV = 'TOGGLE_FAV'`
- You can have multiple actions in one store file — just add more keys to the `actions` object
- If you need multiple store slices, create multiple store files and call each `configureStore` in your app's entry point
