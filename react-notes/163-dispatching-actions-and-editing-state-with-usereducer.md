# Dispatching Actions & Editing State with useReducer

## Introduction

We've set up `useReducer` with its reducer function and initial state. Now let's make it actually do something — dispatch actions that modify the state, and handle them in the reducer to produce updated state snapshots.

---

## Dispatching Actions

Instead of complex state-updating logic inside event handlers, you now just **dispatch an action**:

```jsx
function handleAddItemToCart(id) {
  shoppingCartDispatch({
    type: 'ADD_ITEM',
    payload: id,
  });
}
```

That's the entire event handler. No more 15 lines of immutable update logic. Just "hey reducer, ADD_ITEM with this id."

### Action Object Convention

```jsx
{
  type: 'ADD_ITEM',      // What happened (string identifier)
  payload: id,           // Data needed to handle the action
}
```

- **`type`**: Usually `UPPER_SNAKE_CASE` — a convention from Redux/Flux patterns
- **`payload`**: Any shape — a primitive, object, whatever the reducer needs

For more complex actions, the payload can be an object:

```jsx
shoppingCartDispatch({
  type: 'UPDATE_ITEM',
  payload: { productId, amount },
});
```

---

## Handling Actions in the Reducer

The reducer function gets called by React whenever you dispatch. It receives the latest state and the dispatched action:

```jsx
function shoppingCartReducer(state, action) {
  if (action.type === 'ADD_ITEM') {
    const updatedItems = [...state.items];
    const existingIndex = updatedItems.findIndex(
      item => item.id === action.payload
    );

    if (existingIndex >= 0) {
      const existingItem = updatedItems[existingIndex];
      updatedItems[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      };
    } else {
      const product = DUMMY_PRODUCTS.find(p => p.id === action.payload);
      updatedItems.push({
        id: action.payload,
        name: product.title,
        price: product.price,
        quantity: 1,
      });
    }

    return { ...state, items: updatedItems };
  }

  if (action.type === 'UPDATE_ITEM') {
    const updatedItems = [...state.items];
    const index = updatedItems.findIndex(
      item => item.id === action.payload.productId
    );
    const existingItem = updatedItems[index];
    const updatedItem = {
      ...existingItem,
      quantity: existingItem.quantity + action.payload.amount,
    };

    if (updatedItem.quantity <= 0) {
      updatedItems.splice(index, 1);
    } else {
      updatedItems[index] = updatedItem;
    }

    return { ...state, items: updatedItems };
  }

  return state; // fallback: return unchanged state
}
```

### Important rules inside the reducer:

1. **Never mutate `state` directly** — always copy first (`[...state.items]`, `{ ...state }`)
2. **Always return** a state object — even if unchanged
3. **Spread the old state** (`{ ...state, items: updatedItems }`) to preserve properties you didn't change
4. The `state` parameter is always the **guaranteed latest** snapshot — no need for the function form

---

## Why This Is Better Than useState

The reducer approach doesn't reduce the amount of update logic — the same code still exists. But it's **organized differently**:

| With `useState` | With `useReducer` |
|---|---|
| Update logic scattered across multiple handler functions | Centralized in one reducer function |
| Must remember to use function form (`prev => ...`) | Reducer always receives latest state automatically |
| Logic lives inside the component function | Reducer lives outside — keeps component clean |
| Hard to see all possible state transitions at a glance | All transitions visible in one function |

---

## The Complete Flow

```
1. User clicks a button → event handler runs
2. Handler dispatches: dispatch({ type: 'ADD_ITEM', payload: id })
3. React calls the reducer: shoppingCartReducer(currentState, action)
4. Reducer checks action.type, performs logic, returns new state
5. useReducer updates the state
6. Components consuming the state (via context) re-render
```

---

## After Migration: Clean Event Handlers

```jsx
function handleAddItemToCart(id) {
  shoppingCartDispatch({ type: 'ADD_ITEM', payload: id });
}

function handleUpdateCartItemQuantity(productId, amount) {
  shoppingCartDispatch({
    type: 'UPDATE_ITEM',
    payload: { productId, amount },
  });
}
```

Two lines each. All the complex logic lives in the reducer. The component stays focused on rendering.

---

## useReducer Is Independent of Context

While we're using `useReducer` inside a context provider here, the two features are **independent**. You can use `useReducer` in any component that needs complex state — with or without context.

---

## ✅ Key Takeaways

- **Dispatch** actions as simple objects with `type` and `payload`
- The **reducer** handles all state update logic in a single, centralized function
- Never mutate state in the reducer — always return a new object
- The reducer's `state` parameter is always the latest snapshot — no function form needed
- `useReducer` keeps event handlers lean and state transitions visible
- It's independent of Context — use it wherever complex state lives

---

## ⚠️ Common Mistake

> Forgetting to spread the old state when returning from the reducer. If your state has multiple properties and you only update one, you'll lose the others:
> ```jsx
> // ❌ Wrong — loses all other state properties
> return { items: updatedItems };
> 
> // ✅ Correct — preserves everything, updates items
> return { ...state, items: updatedItems };
> ```
