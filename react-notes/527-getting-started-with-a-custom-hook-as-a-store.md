# Getting Started with a Custom Hook as a Store

## Introduction

The Context API wasn't ideal for high-frequency updates. So now we're going to build something far more powerful — a **custom global store** using nothing but React hooks and plain JavaScript. This is where the magic happens. We'll create a system that behaves like Redux but without any third-party dependency. Let's start building the foundation.

---

### Concept 1: The Core Architecture

#### 🧠 What is it?

We create a `store.js` file with three module-level variables that live **outside** any React component or hook. These variables are shared across every file that imports from this module.

#### ❓ Why do we need it?

In custom hooks, data defined *inside* the hook is **private to each component** — every component using the hook gets its own copy. But we need **shared global state**. By defining variables *outside* the hook, every component that uses the hook accesses the **same data**.

#### ⚙️ How it works

```jsx
// hooks-store/store.js
let globalState = {};
let listeners = [];
let actions = {};
```

- `globalState` — the shared state object (like Redux's store)
- `listeners` — an array of functions that trigger re-renders in subscribed components
- `actions` — an object mapping action identifiers to handler functions (like Redux reducers)

These are **module-scoped variables** — not globally attached to `window`, but shared across all imports of this file.

#### 💡 Insight

This is a crucial pattern: **module-level variables are singletons in JavaScript**. When file A and file B both `import` from `store.js`, they get the **same** `globalState`, `listeners`, and `actions`. This is the foundation that makes a shared store possible without any framework.

---

### Concept 2: The Custom Hook — useStore

#### 🧠 What is it?

A custom React hook called `useStore` that components use to subscribe to state changes and dispatch actions. It uses `useState` internally — not to manage state, but to **force re-renders** when the global state changes.

#### ⚙️ How it works

```jsx
import { useState, useEffect } from 'react';

const useStore = () => {
  const [, setState] = useState(globalState);
  // We only need the setter — not the state value itself
  // because our "real" state is the module-level globalState
};
```

Wait — why use `useState` if we're not using the state value?

Because `setState` is our **re-render trigger**. When we call `setState(newValue)`, React re-renders the component that called `useState`. We'll call this from our listeners to force updates.

#### 💡 Insight

This is the cleverness of the pattern: we're "abusing" `useState` — not for its state management capability, but for its **side effect** of triggering re-renders. The actual state lives in the module-level `globalState` variable.

---

### Concept 3: Registering and Cleaning Up Listeners

#### 🧠 What is it?

When a component mounts and uses `useStore`, we add its `setState` function to the `listeners` array. When it unmounts, we remove it. This ensures only mounted components get re-render signals.

#### ⚙️ How it works

```jsx
const useStore = () => {
  const [, setState] = useState(globalState);

  useEffect(() => {
    listeners.push(setState);

    return () => {
      listeners = listeners.filter(li => li !== setState);
    };
  }, [setState]);

  // ...
};
```

Key details:
- `useEffect` runs on mount → adds `setState` to listeners
- The cleanup function runs on unmount → removes `setState` from listeners
- `setState` from `useState` is **guaranteed by React to be stable** (never changes), so the dependency array `[setState]` effectively means "run once"
- Each component gets its own `setState`, so the filter comparison works correctly

#### 💡 Insight

This listener pattern is exactly what Redux does internally with its `subscribe` mechanism. Components subscribe to store changes, and when the store updates, all subscribers are notified. We're building the same concept from scratch.

---

## ✅ Key Takeaways

- Module-level variables in JavaScript are shared across all imports — this enables a shared global store
- `useState` is used here purely as a **re-render trigger**, not for state management
- Each component's `setState` function is registered as a "listener" on mount and removed on unmount
- Data defined **outside** the hook is shared; data defined **inside** the hook is private per component

## ⚠️ Common Mistakes

- Defining `globalState`, `listeners`, and `actions` *inside* the hook — this would give each component its own copy, defeating the purpose
- Forgetting the cleanup function in `useEffect` — unmounted components would still receive state updates, causing memory leaks and errors

## 💡 Pro Tips

- This pattern of sharing data via module-level variables while sharing logic via custom hooks is powerful and applicable beyond state management
- React guarantees that `setState` from `useState` has a stable identity — you can safely include it in dependency arrays without causing infinite loops
