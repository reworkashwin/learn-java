# Deriving & Outputting Data Based on State

## Introduction

Now that we know how to manage state with `useState`, it's time to do something much more meaningful with it. Instead of just displaying which button was clicked, let's use state to **dynamically pull and render real content** — titles, descriptions, and code examples — all driven by which tab the user selects.

This is where React really starts to shine: your UI becomes a **function of your data**, and state is the key that unlocks different views.

---

## Using State to Access Data Dynamically

### The Data Structure

First, we need a data source. In our `data.js` file, we now have an `examples` constant — an object where each key matches our button identifiers (`components`, `jsx`, `props`, `state`). Each key maps to an object with `title`, `description`, and `code` properties:

```js
export const EXAMPLES = {
  components: {
    title: "Components",
    description: "Components are the building blocks...",
    code: "function Welcome() { return <h1>Hello!</h1>; }"
  },
  jsx: { /* ... */ },
  props: { /* ... */ },
  state: { /* ... */ }
};
```

### Importing and Using the Data

We import this into our component:

```jsx
import { EXAMPLES } from './data.js';
```

Now here's the clever part — since our state already stores the identifier string (like `"components"` or `"jsx"`), we can use **dynamic property access** (square bracket notation) to pull the right data:

```jsx
<div id="tab-content">
  <h3>{EXAMPLES[selectedTopic].title}</h3>
  <p>{EXAMPLES[selectedTopic].description}</p>
  <pre><code>{EXAMPLES[selectedTopic].code}</code></pre>
</div>
```

This is standard JavaScript — `EXAMPLES["components"]` gives you the components object, and then `.title` drills into it.

### Why This Works So Well

Every time the user clicks a button, `selectedTopic` updates → the component re-renders → `EXAMPLES[selectedTopic]` points to a different object → different content appears on screen. **One piece of state drives the entire content switch.**

---

## Handling the Initial State Problem

There's a catch, though. If our initial state is something like `"Please click a button"`, React will try to evaluate `EXAMPLES["Please click a button"]` — which doesn't exist! This crashes the app.

### Quick Fix: Set a Valid Initial State

```jsx
const [selectedTopic, setSelectedTopic] = useState("components");
```

By defaulting to `"components"`, the app loads with valid data displayed right away. No crash, no blank screen.

> We'll explore a more elegant solution (conditional rendering) in the next lecture.

---

## ✅ Key Takeaways

- State values can be used as **dynamic keys** to access properties from a data object
- Square bracket notation (`obj[variable]`) is essential for dynamic property access in JavaScript
- Your initial state value must be **compatible** with how it's used in JSX — otherwise the app breaks on first render
- This pattern of "state drives data selection" is extremely common in React

## ⚠️ Common Mistakes

- **Mismatched identifiers**: The strings you store in state must exactly match the property names in your data object — watch for typos and casing
- **Forgetting initial state validity**: If your initial state doesn't correspond to a real key in your data, you'll get a runtime error
- **Not importing the data**: Make sure the data constant is imported into the file where you're using it

## 💡 Pro Tips

- This pattern scales beautifully — you could have dozens of tabs and the code stays the same, just the data object grows
- Keep your identifiers consistent: define them as constants if needed to avoid typos across files
- The `<pre><code>` combination is the standard HTML way to display formatted code snippets
