# Prop Drilling: Component Composition as a Solution

## Introduction

We've identified the problem — prop drilling makes code messy and hard to maintain. Now let's look at the first possible solution: **component composition**. It's not a silver bullet, but it can eliminate some layers of prop drilling by rethinking how you structure your components.

---

## The Core Idea

Instead of passing data *through* a component just so it can forward it to its children, **move the children up** to the parent that already has the data, and turn the intermediate component into a **wrapper**.

It's a structural refactor: you're not adding new features — you're reorganizing *where* components are rendered.

---

## Before: Prop Drilling Through `Shop`

```jsx
// App.jsx
<Shop onAddToCart={handleAddItemToCart} />

// Shop.jsx — just forwarding the prop
function Shop({ onAddToCart }) {
  return (
    <ul>
      {DUMMY_PRODUCTS.map(product => (
        <Product key={product.id} onAddToCart={onAddToCart} {...product} />
      ))}
    </ul>
  );
}
```

`Shop` doesn't use `onAddToCart` itself. It just passes it to `Product`. That's unnecessary prop drilling.

---

## After: Component Composition

Move the product rendering logic into `App`, and make `Shop` a generic wrapper that uses the `children` prop:

```jsx
// App.jsx
<Shop>
  {DUMMY_PRODUCTS.map(product => (
    <Product
      key={product.id}
      onAddToCart={handleAddItemToCart}
      {...product}
    />
  ))}
</Shop>

// Shop.jsx — now a simple wrapper
function Shop({ children }) {
  return (
    <section>
      <h2>Elegant Clothing For Everyone</h2>
      <ul>{children}</ul>
    </section>
  );
}
```

Now `handleAddItemToCart` goes directly from `App` to `Product` — no intermediary needed. `Shop` is still there for layout/styling, but it doesn't need to know anything about the cart.

---

## How It Works Step by Step

1. **Cut** the product mapping code from `Shop`
2. **Paste** it inside `<Shop>...</Shop>` tags in `App`
3. **Refactor** `Shop` to accept `children` and render them inside its layout
4. **Pass** `onAddToCart` directly on each `Product` in `App` — no more forwarding

---

## The Trade-Off

This approach has a downside: if you apply it everywhere, **all your rendering logic ends up in `App`**. Every other component becomes just a wrapper. That makes `App` bloated and hard to read.

### When to use component composition:
- When a component is literally just forwarding props to its children
- When you can naturally restructure without losing readability
- As a **partial** solution alongside Context (which we'll learn next)

### When NOT to use it:
- When it would make `App` (or any parent) unreasonably large
- When the intermediate component actually does something meaningful with the data
- When you have many layers of drilling — composition alone won't scale

---

## ✅ Key Takeaways

- **Component composition** means using the `children` prop to turn intermediate components into wrappers
- It eliminates prop drilling by moving rendering logic closer to where the data lives
- It's a **partial** solution — great for removing 1-2 layers of drilling
- Overusing it leads to a bloated parent component

---

## 💡 Pro Tip

> Think of component composition as a **first pass** solution. Clean up the obvious forwarding-only components with `children`, then use Context for the deeper state-sharing problems. The best React code often uses both techniques together.
