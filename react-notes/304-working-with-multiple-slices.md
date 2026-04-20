# Working with Multiple Slices

## Introduction

Real applications don't have just one type of state. You might manage a counter, authentication status, a shopping cart, UI toggles, and more — all in the same app. Redux handles this with **multiple slices**, each responsible for one concern. This lecture covers how to create a second slice, merge it into the store, and properly access state when you have a reducer map.

---

## Why Separate Slices?

Could you dump everything into one giant slice? Technically, yes. But it creates the same problems as putting all your code in one file — it becomes unreadable, unmaintainable, and tightly coupled.

**Separation of concerns** applies to state management too:
- Counter state → `counterSlice`
- Auth state → `authSlice`
- Cart state → `cartSlice`

Each slice owns its own initial state, reducers, and actions. Clean, focused, testable.

---

## Creating a Second Slice

```js
const initialAuthState = { isAuthenticated: false };

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login(state) {
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
    }
  }
});

export const authActions = authSlice.actions;
```

Exact same pattern as the counter slice. Different data, different reducers, different name.

---

## Merging Slices in the Store

You still only call `configureStore` **once**. You still have **one store**. The difference is your `reducer` property becomes a map:

```js
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    auth: authSlice.reducer
  }
});
```

Behind the scenes, `configureStore` merges these into a single root reducer. Each key (`counter`, `auth`) becomes a top-level property in your state tree.

---

## Accessing State with Multiple Slices

Here's the critical change: when you have a reducer map, the **keys you chose** become part of the state path.

Before (single reducer):
```js
const counter = useSelector(state => state.counter);
```

After (reducer map):
```js
const counter = useSelector(state => state.counter.counter);
const showCounter = useSelector(state => state.counter.showCounter);
const isAuth = useSelector(state => state.auth.isAuthenticated);
```

Why `state.counter.counter`? The first `.counter` is the **key in your reducer map**. The second `.counter` is the **property name in that slice's state**. If you had named the state property `value` instead, it would be `state.counter.value`.

⚠️ **This trips people up constantly.** If your counter suddenly stops displaying after adding a second slice, it's almost certainly because you forgot to update your selectors.

---

## Using Auth State in Components

```js
// App.js — conditionally render components
const isAuth = useSelector(state => state.auth.isAuthenticated);

return (
  <Fragment>
    <Header />
    {!isAuth && <Auth />}
    {isAuth && <UserProfile />}
  </Fragment>
);
```

```js
// Header.js — conditionally show navigation
const isAuth = useSelector(state => state.auth.isAuthenticated);

return (
  <header>
    {isAuth && <nav>...</nav>}
  </header>
);
```

---

## ✅ Key Takeaways

- One Redux store, multiple slices — always
- Use a reducer map in `configureStore` to merge multiple slice reducers
- The keys in the reducer map become the top-level path in your state tree
- Update all `useSelector` calls when switching from a single reducer to a reducer map
- Each slice should focus on one area of concern

## ⚠️ Common Mistakes

- Forgetting to update `useSelector` paths after adding a reducer map (e.g., `state.counter` → `state.counter.counter`)
- Creating a second store instead of a second slice
- Mixing unrelated state into one slice "because it's easier"

## 💡 Pro Tips

- Name your reducer map keys clearly — they form the "namespace" for that state domain
- Export actions from each slice file separately to keep imports clean
- You can have as many slices as you want — there's no limit
