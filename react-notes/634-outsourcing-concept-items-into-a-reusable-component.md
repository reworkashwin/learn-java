# Outsourcing Concept Items Into a Reusable Component

## Introduction

This is where components really start to shine. Instead of repeating the same list item structure three times, we'll extract it into a **single reusable component** that accepts different data through props. This is the essence of React's component model — define once, reuse everywhere.

---

## Concept 1: Building a Reusable Component with Props

### 🧠 What is it?

A reusable component is one that renders the same **structure** but with different **data** each time it's used. The data is passed in via **props** — the component's configuration mechanism.

### ❓ Why do we need it?

Without a reusable component, you'd have three nearly identical list items in your JSX. Want to change the HTML structure? You'd have to edit it in three places. Want to add a fourth concept? Copy-paste again. A reusable component solves all of this — you define the structure once, and the data flows in through props.

### ⚙️ How it works

1. Create a new component file (e.g., `Concept.js`) inside a `concept/` folder.
2. Define a function that accepts `props` as a parameter.
3. Move the list item JSX into this function.
4. Replace hardcoded data references (like `concepts[0].title`) with `props.title`, `props.image`, `props.description`.
5. Export the component.

### 🧪 Example

```jsx
// src/components/concept/Concept.js
function Concept(props) {
  return (
    <li>
      <img src={props.image} alt={props.title} />
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </li>
  );
}

export default Concept;
```

### 💡 Insight

The key insight is this: we're **not** building three different components — one for each concept. That would defeat the purpose. We build **one** component that's flexible enough to display any concept, because the actual data comes from props.

---

## Concept 2: Using the Reusable Component with Different Data

### 🧠 What is it?

Once you have a configurable component, you use it in your parent component by passing the appropriate data as prop values. Each instance of the component gets its own set of props.

### ❓ Why do we need it?

The component exists, but it's useless until you actually render it and feed it data. This is where you connect your data array to your reusable component.

### ⚙️ How it works

1. Import the `Concept` component into `App.js`.
2. Replace each `<li>` block with a `<Concept />` element.
3. Pass the data from the `concepts` array as props: `image`, `title`, and `description`.
4. Each `<Concept />` instance receives different data, but they all share the same internal structure.

### 🧪 Example

```jsx
import Concept from './components/concept/Concept';

function App() {
  return (
    <div>
      <Header />
      <ul>
        <Concept
          image={concepts[0].image}
          title={concepts[0].title}
          description={concepts[0].description}
        />
        <Concept
          image={concepts[1].image}
          title={concepts[1].title}
          description={concepts[1].description}
        />
        <Concept
          image={concepts[2].image}
          title={concepts[2].title}
          description={concepts[2].description}
        />
      </ul>
    </div>
  );
}
```

### 💡 Insight

Notice how the HTML structure (`<li>`, `<img>`, `<h2>`, `<p>`) now lives in **exactly one place** — inside the `Concept` component. If you ever want to change how concepts are displayed — add a link, remove the description, change the styling — you change it once, and all three instances update. That's the power of components.

---

## Concept 3: The Relationship Between Props and Reusability

### 🧠 What is it?

Props are what make a component **configurable**. Without props, a component would render the same thing every time — useful for static content like a header, but not for repeated patterns with varying data.

### ❓ Why do we need it?

Reusability without configurability is pointless. You need a way to tell each instance of a component: "Here's *your* specific data." Props are that mechanism.

### ⚙️ How it works

- The **parent** component sets props as attributes on the custom element: `<Concept title="Components" />`
- The **child** component receives all props in a single object parameter, typically named `props`
- The child accesses individual values via `props.title`, `props.image`, etc.
- React handles the plumbing — you define, you pass, you access

### 💡 Insight

Think of props like **function arguments**. A function `add(a, b)` is reusable because you can call it with different numbers. Similarly, a component `<Concept title={...} />` is reusable because you can render it with different data. Components are just functions, and props are just arguments.

---

## ✅ Key Takeaways

- Build **one** reusable component instead of duplicating JSX for each data item
- Use **props** to make the component configurable — each instance gets different data
- The HTML structure lives in one place, making changes trivial
- Props flow **downward** — from parent to child, never the other way

## ⚠️ Common Mistakes

- Building separate components for each data item (e.g., `ConceptOne`, `ConceptTwo`) instead of one reusable `Concept` component
- Forgetting to accept `props` as a parameter in the component function
- Mismatching prop names — if the component expects `props.title`, you must pass `title={...}` when using it
- Using `concepts[3]` when the array only has three elements (indices 0, 1, 2) — off-by-one errors!

## 💡 Pro Tips

- Name your props to match the data keys for consistency — if the data object has `image`, `title`, `description`, use those same names as props
- Self-closing tags (`<Concept />`) are preferred when the component has no children content
- Later, you'll learn to use `.map()` to render these components dynamically without manually writing each one
