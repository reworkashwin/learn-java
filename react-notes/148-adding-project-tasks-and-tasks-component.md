# Adding "Project Tasks" & A Tasks Component

## Introduction

Projects aren't just titles and dates — they have **tasks**. This lesson sets up the `Tasks` component (the container) and the `NewTask` component (the input for adding tasks). We're laying groundwork here — styling and structure first, functionality next.

---

## The Tasks Component

This component will live inside `SelectedProject` and handle displaying and adding tasks:

```jsx
export default function Tasks({ onAdd, onDelete, tasks }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-stone-700 mb-4">Tasks</h2>
      {/* NewTask input goes here */}
      {tasks.length === 0 ? (
        <p className="text-stone-800 mb-4">
          This project does not have any tasks yet.
        </p>
      ) : (
        <ul>
          {/* Task list goes here */}
        </ul>
      )}
    </section>
  );
}
```

### Conditional rendering for empty states

The ternary checks `tasks.length === 0`. If there are no tasks, show a helpful message. If there are tasks, render the list. This is UI 101 — never show an empty container with no explanation.

---

## The NewTask Component

A minimal component: one input and one button, side by side:

```jsx
export default function NewTask({ onAdd }) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        className="w-64 px-2 py-1 rounded-sm bg-stone-200"
      />
      <button className="text-stone-700 hover:text-stone-950">
        Add Task
      </button>
    </div>
  );
}
```

### Why not use the custom `<Input>` component?

The custom `<Input>` includes a label, and tasks don't need one — the context (appearing under a "Tasks" heading) is self-explanatory. Using the native `<input>` directly is perfectly fine when the wrapper component adds complexity you don't need.

---

## Wiring It Into SelectedProject

Replace the placeholder in `SelectedProject` with the `Tasks` component:

```jsx
import Tasks from './Tasks';

// Inside the return:
<Tasks onAdd={onAddTask} onDelete={onDeleteTask} tasks={tasks} />
```

The `Tasks` component expects three props:
- `onAdd` — Function to add a new task
- `onDelete` — Function to delete a task
- `tasks` — Array of task objects to display

These props will be threaded down from the `App` component (which we'll set up in the next lesson).

---

## Recognizing Tailwind Patterns

By this point, you've probably noticed certain classes appearing over and over:

| Class | Usage |
|---|---|
| `flex`, `items-center`, `gap-4` | Horizontal layouts with centered items |
| `rounded-sm` / `rounded-md` | Rounded corners |
| `text-stone-XXX` | Text color from the stone palette |
| `hover:text-stone-XXX` | Hover state color changes |
| `mb-4`, `mt-8`, `my-4` | Margin spacing |

This repetition is **by design** in Tailwind. You build muscle memory for common utility classes, and your development speed increases dramatically.

---

## ✅ Key Takeaways

- **Always handle empty states.** Show a message when a list has no items — don't leave users staring at nothing.
- **Don't over-abstract.** If your custom component adds unneeded complexity (like a label you don't want), use the native element instead.
- Break features into **container + input** components (`Tasks` + `NewTask`) for cleaner code organization.
- Tailwind's utility classes become second nature with practice — the same 15-20 classes handle most layouts.

---

## 💡 Pro Tip

When building a feature, start with the **structure and styling** before adding interactivity. Getting the visual layout right first means you can focus entirely on logic in the next step, without visual bugs distracting you.
