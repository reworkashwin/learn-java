# More Redux Basics

## Introduction

In the previous lecture, our reducer just blindly incremented the counter regardless of which action was dispatched. Now it's time to make the reducer *react* to different actions — which is the whole point of having action types in the first place.

---

## Handling Different Actions in the Reducer

The reducer receives the dispatched action as its second argument. We can inspect `action.type` to determine what should happen:

```js
const counterReducer = (state = { counter: 0 }, action) => {
  if (action.type === 'increment') {
    return { counter: state.counter + 1 };
  }
  if (action.type === 'decrement') {
    return { counter: state.counter - 1 };
  }
  return state;
};
```

For the default/initialization action (which Redux dispatches automatically when the store is created), we simply return the unchanged state. No increment, no decrement — just the initial value.

---

## Dispatching Multiple Actions

Now we can dispatch both types:

```js
store.dispatch({ type: 'increment' });
store.dispatch({ type: 'decrement' });
```

**Output:**
```
{ counter: 1 }   // after increment
{ counter: 0 }   // after decrement
```

Each dispatch triggers the reducer, produces a new state, updates the store, and fires the subscription — logging the result.

---

## Redux Is Not React-Specific

An important thing to understand: **Redux is a standalone JavaScript library.** It has nothing to do with React specifically. You can use Redux in any JavaScript project — vanilla JS, Angular, Vue, or even server-side Node.js applications. There are even implementations of Redux for other programming languages.

That said, Redux pairs beautifully with React thanks to the `react-redux` library, which we'll use starting in the next lectures.

---

## ✅ Key Takeaways

- Use `action.type` inside the reducer to handle different actions differently
- Always return the unchanged state as a default/fallback case
- Each `store.dispatch()` call triggers the full Redux cycle: action → reducer → store update → subscriber notification
- Redux is framework-agnostic — it works with any JavaScript environment

## 💡 Pro Tip

You can use a `switch` statement instead of multiple `if` checks in your reducer. Both work, but `switch` is the more common convention in Redux codebases — it makes the code cleaner when you have many action types.
