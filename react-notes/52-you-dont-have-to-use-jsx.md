# You Don't Have To Use JSX!

## Introduction

We've been writing JSX everywhere — that HTML-like syntax in our JavaScript files. But here's something you might not expect: **JSX is completely optional**. You can build React apps without it. Understanding this gives you insight into what JSX really is under the hood.

---

## JSX Is Syntactic Sugar

JSX is **not standard JavaScript**. Browsers can't understand it. That's why every React project needs a **build process** that transforms JSX into valid JavaScript before it reaches the browser.

But what does JSX transform into? Let's see.

### JSX Version

```jsx
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### Non-JSX Equivalent

```js
import React from 'react';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

Instead of `<App />`, we call `React.createElement(App)`. They produce the **exact same result**.

---

## How `React.createElement` Works

The method takes three arguments:

1. **Component type**: What to render — a string like `"div"` for built-in elements, or a component function like `App` for custom components
2. **Props object**: The attributes/props to pass (or `null` if none)
3. **Children**: The content between opening and closing tags

```js
// JSX
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// createElement equivalent
React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
);
```

You can see why JSX is preferred — the `createElement` version is verbose and hard to read, especially as nesting increases.

---

## When Would You Skip JSX?

In theory, skipping JSX means you don't need a build process. But practically:

- Setting up a build process is trivial (Vite, Create React App, etc.)
- JSX is **far easier** to write, read, and maintain
- The vast majority of React projects use JSX

So in practice, you'll almost always use JSX. But understanding that it's just a convenience layer over `React.createElement` helps you understand what React is actually doing.

---

## ✅ Key Takeaways

- JSX is not required — it's syntactic sugar over `React.createElement()`
- Every JSX element gets transformed into a `createElement` call by the build process
- `createElement` takes the component type, props, and children as arguments
- Virtually all real-world React projects use JSX because it's more readable and intuitive

## ⚠️ Common Mistakes

- **Thinking JSX is HTML**: It's not — it's JavaScript that looks like HTML. Every JSX element becomes a function call
- **Assuming JSX runs in the browser**: It doesn't — the build process transforms it first

## 💡 Pro Tips

- If you ever need to debug a strange JSX behavior, think about what `createElement` call it would produce — this mental model can help clarify edge cases
- Some advanced patterns (like render props or higher-order components) are easier to understand when you think in terms of `createElement` rather than JSX
