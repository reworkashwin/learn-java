# Forwarding Props To Wrapped Elements

## Introduction

We just discovered that props on custom components don't automatically reach inner DOM elements. The manual approach — destructuring every possible prop — doesn't scale. Now let's solve this elegantly with the **forwarded props** (or proxy props) pattern using JavaScript's rest and spread operators.

---

## The Pattern: Rest + Spread

### Step 1: Collect Remaining Props with Rest (`...`)

When destructuring, the `...` syntax (rest operator) collects all props that you **haven't explicitly named** into a single object:

```jsx
export default function Section({ title, children, ...props }) {
  // title = "Examples"
  // children = (the JSX content)
  // props = { id: "examples", className: "my-class", ... }
}
```

Everything we didn't destructure by name (`title`, `children`) gets merged into the `props` object. The name `props` is just a convention — you could call it `rest` or `remainingProps`.

### Step 2: Spread Those Props onto the Inner Element

```jsx
export default function Section({ title, children, ...props }) {
  return (
    <section {...props}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

The `{...props}` spread operator takes every key-value pair in the `props` object and applies them as individual attributes on the `<section>` element.

So if `props = { id: "examples", className: "highlight" }`, it's equivalent to writing `<section id="examples" className="highlight">`.

---

## How It Looks in Practice

Now when we use the component:

```jsx
<Section title="Examples" id="examples" className="highlight" data-testid="examples-section">
  {/* content */}
</Section>
```

- `title` → extracted and used for the `<h2>`
- `children` → extracted and rendered below the title
- `id`, `className`, `data-testid` → all collected into `...props` and spread onto `<section>`

**No matter how many extra attributes someone adds, they all get forwarded.** The component is now truly flexible.

---

## Applying the Same Pattern to TabButton

The same pattern works great for the `TabButton` component. Instead of having a custom `onSelect` prop:

```jsx
// Before: Custom prop name, manual forwarding
export default function TabButton({ children, onSelect, isSelected }) {
  return (
    <li>
      <button className={isSelected ? "active" : undefined} onClick={onSelect}>
        {children}
      </button>
    </li>
  );
}
```

We can forward everything:

```jsx
// After: Forwarded props
export default function TabButton({ children, isSelected, ...props }) {
  return (
    <li>
      <button className={isSelected ? "active" : undefined} {...props}>
        {children}
      </button>
    </li>
  );
}
```

Now in the parent, use `onClick` directly (since it gets forwarded to the built-in button):

```jsx
<TabButton isSelected={selectedTopic === 'jsx'} onClick={() => handleSelect('jsx')}>
  JSX
</TabButton>
```

This is cleaner because we're using the standard `onClick` prop name rather than inventing our own `onSelect`.

---

## ✅ Key Takeaways

- **Rest operator** (`...props` in destructuring): Collects all unextracted props into one object
- **Spread operator** (`{...props}` in JSX): Spreads that object as individual attributes on an element
- This pattern makes wrapper components **flexible and future-proof** — they forward any props without knowing about them in advance
- It's especially useful for components that wrap built-in elements (buttons, inputs, sections, divs)

## ⚠️ Common Mistakes

- **Confusing rest and spread**: Same `...` syntax, but rest *collects* (in destructuring) while spread *distributes* (in JSX/objects)
- **Spreading onto the wrong element**: Make sure you spread props onto the element that should actually receive them
- **Accidentally overriding**: If the inner element already has a prop (like `className`) and you spread props that also include `className`, one will override the other

## 💡 Pro Tips

- This pattern is used extensively in component libraries like Material UI, Chakra UI, and shadcn/ui
- When building reusable components, **always consider forwarding props** — it makes your components more versatile with minimal effort
- You can use this pattern with any wrapper component: custom buttons, inputs, cards, modals, etc.
