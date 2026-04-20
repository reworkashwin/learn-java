# Understanding Relative & Absolute Paths

## Introduction

Paths might seem boring, but getting them wrong will break your entire routing setup. There's a critical distinction between **absolute paths** and **relative paths** in React Router, and it applies both to **route definitions** and to **links**. Understanding this difference will save you from mysterious routing bugs.

---

## Absolute Paths: Start with `/`

An absolute path **always starts with a forward slash** (`/`). It's calculated from the domain root, regardless of where the route or link is defined.

```jsx
// These are ALL absolute paths:
{ path: '/' }
{ path: '/products' }
{ path: '/products/:productId' }
```

If these are defined as children of a parent route with path `/root`, React Router throws an error — because the child says "I'm at `/products`" while the parent says "I'm at `/root`". They clash.

---

## Relative Paths: No Leading `/`

A relative path **does NOT start with a slash**. It's appended to the parent route's path:

```jsx
// Parent route
{ path: '/', children: [
  { path: 'products' },           // resolves to /products
  { path: 'products/:id' },       // resolves to /products/:id
]}
```

The child path `products` gets appended after the parent's `/`, resulting in `/products`. If the parent path were `/shop`, it would resolve to `/shop/products`.

This is the recommended approach for child routes — it keeps them flexible and decoupled from the full URL structure.

---

## The Same Rules Apply to Links

Links also follow absolute vs relative rules:

```jsx
// Absolute — always goes to /products regardless of current page
<Link to="/products">Products</Link>

// Relative — appends "products" after the current route's path
<Link to="products">Products</Link>
```

If you're on `/root` and click a relative link with `to="products"`, you go to `/root/products`. If you click an absolute link with `to="/products"`, you go to `/products` (ignoring the current path entirely).

---

## The `relative` Prop: Route vs Path

When using relative paths on `Link`, there's a subtle distinction controlled by the `relative` prop:

```jsx
<Link to=".." relative="route">Back</Link>  {/* default */}
<Link to=".." relative="path">Back</Link>
```

### `relative="route"` (default)

Goes up one level in the **route definition hierarchy**. If your current route is a child nested two levels deep, `..` goes to the parent route's path — which might remove **multiple** URL segments.

### `relative="path"` 

Simply removes **one segment** from the current URL path. If you're at `/products/p1`, `..` takes you to `/products`.

### When Does This Matter?

Imagine this route structure:

```
/ (root)
├── products          → ProductsPage
├── products/:id      → ProductDetailPage (sibling, not child!)
```

On `ProductDetailPage` at `/products/p1`, using `<Link to="..">` with the default `relative="route"`:
- Goes to the **parent route** (root `/`), removing both `/products` and `/p1`

With `relative="path"`:
- Just removes one path segment (`p1`), going to `/products`

The second behavior is usually what you'd want for a "Back" button.

---

## ✅ Key Takeaways

- **Absolute paths** start with `/` and are always relative to the domain root
- **Relative paths** have no leading `/` and are appended to the parent route's path
- Child routes should generally use **relative paths** for flexibility
- The `relative` prop on `Link` controls whether `..` navigates relative to the **route hierarchy** or the **URL path**
- `relative="path"` is often what you want for "back" navigation

## ⚠️ Common Mistakes

- Using absolute paths for child routes — they'll clash with parent paths
- Expecting `..` to always remove just one URL segment — by default it goes up one **route** level, which could remove multiple segments
- Forgetting that links also follow the same absolute/relative rules as route definitions

## 💡 Pro Tip

When in doubt about how a path will resolve, think about it this way:
- **Absolute**: "Where does this path land, starting from the domain?"
- **Relative**: "Where does this path land, starting from where I already am?"
