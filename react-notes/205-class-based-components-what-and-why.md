# Class-based Components: What & Why

## Introduction

If functional components work perfectly fine, why do class-based components even exist? The answer lies in React's history. Understanding the "what" and "why" behind class-based components will help you navigate older codebases and appreciate why modern React looks the way it does.

---

## What Are Class-based Components?

In React, there are two ways to define a component:

### Functional Components (Modern Approach)

```jsx
function User(props) {
  return <li>{props.name}</li>;
}
```

A regular JavaScript function that receives props and returns JSX. This is what you've been using throughout the course.

### Class-based Components (Traditional Approach)

```jsx
class User extends Component {
  render() {
    return <li>{this.props.name}</li>;
  }
}
```

A JavaScript class with a `render()` method that returns JSX. React calls the `render()` method to determine what should appear on screen.

Both approaches produce the same result. The component is used the same way in JSX — `<User name="Alice" />`. The difference is only in how the component is **defined**, not how it's **used**.

---

## Why Do Class-based Components Exist?

### The Historical Reason

Before React 16.8 (released February 2019), functional components were **second-class citizens**. They couldn't:

- Manage **state** — No `useState`.
- Handle **side effects** — No `useEffect`.
- Access **context** easily — No `useContext`.

If you needed any of these features, you **had** to use a class-based component. Functional components were limited to simple "presentational" components that just displayed props.

### React 16.8 Changed Everything

React 16.8 introduced **Hooks** — functions like `useState`, `useEffect`, `useContext`, and others. These brought all the power of class-based components into functional components.

After hooks:
- Functional components can do **everything** class-based components can.
- The syntax is simpler and more concise.
- Hooks compose better than lifecycle methods.

### Key Restriction

One critical rule: **class-based components cannot use React Hooks**. No `useState`, no `useEffect`, no `useContext` — none of them. These hooks are exclusively for functional components.

---

## When Would You Use Class-based Components Today?

In practice, almost never for new code. But here are the remaining reasons:

1. **Error Boundaries** — Currently, you must use a class-based component to create an Error Boundary. There's no hook equivalent (yet).

2. **Working on legacy projects** — If the codebase was written before hooks, it'll be full of class-based components.

3. **Personal preference** — Some developers prefer the class-based mental model. It's a valid choice.

4. **Gradual migration** — When migrating an old project to modern React, class-based and functional components can coexist during the transition.

---

## Can You Mix and Match?

Absolutely! A class-based component can render functional components, and a functional component can render class-based components. React doesn't care — they're all just components.

In practice though, most projects stick to one approach for consistency. Mixing typically happens during migration periods.

---

## ✅ Key Takeaways

- Class-based components use JavaScript classes with a `render()` method.
- They exist because before React 16.8, they were the only way to use state and side effects.
- React Hooks (introduced in 16.8) gave functional components the same capabilities.
- Class-based components **cannot** use React Hooks — they use different mechanisms.
- Functional components are the modern standard, but class-based code is still common in existing projects.

## 💡 Pro Tip

When you encounter class-based components in the wild, mentally translate them to their functional equivalents. `this.state` → `useState`, `componentDidMount` → `useEffect(fn, [])`, `componentDidUpdate` → `useEffect(fn, [deps])`. This mental mapping will help you read class-based code fluently.
