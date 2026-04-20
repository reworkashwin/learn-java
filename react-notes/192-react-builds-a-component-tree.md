# React Builds A Component Tree — How React Works Behind The Scenes

## Introduction

You've been writing React components for a while now. You create functions, return JSX, pass props, manage state. But have you ever stopped and asked: *what exactly is React doing with all of this?* How does it go from your component functions to actual pixels on the screen?

Understanding this process is like understanding the engine of the car you're driving. Let's pop the hood.

---

## The Starting Point: main.jsx

Everything begins in your entry file — typically `main.jsx` or `index.jsx`. This is the first code that runs when your application loads:

```jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

This code tells React: "Here's my root component — `App`. Please execute it and render whatever it returns to the DOM."

And that's exactly what React does. It **calls your `App` function**.

---

## Component Functions Get Executed Top to Bottom

When React executes a component function, it runs *all* the code inside, from top to bottom:

1. **State is registered** — `useState` calls set up state slots
2. **Functions are created** — handler functions like `handleClick` are defined (but *not* executed yet)
3. **JSX is returned** — the template describing what should appear on screen

The JSX return value is what React uses to figure out what to render. But here's the key insight: if that JSX contains **custom components**, React needs to execute *those* functions too.

---

## Building the Component Tree

When React encounters a custom component in your JSX — like `<Header />` or `<Counter />` — it pauses, goes to that component's function, and executes it. If *that* component also contains custom components, React goes deeper.

This creates a **component tree**:

```
App
├── Header
└── Counter
    ├── IconButton
    │   └── MinusIcon
    ├── CounterOutput
    └── IconButton
        └── PlusIcon
```

React traverses this tree from top to bottom, executing each component function and collecting the returned JSX. Built-in HTML elements (`div`, `h2`, `button`) are leaf nodes — they don't need further execution. Custom components are branches that might have more children.

### The Execution Order

Consider this simplified example:

```jsx
function App() {
  return (
    <main>
      <Header />
      <Counter initialCount={0} />
    </main>
  );
}
```

React's execution flow:
1. Execute `App()` → returns JSX with `<Header />` and `<Counter />`
2. Execute `Header()` → returns JSX with only built-in elements → done with this branch
3. Execute `Counter({ initialCount: 0 })` → returns JSX with `<IconButton />` and `<CounterOutput />`
4. Execute each `IconButton()` → each returns JSX with `<Icon />`
5. Execute each `Icon()` → returns built-in SVG elements → done

This is depth-first traversal. React goes as deep as possible down one branch before moving to the next sibling.

---

## Props Flow Down the Tree

When React encounters a component with props:

```jsx
<Counter initialCount={chosenCount} />
```

It passes those values as arguments to the component function. So React effectively calls:

```jsx
Counter({ initialCount: chosenCount });
```

This is why props flow **downward** — parent components pass data to children during this execution process.

---

## Visualizing the Tree with Console Logs

You can verify this execution order yourself by adding `console.log` statements to each component:

```jsx
function App() {
  console.log('App EXECUTING');
  // ...
}

function Header() {
  console.log('  Header EXECUTING');
  // ...
}

function Counter({ initialCount }) {
  console.log('  Counter EXECUTING');
  // ...
}
```

On initial load, you'll see the logs appear in the exact order React traverses the tree. This is a great debugging technique when you're trying to understand execution flow.

---

## What Triggers Re-execution?

The initial render executes every component in the tree. But after that, **state changes** drive re-execution:

- When a component's state changes, React re-executes that component function
- React then re-executes all **child** component functions in that branch
- Parent and sibling components are **not** affected

This is a crucial concept: re-renders propagate **downward**, never upward. If the `Counter` component's state changes, the `App` and `Header` components don't re-execute. But `CounterOutput`, `IconButton`, and `Icon` all do.

---

## ✅ Key Takeaways

- React builds a **component tree** by executing component functions from top to bottom
- Each component function runs completely — registering state, creating functions, returning JSX
- Custom components in JSX trigger further function executions (deeper in the tree)
- Props are passed as function arguments during this execution
- State changes trigger re-execution of the changed component *and all its children*
- Re-renders propagate **downward only** — never to parent or sibling components

## ⚠️ Common Mistakes

- Assuming a child component's state change re-renders the parent — it doesn't
- Thinking JSX *is* the DOM — it's actually a description of what the DOM *should* look like
- Forgetting that component functions are called on every re-render, so functions inside them are recreated each time

## 💡 Pro Tip

Add `console.log` statements to your components during development to build an intuitive feel for when and why React executes your code. Once you can predict the execution order, you'll write much better React applications.
