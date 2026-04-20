# Styling React Apps with Vanilla CSS - Pros & Cons

## Introduction

Before diving into more advanced styling solutions, let's step back and clearly evaluate **Vanilla CSS**—the approach you've been using. Understanding its strengths and weaknesses helps you make informed decisions about *when* to use it and *when* to reach for something more.

---

## The Vanilla CSS Approach

The workflow is simple:
1. Write CSS rules in `.css` files using any selectors you want (element, class, ID, etc.)
2. Import those CSS files into your component files
3. The build tool injects the styles into the page

That's it—no extra libraries, no special syntax, just plain CSS.

---

## Advantages

### 1. CSS Code is Decoupled from JSX
Your styling lives in separate files, not mixed into your component logic. This makes both the JSX and the CSS easier to read and maintain independently.

### 2. It's Just CSS
You write standard CSS—no special syntax to learn, no package-specific conventions. If you know CSS, you're good to go.

### 3. Division of Labor
A designer or CSS specialist can work on the `.css` files while you work on the component logic in `.jsx` files. Neither person blocks the other.

---

## Disadvantages

### 1. You Need to Know CSS
This sounds obvious, but it's worth noting. Unlike some utility-first frameworks that abstract CSS into class names, Vanilla CSS requires you to understand layout, specificity, the box model, and more.

### 2. Styles Are NOT Scoped to Components
This is the big one. When you import `Header.css` into `Header.jsx`, you might *think* those styles only apply to the header. They don't. Every CSS rule you write is global—it can affect any element on the page.

This means:
- A `.title` class in `Header.css` will also style any element with class `title` in *any other component*
- Naming collisions can cause unexpected styling
- You have to be careful with your selectors to avoid "styling leaks"

---

## The Scoping Problem

This deserves extra attention. Say you have:

```css
/* Header.css */
p { color: red; }
```

Even though this file is imported only in `Header.jsx`, **every paragraph on the entire page** turns red—not just paragraphs inside the header. The CSS doesn't "know" about React components. It just gets injected into the page globally.

We'll explore solutions to this scoping problem in the upcoming lectures.

---

## ✅ Key Takeaways

- Vanilla CSS is the simplest approach—decoupled from JSX, no extra dependencies
- It allows parallel work between developers and designers
- The major downside: **styles are global**, not scoped to components
- Naming collisions and unintended style leaks are real risks

## 💡 Pro Tips

- If you stick with Vanilla CSS, use naming conventions like **BEM** (Block Element Modifier) to minimize naming collisions
- Be deliberate with your selectors—avoid broad element selectors like `p` or `div` in component-specific CSS files
- Understanding these trade-offs helps you appreciate why CSS Modules and Styled Components exist
