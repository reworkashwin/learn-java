# Throwing Not Found Errors For Individual Meals

## Introduction

What happens when a user tries to visit a meal detail page for a meal that doesn't exist — like `/meals/great-bolo`? The database query returns `undefined`, and when the code tries to access properties on `undefined`, it crashes. Instead of showing a generic error, we should show a **not found** page. Next.js gives us the `notFound()` function to trigger this programmatically.

---

## The Problem

If a user navigates to `/meals/some-nonexistent-slug`, the `getMeal()` function returns `undefined` (no matching row in the database). The page component then tries to access `meal.instructions`, which throws a runtime error.

The error boundary (`error.js`) catches this and shows "An error occurred!" — but that's misleading. It's not an error; the meal simply **doesn't exist**. A 404 "Not Found" page is the appropriate response.

---

## The Solution: `notFound()`

Next.js provides a `notFound` function from `next/navigation` that you can call programmatically to trigger the nearest `not-found.js` page:

```jsx
import { notFound } from 'next/navigation';
import { getMeal } from '@/lib/meals';

export default function MealDetailsPage({ params }) {
  const meal = getMeal(params.mealSlug);

  if (!meal) {
    notFound();
  }

  // ...render the meal details
}
```

Calling `notFound()` immediately stops the component from executing and renders the closest `not-found.js` file in the folder hierarchy.

---

## Adding a Meal-Specific Not Found Page

For a better user experience, create a `not-found.js` file inside the `app/meals/[mealSlug]/` folder:

```jsx
export default function NotFound() {
  return (
    <main className="not-found">
      <h1>Meal not found</h1>
      <p>Unfortunately, we could not find the requested page or meal data.</p>
    </main>
  );
}
```

Now, when someone visits a nonexistent meal, they see a helpful, context-specific message instead of a generic error.

---

## How `notFound()` Resolves the Right Page

When `notFound()` is called:

1. Next.js looks for a `not-found.js` file in the **current directory**
2. If none is found, it walks **up** the folder hierarchy
3. It renders the first `not-found.js` it finds
4. If an `error.js` is closer than a `not-found.js`, the error page is shown instead

That's why adding a `not-found.js` at the same level as your page ensures the right fallback is displayed.

---

## ✅ Key Takeaways

- Use `notFound()` from `next/navigation` to programmatically trigger a 404 page
- Always check if your data exists before rendering — especially with dynamic routes
- Create specific `not-found.js` files at the appropriate folder level for contextual messages
- `notFound()` stops component execution — no need for an `else` block after it

## ⚠️ Common Mistakes

- Not checking for `undefined` data before accessing properties — this causes runtime errors instead of clean 404 pages
- Relying on `error.js` to handle "not found" cases — use `notFound()` for semantic correctness

## 💡 Pro Tip

The `notFound()` pattern is ideal anywhere you fetch a single resource by ID or slug. If the resource doesn't exist, call `notFound()` right away — it keeps your rendering logic clean and your error handling accurate.
