# Handling "Not Found" States

## Introduction

What happens when a user visits a URL that doesn't exist? Like `/my-meals` or `/unicorns`? Next.js shows a default 404 page — but you can customize it by creating a `not-found.js` file. It's another one of those special reserved filenames that Next.js recognizes automatically.

---

## The Default 404 Page

Out of the box, Next.js shows a basic "404 | This page could not be found" message. It works, but it doesn't match your app's design or provide helpful guidance to the user.

---

## Customizing the Not Found Page

Create a `not-found.js` file in the `app/` directory:

```jsx
export default function NotFound() {
  return (
    <main className="not-found">
      <h1>Not found</h1>
      <p>Unfortunately, we could not find the requested page or resource.</p>
    </main>
  );
}
```

Now any invalid URL across your entire application will show this custom page instead.

---

## Scope and Granularity

Like `error.js` and `loading.js`, the `not-found.js` file follows the folder hierarchy:

- Place it in `app/` → covers **all** invalid routes globally
- Place it in `app/meals/` → covers invalid routes under `/meals/...`
- You can have a **global** fallback and **specific** ones for different sections

This lets you show different messages depending on context:
- Global: "Page not found"
- Under `/meals/`: "Meal not found — try browsing our collection"

---

## ✅ Key Takeaways

- Create a `not-found.js` file to customize the 404 page
- Place it at the app root for global coverage, or nest it for section-specific messages
- Unlike `error.js`, the not-found component does **not** require `'use client'`

## 💡 Pro Tip

You can also **programmatically trigger** the not-found page from your code using the `notFound()` function from `next/navigation`. We'll see this in action when handling individual meal lookups that return no results.
