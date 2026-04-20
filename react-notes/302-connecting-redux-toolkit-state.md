# Connecting Redux Toolkit State

## Introduction

You've created a beautiful slice with `createSlice`. Now what? How does your Redux store actually *know* about it? And if you have multiple slices later, how do you merge them all into one store? This lecture introduces `configureStore` — Redux Toolkit's replacement for the classic `createStore` — and shows how to wire your slice into the application.

---

## Accessing the Slice's Reducer

When you call `createSlice`, the return value (your slice object) has a `.reducer` property. This is a single reducer function that Redux Toolkit assembled from all the methods you defined in the `reducers` map.

```js
const counterSlice = createSlice({ /* ... */ });

// This is a complete reducer function ready to use
counterSlice.reducer;
```

Even though you defined multiple methods (`increment`, `decrement`, etc.), Redux Toolkit combines them into one reducer with internal `if` checks that route each action to the right method. You never see those `if` statements — they're handled for you.

---

## `configureStore` vs `createStore`

With plain Redux, you'd do:

```js
import { createStore } from 'redux';
const store = createStore(myReducer);
```

With Redux Toolkit:

```js
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: counterSlice.reducer
});
```

### Why Use `configureStore`?

The main advantage shows up when you have **multiple slices**. `configureStore` accepts either:

1. **A single reducer function** — for simple apps with one slice
2. **A map of reducers** — for apps with multiple slices

```js
// Option 1: Single reducer
const store = configureStore({
  reducer: counterSlice.reducer
});

// Option 2: Map of reducers (for multiple slices)
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    auth: authSlice.reducer
  }
});
```

When you use the map approach, `configureStore` automatically merges all those reducers into one root reducer behind the scenes. No need for `combineReducers` from plain Redux.

⚠️ **Important:** The key is `reducer` (singular), not `reducers`. The *value* can be a map, but the property name is always singular.

---

## The Big Question: How Do We Dispatch Actions?

With `createSlice`, you didn't define any action type strings. You didn't write `{ type: 'INCREMENT' }`. So how does dispatch work?

That's exactly what the next lecture covers — `createSlice` automatically generates action creators for you through the `.actions` property. But for now, understand that your store is fully wired up and ready to receive dispatched actions.

---

## ✅ Key Takeaways

- Access your slice's combined reducer via `counterSlice.reducer`
- Use `configureStore` instead of `createStore` — it handles merging multiple reducers automatically
- Pass a single reducer or a reducer map to `configureStore`'s `reducer` property
- Redux Toolkit eliminates the need for `combineReducers`

## ⚠️ Common Mistakes

- Writing `reducers` (plural) instead of `reducer` (singular) in `configureStore`
- Forgetting to export and provide the store to your React app via `<Provider>`
- Passing the entire slice object instead of `slice.reducer` to the store

## 💡 Pro Tips

- Even if you only have one slice now, using the map approach future-proofs your store for additional slices
- `configureStore` also sets up Redux DevTools automatically — no extra configuration needed
