# Adding Styling

## Introduction

Good news: there's **nothing TypeScript-specific** about adding CSS to your components. Whether you use global CSS, CSS Modules, styled-components, or any other approach — it works the same way with TypeScript as it does with plain JavaScript React. This section is a quick walkthrough of adding CSS Modules to the Todo app components.

---

## Concept 1: CSS Modules in a TypeScript React Project

### 🧠 What is it?

CSS Modules are scoped CSS files where class names are locally scoped to the component that imports them. They prevent class name collisions across your app.

### ❓ Why do we need it?

Without scoped styles, class names can clash between components. CSS Modules ensure that `.item` in `TodoItem.module.css` doesn't conflict with `.item` in any other file.

### ⚙️ How it works

The setup is identical to a JavaScript React project created with Create React App:

1. **Name your CSS files** with the `.module.css` suffix
2. **Import** the classes object in your component
3. **Use** the classes on your JSX elements

### 🧪 Example

**Todos component:**

```tsx
import classes from './Todos.module.css';

const Todos: React.FC<{ items: Todo[] }> = (props) => {
  return <ul className={classes.todos}>{/* ... */}</ul>;
};
```

**TodoItem component:**

```tsx
import classes from './TodoItem.module.css';

const TodoItem: React.FC<{ text: string }> = (props) => {
  return <li className={classes.item}>{props.text}</li>;
};
```

**NewTodo component:**

```tsx
import classes from './NewTodo.module.css';

const NewTodo: React.FC = () => {
  return <form className={classes.form}>{/* ... */}</form>;
};
```

### 💡 Insight

The CSS Module files themselves contain standard CSS — no TypeScript involved. The only interaction with TypeScript is the import statement, and Create React App's setup handles the type definitions for `.module.css` imports behind the scenes.

---

## ✅ Key Takeaways

- CSS Modules work exactly the same in TypeScript projects as in JavaScript projects
- Use the `.module.css` naming convention for scoped styles
- Import the `classes` object and use `className={classes.yourClass}`
- No additional TypeScript configuration is needed for CSS Modules in Create React App projects

## 💡 Pro Tips

- If you're using a custom project setup (not CRA), you may need to add a type declaration file for CSS Modules so TypeScript doesn't complain about the import
- The styling approach you choose (CSS Modules, Tailwind, styled-components, etc.) is independent of whether you use TypeScript — pick what suits your project
