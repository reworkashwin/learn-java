# Storing Component Style Files Next To Components

## Introduction

We've split components into separate files. Now let's do the same for **CSS styles** — moving component-specific styles out of one big CSS file and placing them right next to their components.

---

## Why Split CSS Files?

Having all your styles in a single `index.css` file works, but as your project grows, it becomes hard to know which styles belong to which component. Splitting them offers:

- **Clarity** — you instantly see which styles relate to which component
- **Maintainability** — editing styles for one component doesn't risk breaking others
- **Organization** — component code and styles live side by side

---

## How to Do It

### Step 1: Create a Component-Specific CSS File

Add a CSS file next to your component — for example, `Header.css` next to `Header.jsx`:

```
components/
├── Header.jsx
└── Header.css
```

### Step 2: Move Relevant Styles

Cut the header-related CSS rules from `index.css` and paste them into `Header.css`.

### Step 3: Import the CSS File in the Component

In `Header.jsx`, add an import at the top:

```jsx
import './Header.css';
```

The build process picks up this import and includes the CSS in the final page.

---

## The Important Caveat: Styles Are NOT Scoped

Here's something critical to understand:

> Importing a CSS file in a component does **NOT** limit those styles to that component.

If your `Header.css` has rules targeting the `<header>` element, those rules will apply to **every** `<header>` element on the page — not just the one in your `Header` component.

```css
/* Header.css */
header {
  background: blue;
}
/* This applies to ALL <header> elements, not just the Header component's */
```

This is a limitation of regular CSS imports. Later in a React course, you'll learn about solutions like **CSS Modules** or **styled-components** that actually scope styles to specific components.

---

## Optional: Sub-Folders for Components

You can take organization one step further by creating a folder for each component that holds both the JSX and CSS files:

```
components/
├── Header/
│   ├── Header.jsx
│   └── Header.css
└── CoreConcept.jsx
```

When you do this, remember to update import paths:

```jsx
// In App.jsx:
import Header from './components/Header/Header.jsx';

// In Header.jsx (going up TWO levels to reach src/):
import logo from '../../assets/logo.png';
```

---

## ✅ Key Takeaways

- Split CSS into **component-specific files** for better organization
- Import CSS files in the component with `import './Component.css'`
- CSS imports are **not scoped** — styles apply globally across the page
- Optionally use **sub-folders** to group component files and styles together
- Always adjust **relative import paths** when restructuring folders

## ⚠️ Common Mistakes

- Assuming CSS imports are scoped to the component — they aren't
- Forgetting to update relative paths for images and assets after moving files into sub-folders
- Not importing the CSS file — the styles simply won't be applied

## 💡 Pro Tips

- Even though styles aren't scoped, splitting CSS still improves developer experience significantly
- Use unique class names or BEM naming conventions to avoid style conflicts
- Solutions like **CSS Modules** (`Header.module.css`) provide true scoping — you'll learn about them later
