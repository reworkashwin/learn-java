# Making Components Reusable with Props

## Introduction

One of the biggest advantages of components is that they're **reusable**. But reusability only becomes truly powerful when you can use the *same* component with *different data* each time. That's exactly what **props** enable.

---

## The Problem: Same Component, Different Data

Imagine you have four "core concept" items to display — Components, JSX, Props, and State. Each has a different title, description, and image.

You *could* create four separate components: `CoreConcept1`, `CoreConcept2`, etc. But that defeats the purpose of reusable components.

What you really want is **one** `CoreConcept` component that accepts different data each time it's used.

> Just like a JavaScript function accepts different arguments each time you call it, a React component can accept different **props**.

---

## What Are Props?

**Props** (short for "properties") are the mechanism for passing data **into** a component from the outside. They're like function parameters but for React components.

Every React component automatically receives a `props` object from React — an object containing all the custom attributes you set on that component.

---

## How to Use Props

### Step 1: Set Props on the Component (Parent Side)

When using a component, add custom attributes — these become props:

```jsx
<CoreConcept
  title="Components"
  description="The core UI building block"
  image={componentsImg}
/>
```

You can pass **any type of value** as a prop:
- Strings: `title="Components"`
- Numbers: `count={42}`
- Objects: `data={{name: "React"}}`
- Arrays: `items={[1, 2, 3]}`
- Functions: `onClick={handleClick}`
- Imported assets: `image={componentsImg}`

### Step 2: Receive Props in the Component (Child Side)

The component function receives a single `props` parameter — an object with all the key-value pairs:

```jsx
function CoreConcept(props) {
  return (
    <li>
      <img src={props.image} alt={props.title} />
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </li>
  );
}
```

### Step 3: Reuse with Different Data

```jsx
<CoreConcept title="Components" description="Building blocks" image={img1} />
<CoreConcept title="JSX" description="Syntax extension" image={img2} />
<CoreConcept title="Props" description="Data passing" image={img3} />
<CoreConcept title="State" description="Internal data" image={img4} />
```

Same component, four different outputs. That's the power of props!

---

## The Connection Between Attributes and Props

Whatever attribute name you choose when using the component becomes the **key** in the props object:

```jsx
// Usage:
<CoreConcept title="Hello" />

// Inside the component:
props.title  // → "Hello"
```

If you renamed `title` to `heading`:

```jsx
<CoreConcept heading="Hello" />
// Then you'd access it as: props.heading
```

The names are entirely up to you (except for the special `children` prop — more on that later).

---

## ✅ Key Takeaways

- **Props** let you pass data into components, making them reusable
- Props are set as **attributes** on the component and received as an **object** in the function parameter
- You can pass any data type as a prop — strings, numbers, objects, arrays, functions, images
- The prop names (keys) are **your choice** — they match the attribute names you set
- React automatically bundles all attributes into a single `props` object

## ⚠️ Common Mistakes

- Expecting a prop by one name but setting it by another — the names must match exactly
- Forgetting curly braces for non-string values: `count={42}` not `count="42"`
- Trying to modify props inside the child component — props are **read-only**

## 💡 Pro Tips

- Props flow **one way**: from parent to child (top-down). This is called "unidirectional data flow"
- Think of props as the component's **configuration** — they define how a particular instance should look and behave
- If you find yourself passing the same prop through many layers, that's a sign you might need a different pattern (like Context — covered later)
