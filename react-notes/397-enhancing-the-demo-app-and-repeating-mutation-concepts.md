# Enhancing the Demo App & Repeating Mutation Concepts

## Introduction

Let's level up our event details page by adding a **confirmation modal** before deletion, plus proper loading and error states for the delete mutation. This reinforces `useMutation` patterns while adding a feature that every production app needs.

---

## Adding a Confirmation Modal

### 🧠 The Idea

Deleting something instantly on a button click is dangerous. What if the user misclicked? We need a two-step process:

1. User clicks **Delete** → a confirmation modal appears
2. User clicks **Delete** in the modal → the actual mutation fires
3. User clicks **Cancel** → the modal closes, nothing happens

### ⚙️ Managing Modal State

This is plain React state management — no React Query needed:

```jsx
import { useState } from 'react';

const [isDeleting, setIsDeleting] = useState(false);

function handleStartDelete() {
  setIsDeleting(true);
}

function handleStopDelete() {
  setIsDeleting(false);
}
```

- `handleStartDelete` → connected to the Delete button in the UI
- `handleStopDelete` → connected to the Cancel button and the modal's `onClose` prop
- `handleDelete` (the actual mutation trigger) → connected to the Delete button *inside* the modal

### 🧪 The Modal JSX

```jsx
{isDeleting && (
  <Modal onClose={handleStopDelete}>
    <h2>Are you sure?</h2>
    <p>Do you really want to delete this event? This action cannot be undone.</p>
    <div className="form-actions">
      <button onClick={handleStopDelete} className="button-text">Cancel</button>
      <button onClick={handleDelete} className="button">Delete</button>
    </div>
  </Modal>
)}
```

---

## Handling Mutation States in the Modal

### Avoiding Name Collisions with Aliases

When you have both `useQuery` and `useMutation` in the same component, their returned properties overlap:

```jsx
const { isPending, isError, error } = useQuery({ ... });      // for fetching
const { isPending, isError, error } = useMutation({ ... });    // name clash!
```

Use JavaScript destructuring aliases:

```jsx
const {
  mutate,
  isPending: isPendingDeletion,
  isError: isErrorDeleting,
  error: deleteError,
} = useMutation({ ... });
```

This is standard JavaScript — the colon assigns a new name to the destructured property.

### Showing Loading & Error States

```jsx
<Modal onClose={handleStopDelete}>
  <h2>Are you sure?</h2>
  <p>Do you really want to delete this event? This action cannot be undone.</p>
  <div className="form-actions">
    {isPendingDeletion ? (
      <p>Deleting, please wait...</p>
    ) : (
      <>
        <button onClick={handleStopDelete} className="button-text">Cancel</button>
        <button onClick={handleDelete} className="button">Delete</button>
      </>
    )}
  </div>
  {isErrorDeleting && (
    <ErrorBlock
      title="Failed to delete event"
      message={deleteError.info?.message || 'Failed to delete event, please try again later.'}
    />
  )}
</Modal>
```

While the deletion is in progress: show "Deleting, please wait..." instead of buttons.
If it fails: show an error block inside the modal.

---

## ✅ Key Takeaways

- Confirmation modals are a UX best practice for destructive actions
- Use `useState` to manage modal visibility — this is normal React, not React Query
- Use **destructuring aliases** (`{ isPending: isPendingDeletion }`) to avoid name collisions when using multiple hooks
- Show loading feedback inside the modal while the mutation is pending
- Display errors inside the modal so the user can retry without losing context

## ⚠️ Common Mistakes

- Connecting the mutation directly to the first Delete button — always confirm destructive actions
- Forgetting that `useMutation` and `useQuery` return properties with the same names
- Closing the modal before the mutation finishes — keep it open so users see progress and errors

## 💡 Pro Tip

The pattern of `isDeleting` state + three handlers (`handleStartDelete`, `handleStopDelete`, `handleDelete`) is reusable across any "confirm before acting" UI. Extract it into a custom hook if you find yourself building it repeatedly.
