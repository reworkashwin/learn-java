# Redux & Async Code

## Introduction

The shopping cart works locally — add items, remove items, toggle visibility, all managed by Redux. But there's a problem: **refresh the page and everything is gone**. The state lives only in memory. To persist it, we need a backend. And that means HTTP requests. And HTTP requests are side effects. And side effects can't go in reducers. So... where do they go?

---

## The Goal

Whenever the cart changes (item added, removed, quantity updated), we want to:
1. Update Redux state (already working)
2. **Send the updated cart to a backend** (new requirement)

And when the app loads, we want to:
1. **Fetch the saved cart from the backend**
2. Load it into Redux

This creates a synchronization pattern: frontend state ↔ backend storage.

---

## Firebase as a Simple Backend

For this example, Firebase Realtime Database serves as the backend. It's essentially a REST API that stores JSON data — no server-side code required.

The key URL pattern:
```
https://your-project.firebaseio.com/cart.json
```

Firebase accepts `PUT` requests (overwrite existing data) and `GET` requests (fetch data). We'll use `PUT` to update the cart whenever it changes.

---

## The Core Problem

We can't send HTTP requests inside reducers:

```js
// ❌ NEVER DO THIS
addItemToCart(state, action) {
  state.items.push(newItem);
  fetch('https://...', { method: 'PUT', body: JSON.stringify(state) }); // ILLEGAL!
}
```

Reducers must be:
- **Pure** — same input always produces same output
- **Synchronous** — no waiting for responses
- **Side-effect free** — no network calls, no DOM manipulation

---

## Two Valid Approaches

### Approach 1: Side Effects in Components

Use `useEffect` to watch for state changes and send requests:

```
Redux state changes → component re-renders → useEffect fires → HTTP request sent
```

### Approach 2: Custom Action Creators (Thunks)

Write action creators that can run async code *before* dispatching the actual action:

```
Component dispatches thunk → thunk runs HTTP request → thunk dispatches Redux action → reducer updates state
```

Both approaches keep reducers pure. Both are valid. The choice depends on your preference and project architecture.

---

## ✅ Key Takeaways

- Redux state is in-memory only — it doesn't survive page refreshes
- Sending HTTP requests requires side effect code that can't live in reducers
- Two approaches: component-based (`useEffect`) or action-creator-based (thunks)
- Firebase `PUT` overwrites existing data — perfect for "save current cart" operations

## ⚠️ Common Mistakes

- Trying to send HTTP requests inside reducer functions
- Thinking Redux automatically persists state — it doesn't
- Confusing `POST` (creates new entry each time) with `PUT` (overwrites) when using Firebase

## 💡 Pro Tips

- The approach you choose often depends on your backend: if the backend transforms data, your frontend can be simpler; if the backend just stores data, the frontend needs to handle all the logic
- You'll learn both approaches in the upcoming lectures — understand each before picking a favorite
