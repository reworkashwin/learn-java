# Advanced Redux — Summary

## Introduction

This is the wrap-up of the Advanced Redux module. Let's consolidate everything we learned about Redux and side effects, async code, and the tools that make debugging easier.

---

## What We Covered

### 1. Redux and Side Effects

The biggest lesson of this module: **where do you put async code and side effects when using Redux?**

Redux reducers must be **pure, synchronous functions** — no HTTP requests, no `setTimeout`, no `localStorage` access. So where does that code go?

**Two viable options:**

| Option | Where | Example |
|--------|-------|---------|
| **Components** | Inside `useEffect` | Dispatch actions, run fetch, dispatch more actions |
| **Action Creators (Thunks)** | Separate functions | Return a function that receives `dispatch`, do async work there |

Both are perfectly valid. The choice depends on your team's preferences and the complexity of your app.

### 2. What NOT to Do

We saw what happens when you put **data transformation logic** directly in a component — it works, but it creates bloated components that do too much. Data transformations belong in **reducers**. Side effects and async code go in **components or thunks**.

```
Reducers       → Data transformations (pure, synchronous)
Components     → Side effects, async code (via useEffect)
Action Creators → Side effects, async code (via thunks)
```

### 3. From Components to Thunks

We started with all the HTTP logic inside `App.js`, then moved it to a thunk action creator to keep the component lean. The component went from dispatching multiple actions and managing async flows to a single `dispatch(sendCartData(cart))` call.

### 4. Redux DevTools

We explored the Redux DevTools browser extension:
- View all dispatched actions in order
- Inspect action payloads and resulting state
- See exactly what changed (diff view)
- Time-travel to previous states for debugging

---

## The Decision Framework

When you encounter side effects in a Redux app, ask yourself:

1. **Is this a data transformation?** → Put it in a reducer
2. **Is this a side effect (HTTP, localStorage, timers)?** → Put it in a component or a thunk
3. **Will this logic be reused?** → Thunk might be better
4. **Is this a one-off effect?** → Component `useEffect` is fine

---

## ✅ Key Takeaways

- Reducers = pure data transformations only
- Side effects go in components (`useEffect`) or thunks (action creator functions)
- Thunks keep components lean by centralizing async logic in Redux files
- Redux DevTools is essential for debugging complex Redux state — install it and use it
- Both approaches (component-based and thunk-based) are valid — pick what fits your project

## 💡 Pro Tips

- In real-world apps, you'll likely use a mix of both approaches: simple effects in components, complex multi-step flows in thunks
- Consider Redux Toolkit's `createAsyncThunk` for more structured async logic (a topic for further exploration)
- Use the DevTools' export feature to save state snapshots for reproducible bug reports
