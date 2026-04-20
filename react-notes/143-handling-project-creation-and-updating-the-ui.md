# Handling Project Creation & Updating the UI

## Introduction

We can collect input values and add projects to state, but two things are missing: the form doesn't **close** after saving, and the sidebar doesn't **display** the created projects. This lesson ties those loose ends together.

---

## Closing the NewProject Form After Save

After a successful save, we want to return to the fallback screen. The key is resetting `selectedProjectId` back to `undefined` inside `handleAddProject`:

```jsx
function handleAddProject(projectData) {
  setProjectsState(prevState => {
    const newProject = {
      ...projectData,
      id: Math.random(),
    };

    return {
      ...prevState,
      selectedProjectId: undefined,  // Go back to fallback screen
      projects: [...prevState.projects, newProject],
    };
  });
}
```

### An alternative approach

You could set `selectedProjectId` to the new project's ID instead of `undefined`, which would auto-select the project after creation. But since we haven't built the project detail view yet, `undefined` is the safe choice.

---

## Displaying Projects in the Sidebar

Pass the projects array to `ProjectsSidebar`:

```jsx
<ProjectsSidebar
  onStartAddProject={handleStartAddProject}
  projects={projectsState.projects}
/>
```

Inside the sidebar, map through the projects and render each one:

```jsx
export default function ProjectsSidebar({ onStartAddProject, projects }) {
  return (
    <aside className="...">
      <h2 className="...">Your Projects</h2>
      <div>
        <Button onClick={onStartAddProject}>+ Add Project</Button>
      </div>
      <ul className="mt-8">
        {projects.map(project => (
          <li key={project.id}>
            <button className="w-full text-left px-2 py-1 rounded-sm my-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
              {project.title}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

### Why buttons instead of links?

These aren't navigating to a different URL — they're triggering a state change within the same page. A `<button>` is semantically correct for actions that change the current view without navigation.

### The `key` prop

Every item in a mapped list needs a unique `key`. We use `project.id` — the random ID we generated during creation. React uses keys to efficiently update the DOM when items are added, removed, or reordered.

---

## The Data Flow

Here's how everything connects:

1. User fills inputs in `NewProject` → clicks Save
2. `handleSave` reads ref values → calls `onAdd(data)` 
3. `onAdd` is `handleAddProject` in `App` → adds project to state, resets `selectedProjectId`
4. State change triggers re-render → `NoProjectSelected` is shown (because `selectedProjectId` is `undefined`)
5. `projects` array is passed to `ProjectsSidebar` → new project appears in the list

This is **unidirectional data flow** in action. Data flows down through props, actions flow up through callback functions.

---

## ✅ Key Takeaways

- **Reset state** after completing an action to navigate the user back to the appropriate view.
- **Map through arrays** to dynamically render lists of components.
- Always provide a unique **`key` prop** when rendering lists — it's essential for React's reconciliation algorithm.
- Use `<button>` elements for in-page actions, not `<a>` tags.

---

## 💡 Pro Tip

When debugging state updates, a quick `console.log(projectsState)` inside the component function shows you the current state on every render. Just remember to remove it before committing — and note that `StrictMode` causes double-execution in development.
