# Making Projects Selectable & Viewing Project Details

## Introduction

We can create projects, but we can't **view** them yet. This lesson adds some serious functionality: a `SelectedProject` component that displays project details, dynamic project selection from the sidebar with visual highlighting, and the state management to wire it all together.

---

## The SelectedProject Component

This component displays a project's title, formatted due date, description, and a delete button:

```jsx
export default function SelectedProject({ project, onDelete }) {
  const formattedDate = new Date(project.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-[35rem] mt-16">
      <header className="pb-4 mb-4 border-b-2 border-stone-300">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-stone-600 mb-2">{project.title}</h1>
          <button className="text-stone-600 hover:text-stone-950" onClick={onDelete}>
            Delete
          </button>
        </div>
        <p className="mb-4 text-stone-400">{formattedDate}</p>
        <p className="text-stone-600 whitespace-pre-wrap">{project.description}</p>
      </header>
    </div>
  );
}
```

### Formatting dates

`new Date(dateString).toLocaleDateString()` converts a raw date string into a human-readable format. The options object controls the output:
- `year: 'numeric'` → "2024"
- `month: 'short'` → "Jan"
- `day: 'numeric'` → "5"

### Preserving line breaks with `whitespace-pre-wrap`

The description might contain newlines (entered via a `<textarea>`). By default, HTML collapses whitespace. The `whitespace-pre-wrap` CSS class preserves line breaks while still wrapping long text.

---

## Handling Project Selection in App

We add a function that sets the `selectedProjectId` to the clicked project's ID:

```jsx
function handleSelectProject(id) {
  setProjectsState(prevState => ({
    ...prevState,
    selectedProjectId: id,
  }));
}
```

This is passed to the sidebar:

```jsx
<ProjectsSidebar
  onStartAddProject={handleStartAddProject}
  onSelectProject={handleSelectProject}
  projects={projectsState.projects}
  selectedProjectId={projectsState.selectedProjectId}
/>
```

---

## Connecting Selection in the Sidebar

Here's where a common mistake happens. You might be tempted to write:

```jsx
<button onClick={onSelectProject}>  // ❌ Doesn't pass the ID!
```

But `onSelectProject` expects an ID argument. The button's `onClick` doesn't automatically provide it. We need to wrap it:

```jsx
<button onClick={() => onSelectProject(project.id)}>  // ✅ Correct
```

The arrow function gives us control over **what arguments** are passed.

---

## Highlighting the Selected Project

We dynamically build the CSS classes based on whether a project is selected:

```jsx
{projects.map(project => {
  let cssClasses = "w-full text-left px-2 py-1 rounded-sm my-1 hover:text-stone-200 hover:bg-stone-800";

  if (project.id === selectedProjectId) {
    cssClasses += " bg-stone-800 text-stone-200";
  } else {
    cssClasses += " text-stone-400";
  }

  return (
    <li key={project.id}>
      <button className={cssClasses} onClick={() => onSelectProject(project.id)}>
        {project.title}
      </button>
    </li>
  );
})}
```

### The dynamic class pattern

Base classes go in the initial string. Conditional classes are appended with string concatenation. Note the **leading space** before each appended class — without it, you'd get merged class names like `my-1bg-stone-800`.

---

## Deriving the Selected Project

In the `App` component, we find the full project object from the ID:

```jsx
const selectedProject = projectsState.projects.find(
  project => project.id === projectsState.selectedProjectId
);
```

`Array.find()` returns the first element where the callback returns `true`, or `undefined` if none match. We pass this object to the `SelectedProject` component.

---

## Extending Conditional Rendering

Our `content` variable now handles three cases:

```jsx
let content = <SelectedProject project={selectedProject} onDelete={handleDeleteProject} />;

if (projectsState.selectedProjectId === null) {
  content = <NewProject onAdd={handleAddProject} onCancel={handleCancelAddProject} />;
} else if (projectsState.selectedProjectId === undefined) {
  content = <NoProjectSelected onStartAddProject={handleStartAddProject} />;
}
```

The default is `SelectedProject` — only overridden for the `null` and `undefined` cases.

---

## ✅ Key Takeaways

- **Wrap `onClick` handlers** in arrow functions when you need to pass arguments the handler doesn't receive by default.
- **Dynamic CSS classes** can be built with string concatenation — just mind the spacing.
- **`Array.find()`** is perfect for locating an object by ID from an array.
- `toLocaleDateString()` formats dates according to locale conventions without third-party libraries.
- **`whitespace-pre-wrap`** preserves user-entered line breaks in displayed text.

---

## ⚠️ Common Mistakes

- **Passing `onSelectProject` directly to `onClick`** without wrapping it. The click event object would be passed instead of the project ID.
- **Forgetting the leading space** when appending CSS classes dynamically: `" bg-stone-800"`, not `"bg-stone-800"`.
