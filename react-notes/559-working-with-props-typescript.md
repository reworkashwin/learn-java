# Working with Props in TypeScript

## Introduction

So you've got a React component and you want to pass some data into it — the classic props pattern. But wait, we're in TypeScript land now. That means we can't just throw `props` around and hope for the best. TypeScript wants to know *exactly* what shape your props will take, and in return, it gives you incredible auto-completion, type safety, and error catching right in your editor.

This section covers how to properly type props in a React + TypeScript project, why generic types matter here, and how `React.FC` makes your life so much easier.

---

## Concept 1: The Problem with Untyped Props

### 🧠 What is it?

When you define a functional component and accept `props` without any type annotation, TypeScript doesn't know what `props` contains. It defaults to an **implicit `any`** type — meaning you lose all TypeScript benefits.

### ❓ Why do we need it?

Without type annotations on props:
- You get no auto-completion when accessing `props.something`
- You won't catch typos or missing props at compile time
- TypeScript warns you about the **implicit `any`** — it doesn't like guessing

### ⚙️ How it works

If you write a component like this:

```tsx
function Todos(props) {
  // props is implicitly "any" — TypeScript complains
}
```

TypeScript gives you two warnings:
1. `props` is declared but never read (if unused)
2. `props` implicitly has type `any`

You *could* explicitly set `props: any`, but that defeats the purpose. You want TypeScript to know the exact shape of your props.

### 💡 Insight

The `strict` mode in `tsconfig.json` is what triggers the "implicit any" warning. It's a good thing — it forces you to be explicit about types, which is the whole point of using TypeScript.

---

## Concept 2: Typing Props with Object Types

### 🧠 What is it?

You can manually type the `props` parameter as an object type, describing each prop and its type.

### ⚙️ How it works

```tsx
function Todos(props: { items: string[] }) {
  // Now TypeScript knows props.items is a string array
}
```

This works, but it's incomplete. React's `props` object doesn't just contain your custom props — it also includes built-in props like `children`. Manually adding all base props for every component would be incredibly cumbersome.

### 💡 Insight

Think of it this way: your custom props are just the tip of the iceberg. React adds its own props underneath, and you'd have to account for all of them manually if you didn't use `React.FC`.

---

## Concept 3: Using `React.FC` with Generic Types

### 🧠 What is it?

`React.FC` (Functional Component) is a type provided by the React type definitions. It tells TypeScript that a constant holds a functional component, and it automatically includes base props like `children`.

### ❓ Why do we need it?

- It saves you from manually defining base props every time
- It merges your custom props with React's built-in props
- It provides full auto-completion and type checking

### ⚙️ How it works

```tsx
import React from 'react';

const Todos: React.FC<{ items: string[] }> = (props) => {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};
```

Here's what's happening:
1. `React.FC` tells TypeScript this is a functional component
2. The angle brackets `<{ items: string[] }>` define your **custom props**
3. React merges your custom props with base props (like `children`)
4. Now `props.items` has full auto-completion and type safety

### 🧪 Example

After adding the type annotation, if you type `props.` in your editor, you'll see:
- `children` — the built-in React prop
- `items` — your custom prop, typed as `string[]`

And because `items` is typed as an array, you get auto-completion for array methods like `.map()`, `.filter()`, etc.

### 💡 Insight

`React.FC` is a **generic type**. The angle brackets aren't creating a new generic — they're **plugging in a concrete type** for the generic placeholder that `React.FC` defines internally. This is the "other side" of generics: instead of defining them, you're *using* them.

---

## Concept 4: Why This Matters — Catching Errors at Compile Time

### 🧠 What is it?

Once your component's props are typed, TypeScript enforces them wherever the component is used. If a required prop is missing or has the wrong type, you get an error **in the editor**, not at runtime.

### ⚙️ How it works

```tsx
// In App.tsx — TypeScript flags this as an error!
<Todos />  // ❌ Missing required prop "items"

// This works:
<Todos items={['Learn React', 'Learn TypeScript']} />  // ✅
```

If `items` is not optional (no `?` in the type), TypeScript forces you to provide it.

### 🧪 Example

You can make a prop optional with `?`:

```tsx
const Todos: React.FC<{ items?: string[] }> = (props) => {
  // Now items might be undefined — you must handle that case
};
```

### 💡 Insight

This is one of the biggest wins of TypeScript with React. You describe the "contract" of your component — what it needs to work — and TypeScript enforces that contract everywhere the component is used. Misusing a component becomes almost impossible.

---

## ✅ Key Takeaways

- Always add `React.FC` as a type annotation on your functional components
- Use angle brackets `<>` to define your custom props as a generic type argument
- TypeScript merges your custom props with base props like `children`
- Required props are enforced at compile time — missing or wrong props trigger errors
- You get full auto-completion for both props and their values

## ⚠️ Common Mistakes

- Forgetting to type props and leaving them as implicit `any`
- Manually typing the full props object instead of using `React.FC<>`
- Not making a prop optional with `?` when it should be
- Confusing type definitions (in angle brackets) with actual value assignments

## 💡 Pro Tips

- Use the arrow function syntax for components — it pairs naturally with `React.FC`
- Cmd/Ctrl + click on `React.FC` in your editor to see the full type definition
- The `strict` option in `tsconfig.json` is what enforces explicit typing — keep it enabled
