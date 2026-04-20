# Splitting CSS Code Across Multiple Files

## Introduction

So far, all the CSS for the app lives in a single `index.css` file. That works, but as your app grows, a giant CSS file becomes hard to manage. Can you split your CSS into multiple files and co-locate them with the components they style? Absolutely—and it's straightforward with modern build tools like Vite.

---

## How CSS Imports Work in React Projects

In a typical React project using Vite (or similar build tools), you can import CSS files directly into JavaScript files:

```jsx
import './index.css';
```

When Vite sees this import, it doesn't try to treat the CSS file as JavaScript. Instead, it:
1. Reads the CSS file
2. Injects its contents into a `<style>` tag in the `<head>` of the HTML document
3. Does this dynamically at build/dev time

If you open your browser's DevTools and inspect the `<head>` section, you'll see a `<style>` element containing all the rules from `index.css`—injected there by Vite.

---

## Splitting Styles by Component

Instead of one massive CSS file, you can create smaller CSS files that live next to the components they style.

### Example: Extracting Header Styles

1. **Create the file**: Add `Header.css` next to `Header.jsx`
2. **Move the styles**: Cut all header-related CSS rules from `index.css` and paste them into `Header.css`
3. **Import it**: In `Header.jsx`, add:

```jsx
import './Header.css';
```

That's it. The page looks exactly the same because Vite now injects *two* `<style>` tags into the `<head>`:
- One for `Header.css`
- One for `index.css` (with the remaining styles)

### File Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── Header.css      ← co-located with the component
│   ├── AuthInputs.jsx
│   └── ...
├── App.jsx
└── index.css           ← remaining global styles
```

This co-location makes it easy to find the styles for any component—they're right next to the component file.

---

## Important: This Doesn't Scope Styles

Just because you import `Header.css` in `Header.jsx` doesn't mean those styles only apply to the `Header` component. The CSS is still global—it's injected into the document's `<head>` and applies to the *entire page*. We'll address this limitation in upcoming lectures.

---

## ✅ Key Takeaways

- You can import **multiple** CSS files into different component files
- Build tools like Vite handle CSS imports by injecting `<style>` tags into the page
- Co-locating CSS files with their components improves project organization
- Splitting CSS files does **not** scope styles—they're still global

## ⚠️ Common Mistakes

- Assuming that importing a CSS file in a component makes its styles exclusive to that component—it doesn't
- Forgetting to update imports after moving CSS rules to a new file

## 💡 Pro Tips

- Co-locate CSS files with their component files for better organization: `Header.jsx` + `Header.css`
- You can import as many CSS files as you want—Vite handles all of them
- This is purely an organizational benefit; for actual scoping, you'll need CSS Modules (covered later)
