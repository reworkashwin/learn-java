# Building a First Custom Component

## Introduction

We understand how React works under the hood — now it's time to get our hands dirty and build our **first custom React component**. This is where the real fun begins. Components are the bread and butter of React development — you'll write dozens, hundreds, even thousands of them throughout your career. Let's learn how to create one from scratch.

---

## Concept 1: What is a Custom Component?

### 🧠 What is it?

A custom component is a **JavaScript function** that you write yourself, which **returns JSX code**. It's your own reusable building block for the UI — like creating a new HTML element that does exactly what you want.

### ❓ Why do we need it?

When building a real application, you need to break the UI into logical pieces. Think of a Twitter-like app:
- The header could be a component
- The list of posts could be a component
- Each individual post could be a component
- The "new post" button could be a component

By grouping related markup and logic into components, your code stays organized and manageable.

### ⚙️ How it works

Creating a component involves three steps:

1. **Create a new `.jsx` file** in a `components/` folder (convention, not required)
2. **Write a function** that returns JSX code
3. **Export the function** so it can be used in other files

### 🧪 Example

```jsx
// src/components/Post.jsx
function Post() {
  return (
    <div>
      <p>Maximilian</p>
      <p>React.js is awesome!</p>
    </div>
  );
}

export default Post;
```

That's it — you've just created a React component. A function that returns JSX.

### 💡 Insight

The `components/` folder is a convention, not a requirement. You could put components anywhere. But grouping them makes your project easier to navigate, especially as it grows. The `App.jsx` file is typically kept outside `components/` because it serves as the **root component** — the top-level component that all others live inside.

---

## Concept 2: Naming Rules — Uppercase Matters

### 🧠 What is it?

React component function names **must start with an uppercase character**. This is the convention that tells React (and other developers) that this function is a component, not a regular function.

### ❓ Why do we need it?

In JSX, React uses the casing to distinguish between:
- **Lowercase elements** → built-in HTML elements (`div`, `p`, `h1`)
- **Uppercase elements** → custom React components (`Post`, `Header`, `App`)

If you write `<post />` (lowercase), React will look for a built-in HTML element called "post" — which doesn't exist. It won't find your component.

### ⚙️ How it works

```jsx
// ✅ Correct — uppercase, treated as a custom component
<Post />

// ❌ Wrong — lowercase, React looks for a built-in <post> HTML element
<post />
```

This rule is **required** in the places where you *use* the component (in JSX). It's strongly recommended in the file where you *define* it too.

### 💡 Insight

This is one of the most important rules in React to memorize. If your component isn't showing up, the first thing to check is whether you're using an uppercase name. It's a deceptively simple rule that trips up beginners constantly.

---

## Concept 3: Using a Component in JSX

### 🧠 What is it?

Once you've defined and exported a component, you use it by **importing** it into another component file and placing it in the JSX like an HTML element.

### ⚙️ How it works

```jsx
// App.jsx
import Post from './components/Post';

function App() {
  return <Post />;
}
```

Key points:
- **Import the component** using the relative path (omit the `.jsx` extension)
- **Use it like an HTML element** in your JSX — `<Post />`
- React will **execute** the `Post` function and render whatever JSX it returns

### 🧪 Example

When React encounters `<Post />` in the App component:
1. It finds the `Post` function
2. Executes it
3. Takes the returned JSX (`<div><p>Maximilian</p><p>React.js is awesome!</p></div>`)
4. Renders that output in place of `<Post />`

You don't call the function with `Post()` — you use it as `<Post />`. React handles the execution for you.

### 💡 Insight

This is the magic of React's component model. You're not writing function calls — you're composing a UI declaratively. You say "put a Post here," and React figures out what that means by running your function and rendering the result.

---

## Concept 4: The File Extension Rule

### 🧠 What is it?

When importing JavaScript/JSX files, you **omit the file extension** in the import path:

```jsx
// ✅ Correct
import Post from './components/Post';

// ❌ Not needed
import Post from './components/Post.jsx';
```

### ⚙️ How it works

The build tools (Vite or CRA) automatically resolve `.js` and `.jsx` extensions. You just specify the path without the extension. However, when importing CSS files, you **must** include the extension.

---

## Concept 5: Keeping the Dev Server Running

### 🧠 What is it?

Your development server (`npm run dev` for Vite, `npm start` for CRA) must be running at all times during development.

### ⚙️ How it works

The dev server:
- **Watches** your code files for changes
- **Transforms** JSX and other code into browser-compatible JavaScript
- **Serves** your app at a local URL (e.g., `localhost:5173`)
- **Auto-reloads** the browser whenever you save changes

If you stop the dev server, your app won't be accessible and changes won't be reflected.

---

## ✅ Key Takeaways

- Components are **functions that return JSX code** — that's the definition
- Component names **must start with an uppercase character** (especially where used in JSX)
- Lowercase JSX elements = built-in HTML; Uppercase = custom components
- Create component files in a `components/` folder (convention)
- Import components and use them like HTML elements: `<Post />`
- React executes your component functions — you don't call them manually
- Omit `.jsx` extensions in import paths

## ⚠️ Common Mistakes

- Using a lowercase name for your component in JSX — React won't recognize it
- Forgetting to export the component function — it won't be importable
- Forgetting to import the component before using it in JSX
- Stopping the dev server and wondering why changes don't appear

## 💡 Pro Tips

- One component per file is the standard convention — it keeps your codebase organized
- The `App` component is your root component — all other components live inside it (directly or nested)
- Even though it's "just a function," thinking of components as custom HTML elements helps build the right mental model
