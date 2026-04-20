# Collecting User Input with Refs & Forwarded Refs

## Introduction

We can now see the `NewProject` form, but we need to **collect the values** users type into those inputs when they click "Save." This lesson tackles a fundamental question: should we use **state** (tracking every keystroke) or **refs** (reading the value once on submit)? We go with refs — and learn how to forward them through custom components.

---

## Refs vs State for Form Input

You have two options for collecting input values in React:

| Approach | How It Works | Best For |
|---|---|---|
| **State + onChange** | Update state on every keystroke | Real-time validation, live previews, character counters |
| **Refs** | Read the value only when needed (e.g., on submit) | Simple forms where you just need the final values |

Since we only need the values when the user clicks "Save," refs are the cleaner choice. No extra state, no re-renders on every keystroke.

---

## Setting Up Refs

We create three refs — one per input field:

```jsx
import { useRef } from 'react';

const title = useRef();
const description = useRef();
const dueDate = useRef();
```

---

## The Forwarding Problem

Here's the catch: our `<Input>` component is a **custom** component, not a native `<input>`. If you try this:

```jsx
<Input ref={title} label="Title" />
```

It won't work in React 18 and earlier because React doesn't forward `ref` as a regular prop to custom components.

### Solution: `forwardRef`

Wrap the `Input` component with `forwardRef` to accept and forward the ref:

```jsx
import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, textarea, ...props }, ref) {
  const classes = "w-full p-1 border-b-2 ...";

  return (
    <p className="flex flex-col gap-1 my-4">
      <label className="text-sm font-bold uppercase text-stone-500">{label}</label>
      {textarea ? (
        <textarea ref={ref} className={classes} {...props} />
      ) : (
        <input ref={ref} className={classes} {...props} />
      )}
    </p>
  );
});

export default Input;
```

**React 19 note:** In React 19+, `ref` works as a regular prop — `forwardRef` is no longer required. But using `forwardRef` works in all versions.

---

## Reading Values on Save

With refs connected, we can read values when the user clicks Save:

```jsx
function handleSave() {
  const enteredTitle = title.current.value;
  const enteredDescription = description.current.value;
  const enteredDueDate = dueDate.current.value;

  // Pass data up to App component
  onAdd({
    title: enteredTitle,
    description: enteredDescription,
    dueDate: enteredDueDate,
  });
}
```

The `.current` property of a ref gives you the actual DOM element. On input elements, `.value` holds whatever the user typed.

---

## Lifting State Up — Adding Projects in App

The `App` component receives the project data and adds it to state:

```jsx
function handleAddProject(projectData) {
  setProjectsState(prevState => {
    const newProject = {
      ...projectData,
      id: Math.random(),
    };

    return {
      ...prevState,
      projects: [...prevState.projects, newProject],
    };
  });
}
```

### Why `Math.random()` for IDs?

It's not perfect (theoretically you could get duplicates), but for a learning project it works fine. In production, you'd use `crypto.randomUUID()` or a backend-generated ID.

### The immutable update pattern

```jsx
projects: [...prevState.projects, newProject]
```

This creates a **new array** containing all old projects plus the new one. We never mutate `prevState.projects` directly — React needs a new reference to detect changes.

---

## Setting Input Types

For better UX, set appropriate `type` attributes:

```jsx
<Input ref={title} label="Title" type="text" />
<Input ref={description} label="Description" textarea />
<Input ref={dueDate} label="Due Date" type="date" />
```

Setting `type="date"` gives you a native date picker — no third-party library needed.

---

## ✅ Key Takeaways

- Use **refs** when you only need input values at a specific moment (like form submission), not on every keystroke.
- **`forwardRef`** lets custom components accept and forward the `ref` prop to their inner DOM elements (required in React 18 and earlier).
- Always update state **immutably** — spread old values into new arrays/objects, never mutate directly.
- The **data flows up** via callback props: child component calls `onAdd(data)`, parent receives it and updates state.

---

## ⚠️ Common Mistakes

- **Forgetting `.current`** when accessing ref values. `title.value` won't work — it's `title.current.value`.
- **Mutating state directly** like `prevState.projects.push(newProject)`. This won't trigger a re-render and leads to bugs.
