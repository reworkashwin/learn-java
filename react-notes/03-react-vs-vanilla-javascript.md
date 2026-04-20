# ReactJS vs "Vanilla JavaScript": Why Use React?

## Introduction

We've established that React makes building UIs easier than vanilla JavaScript. But claims are cheap — let's actually *see* the difference by comparing the same application built both ways.

---

## The Demo App

The app is simple: a set of clickable tabs that change the content displayed below them. The exact same functionality is built twice:

1. Once with **vanilla JavaScript** (no libraries)
2. Once with **React**

Both apps use CodeSandbox — a browser-based code editor that lets you work on projects without installing anything locally.

---

## The Vanilla JavaScript Approach

The vanilla version relies on two main files:

### `index.html`
Contains all the HTML elements — the buttons, the content area, the structure of the page.

### `index.js`
Handles all the interactivity:

1. **Selects** the button elements from the DOM
2. **Attaches** click event listeners to each button
3. **Updates** the UI step by step when a button is clicked:
   - Removes the "active" CSS class from all buttons
   - Adds the "active" class to the clicked button
   - Loads the appropriate content from a data array
   - Creates list items as an HTML string
   - Clears the existing content area
   - Appends the new content

Even for this trivial app, that's a **lot of manual steps**. You're telling the browser *exactly* what to do, step by step.

This is called **imperative programming** — you define **the steps** to reach a result.

---

## The React Approach

The React version looks completely different.

### `index.html`
Nearly empty — just a single `<div id="root">`. React takes over this div and controls everything inside it.

### `index.js`
Selects the root div and hands control to React.

### `app.js` — Where the Magic Happens

This file contains a function called `App`, and inside it, you'll see something unusual: **HTML code directly inside JavaScript**.

```jsx
function App() {
  const [activeContentIndex, setActiveContentIndex] = useState(0);

  return (
    <div>
      <button className={activeContentIndex === 0 ? 'active' : ''} 
              onClick={() => setActiveContentIndex(0)}>
        Tab 1
      </button>
      {/* More buttons... */}
      <ul>
        {content[activeContentIndex].map(item => <li>{item}</li>)}
      </ul>
    </div>
  );
}
```

Wait — HTML inside JavaScript? That's not standard JavaScript! You're right. This is called **JSX**, and it's a special syntax that React projects support through their build process. More on that later.

---

## Key Differences

### Declarative vs Imperative

| Vanilla JavaScript | React |
|---|---|
| **Imperative** — you define the steps | **Declarative** — you define the goal |
| "Remove class from all buttons, add class to this button, clear content, create new elements, append them..." | "If index is 0, this button should be active. Show content from array at this index." |
| You manage the DOM manually | React manages the DOM for you |

### How React Works Under the Hood

1. You create a **state variable** using `useState` (e.g., `activeContentIndex`)
2. You define **conditions** in your JSX (e.g., if `activeContentIndex === 0`, add the "active" class)
3. When the state changes (via `setActiveContentIndex`), React **automatically re-evaluates** the JSX
4. React figures out **what changed** in the UI and **updates only what's necessary**

You never manually touch the DOM. You just describe what the UI should look like for each state, and React handles the rest.

---

## Why This Matters

Even in this tiny example:

- The vanilla JavaScript version requires many careful steps — forget one and things break
- Adding a fourth button in vanilla JS means updating multiple places in the code
- The React version is **leaner**, **less error-prone**, and **easier to extend**

Now imagine a real-world application with hundreds of interactive elements. The imperative approach simply doesn't scale.

---

## ✅ Key Takeaways

- **Imperative code** (vanilla JS) = you define step-by-step instructions to update the UI
- **Declarative code** (React) = you define *what* the UI should look like, and React figures out *how* to update it
- React uses a concept called **state** (`useState`) to track dynamic values
- When state changes, React automatically re-renders the affected parts of the UI
- **JSX** allows you to write HTML-like code inside JavaScript files

---

## ⚠️ Common Mistake

Don't try to understand every detail of the React code right now. Concepts like `useState`, JSX, and components will all be covered in depth later. The goal here is just to see *why* React's approach is fundamentally different and better for building complex UIs.

---

## 💡 Pro Tip

Remember this phrase: **"Define the target state, not the steps to get there."** This is the core philosophy of React and it will guide everything you learn from here on.
