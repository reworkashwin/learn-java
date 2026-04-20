# Exploring The Core Redux Concepts

## Introduction

Time to get our hands dirty. We're going to build a Redux example from scratch — not even in a React app, just pure JavaScript running in Node.js. This strips away all the React complexity so we can focus purely on how Redux works at its core.

---

## Setting Up the Playground

Create an empty folder, open a terminal, and run:

```bash
npm init -y
npm install redux
```

This gives us a `package.json` and installs the Redux library. Then create a file called `redux-demo.js`.

Import Redux using Node.js syntax:

```js
const redux = require('redux');
```

---

## Step 1: Create the Reducer

The reducer is the function that determines *how* state changes. It always receives two arguments — the **current state** and the **action** — and must return a **new state**.

```js
const counterReducer = (state = { counter: 0 }, action) => {
  return {
    counter: state.counter + 1
  };
};
```

Notice the **default parameter** `state = { counter: 0 }`. This is critical. When Redux initializes, the reducer runs for the first time with no existing state. Without a default, `state` would be `undefined`, and `state.counter` would crash.

### Why a Default Value?

The first time the reducer runs (during store initialization), there's no prior state. The default value serves as your **initial state**. After that, Redux always passes the current state automatically.

---

## Step 2: Create the Store

```js
const store = redux.createStore(counterReducer);
```

We call `createStore` and pass our reducer. The store needs to know which reducer manages its data — they're tightly linked.

---

## Step 3: Set Up a Subscription

A subscription is a function that runs **every time the store's state changes**.

```js
const counterSubscriber = () => {
  const latestState = store.getState();
  console.log(latestState);
};

store.subscribe(counterSubscriber);
```

Key details:
- `store.getState()` returns the **latest state snapshot** after an update
- `store.subscribe()` takes a function — Redux calls this function automatically whenever state changes
- We pass `counterSubscriber` as a reference (no parentheses) — we're *pointing* at it, not executing it

---

## Step 4: Dispatch an Action

Actions are plain JavaScript objects with a `type` property that acts as an identifier:

```js
store.dispatch({ type: 'increment' });
```

When this runs:
1. Redux forwards the action to the reducer
2. The reducer executes and returns a new state
3. The store updates
4. The subscriber function fires, logging the new state

**Output:** `{ counter: 2 }`

Why 2? Because the counter starts at 0, gets incremented to 1 during initialization, and then our dispatched action increments it again to 2.

---

## Making the Reducer Action-Aware

Our reducer currently ignores the action type — it always increments. Let's fix that:

```js
const counterReducer = (state = { counter: 0 }, action) => {
  if (action.type === 'increment') {
    return { counter: state.counter + 1 };
  }
  if (action.type === 'decrement') {
    return { counter: state.counter - 1 };
  }
  return state; // default: return unchanged state
};
```

Now the reducer checks `action.type` and behaves differently based on what action was dispatched. For any unrecognized action (including the initialization action), it returns the state unchanged.

---

## Dispatching Multiple Actions

```js
store.dispatch({ type: 'increment' });
store.dispatch({ type: 'decrement' });
```

**Output:**
```
{ counter: 1 }
{ counter: 0 }
```

The subscriber fires after *each* dispatch, logging the state at that moment.

---

## The Complete Code

```js
const redux = require('redux');

const counterReducer = (state = { counter: 0 }, action) => {
  if (action.type === 'increment') {
    return { counter: state.counter + 1 };
  }
  if (action.type === 'decrement') {
    return { counter: state.counter - 1 };
  }
  return state;
};

const store = redux.createStore(counterReducer);

const counterSubscriber = () => {
  const latestState = store.getState();
  console.log(latestState);
};

store.subscribe(counterSubscriber);

store.dispatch({ type: 'increment' });
store.dispatch({ type: 'decrement' });
```

Run it: `node redux-demo.js`

---

## ✅ Key Takeaways

- Reducers must have a **default state** parameter for initialization
- Reducers are **pure functions** — same inputs always produce the same output, no side effects
- `createStore()` links the store to its reducer
- `store.getState()` retrieves the current state
- `store.subscribe(fn)` registers a listener that fires on every state change
- `store.dispatch({ type: '...' })` triggers state changes through actions
- Actions are plain objects with a `type` property as the identifier

## ⚠️ Common Mistake

Forgetting the default value for the `state` parameter in your reducer. Without it, the first execution crashes because `state` is `undefined`.
