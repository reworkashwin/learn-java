# Using async / await

## Introduction

The `.then()` chain we've been using works fine, but many developers (and codebases) prefer the **async/await** syntax for its cleaner, more readable structure. But wait — didn't we say component functions can't be `async`? That's true. So how do we use async/await inside `useEffect`? There's an elegant trick.

---

## The Problem: You Can't Make the Effect Function Async

React does not support `async` effect functions directly. This won't work:

```jsx
// ❌ React will warn you about this
useEffect(async () => {
  const response = await fetch('http://localhost:3000/places');
  const resData = await response.json();
  setAvailablePlaces(resData.places);
}, []);
```

Why? Because `async` functions always return a Promise. But `useEffect` expects its function to return either **nothing** or a **cleanup function** — not a Promise.

---

## The Solution: Define an Inner Async Function

The trick is simple: create a separate `async` function *inside* the effect, then call it immediately:

```jsx
useEffect(() => {
  async function fetchPlaces() {
    const response = await fetch('http://localhost:3000/places');
    const resData = await response.json();
    setAvailablePlaces(resData.places);
  }

  fetchPlaces();
}, []);
```

### Why This Works

- The outer function passed to `useEffect` is a regular (non-async) function — React is happy
- Inside it, we define `fetchPlaces` as `async` — this is just a normal JavaScript function, nothing React-specific
- We then immediately call `fetchPlaces()` to kick off the fetch
- The `await` keywords make the code read top-to-bottom, without chaining `.then()` calls

### Comparing the Two Approaches

**Before (Promise chains):**
```jsx
useEffect(() => {
  fetch('http://localhost:3000/places')
    .then((response) => response.json())
    .then((resData) => {
      setAvailablePlaces(resData.places);
    });
}, []);
```

**After (async/await):**
```jsx
useEffect(() => {
  async function fetchPlaces() {
    const response = await fetch('http://localhost:3000/places');
    const resData = await response.json();
    setAvailablePlaces(resData.places);
  }
  fetchPlaces();
}, []);
```

Both do exactly the same thing. The async/await version is just **more readable** — especially as the logic grows more complex (error handling, data transformation, multiple sequential requests).

---

## ✅ Key Takeaways

- You **cannot** make the `useEffect` callback function `async` — React doesn't support it
- Instead, define an inner `async` function and call it immediately
- This is a common and well-established pattern in React
- Both `.then()` chains and async/await achieve the same result — choose what's more readable
- async/await shines when you have complex logic with multiple sequential steps

## ⚠️ Common Mistake

Trying to add `async` directly to the `useEffect` callback:

```jsx
// ❌ Will cause React warnings
useEffect(async () => { ... }, []);
```

Always use the inner function pattern instead.

## 💡 Pro Tip

You can also use an arrow function for the inner async function if you prefer:

```jsx
useEffect(() => {
  const fetchPlaces = async () => {
    const response = await fetch('http://localhost:3000/places');
    const resData = await response.json();
    setAvailablePlaces(resData.places);
  };
  fetchPlaces();
}, []);
```

Both styles are perfectly valid.
