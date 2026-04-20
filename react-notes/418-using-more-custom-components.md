# Using More Custom Components

## Introduction

As your Next.js project grows, breaking things into smaller components keeps code manageable and readable. This lecture demonstrates a common workflow: extracting parts of a layout into separate component files and organizing them into logical sub-folders.

---

## Extracting the Header Background

The root layout has a decorative `<div>` with an SVG graphic that renders behind the header. This can be pulled into its own component:

```jsx
// components/main-header/main-header-background.js
import classes from './main-header-background.module.css';

export default function MainHeaderBackground() {
  return (
    <div className={classes['header-background']}>
      <svg>{/* ... SVG content ... */}</svg>
    </div>
  );
}
```

### Bracket Notation for Hyphenated Class Names

The class name `header-background` contains a hyphen, which is invalid in JavaScript dot notation. Use bracket notation instead:

```jsx
// ❌ Won't work — hyphens break dot notation
classes.header-background

// ✅ Works — bracket notation with string key
classes['header-background']
```

---

## CSS Module Migration

When extracting a component, also extract its related CSS from the global stylesheet into a CSS Module:

1. **Cut** the relevant styles from `globals.css`
2. **Paste** them into a new `main-header-background.module.css` file
3. **Update** the CSS selectors to work with CSS Modules (scope nested selectors inside a class)
4. **Import** the module in the component file

---

## Composing Components with Fragments

The `MainHeaderBackground` visually belongs with the `MainHeader`, so we can render it as a sibling inside the same component using a React Fragment:

```jsx
// components/main-header/main-header.js
import MainHeaderBackground from './main-header-background';

export default function MainHeader() {
  return (
    <>
      <MainHeaderBackground />
      <header className={classes.header}>
        {/* logo and navigation */}
      </header>
    </>
  );
}
```

The Fragment (`<>...</>`) lets us return multiple sibling elements without adding an unnecessary wrapper div.

---

## Organizing Related Files into Sub-Folders

Group related files together:

```
components/
└── main-header/
    ├── main-header.js
    ├── main-header.module.css
    ├── main-header-background.js
    └── main-header-background.module.css
```

This keeps the `components/` folder clean. Each "feature" gets its own sub-folder with all its files in one place.

After moving files, update import paths. Most IDEs handle this automatically, but always double-check.

---

## ✅ Key Takeaways

- Extract reusable or logically distinct UI into separate components
- Use bracket notation (`classes['my-class']`) for CSS class names with hyphens
- When extracting components, extract their CSS into CSS Modules too
- Use React Fragments to return sibling elements without wrapper divs
- Group related component files into sub-folders for organization

## ⚠️ Common Mistakes

- Forgetting to update import paths after moving files into sub-folders
- Using dot notation for hyphenated CSS Module class names
- Leaving orphaned styles in `globals.css` after extracting them

## 💡 Pro Tip

You don't have to extract everything into separate components. Do it when a piece of UI is complex enough to benefit from isolation, or when it logically belongs as its own unit. Over-extracting into tiny components can make code harder to follow.
