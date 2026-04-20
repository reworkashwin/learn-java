# Managing State to Switch Between Components

## Introduction

We have two components — `NoProjectSelected` and `NewProject` — but only one can be visible at a time. How do we switch between them? **State.** This lesson introduces a state management pattern where a single state object controls which component is displayed, using `undefined`, `null`, and actual IDs as meaningful signals.

---

## The State Design

In the `App` component, we set up a state object that tracks two things:

```jsx
const [projectsState, setProjectsState] = useState({
  selectedProjectId: undefined,
  projects: [],
});
```

### What does `selectedProjectId` mean?

This is the clever part — a single property carries three distinct meanings:

| Value | Meaning |
|---|---|
| `undefined` | No project selected, not adding a new one → show `NoProjectSelected` |
| `null` | Currently adding a new project → show `NewProject` |
| An actual ID | A project was selected → show project details (later) |

This approach minimizes the number of state variables. One property, three states. It's elegant — though you could also use a separate `currentAction` state if you prefer explicitness over minimalism.

---

## The State Update Function

When the user clicks "Add Project", we need to update `selectedProjectId` to `null`:

```jsx
function handleStartAddProject() {
  setProjectsState(prevState => {
    return {
      ...prevState,
      selectedProjectId: null,
    };
  });
}
```

### Why the function form of setState?

Because we're updating state **based on previous state**. The `projects` array is part of the same state object — if we don't spread `prevState`, we'd lose it. Always use the function form when your new state depends on the old one.

---

## Connecting Buttons to State

The `handleStartAddProject` function needs to be accessible from **two** components:
1. The "Add Project" button in `ProjectsSidebar`
2. The "Create New Project" button in `NoProjectSelected`

We pass it down through props:

```jsx
<ProjectsSidebar onStartAddProject={handleStartAddProject} />
<NoProjectSelected onStartAddProject={handleStartAddProject} />
```

Inside each component, we destructure the prop and connect it:

```jsx
// In ProjectsSidebar
<Button onClick={onStartAddProject}>+ Add Project</Button>

// In NoProjectSelected  
<Button onClick={onStartAddProject}>Create New Project</Button>
```

Notice that the `Button` component's `...props` spread forwards `onClick` to the native `<button>` element automatically.

---

## Conditional Rendering Based on State

Back in `App`, we derive which component to show:

```jsx
let content;

if (projectsState.selectedProjectId === null) {
  content = <NewProject />;
} else if (projectsState.selectedProjectId === undefined) {
  content = <NoProjectSelected onStartAddProject={handleStartAddProject} />;
}

return (
  <main className="h-screen my-8 flex gap-8">
    <ProjectsSidebar onStartAddProject={handleStartAddProject} />
    {content}
  </main>
);
```

This is a clean **content variable pattern** for conditional rendering — instead of cluttering JSX with ternaries, we compute the content above and just output the variable.

---

## ✅ Key Takeaways

- A **single state property** can encode multiple states using different value types (`undefined`, `null`, IDs).
- Always use the **function form of setState** when new state depends on old state — prevents stale data and lost properties.
- **Lift state up** to the nearest common ancestor when multiple child components need to trigger the same state change.
- The **content variable pattern** keeps conditional rendering clean — compute above, render below.

---

## ⚠️ Common Mistakes

- **Forgetting to spread previous state** (`...prevState`). This silently drops other properties from your state object.
- **Using `===` vs `==`** matters. `null == undefined` is `true`, but `null === undefined` is `false`. Be precise.

---

## 💡 Pro Tip

Using `undefined` vs `null` as distinct signals is a pattern you'll see in professional codebases. `undefined` typically means "not set / default state", while `null` means "intentionally empty / actively cleared." React leverages this distinction too (e.g., controlled vs uncontrolled inputs).
