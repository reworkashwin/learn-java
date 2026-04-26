# Working with Debouncing

## Introduction

Every keystroke in your search input triggers a state update, which triggers a re-render, which triggers filtering. For a small demo app with local data, that's fine. But what if each keystroke sent an HTTP request? Or the filtering logic was computationally expensive? You'd be doing way too much work, way too often.

**Debouncing** is the solution — a technique that delays execution until the user *stops* doing something for a defined period. It's not a React-specific concept, but it's incredibly important in React apps.

---

## Concept 1: What Is Debouncing?

### 🧠 What is it?

Debouncing is a programming technique where you **delay the execution of a function** until after a certain amount of time has passed since the last time it was called. If the function is called again before the timer expires, the timer resets.

### ❓ Why do we need it?

Without debouncing, typing "african" triggers **7 state updates** (one per character):
1. "a" → filter → re-render
2. "af" → filter → re-render
3. "afr" → filter → re-render
4. "afri" → filter → re-render
5. "afric" → filter → re-render
6. "africa" → filter → re-render
7. "african" → filter → re-render

With debouncing (500ms threshold), it triggers **1 state update**:
1. User types "african" → waits 500ms → "african" → filter → re-render

That's 7x fewer renders, 7x fewer filter operations, and 7x fewer potential HTTP requests.

### ⚙️ How it works — The Analogy

Think of an elevator door. When someone walks through, the door stays open. If another person walks through immediately after, the "close" timer resets. The door only closes after nobody has walked through for a few seconds.

Debouncing works the same way:
- Each keystroke is a person walking through
- The timer is the delay before the door closes
- The state update is the door closing

---

## Concept 2: Implementing Debouncing in React

### 🧠 What is it?

The implementation uses three tools:
1. `setTimeout` — to delay the state update
2. `clearTimeout` — to cancel the previous delay when a new keystroke happens
3. `useRef` — to store the timer ID across renders without triggering re-renders

### ⚙️ How it works

```jsx
import { useState, useRef } from 'react';

export default function SearchableList({ items, children, itemKeyFn }) {
  const [searchTerm, setSearchTerm] = useState('');
  const lastChange = useRef();

  function handleChange(event) {
    // 1. If there's a running timer, cancel it
    if (lastChange.current) {
      clearTimeout(lastChange.current);
    }

    // 2. Start a new timer
    lastChange.current = setTimeout(() => {
      // 3. Clear the ref (timer has expired)
      lastChange.current = null;
      // 4. NOW update the state
      setSearchTerm(event.target.value);
    }, 500);
  }

  const searchResults = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... render logic
}
```

### 🧪 Example — Step by Step

Let's trace what happens when the user types "hi":

**Keystroke "h" at t=0ms:**
- `lastChange.current` is `null` → skip `clearTimeout`
- Start timer: "update state to 'h' after 500ms"
- Store timer ID in `lastChange.current`

**Keystroke "i" at t=200ms:**
- `lastChange.current` has a timer ID → call `clearTimeout` (cancel "h" update)
- Start new timer: "update state to 'hi' after 500ms"
- Store new timer ID in `lastChange.current`

**No more keystrokes...**

**At t=700ms (200ms + 500ms):**
- Timer expires
- `lastChange.current` is set to `null`
- State updates to "hi"
- Component re-renders
- Filter runs once with "hi"

Result: only **one** state update instead of two!

---

## Concept 3: Why useRef and Not useState for the Timer?

### 🧠 What is it?

You might wonder: why store the timer ID in a `useRef` instead of `useState`? Because updating state triggers a re-render — and we absolutely don't want a re-render just because we stored a timer ID.

### ⚙️ How it works

| Feature | `useState` | `useRef` |
|---------|-----------|----------|
| Triggers re-render | ✅ Yes | ❌ No |
| Persists across renders | ✅ Yes | ✅ Yes |
| Access via | State variable | `.current` property |

The timer ID is purely internal bookkeeping — it has no visual impact. Using `useRef` keeps it out of the render cycle entirely.

### 💡 Insight

`useRef` is often thought of as "only for DOM references," but it's actually a general-purpose tool for **any mutable value that shouldn't trigger re-renders**. Timer IDs, previous values, interval handles — all great use cases.

---

## Concept 4: Cleaning Up the Timer

### 🧠 What is it?

After the timer fires and the state update happens, you must set `lastChange.current = null`. Otherwise, the ref still holds the (now-expired) timer ID.

### ❓ Why do we need this?

Without clearing:
1. User types "a" → timer starts → timer expires → state updates
2. `lastChange.current` still has the old timer ID
3. User types "b" → `if (lastChange.current)` is `true` → `clearTimeout` is called on an expired timer
4. This is harmless but wasteful and logically incorrect

With clearing:
1. Timer expires → `lastChange.current = null`
2. Next keystroke → `if (lastChange.current)` is `false` → skip `clearTimeout`
3. Clean, correct logic

### 💡 Insight

Always clean up after yourself. Even if calling `clearTimeout` on an expired timer doesn't break anything, it's sloppy code that can confuse other developers reading it.

---

## Concept 5: When to Use Debouncing

### 🧠 What is it?

Debouncing isn't always necessary. Use it when the cost of reacting to every event is high.

### ⚙️ When to debounce:

- **HTTP requests** triggered by search input (API calls to a backend)
- **Complex computations** like sorting or filtering large datasets
- **Expensive DOM updates** like rendering charts or maps
- **Real-time validation** that involves server-side checks

### ⚙️ When NOT to debounce:

- Simple state updates with local data (the demo app case)
- Immediate visual feedback is critical (e.g., character count)
- The operation is already fast and lightweight

---

## ✅ Key Takeaways

- **Debouncing** delays execution until the user stops acting for a defined period
- Use `setTimeout` + `clearTimeout` + `useRef` to implement it in React
- The ref stores the timer ID without triggering re-renders
- Always set the ref to `null` after the timer fires
- Debouncing is most valuable for expensive operations (HTTP calls, heavy computation)
- The threshold (e.g., 500ms) is adjustable based on your use case

## ⚠️ Common Mistakes

- Using `useState` instead of `useRef` for the timer — this causes unnecessary re-renders
- Forgetting to clear the ref after the timer fires — leads to stale timer IDs
- Setting the threshold too high — the UI feels unresponsive
- Setting it too low — you still get too many updates
- Applying debouncing everywhere — it's unnecessary for lightweight operations

## 💡 Pro Tips

- 300-500ms is a good default debounce threshold for search inputs
- Libraries like `lodash.debounce` or `use-debounce` can simplify this — but understanding the manual approach is essential
- Consider using `useDeferredValue` (React 18+) as an alternative for UI responsiveness without manual debouncing
- In production, combine debouncing with `AbortController` when debouncing API calls — cancel the previous request, not just the timer
