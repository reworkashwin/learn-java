# Finishing the Store Hook

## Introduction

We've built the listener system — components can now subscribe to state changes. But we can't *change* state yet. We need two more pieces: a **dispatch function** that triggers state updates by running actions, and an **initStore function** that lets us configure the store with concrete actions and initial state. Let's complete the store.

---

### Concept 1: The Dispatch Function

#### 🧠 What is it?

The `dispatch` function is how components trigger state changes — just like `dispatch` in Redux. You call it with an action identifier and an optional payload, and it runs the corresponding action, updates the global state, and notifies all listeners.

#### ⚙️ How it works

```jsx
const useStore = () => {
  const [, setState] = useState(globalState);

  const dispatch = (actionIdentifier, payload) => {
    // 1. Find the action function
    const newState = actions[actionIdentifier](globalState, payload);

    // 2. Merge new state with existing global state
    globalState = { ...globalState, ...newState };

    // 3. Notify all listeners (trigger re-renders)
    for (const listener of listeners) {
      listener(globalState);
    }
  };

  // ... useEffect for listeners ...

  return [globalState, dispatch];
};
```

Let's break down each step:

1. **Find and execute the action**: We look up `actionIdentifier` in the `actions` object and call it with the current `globalState` and any `payload`. The action returns the *part of the state* that should change
2. **Merge states**: We create a new `globalState` by spreading the old state and the new state together. This means actions only need to return what changed — not the entire state
3. **Notify listeners**: We loop through all registered listeners (which are `setState` functions) and call them with the new `globalState`. This triggers a re-render in every subscribed component

#### 💡 Insight

Notice how similar this is to a Redux reducer? The action function receives current state and a payload, and returns new state. The dispatch function is the orchestrator that ties everything together. We've essentially rebuilt Redux's core loop.

---

### Concept 2: The Return Value

#### 🧠 What is it?

`useStore` returns an array with two elements: `[globalState, dispatch]` — deliberately mirroring React's `useReducer` return pattern.

#### ⚙️ How it works

```jsx
return [globalState, dispatch];
```

Components can then destructure what they need:

```jsx
const [state, dispatch] = useStore();       // need both
const [state] = useStore();                  // only need state
const [, dispatch] = useStore();             // only need dispatch
```

#### 💡 Insight

This mirrors `useReducer`'s API (`[state, dispatch]`) intentionally. The difference? `useReducer` only manages state within a single component. Our `useStore` manages state **across all components**.

---

### Concept 3: The initStore Function

#### 🧠 What is it?

`initStore` is a function that lets you configure the store with specific actions and initial state for a particular "slice" of your app's state. You can call it multiple times for different slices — just like `combineReducers` in Redux.

#### ⚙️ How it works

```jsx
export const initStore = (userActions, initialState) => {
  if (initialState) {
    globalState = { ...globalState, ...initialState };
  }
  actions = { ...actions, ...userActions };
};
```

Key details:
- **Merges** initial state into the existing global state (doesn't replace it)
- **Merges** user actions into the existing actions map (doesn't replace it)
- This means you can call `initStore` multiple times for different features (products, auth, cart, etc.)
- Each call adds its state and actions to the shared global store

#### 🧪 Example

```jsx
// Called once for products
initStore(productActions, { products: [...] });

// Called once for auth
initStore(authActions, { isLoggedIn: false });

// globalState now has both: { products: [...], isLoggedIn: false }
// actions now has both product and auth actions
```

#### 💡 Insight

This is the equivalent of Redux's `combineReducers` — you split your state into logical slices but they all live in one global store. The merge strategy ensures that multiple `initStore` calls don't overwrite each other.

---

### Concept 4: Complete Store File

#### 🧠 What is it?

Here's the complete `store.js` file with everything tied together:

#### ⚙️ How it works

```jsx
// hooks-store/store.js
import { useState, useEffect } from 'react';

let globalState = {};
let listeners = [];
let actions = {};

export const useStore = () => {
  const [, setState] = useState(globalState);

  const dispatch = (actionIdentifier, payload) => {
    const newState = actions[actionIdentifier](globalState, payload);
    globalState = { ...globalState, ...newState };
    for (const listener of listeners) {
      listener(globalState);
    }
  };

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter(li => li !== setState);
    };
  }, [setState]);

  return [globalState, dispatch];
};

export const initStore = (userActions, initialState) => {
  if (initialState) {
    globalState = { ...globalState, ...initialState };
  }
  actions = { ...actions, ...userActions };
};
```

---

## ✅ Key Takeaways

- `dispatch` finds the action, executes it with current state and payload, merges the result, and notifies all listeners
- `useStore` returns `[globalState, dispatch]` — mirroring `useReducer`
- `initStore` lets you register actions and initial state for different slices — like `combineReducers`
- The entire store system is ~30 lines of code — no external dependencies

## ⚠️ Common Mistakes

- Forgetting to return the new state from your action functions — `dispatch` expects a return value to merge
- Replacing `globalState` instead of merging — use spread `{ ...globalState, ...newState }` to preserve other slices
- Name clashes in action identifiers when using multiple slices — ensure unique names

## 💡 Pro Tips

- Actions only need to return the **changed portion** of state — the merge in `dispatch` handles the rest
- This pattern scales well: add new features by creating new store files and calling `initStore` for each
