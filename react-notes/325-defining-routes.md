# Defining Routes

## Introduction

This is Step 1 of adding routing: defining which URLs your app supports and which components should render for each URL. React Router provides a clean, declarative way to do this.

---

## Creating the Router with `createBrowserRouter`

Import `createBrowserRouter` from `react-router-dom`. This function takes an **array of route definition objects** and returns a router:

```jsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
]);
```

Each object in the array represents one route with:
- **`path`** — the URL path (the part after the domain)
- **`element`** — the JSX that should render when this path is active

### What Is a "Path"?

The path is everything after your domain name:

```
https://example.com/products
         ↑ domain      ↑ path = "/products"

https://example.com/
         ↑ domain      ↑ path = "/" (root/home)
```

So `path: '/'` means "this route is active when we're on the root of our site."

---

## Creating Page Components

Create a `pages/` folder to hold components that represent full pages:

```jsx
// pages/Home.js
export default function HomePage() {
  return <h1>My Home Page</h1>;
}
```

The `pages/` folder name is a convention — it signals that these components are loaded by the router, not embedded in other components. You could name it `routes/` or even just use `components/`.

---

## Rendering the Router with `RouterProvider`

Having a router definition isn't enough — you need to tell React to **use** it. Import `RouterProvider` and render it in your `App` component:

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/Home';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

`RouterProvider` accepts a `router` prop — pass the router you created with `createBrowserRouter`. Now React Router:

1. Watches the current URL
2. Matches it against your route definitions
3. Renders the matching `element`

### Testing It

Visit `localhost:3000` → you see "My Home Page"  
Visit `localhost:3000/` → same thing (the slash is optional)

That's your first route working.

---

## The Complete Flow

```
User visits localhost:3000
  → RouterProvider is rendered
  → Router checks current path: "/"
  → Matches route with path: "/"
  → Renders <HomePage />
  → User sees "My Home Page"
```

---

## ✅ Key Takeaways

- Use `createBrowserRouter` to define an array of route objects with `path` and `element` properties
- Use `RouterProvider` to render the router and activate it in your app
- The `path` is the URL segment after the domain — `'/'` is the root/home page
- Store page components in a `pages/` folder as a naming convention

## ⚠️ Common Mistakes

- Forgetting to pass the router to `RouterProvider`'s `router` prop — the app won't know about your routes
- Defining the router inside the component function — define it **outside** to avoid recreating it on every render
- Confusing the `element` prop (takes JSX like `<HomePage />`) with a component reference (would be `HomePage` without angle brackets)

## 💡 Pro Tips

- You can render additional JSX alongside `RouterProvider` in your App component, though it's uncommon
- Route matching is handled automatically — you don't need to write any URL parsing logic
