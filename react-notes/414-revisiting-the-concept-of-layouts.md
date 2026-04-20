# Revisiting The Concept Of Layouts

## Introduction

We briefly touched on layouts earlier. Now let's go deeper — especially into **nested layouts** — because understanding how layouts stack is essential as your Next.js project grows.

---

## Layouts Are Wrappers Around Pages

The core idea: a layout wraps page content. The active page gets injected via the `children` prop. When the user navigates to a different page, the layout stays — only the `children` content swaps out.

```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

This root layout is always active. Every page in your entire app renders inside it.

---

## Nested Layouts

You can add a `layout.js` inside any route folder to create a layout that only applies to that folder's pages.

### Example: A Meals Layout

```jsx
// app/meals/layout.js
export default function MealsLayout({ children }) {
  return (
    <>
      <p>Meals Layout</p>
      {children}
    </>
  );
}
```

### What Happens?

- Visit `/` → You see the homepage. The meals layout is **not** active.
- Visit `/meals` → You see "Meals Layout" text **plus** the meals page content.
- Visit `/meals/share` → Same meals layout is active, wrapping the share page content.

### Key Rule: Nested Layouts Don't Replace the Root

The meals layout doesn't replace the root layout. It nests **inside** it. The hierarchy looks like:

```
Root Layout
└── Meals Layout
    └── Page Content
```

The root layout is always the outermost wrapper. A nested layout adds an additional layer for its specific route segment.

---

## How `children` Flows Through Layouts

Think of it as a nesting doll (matryoshka):

1. Root layout receives `children` — which might be a nested layout or page
2. If there's a nested layout, it receives `children` — which is the page
3. The page renders its content

```
RootLayout({ children: MealsLayout({ children: MealsPage }) })
```

---

## When to Use Nested Layouts

Use a nested layout when a group of pages share common UI that other pages don't need:

- A dashboard sidebar that only appears on dashboard pages
- A navigation bar specific to a section
- A shared heading or breadcrumb for a group of pages

If the shared UI belongs on **all** pages, put it in the root layout instead.

---

## ✅ Key Takeaways

- Nested layouts only apply to pages in their folder and any sub-folders
- They nest **inside** the root layout — they don't replace it
- The `children` prop represents pages or further nested layouts
- Use nested layouts for section-specific shared UI
- You don't always need nested layouts — the root layout alone is often sufficient

## ⚠️ Common Mistakes

- Assuming a nested layout replaces the root layout
- Adding a nested layout when the root layout would suffice (over-engineering)

## 💡 Pro Tip

If you're unsure whether you need a nested layout, start without one. You can always add it later. Nested layouts are powerful, but unnecessary complexity in small projects just adds confusion.
