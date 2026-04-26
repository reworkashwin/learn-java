# Introducing Compound Components

## Introduction

What if you could build React components that work *together* like a team — each one playing its role, but none of them useful in isolation? That's exactly what the **Compound Components** pattern is about. It's one of the most powerful patterns in React, and understanding it will level up how you think about component design.

In this lesson, you'll learn what Compound Components are, why they matter, and how to build an Accordion using this pattern from scratch.

---

## Concept 1: What Are Compound Components?

### 🧠 What is it?

Compound Components are React components that are **designed to work together**, not standalone. They rely on each other to form a complete, functional UI element.

Think of it this way: each component is a puzzle piece. On its own, a single piece is meaningless. But when you combine them, they form a complete picture.

### ❓ Why do we need it?

Why not just build one big component that does everything?

Because a single monolithic component is:
- **Hard to customize** — you'd have to pass dozens of props to control every aspect
- **Hard to maintain** — all the logic is crammed into one place
- **Inflexible** — it's difficult to change how individual parts render

Compound Components solve this by splitting responsibilities across multiple components while keeping them connected through shared state.

### ⚙️ How it works

The best analogy comes from plain HTML. Consider `<select>` and `<option>`:

```html
<select>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

- `<select>` alone doesn't do much
- `<option>` alone is meaningless
- **Together**, they create a functional dropdown

Compound Components follow the exact same principle — but with React components you build yourself.

### 💡 Insight

You've likely used Compound Components without realizing it. Libraries like Headless UI, Radix UI, and Reach UI all use this pattern extensively. When you see `<Menu>`, `<Menu.Item>`, `<Menu.Button>` — that's compound components in action.

---

## Concept 2: Building an Accordion — The Wrapper Component

### 🧠 What is it?

The first step in building Compound Components is creating the **wrapper component** — the outer shell that holds everything together. For our Accordion, this is the `Accordion` component.

### ❓ Why do we need it?

The wrapper component serves as the structural container. It doesn't render individual items — instead, it provides the context and layout for its children. This is what makes the children highly configurable.

### ⚙️ How it works

Instead of accepting an `items` array and rendering everything internally (which would be rigid), the `Accordion` component accepts the special `children` prop:

```jsx
export default function Accordion({ children, className }) {
  return <ul className={className}>{children}</ul>;
}
```

This is the key insight: by using `children`, you let the *consumer* of the component decide what goes inside. The `Accordion` just provides the wrapper `<ul>` and any shared styling.

### 💡 Insight

Using `children` instead of an `items` prop is what makes this pattern so powerful. You're not hardcoding what goes inside — you're creating an open, flexible container.

---

## Concept 3: Building the AccordionItem Component

### 🧠 What is it?

The `AccordionItem` is the individual item component that lives inside the `Accordion` wrapper. Each item displays a title and content.

### ⚙️ How it works

```jsx
export default function AccordionItem({ className, title, children }) {
  return (
    <li className={className}>
      <h3>{title}</h3>
      <div>{children}</div>
    </li>
  );
}
```

Notice:
- The **title** is passed as a prop
- The **content** is passed via `children` — making it completely flexible
- The **styling** is controlled via `className` from outside

### 🧪 Example

Using them together in the App component:

```jsx
<Accordion className="accordion">
  <AccordionItem className="accordion-item" title="We got 20 years of experience">
    <article>
      <p>You can&apos;t go wrong with us. We are in the business of planning
      highly individualized vacation trips for more than 20 years.</p>
    </article>
  </AccordionItem>

  <AccordionItem className="accordion-item" title="We're working with local guides">
    <article>
      <p>We are not doing this alone from our office. Instead, we are working
      with local guides to ensure a safe and pleasant vacation.</p>
    </article>
  </AccordionItem>
</Accordion>
```

### 💡 Insight

Compare this to the HTML `<select>` / `<option>` analogy:
- `Accordion` = `<select>` (the container)
- `AccordionItem` = `<option>` (the individual items)

They're meant to work together, and the content is fully customizable between the tags.

---

## ✅ Key Takeaways

- **Compound Components** are components designed to work together, not in isolation
- The **wrapper component** uses `children` to remain flexible and open
- **Individual components** (like `AccordionItem`) handle their own rendering but depend on being inside the wrapper
- This pattern is inspired by built-in HTML elements like `<select>` and `<option>`
- It makes components highly **configurable** and **reusable**

## ⚠️ Common Mistakes

- Trying to pass an `items` array to the wrapper and mapping over it — this defeats the purpose of Compound Components
- Forgetting to pass `className` for styling — remember, these components are meant to be styled from outside
- Using `AccordionItem` outside of `Accordion` — it won't work properly without the context (as you'll see in the next lesson)

## 💡 Pro Tips

- Start with the wrapper component and `children` — this sets the foundation
- Think about what each component's **minimum responsibility** should be
- Don't over-engineer the first version — you can always add more features later (like open/close logic)
