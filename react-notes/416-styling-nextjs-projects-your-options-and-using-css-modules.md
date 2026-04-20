# Styling Next.js Projects: Your Options & Using CSS Modules

## Introduction

The header is in place. Now it needs to look good. When it comes to styling in Next.js, you have several options. Let's explore them and then dive deep into **CSS Modules** — the approach we'll use for this project.

---

## Styling Options in Next.js

### 1. Global CSS Files

You've already seen this. Import a CSS file in the root `layout.js` and its styles apply everywhere:

```jsx
import './globals.css';
```

Good for base styles, resets, and utility classes. But every class name is global — one component's `.button` class could accidentally affect another component.

### 2. Tailwind CSS

Extremely popular and well-supported in Next.js. You style elements by adding utility classes directly in JSX:

```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded">Click</button>
```

When creating a Next.js project, you're even asked if you want Tailwind. But for a learning context, adding dozens of utility classes to every element distracts from the main topic.

### 3. CSS Modules

Standard CSS, but **scoped to specific components**. This is our choice for this project.

---

## How CSS Modules Work

### The Naming Convention

CSS Modules use a special file naming pattern:

```
component-name.module.css
```

The `.module.css` extension is what makes it a CSS Module. Without it, it's just a regular CSS file.

### The Import Pattern

Instead of importing the file directly, you import an **object**:

```jsx
import classes from './main-header.module.css';
```

This `classes` object automatically contains every CSS class defined in the file as a property.

### Using Classes

Instead of hardcoded string class names, you reference properties on the imported object:

```jsx
// ❌ Regular CSS (global, can collide)
<header className="header">

// ✅ CSS Modules (scoped, collision-free)
<header className={classes.header}>
```

### Full Example

```css
/* main-header.module.css */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav {
  /* navigation styles */
}
```

```jsx
// main-header.js
import classes from './main-header.module.css';

export default function MainHeader() {
  return (
    <header className={classes.header}>
      <Link href="/" className={classes.logo}>
        {/* logo content */}
      </Link>
      <nav className={classes.nav}>
        {/* nav content */}
      </nav>
    </header>
  );
}
```

---

## Why CSS Modules Are Great

### Scoped by Default

The class names get transformed at build time into unique strings like `main-header_header_xK3j2`. This means:

- Two components can both define a `.button` class without conflicts
- Styles are guaranteed to only affect the component they belong to
- No accidental cascading issues

### Standard CSS

You write normal CSS — no new syntax to learn (unlike Tailwind or styled-components). If you know CSS, you know CSS Modules.

### No Runtime Overhead

The scoping happens at build time, not at runtime. There's no JavaScript running to inject styles — it's all compiled to regular CSS files.

---

## ✅ Key Takeaways

- Next.js supports global CSS, Tailwind, CSS Modules, and other styling approaches
- CSS Modules use the `.module.css` file extension
- Import CSS Modules as objects and access class names as properties
- Classes are automatically scoped to the component — no global collisions
- Use `className={classes.myClass}` instead of `className="myClass"`

## ⚠️ Common Mistakes

- Importing a CSS Module like a global file (`import './styles.module.css'`) — this won't give you scoped access
- Using string class names instead of the imported object properties
- Forgetting the `.module` part of the filename — without it, scoping doesn't work

## 💡 Pro Tip

For class names with hyphens (like `header-background`), you can't use dot notation. Use bracket notation instead: `classes['header-background']`. Or just name your classes with camelCase (`headerBackground`) if you prefer dot notation.
