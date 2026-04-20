# Adding a Second Route

## Introduction

One route is nice, but the whole point of routing is having **multiple** pages. Let's add a second route and see how React Router handles switching between them.

---

## Adding the Products Page Component

Create a new page component:

```jsx
// pages/Products.js
export default function ProductsPage() {
  return <h1>The Products Page</h1>;
}
```

Still a dummy component, but enough to prove the routing works.

---

## Defining the Second Route

Add another object to your route definitions array:

```jsx
const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductsPage /> },
]);
```

That's all it takes. Each route is an object with a path and an element. The router checks the current URL against all defined paths and renders the matching one.

---

## Testing It

- Visit `localhost:3000/` → "My Home Page"
- Visit `localhost:3000/products` → "The Products Page"
- Visit `localhost:3000/anything-else` → **Error!**

The first two work as expected. The third one throws an error because `react-router-dom` can't find a matching route for `/anything-else` and generates a default error page.

We'll handle that gracefully with error pages in a later lecture.

---

## How Route Matching Works

When the URL changes, React Router:

1. Iterates through your route definitions
2. Compares the current path against each route's `path` property
3. Renders the `element` of the first matching route
4. If no route matches → generates an error

```
URL: /products
  Route "/"        → doesn't match
  Route "/products" → MATCH → render <ProductsPage />
```

---

## ✅ Key Takeaways

- Adding routes is as simple as adding objects to the array passed to `createBrowserRouter`
- Each route needs a unique path and an element to render
- Visiting an unsupported URL generates a default error — we'll customize this later
- Route matching is automatic: React Router handles URL comparison for you

## 💡 Pro Tips

- You can add as many routes as your app needs — the array can grow to dozens or hundreds of routes
- Keep your route definitions in one central place (like `App.js`) for easy overview of your app's page structure
