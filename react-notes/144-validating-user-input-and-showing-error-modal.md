# Validating User Input & Showing an Error Modal via useImperativeHandle

## Introduction

What happens if a user clicks "Save" without filling in all the fields? Right now, nothing stops them from creating an empty project. We need **input validation** and an **error modal** to give feedback. This lesson brings together several advanced concepts: validation logic, portals, `forwardRef`, and `useImperativeHandle`.

---

## Simple Input Validation

In the `NewProject` component, we validate right after reading the ref values:

```jsx
function handleSave() {
  const enteredTitle = title.current.value;
  const enteredDescription = description.current.value;
  const enteredDueDate = dueDate.current.value;

  if (
    enteredTitle.trim() === '' ||
    enteredDescription.trim() === '' ||
    enteredDueDate.trim() === ''
  ) {
    modal.current.open();  // Show error modal
    return;                // Stop execution — don't call onAdd
  }

  onAdd({ title: enteredTitle, description: enteredDescription, dueDate: enteredDueDate });
}
```

The `trim()` call removes whitespace — so a user can't submit spaces-only input. The `return` statement is crucial: it prevents the rest of the function from executing when validation fails.

---

## Building the Modal Component

The modal uses the native `<dialog>` element, React portals, and `useImperativeHandle`:

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = forwardRef(function Modal({ children, buttonCaption }, ref) {
  const dialog = useRef();

  useImperativeHandle(ref, () => ({
    open() {
      dialog.current.showModal();
    },
  }));

  return createPortal(
    <dialog ref={dialog} className="...">
      {children}
      <form method="dialog" className="mt-4 text-right">
        <Button>{buttonCaption}</Button>
      </form>
    </dialog>,
    document.getElementById('modal-root')
  );
});

export default Modal;
```

### Let's unpack this layer by layer.

---

### 1. `createPortal` — Rendering Elsewhere in the DOM

Normally, React renders components where they appear in the component tree. But a modal should be rendered at the top level of the DOM — not buried inside a form component. `createPortal` does exactly this: it renders the dialog inside `#modal-root` (defined in `index.html`) regardless of where `<Modal>` appears in the React tree.

---

### 2. `useImperativeHandle` — Exposing Methods to Parent Components

This is the key concept. Instead of the parent controlling the modal with a `show` state prop, we let the modal **expose an API** that the parent can call:

```jsx
useImperativeHandle(ref, () => ({
  open() {
    dialog.current.showModal();
  },
}));
```

- The parent creates a ref: `const modal = useRef()`
- The parent calls: `modal.current.open()`
- The modal internally calls: `dialog.current.showModal()`

The parent doesn't need to know that a `<dialog>` element is used internally. It just knows "I can call `.open()` on this component." That's **encapsulation**.

---

### 3. `<form method="dialog">` — Closing the Dialog

The `<dialog>` element has a built-in mechanism: any `<form>` inside it with `method="dialog"` will close the dialog when submitted. We put a "Close" button inside such a form — clicking it submits the form, which closes the dialog. No JavaScript needed for closing.

---

## Using the Modal in NewProject

```jsx
<>
  <Modal ref={modal} buttonCaption="Close">
    <h2 className="text-xl font-bold text-stone-700 my-4">Invalid Input</h2>
    <p className="text-stone-600 mb-4">Oops... looks like you forgot to enter a value.</p>
    <p className="text-stone-600 mb-4">Please make sure you provide a valid value for every input field.</p>
  </Modal>
  <div className="w-[35rem] mt-16">
    {/* ... inputs and buttons ... */}
  </div>
</>
```

The `children` prop makes the modal completely flexible — you control what's displayed inside it from the outside.

---

## ✅ Key Takeaways

- **Validate early, return early.** Check input values before processing, and `return` immediately if validation fails.
- **`useImperativeHandle`** lets you expose a controlled API (methods/properties) from a child component to its parent via refs.
- **Portals** (`createPortal`) render elements outside the normal component tree — perfect for modals, tooltips, and overlays.
- **`<dialog>` + `<form method="dialog">`** is a native HTML pattern for modals with built-in close behavior.

---

## ⚠️ Common Mistakes

- **Calling `dialog.show()` instead of `dialog.showModal()`**. The `show()` method doesn't add a backdrop or trap focus. Always use `showModal()` for proper modal behavior.
- **Forgetting `return` after showing the error modal.** Without it, the invalid data still gets submitted.

---

## 💡 Pro Tip

`useImperativeHandle` is not common in everyday React — most problems are solved with props and state. But when you're building reusable UI primitives (modals, drawers, toast notifications) that need an imperative API ("open this", "close this"), it's the right tool.
