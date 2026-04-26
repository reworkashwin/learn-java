# Handling Side Effects with useEffect

## Introduction

We know how to **send** data to a backend. But what about **fetching** data? You'd think it's simple — just call `fetch()` inside your component, right? Well, not so fast. Doing it naively causes an **infinite loop** that crashes your app. Why? Because updating state re-renders the component, which re-sends the request, which updates state, which re-renders... you get the picture.

This is where React's `useEffect` hook saves the day. It gives you a controlled way to run "side effects" — things like HTTP requests, timers, or subscriptions — without triggering an infinite loop.

---

## Concept 1: The Infinite Loop Problem

### 🧠 What is it?

If you call `fetch()` directly in your component function and update state with the response, you create a cycle:

1. Component renders → `fetch()` fires → response arrives → `setPosts()` updates state
2. State update → component re-renders → `fetch()` fires again → and so on forever

### ❓ Why does this happen?

React's fundamental rule: **when state changes, the component function re-executes**. If that re-execution triggers another state change, you're stuck in a loop.

### ⚙️ How it works (or rather, breaks)

```jsx
// ❌ DON'T DO THIS — causes infinite loop!
function PostsList() {
  const [posts, setPosts] = useState([]);

  fetch('http://localhost:8080/posts')
    .then((response) => response.json())
    .then((data) => setPosts(data.posts)); // triggers re-render → loop!

  return <ul>{posts.map(post => <li key={post.id}>{post.body}</li>)}</ul>;
}
```

### 💡 Insight

Also, you can't just slap `async` on your component function. Component functions must return JSX (or similar), not Promises. Since `async` always wraps the return value in a Promise, you'd break the contract React expects.

---

## Concept 2: useEffect to the Rescue

### 🧠 What is it?

`useEffect` is a React hook designed for running **side effects** — operations that don't directly produce JSX but may indirectly affect the UI. Think: fetching data, setting up subscriptions, manually interacting with the DOM.

### ❓ Why do we need it?

It gives React control over **when** your side-effect code runs. Instead of running on every render, `useEffect` lets you specify exactly when the effect should re-execute.

### ⚙️ How it works

`useEffect` takes two arguments:

1. **A function** — the code you want to run (your side effect)
2. **A dependency array** — controls when the function re-runs

```jsx
useEffect(() => {
  // side effect code here
}, [/* dependencies */]);
```

- React runs the effect function **after** the component renders
- The dependency array determines when it runs *again*

### 🧪 Example

```jsx
import { useState, useEffect } from 'react';

function PostsList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch('http://localhost:8080/posts');
      const resData = await response.json();
      setPosts(resData.posts);
    }

    fetchPosts();
  }, []); // empty array = run only once

  return <ul>{posts.map(post => <li key={post.id}>{post.body}</li>)}</ul>;
}
```

### 💡 Insight

Notice the inner `async function fetchPosts()` trick. We can't make the effect function itself `async` because `useEffect` expects its function to return either **nothing** or a **cleanup function** — not a Promise. So we define an inner async function and immediately call it. It's a common and clean pattern.

---

## Concept 3: The Dependency Array

### 🧠 What is it?

The second argument to `useEffect` is an array of **dependencies** — values that, when they change, cause the effect to re-run.

### ⚙️ How it works

| Dependency Array | Behavior |
|---|---|
| `[]` (empty) | Effect runs **once** — after the first render only |
| `[someVar]` | Effect runs on first render AND whenever `someVar` changes |
| No array (omitted) | Effect runs after **every** render — essentially the same as not using `useEffect` |

### ❓ Why is this important?

The empty array `[]` is what prevents the infinite loop. It tells React: "This effect has no external dependencies. Run it once and never again."

A dependency is any **variable or function** defined outside the effect function that could change over time — state values, props, or functions from parent components.

### 💡 Insight

Think of the dependency array as a "watch list." You're telling React: "Only re-run this effect if one of these values changes." An empty watch list means "never re-run" — which is perfect for one-time data fetching on mount.

---

## Concept 4: How the Rendering Sequence Works

### 🧠 What is it?

When you use `useEffect` with an empty dependency array, the timeline looks like this:

1. Component renders for the first time (with empty/initial state)
2. React paints the UI to the screen
3. `useEffect` fires — sends the HTTP request
4. Response comes back — `setPosts()` is called
5. Component re-renders with the new data
6. `useEffect` does **not** fire again (empty dependency array)

### 💡 Insight

Technically, the component renders *twice* — once with no data, then again with the fetched data. But this happens so fast that the user typically only sees the final state. When the backend is slow, though, you'll notice a brief "empty" state — which is why handling loading states matters (we'll cover that next!).

---

## ✅ Key Takeaways

- Never call `fetch` + `setState` directly in a component body — it causes an **infinite loop**
- `useEffect` wraps side effects and gives React control over when they execute
- Pass an **empty dependency array** `[]` to run the effect only once (on mount)
- The effect function should return nothing or a cleanup function — never a Promise
- Use the inner async function pattern to use `async/await` inside effects

## ⚠️ Common Mistakes

- Making the effect function itself `async` — this returns a Promise, which `useEffect` doesn't expect
- Forgetting the dependency array entirely — causes the effect to run on every render
- Putting values in the dependency array that change on every render — causes unnecessary re-runs
- Calling `setState` inside an effect without proper dependencies — can still cause loops

## 💡 Pro Tips

- `useEffect` with `[]` is the classic way to "fetch data on mount" in React
- For more complex scenarios, consider React Router loaders or libraries like TanStack Query
- The `useEffect` cleanup function (returned from the effect) is useful for cancelling requests or subscriptions when the component unmounts
