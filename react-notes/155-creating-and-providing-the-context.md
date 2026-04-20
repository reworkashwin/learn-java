# Creating & Providing The Context

## Introduction

Now that we understand the concept behind Context, let's actually build one. This lecture walks through the first two steps of the Context workflow: **creating** a context and **providing** it to your component tree.

---

## Step 1: Create the Context

Start by creating a new file for your context. A common convention is to put it in a `store/` folder:

```
src/
  store/
    shopping-cart-context.jsx
```

The folder name `store` is just a convention — it signals "this is where app-wide data lives." The file name is also up to you, but including "context" makes the intent clear.

Inside the file, import `createContext` from React and call it:

```jsx
import { createContext } from 'react';

export const CartContext = createContext({
  items: []
});
```

### What's happening here?

- `createContext()` creates a context object. This object contains React components we'll use later.
- The argument you pass is the **default/initial value** for the context.
- The value can be anything — a string, number, object, array.
- Here we pass an object with an `items` array because our shopping cart will hold items.

### Why start with an uppercase `C`?

Because `CartContext` is an object that **contains React components** (like `CartContext.Provider`). We'll use it in JSX, so the uppercase naming convention applies.

---

## Step 2: Provide the Context

To make the context available to components, you need to **wrap** those components with the context's Provider.

Go to the component that's an ancestor of all components needing the context (typically `App`):

```jsx
import { CartContext } from './store/shopping-cart-context.jsx';

function App() {
  return (
    <CartContext.Provider value={{ items: [] }}>
      <Header />
      <Shop />
    </CartContext.Provider>
  );
}
```

### The `value` prop is required

Even though you set a default value in `createContext()`, you **must** also set the `value` prop on the Provider. The default value from `createContext()` is only used if a component consumes the context without being wrapped by a Provider (which is uncommon in practice).

### What's `CartContext.Provider`?

When you call `createContext()`, React creates an object with a `Provider` component. Using `CartContext.Provider` as a wrapper is the **backward-compatible** approach that works with all React versions (including 18 and earlier).

In React 19+, you can also use `<CartContext>` directly as a wrapper (without `.Provider`), but using `.Provider` works everywhere.

---

## The Dot Notation in JSX

Seeing `<CartContext.Provider>` might look unusual. But it's perfectly valid JSX. You're just accessing a nested property on an object that happens to be a React component. This pattern works anytime you have an object with component properties.

---

## What About the Default Value in `createContext()`?

If the `value` prop on Provider is always required, why bother with the default in `createContext()`?

**Auto-completion.** When you set a default value with the right shape, your IDE can suggest properties when you consume the context. It's a developer experience win — not a runtime necessity.

---

## The Pattern So Far

```
1. createContext({ items: [] })    → Define the shape
2. <CartContext.Provider value={}>  → Wrap your tree
3. ???                              → Consume in components (next lecture!)
```

---

## ✅ Key Takeaways

- Use `createContext()` to create a context — pass a default value for IDE auto-completion
- Export the context so other files can import and use it
- Wrap components with `<CartContext.Provider value={...}>` to provide context to them
- The `value` prop on Provider is **required** — it's what components will actually read
- Use the `.Provider` pattern for backward compatibility with React 18 and earlier

---

## ⚠️ Common Mistake

> Forgetting the `value` prop on `<CartContext.Provider>`. Without it, React throws an error. The default value in `createContext()` does NOT replace the `value` prop — it's only a fallback for edge cases.
