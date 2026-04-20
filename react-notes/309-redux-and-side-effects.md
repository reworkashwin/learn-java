# Redux & Side Effects (and Asynchronous Code)

## Introduction

Here's the golden rule of Redux that every developer must internalize: **reducer functions must be pure, side-effect free, and synchronous**. No HTTP requests. No `setTimeout`. No localStorage writes. No console logs that matter to your app logic. Nothing that reaches outside the reducer's input → output flow.

But every real application has side effects. So where does that code go?

---

## The Reducer Rule — Explained

A Redux reducer takes two inputs:
1. The **current state**
2. An **action**

And produces one output:
- The **new state**

For the same inputs, it must *always* produce the same output. No randomness, no external dependencies, no network calls. This isn't just a Redux convention — it's the fundamental concept of a **reducer function** (also used by React's `useReducer`).

Why so strict? Because Redux needs to be predictable. If reducers could trigger side effects, you'd lose the ability to replay actions, debug with DevTools, or reason about state changes.

---

## Where Can Side Effects Go?

You have two options:

### Option 1: Inside Components

Run your side effects in components using hooks like `useEffect`. Dispatch an action to Redux only *after* the side effect completes.

```
Component → side effect (e.g., HTTP request) → dispatch action → reducer updates state
```

Redux never knows about the side effect. It just receives clean, synchronous actions.

### Option 2: Inside Custom Action Creators (Thunks)

Write your own action creator functions that can contain async code. These are called **thunks** in Redux terminology. The action creator runs the side effect and then dispatches the actual action.

```
Component → dispatch(thunk) → thunk runs side effect → thunk dispatches action → reducer updates state
```

This keeps components lean while still keeping async logic out of reducers.

---

## The Key Distinction

| Code Type | Where It Belongs |
|-----------|-----------------|
| Data transformation (sync, pure) | **Reducers** — always preferred |
| Side effects / async code | **Components** or **Action Creators** — never reducers |

This is the architectural decision you'll make repeatedly when working with Redux. And this module will show you both approaches in action.

---

## ✅ Key Takeaways

- Reducers must be pure, synchronous, side-effect free — no exceptions
- Side effects go in components (via `useEffect`) or custom action creators (thunks)
- This rule applies to both Redux reducers and React's `useReducer`
- The choice between component-based and action-creator-based approaches is a design decision, not a right/wrong answer

## ⚠️ Common Mistakes

- Putting `fetch()` calls inside a reducer — this is never acceptable
- Putting `console.log` side effects in reducers for "debugging" and leaving them in production
- Thinking async code is impossible with Redux — it's not, you just need the right placement

## 💡 Pro Tips

- If you're unsure where code belongs, ask: "Is this pure data transformation?" If yes → reducer. If no → component or action creator.
- This module introduces two approaches — learn both, then decide which fits your project
