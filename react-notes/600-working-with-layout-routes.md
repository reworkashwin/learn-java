# Working with Layout Routes

## Introduction

We've got routes working, but there's a problem: navigating between routes makes shared UI elements like the navigation bar disappear. Each route renders in complete isolation. What if you want a header that's visible on **every** page? You don't want to duplicate it inside every route component.

This is exactly what **layout routes** solve. They let you define a shared wrapper (a layout) that persists across multiple routes, while the inner content changes based on the active path.

---

## Concept 1: The Shared Layout Problem

### 🧠 What is it?

When you define separate routes, each one renders its `element` independently. Shared elements like navigation bars, footers, or sidebars vanish when you switch routes.

### ❓ Why is this a problem?

In most apps, you want certain UI elements to be **consistent** across all pages. A user expects the navigation bar to always be there, regardless of which page they're on. Without layout routes, you'd have to include the header in every single route component — violating the DRY principle.

### 💡 Insight

Think of a layout route like a picture frame. The frame stays the same, but the picture inside changes. The navigation bar is the frame; the route content is the picture.

---

## Concept 2: Creating a Layout Route

### 🧠 What is it?

A layout route is just a regular route that **wraps other routes** using the `children` property. It provides shared UI that surrounds the nested route content.

### ⚙️ How it works

1. Create a layout component (e.g., `RootLayout`) that renders shared elements
2. Define a route with `path: '/'` and `element: <RootLayout />`
3. Move your other routes into the `children` array of this layout route

### 🧪 Example

**Route configuration:**
```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '/', element: <Posts /> },
      { path: '/create-post', element: <NewPost /> },
    ],
  },
]);
```

**RootLayout component:**
```jsx
import { Outlet } from 'react-router-dom';
import MainHeader from '../components/MainHeader';

function RootLayout() {
  return (
    <>
      <MainHeader />
      <Outlet />
    </>
  );
}

export default RootLayout;
```

### 💡 Insight

The `children` property is what makes a route a "layout route." Without it, it's just a normal route. With it, React Router knows to render the child routes *inside* this component.

---

## Concept 3: The Outlet Component

### 🧠 What is it?

`Outlet` is a special component from `react-router-dom` that acts as a **placeholder** for nested route content. It tells React Router: "Render the active child route's element right here."

### ❓ Why do we need it?

Without `Outlet`, React Router wouldn't know *where* inside the layout to place the child route's content. The layout would render the header but nothing else — the child routes would have nowhere to go.

### ⚙️ How it works

- Import `Outlet` from `react-router-dom`
- Place it in your layout component wherever you want the nested content to appear
- React Router automatically injects the matching child route's element at that position

### 🧪 Example

```jsx
import { Outlet } from 'react-router-dom';

function RootLayout() {
  return (
    <>
      <MainHeader />
      <Outlet />  {/* Child route content renders here */}
    </>
  );
}
```

When the path is `/`, `<Outlet />` renders `<Posts />`. When the path is `/create-post`, it renders `<NewPost />`. The `<MainHeader />` stays visible in both cases.

### 💡 Insight

`Outlet` is like a slot in a template. The layout defines the structure, and `Outlet` marks the spot where dynamic content gets inserted. If you forget to add `Outlet`, your nested routes simply won't appear.

---

## Concept 4: Organizing Route Components

### 🧠 What is it?

As your app grows, it's helpful to organize components into folders:
- `routes/` — components that are loaded as route elements
- `components/` — reusable components used inside routes

### ❓ Why bother?

This separation makes it clear which components are "pages" (loaded by the router) and which are "building blocks" (used within pages). It's a convention, not a requirement, but it improves maintainability.

### 🧪 Example folder structure

```
src/
  routes/
    RootLayout.jsx
    Posts.jsx
    NewPost.jsx
  components/
    MainHeader.jsx
    PostsList.jsx
    Post.jsx
    Modal.jsx
```

### 💡 Insight

This is just a convention — React doesn't care where your files live. But future-you (and your teammates) will thank you for the organization.

---

## ✅ Key Takeaways

- **Layout routes** wrap other routes to provide shared UI elements (headers, sidebars, etc.)
- Use the `children` array to nest routes inside a layout route
- The `Outlet` component marks where child route content should be rendered
- Always add `<Outlet />` in your layout — without it, nested routes won't display
- Organize your components into `routes/` and `components/` folders for clarity

## ⚠️ Common Mistakes

- Forgetting to add `<Outlet />` in the layout component — child routes will be invisible
- Including shared elements (like headers) in both the layout AND child components — causes duplication
- Not moving routes into the `children` array — they won't benefit from the layout

## 💡 Pro Tips

- You can nest layout routes inside other layout routes for complex multi-level layouts
- The `Outlet` component can be placed anywhere in your JSX — between other elements, inside a `<main>` tag, etc.
- Layout routes don't have to define a visible `path` — they can just serve as UI wrappers
