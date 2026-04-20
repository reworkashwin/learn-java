# Adding a Reusable Modal Component with useEffect

## Introduction

Modals — those overlay windows that dim the background and demand your attention — are a staple of modern web apps. The HTML `<dialog>` element handles a surprising amount of the complexity for you, but to use it *well* in React requires understanding refs, portals, and the useEffect hook. This lesson builds a reusable Modal component that opens programmatically (so you get the backdrop for free), uses portals to render in a controlled DOM location, and responds to prop changes via useEffect.

---

## Why Use the `<dialog>` Element?

The built-in `<dialog>` element provides:
- **Backdrop** — automatically grays out content behind the modal (only when opened programmatically)
- **Focus trapping** — keyboard navigation stays within the dialog
- **Accessibility** — proper ARIA roles built in
- **Escape key** — closes the dialog automatically

But there's a catch: you only get the backdrop if you open it with `showModal()` (programmatically), *not* by setting the `open` attribute directly. That's why we need a more sophisticated approach.

---

## Building the Modal Component

### Step 1: Portal for Controlled DOM Placement

We want the modal's DOM output to always land in a specific `<div id="modal">` element, regardless of where the Modal component sits in the React tree:

```jsx
import { createPortal } from 'react-dom';

export default function Modal({ children, open, className = '', onClose }) {
  return createPortal(
    <dialog className={`modal ${className}`}>
      {children}
    </dialog>,
    document.getElementById('modal')
  );
}
```

`createPortal` takes two arguments:
1. The JSX to render
2. The DOM element to render it into

This keeps the modal DOM structure clean and predictable, no matter how deeply nested the component is.

---

### Step 2: Opening Programmatically with useEffect and useRef

Instead of using the `open` attribute directly (which skips the backdrop), we call `showModal()` on the dialog element when our `open` prop becomes `true`:

```jsx
import { useEffect, useRef } from 'react';

export default function Modal({ children, open, className = '', onClose }) {
  const dialog = useRef();

  useEffect(() => {
    const modal = dialog.current;

    if (open) {
      modal.showModal();
    }

    return () => modal.close(); // cleanup
  }, [open]);

  return createPortal(
    <dialog ref={dialog} className={`modal ${className}`} onClose={onClose}>
      {children}
    </dialog>,
    document.getElementById('modal')
  );
}
```

Let's break this down:

**`useRef`** gives us a reference to the actual `<dialog>` DOM element. We connect it via `ref={dialog}`.

**`useEffect`** runs whenever `open` changes:
- If `open` is `true` → call `showModal()` to open with backdrop
- The **cleanup function** calls `close()` — this runs before the next effect execution, so when `open` changes to `false`, the dialog closes

### Why Store `dialog.current` in a Variable?

```jsx
const modal = dialog.current; // Lock in the current value
```

The cleanup function runs *later* — potentially after the ref's value has changed. By storing `dialog.current` in a local constant, we guarantee we're closing the *same* dialog element we opened. This is a recommended pattern when using refs inside effects.

---

### Step 3: Configurable Styling

The `className` prop with a default value of `''` lets parent components add custom classes:

```jsx
<dialog className={`modal ${className}`}>
```

This means the `modal` class always applies, but additional classes can be injected from outside.

---

## ✅ Key Takeaways

- Use `<dialog>` with `showModal()` (not the `open` attribute) to get the automatic backdrop
- `createPortal` lets you render modal content in a controlled DOM location regardless of component tree position
- `useEffect` with the `open` prop as a dependency is a clean way to sync React state with imperative DOM APIs
- Store ref values in local variables inside useEffect to avoid stale references in cleanup functions
- Accept an `onClose` prop and forward it to the native `<dialog>` to handle escape key dismissals

## ⚠️ Common Mistakes

- Setting the `open` attribute directly on `<dialog>` — this skips the backdrop and focus management
- Forgetting the cleanup function in useEffect — the dialog would open but never programmatically close
- Not handling the `onClose` event on the `<dialog>` — pressing Escape would close the dialog visually but your React state wouldn't update

## 💡 Pro Tips

- The cleanup function pattern in useEffect (`return () => modal.close()`) is the React-idiomatic way to undo side effects — it runs before the next execution and on unmount
- Giving `className` a default value of `''` prevents `undefined` from appearing as a CSS class string
