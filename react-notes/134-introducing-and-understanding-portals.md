# Introducing & Understanding "Portals"

## Introduction

We've conquered refs. Now it's time for the second half of this section: **Portals**. Portals solve a subtle but important problem — when a component's **visual position** on screen doesn't match its **structural position** in the DOM. Modals are the classic example, and our `ResultModal` is the perfect candidate.

---

## The Problem: DOM Structure vs. Visual Position

Inspect our modal in the browser DevTools. You'll see the `<dialog>` is buried deep in the DOM tree:

```html
<div id="content">
  <section class="challenge">
    <!-- timer stuff -->
    <dialog>  <!-- 😬 Deeply nested! -->
      <!-- modal content -->
    </dialog>
  </section>
</div>
```

The `<dialog>` is inside `TimerChallenge`, which is inside `App`, which is inside `#content`. It's nested several layers deep.

**Visually**, the modal sits on top of everything — it's a full-screen overlay. But **structurally**, it's a child of a specific section. This mismatch can cause:

- **Accessibility issues** — screen readers may not interpret the overlay correctly
- **Styling bugs** — a parent element with `overflow: hidden` or `z-index` constraints could clip or hide the modal
- **Semantic confusion** — the DOM doesn't reflect what the user actually sees

---

## What Are Portals?

A **portal** lets you render a component's output in a **different place in the DOM** than where the component lives in your React tree.

> Think of it as a teleporter. Your component stays where it is in the React component tree (with all its props, state, and context), but its rendered HTML appears somewhere else in the actual DOM.

---

## Setting Up a Portal Target

In your `index.html`, add a dedicated mount point:

```html
<body>
  <div id="modal"></div>    <!-- Portal target -->
  <div id="content"></div>  <!-- Main React app -->
</body>
```

This `<div id="modal">` sits at a high level in the document — perfect for overlays.

---

## Using createPortal

Import `createPortal` from `react-dom` (not `react`!):

```jsx
import { createPortal } from 'react-dom';

const ResultModal = forwardRef(function ResultModal({ targetTime, remainingTime, onReset }, ref) {
  // ... component logic ...

  return createPortal(
    <dialog ref={dialog} className="result-modal">
      {/* modal content */}
    </dialog>,
    document.getElementById('modal')
  );
});
```

### createPortal Takes Two Arguments

1. **The JSX to render** — your normal component output
2. **The DOM element to render it in** — selected with standard DOM APIs

```jsx
createPortal(
  <WhatToRender />,           // First: your JSX
  document.getElementById('target')  // Second: where to put it
);
```

---

## react vs. react-dom

Why import from `react-dom` instead of `react`?

| Library | Purpose | Example Features |
|---------|---------|-----------------|
| `react` | Core React logic (works everywhere) | `useState`, `useRef`, `useEffect`, components |
| `react-dom` | DOM-specific rendering | `createPortal`, `createRoot`, `flushSync` |

`react` is platform-agnostic (web, mobile, VR). `react-dom` handles the browser-specific parts. Portals are inherently a DOM concept, so they live in `react-dom`.

---

## Before and After

### Without Portal
```html
<div id="content">
  <section class="challenge">
    <dialog>...</dialog>  <!-- Buried inside content -->
  </section>
</div>
```

### With Portal
```html
<div id="modal">
  <dialog>...</dialog>    <!-- At the top level! -->
</div>
<div id="content">
  <section class="challenge">
    <!-- No dialog here -->
  </section>
</div>
```

The dialog now renders inside `#modal`, separate from the main content — matching its visual appearance as a top-level overlay.

---

## Important: React Behavior Stays the Same

Even though the HTML is rendered in a different DOM location, **React still treats the component as if it's in the same place** in the component tree. That means:

- Props still flow normally
- Events still bubble through the React tree (not the DOM tree)
- Context providers still apply
- Refs still work

The portal only affects **where in the DOM** the output appears, not how React manages the component.

---

## Common Portal Use Cases

- **Modals / Dialogs** — should sit at the document root
- **Tooltips / Popovers** — need to escape parent `overflow: hidden`
- **Toast notifications** — typically rendered in a fixed position
- **Dropdown menus** — may need to break out of scrollable containers

---

## ✅ Key Takeaways

- **Portals** render component output in a different DOM location than the component's position in the React tree
- Import `createPortal` from `react-dom`, not `react`
- `createPortal(jsx, domElement)` takes JSX and a target DOM element
- The portal target should exist in your `index.html` (e.g., `<div id="modal">`)
- React behavior (props, events, context) is unchanged — only the DOM location changes

## ⚠️ Common Mistakes

- Importing `createPortal` from `react` instead of `react-dom`
- Forgetting to add the target element in `index.html` — `document.getElementById` will return `null`
- Thinking that portals affect React's component hierarchy — they don't

## 💡 Pro Tips

- The portal's target element doesn't need to be empty — you can portal into any existing DOM node
- Event bubbling follows the **React tree**, not the DOM tree — this is by design and very useful
- You can have multiple portals targeting the same DOM element
- Portals pair beautifully with the `<dialog>` element and `showModal()` API
