# Adding a "Projects Sidebar" Component

## Introduction

Every real app needs navigation — a way for users to move between different sections or entities. In a project management app, that navigation lives in a **sidebar**. This lesson kicks off the practice project by building the very first component: `ProjectsSidebar`.

It's a straightforward component, but it sets the stage for everything that follows — switching between projects, adding new ones, and organizing our UI into reusable pieces.

---

## Setting Up the Components Folder

Before writing any component, it's good practice to organize your files. Inside `src/`, we create a `components/` folder. This is where all our custom components will live — keeping things clean and modular.

The first file we add: **`ProjectsSidebar.jsx`**.

---

## Building the ProjectsSidebar Component

The sidebar needs to do two things eventually:
1. Display a list of projects (we'll add this later)
2. Provide a button to create a new project

Here's the basic skeleton:

```jsx
export default function ProjectsSidebar() {
  return (
    <aside>
      <h2>Your Projects</h2>
      <div>
        <button>+ Add Project</button>
      </div>
    </aside>
  );
}
```

### Why `<aside>`?

Using semantic HTML elements like `<aside>` isn't just "nice to have" — it communicates intent. An `<aside>` tells both the browser and other developers that this content is supplementary to the main content. It's a sidebar, not the star of the show.

---

## Using the Sidebar in the App Component

Back in `App.jsx`, we replace whatever placeholder content was there with our new component:

```jsx
import ProjectsSidebar from './components/ProjectsSidebar';

function App() {
  return (
    <main>
      <ProjectsSidebar />
    </main>
  );
}
```

Notice we swapped the `<>...</>` fragment for a `<main>` element — because this wraps the main content of the entire page, including the sidebar and (eventually) project details shown alongside it.

---

## ✅ Key Takeaways

- **Start with structure.** Before styling or logic, get the basic component hierarchy in place.
- **Use semantic HTML** (`<aside>`, `<main>`) to communicate intent clearly.
- **Organize early.** A `components/` folder prevents your `src/` from becoming a mess as the project grows.
- The sidebar is a **shell right now** — it renders static text and a button. The real functionality (project list, add project action) comes in later lessons.

---

## 💡 Pro Tip

When building a multi-component app, resist the urge to build everything at once. Start with the skeleton — get the component on screen, verify it renders, then iterate. This avoids debugging invisible problems buried in complex code.
