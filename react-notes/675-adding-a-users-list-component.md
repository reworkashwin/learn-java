# Adding a Users List Component

## Introduction

We can collect user data, but we have nowhere to display it. In this section, we build the **UsersList component** — a dedicated component for rendering the list of added users. We also tackle a common React beginner error: "Cannot read property 'map' of undefined." This lesson reinforces component responsibility, the `map()` pattern for lists, and how props connect components.

---

## Concept 1: Why a Separate Component for the List?

### 🧠 What is it?

Instead of rendering the user list inside the AddUser component, we create a brand-new `UsersList` component with the sole responsibility of displaying users.

### ❓ Why do we need it?

Could we render the list inside AddUser? Technically, yes. But think about it — "AddUser" is about **collecting** data. Displaying a list is a completely different responsibility. Keeping components small and focused is a React best practice. Each component should have one clear job.

### ⚙️ How it works

We separate concerns:
- **AddUser** — collects username and age via form inputs
- **UsersList** — receives an array of users and renders them as list items

This makes both components easier to understand, test, and reuse independently.

### 💡 Insight

Ask yourself: "If another developer saw this component name, would they expect it to do what it does?" If AddUser also rendered a list, that would be surprising. Good component names should accurately describe their purpose.

---

## Concept 2: Building the UsersList Component

### 🧠 What is it?

A functional component that receives a `users` array via props and maps it to a list of `<li>` elements.

### ⚙️ How it works

```jsx
import React from 'react';
import Card from '../UI/Card';
import classes from './UsersList.module.css';

const UsersList = (props) => {
  return (
    <Card className={classes.users}>
      <ul>
        {props.users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.age} years old)
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default UsersList;
```

Key pieces:
- **`props.users`** — we expect an array of user objects
- **`.map()`** — transforms each user object into a `<li>` element
- **`key={user.id}`** — unique identifier for efficient list rendering
- **Card wrapper** — reuses our Card component for consistent styling

### 🧪 Example

If `props.users` is:
```javascript
[
  { id: '0.123', name: 'Max', age: 31 },
  { id: '0.456', name: 'Anna', age: 25 },
]
```

The rendered output is:
```html
<ul>
  <li>Max (31 years old)</li>
  <li>Anna (25 years old)</li>
</ul>
```

### 💡 Insight

Notice the text `({user.age} years old)` — the parentheses are just plain text in the JSX, not a special syntax. Only `{user.age}` is a dynamic expression. Everything else is static text.

---

## Concept 3: Where to Render UsersList

### 🧠 What is it?

Deciding where in the component tree to place the UsersList component. We render it in `App.js`, alongside AddUser.

### ❓ Why do we need it?

If we rendered UsersList inside AddUser, the list would be nested within the form component — logically incorrect and harder to manage state. Rendering both at the same level in App.js gives us a clear top-level layout.

### ⚙️ How it works

```jsx
// App.js
import AddUser from './components/Users/AddUser';
import UsersList from './components/Users/UsersList';

function App() {
  return (
    <div>
      <AddUser />
      <UsersList users={[]} />
    </div>
  );
}
```

For now, we pass an empty array. We'll manage the actual user state in the next lesson.

### 💡 Insight

Rendering both components side-by-side in App.js also positions us perfectly for **lifting state up** later — App.js will be the common ancestor that manages the shared user data.

---

## Concept 4: The "Cannot Read Property 'map' of Undefined" Error

### 🧠 What is it?

A classic React error that occurs when you try to call `.map()` on a prop that hasn't been passed yet (i.e., it's `undefined`).

### ❓ Why do we need it?

This error teaches a fundamental lesson: **props are not guaranteed to exist**. If you forget to pass a prop, it's `undefined`, and calling methods on `undefined` crashes your app.

### ⚙️ How it works

The error occurs when:
```jsx
// App.js — forgot to pass the users prop
<UsersList />

// UsersList.js — tries to map undefined
{props.users.map(...)}  // 💥 Cannot read property 'map' of undefined
```

The fix:
```jsx
// App.js — always pass the prop, even as an empty array
<UsersList users={[]} />
```

### 🧪 Example

Think of it like trying to open a door that doesn't exist. You expected a door (the `users` array), but nothing was built there (`undefined`). The fix is to always ensure the door exists — even if there's nothing behind it (empty array).

### 💡 Insight

You could also add a safety check inside the component: `{props.users && props.users.map(...)}`. But it's better to ensure the prop is always passed — defensive coding at the consumption site is cleaner than defensive coding inside every component.

---

## ✅ Key Takeaways

- **Separate concerns** — one component for collecting data, another for displaying it
- Use **`.map()`** to transform arrays into lists of JSX elements
- Always pass a **`key` prop** with a unique value when rendering lists
- If a prop might be undefined, either **always pass it** from the parent or add a **safety check** in the child
- Render sibling components at the same level (in App.js) to prepare for **lifting state up**

## ⚠️ Common Mistakes

- Forgetting to pass the `users` prop — causes "Cannot read property 'map' of undefined"
- Not importing the component where you use it — imports are per-file, not global
- Forgetting the `key` prop — React warns in the console and may have rendering bugs

## 💡 Pro Tips

- Component names matter for developer experience — if the name doesn't describe the responsibility, rename it
- You can provide a **default value** for props using destructuring: `const UsersList = ({ users = [] }) => { ... }`
- The Card component we built earlier accepts external classes via `className` — we reuse it here with `classes.users` for list-specific styling
