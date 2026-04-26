# Time to Practice: Exercise Time

## Introduction

You've been learning about TypeScript with React — props, types, `React.FC`, data models. Now it's time to put that knowledge into action. The exercise here is straightforward but important: take an inline JSX element (a list item inside a `.map()`) and extract it into its own properly typed component. It's the bread and butter of React + TypeScript development.

---

## Concept 1: The Exercise — Extracting a Component

### 🧠 What is it?

The goal is to take the `<li>` element rendered inside the `Todos` component's `.map()` and move it into a separate `TodoItem` component — complete with proper TypeScript type annotations.

### ❓ Why do we need it?

In real-world apps, even a simple list item can become complex with additional UI elements, event handlers, and styling. Extracting it into its own component keeps things modular and maintainable. Plus, it's a great exercise for practicing TypeScript props.

---

## Concept 2: Building the TodoItem Component

### 🧠 What is it?

A new functional component that renders a single Todo's text inside a `<li>` element.

### ⚙️ How it works

Create `TodoItem.tsx` (not `Todo.tsx` to avoid naming conflicts with the `Todo` model class):

```tsx
import React from 'react';

const TodoItem: React.FC<{ text: string }> = (props) => {
  return <li>{props.text}</li>;
};

export default TodoItem;
```

Key decisions:
- **File name**: `TodoItem` avoids clashing with the `Todo` class
- **`React.FC`**: Marks this as a functional component with proper base props
- **Generic type `<{ text: string }>`**: Defines that this component expects a `text` prop of type string
- **Only `text`, not the full Todo object**: This component only needs the display text, so we keep the prop minimal

### 💡 Insight

You could also pass the entire `Todo` object as a prop and import the `Todo` type. Both approaches are valid — it depends on what the component actually needs. Keeping props minimal follows the principle of giving components only what they require.

---

## Concept 3: Using TodoItem in the Todos Component

### 🧠 What is it?

Replacing the inline `<li>` in the `Todos` component with the new `TodoItem` component.

### ⚙️ How it works

```tsx
import TodoItem from './TodoItem';

const Todos: React.FC<{ items: Todo[] }> = (props) => {
  return (
    <ul>
      {props.items.map((item) => (
        <TodoItem key={item.id} text={item.text} />
      ))}
    </ul>
  );
};
```

Notice:
- The `key` prop is added on `TodoItem` in the list (where `.map()` is called), not inside the `TodoItem` component itself
- `key` works without being defined in your custom props — `React.FC` includes it as a special built-in prop
- TypeScript auto-completes the `text` prop because it's defined in the generic type

### 🧪 Example

If you forget to pass `text`:
```tsx
<TodoItem key={item.id} />  // ❌ TypeScript error: missing required prop "text"
```

TypeScript catches it immediately.

### 💡 Insight

The `key` prop is special in React — it's used by React internally for reconciliation and is not passed to your component as a prop. That's why you don't need to define it in your type. `React.FC` handles it.

---

## ✅ Key Takeaways

- Extract repeated JSX into separate components, even for simple elements
- Always add `React.FC<>` with proper prop types on new components
- Keep props minimal — only pass what the component actually uses
- The `key` prop is handled by `React.FC` automatically; you don't define it
- Name components carefully to avoid conflicts with model classes

## ⚠️ Common Mistakes

- Naming the component file the same as your model class (e.g., `Todo.tsx` vs `Todo.ts`)
- Adding `key` to your custom props definition — it's already built into `React.FC`
- Passing the entire data object when the component only needs one property

## 💡 Pro Tips

- Use Ctrl+Space / Cmd+Space in your editor to see auto-completion for available props — it confirms your types are working correctly
- This pattern of extracting components + typing their props is what you'll do constantly in React + TypeScript projects — get comfortable with it
