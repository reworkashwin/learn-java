# Managing Multi-Component State with the Context API

## Introduction

You've built an Accordion with Compound Components — but it doesn't *do* anything yet. The items are always visible, and clicking them does nothing. How do you manage state across multiple components that are designed to work together but are structurally independent?

The answer: **React's Context API**. In this lesson, you'll learn how to wire up shared state between Compound Components so that opening one accordion item automatically closes the others.

---

## Concept 1: The Challenge of Shared State in Compound Components

### 🧠 What is it?

When you have multiple components that need to coordinate (like accordion items that should know about each other), you need a way to share state between them — without tightly coupling them through props.

### ❓ Why do we need it?

The `Accordion` wrapper uses `children` to render whatever you put inside it. It doesn't know *what* its children are — it just forwards them. This means you can't pass state down through props from `Accordion` to `AccordionItem` directly, because the wrapper doesn't render the items explicitly.

So how do we share state? **Context.**

### ⚙️ How it works

The solution has three parts:
1. **Create a context** — specifically for the Accordion
2. **Provide context** from the wrapper component (`Accordion`)
3. **Consume context** in the child components (`AccordionItem`)

### 💡 Insight

This is a *scoped* context — it's not a global app-wide context like you might use for authentication or theming. It's deliberately local to the Accordion component family. That's a key distinction.

---

## Concept 2: Creating and Providing the Accordion Context

### 🧠 What is it?

You create a dedicated context inside the same file as the `Accordion` component and use it to provide state to all children.

### ⚙️ How it works

```jsx
import { createContext, useState } from 'react';

const AccordionContext = createContext();

export default function Accordion({ children, className }) {
  const [openItemId, setOpenItemId] = useState(null);

  function openItem(id) {
    setOpenItemId(id);
  }

  function closeItem() {
    setOpenItemId(null);
  }

  const contextValue = { openItemId, openItem, closeItem };

  return (
    <AccordionContext.Provider value={contextValue}>
      <ul className={className}>{children}</ul>
    </AccordionContext.Provider>
  );
}
```

**What's happening here:**
- `openItemId` tracks which item is currently open (`null` means none)
- `openItem(id)` sets a new item as open
- `closeItem()` closes the current item
- The context value exposes all three to any child that needs them

### 💡 Insight

The `Accordion` component now has a dual role: it's both the **visual wrapper** (rendering the `<ul>`) and the **state provider** (managing which item is open). This is a common pattern with Compound Components.

---

## Concept 3: Adding a Safe Custom Hook for Context Access

### 🧠 What is it?

A custom hook that wraps `useContext` and adds a safety check — ensuring that Accordion-related components are actually used inside an `Accordion`.

### ❓ Why do we need it?

If someone accidentally uses `AccordionItem` outside of an `Accordion`, the context will be `undefined`, leading to cryptic runtime errors. A custom hook with a guard clause gives a **clear, descriptive error** instead.

### ⚙️ How it works

```jsx
import { useContext } from 'react';

export function useAccordionContext() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error(
      'Accordion-related components must be wrapped by <Accordion>.'
    );
  }

  return context;
}
```

### 💡 Insight

This is a defensive programming pattern. It costs almost nothing to add, but saves hours of debugging when someone misuses the component. It's a hallmark of well-built component libraries.

---

## Concept 4: Consuming Context in AccordionItem

### 🧠 What is it?

Now `AccordionItem` uses the context to determine if it's the currently open item and to handle click events for opening/closing.

### ⚙️ How it works

```jsx
import { useAccordionContext } from './Accordion';

export default function AccordionItem({ id, className, title, children }) {
  const { openItemId, openItem, closeItem } = useAccordionContext();

  const isOpen = openItemId === id;

  function handleClick() {
    if (isOpen) {
      closeItem();
    } else {
      openItem(id);
    }
  }

  return (
    <li className={className}>
      <h3 onClick={handleClick}>{title}</h3>
      <div className={isOpen ? 'accordion-item-content open' : 'accordion-item-content'}>
        {children}
      </div>
    </li>
  );
}
```

**Key points:**
- Each item receives a unique `id` prop
- `isOpen` is derived by comparing `openItemId` from context with the item's own `id`
- Clicking the title toggles the item open/closed
- A CSS class (`open`) controls visibility

### 🧪 Example

```jsx
<Accordion className="accordion">
  <AccordionItem id="experience" className="accordion-item" title="We got 20 years of experience">
    <article><p>You can't go wrong with us...</p></article>
  </AccordionItem>
  <AccordionItem id="local-guides" className="accordion-item" title="We're working with local guides">
    <article><p>We work with local guides...</p></article>
  </AccordionItem>
</Accordion>
```

Now clicking "We got 20 years of experience" opens it. Clicking "We're working with local guides" opens that one and closes the first. Only one item is open at a time!

---

## ✅ Key Takeaways

- **Context API** is the glue that connects Compound Components — it enables shared state without prop drilling
- Create context in the **same file** as the wrapper component to keep it scoped
- The wrapper component is both the **layout container** and the **context provider**
- Always add a **custom hook with a safety check** to prevent misuse outside the wrapper
- Each child component uses context to read shared state and dispatch actions

## ⚠️ Common Mistakes

- Forgetting to wrap children with `Context.Provider` — the context won't be available
- Not giving each `AccordionItem` a unique `id` — the open/close logic will break
- Using the context outside of the `Accordion` wrapper — always use the custom hook with the guard clause

## 💡 Pro Tips

- Keep the context minimal — only expose what child components actually need
- The custom hook pattern (`useAccordionContext`) is used in almost every professional component library
- If you need the context in multiple files, export the hook — never export the raw context object
