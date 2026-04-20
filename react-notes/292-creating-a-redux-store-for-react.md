# Creating a Redux Store for React

## Introduction

Time to bring Redux into our React project. The first step is exactly what we did in our Node.js demo — create a **store** and a **reducer**. The setup is nearly identical; only the import syntax changes since we're back in a React/module environment.

---

## Project Structure Convention

Create a `store` folder inside your `src` directory:

```
src/
  store/
    index.js
  components/
    ...
```

This is a common convention — keeping all Redux-related files in a `store` folder. Not required, but widely adopted and keeps things organized.

---

## Writing the Store

In `src/store/index.js`:

```js
import { createStore } from 'redux';

const counterReducer = (state = { counter: 0 }, action) => {
  if (action.type === 'increment') {
    return { counter: state.counter + 1 };
  }
  if (action.type === 'decrement') {
    return { counter: state.counter - 1 };
  }
  return state;
};

const store = createStore(counterReducer);

export default store;
```

Let's break down what's happening:

### Import Syntax

We're using ES module imports now (not `require`). From the `redux` package, we pull out `createStore` directly.

### The Reducer

Same pattern as before:
- **Default state**: `{ counter: 0 }` — the initial state when the store first creates
- **Action handling**: Check `action.type` for `'increment'` or `'decrement'` and return the appropriate new state
- **Fallback**: Return unchanged state for any unrecognized action

### Create and Export the Store

We call `createStore(counterReducer)` and **export** the resulting store as the default export. This is critical — we need other parts of our app to access this store.

---

## What's Different From the Node.js Demo?

Not much! We're not setting up subscriptions or dispatching here in this file. In our Node.js demo, we did everything in one file — create store, subscribe, dispatch. In a React app, the subscribing and dispatching happens **inside React components**, not in the store file.

The store file's job is simple: define the reducer, create the store, export it.

---

## ✅ Key Takeaways

- Store files go in `src/store/` by convention
- The store file defines the reducer and creates the store with `createStore`
- Export the store so it can be provided to the React app
- Don't subscribe or dispatch in the store file — that happens in components

## ⚠️ Common Mistake

Forgetting to export the store. If you don't `export default store`, no other file can import and use it — and your React components won't be able to connect.
