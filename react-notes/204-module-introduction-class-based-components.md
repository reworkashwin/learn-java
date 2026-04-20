# Module Introduction: Class-based Components

## Introduction

Up to this point in the course, every component we've built has been a **function**. You write a function, it receives props, it returns JSX, and React renders it. Simple. But there's an **alternative way** to define components in React — using **classes**. Welcome to the world of Class-based Components.

---

## Should You Learn This?

Before diving in, let's get one thing clear: **class-based components are 100% optional** in modern React. You could skip this entire section and build perfectly fine React applications using only functional components.

So why bother learning them?

1. **Legacy codebases** — Many existing React projects were built before hooks existed. You **will** encounter class-based components in the wild, in open-source libraries, and in professional codebases.

2. **Historical context** — Understanding why class-based components exist gives you a deeper appreciation for React Hooks and modern React.

3. **Error Boundaries** — As of now, Error Boundaries (which catch JavaScript errors in component trees) **require** class-based components. There's no functional equivalent yet.

---

## What You'll Learn in This Section

- **What** class-based components are and **why** they exist.
- **How** to build and convert functional components to class-based components.
- **How to manage state** in class-based components (without hooks!).
- **The Component Lifecycle** — `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`.
- **How to use Context** in class-based components.
- **Error Boundaries** — a feature that still requires classes.

---

## The Big Picture

Before React 16.8, if you needed **state** or **side effects** in a component, you **had** to use a class. Functional components were limited to being "dumb" or "presentational" — they could only receive props and render JSX.

React 16.8 changed everything by introducing **Hooks** (`useState`, `useEffect`, etc.), which brought all the power of class-based components to functional components. That's why functional components are now the standard.

But the class-based world still exists, and knowing it makes you a more complete React developer.

---

## 💡 Pro Tip

Even if you never write a class-based component from scratch, being able to **read and understand** them is a valuable skill. You'll encounter them in stack traces, documentation, older tutorials, and third-party libraries. Think of this section as adding a new language to your React vocabulary.
