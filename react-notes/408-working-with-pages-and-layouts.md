# Working with Pages & Layouts

## Introduction

You know about `page.js` — it defines the content of a route. But there's another special file that's just as important: `layout.js`. If `page.js` is the content of a room, then `layout.js` is the walls, ceiling, and floor — the **shell** that wraps around one or more pages.

Every Next.js project needs at least one root layout. Let's understand why and how it works.

---

## What Is a Layout?

A layout is a React component that acts as a **wrapper** around pages. It defines the persistent UI structure that stays the same as users navigate between pages — things like headers, footers, sidebars, or the basic HTML skeleton.

### The Root Layout

Every Next.js project requires a root `layout.js` file at the top of the `app/` folder. This is the outermost shell of your entire application.

```
app/
├── layout.js    ← Root layout (required)
├── page.js      ← Home page content
└── about/
    └── page.js  ← About page content
```

Here's what a typical root layout looks like:

```jsx
export const metadata = {
  title: 'My App',
  description: 'A great Next.js application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### What's Happening Here?

1. **HTML skeleton**: Unlike regular React components, the root layout renders `<html>` and `<body>` tags. This is required — you're literally defining the HTML document shell.

2. **`children` prop**: This is the magic glue. Whatever page is currently active gets injected here. When you're on `/`, the home `page.js` content fills `children`. When you navigate to `/about`, the about `page.js` content fills `children` instead.

3. **`metadata` export**: Instead of manually adding `<head>` and `<title>` tags, Next.js uses this special exported object to set the page title, description, and other metadata automatically.

---

## How Layout and Page Work Together

Think of it like a picture frame:
- **Layout** = the frame (stays the same)
- **Page** = the picture inside the frame (changes as you navigate)

```
┌─────────── Layout ───────────┐
│  Header / Nav                │
│  ┌─────── Page ───────────┐  │
│  │  (current page content)│  │
│  └────────────────────────┘  │
│  Footer                     │
└──────────────────────────────┘
```

---

## Nested Layouts

You're not limited to just one layout. You can add a `layout.js` file inside any route folder to create a **nested layout** that only applies to pages within that folder.

```
app/
├── layout.js          ← Root layout (all pages)
├── page.js
└── about/
    ├── layout.js      ← Nested layout (only about pages)
    └── page.js
```

The nested layout wraps only the pages in the `about/` folder (and any deeper folders), but it itself is wrapped by the root layout. The root layout is **always active**.

---

## The `metadata` Export

Instead of fiddling with `<head>` tags, you export a `metadata` object:

```jsx
export const metadata = {
  title: 'NextLevel Food',
  description: 'Delicious meals, shared by a food-loving community.',
};
```

This sets the `<title>` and `<meta name="description">` tags automatically. The metadata from a layout applies to **all pages** covered by that layout.

---

## ✅ Key Takeaways

- `layout.js` defines the **wrapper** around pages; `page.js` defines the **content**
- Every Next.js project needs a root `layout.js` with `<html>` and `<body>` tags
- The `children` prop in a layout represents the currently active page
- Nested layouts are possible and are themselves wrapped by the root layout
- Use the `metadata` export to set page title and description — no manual `<head>` required

## ⚠️ Common Mistakes

- Forgetting the root `layout.js` — Next.js requires it
- Trying to add `<head>` tags manually instead of using `metadata`
- Not understanding that nested layouts don't replace the root layout — they nest inside it

## 💡 Pro Tip

The `metadata` export works in both `layout.js` and `page.js` files. Metadata in a `page.js` file overrides what the layout sets — so you can have a default title from the layout but customize it for specific pages.
