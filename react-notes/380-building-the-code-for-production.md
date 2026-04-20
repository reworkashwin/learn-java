# Building the Code for Production

## Introduction

Your React code — with JSX, modern JavaScript, and readable formatting — is **not** what gets deployed. It must be **transformed and optimized** into a production-ready bundle. This is the build step, and it's essential before deployment.

---

## Why Can't We Deploy Development Code?

### JSX Isn't Valid Browser Code

Browsers don't understand JSX. This:

```jsx
<h1>Hello World</h1>
```

...must be transformed into:

```js
React.createElement('h1', null, 'Hello World')
```

During development, the dev server (`npm start`) handles this transformation **live** as you write code. But for production, you need a permanent, optimized version.

### Development Code Is Verbose

Your development code is readable — with comments, whitespace, long variable names, and source maps. That's great for debugging, terrible for performance. Users don't need readable code; they need **fast** code.

---

## The Build Process

### Running the Build Script

In a Create React App project:

```bash
npm run build
```

This does several things automatically:

1. **Transforms JSX** into standard JavaScript
2. **Minifies** the code — removes whitespace, shortens variable names
3. **Bundles** all files into optimized chunks
4. **Tree-shakes** unused code away
5. **Generates** the lazy-loading chunks (if you used `React.lazy()`)
6. Creates a `build/` folder with everything ready to upload

### What's Inside the `build/` Folder?

```
build/
├── static/
│   ├── js/        ← Your JavaScript bundles (minified)
│   ├── css/       ← Your stylesheets (minified)
│   └── media/     ← Images and other assets
├── index.html     ← The single HTML entry point
└── ...
```

The `static/js/` folder contains:
- A **main chunk** — downloaded on initial page load (includes React itself + your core code)
- **Dynamic chunks** — downloaded on demand (from lazy loading)

The code inside is completely minified — unreadable but valid and fast.

---

## What Gets Deployed

**Only the `build/` folder contents go to the server.** Not your `src/` folder, not `node_modules/`, not `package.json`. Just the optimized output.

---

## ⚠️ Common Mistakes

- Deploying the `src/` folder instead of the `build/` folder
- Forgetting to stop the development server before running `npm run build`
- Not re-running the build after making code changes

## 💡 Pro Tip

Always inspect your `build/` folder after building. Check that lazy-loaded chunks exist as separate files — this confirms code splitting is working correctly.

## ✅ Key Takeaways

- `npm run build` produces an optimized, minified production bundle
- The output goes into the `build/` folder — that's what you deploy
- The build process transforms JSX, minifies code, and creates lazy-loaded chunks
- Smaller bundles = faster load times for users
- Never deploy development code directly
