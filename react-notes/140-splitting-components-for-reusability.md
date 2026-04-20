# Splitting Components to Split JSX & Tailwind Styles (for Higher Reusability)

## Introduction

We now need two things: **fallback content** (shown when no project is selected or being added), and a way to **reuse button styles** without copy-pasting Tailwind classes everywhere. This lesson teaches a critical React skill — knowing when and how to extract a component for reusability.

---

## The NoProjectSelected Component

This is the "welcome screen" — what users see when they haven't selected or started creating any project:

```jsx
import noProjectImage from '../assets/no-projects.png';
import Button from './Button';

export default function NoProjectSelected({ onStartAddProject }) {
  return (
    <div className="mt-24 text-center w-2/3">
      <img src={noProjectImage} alt="An empty task list" className="w-16 h-16 object-contain mx-auto" />
      <h2 className="text-xl font-bold text-stone-500 my-4">No Project Selected</h2>
      <p className="text-stone-400 mb-4">Select a project or get started with a new one</p>
      <p className="mt-8">
        <Button onClick={onStartAddProject}>Create New Project</Button>
      </p>
    </div>
  );
}
```

### Key styling decisions

- **`mx-auto`** on the image centers it horizontally
- **`object-contain`** prevents the image from being distorted
- **`w-2/3`** gives the component a reasonable width without stretching edge to edge

---

## Extracting a Reusable Button Component

Both the sidebar and the `NoProjectSelected` screen have buttons that should look the same. Rather than duplicating a dozen Tailwind classes, we extract a `Button` component:

```jsx
export default function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 text-xs md:text-base rounded-md bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-stone-100"
      {...props}
    >
      {children}
    </button>
  );
}
```

### Why this pattern works so well

1. **`children`** — Whatever you put between `<Button>` and `</Button>` gets rendered inside the native `<button>`
2. **`...props`** — Every other prop (like `onClick`, `disabled`, `type`) gets forwarded to the native element
3. **Single source of truth** — The Tailwind classes live in one place. Want to change every button in the app? Edit one file.

---

## Using the Button Component

Now both locations import and use the same component:

```jsx
// In ProjectsSidebar
<Button onClick={onStartAddProject}>+ Add Project</Button>

// In NoProjectSelected
<Button onClick={onStartAddProject}>Create New Project</Button>
```

No `className` needed on either usage — the styling is baked into the component.

---

## When Should You Extract a Component?

Ask yourself:
- Am I **copy-pasting the same JSX structure** or class names?
- Will this element appear in **multiple places** with the same styling?
- Is the element **complex enough** that changes would need to happen in multiple files?

If yes to any of these → extract a component.

---

## ✅ Key Takeaways

- **Extract reusable components** when you find yourself duplicating JSX structures or Tailwind classes across files.
- The **`children` + `...props` pattern** is the foundation of flexible wrapper components.
- A reusable `<Button>` component creates a single source of truth for button styling across your entire app.
- Fallback/empty-state screens are important UX — they guide users on what to do next.

---

## 💡 Pro Tip

The `...props` spread on native elements is what makes React wrapper components truly seamless. By forwarding all props, your `<Button>` component supports every attribute and event handler that a native `<button>` does — without you explicitly declaring any of them.
