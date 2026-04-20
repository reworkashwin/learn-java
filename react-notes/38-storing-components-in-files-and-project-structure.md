# Best Practice: Storing Components in Files & Using a Good Project Structure

## Introduction

Up to this point, all our components have been sitting in a single `App.jsx` file. That works — but it's not a good practice. As your app grows, having everything in one file makes things hard to find and maintain. Let's learn the standard way to organize React projects.

---

## Why Split Components into Separate Files?

Imagine having 20, 50, or 100 components all in one file. Finding the component you need to edit would be a nightmare.

The rule is simple:

> **One component per file** (with rare exceptions for tightly coupled components)

This gives you:
- Easy navigation — file name = component name
- Clean git diffs — changes are isolated
- Better collaboration — team members don't step on each other's toes

---

## The Standard Approach

### Step 1: Create a `components/` Folder

Inside your `src/` directory, create a `components/` subfolder. This isn't technically required, but it's the most common convention.

```
src/
├── components/
│   ├── Header.jsx
│   └── CoreConcept.jsx
├── App.jsx
└── index.jsx
```

### Step 2: Name Files After Their Component

The file name should match the component name. `Header` component → `Header.jsx`.

### Step 3: Export the Component

In the new file, add an export statement. Most React projects use **default exports**:

```jsx
// Header.jsx
export default function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}
```

### Step 4: Import in the Parent Component

Back in `App.jsx`, import the component:

```jsx
import Header from './components/Header.jsx';
```

Now `<Header />` works just as before — but the code lives in its own file.

---

## Adjusting Import Paths

When you move a component to a different folder, all **relative import paths** inside that file must be updated.

For example, if `Header.jsx` moves to `src/components/` and needs an image from `src/assets/`:

```jsx
// Before (when in src/):
import logo from './assets/logo.png';

// After (when in src/components/):
import logo from '../assets/logo.png';
```

The `../` goes **up one directory level** — from `components/` back to `src/`, then into `assets/`.

---

## Named vs. Default Exports

| Feature | Named Export | Default Export |
|---------|-------------|----------------|
| Syntax | `export function Header() {...}` | `export default function Header() {...}` |
| Import | `import { Header } from './Header'` | `import Header from './Header'` |
| Multiple per file? | ✅ Yes | ❌ Only one |
| Most common for components? | Less common | ✅ More common |

Most React projects use default exports for components, but both approaches work.

---

## ✅ Key Takeaways

- Store each component in its **own file** inside a `components/` folder
- Name files to match the component name (e.g., `Header.jsx` for `Header`)
- Use **default exports** for components (common convention)
- **Adjust relative paths** when moving files to new directories
- Always import components before using them in JSX

## ⚠️ Common Mistakes

- Forgetting to update import paths after moving files
- Not exporting the component — the import will silently fail or error
- Mixing up named and default export/import syntax

## 💡 Pro Tips

- Some developers omit the `.jsx` extension in imports — this works if your build tool is configured for it
- As projects grow, you might nest component folders: `components/Header/Header.jsx`
- Keep related files (component + styles + tests) together for a clean structure
