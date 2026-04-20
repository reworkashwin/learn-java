# Forwarding Refs to Custom Components

## Introduction

We want to call `showModal()` on a `<dialog>` element that lives inside `ResultModal`, but we're triggering it from `TimerChallenge`. The ref is created in one component and needed in another. Enter **ref forwarding** — a mechanism to pass refs through component boundaries.

---

## The Problem

A ref created in `TimerChallenge` needs to reach the `<dialog>` inside `ResultModal`:

```
TimerChallenge (creates ref) → ResultModal → <dialog> (needs ref)
```

You might think: "Just pass it as a prop called `ref`!" And in **React 19+**, that actually works! But in older versions, it doesn't — React treated `ref` as a reserved prop (like `key`).

---

## Approach 1: React 19+ (Simple Prop)

In React 19 and newer, `ref` works as a normal prop:

```jsx
// TimerChallenge.jsx
const dialog = useRef();
<ResultModal ref={dialog} targetTime={targetTime} />

// ResultModal.jsx
export default function ResultModal({ ref, targetTime }) {
  return (
    <dialog ref={ref}>
      {/* ... */}
    </dialog>
  );
}
```

Just destructure `ref` from props and pass it to the `<dialog>`. Done.

---

## Approach 2: Pre-React 19 (forwardRef)

In older React versions, you need the `forwardRef` wrapper:

```jsx
import { forwardRef } from 'react';

const ResultModal = forwardRef(function ResultModal({ targetTime }, ref) {
  return (
    <dialog ref={ref}>
      {/* ... */}
    </dialog>
  );
});

export default ResultModal;
```

### How forwardRef Works

1. **Import** `forwardRef` from React
2. **Wrap** your component function with `forwardRef()`
3. Your function receives a **second parameter** (`ref`) in addition to `props`
4. **Forward** that ref to whichever internal element needs it
5. **Export** the wrapped component

### Key Difference

| Feature | React 19+ | Pre-React 19 |
|---------|-----------|--------------|
| `ref` as prop | ✅ Works natively | ❌ Requires `forwardRef` |
| Syntax | Destructure from props | Second function parameter |
| Export | Normal export | Export the wrapped result |

---

## Using It in TimerChallenge

With ref forwarding set up, `TimerChallenge` can now control the dialog:

```jsx
function TimerChallenge({ title, targetTime }) {
  const dialog = useRef();

  // When timer expires:
  function handleTimeout() {
    dialog.current.showModal();
  }

  return (
    <>
      <ResultModal ref={dialog} targetTime={targetTime} result="lost" />
      <section className="challenge">
        {/* timer UI */}
      </section>
    </>
  );
}
```

`dialog.current` now points directly to the `<dialog>` DOM element inside `ResultModal`.

---

## Why You Should Know Both Approaches

Even if you're using React 19+, you'll encounter `forwardRef` everywhere:
- In older codebases
- In third-party libraries
- In tutorials and documentation written before React 19

Knowing both patterns ensures you can read and work with any React code you encounter.

---

## ✅ Key Takeaways

- **Ref forwarding** lets a parent pass a ref through a child component to an inner DOM element
- In **React 19+**, `ref` works as a regular prop — just destructure it
- In **older versions**, wrap the component with `forwardRef()` to receive the ref as a second parameter
- The forwarded ref connects directly to whatever internal element you attach it to

## ⚠️ Common Mistakes

- Forgetting to actually attach the forwarded ref to an internal element — the ref stays `undefined` if you never use it
- Using `forwardRef` but forgetting that `ref` is the **second** parameter, not part of the props object
- With `forwardRef`, forgetting to export the wrapped component instead of the raw function

## 💡 Pro Tips

- `forwardRef` is still valid in React 19 — it's not deprecated, just no longer required
- You'll still see `forwardRef` in libraries like Material UI, React Bootstrap, and many others
- If a component accepts a ref, document it — consumers need to know which internal element the ref targets
