# Populating The Starting Page Content

## Introduction

With the header done, let's build out the homepage — the very first page users see when they visit our Foodies App. This means working on the root `page.js` file (directly in the `app/` folder), adding a hero section, call-to-action links, and some descriptive content.

---

## CSS Modules Work on Pages Too

Pages in Next.js are just React components treated specially for routing. But they're still components, which means you can use CSS Modules on them just like any other component:

```jsx
import classes from './page.module.css';
```

Create a `page.module.css` file alongside your `page.js` and it works exactly the same way.

---

## Structuring the Homepage

The homepage is built with two main sections: a **header area** (hero section) and a **main content area**.

### The Hero Section

```jsx
import Link from 'next/link';
import classes from './page.module.css';

export default function HomePage() {
  return (
    <>
      <header className={classes.header}>
        <div className={classes.slideshow}>
          {/* Image slideshow will go here */}
        </div>
        <div>
          <div className={classes.hero}>
            <h1>NextLevel Food for NextLevel Foodies</h1>
            <p>Taste and share food from all over the world.</p>
          </div>
          <div className={classes.cta}>
            <Link href="/community">Join the Community</Link>
            <Link href="/meals">Explore Meals</Link>
          </div>
        </div>
      </header>
      <main>
        {/* Descriptive sections go here */}
      </main>
    </>
  );
}
```

### Anatomy of the Structure

| Element | Purpose |
|---|---|
| `header` with `classes.header` | The full hero section at the top |
| `div.slideshow` | Placeholder for an image carousel (built next) |
| `div.hero` | The catchy title and tagline |
| `div.cta` | Call-to-action links to community and meals pages |
| `main` | Additional descriptive content about the platform |

### Using Fragments

Since we have a `<header>` and `<main>` as siblings, they need to be wrapped in a Fragment (`<>...</>`) because React components must return a single root element.

---

## The Call-to-Action Pattern

The CTA section uses two `Link` components that guide users to the most important parts of the app:

```jsx
<div className={classes.cta}>
  <Link href="/community">Join the Community</Link>
  <Link href="/meals">Explore Meals</Link>
</div>
```

This is a common web design pattern — give users clear, prominent actions to take right from the landing page.

---

## The Slideshow Placeholder

Notice the empty `div.slideshow`. This is where we'll add an auto-scrolling image carousel in the next lecture. Leaving it as a placeholder keeps our work incremental — get the structure right first, then add interactive features.

---

## ✅ Key Takeaways

- The root `page.js` in the `app/` folder is the homepage (renders at `/`)
- CSS Modules work on page files just like any other component
- Structure your homepage with a hero section and descriptive content
- Use `Link` components for CTAs that navigate within the app
- Use Fragments to return multiple sibling elements

## 💡 Pro Tip

Build your pages incrementally. Get the structure and layout right with placeholder content, then iterate on the details. Trying to build everything at once leads to bugs that are harder to track down.
