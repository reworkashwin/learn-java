# Exposing Component APIs via the useImperativeHandle Hook

## Introduction

Forwarding refs works, but it has a flaw: the parent component needs to **know the internals** of the child. If `TimerChallenge` calls `dialog.current.showModal()`, it's assuming there's a `<dialog>` element inside `ResultModal`. What if someone changes the implementation? Everything breaks. The `useImperativeHandle` hook solves this by letting a component **expose its own API** through a ref, decoupling the internal implementation from external usage.

---

## The Problem with Direct Ref Forwarding

```jsx
// TimerChallenge knows too much about ResultModal's internals:
dialog.current.showModal();  // Assumes <dialog> exists inside
```

If the `ResultModal` developer swaps `<dialog>` for a `<div>` with custom styling, `showModal()` no longer exists and `TimerChallenge` breaks.

> It's like calling a specific employee at a company by their desk phone number. If they move desks, the number stops working. A better approach? Call the company's main line and ask for the service you need.

---

## useImperativeHandle: A Custom Component API

`useImperativeHandle` lets a component define exactly what methods and properties are accessible through its ref:

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

const ResultModal = forwardRef(function ResultModal({ targetTime }, ref) {
  const dialog = useRef();  // Internal ref — not exposed

  useImperativeHandle(ref, () => ({
    open() {
      dialog.current.showModal();
    }
  }));

  return (
    <dialog ref={dialog}>
      {/* ... */}
    </dialog>
  );
});
```

### How It Works

1. **Create an internal ref** (`dialog`) for the actual DOM element
2. **Call `useImperativeHandle`** with:
   - The **forwarded ref** (from the parent)
   - A **function** that returns an object defining the exposed API
3. The parent's `ref.current` now points to **this custom object**, not the raw DOM element

### The Parent's Perspective

```jsx
// TimerChallenge:
dialog.current.open();  // Calls the exposed 'open' method

// NOT:
dialog.current.showModal();  // This no longer works (and shouldn't)
```

The parent only knows about `open()`. It has no idea whether there's a `<dialog>`, a `<div>`, or a portal underneath.

---

## The Architecture

```
TimerChallenge                    ResultModal
─────────────                    ───────────
dialog (ref) ──────────────►  useImperativeHandle
                                      │
                                      ▼
                              { open() { ... } }  ← what parent sees
                                      │
                                      ▼
                              dialog (internal ref) → <dialog> element
```

The internal `<dialog>` ref and the forwarded ref are **completely separate**. `useImperativeHandle` acts as a bridge, exposing only what you choose.

---

## When to Use This

You won't use `useImperativeHandle` often — most communication between components should happen through **props**. But it shines when:

- A component has an **imperative action** (open, close, focus, scroll) that can't easily be expressed as props
- You want to **decouple** the component's internal structure from its consumers
- Multiple developers work on different components and you want a **stable API contract**

---

## With React 19 (No forwardRef Needed)

If using React 19+, the same pattern works without `forwardRef`:

```jsx
function ResultModal({ ref, targetTime }) {
  const dialog = useRef();

  useImperativeHandle(ref, () => ({
    open() {
      dialog.current.showModal();
    }
  }));

  return <dialog ref={dialog}>{/* ... */}</dialog>;
}
```

---

## ✅ Key Takeaways

- `useImperativeHandle` lets a component define a **custom API** accessible through its ref
- It takes the forwarded ref and a function that returns an object of exposed methods/properties
- This **decouples** the parent from the child's internal implementation
- The parent calls `ref.current.someMethod()` where `someMethod` is defined by the child
- If the child's internals change, the exposed API can stay the same

## ⚠️ Common Mistakes

- Using `useImperativeHandle` for everything — prefer props for most parent-child communication
- Forgetting to create a **separate internal ref** for the actual DOM element
- Exposing too many methods — keep the API minimal and focused

## 💡 Pro Tips

- Think of `useImperativeHandle` as writing a component's "public API" — only expose what consumers truly need
- This pattern is commonly used in library components (form inputs, modals, drawers)
- You can expose multiple methods: `{ open(), close(), reset(), focus() }`
