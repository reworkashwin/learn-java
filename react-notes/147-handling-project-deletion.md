# Handling Project Deletion

## Introduction

Users can create and select projects — now they need to **delete** them. This lesson walks through the deletion flow, which follows the same pattern we've used before: define a handler in `App`, pass it down via props, connect it to a button. The interesting part is learning how `Array.filter()` lets us remove items immutably.

---

## The handleDeleteProject Function

In the `App` component, deleting a project means two state changes:
1. Remove the project from the `projects` array
2. Reset `selectedProjectId` to `undefined` (return to fallback screen)

```jsx
function handleDeleteProject() {
  setProjectsState(prevState => ({
    ...prevState,
    selectedProjectId: undefined,
    projects: prevState.projects.filter(
      project => project.id !== prevState.selectedProjectId
    ),
  }));
}
```

### How `filter()` works

`filter()` creates a **new array** containing only the elements for which the callback returns `true`. Think of it as a gatekeeper: each element gets tested, and only the ones that pass get into the new array.

```
Original: [Project A, Project B, Project C]
Filter condition: project.id !== selectedProjectId (where selected = B)
Result: [Project A, Project C]  ← Project B was filtered out
```

### Why not `splice()` or `delete`?

Both would **mutate** the original array. In React, state must be updated immutably — you return a new array, not modify the old one. `filter()` always returns a new array, making it the ideal choice.

### Why no ID parameter?

Notice `handleDeleteProject` doesn't receive an ID argument. It doesn't need one — the currently selected project's ID is already in state (`prevState.selectedProjectId`). We're always deleting the project we're looking at.

---

## Connecting to the UI

The handler is passed to `SelectedProject` through an `onDelete` prop:

```jsx
<SelectedProject
  project={selectedProject}
  onDelete={handleDeleteProject}
/>
```

Inside `SelectedProject`, connect it to the delete button:

```jsx
<button onClick={onDelete} className="text-stone-600 hover:text-stone-950">
  Delete
</button>
```

Since `handleDeleteProject` doesn't need arguments, we can pass it directly to `onClick` — no wrapping arrow function needed.

---

## The Predictable Pattern

By now, you've seen this pattern three times:

1. **Define a handler** in `App` that updates state
2. **Pass the handler** as a prop to the child component
3. **Connect the handler** to a button's `onClick` in the child

This is React's fundamental interaction model. State lives high, actions trigger from low, data flows down, events flow up.

---

## ✅ Key Takeaways

- **`filter()` is the immutable way** to remove items from arrays in React state.
- When the information you need is **already in state** (like the selected project ID), you don't need to pass it as an argument.
- Deletion always resets `selectedProjectId` to `undefined` — you can't view something that no longer exists.
- By now, the "state handler → prop → onClick" pipeline should feel mechanical. That's the point — React thrives on predictable patterns.

---

## 💡 Pro Tip

When deciding between `filter()`, `map()`, and `find()`:
- **`filter()`** — Remove items (returns a new, shorter array)
- **`map()`** — Transform items (returns a new array of the same length)
- **`find()`** — Locate a single item (returns one element or `undefined`)

These three methods cover the vast majority of array operations in React state management.
