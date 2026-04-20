# Adding State Slices

## Introduction

So far you've seen how Redux works with manual reducers, action types, and if-else chains. It works — but it's verbose, error-prone, and painful at scale. Enter **Redux Toolkit** and its star feature: `createSlice`. This lecture walks through how to install Redux Toolkit, replace your old reducer with a slice, and write reducer logic that *looks* mutable but is actually immutable behind the scenes.

---

## Installing Redux Toolkit

First things first — get the package:

```bash
npm install @reduxjs/toolkit
```

Once installed, you can actually **uninstall** the standalone `redux` package because Redux Toolkit already includes it internally. So remove the `redux` entry from your `package.json` — one less dependency to worry about.

---

## What Is `createSlice`?

Think of your global Redux state as a big pie. A **slice** is exactly what it sounds like — one piece of that pie. Each slice manages a specific chunk of state (counter, authentication, cart, etc.) along with all the reducers and actions that go with it.

`createSlice` is more powerful than the simpler `createReducer` function. It bundles together:
- The **initial state**
- The **reducer functions** (your action handlers)
- **Auto-generated action creators** (no more manual action types!)

### Basic Structure

```js
import { createSlice } from '@reduxjs/toolkit';

const initialState = { counter: 0, showCounter: true };

const counterSlice = createSlice({
  name: 'counter',           // unique identifier for this slice
  initialState,              // ES6 shorthand for initialState: initialState
  reducers: {
    increment(state) {
      state.counter++;
    },
    decrement(state) {
      state.counter--;
    },
    increase(state, action) {
      state.counter += action.payload;
    },
    toggleCounter(state) {
      state.showCounter = !state.showCounter;
    }
  }
});
```

---

## Wait — Aren't We Mutating State?

Yes, it **looks** like mutation. And in plain Redux, writing `state.counter++` would be a cardinal sin. But here's the trick:

Redux Toolkit uses a library called **Immer** under the hood. Immer detects your "mutating" code and automatically:
1. Clones the existing state
2. Applies your changes to the clone
3. Returns a brand new immutable state object

So `state.counter++` is internally translated into something like:

```js
return { ...state, counter: state.counter + 1 };
```

You write simple, readable code. Immer handles the immutability for you.

💡 **Pro Tip:** This "safe mutation" only works inside `createSlice` and `createReducer`. If you write `state.counter++` anywhere else (like a component), you're genuinely mutating state — and that's a bug.

---

## Handling Actions with Payloads

Most reducer methods just need the current `state`. But sometimes you need extra data — like "increase by 5" or "increase by 10."

For those cases, your reducer method also accepts `action`:

```js
increase(state, action) {
  state.counter += action.payload;
}
```

When you dispatch this action later, whatever value you pass becomes `action.payload`. Redux Toolkit enforces this naming — you don't choose the property name, it's always `payload`.

---

## Why Each Method Maps to an Action

Notice how you don't write `if (action.type === 'INCREMENT')` anymore. Each method name in the `reducers` object (`increment`, `decrement`, `increase`, `toggleCounter`) becomes its own action handler. Redux Toolkit maps them for you internally.

This means:
- No more manual `if/else` or `switch` chains
- No more inventing string action types
- No more typo bugs

---

## ✅ Key Takeaways

- `createSlice` bundles initial state, reducers, and action creators into one clean unit
- You can write "mutating" code inside slice reducers — Immer makes it immutable behind the scenes
- Each method in `reducers` becomes an automatically dispatched action handler
- Extra data on actions is always stored under `action.payload`
- Redux Toolkit includes Redux itself — no need to install both

## ⚠️ Common Mistakes

- Writing mutating code **outside** of `createSlice` reducers — Immer won't protect you there
- Forgetting that payload data is on `action.payload`, not `action.amount` or any custom key
- Trying to use `createSlice` without installing `@reduxjs/toolkit`

## 💡 Pro Tips

- Use ES6 shorthand (`initialState` instead of `initialState: initialState`) for cleaner code
- Give your slice a meaningful `name` — it becomes part of the auto-generated action type strings
- You don't need to accept `action` as a parameter if you don't use it — only destructure what you need
