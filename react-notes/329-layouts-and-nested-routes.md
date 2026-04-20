# Layouts & Nested Routes

## Introduction

Most websites have a consistent navigation bar at the top of every page. Right now, if we want navigation on every page, we'd have to import and render it in every single page component. That's repetitive and error-prone. React Router has a much better solution: **layout routes with nested children**.

---

## The Manual Approach (Tedious)

You could add `<MainNavigation />` to every page component:

```jsx
// In HomePage:
<MainNavigation />
<h1>My Home Page</h1>

// In ProductsPage:
<MainNavigation />
<h1>The Products Page</h1>

// In every future page:
<MainNavigation />
// ... content
```

This works but doesn't scale. Every new page needs the same setup. Miss one, and you get inconsistent navigation.

---

## The Layout Route Pattern

React Router lets you create a **parent route** that wraps its **child routes** with shared layout. Here's how:

### Step 1: Create a Root Layout Component

```jsx
// pages/Root.js
import { Outlet } from 'react-router-dom';
import MainNavigation from '../components/MainNavigation';

export default function RootLayout() {
  return (
    <>
      <MainNavigation />
      <main>
        <Outlet />
      </main>
    </>
  );
}
```

The magic component here is `<Outlet />`. It's a **placeholder** that tells React Router: "Render the matching child route's element here."

### Step 2: Nest Routes Under the Layout

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
    ],
  },
]);
```

The `children` property creates **nested routes**. The parent route (`/`) renders `<RootLayout />`, and depending on the current path, one of the children renders inside the `<Outlet />`.

### The Rendering Flow

```
URL: /products

1. Router matches parent route "/"
2. Renders <RootLayout />
   → <MainNavigation />
   → <main>
       → <Outlet />  ← Router checks children
       → Matches "/products"
       → Renders <ProductsPage /> here
     </main>
```

---

## Why Not Wrap `RouterProvider`?

You might think: "Can I just render `<MainNavigation />` above `<RouterProvider />`?"

**No** — because `Link` components only work **inside** the router context. If `MainNavigation` uses `Link` (which it should), it must be rendered within the router tree, not above it.

---

## Building the Navigation Component

```jsx
// components/MainNavigation.js
import { Link } from 'react-router-dom';

export default function MainNavigation() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
        </ul>
      </nav>
    </header>
  );
}
```

This navigation now appears on **every page** automatically because it's part of the root layout.

---

## Multiple Layouts

The layout route pattern scales beautifully. You can have different layouts for different sections:

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,  // different layout!
    children: [
      { path: '/admin/dashboard', element: <Dashboard /> },
      { path: '/admin/users', element: <Users /> },
    ],
  },
]);
```

Different parts of your app can have completely different layouts — different navbars, sidebars, footers — all managed declaratively through route nesting.

---

## ✅ Key Takeaways

- Use **layout routes** with `children` to wrap multiple pages with shared UI (navigation, headers, footers)
- The `<Outlet />` component marks where child route elements should render inside the parent layout
- This avoids repeating layout components in every page — add it once in the layout, done
- Layout routes use `path: '/'` as a wrapper, with actual pages as nested children

## ⚠️ Common Mistakes

- Forgetting to add `<Outlet />` in the layout component — child pages won't render at all
- Trying to use `Link` outside the router context (above `RouterProvider`) — it will crash
- Confusing `<Outlet />` with `{children}` — `Outlet` is specific to React Router, not React's children prop

## 💡 Pro Tips

- You can nest layouts multiple levels deep: a root layout → a section layout → page components
- Add CSS module styles to your layout for consistent spacing and design across all pages
- The `<Outlet />` can receive a `context` prop to pass data to child routes
