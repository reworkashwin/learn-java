# Adding Entry Animations

## Introduction

What if you want an element to animate **as soon as it appears** in the DOM? With the conditional value pattern, you need state changes to trigger animations. But for entry animations — like a modal sliding in — there's no "before" state to compare against. That's where the **`initial` prop** comes in. It defines where an element *starts*, and Framer Motion automatically animates from there to the `animate` target.

---

## Concept 1: The Problem — No State to Trigger the Animation

### 🧠 What is it?

In the Challenges app, the modal component is conditionally rendered. When it appears, we want it to slide up and fade in. But inside the modal component, there's no prop or state that changes after the modal is added — it's just *there*.

### ❓ Why do we need a different approach?

With the conditional value pattern from the previous lesson, you need a changing value to trigger animation:

```jsx
animate={{ rotate: isExpanded ? 180 : 0 }}
```

But in the modal, there's no equivalent to `isExpanded`. The modal doesn't have a "just appeared" vs. "been here a while" state. It's simply rendered when needed and removed when not.

### 💡 Insight

This is a common scenario: you want an entry animation, but the component itself has no internal state change to drive it. The `initial` prop solves this elegantly.

---

## Concept 2: The `initial` Prop

### 🧠 What is it?

The `initial` prop defines the **starting state** of a motion component. When the component first mounts, it immediately takes on the `initial` values, and then Framer Motion animates from `initial` to `animate`.

### ⚙️ How it works

```jsx
<motion.dialog
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* modal content */}
</motion.dialog>
```

Here's the flow:
1. Component mounts → element gets `opacity: 0` and `y: 30` (pushed down, invisible)
2. Framer Motion immediately starts animating from `initial` to `animate`
3. The element slides up and fades in over the animation duration

### 🧪 Example

Applying this to our modal component:

```jsx
import { motion } from 'framer-motion';

function Modal({ children }) {
  return (
    <motion.dialog
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      open
    >
      {children}
    </motion.dialog>
  );
}
```

**Step-by-step:**
1. Remove the CSS `@keyframes` animation from `index.css`
2. Replace `<dialog>` with `<motion.dialog>`
3. Add `initial` for the starting state
4. Add `animate` for the target state

### 💡 Insight

Think of `initial` → `animate` as a one-time entry animation. It plays once when the component mounts. If you want it to replay, the component needs to unmount and remount.

---

## Concept 3: The `initial` + `animate` Pattern

### 🧠 What is it?

The combination of `initial` and `animate` is the standard pattern for entry animations in Framer Motion:

- **`initial`** = "Where am I coming from?"
- **`animate`** = "Where should I end up?"

### ⚙️ How it works

Framer Motion automatically figures out how to interpolate between the two states. You don't need to define keyframes or durations (though you can customize them with `transition`).

```jsx
// Slide in from the left
<motion.div initial={{ x: -200 }} animate={{ x: 0 }} />

// Fade in
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// Scale up from nothing
<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} />

// Combine multiple properties
<motion.div
  initial={{ opacity: 0, y: 30, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
/>
```

### 💡 Insight

Notice `y: 30` pushes the element **down** (positive Y = downward in screen coordinates). This is a common gotcha — if you use `y: -30`, the element starts *above* its final position and slides down, which is the opposite of "slide up from below."

---

## Concept 4: Removing Old CSS Animations

### 🧠 What is it?

When migrating from CSS animations to Framer Motion, don't forget to remove the old CSS `@keyframes` and `animation` properties. Having both active can cause conflicts.

### ⚙️ How it works

In `index.css`, find and remove:
1. The `@keyframes slide-up-fade-in` definition
2. The `animation: slide-up-fade-in ...` property from the modal selector

Then add the Framer Motion equivalents in the component file as shown above.

### ⚠️ Common Mistakes

- Leaving CSS animations active alongside Framer Motion — they'll fight each other
- Using `y: -30` when you want the element to start below and slide up — positive Y is down

---

## ✅ Key Takeaways

- The **`initial` prop** defines where a motion component starts when it first mounts
- Framer Motion automatically animates from `initial` to `animate` on mount
- This is the standard pattern for **entry animations** (modals, tooltips, notifications, etc.)
- Positive `y` values push elements down, negative push them up
- Always clean up old CSS animations when migrating to Framer Motion

## 💡 Pro Tips

- You can set `initial={false}` to skip the entry animation entirely — useful when you only want exit animations
- The `initial` → `animate` animation plays once on mount. For repeated animations, use state-driven `animate` values instead
- Combine `initial`, `animate`, and `transition` for full control: starting state, ending state, and animation behavior
