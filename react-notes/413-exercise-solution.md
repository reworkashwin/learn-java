# Exercise Solution: Setting Up Routes

## Introduction

Let's walk through the solution step-by-step. Creating routes in Next.js follows a consistent pattern: create a folder, add a `page.js`, export a component. Once you internalize this pattern, setting up routes becomes second nature.

---

## Step 1: The Meals Route

Inside the `app/` folder, create a `meals/` folder with a `page.js`:

```jsx
// app/meals/page.js
export default function MealsPage() {
  return <h1>Meals Page</h1>;
}
```

Visit `/meals` → you see "Meals Page". Done.

---

## Step 2: The Nested Share Route

Inside `meals/`, create a `share/` folder with its own `page.js`:

```jsx
// app/meals/share/page.js
export default function ShareMealPage() {
  return <h1>Share Meal</h1>;
}
```

Visit `/meals/share` → you see "Share Meal".

---

## Step 3: The Community Route

Back at the top level of `app/`, create a `community/` folder (a sibling to `meals/`, not nested inside it):

```jsx
// app/community/page.js
export default function CommunityPage() {
  return <h1>Community</h1>;
}
```

Visit `/community` → you see "Community".

---

## Step 4: The Dynamic Meal Details Route

Inside `meals/`, create a `[mealSlug]/` folder (a sibling to `share/`):

```jsx
// app/meals/[mealSlug]/page.js
export default function MealDetailsPage() {
  return <h1>Meal Details</h1>;
}
```

The final folder structure:

```
app/
├── layout.js
├── page.js
├── meals/
│   ├── page.js
│   ├── share/
│   │   └── page.js
│   └── [mealSlug]/
│       └── page.js
└── community/
    └── page.js
```

---

## Step 5: Adding Navigation Links

On the homepage, add links using the `Link` component:

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

## Static Routes Win Over Dynamic

An important behavior to remember: visiting `/meals/share` activates the `share/` folder's page, **not** the `[mealSlug]/` page — even though "share" could technically be a value for the dynamic segment. Next.js is smart enough to prioritize the specifically named static folder.

But visiting `/meals/abc`, `/meals/something`, or `/meals/my-meal` — anything that doesn't match a static folder — activates the dynamic `[mealSlug]/page.js`.

---

## ✅ Key Takeaways

- Creating routes follows a repeatable pattern: folder + `page.js` + exported component
- Nested routes = nested folders
- Sibling static and dynamic routes coexist — static always wins
- After running `npm install`, start the dev server with `npm run dev`

## ⚠️ Common Mistakes

- Putting `community/` inside `meals/` instead of as a sibling
- Forgetting square brackets for the dynamic route folder name
- Not running `npm install` before `npm run dev` in a fresh project

## 💡 Pro Tip

The placeholder name inside square brackets (e.g., `mealSlug`) is entirely up to you. Pick something descriptive that tells future-you what kind of value this segment represents. `[slug]` is generic; `[mealSlug]` is more informative.
