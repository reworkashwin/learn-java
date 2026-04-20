# Dispatching Actions From Inside Components

## Introduction

We can read from the store. Now let's learn how to **write** to it — or more precisely, how to **dispatch actions** from React components to trigger state changes.

---

## The `useDispatch` Hook

React-Redux provides the `useDispatch` hook, which gives us a dispatch function:

```jsx
import { useSelector, useDispatch } from 'react-redux';

const Counter = () => {
  const dispatch = useDispatch();
  const counter = useSelector((state) => state.counter);

  const incrementHandler = () => {
    dispatch({ type: 'increment' });
  };

  const decrementHandler = () => {
    dispatch({ type: 'decrement' });
  };

  return (
    <div>
      <h1>Redux Counter</h1>
      <div>{counter}</div>
      <div>
        <button onClick={incrementHandler}>Increment</button>
        <button onClick={decrementHandler}>Decrement</button>
      </div>
    </div>
  );
};
```

---

## How It Works

### Step 1: Get the Dispatch Function

```js
const dispatch = useDispatch();
```

Call `useDispatch()` with no arguments. It returns a function that you can use to dispatch actions to the Redux store.

### Step 2: Create Handler Functions

```js
const incrementHandler = () => {
  dispatch({ type: 'increment' });
};
```

Inside your event handlers, call `dispatch()` and pass an action object. The action object must have a `type` property that matches one of the types your reducer handles.

### Step 3: Wire Up to JSX

```jsx
<button onClick={incrementHandler}>Increment</button>
```

Connect your handlers to button clicks (or any event).

---

## The Full Cycle in Action

When you click "Increment":

1. `incrementHandler` fires
2. `dispatch({ type: 'increment' })` sends the action to the Redux store
3. Redux forwards the action to the reducer
4. The reducer sees `type: 'increment'`, returns `{ counter: state.counter + 1 }`
5. The store updates with the new state
6. `useSelector` detects the change
7. The component re-renders with the new counter value

All of this happens automatically. You dispatch, and the UI updates. That's the power of the Redux data flow.

---

## The Action-Type Contract

The `type` value you dispatch **must exactly match** what the reducer expects:

```js
// In the reducer
if (action.type === 'increment') { ... }

// In the component
dispatch({ type: 'increment' }); // ✅ Works
dispatch({ type: 'Increment' }); // ❌ Case mismatch — won't be handled!
```

Typos in action types are a classic source of bugs. The reducer simply won't recognize the action, and nothing will happen — no error, no warning, just... nothing.

---

## ✅ Key Takeaways

- `useDispatch()` returns a dispatch function — call it with no arguments
- Dispatch actions by passing an object with a `type` property to the dispatch function
- The `type` must exactly match what the reducer handles (case-sensitive!)
- Wire dispatch calls to event handlers in your JSX
- The full cycle is automatic: dispatch → reducer → store update → re-render

## ⚠️ Common Mistake

Mistyping action type strings. `'increment'` and `'Increment'` are different strings. The reducer won't throw an error — it'll just fall through to the default case and nothing will change. This is a silent bug that can be maddening to debug.
