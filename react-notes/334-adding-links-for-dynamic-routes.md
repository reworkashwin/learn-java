# Adding Links for Dynamic Routes

## Introduction

We know how to define dynamic routes and read their parameters. But how do we **create links that point to those dynamic routes**? You can't hard-code every link if the data is dynamic. In real applications, you'll be generating links from data — typically an array of items fetched from an API. Let's see how to connect dynamic data to dynamic routes with proper links.

---

## Building Links from Dynamic Data

Imagine you have a list of products (fetched from a backend in a real app):

```jsx
const PRODUCTS = [
  { id: 'p1', title: 'Product 1' },
  { id: 'p2', title: 'Product 2' },
  { id: 'p3', title: 'Product 3' },
];
```

Instead of writing separate `<Link>` components for each, you **map** over the data and generate links dynamically:

```jsx
import { Link } from 'react-router-dom';

function ProductsPage() {
  return (
    <ul>
      {PRODUCTS.map((prod) => (
        <li key={prod.id}>
          <Link to={`/products/${prod.id}`}>{prod.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### What's Happening Here

1. We iterate over the products array with `.map()`
2. For each product, we render a `<li>` with a `<Link>` inside
3. The `to` prop uses a **template literal** to insert the product's `id` into the URL
4. The link text is the product's `title`

This approach scales to any number of items — whether you have 3 products or 3 million.

---

## Using `Link` vs `NavLink` Here

Notice we use `Link` instead of `NavLink` for these product links. Why?

- `NavLink` is for **navigation menus** where you want active-state highlighting
- `Link` is for **content links** that navigate the user away from the current page

When clicking a product link, you're leaving the products page entirely — there's no need to highlight which product link was clicked. Different tools for different jobs.

---

## Relative Paths for Cleaner Links

Instead of constructing the full absolute path with template literals:

```jsx
<Link to={`/products/${prod.id}`}>
```

You can use a **relative path** that appends to the currently active route:

```jsx
<Link to={prod.id}>
```

If you're already on `/products`, this link resolves to `/products/p1`, `/products/p2`, etc. It's cleaner and more maintainable — if you ever change the parent path, these links automatically adapt.

---

## ✅ Key Takeaways

- Generate links dynamically by mapping over your data array
- Use template literals or relative paths to construct the `to` prop
- Use `Link` for content navigation, `NavLink` for nav menus
- Relative paths (without leading `/`) append to the current route path

## ⚠️ Common Mistakes

- Forgetting the `key` prop when rendering lists of links
- Using absolute paths everywhere when relative paths would be simpler and more maintainable

## 💡 Pro Tip

Relative paths are especially powerful in nested route structures. If you restructure your routes and move things around, relative links keep working because they don't depend on the full path structure. Prefer them when linking to sibling or child routes.
