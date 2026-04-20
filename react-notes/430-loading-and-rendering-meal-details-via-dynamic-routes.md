# Loading & Rendering Meal Details via Dynamic Routes & Route Parameters

## Introduction

Clicking on a meal in the grid should take you to a detail page showing the full recipe — title, image, creator info, and step-by-step instructions. This lecture covers how to **extract dynamic route parameters**, **fetch a single record** from the database, and **render HTML content safely** in React.

---

## Setting Up the Detail Page

The detail page lives at `app/meals/[mealSlug]/page.js` — the `[mealSlug]` folder creates a **dynamic route** that matches any value in that URL segment.

### The Page Structure

```jsx
import Image from 'next/image';
import { getMeal } from '@/lib/meals';
import classes from './page.module.css';

export default function MealDetailsPage({ params }) {
  const meal = getMeal(params.mealSlug);

  meal.instructions = meal.instructions.replace(/\n/g, '<br />');

  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image src={meal.image} alt={meal.title} fill />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.title}</h1>
          <p className={classes.creator}>
            by <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
          </p>
          <p className={classes.summary}>{meal.summary}</p>
        </div>
      </header>
      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{ __html: meal.instructions }}
        />
      </main>
    </>
  );
}
```

---

## Getting Route Parameters via Props

Every component in a `page.js` file receives special props from Next.js. One of the most important is `params`, which contains the dynamic segments from the URL.

For a route like `app/meals/[mealSlug]/page.js`:
- URL: `/meals/spaghetti-bolognese`
- `params.mealSlug` → `"spaghetti-bolognese"`

The key name (`mealSlug`) matches the folder name in square brackets (`[mealSlug]`).

---

## Fetching a Single Meal

In `lib/meals.js`, add a function to fetch one meal by its slug:

```javascript
export function getMeal(slug) {
  return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
}
```

Key details:
- Use `.get()` instead of `.all()` — we want **one row**, not many
- Use `?` as a placeholder for the slug value to **prevent SQL injection**
- Pass the actual value to `.get(slug)` — the library safely interpolates it

### Why Not String Interpolation?

```javascript
// ❌ DANGEROUS — SQL injection vulnerability!
db.prepare(`SELECT * FROM meals WHERE slug = '${slug}'`).get();

// ✅ SAFE — parameterized query
db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
```

Never concatenate user input directly into SQL strings. Always use parameterized queries.

---

## Rendering HTML Content With `dangerouslySetInnerHTML`

The meal instructions are stored as plain text with line breaks. To render them as formatted HTML, we:

1. Replace `\n` characters with `<br />` tags
2. Use `dangerouslySetInnerHTML` to render the HTML string

```jsx
meal.instructions = meal.instructions.replace(/\n/g, '<br />');

<p dangerouslySetInnerHTML={{ __html: meal.instructions }} />
```

The prop is named "dangerously" on purpose — it reminds you that rendering raw HTML can expose your app to **cross-site scripting (XSS)** attacks if the content isn't sanitized. Only use it with trusted content.

---

## The `mailto:` Link Pattern

To let users email a meal's creator:

```jsx
<a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
```

Clicking this link opens the user's default email app with the address pre-filled.

---

## ✅ Key Takeaways

- Dynamic route params are accessed via `params` prop in page components
- The param key name matches the `[folderName]` in the app directory
- Use `.get()` for single-row queries a `.all()` for multiple rows
- **Always** use parameterized queries (`?` placeholders) to prevent SQL injection
- Use `dangerouslySetInnerHTML` to render HTML content — but only from trusted sources

## ⚠️ Common Mistakes

- Using string interpolation in SQL queries instead of parameterized placeholders
- Forgetting that `getMeal` might return `undefined` if no meal matches the slug
- Using `dangerouslySetInnerHTML` with unsanitized user input — potential XSS vulnerability

## 💡 Pro Tip

If `getMeal` doesn't use `async`, don't make the page component `async` either. Keep things synchronous when possible — it simplifies the code and avoids unnecessary promise handling.
