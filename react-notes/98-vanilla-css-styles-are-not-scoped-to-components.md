# Vanilla CSS Styles Are NOT Scoped To Components!

## Introduction

This is one of the most important things to understand when using Vanilla CSS in React: **importing a CSS file into a component does NOT limit those styles to that component.** Let's see this in action with a concrete example so you never fall into this trap.

---

## The Demonstration

### The Setup

In `Header.css`, there's a rule targeting paragraphs inside the header:

```css
header p {
  /* some styles like text-align: center, color: gray */
}
```

Now, what happens if you remove the `header` prefix and just target `p`?

```css
p {
  text-align: center;
  color: gray;
}
```

### The Result

Add a `<p>Some text</p>` to `AuthInputs.jsx`—a completely different component in a completely different file. Save and reload.

**Both paragraphs get the same styles.** The paragraph in `AuthInputs` is styled exactly like the one in `Header`, even though `Header.css` is only imported in `Header.jsx`.

Change the color to `red` in `Header.css`:

```css
p { color: red; }
```

Both paragraphs turn red. The styles leak across components.

---

## Why This Happens

### Under the Hood

When Vite processes your CSS imports, it doesn't create isolated style scopes. It simply takes all your CSS files and injects them as `<style>` tags in the `<head>` section of the HTML document:

```html
<head>
  <style>/* styles from Header.css */</style>
  <style>/* styles from index.css */</style>
</head>
```

These styles apply **globally** to the entire page. The browser doesn't know or care which React component imported which CSS file. It just sees CSS rules and applies them based on selectors.

### The Illusion of Scoping

The import `import './Header.css'` in `Header.jsx` gives the *impression* that the styles belong to the Header component. But they don't. The import is just a signal to the build tool to include that CSS in the page—it provides zero scoping.

---

## The Practical Impact

This means you must be careful with your selectors:

| Selector | Risk Level | Notes |
|----------|-----------|-------|
| `p`, `div`, `h1` | 🔴 High | Affects ALL matching elements on the page |
| `.header p` | 🟡 Medium | More specific, but still global |
| `#unique-id` | 🟢 Low | IDs should be unique, but not ideal for component styling |
| `.header-paragraph` | 🟢 Low | Specific class names reduce collision risk |

---

## The Takeaway

This isn't necessarily a *problem*—it's a *characteristic* of Vanilla CSS that you must be aware of. If you use careful, specific selectors (like BEM naming), you can avoid most issues. But if you want *guaranteed* scoping without that mental overhead, you'll need CSS Modules or another scoping solution.

---

## ✅ Key Takeaways

- CSS imports in React are **not scoped**—they apply globally to the entire page
- The build tool injects all CSS into the `<head>` as global `<style>` tags
- Broad selectors like `p` or `div` in any CSS file affect every matching element everywhere
- Use specific selectors to minimize unintended style leaks

## ⚠️ Common Mistakes

- Thinking `import './Component.css'` scopes styles to that component—it absolutely does not
- Using element selectors (like `p`, `h2`) in component-specific CSS files without qualifying them
- Forgetting that all CSS is global and being surprised when styles "mysteriously" appear on the wrong elements

## 💡 Pro Tips

- Always qualify your CSS rules with parent selectors or use specific class names
- If scoping matters to you (and it often does), consider CSS Modules as the next step
- This problem grows with app size—the bigger the app, the more likely you'll hit naming collisions
