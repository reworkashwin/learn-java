# Optimizing the Custom Hook Store

## Introduction

Our custom store works — but there's a performance problem. When you toggle one product's favorite status, **all** product items re-render, not just the one that changed. Sound familiar? It's the same issue the Context API had. But unlike the Context API, we can actually fix this because we control the store implementation. Let's add a clever optimization.

---

### Concept 1: Identifying the Problem

#### 🧠 What is it?

Every component that calls `useStore()` registers a listener. When state changes, **all** listeners fire, which means **all** components using `useStore()` re-render — even if they don't care about the specific state change.

#### ⚙️ How it works

Add a `console.log('RENDERING')` in `ProductItem` to see the problem:

```
// Initial load: 4 renders (one per product) ✅ Expected
// Click favorite on one product: 4 renders ❌ Should be 1
```

Why 4 renders? Because each `ProductItem` uses `useStore()` to get the `dispatch` function. That means each one has registered a listener. When state changes, all 4 listeners fire, all 4 components re-render.

#### 💡 Insight

You might think: "Just wrap `ProductItem` in `React.memo`!" But that won't help here. `React.memo` prevents re-renders when **props** don't change. But the re-render is triggered by `useState` inside the hook — that's an internal state change, not a prop change. `React.memo` can't stop it.

---

### Concept 2: The shouldListen Parameter

#### 🧠 What is it?

We add an optional `shouldListen` parameter to `useStore` that controls whether a component registers a listener. If a component only needs `dispatch` (not state), it can opt out of re-renders entirely.

#### ❓ Why do we need it?

Some components use the store only to **dispatch actions** — they don't read state from it. These components don't need to re-render when state changes because the state update reaches them through **props** instead (via their parent component re-rendering with new data).

#### ⚙️ How it works

```jsx
export const useStore = (shouldListen = true) => {
  const [, setState] = useState(globalState);

  const dispatch = (actionIdentifier, payload) => {
    const newState = actions[actionIdentifier](globalState, payload);
    globalState = { ...globalState, ...newState };
    for (const listener of listeners) {
      listener(globalState);
    }
  };

  useEffect(() => {
    if (shouldListen) {
      listeners.push(setState);
    }

    return () => {
      if (shouldListen) {
        listeners = listeners.filter(li => li !== setState);
      }
    };
  }, [setState, shouldListen]);

  return [globalState, dispatch];
};
```

Key changes:
- `shouldListen` defaults to `true` (backward compatible)
- Only add the listener if `shouldListen` is `true`
- Only clean up the listener if `shouldListen` is `true`
- `shouldListen` is added to the `useEffect` dependency array

---

### Concept 3: Using shouldListen in Components

#### 🧠 What is it?

Components that only dispatch actions pass `false` to `useStore` to skip listener registration.

#### ⚙️ How it works

```jsx
// ProductItem.js — only dispatches, doesn't read state
const ProductItem = React.memo((props) => {
  const [, dispatch] = useStore(false);  // Don't listen to state changes!

  const toggleFavHandler = () => {
    dispatch('TOGGLE_FAV', props.id);
  };

  // ...
});
```

Now combine this with `React.memo`:
- `useStore(false)` means no listener → no internal re-render trigger
- `React.memo` prevents re-render if props haven't changed
- The only `ProductItem` that re-renders is the one whose `isFav` prop actually changed (because the parent `Products` component passes new props)

**Result after optimization:**
```
// Click favorite on one product: 1 render ✅ Only the affected item!
```

---

### Concept 4: How the Data Still Flows Correctly

#### 🧠 What is it?

Even though `ProductItem` doesn't listen to the store, it still gets updated data. How? Through the **parent component**.

#### ⚙️ How it works

```
1. User clicks favorite in ProductItem
2. ProductItem dispatches 'TOGGLE_FAV'
3. Store updates globalState
4. Products.js IS listening → re-renders with new state
5. Products.js passes new props to all ProductItem components
6. React.memo checks: did this ProductItem's props change?
   - Yes (isFav flipped) → re-render ✅
   - No (other items unchanged) → skip re-render ✅
```

The state update flows through the component tree via props, not through the store listener. This is the optimal path.

#### 💡 Insight

This is a **separation of concerns** at the component level:
- **Container components** (Products, Favorites) → listen to the store, read state
- **Presentational components** (ProductItem) → only dispatch actions, receive data via props

This pattern naturally emerges in well-architected React apps.

---

## ✅ Key Takeaways

- By default, every component using `useStore` re-renders on any state change
- `React.memo` alone can't prevent this — the re-render comes from `useState` inside the hook
- Adding `shouldListen = false` lets dispatch-only components skip listener registration
- Combine `useStore(false)` + `React.memo` for optimal performance
- Data still flows correctly through the parent's props

## ⚠️ Common Mistakes

- Using `shouldListen = false` on a component that **reads** state from the store — it won't get updates!
- Forgetting `React.memo` — even without a listener, the component re-renders if the parent re-renders with new props for *all* children
- Over-optimizing — don't add `shouldListen` everywhere. Only optimize where you've identified a real performance problem

## 💡 Pro Tips

- This optimization shows the power of building your own state management — you can customize the behavior to match your exact needs
- The container/presentational pattern (listeners vs dispatchers) is a powerful architectural guideline, regardless of what state management tool you use
- In production apps, tools like React DevTools Profiler help you identify which components are re-rendering unnecessarily
