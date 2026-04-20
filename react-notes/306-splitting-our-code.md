# Splitting Our Code

## Introduction

When you have multiple slices all living in one file, that file grows — fast. In a real application with five, ten, or more slices, a single `index.js` becomes a nightmare. This lecture covers how to split each slice into its own file and keep your store configuration lean and maintainable.

---

## The Split Strategy

The idea is simple: **one slice per file**. Each file handles:
- Its initial state
- Its `createSlice` call
- Its exported reducer (as default export)
- Its exported actions (as named export)

The main `index.js` in the store folder only does one thing: create the store and merge all reducers together.

---

## Counter Slice File

```js
// store/counter.js
import { createSlice } from '@reduxjs/toolkit';

const initialCounterState = { counter: 0, showCounter: true };

const counterSlice = createSlice({
  name: 'counter',
  initialState: initialCounterState,
  reducers: {
    increment(state) { state.counter++; },
    decrement(state) { state.counter--; },
    increase(state, action) { state.counter += action.payload; },
    toggleCounter(state) { state.showCounter = !state.showCounter; }
  }
});

export const counterActions = counterSlice.actions;
export default counterSlice.reducer;
```

Notice: the default export is `counterSlice.reducer` (just the reducer), not the whole slice. That's all the store needs from this file.

---

## Auth Slice File

```js
// store/auth.js
import { createSlice } from '@reduxjs/toolkit';

const initialAuthState = { isAuthenticated: false };

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login(state) { state.isAuthenticated = true; },
    logout(state) { state.isAuthenticated = false; }
  }
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
```

Same pattern. Actions as named export, reducer as default export.

---

## Clean Store Index

```js
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counter';
import authReducer from './auth';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer
  }
});

export default store;
```

That's it. No `createSlice` calls, no initial state declarations, no action exports. Just importing reducers and merging them. Clean and focused.

---

## Updating Component Imports

After splitting, your components need to import actions from the **slice files**, not from `store/index.js`:

```js
// Before (everything in one file)
import { counterActions } from '../store/index';

// After (split files)
import { counterActions } from '../store/counter';
import { authActions } from '../store/auth';
```

This is a small but important change. Miss it and you'll get import errors.

---

## ✅ Key Takeaways

- One slice per file is the standard pattern for maintainable Redux code
- Export the reducer as default and actions as a named export from each slice file
- The store's `index.js` only imports reducers and creates the store
- Update all component imports to point to the individual slice files

## ⚠️ Common Mistakes

- Exporting the entire slice instead of just `slice.reducer`
- Forgetting to update import paths in components after the split
- Still exporting actions from `store/index.js` instead of from each slice file

## 💡 Pro Tips

- This file structure scales beautifully — adding a new slice means adding one new file and one new line in `index.js`
- You can group related slices in subfolders for very large apps (e.g., `store/cart/`, `store/auth/`)
- Keep the store index file as minimal as possible — it should only configure and export the store
