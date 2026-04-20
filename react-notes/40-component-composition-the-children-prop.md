# Component Composition: The Special "children" Prop

## Introduction

There are two main ways to pass content into a component: through **custom props** (like `title` or `description`) or through the **children prop**. The children prop enables a powerful pattern called **component composition** — and it's one you'll use all the time.

---

## The Scenario

Let's say you're building tab buttons. You want a reusable `TabButton` component and you'd like to use it like this:

```jsx
<TabButton>Components</TabButton>
```

Just like you'd use a regular `<button>`:

```html
<button>Click Me</button>
```

You want your custom component to wrap content between its opening and closing tags. But what happens if you try this?

---

## The Problem

If you simply create a `TabButton` component and use it with content between the tags:

```jsx
<TabButton>Components</TabButton>
```

...you'll find that the text "Components" **doesn't appear** on the screen. React renders the component but completely ignores the content between the tags.

Why? Because React doesn't know *where* to put that content inside your component's JSX. You haven't told it.

---

## The Solution: The `children` Prop

React provides a **special, built-in prop** called `children`. You don't set it as an attribute — instead, it automatically contains **whatever content is placed between the opening and closing tags** of your component.

```jsx
function TabButton({ children }) {
  return (
    <li>
      <button>{children}</button>
    </li>
  );
}
```

Now when you write:

```jsx
<TabButton>Components</TabButton>
```

The string `"Components"` is passed as `children` and rendered inside the `<button>`.

### What Can `children` Be?

- Simple text: `<TabButton>Click Me</TabButton>`
- JSX elements: `<TabButton><strong>Bold Text</strong></TabButton>`
- Complex nested structures: Multiple elements, other components, anything!

---

## Component Composition

This pattern of **wrapping content inside a component** is called **component composition**. It's one of the most powerful patterns in React.

> Think of it like a picture frame — the frame (your component) stays the same, but the picture inside (the children) can be anything.

---

## Children vs. Custom Props — When to Use Which?

Both approaches are valid. The choice depends on the situation:

| Approach | Best For | Example |
|----------|----------|---------|
| **Children** | Wrapping content, mimicking HTML patterns | `<TabButton>Click Me</TabButton>` |
| **Custom Props** | Multiple distinct data pieces | `<CoreConcept title="X" desc="Y" />` |

For `TabButton`, the children approach feels natural because it mirrors how you'd use a regular HTML `<button>`. For `CoreConcept`, custom props make more sense because we have multiple separate pieces of data (title, description, image).

You *could* use a `label` prop instead:

```jsx
<TabButton label="Components" />
```

It works the same way — there's no "right" answer. It's about **clarity and convention**.

---

## Using Multiple Tab Buttons

```jsx
<menu>
  <TabButton>Components</TabButton>
  <TabButton>JSX</TabButton>
  <TabButton>Props</TabButton>
  <TabButton>State</TabButton>
</menu>
```

Same component, different content each time — thanks to `children`.

---

## ✅ Key Takeaways

- The **`children` prop** is a special built-in prop that captures content between a component's opening and closing tags
- You don't set `children` as an attribute — it's set automatically by React
- **Component composition** = wrapping content inside a component using `children`
- Both `children` and custom props are valid — choose based on what feels most natural
- `children` can hold text, JSX, or complex nested structures

## ⚠️ Common Mistakes

- Forgetting to use `{children}` inside the component — the content won't appear
- Trying to set `children` as an attribute (`children="text"`) — while technically possible, it's unconventional
- Thinking there's a "better" approach between children and custom props — both are tools for different situations

## 💡 Pro Tips

- Use `children` when your component is a **wrapper** or **container** (cards, buttons, modals, layouts)
- Use custom props when your component needs **multiple, named data inputs**
- Many popular React libraries rely heavily on composition — understanding `children` is essential
