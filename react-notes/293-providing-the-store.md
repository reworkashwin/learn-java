# Providing the Store

## Introduction

We've created our Redux store and exported it. But React components still can't access it — we need to **provide** the store to our React component tree. This is conceptually similar to how we used Context Providers earlier in the course.

---

## Using the Provider Component

React-Redux gives us a `Provider` component. We wrap our app (or part of our app) with it, and all wrapped components gain access to the Redux store.

In your main entry file (typically `src/index.js`):

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

---

## Breaking It Down

### Import `Provider` from `react-redux`

Not from `redux` — from `react-redux`. This is the bridge component that connects React to Redux.

### Import Your Store

Import the store you exported from `src/store/index.js`.

### Wrap Your Root Component

Place `<Provider>` around `<App />`. This makes the Redux store available to `App` and **all its child components**, their children, and so on — the entire component tree.

### Set the `store` Prop

The `Provider` component has a required `store` prop. Pass your imported store here. This tells React-Redux *which* store to provide.

---

## Where Should You Provide?

You can wrap `Provider` at any level of your component tree:
- **At the root** (most common): All components have access
- **Around a subtree**: Only that subtree and its descendants have access

If most of your app needs the store, provide at the root. There's rarely a reason not to.

---

## Analogy

Think of the `Provider` like plugging in a power strip. The store is the electricity source, and `Provider` is the strip. Every component plugged into the strip (nested inside `Provider`) gets power (store access). Components outside the strip don't.

---

## ✅ Key Takeaways

- Import `Provider` from `react-redux` (not `redux`)
- Wrap your component tree with `<Provider store={store}>`
- All components inside `Provider` can access the Redux store
- Typically provided at the highest level (`index.js`) so the entire app has access
- Just providing the store doesn't change anything yet — components still need to explicitly connect

## 💡 Pro Tip

You only have one Redux store, so you only need one `Provider`. Unlike Context where you might have multiple providers for different contexts, Redux keeps it simple with a single provider wrapping your app.
