# Alternative Props Syntaxes

## Introduction

We've learned the basics of props. Now let's look at some **shorter and cleaner syntaxes** for working with props — both when *setting* them and when *receiving* them inside a component.

---

## Using Data from a File

First, let's get organized. Instead of hardcoding prop values, import structured data from a separate file:

```jsx
// data.js
export const CORE_CONCEPTS = [
  { image: componentsImg, title: 'Components', description: 'Building blocks...' },
  { image: jsxImg, title: 'JSX', description: 'Syntax extension...' },
  // ...
];
```

Import it using **named import** syntax (curly braces for named exports):

```jsx
import { CORE_CONCEPTS } from './data.js';
```

Then use it dynamically:

```jsx
<CoreConcept
  title={CORE_CONCEPTS[0].title}
  description={CORE_CONCEPTS[0].description}
  image={CORE_CONCEPTS[0].image}
/>
```

This works — but it's verbose. Let's look at shortcuts.

---

## Shortcut #1: The Spread Operator for Props

When your **prop names match the property names** of your data object, you can use the JavaScript **spread operator** (`...`) to pass all properties at once:

```jsx
// Verbose way:
<CoreConcept
  title={CORE_CONCEPTS[0].title}
  description={CORE_CONCEPTS[0].description}
  image={CORE_CONCEPTS[0].image}
/>

// Shortcut with spread:
<CoreConcept {...CORE_CONCEPTS[0]} />
```

The spread operator **extracts all key-value pairs** from the object and passes them as individual props. Much cleaner!

### When Does This Work?

Only when the object property names **match exactly** with the expected prop names in the component. If they don't match, you'll need to map them manually.

---

## Shortcut #2: Object Destructuring in the Parameter

Inside the component, instead of writing `props.title`, `props.description`, etc., you can use **object destructuring**:

```jsx
// Standard way:
function CoreConcept(props) {
  return <h3>{props.title}</h3>;
}

// With destructuring:
function CoreConcept({ image, title, description }) {
  return <h3>{title}</h3>;
}
```

By destructuring in the parameter list, you:
- Pull out specific properties as standalone variables
- Skip the `props.` prefix entirely
- Make the code shorter and more readable

### The Curly Braces Aren't JSX!

Don't confuse the destructuring curly braces in the parameter `({ title, description })` with the JSX curly braces `{title}` in the return statement. They serve completely different purposes:
- **Parameter curly braces** → JavaScript object destructuring
- **JSX curly braces** → Dynamic value output

---

## Combining Both Shortcuts

You can use the spread operator when *setting* props **and** destructuring when *receiving* them:

```jsx
// Parent:
<CoreConcept {...CORE_CONCEPTS[0]} />

// Child:
function CoreConcept({ image, title, description }) {
  return (
    <li>
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </li>
  );
}
```

Maximum brevity. Same result.

---

## ✅ Key Takeaways

- Use the **spread operator** `{...obj}` to pass all object properties as props in one go
- Use **object destructuring** `({ title, description })` in component parameters to avoid `props.` prefix
- Both shortcuts are optional — the verbose approach works exactly the same
- Named exports use curly braces in imports; default exports don't

## ⚠️ Common Mistakes

- Using spread when property names don't match the expected prop names
- Confusing destructuring `{ }` in parameters with JSX `{ }` in the return body
- Forgetting that spread passes **all** properties — including ones you might not want

## 💡 Pro Tips

- Object destructuring is the **most common pattern** in React codebases — you'll see it everywhere
- The spread shortcut is especially handy when rendering lists of items with consistent data shapes
- You can combine destructuring with a rest parameter: `({ title, ...rest })` to capture remaining props
