# How React Handles Components & How It Builds a "Component Tree"

## Introduction

We've built our first custom component — but how does that component's content actually end up on the screen? Understanding this process is crucial because it reveals **how React works under the hood** and why certain rules exist.

---

## The Surprising Source Code

If you open your website and **inspect the source code** (View Source, not DevTools), you'll notice something surprising: there's **no header, no image, no titles** — nothing visible. Just some metadata and a JavaScript file import.

That's because everything you see on screen is rendered **entirely by JavaScript** — by React.

---

## The Boot-Up Process

Here's how React starts:

### 1. `index.html` Is Served

This file is nearly empty. It contains a `<div id="root"></div>` and a script tag that loads `index.jsx`.

### 2. `index.jsx` Bootstraps React

This file is the **entry point** of your React app. It does something special:

```jsx
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

Let's break this down:

- **`createRoot()`** — Takes an existing HTML element (the `<div id="root">`) and designates it as the container where React will render content
- **`render()`** — Tells React to render the `App` component (and everything inside it) into that container

> Think of it like planting a seed (the App component) into soil (the root div). The entire tree grows from there.

### 3. React Builds the Component Tree

The `App` component may contain a `Header` component, which might contain other components. React walks through this entire hierarchy — executing each component function, collecting the JSX, and building a **tree of components**.

---

## The Component Tree

```
       App
      /   \
  Header   Main
    |        |
  <header>  <section>
```

React starts at the root component (`App`), then processes every nested component. Each component returns JSX, which may reference other custom components. React keeps going until it reaches only **built-in HTML elements** (like `div`, `h1`, `img`).

---

## Custom Components vs. Built-In Elements

Here's a critical distinction:

| Aspect | Built-in Elements | Custom Components |
|--------|-------------------|-------------------|
| Naming | Lowercase (`div`, `header`) | Uppercase (`Header`, `App`) |
| What React does | Renders them as **actual DOM nodes** | **Executes the function** and processes the returned JSX |
| Appear in DOM? | ✅ Yes | ❌ No |

If you open the **Elements tab** in DevTools, you'll see standard HTML elements — `<header>`, `<div>`, `<img>`. You won't find `<App>` or `<Header>` anywhere. Those are React's building blocks, not the browser's.

---

## Why Uppercase Matters

React uses the **case of the first letter** to decide how to handle an element:

- `<header>` → "This is a built-in HTML element. Render it in the DOM."
- `<Header>` → "This is a custom component. Execute the function and process its return value."

This isn't just a naming convention — it fundamentally changes React's behavior.

---

## The Full Picture

1. `index.html` loads `index.jsx`
2. `index.jsx` creates a React root and renders the `App` component into the `#root` div
3. React executes `App()`, gets its JSX, finds `<Header />` inside
4. React executes `Header()`, gets its JSX (only built-in elements)
5. React combines everything into a final DOM structure
6. The browser renders that DOM

---

## ✅ Key Takeaways

- React renders content by **executing component functions** and combining their JSX output
- The `createRoot()` and `render()` methods bootstrap the entire React app from a single root element
- React builds a **component tree** — a hierarchy of nested components
- Custom components **don't appear in the actual DOM** — only built-in HTML elements do
- Uppercase names = custom components; lowercase names = built-in HTML elements

## ⚠️ Common Mistakes

- Thinking your custom component names (like `<Header>`) show up in the browser DOM — they don't
- Confusing "View Source" (raw HTML) with "Elements tab" in DevTools (rendered DOM)
- Using lowercase for custom components — React will treat them as HTML elements

## 💡 Pro Tips

- The `index.jsx` file is the **only place** where you typically use JSX outside of a component function (passing it to `render()`)
- Think of React's job as translating your component tree into a real DOM tree
- The component tree is your **mental model** for understanding your app's structure
