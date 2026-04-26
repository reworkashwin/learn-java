# Adding Basic CSS Styling

## Introduction

Our `ExpenseItem` component has structure but no style — it's functional but ugly. Time to fix that. Styling in React uses regular CSS, but there are a few React-specific things you need to know, like how to import CSS files and why you write `className` instead of `class`.

---

### Concept 1: Adding a CSS File for a Component

#### 🧠 What is it?

For each component, you typically create a **dedicated CSS file** that lives right next to the component's JavaScript file. This keeps your styles organized and co-located with the component they belong to.

#### ⚙️ How it works

For `ExpenseItem.js`, create `ExpenseItem.css` in the same folder:

```
src/
  components/
    ExpenseItem.js
    ExpenseItem.css
```

Then write your CSS classes inside that file — standard CSS, nothing React-specific about the actual styles.

---

### Concept 2: Importing CSS into a Component

#### 🧠 What is it?

Creating a CSS file isn't enough — you need to **explicitly tell React** (really, the build process) about it by importing it in your component file.

#### ⚙️ How it works

```jsx
// ExpenseItem.js
import './ExpenseItem.css';

function ExpenseItem() {
  return (
    <div className="expense-item">
      {/* ... */}
    </div>
  );
}
```

#### ❓ Why do we need it?

The build process doesn't automatically scan for CSS files. The `import` statement tells it: "Hey, include the styles from this CSS file in the application." Without the import, your styles won't be applied.

#### 💡 Insight

Importing CSS into JavaScript isn't valid in standard JavaScript — it only works because the build process handles it. The build process takes the CSS and injects it into the page for you.

---

### Concept 3: className, Not class

#### 🧠 What is it?

In JSX, you use **`className`** instead of `class` to apply CSS classes to elements.

#### ❓ Why do we need it?

Remember — JSX isn't HTML. It's JavaScript under the hood. And `class` is a **reserved keyword** in JavaScript (used for defining classes). To avoid conflicts, the React team renamed the attribute to `className`.

#### 🧪 Example

**❌ Don't do this (technically works but incorrect):**
```jsx
<div class="expense-item">
```

**✅ Do this:**
```jsx
<div className="expense-item">
```

#### 💡 Insight

Most HTML attributes work the same in JSX, but a few are renamed to avoid JavaScript keyword conflicts. `className` is the most common one you'll encounter. Another example: `htmlFor` instead of `for` on label elements.

---

### Concept 4: Applying CSS Classes to Elements

#### 🧠 What is it?

Once your CSS file is imported and you know about `className`, applying styles is straightforward — just add `className` attributes to your JSX elements.

#### 🧪 Example

```jsx
import './ExpenseItem.css';

function ExpenseItem() {
  return (
    <div className="expense-item">
      <div>March 28th, 2021</div>
      <div className="expense-item__description">
        <h2>Car Insurance</h2>
        <div className="expense-item__price">$249.67</div>
      </div>
    </div>
  );
}
```

Each `className` maps to a CSS class defined in `ExpenseItem.css`, applying the corresponding styles.

---

### Concept 5: CSS in React Is Just Standard CSS

#### 🧠 What is it?

There's nothing special about the CSS itself in React. You use all the same selectors, properties, and techniques you already know.

#### ⚙️ How it works

- Class selectors, ID selectors, pseudo-classes — all work normally
- Media queries, flexbox, grid — all standard
- The only React-specific part is the **import** and **`className`** convention

#### 💡 Insight

React doesn't dictate how you write CSS. There are many approaches (CSS Modules, styled-components, Tailwind, etc.) that you'll explore later. For now, plain CSS files with class-based styling work perfectly.

---

## ✅ Key Takeaways

- Create a CSS file next to your component file for organized, co-located styles
- **Import** the CSS file in your component — the build process won't find it automatically
- Use **`className`** instead of `class` in JSX (because `class` is a reserved JS keyword)
- The actual CSS is standard — nothing React-specific about the styles themselves
- The import statement is what makes the build process inject your CSS into the page

---

## ⚠️ Common Mistakes

- Forgetting to import the CSS file — your styles simply won't appear
- Using `class` instead of `className` — it technically works but triggers warnings and is incorrect
- Assuming CSS files are auto-discovered — they're not; you must explicitly import them

---

## 💡 Pro Tips

- Name your CSS file the same as your component file for easy association (`ExpenseItem.js` → `ExpenseItem.css`)
- Use BEM naming convention (like `expense-item__price`) to keep your CSS organized and avoid selector conflicts
- Later in the course, you'll learn about **CSS Modules** and **styled-components** for more scoped styling approaches
