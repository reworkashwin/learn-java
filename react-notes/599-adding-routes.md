# Adding Routes

## Introduction

Now that we understand what routing is and have React Router installed, it's time to actually **define some routes**. We need to tell React Router: "When the URL is `/`, show the posts page. When it's `/create-post`, show the new post form." This is where we move from theory to practice — configuring the router, defining paths, and connecting components to URLs.

---

## Concept 1: RouterProvider and createBrowserRouter

### 🧠 What is it?

React Router v6.4+ uses two key pieces to set up routing:
- `createBrowserRouter` — a function that creates a router configuration (an array of route definitions)
- `RouterProvider` — a component that receives the router config and activates routing in your app

### ❓ Why do we need both?

Think of `createBrowserRouter` as writing the map (which paths lead where), and `RouterProvider` as handing that map to your app so it can follow it.

### ⚙️ How it works

```jsx
// main.jsx
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
```

Instead of rendering `<App />` directly, you now render `<RouterProvider>` and pass it the router configuration. This tells React Router to take over — it watches the URL and renders the appropriate component.

### 💡 Insight

The `RouterProvider` replaces your root component. Everything rendered by your app now flows through React Router. If a URL doesn't match any defined route, React Router will show an error.

---

## Concept 2: Defining Route Objects

### 🧠 What is it?

Each route is a plain JavaScript object with at least two properties:
- `path` — the URL path to match
- `element` — the JSX to render when the path matches

### ⚙️ How it works

```jsx
const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create-post', element: <NewPost /> },
]);
```

- Visiting `yoursite.com/` renders `<App />`
- Visiting `yoursite.com/create-post` renders `<NewPost />`
- Visiting any other path shows a route-not-found error

### 🧪 Example

```jsx
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import NewPost from './NewPost';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create-post', element: <NewPost /> },
]);

function Main() {
  return <RouterProvider router={router} />;
}
```

### 💡 Insight

The `element` property accepts any JSX — it doesn't have to be a single component. You could put `<h1>Hello</h1>` there if you wanted. But in practice, you'll always point to a component.

---

## Concept 3: What Happens When a Route Matches

### 🧠 What is it?

When you navigate to a path, React Router finds the matching route definition and renders only that route's `element`. The rest of your app's components (like headers, sidebars) won't appear unless they're part of that element.

### ❓ Why does this matter?

This explains a common surprise when setting up routes: if you navigate to `/create-post`, you'll see the `NewPost` component *alone* — without any navigation bar or layout from your main app. The other route (`/`) and its component are completely gone.

### 🧪 Example

- Visit `/` → you see the full app with header and posts
- Visit `/create-post` → you see *only* the new post form, no header, no posts list

This is not ideal! We want shared elements like the navigation bar to persist across routes. That's where **layout routes** come in (next lesson).

### 💡 Insight

Each route is independent by default. If you want shared UI across routes, you need to explicitly set that up using layout routes and the `Outlet` component.

---

## ✅ Key Takeaways

- Use `createBrowserRouter` to define an array of route objects with `path` and `element`
- Wrap your app with `RouterProvider` and pass it the router configuration
- Each route renders its element **independently** — no shared layout by default
- Unmatched paths will trigger a React Router error page
- The path `'/'` matches the root URL of your app

## ⚠️ Common Mistakes

- Rendering `<App />` directly instead of through `<RouterProvider>` — routing won't work
- Expecting shared UI (like headers) to persist across routes without layout routes
- Forgetting to import route components before using them in `element`

## 💡 Pro Tips

- Keep your route definitions in one place (like `main.jsx`) for easy overview of your app's structure
- Use the `path: '/'` route as your "home" or landing page
- Test your routes by manually typing URLs in the address bar to verify they load the correct components
