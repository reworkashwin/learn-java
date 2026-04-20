# What's a "Side Effect"? A Thorough Example

## Introduction

You keep hearing "side effects" thrown around in React, but what actually *is* a side effect? Let's define it clearly, see a concrete example, and understand why it matters so much in the React mental model.

---

## The Definition

A **side effect** is any task that:

1. **Needs to happen** for the app to work correctly
2. **Does NOT directly impact** the current component render cycle

In other words: it's code your app needs, but it's not about returning JSX. It's about doing something *else* — talking to a browser API, fetching data, setting a timer, writing to storage.

---

## A Concrete Example: Getting the User's Location

Imagine you want to sort available places by distance to the user. For that, you need their geographic location. The browser provides this through a built-in API:

```jsx
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Now sort places by distance...
});
```

### Why is this a side effect?

Let's check the criteria:

**Does it need to happen?** Yes — without the user's location, you can't sort places by distance.

**Does it directly relate to rendering JSX?** No. The main job of a component function is to return JSX. This geolocation call is a *side task* — it doesn't produce JSX, it's not setting up event handlers, it's not declaring state. It's reaching out to the browser to get external data.

**Does it finish immediately?** No. `getCurrentPosition` is **asynchronous** — the user has to grant permission, and the browser needs time to determine the location. By the time the callback fires, the component function has likely already finished executing and returned its JSX.

That's a textbook side effect.

---

## What's NOT a Side Effect?

Inside a component function, some code *is* directly related to rendering:

```jsx
function App() {
  const [selectedPlaces, setSelectedPlaces] = useState([]);  // ✅ state setup
  
  function handleSelectPlace(id) {  // ✅ event handler for JSX
    setSelectedPlaces(prev => [...prev, id]);
  }

  return <PlaceList onSelect={handleSelectPlace} />;  // ✅ JSX output
}
```

- **State declarations** → directly affect what's rendered
- **Event handlers** → used in JSX
- **JSX return** → the entire point of the function
- **Derived values** (like formatting data for display) → directly used in rendering

These are all part of the render cycle. They're not side effects.

---

## The Side Effect Spectrum

| Side Effect | Why It's a Side Effect |
|---|---|
| `navigator.geolocation.getCurrentPosition()` | Browser API call, async, not related to JSX |
| `fetch('/api/data')` | Network request, async, external interaction |
| `localStorage.setItem(...)` | Browser storage interaction |
| `setTimeout(...)` / `setInterval(...)` | Timer setup, runs outside render cycle |
| `document.title = 'New Title'` | Direct DOM manipulation, not React-managed |

---

## Why Side Effects Are Tricky in React

The issue is **timing**. Component functions can be called by React at any time — on mount, on state change, on parent re-render. If you put a side effect directly in the component body, it runs on *every* render:

```jsx
function App() {
  // ⚠️ This runs EVERY TIME App renders
  navigator.geolocation.getCurrentPosition((position) => {
    // ... sort places and update state
    // Which triggers another render...
    // Which runs this code again...
    // INFINITE LOOP! 💥
  });

  return <div>...</div>;
}
```

If the side effect updates state, that triggers a re-render, which runs the side effect again, which updates state again... infinite loop.

This is exactly why React provides `useEffect` — to give you **control** over when side effects run. But that's the next lecture.

---

## The Key Mental Model

Every line of code in a component function falls into one of two categories:

1. **Render logic** — directly about producing JSX (state, handlers, derived values, JSX return)
2. **Side effects** — tasks needed by the app but not directly about this render cycle

Separating these two categories cleanly is a fundamental skill in React development.

---

## ✅ Key Takeaways

- A **side effect** is a necessary task that's not directly related to rendering JSX
- Common examples: API calls, browser API usage, timers, storage access, DOM manipulation
- Side effects are tricky because component functions can re-run multiple times
- Putting side effects directly in the component body can cause **infinite loops**
- React's `useEffect` hook gives you control over when side effects execute

---

## 💡 Pro Tip

> When writing code inside a component function, always ask: "Is this about rendering, or is it about something else?" If it's about something else — an API call, a timer, browser interaction — it's a side effect and deserves special handling.
