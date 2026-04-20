# Setting HTML Attributes Dynamically & Loading Image Files

## Introduction

We just learned how to output dynamic values between JSX tags. But the same curly brace syntax also works for **attribute values** — and this unlocks a better way to handle images in React projects.

---

## The Problem with Static Image Paths

You might be loading an image like this:

```jsx
<img src="src/assets/react-logo.png" alt="React" />
```

It works during development — you can see the image. But there's a hidden problem:

When you **build your project for deployment**, all your code gets transformed, optimized, and bundled. Image files referenced like this with a plain string path **can get lost** during that process because the bundler doesn't know about them.

---

## The Better Way: Import Images

Instead of pointing to an image with a string path, **import it** at the top of your file:

```jsx
import reactImage from './assets/react-core-concepts.png';
```

Wait — importing an image into a JavaScript file? That sounds strange!

You're right — this isn't standard JavaScript. But the **build process** (Vite, Webpack, etc.) understands these imports. It will:

1. Include the image in the final deployment bundle
2. Give you a **reference** (a path or URL) to that image
3. Apply optimizations (like compression) automatically

> Think of the import as telling the build tool: "Hey, I need this file. Don't forget to include it!"

---

## Using the Imported Image

Once imported, use the image reference as a **dynamic value** for the `src` attribute:

```jsx
import reactImage from './assets/react-core-concepts.png';

function Header() {
  return (
    <header>
      <img src={reactImage} alt="React logo" />
    </header>
  );
}
```

### Critical Syntax Rule

When using dynamic values for attributes, **do NOT wrap them in quotes**:

```jsx
<img src={reactImage} />     ✅ Correct — dynamic value
<img src="{reactImage}" />   ❌ Wrong — this is just a string literal
```

The curly braces go directly after the equals sign, without quotes.

---

## Why This Approach Is Better

| Static Path | Import |
|-------------|--------|
| `src="src/assets/img.png"` | `src={importedImage}` |
| Image might get lost during build | Image is guaranteed to be included |
| No optimization | Build tool can optimize the image |
| Path might break after bundling | Path is always correct |

---

## Other Non-Standard Imports

This same pattern applies to **CSS files** too:

```jsx
import './index.css';
```

Normally, you can't import CSS into JavaScript either. But the build process handles it — ensuring the styles get included in the final page.

---

## ✅ Key Takeaways

- **Import images** instead of using hardcoded string paths for the `src` attribute
- The build process ensures imported files are included in the deployment bundle
- Use the curly brace syntax for dynamic attribute values: `src={variable}`
- **Never wrap dynamic attribute values in quotes** — that turns them into literal strings
- CSS files can also be imported into JS/JSX files thanks to the build process

## ⚠️ Common Mistakes

- Wrapping dynamic values in quotes: `src="{myImage}"` — this passes the literal string, not the variable
- Using absolute paths from `src/` — these break after the build process
- Forgetting to adjust relative import paths when moving component files to different folders

## 💡 Pro Tips

- Always import images and other assets — this is the standard practice in modern React projects
- The imported variable holds a **path to the image** (or a base64 string for small images), not the image itself
- This import pattern works for SVGs, fonts, and other static assets too
