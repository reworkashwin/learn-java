# Working with Index Routes

## Introduction

When you have a parent route that serves as a **layout wrapper** (rendering shared UI like navigation bars), you often want one of its children to load by default — when the parent's path is active but no specific child path is matched. That's exactly what **index routes** solve.

---

## The Scenario

Consider this route structure:

```jsx
{
  path: '/',
  element: <RootLayout />,
  children: [
    { path: '', element: <HomePage /> },
    { path: 'products', element: <ProductsPage /> },
  ]
}
```

The first child route has an **empty path** (`''`), meaning it should load when the user is on `/` — the same path as the parent. The parent route exists only to provide the layout wrapper, and this empty-path child is the "default" page.

This works, but there's a cleaner, more expressive way to say "this is the default child route."

---

## The `index` Property

Instead of using an empty `path`, you can use the special `index` property:

```jsx
{
  path: '/',
  element: <RootLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'products', element: <ProductsPage /> },
  ]
}
```

### What `index: true` Means

"This is the **default route** that should be rendered when the parent route's path is active and no other child route matches."

- It's activated at `/` (the parent's path)
- It's **not** activated at `/products` (a sibling route matches instead)
- It replaces the need for `path: ''`

---

## Why Use Index Routes?

The behavior is identical to an empty path, so why bother? Clarity and intent.

An empty string path is ambiguous — "Is this intentionally empty? Is it a mistake? What does it mean?" The `index` property is **explicit**: "This is deliberately the default child." When reading route definitions, `index: true` instantly communicates purpose.

---

## ✅ Key Takeaways

- `index: true` defines a **default child route** for a parent route path
- It replaces the pattern of using `path: ''` on a child route
- The index route activates when the parent's path is matched and no other child matches
- It's functionally identical to `path: ''` but more expressive

## 💡 Pro Tip

Index routes are especially useful in nested layouts. If you have `/settings` with a layout wrapper and children like `/settings/profile` and `/settings/security`, an index route lets you define what shows up when the user visits just `/settings` — maybe a settings overview or dashboard.
