# Adding Extra Components for Reusability & Configurability

## Introduction

Your Accordion works and the components are grouped. But the `AccordionItem` still handles too much — it renders the title *and* the content *and* manages the click logic. What if you want a title with an icon? Or content with a completely different layout? You'd have to modify `AccordionItem` every time.

The solution: **break it down further**. Extract the title and content into their own dedicated components. This lesson shows you how to take Compound Components to the next level of reusability.

---

## Concept 1: Extracting AccordionTitle

### 🧠 What is it?

A dedicated `AccordionTitle` component that handles rendering the clickable title of an accordion item. It reads from context to get the toggle function and accepts `children` for maximum flexibility.

### ❓ Why do we need it?

With the title baked into `AccordionItem`, you're stuck with whatever markup `AccordionItem` provides. By extracting it:
- You can render **anything** as a title (text, icons, images, complex markup)
- Styling is fully controlled from the outside via `className`
- The component is truly reusable

### ⚙️ How it works

```jsx
import { useAccordionContext } from './Accordion';

export default function AccordionTitle({ id, className, children }) {
  const { toggleItem } = useAccordionContext();

  return (
    <h3 className={className} onClick={() => toggleItem(id)}>
      {children}
    </h3>
  );
}
```

Key changes:
- Uses `children` instead of a `title` prop — so you can put *anything* inside
- Gets `toggleItem` from context — no need to receive it via props
- Accepts `className` for external styling control

---

## Concept 2: Extracting AccordionContent

### 🧠 What is it?

A dedicated `AccordionContent` component that handles the expandable/collapsible content area. It reads from context to know whether it should be visible.

### ⚙️ How it works

```jsx
import { useAccordionContext } from './Accordion';

export default function AccordionContent({ id, className, children }) {
  const { openItemId } = useAccordionContext();
  const isOpen = openItemId === id;

  return (
    <div className={`${isOpen ? 'open' : 'close'} ${className ?? ''}`}>
      {children}
    </div>
  );
}
```

**Key details:**
- Uses `openItemId` from context to determine visibility
- Applies `open` or `close` CSS class based on state
- Appends any external `className` with a nullish coalescing check (`??`)

### 💡 Insight

By moving the `open`/`close` class logic into its own component, you decouple **visual state** from the item container. The `AccordionItem` itself becomes a simple wrapper — clean and minimal.

---

## Concept 3: Simplifying AccordionItem

### 🧠 What is it?

With the title and content extracted, `AccordionItem` becomes a thin shell — just a `<li>` element that accepts `children` and `className`.

### ⚙️ How it works

```jsx
export default function AccordionItem({ className, children }) {
  return <li className={className}>{children}</li>;
}
```

That's it. No state logic, no click handlers, no conditional rendering. It's purely structural.

---

## Concept 4: Registering the New Components

### 🧠 What is it?

Just like you added `Accordion.Item`, you now register the new components on the `Accordion` function object.

### ⚙️ How it works

```jsx
import AccordionItem from './AccordionItem';
import AccordionTitle from './AccordionTitle';
import AccordionContent from './AccordionContent';

Accordion.Item = AccordionItem;
Accordion.Title = AccordionTitle;
Accordion.Content = AccordionContent;
```

### 🧪 Example

The App component now looks like this:

```jsx
<Accordion className="accordion">
  <Accordion.Item id="experience" className="accordion-item">
    <Accordion.Title id="experience" className="accordion-item-title">
      We got 20 years of experience
    </Accordion.Title>
    <Accordion.Content id="experience" className="accordion-item-content">
      <article>
        <p>You can't go wrong with us...</p>
      </article>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### 💡 Insight

Notice how each sub-component is independently styled and structured. You could easily:
- Add an icon to the title without touching `AccordionContent`
- Use a completely different content layout for each item
- Swap out the `<h3>` for a `<button>` in a custom title component

This is the real power of Compound Components — **composability**.

---

## Concept 5: Decoupling CSS for Open/Close

### 🧠 What is it?

A small but important CSS improvement: moving the `display: none` rule out of the generic `accordion-item-content` class and into a dedicated `close` class.

### ❓ Why do we need it?

If `display: none` is part of the content's base styling class, it's tightly coupled. By moving it to a separate `close` class, the visibility logic is fully controlled by the component, not the stylesheet.

### ⚙️ How it works

```css
/* Before — tightly coupled */
.accordion-item-content {
  display: none;
  /* other styles */
}

/* After — decoupled */
.accordion-item-content {
  /* only styling rules */
}
.close {
  display: none;
}
```

---

## ✅ Key Takeaways

- Breaking Compound Components into **smaller, focused sub-components** (Title, Content) dramatically increases reusability
- Each sub-component handles one concern: Title handles clicks, Content handles visibility
- `AccordionItem` becomes a minimal structural wrapper
- Register all sub-components on the main component object (`Accordion.Title`, `Accordion.Content`)
- Decouple CSS logic (open/close) from styling classes

## ⚠️ Common Mistakes

- Forgetting to pass `id` to both Title and Content (needed for context logic)
- Hardcoding CSS classes inside components — always accept `className` as a prop
- Not using nullish coalescing (`??`) when appending optional class names — you'll get `undefined` in your class string

## 💡 Pro Tips

- Use `children` in sub-components instead of specific props whenever possible — it maximizes flexibility
- The more you decompose, the more composable your components become
- This pattern scales beautifully — you could add `Accordion.Icon`, `Accordion.Badge`, etc.
