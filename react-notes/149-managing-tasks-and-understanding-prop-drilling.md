# Managing Tasks & Understanding Prop Drilling

## Introduction

This is the most complex lesson in the practice project — and deliberately so. We're going to add full task management (add tasks, display them, wire everything up), but the real lesson is about **prop drilling**: the pain of passing data through multiple component layers. Understanding this pain is essential before learning the solution (Context API, coming next section).

---

## State Management for Tasks in NewTask

Unlike project inputs (which used refs), we use **state** for the task input because we want to **clear it** after submission:

```jsx
import { useState } from 'react';

export default function NewTask({ onAdd }) {
  const [enteredTask, setEnteredTask] = useState('');

  function handleChange(event) {
    setEnteredTask(event.target.value);
  }

  function handleClick() {
    if (enteredTask.trim() === '') return;  // Don't add empty tasks
    onAdd(enteredTask);
    setEnteredTask('');  // Clear the input
  }

  return (
    <div className="flex items-center gap-4">
      <input type="text" className="w-64 px-2 py-1 rounded-sm bg-stone-200"
        onChange={handleChange} value={enteredTask} />
      <button className="text-stone-700 hover:text-stone-950" onClick={handleClick}>
        Add Task
      </button>
    </div>
  );
}
```

### Why state here but refs earlier?

With refs, clearing an input means directly manipulating the DOM (`ref.current.value = ''`), which breaks React's "React owns the DOM" principle. With state, clearing is simply `setEnteredTask('')` — React handles the DOM update. Use state when you need **two-way binding** (reading AND writing), refs when you just need to **read once**.

### The initial value matters

```jsx
const [enteredTask, setEnteredTask] = useState('');  // ✅ Empty string
const [enteredTask, setEnteredTask] = useState();    // ❌ undefined → warning
```

Not providing an initial value means `enteredTask` starts as `undefined`. When the user types, it changes to a string. React warns about switching between controlled and uncontrolled inputs. Always provide an empty string for text inputs.

---

## Adding Tasks to App State

Tasks are stored alongside projects in the `App` component's state:

```jsx
const [projectsState, setProjectsState] = useState({
  selectedProjectId: undefined,
  projects: [],
  tasks: [],  // All tasks for all projects
});
```

### handleAddTask

```jsx
function handleAddTask(text) {
  setProjectsState(prevState => {
    const taskId = Math.random();
    const newTask = {
      text: text,
      projectId: prevState.selectedProjectId,
      id: taskId,
    };

    return {
      ...prevState,
      tasks: [newTask, ...prevState.tasks],  // New task first
    };
  });
}
```

Notice `projectId` comes from `prevState.selectedProjectId` — we know which project is active because it's in state. The new task is prepended (added at the beginning of the array) so the most recent task appears first.

---

## Prop Drilling — The Real Lesson

Here's where it gets tedious. `handleAddTask` lives in `App`, but it's needed in `NewTask`, which is nested **three levels deep**:

```
App → SelectedProject → Tasks → NewTask
```

We must thread the function through every intermediate component:

```jsx
// App.jsx
<SelectedProject onAddTask={handleAddTask} ... />

// SelectedProject.jsx — just forwarding
<Tasks onAdd={onAddTask} ... />

// Tasks.jsx — just forwarding  
<NewTask onAdd={onAdd} />

// NewTask.jsx — finally uses it
onAdd(enteredTask);
```

**`SelectedProject` and `Tasks` don't use `onAddTask` at all** — they just pass it through. This is **prop drilling**: props traveling through components that don't care about them just to reach a component that does.

The same happens with `handleDeleteTask` and the `tasks` array itself.

---

## Displaying Tasks

In the `Tasks` component, conditionally render either a message or the task list:

```jsx
{tasks.length === 0 ? (
  <p className="text-stone-800 mb-4">This project does not have any tasks yet.</p>
) : (
  <ul className="p-4 mt-8 rounded-md bg-stone-100">
    {tasks.map(task => (
      <li key={task.id} className="flex justify-between my-4">
        <span>{task.text}</span>
        <button className="text-stone-700 hover:text-red-500"
          onClick={() => onDelete(task.id)}>
          Clear
        </button>
      </li>
    ))}
  </ul>
)}
```

### The `hover:text-red-500` detail

The clear button turns red on hover — a visual cue that this is a destructive action. Small design touches like this improve UX significantly.

---

## Filtering Tasks by Project

Not all tasks belong to the selected project. Before passing tasks down, filter them:

```jsx
// This filtering should happen when passing tasks to SelectedProject
const selectedProjectTasks = projectsState.tasks.filter(
  task => task.projectId === projectsState.selectedProjectId
);
```

---

## Why Prop Drilling Is a Problem

Look at what we're doing:
- `App` manages all state
- Props pass through `SelectedProject` → `Tasks` → `NewTask`
- Intermediate components accept and forward props they don't use
- Adding a new prop means editing **every** component in the chain

This doesn't scale. With a larger app, you'd have dozens of props drilling through 5+ levels. The next section introduces **Context API** — a way to skip the middlemen and deliver data directly to the components that need it.

---

## ✅ Key Takeaways

- Use **state with two-way binding** when you need to both read and programmatically clear an input.
- Always initialize text state with **an empty string**, not `undefined`.
- **Prop drilling** is the pattern of passing props through intermediate components that don't use them.
- Prop drilling works but becomes **maintenance-heavy** as the component tree grows — it's the motivation for Context API and state management libraries.

---

## ⚠️ Common Mistakes

- **Forgetting to wrap `onClick`** when passing arguments: `onClick={() => onDelete(task.id)}`, not `onClick={onDelete(task.id)}` (which calls it immediately).
- **Omitting `useState('')`** initial value for controlled text inputs — causes React warnings.

---

## 💡 Pro Tip

If you find yourself passing the same prop through 3+ levels of components, it's time to consider React Context, a state management library, or component composition (rendering children differently). The next section will show you how.
