# Styling the Modal via Tailwind CSS

## Introduction

Our modal works — it appears when validation fails — but it looks rough. This lesson polishes the modal's appearance: the backdrop, the dialog box itself, the content text, and the close button. We also wire up the **Cancel** button in the `NewProject` form.

---

## Styling the Backdrop

The `<dialog>` element automatically creates a backdrop when opened with `showModal()`. Tailwind lets you style it with the `backdrop:` prefix:

```jsx
<dialog className="backdrop:bg-stone-900/90 p-4 rounded-md shadow-md">
```

### What's `bg-stone-900/90`?

The `/90` is Tailwind's syntax for **opacity**. `bg-stone-900/90` means "stone-900 background at 90% opacity." This creates a semi-transparent dark overlay behind the modal — the classic "dimmed background" effect.

---

## Styling Modal Content

The heading and paragraphs inside the modal reuse similar styles from elsewhere in the app:

```jsx
<h2 className="text-xl font-bold text-stone-700 my-4">Invalid Input</h2>
<p className="text-stone-600 mb-4">Oops... looks like you forgot to enter a value.</p>
```

The form wrapping the close button gets positioned to the right:

```jsx
<form method="dialog" className="mt-4 text-right">
  <Button>{buttonCaption}</Button>
</form>
```

Using `text-right` pushes the button to the right side of the modal — a common UI convention for action buttons in dialogs.

---

## Making the Cancel Button Work

The Cancel button in `NewProject` needs to revert `selectedProjectId` back to `undefined`:

```jsx
// In App component
function handleCancelAddProject() {
  setProjectsState(prevState => ({
    ...prevState,
    selectedProjectId: undefined,
  }));
}

// Pass to NewProject
<NewProject onAdd={handleAddProject} onCancel={handleCancelAddProject} />
```

Inside `NewProject`:

```jsx
<button onClick={onCancel} className="text-stone-800 hover:text-stone-950">
  Cancel
</button>
```

Simple. Click Cancel → state resets → `NoProjectSelected` renders.

---

## The Full Modal Interaction Flow

1. User clicks Save with empty inputs
2. Validation fails → `modal.current.open()` is called
3. Modal appears with backdrop and error message
4. User clicks "Close" → `<form method="dialog">` submits → dialog closes automatically
5. User can fix inputs and try again

---

## ✅ Key Takeaways

- The **`backdrop:` prefix** in Tailwind lets you style the auto-generated dialog backdrop.
- **Opacity syntax** (`/90`) is a clean way to create semi-transparent overlays.
- The Cancel button is just another state transition — set `selectedProjectId` back to `undefined`.
- **Reuse your custom `<Button>` component** everywhere, including inside modals, for consistent styling.

---

## 💡 Pro Tip

When you find yourself copying Tailwind class strings between components (like heading styles), that's a signal you could extract a reusable typography component. For a small app, copy-paste is fine — but in a larger codebase, a `<Heading>` or `<Text>` component pays dividends.
