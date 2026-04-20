# Redux Summary

## Introduction

This wraps up the core Redux module. Let's consolidate everything you've learned — from raw Redux concepts to Redux Toolkit — into a clear mental model you can carry forward.

---

## The Core Redux Flow

Every Redux interaction follows this cycle:

1. **Component dispatches an action** → "Something happened"
2. **Reducer receives the action** → Processes it and produces new state
3. **Store updates** → Holds the new global state
4. **Subscribed components re-render** → UI reflects the new state

This cycle never changes, whether you're using plain Redux or Redux Toolkit.

---

## What You Learned

### Without Redux Toolkit (Plain Redux)
- Created a store with `createStore`
- Wrote a single reducer with `if/else` or `switch` for different action types
- Manually created action objects with `type` properties
- Used `combineReducers` for multiple reducers
- Had to manually ensure immutability (spreading state, creating new objects)

### With Redux Toolkit
- Created slices with `createSlice` — bundles state, reducers, and actions together
- Created the store with `configureStore` — auto-merges multiple reducers
- Got auto-generated action creators via `slice.actions`
- Wrote "mutable" code in reducers — Immer handles immutability behind the scenes
- Split slices into separate files for maintainability

---

## React-Redux Integration

- `<Provider store={store}>` — wraps your app and makes the store available
- `useSelector(state => ...)` — reads data from the store, subscribes to updates
- `useDispatch()` — returns the dispatch function for sending actions

---

## Redux vs Context — When to Choose

| Factor | React Context | Redux |
|--------|--------------|-------|
| Setup complexity | Minimal | Moderate (extra library) |
| Performance at scale | Can cause unnecessary re-renders | Optimized with selectors |
| Complex state logic | Manageable for simple apps | Built for complex state flows |
| DevTools | Limited | Excellent (Redux DevTools) |
| Bundle size | Zero extra | Adds a third-party dependency |

**Use Context** when:
- State is simple and localized
- You don't have frequent, high-throughput updates
- You want zero extra dependencies

**Use Redux** when:
- State is complex with many interactions
- Multiple components across the app need the same data
- You need powerful debugging tools
- You anticipate growing complexity

Neither is inherently "better" — they solve different scales of the same problem.

---

## ✅ Key Takeaways

- Redux Toolkit is the recommended way to use Redux — always prefer it over plain Redux
- One store, multiple slices, one root reducer — that's the architecture
- `configureStore`, `createSlice`, `useSelector`, `useDispatch` — these four are your core tools
- The reducer must be pure, synchronous, and side-effect free
- Redux adds bundle size but gives you structure, DevTools, and scalability

## 💡 Pro Tips

- Start with Context for simple apps. Migrate to Redux when complexity demands it
- Redux DevTools are incredibly powerful for debugging — install the browser extension
- Understanding plain Redux helps you debug issues, even if you always use Toolkit in practice
