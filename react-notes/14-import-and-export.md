# Import & Export

## Introduction

In React apps — and in most modern JavaScript projects — it's considered best practice to **split your code across multiple files**. This keeps things manageable and maintainable. The `import` and `export` keywords are how you connect these files together.

You'll use imports and exports constantly in React, so let's make sure this is crystal clear.

---

## Named Exports

The most common way to export something from a file:

```javascript
// util.js
export let apiKey = "abc123xyz";
```

The `export` keyword makes this variable available to other files.

### Importing a Named Export

```javascript
// app.js
import { apiKey } from './util.js';

console.log(apiKey); // "abc123xyz"
```

Key points:
- Use **curly braces** `{ }` around the name
- The name must **exactly match** the exported name (JavaScript is case-sensitive)
- Use `from` followed by the **relative file path** in quotes
- In vanilla JS, include the `.js` extension. In React projects (with a build process), the extension is typically omitted

### Exporting Multiple Named Items

You can export as many named things as you want from a single file:

```javascript
// util.js
export let apiKey = "abc123xyz";
export let abc = "some value";
export function greet() { return "Hello!"; }
```

### Importing Multiple Named Items

Separate them with commas:

```javascript
import { apiKey, abc } from './util.js';
```

---

## Default Exports

An alternative way to export — useful when a file has **one main thing** to export:

```javascript
// util.js
export default "abc123xyz";
```

Notice:
- You use the `default` keyword after `export`
- You export a **value directly** — no variable name is assigned
- **Only one default export** is allowed per file

### Importing a Default Export

```javascript
// app.js
import myKey from './util.js';

console.log(myKey); // "abc123xyz"
```

Key differences from named imports:
- **No curly braces**
- You can use **any name you want** (since the export itself has no name)

---

## Mixing Default and Named Exports

A file can have **one default export** alongside **multiple named exports**:

```javascript
// util.js
export default "abc123xyz";
export let abc = "some value";
export let apiKey = "another value";
```

This is perfectly valid.

---

## Grouping Imports with `*`

Instead of listing every named export individually, you can import everything at once:

```javascript
import * as util from './util.js';

console.log(util.apiKey);    // named export
console.log(util.abc);       // named export
console.log(util.default);   // default export
```

The `*` grabs all exports and puts them into a single object. You access each export as a property of that object.

---

## Aliasing Imports with `as`

Don't like the name of something you're importing? Rename it:

```javascript
import { abc as content } from './util.js';

console.log(content); // value of abc
```

The `as` keyword assigns an **alias** — the original name in the source file stays the same, but in this file, you refer to it by the new name.

---

## Quick Reference

| Syntax | Use Case |
|---|---|
| `export let x = ...` | Named export |
| `export default ...` | Default export (one per file) |
| `import { x } from './file.js'` | Import named export |
| `import x from './file.js'` | Import default export |
| `import { x, y } from './file.js'` | Import multiple named exports |
| `import * as obj from './file.js'` | Import all exports as an object |
| `import { x as alias } from './file.js'` | Import with alias |

---

## Why This Matters for React

In React, you'll see this pattern constantly:

```javascript
// App.jsx
export default function App() {
  return <div>Hello!</div>;
}

// main.jsx
import App from './App';
```

Each React component is typically one function in its own file, exported as a **default export**. This is the convention you'll use throughout React development.

---

## ✅ Key Takeaways

- **Named exports** use `export` and are imported with `{ curly braces }`
- **Default exports** use `export default` and are imported without curly braces (you choose the name)
- Only **one default export** per file, but unlimited named exports
- Use `* as name` to import everything into a single object
- Use `as` to rename/alias imports
- In vanilla JS, add `.js` to import paths; in React projects, it's omitted

---

## ⚠️ Common Mistake

Confusing named and default import syntax. If you use curly braces when importing a default export (or vice versa), you'll get `undefined` or an error. Always match the import syntax to the export type.

---

## 💡 Pro Tip

In React, the convention is to use **default exports for components** (since there's usually one component per file) and **named exports for utility functions, constants, and hooks** that may share a file. Keeping this pattern consistent makes your codebase predictable.
