# Module Summary

## Introduction

This wraps up the **React Essentials** section. Let's consolidate everything we've learned by reviewing the core concepts we've explored while building our interactive demo application.

---

## Components

- React is **all about components** — reusable, self-contained building blocks for your UI
- Components are just **functions** that return renderable content (typically JSX)
- Component names **must start with an uppercase character**
- You use components like custom HTML elements in JSX: `<MyComponent />`

---

## Props

- Props let you **configure and reuse** components with different data
- You can pass any value as a prop — strings, numbers, objects, functions, even JSX
- Props are received as the **first parameter** of the component function
- **Object destructuring** makes it clean: `function MyComponent({ title, image }) { ... }`
- You can **spread an entire object** as props: `<MyComponent {...data} />`

---

## JSX & Dynamic Content

- Curly braces `{}` let you embed **dynamic JavaScript expressions** in JSX
- Works both between tags and as attribute values
- The special **`children` prop** gives you access to content between opening and closing tags of your component

---

## Events

- Use `on` props like `onClick`, `onChange`, etc., to **listen to events** on built-in elements
- You can create **custom event props** (`onSelect`, `onDelete`, etc.) on your own components to forward functions to inner elements
- Always **point to** a function — don't call it: `onClick={handleClick}` not `onClick={handleClick()}`

---

## State & `useState`

- **State** is the mechanism for data that changes over time and should trigger UI updates
- `useState` returns a pair: the current value and a function to update it
- When state updates → component re-executes → JSX re-evaluates → **UI updates automatically**
- React compares old and new JSX and only updates what actually changed in the DOM

---

## Conditional Rendering

Three approaches for showing content conditionally:
1. **Variable + `if`** — cleanest for complex logic
2. **Ternary expressions** (`? :`) — inline either/or
3. **Logical AND** (`&&`) — inline show/hide

---

## Dynamic Lists

- Use `.map()` to transform data arrays into JSX element arrays
- Always add a **`key` prop** with a unique, stable identifier
- React uses keys internally for efficient list rendering and updates

---

## ✅ Key Takeaways

- These six concepts — **Components, Props, JSX, Events, State, and Conditional/List Rendering** — form the foundation of every React application
- You'll use these patterns in basically every React project you build
- Mastering these essentials gives you the tools to build basic interactive UIs and prepares you for deeper React concepts

## 💡 Pro Tips

- If you're ever stuck on a React problem, ask yourself: "Is this a components problem, a props problem, a state problem, or a rendering problem?" — it almost always falls into one of these categories
- Practice by building small projects using only these essentials before moving to advanced features
- The patterns you've learned here (data-driven rendering, conditional content, event handling) are universal across all component-based frameworks
