# Building a First Custom Component

## Introduction

We've talked about components, JSX, and how React works. Now it's time to actually **build our first custom component** from scratch. We'll create an `ExpenseItem` component as the first step toward our Expense Tracker application, and along the way, you'll learn the fundamental pattern for creating, exporting, importing, and using components in React.

---

### Concept 1: The Component Tree

#### 🧠 What is it?

In React, you build a **component tree** — a hierarchy where the root component (`App`) sits at the top, and all other components are nested inside it.

#### ⚙️ How it works

- Only the **root component** (`App`) is rendered directly into the HTML page via `ReactDOM.createRoot().render()`
- All other components are used as **custom HTML elements** inside other components' JSX
- This creates a tree structure where components contain other components

```
App (rendered in index.js)
├── ExpenseItem
├── ExpenseItem
└── ExpenseItem
```

#### 💡 Insight

The root component is special not because of its code (it's written exactly like any other component) but because of its **role** — it's the starting point of the entire UI tree.

---

### Concept 2: Creating a Component File

#### 🧠 What is it?

It's a best practice to put each component in its **own file**. In a real React project, you'll have dozens or even hundreds of component files — and that's perfectly normal.

#### ⚙️ How it works

1. Create a `components/` folder inside `src/` for organization
2. Create a new file with the component name: `ExpenseItem.js`
3. The naming convention is **PascalCase** — each word starts with a capital letter

#### 💡 Insight

`App.js` stays outside the `components/` folder because it's the root component with a special role. Everything else goes inside `components/`.

---

### Concept 3: Writing the Component Code

#### 🧠 What is it?

A React component is **just a JavaScript function** that returns JSX. That's it. There's nothing magical about it.

#### ⚙️ How it works

```jsx
// src/components/ExpenseItem.js

function ExpenseItem() {
  return <h2>Expense Item</h2>;
}

export default ExpenseItem;
```

Three key parts:
1. **Define a function** — named with PascalCase (matching the file name)
2. **Return JSX** — the HTML-like code that defines what this component renders
3. **Export the function** — so it can be imported and used in other files

#### 💡 Insight

The function name convention (PascalCase like `ExpenseItem`) isn't just style — it's a React **requirement** for custom components. React uses the casing to distinguish your components from built-in HTML elements.

---

### Concept 4: Using the Component

#### 🧠 What is it?

Once created and exported, you can use your component like a **custom HTML element** anywhere in your JSX.

#### ⚙️ How it works

```jsx
// App.js
import ExpenseItem from './components/ExpenseItem';

function App() {
  return (
    <div>
      <h2>Let's get started!</h2>
      <ExpenseItem />
    </div>
  );
}
```

Three steps to use a component:
1. **Import** it at the top of the file
2. **Use it** in JSX like an HTML element: `<ExpenseItem />`
3. React calls the function, gets the returned JSX, and renders it

#### ⚠️ Common Mistakes

- Using **lowercase** for custom components (`<expenseItem />`) — React will think it's a built-in HTML element and it won't work
- Forgetting to **export** the component — you'll get an import error
- Forgetting to **import** the component — you'll get an "undefined" error

---

### Concept 5: The Create → Export → Import → Use Pattern

#### 🧠 What is it?

Every component you'll ever build follows the same four-step pattern:

1. **Create** — Write a function that returns JSX
2. **Export** — Add `export default` so other files can access it
3. **Import** — Import it in the file where you want to use it
4. **Use** — Drop it into JSX like a custom HTML element

#### 🧪 Example

```jsx
// Step 1 & 2: Create and export (ExpenseItem.js)
function ExpenseItem() {
  return <h2>Expense Item</h2>;
}
export default ExpenseItem;

// Step 3 & 4: Import and use (App.js)
import ExpenseItem from './components/ExpenseItem';
function App() {
  return <ExpenseItem />;
}
```

#### 💡 Insight

This pattern is the heartbeat of React development. You'll repeat it hundreds of times throughout any project. Master it and everything else becomes easier.

---

## ✅ Key Takeaways

- A component is just a JavaScript function that returns JSX
- One component per file, named in PascalCase
- Custom components **must** start with an uppercase letter in JSX
- Follow the pattern: Create → Export → Import → Use
- Only the root component is rendered with `ReactDOM` — all others are used as custom HTML elements inside JSX
- Organize components in a `components/` folder

---

## 💡 Pro Tips

- Name your file the same as your component function — consistency makes navigation easy
- Use self-closing tags (`<ExpenseItem />`) when a component has no children
- If your component renders but shows nothing, check that you actually `return` the JSX (a missing return statement is a common gotcha)
