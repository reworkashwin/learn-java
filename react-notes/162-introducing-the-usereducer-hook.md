# Introducing the useReducer Hook

## Introduction

Context solves the prop drilling problem — but what about the **state management itself**? When your state is complex (objects, arrays, nested data), and your update functions are long and always use the "function form" of `setState`, the code gets hard to read. Enter `useReducer` — a hook that brings structure and clarity to complex state management.

---

## What Is a Reducer?

Before diving into React's hook, let's understand the concept. A **reducer** is a function that takes multiple values and "reduces" them into a single result. You've already seen one:

```jsx
const totalPrice = items.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0
);
```

This reduces an array of items into a single number (the total price). That's the reducer pattern — take complex input, produce simpler output.

`useReducer` applies this same idea to **state management**: take the current state + an action → produce new state.

---

## Why Not Just Use `useState`?

`useState` works great for simple state. But when state is an object and updates depend on the previous state, you end up with patterns like this everywhere:

```jsx
setShoppingCart(prevCart => {
  const existingIndex = prevCart.items.findIndex(item => item.id === id);
  // ... 15 lines of mutation-free update logic
  return { ...prevCart, items: updatedItems };
});
```

Problems:
- The function form (`prevCart => ...`) is repeated in every update function
- All the logic lives inside the component function, making it long
- It's easy to forget to use the function form and accidentally use stale state

`useReducer` solves all three by **centralizing state update logic** in a separate reducer function.

---

## How useReducer Works

### The Hook Call

```jsx
const [state, dispatch] = useReducer(reducerFunction, initialState);
```

| Element | Purpose |
|---|---|
| `state` | The current state (same as with `useState`) |
| `dispatch` | A function to "dispatch" actions (replaces `setState`) |
| `reducerFunction` | A function that handles actions and returns new state |
| `initialState` | The starting value of the state |

### The Reducer Function

Defined **outside** the component (it doesn't need props or component-local values):

```jsx
function shoppingCartReducer(state, action) {
  // state = guaranteed latest state snapshot
  // action = whatever you dispatched
  
  if (action.type === 'ADD_ITEM') {
    // ... handle adding an item
    return { ...state, items: updatedItems };
  }
  
  return state; // return unchanged state for unknown actions
}
```

### Why outside the component?

The reducer function doesn't access any component-specific data (props, other state). Placing it outside the component means:
- It's not recreated on every render
- It keeps the component function focused on JSX
- It clearly separates **what to render** from **how to update state**

---

## The Dispatch Pattern

Instead of calling `setState` with a new value, you **dispatch an action**:

```jsx
function handleAddItemToCart(id) {
  // Before (useState): complex state update logic here
  // After (useReducer): just dispatch
  dispatch({
    type: 'ADD_ITEM',
    payload: id,
  });
}
```

An action is typically an object with:
- `type` — a string identifying what happened (convention: `UPPER_SNAKE_CASE`)
- `payload` — any data needed to perform the update

The reducer function receives this action and handles it.

---

## Setting Up useReducer in Practice

```jsx
import { useReducer } from 'react';

// 1. Define the reducer (outside the component)
function shoppingCartReducer(state, action) {
  if (action.type === 'ADD_ITEM') {
    // ... return new state
  }
  return state;
}

// 2. Use it in the component
function CartContextProvider({ children }) {
  const [shoppingCartState, shoppingCartDispatch] = useReducer(
    shoppingCartReducer,
    { items: [] }  // initial state
  );

  function handleAddItemToCart(id) {
    shoppingCartDispatch({ type: 'ADD_ITEM', payload: id });
  }

  // ... provide shoppingCartState through context
}
```

---

## useReducer vs useState — When to Choose Which

| Use `useState` | Use `useReducer` |
|---|---|
| Simple values (boolean, string, number) | Complex objects or arrays |
| Independent state updates | Updates that depend on previous state |
| 1-2 update patterns | Multiple different update operations |
| Quick, straightforward logic | Logic that benefits from centralization |

---

## ✅ Key Takeaways

- `useReducer` is an alternative to `useState` for managing complex state
- It uses a **reducer function** that receives `(state, action)` and returns new state
- You **dispatch actions** instead of calling setState directly
- The reducer is defined **outside** the component — it doesn't need component-local values
- Actions are objects with a `type` (identifier) and optional `payload` (data)
- `useReducer` and Context are independent features but are often used together

---

## ⚠️ Common Mistake

> Don't reach for `useReducer` for every piece of state. A simple boolean toggle or a form input value is perfectly fine with `useState`. Reserve `useReducer` for state where you have multiple update operations on complex data structures.
