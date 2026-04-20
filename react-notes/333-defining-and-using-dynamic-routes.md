# Defining & Using Dynamic Routes

## Introduction

Imagine you're building an online store. You have a products page showing a list of products. When the user clicks on a product, they should see the details for **that specific product**. But you can't hard-code a separate route for every product — you might have 10, 100, or 10,000 products, and they're added dynamically. This is where **dynamic routes** (also called path parameters or dynamic path segments) come in, and they're one of the most crucial features in React Router.

---

## The Problem: Hard-Coding Doesn't Scale

You might think about defining routes like this:

```jsx
<Route path="/products/p1" element={<ProductDetail />} />
<Route path="/products/p2" element={<ProductDetail />} />
<Route path="/products/p3" element={<ProductDetail />} />
```

This is obviously terrible. You'd need a new route definition for every product. And since products are added dynamically (from a database, by admins), you can't know them in advance. Hard-coding is a dead end.

---

## Dynamic Path Segments to the Rescue

React Router lets you define **dynamic segments** in your paths using the colon `:` syntax:

```jsx
{ path: '/products/:productId', element: <ProductDetail /> }
```

The `:productId` part is a **placeholder**. It tells React Router: "Match anything in this position and capture it under the name `productId`." So all of these URLs would match:

- `/products/p1`
- `/products/p2`
- `/products/abc`
- `/products/anything-at-all`

The same `ProductDetail` component renders for all of them. The identifier after the colon (`productId`) is **your choice** — call it `id`, `slug`, `itemCode`, whatever makes sense.

---

## Reading the Dynamic Value with `useParams`

Matching the route is only half the story. You also need to **read the actual value** from the URL so you can fetch the right data. React Router provides the `useParams` hook for this:

```jsx
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const params = useParams();

  return (
    <div>
      <h1>Product Details</h1>
      <p>Product ID: {params.productId}</p>
    </div>
  );
}
```

### How It Works

- `useParams()` returns a plain JavaScript object
- Each dynamic segment in your route definition becomes a **property** on that object
- The property name matches the identifier you used after the colon

If your route is `:productId`, you access `params.productId`. If you used `:id`, you'd access `params.id`. They must match.

---

## You Can Have Multiple Dynamic Segments

Routes can have multiple dynamic parts:

```jsx
{ path: '/products/:category/:productId', element: <ProductDetail /> }
```

Then `useParams()` gives you both:

```js
const { category, productId } = useParams();
// URL: /products/electronics/p42
// category = "electronics", productId = "p42"
```

---

## You Can Mix Static and Dynamic Segments

You can also have static segments after dynamic ones:

```jsx
{ path: '/products/:productId/edit', element: <EditProduct /> }
```

This matches `/products/p1/edit`, `/products/abc/edit`, etc. The `edit` part is fixed; only the middle segment is dynamic.

---

## ✅ Key Takeaways

- Use `:paramName` in your route path to define dynamic segments
- `useParams()` returns an object with the actual values from the URL
- The param name in the object matches the identifier after the colon in the route definition
- One route definition handles unlimited dynamic URLs — no hard-coding needed

## ⚠️ Common Mistakes

- Mismatching the param name: defining `:productId` in the route but trying to access `params.id` in the component
- Forgetting the colon — `products/productId` is a literal string, not a dynamic segment

## 💡 Pro Tip

In a real app, you'd use the dynamic param to fetch data from a backend API. The URL `/products/p42` tells your component "fetch and display data for product p42." This is the foundation for any data-driven application.
