# Module Summary — React Router

## Introduction

This wraps up a massive section on React Router. Let's consolidate everything you've learned about building multi-page single-page applications.

---

## What You Learned

### Route Configuration Fundamentals
- How to **configure routes** so different components load for different URL paths
- How to set up **layouts** that wrap around multiple routes using parent routes
- How to work with **nested routes** to compose complex page structures

### Error Handling
- How to handle errors with **error elements** that display when something goes wrong
- How to throw error responses from loaders and actions

### Data Fetching & Submission
- **Loaders** — Functions that fetch data before a route component renders
- **Actions** — Functions triggered when forms are submitted
- **`useLoaderData`** and **`useRouteLoaderData`** — Hooks for accessing loader data in components
- **`useActionData`** — Hook for accessing data returned by actions

### Advanced Features
- **`useFetcher`** — Fetch or submit data **behind the scenes** without triggering navigation. Perfect for inline updates, newsletter signups, or any background operation
- **Deferring data** with `defer`, `<Await>`, and `<Suspense>` — Show pages before all data is loaded. Use the `await` keyword inside `defer` to control which data blocks navigation and which loads after the page renders

---

## When to Use What

| Feature | Use Case |
|---------|----------|
| `loader` | Pre-fetch data a page needs before rendering |
| `action` | Handle form submissions (create, update, delete) |
| `useFetcher` | Background operations that shouldn't trigger page navigation |
| `defer` | Pages with slow requests where you want to show partial content |
| Nested routes | Shared layouts, tabbed interfaces, parent-child relationships |

---

## ✅ Key Takeaways

- Routing is essential for any real-world React application
- React Router's data fetching and submission features (`loader`, `action`) make server communication much simpler
- You don't always need `defer` — use it only when you need to show content before all data arrives
- `useFetcher` is your tool for behind-the-scenes data operations
- These concepts build on each other — revisit individual topics as needed when building real applications

💡 **Pro Tip:** Once you start building complex React apps, you'll use routing in nearly every project. Understanding loaders, actions, and deferred data will make data handling feel effortless.
