# Custom Hook Store Summary

## Introduction

We've built a complete Redux-like state management system using only React hooks and JavaScript. That's a lot of moving parts, so let's step back and walk through the entire architecture one more time to make sure everything clicks. Understanding how all the pieces fit together is key to using — and customizing — this pattern confidently.

---

### Concept 1: The Big Picture

#### 🧠 What is it?

Our custom store system has three layers:

1. **`store.js`** — The generic engine (shared state, listeners, dispatch, useStore hook)
2. **`products-store.js`** — A concrete store slice (product-specific actions and initial state)
3. **Components** — Consumers that read state and dispatch actions via `useStore`

#### ⚙️ How it works

```
┌─────────────────────────────────────────────────────────┐
│                     store.js                             │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ globalState  │  │ listeners│  │     actions        │  │
│  │ (shared obj) │  │ (array)  │  │ (identifier → fn)  │  │
│  └─────────────┘  └──────────┘  └────────────────────┘  │
│                                                          │
│  useStore()  → returns [globalState, dispatch]           │
│  initStore() → merges actions + initial state            │
└─────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ imports useStore             │ imports initStore
         │                              │
    ┌────┴─────┐              ┌────────┴──────────┐
    │Components│              │products-store.js   │
    │ read +   │              │ defines TOGGLE_FAV │
    │ dispatch │              │ defines init state │
    └──────────┘              └───────────────────┘
```

---

### Concept 2: Why Module-Level Variables Are the Key

#### 🧠 What is it?

The three variables (`globalState`, `listeners`, `actions`) are defined **outside** the `useStore` hook — at the module level. This is the fundamental design decision that makes everything work.

#### ❓ Why do we need it?

| Location | Behavior |
|----------|----------|
| **Inside** the hook | Each component gets its own copy → private data → NOT shared |
| **Outside** the hook (module level) | All components share the same data → global state |

With custom hooks, we normally share **logic** but not **data**. By placing data outside the hook, we're sharing **both** — and that's what makes this a global store.

#### 💡 Insight

This is the exact opposite of what we usually do with hooks. Usually, state isolation is a feature. Here, state sharing is the goal. Same tool, different application — that's the beauty of understanding fundamentals deeply.

---

### Concept 3: The Listener Mechanism

#### 🧠 What is it?

Listeners are `setState` functions from `useState` — one per component that uses `useStore`. When state changes, we call every listener, which triggers a re-render in every subscribed component.

#### ⚙️ How it works

1. Component mounts → `useEffect` adds its `setState` to `listeners[]`
2. An action is dispatched → `dispatch` updates `globalState` and calls every listener
3. Each listener (`setState`) is called with the new state → React re-renders those components
4. Component unmounts → cleanup function removes its `setState` from `listeners[]`

This is essentially a **publish-subscribe pattern** — components subscribe to state changes, and the store publishes updates.

---

### Concept 4: The Dispatch-Action Flow

#### 🧠 What is it?

The complete flow when a user clicks a button that dispatches an action:

#### ⚙️ How it works

```
User clicks "Toggle Favorite"
  → Component calls dispatch('TOGGLE_FAV', productId)
    → dispatch looks up actions['TOGGLE_FAV']
      → Calls it with (globalState, productId)
        → Action returns { products: updatedProducts }
          → dispatch merges: globalState = { ...globalState, ...newState }
            → dispatch calls every listener(globalState)
              → Each subscribed component re-renders with new state
```

#### 💡 Insight

This is essentially what Redux does internally. We've recreated the store → dispatch → reducer → notify cycle. The difference? We did it in ~30 lines of code without any external dependency.

---

### Concept 5: Multiple Store Slices

#### 🧠 What is it?

Just like Redux's `combineReducers`, our `initStore` function supports multiple state slices by **merging** rather than **replacing**.

#### ⚙️ How it works

```jsx
// In products-store.js
initStore(productActions, { products: [...] });
// globalState = { products: [...] }

// In auth-store.js
initStore(authActions, { isLoggedIn: false });
// globalState = { products: [...], isLoggedIn: false }
```

The only rule: **avoid action name clashes** between slices. If two slices both define a `'TOGGLE'` action, the second one will overwrite the first.

---

## ✅ Key Takeaways

- Module-level variables enable shared global state without a Provider
- `useState` is used as a re-render trigger, not for actual state management
- The listener pattern is a publish-subscribe system for React components
- `dispatch` → action → merge → notify is the core state update loop
- `initStore` supports multiple slices via merging
- The entire system is ~30 lines of framework-free code

## ⚠️ Common Mistakes

- Putting state inside the hook instead of at the module level — this makes it private per component
- Forgetting the cleanup in `useEffect` — unmounted components will still be in the listeners array
- Action name collisions between slices — use prefixed names like `PRODUCTS_TOGGLE_FAV`

## 💡 Pro Tips

- This pattern teaches you how Redux works under the hood — even if you keep using Redux, understanding this makes you a better developer
- The publish-subscribe pattern appears everywhere in software engineering — event emitters, WebSocket handlers, RxJS observables. Recognizing it here helps you recognize it everywhere
