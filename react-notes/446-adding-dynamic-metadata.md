# Adding Dynamic Metadata in Next.js

## Introduction

We've already learned how to add static metadata to our Next.js pages — but what about pages where the content changes based on the URL? Think about a blog post page or a product detail page: the title and description in the browser tab should reflect the actual content being displayed, not some generic text.

That's where **dynamic metadata** comes in. Next.js gives us a powerful tool — the `generateMetadata` function — that lets us produce metadata on the fly based on the route parameters. Let's see how it works and how to handle edge cases like invalid URLs.

---

## Concept 1: The `generateMetadata` Function

### 🧠 What is it?

Instead of exporting a static `metadata` object from your page file, you can export an **async function** called `generateMetadata`. Next.js looks for this function automatically — if it doesn't find a static `metadata` export, it checks for `generateMetadata`, executes it, and uses whatever metadata object you return.

### ❓ Why do we need it?

Static metadata is great for pages like "About" or "Contact" where the title never changes. But for **dynamic routes** — like `/meals/[slug]` — the metadata needs to match the actual content. You want the browser tab to say "Spaghetti Bolognese" when viewing that meal, not just "Meal Details."

### ⚙️ How it works

1. Export an `async function generateMetadata(props)` from your dynamic page file
2. This function receives the **same props** as your page component — including `params`
3. Use `params` to fetch the relevant data (e.g., the meal based on the slug)
4. Return a metadata object with `title`, `description`, etc.

```jsx
export async function generateMetadata({ params }) {
  const meal = getMeal(params.mealSlug);

  return {
    title: meal.title,
    description: meal.summary,
  };
}
```

### 🧪 Example

When a user visits `/meals/spaghetti-bolognese`, Next.js:
1. Calls `generateMetadata` with `{ params: { mealSlug: 'spaghetti-bolognese' } }`
2. You fetch the meal data using that slug
3. You return `{ title: 'Spaghetti Bolognese', description: 'A classic Italian...' }`
4. The browser tab now shows "Spaghetti Bolognese" instead of a generic title

### 💡 Insight

The naming matters! The function **must** be called `generateMetadata` — Next.js looks for this exact name, just like it looks for `metadata` as a static export. This is part of Next.js's convention-over-configuration approach.

---

## Concept 2: Handling Invalid Routes in `generateMetadata`

### 🧠 What is it?

When a user enters an invalid slug (e.g., `/meals/nonexistent-meal`), the `generateMetadata` function runs **before** the page component. If you try to access properties like `meal.title` on an undefined meal, the function crashes — and instead of showing your nice "Not Found" page, the user sees an ugly error.

### ❓ Why do we need it?

Metadata generation happens first. If it fails, Next.js can't even get to your page component where you might have your own `notFound()` check. So you need to handle this edge case **inside `generateMetadata` itself**.

### ⚙️ How it works

Add a simple check inside `generateMetadata`:

```jsx
export async function generateMetadata({ params }) {
  const meal = getMeal(params.mealSlug);

  if (!meal) {
    notFound();
  }

  return {
    title: meal.title,
    description: meal.summary,
  };
}
```

If the meal isn't found, call `notFound()` from `next/navigation`. This triggers the closest `not-found.js` page instead of crashing.

### 🧪 Example

- User visits `/meals/xyz123` → `getMeal('xyz123')` returns `undefined`
- Without the check: crash! Error page shown
- With the check: `notFound()` is called → the custom "Meal not found" page is displayed gracefully

### 💡 Insight

This is a common pattern: **always guard your data access in `generateMetadata`**. Since this function runs independently from your page component, any data validation you have in the page component won't protect `generateMetadata`. Duplicate the check — it's a small price for a robust user experience.

---

## ✅ Key Takeaways

- Use `generateMetadata` (async function) instead of a static `metadata` export for dynamic pages
- The function receives the same `params` as your page component
- Always add a `notFound()` guard inside `generateMetadata` for invalid routes
- Metadata is generated **before** the page component renders

## ⚠️ Common Mistakes

- Forgetting to handle `undefined` data in `generateMetadata` — this causes crashes instead of 404 pages
- Naming the function incorrectly — it **must** be `generateMetadata`, not `getMetadata` or anything else
- Only adding the `notFound()` check in the page component but not in `generateMetadata`

## 💡 Pro Tips

- You can use the same data-fetching logic in both `generateMetadata` and your page component — Next.js will deduplicate fetch requests automatically
- Think of `generateMetadata` as a "parallel" step that runs alongside (or before) your page — treat it as its own mini data-fetching boundary
