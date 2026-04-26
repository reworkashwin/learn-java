# Grouping Compound Components

## Introduction

Your Accordion works — items open and close, and only one can be open at a time. But there's a subtle code quality improvement you can make. Right now, `Accordion` and `AccordionItem` are separate imports. How do you make it *crystal clear* to anyone reading the code that these components are meant to work together?

The answer: **group them into a single object**. This lesson covers how to improve the toggle logic and how to use JavaScript's object property syntax to bundle Compound Components together.

---

## Concept 1: Improving the Toggle Logic

### 🧠 What is it?

Instead of having separate `openItem` and `closeItem` functions, you can simplify them into a single `toggleItem` function. This is cleaner and reduces the API surface of your context.

### ❓ Why do we need it?

Two functions that always work in tandem can be confusing. A single `toggleItem` function is more intuitive — "click an item, and it toggles." Simple.

### ⚙️ How it works

```jsx
function toggleItem(id) {
  setOpenItemId((prevId) => (prevId === id ? null : id));
}
```

**What's happening:**
- If the clicked item is already open (`prevId === id`), close it by setting state to `null`
- Otherwise, open the clicked item by setting state to its `id`
- Uses the **function form** of state updates (receiving previous state) — this is the correct pattern when the new state depends on the old state

### 🧪 Example

In `AccordionItem`, the click handler becomes much simpler:

```jsx
const { openItemId, toggleItem } = useAccordionContext();

// No need for a separate handleClick function anymore:
<h3 onClick={() => toggleItem(id)}>{title}</h3>
```

### 💡 Insight

Using the function form of `setState` (with the callback) is a React best practice whenever the new state depends on the previous state. It avoids potential bugs from stale closures.

---

## Concept 2: Grouping Components into One Object

### 🧠 What is it?

In JavaScript, functions are objects. This means you can attach properties to a function — and that's exactly what we do to group Compound Components. Instead of importing `Accordion` and `AccordionItem` separately, you access the item via `Accordion.Item`.

### ❓ Why do we need it?

When multiple developers work on a codebase, it's crucial that the relationship between components is obvious. Grouping makes it **impossible to miss** that `Item` belongs to `Accordion`.

Compare:
```jsx
// Less clear — are these related?
import Accordion from './Accordion';
import AccordionItem from './AccordionItem';

// Crystal clear — Item belongs to Accordion
import Accordion from './Accordion';
// Usage: <Accordion.Item>
```

### ⚙️ How it works

In your `Accordion.jsx` file:

```jsx
import AccordionItem from './AccordionItem';

// ... Accordion component definition ...

// Attach the Item component as a property
Accordion.Item = AccordionItem;
```

Now in the App component:

```jsx
import Accordion from './Accordion';

<Accordion className="accordion">
  <Accordion.Item id="experience" className="accordion-item" title="...">
    ...
  </Accordion.Item>
  <Accordion.Item id="local-guides" className="accordion-item" title="...">
    ...
  </Accordion.Item>
</Accordion>
```

### 💡 Insight

This pattern is used everywhere in the React ecosystem:
- `Form.Input`, `Form.Label` (Semantic UI)
- `Menu.Item`, `Menu.Button` (Headless UI)
- `Card.Header`, `Card.Body` (Bootstrap React)

It's a convention that immediately signals: "these components are designed to work together."

---

## Concept 3: Error Boundaries for Misuse

### 🧠 What is it?

The custom `useAccordionContext` hook you created earlier acts as a safety net. If someone tries to use `Accordion.Item` outside of an `Accordion`, they'll get a clear error message instead of a cryptic `undefined` error.

### ⚙️ How it works

Try using `<Accordion.Item>` outside of `<Accordion>`:

```jsx
// This will throw: "Accordion-related components must be wrapped by <Accordion>."
<Accordion.Item id="test" title="Oops">
  <p>This won't work</p>
</Accordion.Item>
```

The error comes from the guard clause in your custom hook — it's your safety net.

### 💡 Insight

If you want to be *extra* safe, you could put all Accordion-related components in a single file. That way, individual components aren't even exported — they can *only* be accessed through the `Accordion` object. This is a valid approach for production libraries, though it can make the code harder to read during development.

---

## ✅ Key Takeaways

- **Toggle logic** can be simplified into a single function using the function form of `setState`
- **Grouping** Compound Components (e.g., `Accordion.Item`) makes relationships explicit and code more readable
- JavaScript functions are objects — you can attach properties to them
- The **custom hook guard clause** prevents misuse outside the wrapper component
- Optionally, merging all components into one file prevents individual imports entirely

## ⚠️ Common Mistakes

- Forgetting to use the function form of `setState` when the new state depends on the old state
- Importing individual Accordion components instead of using the grouped syntax
- Not removing old separate imports after switching to the grouped pattern

## 💡 Pro Tips

- The `Component.SubComponent` pattern is a strong signal to other developers that these components are tightly coupled
- You don't *have* to merge everything into one file — grouping via object properties is usually sufficient
- This pattern scales well — you can add `Accordion.Title`, `Accordion.Content`, etc., as you'll see next
