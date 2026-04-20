# Working with Multiple State Properties

## Introduction

So far, our Redux state has been a simple object with just a `counter` property. But real applications manage **multiple pieces of state** — a counter, a visibility toggle, authentication status, and more. How do we handle multiple state properties in a single Redux store?

---

## Adding More State

Let's add a `showCounter` property to control whether the counter is visible or hidden. First, update the initial state:

```js
const initialState = { counter: 0, showCounter: true };

const counterReducer = (state = initialState, action) => {
  // ... handle actions
};
```

Extracting the initial state into a separate constant keeps things readable as your state grows.

---

## The Critical Rule: Return Complete State

When you return a new state from the reducer, **Redux replaces the entire state** with what you return. It does NOT merge your changes with the existing state.

This means every return statement must include **all** state properties, even the ones you're not changing:

```js
if (action.type === 'increment') {
  return {
    counter: state.counter + 1,
    showCounter: state.showCounter  // Must include this!
  };
}
```

If you omit `showCounter`:

```js
// ❌ BAD — showCounter is lost!
if (action.type === 'increment') {
  return { counter: state.counter + 1 };
}
```

`showCounter` becomes `undefined` because the old state was completely replaced by an object that doesn't have this property. Your toggle would break silently.

---

## Handling the Toggle Action

Add a new action type for toggling visibility:

```js
if (action.type === 'toggle') {
  return {
    showCounter: !state.showCounter,  // Flip the boolean
    counter: state.counter            // Keep counter unchanged
  };
}
```

The `!` operator inverts the boolean — `true` becomes `false`, `false` becomes `true`.

---

## Using Multiple Selectors in Components

In your component, use `useSelector` for each piece of state you need:

```jsx
const Counter = () => {
  const dispatch = useDispatch();
  const counter = useSelector((state) => state.counter);
  const show = useSelector((state) => state.showCounter);

  const toggleCounterHandler = () => {
    dispatch({ type: 'toggle' });
  };

  return (
    <div>
      <h1>Redux Counter</h1>
      {show && <div>{counter}</div>}
      <button onClick={toggleCounterHandler}>Toggle Counter</button>
    </div>
  );
};
```

Each `useSelector` call creates its own subscription. The component re-renders when *either* selected value changes.

---

## The Complete Reducer

```js
const initialState = { counter: 0, showCounter: true };

const counterReducer = (state = initialState, action) => {
  if (action.type === 'increment') {
    return { counter: state.counter + 1, showCounter: state.showCounter };
  }
  if (action.type === 'increase') {
    return { counter: state.counter + action.amount, showCounter: state.showCounter };
  }
  if (action.type === 'decrement') {
    return { counter: state.counter - 1, showCounter: state.showCounter };
  }
  if (action.type === 'toggle') {
    return { showCounter: !state.showCounter, counter: state.counter };
  }
  return state;
};
```

Notice how every `return` includes both `counter` and `showCounter`. This is the price of Redux's "replace, don't merge" approach. It can feel repetitive, but it ensures you're always explicit about what your state looks like.

---

## ✅ Key Takeaways

- Redux state can contain multiple properties — just add them to your state object
- Redux **replaces** the entire state with what the reducer returns (no automatic merging)
- Every return statement must include **all** state properties
- Use `useSelector` multiple times to extract different pieces of state
- Extract initial state into a constant for readability

## ⚠️ Common Mistake

Forgetting to copy unchanged state properties when returning from the reducer. If you return `{ counter: state.counter + 1 }` without including `showCounter`, that property vanishes. Always include every property in your returned state object.
