# Preparing Another Use-Case For useEffect

## Introduction

We've seen `useEffect` used to prevent infinite loops. But `useEffect` has more tricks. In this lecture, we're setting up a scenario that demonstrates a completely *different* reason to use `useEffect` — **syncing prop values with DOM APIs**. We're also going to refactor the modal component to use props instead of `useImperativeHandle`.

---

## Refactoring the Modal: From Imperative to Declarative

Previously, the `Modal` component used `useImperativeHandle` to expose `open()` and `close()` methods. The parent component called these methods via a ref. That worked, but it's an *imperative* pattern — telling the component **what to do**.

React prefers a *declarative* pattern — telling the component **what state it should reflect**.

### The New Approach: An `open` Prop

Instead of calling `modalRef.current.open()`, we pass an `open` prop:

```jsx
// Modal component
function Modal({ open, children }) {
  return <dialog open={open}>{children}</dialog>;
}
```

And in the parent (App component), we manage a boolean state:

```jsx
const [modalIsOpen, setModalIsOpen] = useState(false);

// Open the modal
setModalIsOpen(true);

// Close the modal
setModalIsOpen(false);
```

Then pass it down:

```jsx
<Modal open={modalIsOpen}>
  <DeleteConfirmation />
</Modal>
```

---

## The Problem: Missing Backdrop

When you forward the `open` prop directly to the `<dialog>` element's built-in `open` attribute, the dialog *does* open — but the **backdrop** is missing. That gray overlay behind the modal? Gone.

Why? Because the browser only adds the backdrop when you open the dialog using the **`showModal()` method**. Simply setting the `open` attribute programmatically skips that behavior.

So we have a mismatch:
- We want to use **React's declarative pattern** (props controlling visibility)
- But we *need* to call an **imperative browser API** (`dialog.showModal()`)

---

## This Is Where `useEffect` Comes In

We need to **synchronize** a React prop value (`open`) with a browser DOM method (`showModal()` / `close()`). That's essentially bridging React's world with the browser's world — and that's a perfect use case for `useEffect`.

We can't just call `showModal()` directly in the component body during render because the dialog ref won't be connected yet (the JSX hasn't been processed). The effect runs *after* the render, when the ref is established.

We'll see exactly how to implement this in the next lecture.

---

## ✅ Key Takeaways

- React's declarative model (props/state) sometimes needs to sync with imperative browser APIs
- The `<dialog>` element's `open` attribute and `showModal()` method behave differently — `showModal()` adds the backdrop
- This mismatch creates a need for `useEffect` — not to prevent infinite loops, but to **bridge React state and DOM APIs**
- Refs aren't available during the first render — another reason effects (which run *after* render) are useful

## ⚠️ Common Mistakes

- Directly setting `<dialog open={true}>` and wondering why the backdrop is missing
- Trying to call DOM methods (like `showModal()`) directly in the component body before refs are connected

## 💡 Pro Tip

Whenever you need to call a native DOM method in response to a prop or state change, `useEffect` is likely the right tool. Think of it as a bridge between React's declarative world and the browser's imperative APIs.
