# Adding CSS Modules

## Introduction

Our investment calculator app works and looks decent — but all the styles live in a single `index.css` file. As apps grow, a monolithic stylesheet becomes a nightmare to maintain. In this section, we learn how to **split styles into CSS Modules** — scoped, per-component CSS files that prevent naming collisions and keep your code organized. We also touch on when inline styles are appropriate.

---

## Concept 1: Inline Styles for Quick One-Off Fixes

### 🧠 What is it?

Inline styling in React means passing a JavaScript object to the `style` prop on an HTML element. It's the most direct way to apply styles without touching a CSS file.

### ❓ Why do we need it?

Sometimes you have a tiny, one-off style fix — like centering a fallback paragraph. Creating a whole CSS class for that is overkill.

### ⚙️ How it works

```jsx
<p style={{ textAlign: 'center' }}>No investment calculated yet.</p>
```

The double curly braces aren't a special syntax — the outer braces are the JSX expression wrapper, and the inner braces create a JavaScript object.

### 💡 Insight

Inline styles are fine for simple, isolated cases, but they don't support pseudo-selectors (`:hover`), media queries, or animations. For anything beyond trivial styling, use CSS files.

---

## Concept 2: What Are CSS Modules?

### 🧠 What is it?

CSS Modules are a build-tool feature (supported out of the box in Create React App) that **scopes CSS class names to a specific component**. You name your CSS file with the `.module.css` extension, and the build process generates unique class names at compile time.

### ❓ Why do we need it?

In a large app, you might have a `.button` class in five different files. Without scoping, they'd all conflict. CSS Modules solve this by automatically transforming `.button` into something like `.Button_button__2FnKz` — unique to that component.

### ⚙️ How it works

1. **Name the file** with `.module.css`: e.g., `Header.module.css`
2. **Import it** as a JavaScript object:
   ```javascript
   import classes from './Header.module.css';
   ```
3. **Use it** via the imported object:
   ```jsx
   <header className={classes.header}>...</header>
   ```

The `classes` object maps your original class names to the auto-generated unique names.

### 🧪 Example

**Header.module.css:**
```css
.header {
  background-color: #4a0e78;
  padding: 1rem;
}
```

**Header.js:**
```jsx
import classes from './Header.module.css';

const Header = () => {
  return <header className={classes.header}>Investment Calculator</header>;
};
```

At runtime, `classes.header` resolves to something like `Header_header__xK29f`, ensuring no other `.header` class in the app interferes.

### 💡 Insight

CSS Modules are not a React-specific feature — they're a build-tool feature. Webpack (which Create React App uses under the hood) handles the transformation. This means the CSS you write is still plain CSS — no new syntax to learn.

---

## Concept 3: Migrating Styles to CSS Modules

### 🧠 What is it?

The process of taking styles from a single global `index.css` file and distributing them into component-specific `.module.css` files.

### ❓ Why do we need it?

Splitting styles by component makes your codebase more maintainable. When you need to change a component's look, you know exactly which file to edit. You also eliminate the risk of accidental style collisions.

### ⚙️ How it works

Here's the step-by-step migration:

1. **Create module CSS files** for each component:
   - `Header.module.css`
   - `UserInput.module.css`
   - `ResultsTable.module.css`

2. **Cut the relevant styles** from `index.css` and paste them into the appropriate module file

3. **Import and apply** in each component:

```jsx
// UserInput.js
import classes from './UserInput.module.css';

// In JSX:
<form className={classes.form}>
  <div className={classes['input-group']}>
    {/* inputs */}
  </div>
  <div className={classes.actions}>
    <button className={classes.button}>Calculate</button>
    <button className={classes.buttonAlt}>Reset</button>
  </div>
</form>
```

4. **Leave only global styles** (like body/html defaults) in `index.css`

### 🧪 Example

For a class name with a dash (like `input-group`), you can't use dot notation:

```jsx
// ❌ Won't work — JavaScript thinks it's subtraction
className={classes.input-group}

// ✅ Use bracket notation instead
className={classes['input-group']}
```

### 💡 Insight

This is why many React developers prefer camelCase class names in their CSS Modules (e.g., `.inputGroup` instead of `.input-group`). It keeps the JSX cleaner with dot notation.

---

## Concept 4: What Stays in index.css?

### 🧠 What is it?

After migrating component-specific styles, `index.css` should only contain **global, page-level styles** — things like body background, font defaults, CSS resets, or global color variables.

### ❓ Why do we need it?

Some styles genuinely apply to the entire page and don't belong to any single component. Keeping them in a global file is the right call.

### ⚙️ How it works

```css
/* index.css — only global styles remain */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Open Sans', sans-serif;
  background-color: #1f1f1f;
}
```

Everything else lives in component-specific module files.

---

## ✅ Key Takeaways

- **CSS Modules** scope class names to a component, preventing naming collisions
- Name files with `.module.css` and import them as JavaScript objects
- Use **bracket notation** (`classes['my-class']`) for class names containing dashes
- Keep only **global styles** in `index.css` — everything else goes into module files
- The result is the **same visual appearance**, but with much better code organization

## ⚠️ Common Mistakes

- Forgetting to rename the file with `.module.css` — without the `.module` part, the classes won't be scoped
- Using dot notation for class names with dashes — JavaScript interprets the dash as a minus operator
- Importing the CSS file without the `classes from` syntax — `import './style.module.css'` won't give you the scoped class names

## 💡 Pro Tips

- CSS Modules work seamlessly alongside other approaches — you can mix them with inline styles or even styled-components in the same project
- If you want to apply multiple CSS Module classes to one element, use template literals: `` className={`${classes.primary} ${classes.large}`} ``
- CSS Modules support `:global(.className)` syntax when you intentionally want a class to be unscoped
