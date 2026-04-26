# Adding a User Component

## Introduction

Time to get our hands dirty with the second project. We start by building the **AddUser component** — a form that lets users enter their username and age, with a submit button. Along the way, we set up the project structure, handle form submission, and learn about JSX accessibility attributes like `htmlFor`. This is the foundation everything else builds on.

---

## Concept 1: Project Setup and Folder Structure

### 🧠 What is it?

Every React project benefits from an organized folder structure. We create a `components` folder with two subfolders:

- **UI/** — for generic, reusable components (Button, Card, etc.)
- **Users/** — for user-specific components (AddUser, UsersList)

### ❓ Why do we need it?

As your app grows, you'll have dozens of components. Without organization, finding and maintaining them becomes painful. Separating UI building blocks from feature-specific components keeps things clean.

### ⚙️ How it works

```
src/
  components/
    UI/         ← reusable elements (Button, Card, Modal)
    Users/      ← feature-specific (AddUser, UsersList)
  App.js
  index.css
```

### 💡 Insight

This is a convention, not a rule. Some teams organize by feature (all user-related files in one folder), others by type (all components together, all styles together). Pick a pattern and be consistent.

---

## Concept 2: Building the AddUser Component

### 🧠 What is it?

The `AddUser` component is a form with two inputs (username and age) and a submit button. It's the primary data entry point for our app.

### ❓ Why do we need it?

Without a way to collect user data, there's nothing to display or validate. This is the entry point of our entire data flow.

### ⚙️ How it works

```jsx
import React from 'react';

const AddUser = (props) => {
  const addUserHandler = (event) => {
    event.preventDefault();
    // Logic will go here later
  };

  return (
    <form onSubmit={addUserHandler}>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" />

      <label htmlFor="age">Age (Years)</label>
      <input id="age" type="number" />

      <button type="submit">Add User</button>
    </form>
  );
};

export default AddUser;
```

Key details:

- **`event.preventDefault()`** — prevents the browser from sending an HTTP request and reloading the page (the default form submission behavior)
- **`onSubmit={addUserHandler}`** — pass a reference to the function, don't call it with `()`
- **`type="number"`** on the age input — the browser will only allow numeric input

### 🧪 Example

When the user clicks "Add User", the form triggers the `submit` event. Our handler intercepts it, prevents the default reload, and (eventually) processes the data.

### 💡 Insight

Why `onSubmit` on the `<form>` instead of `onClick` on the button? Because `onSubmit` also catches keyboard submissions (pressing Enter), making your form more accessible.

---

## Concept 3: The `htmlFor` Attribute

### 🧠 What is it?

In regular HTML, you use `for` on a `<label>` to associate it with an `<input>`. In JSX, `for` is a reserved JavaScript keyword, so React uses `htmlFor` instead.

### ❓ Why do we need it?

Accessibility. When a label is properly linked to an input via `htmlFor` and `id`, screen readers can announce which label belongs to which input. Clicking the label also focuses the input — better UX for everyone.

### ⚙️ How it works

```jsx
<label htmlFor="username">Username</label>
<input id="username" type="text" />
```

The `htmlFor` value must match the `id` of the corresponding input.

### 💡 Insight

Similarly, `class` becomes `className` in JSX. These renames exist because JSX is JavaScript, and `for` and `class` are reserved words in JavaScript. It's one of those "learn it once, never think about it again" things.

---

## Concept 4: Using the Component in App.js

### 🧠 What is it?

After building a component, you need to import and render it in a parent component — typically `App.js` for top-level elements.

### ⚙️ How it works

```jsx
import AddUser from './components/Users/AddUser';

function App() {
  return (
    <div>
      <AddUser />
    </div>
  );
}

export default App;
```

### 💡 Insight

If you forget to import the component, you'll get an error. React can't magically discover components in other files — every file is an isolated module, and imports are how you connect them.

---

## Concept 5: Setting Up Basic Page Styling

### 🧠 What is it?

A quick global style change — setting the page background color in `index.css` to get a dark theme going.

### ⚙️ How it works

```css
html {
  background: #1f1f1f;
}
```

This gives us a dark grayish background that makes the white card components pop.

### 💡 Insight

Global styles like page background, font defaults, and resets belong in `index.css`. Component-specific styles will go in CSS Modules (as we'll see in upcoming lessons).

---

## ✅ Key Takeaways

- Organize components into **logical folders** — UI vs. feature-specific
- Use **`event.preventDefault()`** in form handlers to stop page reloads
- Pass function **references** to event handlers — `onSubmit={handler}`, not `onSubmit={handler()}`
- Use **`htmlFor`** instead of `for` in JSX (and `className` instead of `class`)
- Always **import** components in every file where you use them

## ⚠️ Common Mistakes

- Adding parentheses to the handler: `onSubmit={addUserHandler()}` — this executes the function immediately during render, not on submit
- Forgetting `event.preventDefault()` — the page reloads and you lose all your React state
- Using `for` instead of `htmlFor` — React will warn you in the console

## 💡 Pro Tips

- Use `type="submit"` on buttons inside forms — it's semantically correct and ensures the form's `onSubmit` fires
- Arrow functions and regular function declarations both work for components — pick the style your team prefers and be consistent
- The form initially looks unstyled — that's expected. We'll add Card and CSS Module styling in the next steps
