# Clearing Tasks & Fixing Minor Bugs

## Introduction

The final piece of the practice project: making the "Clear" button on tasks work, and squashing a couple of bugs that crept in. This lesson also serves as a **review** — you'll see the same patterns applied one more time, reinforcing everything you've learned.

---

## Implementing handleDeleteTask

The deletion logic mirrors `handleDeleteProject` — use `filter()` to create a new array without the deleted item:

```jsx
function handleDeleteTask(id) {
  setProjectsState(prevState => ({
    ...prevState,
    tasks: prevState.tasks.filter(task => task.id !== id),
  }));
}
```

### Key difference from handleDeleteProject

`handleDeleteProject` could infer the ID from `selectedProjectId` in state. `handleDeleteTask` **needs the ID as a parameter** because there are multiple tasks visible at once — we can't know which one was clicked without being told.

Also notice: we don't change `selectedProjectId` here. Deleting a task doesn't deselect the project — the user stays where they are.

---

## Connecting the Delete Button

The connection is already mostly in place from the previous lesson — `handleDeleteTask` was passed down through `SelectedProject` → `Tasks` via `onDelete`.

In the `Tasks` component:

```jsx
<button onClick={() => onDelete(task.id)} className="text-stone-700 hover:text-red-500">
  Clear
</button>
```

The arrow function wrapper ensures `task.id` (the correct task's ID) is passed as the argument.

---

## Bug Fix #1: Empty Task Prevention

Without validation, users can add empty tasks by clicking "Add Task" with nothing typed:

```jsx
function handleClick() {
  if (enteredTask.trim() === '') {
    return;  // Exit early — don't add empty tasks
  }
  onAdd(enteredTask);
  setEnteredTask('');
}
```

This is the simplest form of validation — a guard clause at the top of the function. `trim()` ensures spaces-only input is also rejected.

---

## Bug Fix #2: Controlled Input Warning

If `useState()` is called without an initial value:

```jsx
const [enteredTask, setEnteredTask] = useState();  // ❌
```

The `value` prop on the input starts as `undefined` (uncontrolled), then switches to a string on the first keystroke (controlled). React throws a warning about switching between controlled and uncontrolled. The fix:

```jsx
const [enteredTask, setEnteredTask] = useState('');  // ✅
```

---

## Bug Fix #3: Missing selectedProjectId Prop

The sidebar highlights the selected project using a `selectedProjectId` prop — but it was never passed from `App`:

```jsx
<ProjectsSidebar
  onStartAddProject={handleStartAddProject}
  onSelectProject={handleSelectProject}
  projects={projectsState.projects}
  selectedProjectId={projectsState.selectedProjectId}  // Was missing!
/>
```

Without this, the `selectedProjectId` inside `ProjectsSidebar` was always `undefined`, so no project ever appeared highlighted. A small but impactful bug.

---

## The Finished App

At this point, the app supports:
- ✅ Creating projects with title, description, and due date
- ✅ Input validation with an error modal
- ✅ Selecting and viewing project details
- ✅ Deleting projects
- ✅ Adding tasks to projects
- ✅ Deleting tasks from projects
- ✅ Visual highlighting of the selected project

---

## What We Practiced

This practice project wasn't just about building an app — it reinforced core React concepts:

| Concept | Where We Used It |
|---|---|
| Component composition | Reusable `Button`, `Input`, `Modal` components |
| State management | Single state object in `App` controlling the entire UI |
| Refs & forwardRef | Collecting input values, opening the modal |
| useImperativeHandle | Exposing the modal's `open()` method |
| Conditional rendering | Switching between NoProjectSelected, NewProject, SelectedProject |
| Prop drilling | Passing handlers through SelectedProject → Tasks → NewTask |
| Immutable state updates | Using spread, filter, map to update arrays without mutation |
| Portals | Rendering the modal in a separate DOM location |

---

## What's Next

The `App` component is doing **a lot**. It manages all state and passes props through multiple layers. The next section introduces the **Context API** — a way to share state across components without prop drilling, making code cleaner and more maintainable.

---

## ✅ Key Takeaways

- **`filter()` for deletion** — creates a new array excluding the target item.
- **Always initialize controlled inputs** with an empty string to avoid React warnings.
- **Small bugs compound** — a missing prop can mean a whole feature silently doesn't work. When something looks wrong, check your props first.
- This entire practice project is built on **a handful of patterns** applied repeatedly. That's the power of React's simplicity.

---

## 💡 Pro Tip

After finishing a feature-complete project, go through the codebase and ask: "Am I passing any prop through a component that doesn't use it?" If yes, that's prop drilling, and it's the #1 signal that your app could benefit from React Context or a state management library.
