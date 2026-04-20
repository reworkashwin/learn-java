# Adding the "New Project" Component & A Reusable "Input" Component

## Introduction

Now we need a screen where users can actually **enter project details** — a title, description, and due date. But instead of just hardcoding three `<input>` elements, we'll build a **reusable `Input` component** that wraps shared markup and styling. This is React's composability in action.

---

## The NewProject Component

This component displays a form-like area with a Cancel button, a Save button, and three input fields:

```jsx
export default function NewProject() {
  return (
    <div>
      <menu>
        <button>Cancel</button>
        <button>Save</button>
      </menu>
      <div>
        <Input label="Title" />
        <Input label="Description" textarea />
        <Input label="Due Date" />
      </div>
    </div>
  );
}
```

### Why no `<form>` element?

Semantically, a `<form>` would be more appropriate. But React has a whole world of form-handling nuances (covered in a dedicated section later). Using a `<div>` here keeps things simple while we focus on component composition and state management.

---

## Building the Reusable Input Component

We have three inputs that share the same structure: a `<p>` wrapping a `<label>` and either an `<input>` or a `<textarea>`. Instead of repeating that three times, we extract it into a component.

```jsx
export default function Input({ label, textarea, ...props }) {
  return (
    <p>
      <label>{label}</label>
      {textarea ? <textarea {...props} /> : <input {...props} />}
    </p>
  );
}
```

### What's happening here?

1. **`label` prop** — Sets the text for the `<label>` element
2. **`textarea` prop** — A boolean flag. If present/truthy, render a `<textarea>` instead of an `<input>`
3. **`...props` (rest/spread)** — Collects every other prop passed to `<Input>` and spreads them onto the underlying HTML element. This makes the component **fully configurable** — you can pass `type`, `placeholder`, `maxLength`, or any standard attribute.

### Why is this powerful?

Setting `textarea` as a prop without a value (`<Input textarea />`) automatically sets it to `true`. This is a JSX shorthand that mirrors HTML boolean attributes.

The spread pattern (`...props`) means consumers of `<Input>` don't need to know (or care) whether they're interacting with a custom component or a native HTML element. It just works.

---

## Rendering NewProject in the App

For now, we show `NewProject` alongside the sidebar with flexbox:

```jsx
<main className="h-screen my-8 flex gap-8">
  <ProjectsSidebar />
  <NewProject />
</main>
```

Adding `flex` to `<main>` positions the sidebar and the new project form side by side. The `gap-8` adds 2rem of spacing between them. As a bonus, flexbox automatically stretches the sidebar to fill the available height — solving the "sidebar not tall enough" problem from earlier.

---

## ✅ Key Takeaways

- **Extract reusable components** when you see repeated JSX patterns (label + input pairs in this case).
- The **rest/spread pattern** (`...props`) makes components flexible without explicitly listing every possible prop.
- **Boolean props** like `textarea` can be passed without `={true}` — just their presence makes them truthy.
- Using `flex` on a parent element is a quick way to position children side by side with consistent spacing.

---

## 💡 Pro Tip

The `...props` spread pattern is one of the most powerful patterns in React component design. It lets you build thin wrappers around native elements that add styling or behavior without sacrificing any of the native element's capabilities.
