# CSS Styling & CSS Modules

## Introduction

We've got components with dynamic data, but they look terrible — white text on white, no visual separation between components. Styling is essential for any real application. React offers multiple approaches for styling components, and in this lesson we'll explore the most important ones — from inline styles to global CSS classes to the recommended approach: **CSS Modules**.

---

## Concept 1: Inline Styles in JSX

### 🧠 What is it?

You can add styles directly to JSX elements using the `style` attribute, similar to inline styles in regular HTML. But there's a crucial difference in how you write them.

### ❓ Why do we need it?

Inline styles are useful for quick, one-off styling or dynamically computed styles. They're the simplest way to add a style but not the best for large-scale applications.

### ⚙️ How it works

In JSX, the `style` attribute does **not** accept a string. Instead, it accepts a **JavaScript object**:

```jsx
// ❌ WRONG — string syntax doesn't work in JSX
<p style="color: red; text-align: left;">Hello</p>

// ✅ CORRECT — pass a JavaScript object
<p style={{ color: 'red', textAlign: 'left' }}>Hello</p>
```

The "double curly braces" isn't a special syntax — it's:
- The outer `{}` = dynamic expression syntax (standard JSX)
- The inner `{}` = a JavaScript object literal

Also notice: CSS property names use **camelCase** in JSX (`textAlign` instead of `text-align`).

### 💡 Insight

Inline styles are fine for quick experiments, but just like in vanilla HTML/CSS, they're generally considered bad practice for production code. They don't support pseudo-classes, media queries, or animations, and they bloat your JSX.

---

## Concept 2: Global CSS Classes

### 🧠 What is it?

You can define CSS classes in a `.css` file and assign them to JSX elements. This is the most familiar approach if you're coming from regular HTML/CSS.

### ⚙️ How it works

In your CSS file:
```css
.post {
  background-color: lightblue;
  padding: 1rem;
}
```

In your JSX — and this is important — you use `className` instead of `class`:

```jsx
<div className="post">
  <p>Content here</p>
</div>
```

### 🧪 Example

Why `className` and not `class`? Because JSX is actually JavaScript, not HTML. In JavaScript's DOM API, the property for setting CSS classes on elements is called `className` (since `class` is a reserved keyword in JavaScript). JSX follows this convention.

### ⚠️ Key Gotcha

**`className`** — not `class`. This is one of the most common mistakes beginners make. React will warn you if you use `class`, but your styles won't apply correctly.

### 💡 Insight

Global CSS works fine for small projects, but it has a fundamental problem: **name collisions**. If two different components both use a `.post` class, their styles will clash. In a large application with many components, this becomes a nightmare.

---

## Concept 3: CSS Modules — Scoped Styles

### 🧠 What is it?

**CSS Modules** is a styling approach where CSS classes are automatically **scoped to the component** that uses them. This means a `.post` class in one component will never clash with a `.post` class in another component — guaranteed.

### ❓ Why do we need it?

In large applications, you'll have many components, and many of them might use similar class names (`.container`, `.title`, `.button`). With global CSS, these would conflict. CSS Modules solve this by transforming your class names into **unique, generated names** behind the scenes.

### ⚙️ How it works

**Step 1: Create a CSS file with `.module.css` extension**

```
Post.module.css   ← The ".module" part is critical
```

The `.module` in the filename tells Vite/CRA: "Use CSS Modules for this file."

**Step 2: Write normal CSS inside it**

```css
/* Post.module.css */
.post {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.author {
  font-weight: bold;
  color: #333;
}

.text {
  color: #666;
}
```

**Step 3: Import it differently in your component**

```jsx
// Regular CSS import (global):
import './styles.css';

// CSS Modules import (scoped):
import classes from './Post.module.css';
```

With CSS Modules, you import an **object** (named `classes`, `styles`, or whatever you prefer). This object contains your class names as keys, with the auto-generated unique names as values.

**Step 4: Use the class names from the imported object**

```jsx
function Post({ author, body }) {
  return (
    <div className={classes.post}>
      <p className={classes.author}>{author}</p>
      <p className={classes.text}>{body}</p>
    </div>
  );
}
```

Note: You use the **dynamic expression syntax** `{}` because you're referencing JavaScript values, not writing literal strings.

### 🧪 Example

What happens behind the scenes:

| What you write | What the browser sees |
|---------------|----------------------|
| `classes.post` | `_post_x7k2j_1` |
| `classes.author` | `_author_x7k2j_2` |
| `classes.text` | `_text_x7k2j_3` |

The build tools generate guaranteed-unique class names. Two different components using `.post` in their own CSS Modules will get different generated names — no collision possible.

### 💡 Insight

If you inspect the rendered HTML in your browser's developer tools, you'll see these transformed class names. They look weird, but that's by design. The uniqueness guarantee is what makes CSS Modules reliable at scale.

---

## Concept 4: CSS Modules File Conventions

### 🧠 What is it?

CSS Module files follow specific naming conventions and are typically placed next to the component they style.

### ⚙️ How it works

```
src/
  components/
    Post.jsx              ← Component
    Post.module.css       ← Styles for Post (co-located)
    PostsList.jsx         ← Component
    PostsList.module.css  ← Styles for PostsList (co-located)
```

This co-location pattern keeps related files together, making it easy to find the styles for any given component.

---

## ✅ Key Takeaways

- Use `className` instead of `class` in JSX — this is non-negotiable
- **Inline styles** use JavaScript objects with camelCase properties: `style={{ color: 'red' }}`
- **Global CSS** works but risks class name collisions in larger projects
- **CSS Modules** (`.module.css`) auto-generate unique class names to prevent collisions
- Import CSS Modules as an object: `import classes from './Post.module.css'`
- Reference classes with dynamic syntax: `className={classes.post}`
- Place `.module.css` files next to their component files

## ⚠️ Common Mistakes

- Using `class` instead of `className` — the most common React styling mistake
- Passing a string to the `style` attribute instead of a JavaScript object
- Forgetting the `.module` part in the CSS filename — without it, CSS Modules won't work
- Importing CSS Modules like a regular CSS file (`import './Post.module.css'`) — you need `import classes from ...`
- Forgetting to use curly braces when setting `className` from the classes object

## 💡 Pro Tips

- CSS Modules is the recommended approach for this course and works great for most projects
- The classes object property names match exactly what you wrote in the CSS file — `.post` becomes `classes.post`
- You can combine CSS Modules with other approaches if needed — they're not mutually exclusive
