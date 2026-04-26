# Imperative Animations with useAnimate

## Introduction

Everything we've done with Framer Motion so far has been **declarative** — defining animations through JSX props like `initial`, `animate`, `exit`. That's the default and preferred approach. But sometimes you need to trigger an animation **from code** — like shaking input fields when a form submission fails. For these cases, Framer Motion provides the `useAnimate` hook, which lets you fire animations **imperatively**. Let's learn how.

---

## Concept 1: Declarative vs. Imperative Animations

### 🧠 What is it?

- **Declarative**: You describe what the animation should look like in JSX, and React/Framer Motion handles when to run it based on state changes and prop values
- **Imperative**: You explicitly call a function in your code to trigger an animation at a specific moment (e.g., inside an `if` block, after validation fails)

### ❓ Why do we need imperative animations?

Some animations are event-driven and don't map cleanly to component state:
- Shake inputs on invalid form submission
- Flash an error indicator
- Trigger a celebration animation after a specific user action

You *could* achieve these declaratively with state flags, but imperative triggering is often more natural and cleaner.

---

## Concept 2: The `useAnimate` Hook

### 🧠 What is it?

`useAnimate` is a Framer Motion hook that returns two things:
1. **`scope`** — a ref to attach to a container element (scopes CSS selectors)
2. **`animate`** — a function to trigger animations imperatively

### ⚙️ How it works

```jsx
import { useAnimate } from "framer-motion";

function MyForm() {
  const [scope, animate] = useAnimate();

  function handleSubmit() {
    if (inputsAreInvalid) {
      animate(
        "input, textarea",          // CSS selector for targets
        { x: [0, -10, 0, 10, 0] }, // Animation (with keyframes)
        { type: "spring", duration: 0.2 }  // Transition config
      );
      return;
    }
    // ... handle valid submission
  }

  return <form ref={scope}>{/* inputs here */}</form>;
}
```

### 🧪 Example breakdown

The `animate` function takes three arguments:

| Argument | Purpose | Example |
|----------|---------|---------|
| **Selector** | CSS selector targeting elements to animate | `"input, textarea"` |
| **Animation** | Object describing the animation (same format as `animate` prop) | `{ x: [0, -10, 0, 10, 0] }` |
| **Transition** | Optional config for how the animation plays | `{ type: "spring", duration: 0.2 }` |

### 💡 Insight

The CSS selector in the first argument only selects elements **within** the scoped container (the element with `ref={scope}`). This prevents accidentally animating inputs elsewhere on the page.

---

## Concept 3: Scoping with the `scope` Ref

### 🧠 What is it?

The `scope` ref returned by `useAnimate` acts as a boundary for the CSS selectors used in the `animate` function. Attach it to a container element to limit which elements get animated.

### ❓ Why do we need it?

Without scoping, a selector like `"input"` would target **every** input on the page. The scope ref ensures you only animate inputs within a specific form or section.

### ⚙️ How it works

```jsx
const [scope, animate] = useAnimate();

// Only inputs inside THIS form get animated
return <form ref={scope}>...</form>;
```

---

## Concept 4: Imperative Staggering with `stagger()`

### 🧠 What is it?

Framer Motion exports a `stagger` function that works with imperative animations the same way `staggerChildren` works with declarative variants.

### ⚙️ How it works

Import `stagger` from Framer Motion and use it as the `delay` value in your transition config:

```jsx
import { useAnimate, stagger } from "framer-motion";

animate(
  "input, textarea",
  { x: [0, -10, 0, 10, 0] },
  {
    type: "spring",
    duration: 0.2,
    delay: stagger(0.05)  // 50ms between each element
  }
);
```

This makes each input shake one after another instead of all at once — creating a much more polished effect.

### 💡 Insight

`stagger(0.05)` is the imperative equivalent of `staggerChildren: 0.05` in variants. Same concept, different API depending on whether you're working declaratively or imperatively.

---

## ✅ Key Takeaways

- Use `useAnimate` for event-driven animations that don't map cleanly to state
- The hook returns `[scope, animate]` — a ref for scoping and a function for triggering
- `animate(selector, animation, transition)` takes the same animation/transition objects you already know
- Attach `scope` to a container element to limit CSS selector matching
- Use the `stagger()` function to add cascading delays in imperative animations

## ⚠️ Common Mistakes

- Forgetting to attach the `scope` ref — your selector might match elements outside the intended area
- Not importing `stagger` separately — it's a standalone export, not part of `useAnimate`
- Trying to use `staggerChildren` in imperative mode — use `stagger()` with `delay` instead

## 💡 Pro Tips

- Imperative animations are great for one-off effects (shakes, flashes, bounces) triggered by user actions
- You can combine imperative and declarative animations in the same component
- The `animate` function returns a Promise, so you can `await` it to run sequential animations
