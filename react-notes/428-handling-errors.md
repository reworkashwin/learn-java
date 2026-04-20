# Handling Errors

## Introduction

Things go wrong. Databases go down, network requests fail, code throws unexpected exceptions. In Next.js, you can handle these errors gracefully by creating a special `error.js` file — similar to how `loading.js` handles loading states. This ensures your users see a friendly error page instead of a broken screen.

---

## The Default Error Experience

Without any error handling, if a component throws an error (say, a database query fails), Next.js shows a **development error overlay** with the stack trace. In production, it would show a generic error page. Neither is a great user experience.

---

## The `error.js` File

Just like `page.js`, `layout.js`, and `loading.js`, Next.js recognizes `error.js` as a special file name. When an error occurs in a page (or any nested page/layout), the closest `error.js` file in the folder hierarchy will be rendered instead.

```jsx
'use client';

export default function Error() {
  return (
    <main className="error">
      <h1>An error occurred!</h1>
      <p>Failed to fetch meal data. Please try again later.</p>
    </main>
  );
}
```

### Wait — Why `'use client'`?

This is a requirement. The `error.js` component **must** be a Client Component. Next.js enforces this so that the error boundary can catch errors that happen **on the client side** too (not just during server rendering). If you forget it, Next.js will tell you with a clear error message.

---

## How Error Boundaries Work

The `error.js` file leverages React's **Error Boundary** pattern:

1. An error is thrown somewhere in a page or component
2. Next.js looks for the nearest `error.js` file in the folder hierarchy
3. That error component is rendered in place of the broken page
4. The rest of the application continues working

### Scope

- An `error.js` in `app/meals/` catches errors from the meals page and any nested pages
- An `error.js` in `app/` catches errors from **any page** in the application
- You can be as granular or as broad as you want

### The `error` Prop

The error component receives an `error` prop from Next.js:

```jsx
'use client';

export default function Error({ error }) {
  return (
    <main className="error">
      <h1>An error occurred!</h1>
      <p>{error.message}</p>
    </main>
  );
}
```

However, be cautious: Next.js intentionally hides detailed error messages in production to prevent leaking sensitive information. The `error` object may not contain the full details you'd see in development.

---

## ✅ Key Takeaways

- Add an `error.js` file to handle errors in the corresponding page and nested routes
- The error component **must** use `'use client'` — this is enforced by Next.js
- It works like React Error Boundaries, catching rendering errors at the specified level
- Place it at the root `app/` level for app-wide error handling, or nest it for granular control

## ⚠️ Common Mistakes

- Forgetting the `'use client'` directive on the error component
- Displaying raw `error.message` in production — it might expose internal details

## 💡 Pro Tip

You can create different error pages at different levels of your app. A meals-specific error page can say "Failed to load meals," while a root-level error page can show a generic "Something went wrong" message.
