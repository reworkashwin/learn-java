# Exercise: Setting Up Routes for the Foodies App

## Introduction

Before we fill pages with content, we need the **routing skeleton** in place. This exercise reinforces everything we've learned about file-based routing in Next.js by creating the routes our Foodies App needs.

---

## The Task

Create the following routes:

| Route | Purpose |
|---|---|
| `/meals` | Browse all shared meals |
| `/meals/share` | Share a new meal with the community |
| `/meals/[slug]` | View details of a specific meal (dynamic) |
| `/community` | The Foodies community page |

Each route should render a simple component with a title — the content doesn't matter yet. We'll build it out in later lectures.

Optionally, add `Link` components so users can navigate between these pages.

---

## Key Considerations

### Static vs Dynamic

Notice that under `/meals`, we need both:
- A **static** route: `/meals/share` (a specific page for sharing)
- A **dynamic** route: `/meals/[slug]` (for viewing any specific meal)

This means we'll have two sibling folders inside `meals/`:

```
app/meals/
├── page.js           ← /meals
├── share/
│   └── page.js       ← /meals/share
└── [slug]/
    └── page.js       ← /meals/:slug
```

### Why This Works

Next.js is smart. When you visit `/meals/share`, it sees the static `share/` folder and activates that page. When you visit `/meals/pasta-salad`, there's no matching static folder, so the dynamic `[slug]` folder handles it.

**Static routes always win over dynamic routes** at the same level.

---

## Adding Navigation Links

On the homepage, you can add links using the `Link` component:

```jsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <h1>NextLevel Food</h1>
      <p><Link href="/meals">Meals</Link></p>
      <p><Link href="/meals/share">Share a Meal</Link></p>
      <p><Link href="/community">Community</Link></p>
    </>
  );
}
```

---

## ✅ Key Takeaways

- The Foodies App requires 4 routes: meals listing, meal sharing, meal details (dynamic), and community
- Static routes (`share/`) take precedence over dynamic routes (`[slug]`) at the same level
- Each route needs a folder + `page.js` pair
- Add `Link` components for SPA-style navigation

## 💡 Pro Tip

Don't worry about styling or content at this stage. Getting the routing structure right first means you can focus on building features without restructuring later. Routing is the skeleton — content is the flesh.
