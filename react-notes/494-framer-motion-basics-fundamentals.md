# Framer Motion Basics & Fundamentals

## Introduction

Time to get hands-on with Framer Motion! In this lesson, we'll learn the core building blocks: **motion components**, the **`animate` prop**, and the **`transition` prop**. These three concepts form the foundation of everything you'll do with Framer Motion.

---

## Concept 1: Motion Components

### 🧠 What is it?

Framer Motion provides special versions of every HTML element — called **motion components**. Instead of using a regular `<div>`, you use `<motion.div>`. This unlocks animation capabilities on that element.

### ❓ Why do we need it?

Regular HTML elements don't have animation APIs. Motion components are enhanced versions that Framer Motion can control for high-performance, declarative animations without causing unnecessary React re-renders.

### ⚙️ How it works

1. Import `motion` from Framer Motion:

```jsx
import { motion } from 'framer-motion';
```

2. Replace any HTML element with its motion version:

```jsx
// Before
<div className="box">...</div>

// After
<motion.div className="box">...</motion.div>
```

Every HTML element has a motion version: `motion.div`, `motion.span`, `motion.button`, `motion.li`, `motion.img`, and so on.

### 💡 Insight

Motion components still render the same HTML element — `motion.div` renders a `<div>`. The difference is entirely under the hood: Framer Motion hooks into that element to control animations in a highly performant way, bypassing React's re-render cycle when possible.

---

## Concept 2: The `animate` Prop

### 🧠 What is it?

The `animate` prop is the primary way to tell Framer Motion **what you want an element to look like**. You pass it an object describing the target state, and Framer Motion automatically animates to that state.

### ❓ Why do we need it?

This is the declarative magic — you don't write animation loops or keyframes. You just say "I want X to be 100" and Framer Motion handles the smooth transition from wherever it is now to 100.

### ⚙️ How it works

Pass an object to `animate` with the properties you want to animate:

```jsx
<motion.div
  animate={{ x: 100, y: 50, rotate: 45 }}
/>
```

You can animate a huge range of properties:
- **Position**: `x`, `y`
- **Rotation**: `rotate`, `rotateX`, `rotateY`
- **Scale**: `scale`, `scaleX`, `scaleY`
- **Opacity**: `opacity`
- **Colors**: `color`, `backgroundColor`
- **Size**: `width`, `height`

### 🧪 Example

```jsx
function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rotate, setRotate] = useState(0);

  return (
    <motion.div
      className="box"
      animate={{ x, y, rotate }}
    />
  );
}
```

Now whenever `x`, `y`, or `rotate` change (via state updates), Framer Motion automatically animates to the new values. Type `100` into the X input — the box smoothly slides right. Type `-300` — it slides left. All animated, all smooth.

### 💡 Insight

Notice the `animate` prop re-triggers the animation **whenever its values change**. This is reactive — just like React state drives UI updates, state changes drive Framer Motion animations. It fits perfectly into the React mental model.

---

## Concept 3: The `transition` Prop

### 🧠 What is it?

The `transition` prop controls **how** the animation plays — its duration, type, bounciness, and more. If `animate` is the *destination*, `transition` is the *journey*.

### ❓ Why do we need it?

The default animation might not always match what you want. Maybe you need it faster, or without bouncing, or with a specific easing curve. The `transition` prop gives you full control.

### ⚙️ How it works

Pass an object to `transition` with configuration options:

```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
/>
```

Key configuration options:

| Property | Description | Example values |
|----------|-------------|----------------|
| `duration` | How long the animation takes (seconds) | `0.3`, `1`, `3` |
| `type` | Animation algorithm | `'spring'`, `'tween'` |
| `bounce` | Bounciness (spring only, 0–1) | `0` (none) to `1` (maximum) |
| `stiffness` | Spring tension | `100`, `500` |
| `mass` | Virtual mass of the element | `0.5`, `1`, `2` |

### 🧪 Example

**Spring animation (default):**
```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{ type: 'spring', bounce: 0.4 }}
/>
```
The element bounces a bit at the end — like pushing a real object that overshoots and settles.

**Tween animation:**
```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{ type: 'tween', duration: 0.5 }}
/>
```
A simple, linear interpolation from start to end. No physics, no bouncing.

### 💡 Insight

The `spring` type is Framer Motion's default for good reason — spring animations feel more natural than tween/ease-based animations, especially for position and scale changes. They mimic real-world physics, which our brains are wired to recognize as "right."

---

## Concept 4: Spring vs Tween — When to Use Which

### 🧠 What is it?

The two main animation types in Framer Motion serve different purposes:

- **Spring** — Physics-based. Has bounce, momentum, and natural deceleration. Great for movement and scale.
- **Tween** — Time-based. Linear interpolation over a set duration. Great for opacity, color changes, and when you need precise timing.

### ⚙️ How it works

```jsx
// Spring: natural, bouncy — great for movement
transition={{ type: 'spring', stiffness: 300, damping: 20 }}

// Tween: precise, predictable — great for fades
transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
```

### 💡 Insight

A good rule of thumb: use **spring** for things that *move* (position, scale, rotation) and **tween** for things that *appear/disappear* (opacity, color). But experiment — sometimes breaking the "rules" produces the best-looking results.

---

## ✅ Key Takeaways

- **Motion components** (`motion.div`, `motion.span`, etc.) are enhanced HTML elements that Framer Motion can animate
- The **`animate` prop** defines the target state — Framer Motion handles the animation
- The **`transition` prop** controls how the animation plays (duration, type, bounce)
- **Spring** animations are the default and feel natural with physics-based bouncing
- **Tween** animations are simple interpolations without physics
- Animations re-trigger whenever `animate` values change — perfectly reactive with React state

## ⚠️ Common Mistakes

- Forgetting to import `motion` from `framer-motion`
- Using a regular HTML element instead of a motion component — the `animate` prop only works on motion components
- Setting `bounce` with `type: 'tween'` — bounce only applies to spring animations

## 💡 Pro Tips

- Use JavaScript's object shorthand when property and variable names match: `animate={{ x, y, rotate }}` instead of `animate={{ x: x, y: y, rotate: rotate }}`
- Play around with `stiffness`, `damping`, and `mass` to fine-tune spring animations
- The `transition` prop applies to **all** animations on an element (animate, exit, whileHover, etc.)
