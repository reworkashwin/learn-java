# Understanding Effect Dependencies

## Introduction

You've seen the dependencies array in `useEffect` a few times now — sometimes empty, sometimes with values. But what exactly *are* dependencies, and how do you decide what goes in that array? This is one of the most misunderstood aspects of `useEffect`, so let's break it down completely.

---

## What Are Effect Dependencies?

Dependencies are **prop or state values** that are used inside your effect function.

More precisely: any value that, when changed, causes the component function to re-execute — and that you're using inside the effect — is a dependency.

```jsx
useEffect(() => {
  if (open) {          // `open` is a prop → it's a dependency
    dialog.current.showModal();
  } else {
    dialog.current.close();
  }
}, [open]);  // ✅ `open` listed as a dependency
```

---

## What Is NOT a Dependency?

Not everything used inside the effect needs to be listed:

| Value Type | Dependency? | Why? |
|------------|-------------|------|
| Props | ✅ Yes | Changes trigger re-renders |
| State | ✅ Yes | Changes trigger re-renders |
| Refs (`useRef`) | ❌ No | Changing refs doesn't trigger re-renders |
| Browser APIs (`navigator`, `localStorage`) | ❌ No | External, never change |
| Functions outside the component | ❌ No | Not tied to render cycle |

The key rule: **`useEffect` only cares about values that would cause the component to re-render.** If changing a value doesn't trigger a re-render, it's not a dependency.

---

## How Dependencies Control Execution

Here's the contract between you and React:

> "React, after this component renders, check if any of my listed dependencies changed compared to the last render. If yes, run the effect. If no, skip it."

### Empty Array `[]`
No dependencies → nothing can change → effect runs **once** (after first render).

```jsx
useEffect(() => {
  // runs once
}, []);
```

### With Dependencies `[open]`
Effect runs after every render **where `open` changed**:
- `false` → `true`: effect runs
- `true` → `true`: effect does NOT run (same value)
- `true` → `false`: effect runs

### No Array at All
Effect runs **after every render**. Almost never what you want.

```jsx
useEffect(() => {
  // runs after EVERY render — dangerous!
});
```

---

## Practical Example: Modal Component

In the modal component, using `open` as a dependency:

```jsx
useEffect(() => {
  if (open) {
    dialog.current.showModal();
  } else {
    dialog.current.close();
  }
}, [open]);
```

React will:
1. Render the modal component
2. Check: did `open` change since last render?
3. If yes → run the effect (show or hide the dialog)
4. If no → skip the effect

This ensures `showModal()` is only called when the visibility actually changes, not on every re-render.

---

## Why Missing Dependencies Cause Bugs

If you skip listing a dependency, your effect won't re-run when that value changes. The effect becomes "stale" — it uses an outdated value.

React's ESLint plugin (`react-hooks/exhaustive-deps`) will warn you about missing dependencies. **Take those warnings seriously.** They prevent real bugs.

---

## ✅ Key Takeaways

- Dependencies are **props or state values** used inside the effect function
- Refs, browser globals, and external functions are **not** dependencies
- React compares current dependencies to previous ones to decide if the effect should re-run
- Empty array = run once; values in array = run when those values change; no array = run every render
- Always list all prop/state values used inside `useEffect` in the dependency array

## ⚠️ Common Mistakes

- Omitting dependencies to "prevent re-runs" — this causes stale data bugs
- Adding refs to the dependency array (unnecessary — they don't trigger re-renders)
- Omitting the dependency array entirely and creating infinite loops

## 💡 Pro Tip

Let the ESLint rules guide you. If the linter says you're missing a dependency, add it. If adding it causes an infinite loop, the fix is usually `useCallback` (which we'll cover soon), not removing the dependency.
