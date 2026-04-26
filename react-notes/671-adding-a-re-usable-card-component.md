# Adding a Reusable Card Component

## Introduction

Our AddUser form works, but it looks plain — no rounded corners, no shadows, no visual container. In this section, we build a **reusable Card component** that wraps any content in a styled container. Along the way, we learn about the `props.children` pattern, CSS Modules for component-level styling, and how to merge external and internal CSS classes on a custom component.

---

## Concept 1: The `props.children` Pattern

### 🧠 What is it?

`props.children` is a special prop in React that gives you access to whatever content is placed **between the opening and closing tags** of your component. It's the foundation of wrapper components.

### ❓ Why do we need it?

Imagine you want a Card component that provides a visual container (white background, rounded corners, shadow) — but you don't want to hardcode what goes inside it. One time it wraps a form, another time a list, another time a modal. `props.children` lets you build this kind of flexible wrapper.

### ⚙️ How it works

```jsx
// Card.js
const Card = (props) => {
  return <div>{props.children}</div>;
};

// Usage:
<Card>
  <form>
    <input type="text" />
    <button>Submit</button>
  </form>
</Card>
```

Whatever you put between `<Card>` and `</Card>` becomes `props.children` inside the Card component.

### 🧪 Example

Think of `Card` like a picture frame. The frame provides the border and decoration, but you can put any picture inside it. `props.children` is the picture — it's whatever content you slide into the frame.

### 💡 Insight

`props.children` can be anything — text, JSX elements, other components, even functions. It's one of React's most powerful composition patterns.

---

## Concept 2: Styling the Card with CSS Modules

### 🧠 What is it?

We create a `Card.module.css` file with the visual styles for our card container and import it using CSS Modules.

### ⚙️ How it works

**Card.module.css:**
```css
.card {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  border-radius: 10px;
}
```

**Card.js:**
```jsx
import classes from './Card.module.css';

const Card = (props) => {
  return <div className={classes.card}>{props.children}</div>;
};

export default Card;
```

The CSS Modules import gives us scoped class names — `classes.card` resolves to a unique, auto-generated string at build time.

### 💡 Insight

Three CSS properties do all the heavy lifting here: `background` gives the white surface, `box-shadow` adds depth, and `border-radius` rounds the corners. Simple but effective.

---

## Concept 3: Merging External and Internal CSS Classes

### 🧠 What is it?

When using your Card in different contexts, you might want to add additional CSS classes on top of the Card's built-in styling. For example, the AddUser component might want to add its own `input` class alongside the Card's `card` class.

### ❓ Why do we need it?

A reusable component needs to support customization. If the Card only ever applies its own `card` class, you can't add context-specific styling when you use it. You need a way to merge both.

### ⚙️ How it works

The key insight: **custom components don't automatically handle `className`**. Unlike built-in HTML elements, your Card component has no idea what to do with a `className` prop unless you explicitly use it.

```jsx
// Card.js — accepts and merges className from outside
const Card = (props) => {
  return (
    <div className={`${classes.card} ${props.className}`}>
      {props.children}
    </div>
  );
};
```

Now when you use it:

```jsx
// AddUser.js
<Card className={classes.input}>
  <form>...</form>
</Card>
```

The rendered `<div>` will have **both** the Card's own class and the `input` class from AddUser.

### 🧪 Example

Without class merging:
```html
<div class="Card_card__xK29f">...</div>
```

With class merging:
```html
<div class="Card_card__xK29f AddUser_input__aBc12">...</div>
```

### 💡 Insight

We chose to name the prop `className` (matching React's convention for built-in elements) so that using our Card component feels natural and consistent. You could call it `cssClass` or `wrapperClass` — but `className` keeps the API familiar.

---

## Concept 4: Using the Card in AddUser

### 🧠 What is it?

With the Card built, we wrap our AddUser form inside it to get that polished container look.

### ⚙️ How it works

```jsx
import Card from '../UI/Card';
import classes from './AddUser.module.css';

const AddUser = (props) => {
  return (
    <Card className={classes.input}>
      <form onSubmit={addUserHandler}>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" />
        {/* ... */}
        <button type="submit">Add User</button>
      </form>
    </Card>
  );
};
```

Key points:
- Import the Card from the UI folder (go up one level with `../`)
- The `AddUser.module.css` file (provided as an attachment) contains the `input` class with form-specific styles
- You always need to import components in every file where you use them

### 💡 Insight

The import path `'../UI/Card'` means: go up one directory (out of `Users/`), then into `UI/`, then find `Card`. File extensions are omitted for JavaScript files — the build tool resolves them automatically.

---

## ✅ Key Takeaways

- **`props.children`** gives you access to content between a component's opening and closing tags — essential for wrapper components
- **CSS Modules** scope class names to prevent conflicts — use `.module.css` file naming
- Custom components **don't handle `className` automatically** — you must explicitly merge external classes with internal ones using template literals
- Build reusable UI components (Card, Button, Modal) **once** and use them everywhere
- Always **import** components in every file that uses them

## ⚠️ Common Mistakes

- Forgetting that `className` on a custom component does nothing unless you explicitly handle it in the component's code
- Not merging classes — only applying the external class and losing the internal styling, or vice versa
- Using dot notation for the import path (`./UI.Card`) instead of slash notation (`./UI/Card`)

## 💡 Pro Tips

- Template literals make class merging clean: `` `${classes.card} ${props.className}` ``
- If `props.className` might be undefined, you can add a fallback: `` `${classes.card} ${props.className || ''}` ``
- The Card pattern is so common that many UI libraries (Material UI, Ant Design) ship their own Card components — but building one yourself teaches you the underlying pattern
