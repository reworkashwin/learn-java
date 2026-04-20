# Adding a First Class-based Component

## Introduction

Enough theory — let's actually build a class-based component. You'll see exactly how to transform a functional component into its class-based equivalent, understand the key differences, and learn why functional components are considered "leaner." Most importantly, you'll discover that class-based and functional components can peacefully coexist in the same project.

---

## The Functional Component We're Converting

Here's a simple `User` component as a functional component:

```jsx
function User(props) {
  return <li className={classes.user}>{props.name}</li>;
}

export default User;
```

Nothing fancy — it receives a `name` prop and renders a list item. Now let's convert it.

---

## Step-by-Step Conversion

### Step 1: Import `Component` from React

```jsx
import { Component } from 'react';
```

This is a base class provided by React that gives your class the functionality needed to work as a React component.

### Step 2: Create the Class and Extend `Component`

```jsx
class User extends Component {
  // ...
}
```

The `extends Component` part is crucial. By inheriting from `Component`, your class gets:
- The ability to be recognized as a React component.
- Access to `this.props`.
- Access to `this.state` and `this.setState()` (for state management).
- Lifecycle methods like `render()`, `componentDidMount()`, etc.

### Step 3: Add the `render()` Method

```jsx
class User extends Component {
  render() {
    return <li className={classes.user}>{this.props.name}</li>;
  }
}
```

The `render()` method is **required** and **reserved**. React calls it whenever it needs to know what this component should display. Think of it as the equivalent of the `return` statement in a functional component.

### Step 4: Access Props with `this.props`

In functional components, props come in as a function parameter. In class-based components, they're available as `this.props` — automatically provided by the `Component` base class.

```jsx
// Functional: props.name
// Class-based: this.props.name
```

### Step 5: Export the Class

```jsx
export default User;
```

Same as before — nothing changes about how you export or import the component.

---

## Side-by-Side Comparison

```jsx
// Functional Component
function User(props) {
  return <li className={classes.user}>{props.name}</li>;
}

// Class-based Component
class User extends Component {
  render() {
    return <li className={classes.user}>{this.props.name}</li>;
  }
}
```

The functional version is more concise — it's just a function that returns JSX. The class-based version requires a class declaration, the `extends Component` inheritance, and the `render()` method wrapper. This verbosity is one reason functional components became the preferred approach.

---

## Mixing Functional and Class-based Components

A key takeaway: **you can mix and match**. A functional parent can render class-based children, and vice versa. React doesn't care — it just sees components.

```jsx
// Users (functional) renders User (class-based) — totally fine!
function Users() {
  return (
    <ul>
      <User name="Alice" />
      <User name="Bob" />
    </ul>
  );
}
```

In practice, mixing happens most during **migration** — when you're gradually converting a class-based codebase to functional components. For new projects, you'll typically pick one approach and stick with it.

---

## The Anatomy of a Class-based Component

```jsx
import { Component } from 'react';

class MyComponent extends Component {
  constructor(props) {    // Optional: initialization work
    super(props);         // Must call super() if using constructor
  }

  render() {             // Required: returns JSX
    return <div>{this.props.title}</div>;
  }
}

export default MyComponent;
```

- **`constructor()`** — Optional. Used for initialization (especially state). If you define it, you **must** call `super(props)` first to invoke the parent class constructor.
- **`render()`** — Required. Returns the JSX to render. Called by React whenever the component needs to display.
- **`this.props`** — Access props. Provided automatically by `Component`.

---

## ✅ Key Takeaways

- Class-based components use `class MyComp extends Component` with a `render()` method.
- You must import `Component` from React and extend it.
- Props are accessed via `this.props` instead of function parameters.
- If you use a `constructor()`, always call `super(props)` first — or you'll get an error.
- Class-based and functional components can coexist in the same project.

## ⚠️ Common Mistakes

- **Forgetting `extends Component`** — Without it, React won't recognize your class as a component.
- **Forgetting `super()` in the constructor** — JavaScript requires calling the parent constructor in derived classes.
- **Forgetting `this.`** — In classes, you access everything through `this` — `this.props`, `this.state`, `this.myMethod()`.

## 💡 Pro Tip

The `class` keyword, `extends`, and `constructor` are standard JavaScript features — not React inventions. If classes feel unfamiliar, spend some time learning ES6 classes independently. It'll make class-based components much more intuitive.
