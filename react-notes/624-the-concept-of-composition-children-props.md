# The Concept of Composition & Children Props

## Introduction

We've been building components that are configured through props like `title`, `amount`, and `date`. But what if you want a component that acts as a **wrapper** — a shell around *any* kind of content? Think of a styled card container that can wrap expense items, lists, forms — anything. This is where **composition** and the special `props.children` come in.

---

## Concept 1: What is Composition?

### 🧠 What is it?

Composition is the approach of building a UI by **combining smaller components together**. Every time you use one component inside another, you're composing.

```
App → Expenses → ExpenseItem → ExpenseDate
```

Each component is a building block. You snap them together to form the complete interface.

### ❓ Why do we need it?

Instead of building one giant monolithic component, you break things into small, focused pieces. Each piece is easier to understand, test, and reuse. That *is* React's philosophy.

---

## Concept 2: The Need for Wrapper Components

### 🧠 What is it?

Sometimes, you notice that multiple components share the same visual style — rounded corners, drop shadows, a certain background. Instead of duplicating those styles everywhere, you can extract them into a **wrapper component** (often called a "Card").

### ❓ Why do we need it?

- **DRY principle**: Don't repeat CSS across components
- **Consistency**: One place to update the shared look
- **Cleaner JSX**: Replace repeated `<div className="...">` patterns with a semantic `<Card>` component

### 🧪 Example: The Problem

Both `ExpenseItem` and `Expenses` have styles like `border-radius` and `box-shadow`. That's duplication.

---

## Concept 3: Building a Card Wrapper Component

### ⚙️ How it works

**1. Create `Card.js`**

```jsx
import './Card.css';

function Card(props) {
  const classes = 'card ' + props.className;
  return <div className={classes}>{props.children}</div>;
}

export default Card;
```

**2. Use it as a wrapper**

```jsx
import Card from './Card';

function ExpenseItem(props) {
  return (
    <Card className="expense-item">
      <ExpenseDate date={props.date} />
      <h2>{props.title}</h2>
      <div>${props.amount}</div>
    </Card>
  );
}
```

---

## Concept 4: Understanding `props.children`

### 🧠 What is it?

`props.children` is a **special, built-in prop** that React provides automatically. Its value is whatever content you place **between the opening and closing tags** of your custom component.

### ❓ Why do we need it?

Without `props.children`, custom components can't act as wrappers. If you put content between `<Card>` and `</Card>`, that content just disappears — unless the Card component explicitly renders `props.children`.

### ⚙️ How it works

```jsx
<Card className="expense-item">
  <h2>This is a child</h2>
  <p>This is also a child</p>
</Card>
```

Inside `Card`, `props.children` equals:
```jsx
<>
  <h2>This is a child</h2>
  <p>This is also a child</p>
</>
```

You render it by placing `{props.children}` in the Card's JSX:

```jsx
function Card(props) {
  return <div className={props.className}>{props.children}</div>;
}
```

### ⚠️ Common Mistakes

- **Forgetting `{props.children}`**: If you don't render it, the wrapped content simply vanishes
- **Expecting `className` to work automatically on custom components**: Built-in HTML elements support `className` natively. Your custom components do NOT — you must manually apply it inside the component

---

## Concept 5: Making the Wrapper Extensible with className

### 🧠 What is it?

When you replace a `<div>` with `<Card>`, you lose the ability to set `className` directly — unless you handle it.

### ⚙️ How it works

```jsx
function Card(props) {
  const classes = 'card ' + props.className;
  return <div className={classes}>{props.children}</div>;
}
```

The `Card` always applies its own `card` class (for shared styles like rounded corners). Then it appends whatever additional classes are passed via `props.className`. This makes the wrapper **extensible** — shared styles plus custom styles.

### 💡 Insight

This pattern is extremely common. You'll see it in component libraries everywhere — a base component with default styles that accepts additional classes for customization.

---

## ✅ Key Takeaways

- **Composition** = building UIs by combining components. It's the React way.
- `props.children` is a reserved, built-in prop — its value is the content between your component's opening and closing tags
- Wrapper components (like `Card`) let you extract shared styles and structure
- Custom components don't support `className` by default — you must handle it yourself
- You don't set `children` as an attribute — React handles it automatically

## ⚠️ Common Mistakes

- Trying to use a custom component as a wrapper without rendering `props.children`
- Forgetting to merge external `className` with the component's own classes

## 💡 Pro Tips

- Wrapper components shine for things like Modals, Cards, Alerts, Layout containers
- Later you'll see this pattern used heavily with features like React portals
- `props.children` can be anything: text, elements, even other components
