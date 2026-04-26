# Sharing Cross-Component State When Working with Compound Components

## Introduction

There's one annoying thing about the Accordion right now: you have to pass the `id` to **both** the Title and the Content components. Wouldn't it be better to set the `id` once on the Item and have it automatically available to all nested components? 

This lesson shows how to solve this with a **second, nested context** — a pattern that makes your Compound Components even more ergonomic to use.

---

## Concept 1: The Problem — Redundant ID Props

### 🧠 What is it?

Currently, every `Accordion.Title` and `Accordion.Content` needs the same `id` prop that's already on `Accordion.Item`. This is repetitive and error-prone.

### ❓ Why do we need to fix it?

```jsx
{/* The id is repeated THREE times — this is fragile */}
<Accordion.Item id="experience" className="accordion-item">
  <Accordion.Title id="experience" className="accordion-item-title">...</Accordion.Title>
  <Accordion.Content id="experience" className="accordion-item-content">...</Accordion.Content>
</Accordion.Item>
```

If you change the id on the Item but forget to update it on the Title or Content, things will silently break. This violates the DRY principle.

### 💡 Insight

You can't solve this with props because `AccordionItem` just forwards `children` — it doesn't render `Title` and `Content` explicitly. But you *can* solve it with another context.

---

## Concept 2: Creating an AccordionItem Context

### 🧠 What is it?

A second, simpler context specifically for the `AccordionItem`. Its only job is to pass the `id` down to nested components.

### ⚙️ How it works

```jsx
import { createContext, useContext } from 'react';

const AccordionItemContext = createContext();

export function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);

  if (!context) {
    throw new Error(
      'AccordionItem-related components must be wrapped by <Accordion.Item>.'
    );
  }

  return context;
}

export default function AccordionItem({ id, className, children }) {
  return (
    <AccordionItemContext.Provider value={id}>
      <li className={className}>{children}</li>
    </AccordionItemContext.Provider>
  );
}
```

**Key points:**
- The context value is simply the `id` — no complex objects needed
- A custom hook with a guard clause ensures safe usage
- `AccordionItem` wraps its children with this provider

### 💡 Insight

This is a **nested context** pattern — you have the outer `AccordionContext` for the overall open/close state, and the inner `AccordionItemContext` for per-item data. They serve completely different purposes and work together beautifully.

---

## Concept 3: Consuming the Item Context in Title and Content

### 🧠 What is it?

Now `AccordionTitle` and `AccordionContent` can get the `id` from context instead of props.

### ⚙️ How it works

In `AccordionTitle`:
```jsx
import { useAccordionContext } from './Accordion';
import { useAccordionItemContext } from './AccordionItem';

export default function AccordionTitle({ className, children }) {
  const { toggleItem } = useAccordionContext();
  const id = useAccordionItemContext();

  return (
    <h3 className={className} onClick={() => toggleItem(id)}>
      {children}
    </h3>
  );
}
```

In `AccordionContent`:
```jsx
import { useAccordionContext } from './Accordion';
import { useAccordionItemContext } from './AccordionItem';

export default function AccordionContent({ className, children }) {
  const { openItemId } = useAccordionContext();
  const id = useAccordionItemContext();
  const isOpen = openItemId === id;

  return (
    <div className={`${isOpen ? 'open' : 'close'} ${className ?? ''}`}>
      {children}
    </div>
  );
}
```

### 🧪 Example

The App component becomes much cleaner:

```jsx
<Accordion className="accordion">
  <Accordion.Item id="experience" className="accordion-item">
    <Accordion.Title className="accordion-item-title">
      We got 20 years of experience
    </Accordion.Title>
    <Accordion.Content className="accordion-item-content">
      <article><p>You can't go wrong with us...</p></article>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

The `id` is set **once** on the Item — Title and Content get it automatically through context. Clean, DRY, and less error-prone.

---

## Concept 4: Single File vs. Multiple Files

### 🧠 What is it?

An optional architecture decision: should you keep all Accordion components in separate files, or merge them into one?

### ⚙️ How it works

**Separate files (current approach):**
- Easier to read and navigate
- Each component is independently importable (which could lead to misuse)

**Single file approach:**
- All components in `Accordion.jsx`
- Only `Accordion` is exported — sub-components are only accessible via `Accordion.Title`, etc.
- Prevents any possibility of importing sub-components individually

### 💡 Insight

For learning purposes, keeping files separate is better for readability. For production libraries where you want strict encapsulation, merging into one file is a valid choice. Both approaches are used in the real world.

---

## ✅ Key Takeaways

- Use a **nested context** to pass per-item data (like `id`) without prop repetition
- The `AccordionItemContext` is simple — its value is just the `id`
- Always include a **guard clause** in custom context hooks for safety
- After this change, the `id` is only set once on `Accordion.Item` — Title and Content get it from context
- Optionally, merge all components into one file for strict encapsulation

## ⚠️ Common Mistakes

- Creating an overly complex nested context — keep it simple, just pass what's needed
- Forgetting to remove the `id` prop from Title and Content after switching to context
- Using the `AccordionItemContext` hook outside of an `Accordion.Item` — the guard clause will catch this

## 💡 Pro Tips

- Nested contexts are lightweight — don't be afraid to use them when they simplify your API
- This pattern (parent providing context for children) is used in form libraries (React Hook Form, Formik) extensively
- Think of the outer context as "global" to the component family and the inner context as "local" to each instance
