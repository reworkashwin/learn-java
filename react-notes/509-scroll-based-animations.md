# Scroll-Based Animations & Parallax Effects

## Introduction

Everything we've animated so far has been triggered by user interactions — clicks, hovers, component mounts. But some of the most visually impressive effects on the web are driven by **scrolling**. Parallax backgrounds, elements fading as you scroll past them, text scaling up — all tied to scroll position. Framer Motion makes this remarkably straightforward with two hooks: `useScroll` and `useTransform`. Let's build a full parallax hero section.

---

## Concept 1: The `useScroll` Hook

### 🧠 What is it?

`useScroll` is a Framer Motion hook that tracks the user's scroll position and returns reactive values you can use in animations.

### ⚙️ How it works

```jsx
import { useScroll } from "framer-motion";

const { scrollY, scrollX, scrollYProgress, scrollXProgress } = useScroll();
```

| Property | Type | Description |
|----------|------|-------------|
| `scrollY` | Motion value | Absolute pixels scrolled vertically |
| `scrollX` | Motion value | Absolute pixels scrolled horizontally |
| `scrollYProgress` | Motion value | Relative scroll (0 = top, 1 = bottom) |
| `scrollXProgress` | Motion value | Relative horizontal scroll (0 to 1) |

### 💡 Insight

These return **motion values**, not regular numbers. This is critical — motion values update without causing React re-renders. The component function doesn't re-execute on every scroll event, making this extremely performant.

---

## Concept 2: The `useTransform` Hook

### 🧠 What is it?

`useTransform` maps a motion value (like scroll position) to a different range of values you can use in animations. It's like saying: "When scroll is between 0 and 200 pixels, give me an opacity between 1 and 0."

### ❓ Why do we need it?

Raw scroll values (0, 100, 200 pixels) aren't directly useful for animation properties like opacity (0–1) or scale (0.5–1.5). `useTransform` bridges that gap.

### ⚙️ How it works

```jsx
import { useTransform } from "framer-motion";

const opacity = useTransform(
  scrollY,           // Input motion value
  [0, 200, 300, 500], // Input breakpoints (scroll positions in pixels)
  [1, 0.5, 0.5, 0]   // Output values (opacity at each breakpoint)
);
```

This reads: "At 0px scroll → opacity 1. At 200px → opacity 0.5. Stay at 0.5 until 300px. Then fade to 0 by 500px."

Framer Motion **interpolates** between breakpoints automatically.

### 🧪 Example — Multiple transforms

```jsx
const { scrollY } = useScroll();

const opacityCity = useTransform(scrollY, [0, 200, 300, 500], [1, 0.5, 0.5, 0]);
const yCity = useTransform(scrollY, [0, 200], [0, -100]);
const yHero = useTransform(scrollY, [0, 200], [0, -150]);
const opacityHero = useTransform(scrollY, [0, 300, 500], [1, 1, 0]);
const scaleText = useTransform(scrollY, [0, 300], [1, 1.5]);
const yText = useTransform(scrollY, [0, 200, 300, 500], [0, 50, 50, 300]);
```

Each transform creates a different animation curve based on the same scroll input. The city moves up slowly, the hero moves up faster (parallax!), the text grows and pushes down.

### 💡 Insight

You can have **pauses** in your transforms. Setting the same output value for two consecutive breakpoints creates a range where nothing changes. Like `[0.5, 0.5]` for scroll `[200, 300]` — opacity stays at 0.5 while scrolling through that 100px range.

---

## Concept 3: Using the `style` Prop (Not `animate`)

### 🧠 What is it?

When working with motion values from `useTransform`, you apply them via the **`style` prop**, not the `animate` prop.

### ❓ Why can't we use `animate`?

Motion values from `useTransform` are managed internally by Framer Motion — they update **without re-rendering** the component. The `animate` prop expects regular values and triggers React's render cycle. The `style` prop on motion components is specially enhanced to accept motion values and update efficiently.

### ⚙️ How it works

```jsx
<motion.img
  src={cityImage}
  style={{ opacity: opacityCity, y: yCity }}
/>
```

Framer Motion watches the motion values in the `style` prop and updates the DOM directly — no React re-renders needed. This makes scroll-based animations buttery smooth.

### 💡 Insight

This is a key performance pattern. Scroll events fire dozens of times per second. If each one triggered a React re-render, performance would tank. Motion values + `style` prop bypass React's render cycle entirely.

---

## Concept 4: Building a Parallax Effect

### 🧠 What is it?

A parallax effect is when background elements move at a **different speed** than foreground elements during scrolling, creating a sense of depth.

### ⚙️ How it works

Map the same scroll input to **different movement ranges** for different elements:

```jsx
// Background city: moves slowly
const yCity = useTransform(scrollY, [0, 200], [0, -100]);

// Foreground hero: moves faster
const yHero = useTransform(scrollY, [0, 200], [0, -150]);
```

The hero moves 150px while the city only moves 100px over the same scroll range. This speed difference creates the illusion of depth.

### 🧪 Complete Example

```jsx
function WelcomePage() {
  const { scrollY } = useScroll();

  const opacityCity = useTransform(scrollY, [0, 200, 300, 500], [1, 0.5, 0.5, 0]);
  const yCity = useTransform(scrollY, [0, 200], [0, -100]);
  const yHero = useTransform(scrollY, [0, 200], [0, -150]);
  const opacityHero = useTransform(scrollY, [0, 300, 500], [1, 1, 0]);
  const scaleText = useTransform(scrollY, [0, 300], [1, 1.5]);
  const yText = useTransform(scrollY, [0, 200, 300, 500], [0, 50, 50, 300]);

  return (
    <>
      <motion.div style={{ scale: scaleText, y: yText }}>
        <h1>Welcome</h1>
      </motion.div>
      <motion.img src={heroImg} style={{ y: yHero, opacity: opacityHero }} />
      <motion.img src={cityImg} style={{ opacity: opacityCity, y: yCity }} />
    </>
  );
}
```

### 💡 Insight

The parallax effect works because our brains interpret faster-moving objects as being closer. By making foreground elements move faster than background elements, you create a convincing 3D-like depth effect — all with 2D elements.

---

## Concept 5: Performance — Why Motion Values Matter

### 🧠 What is it?

Motion values are Framer Motion's secret weapon for performance. They're reactive values that **bypass React's render cycle**.

### ⚙️ How it works

Normal approach (bad for performance):
```
scroll event → setState → React re-render → DOM update
```

Motion value approach (great for performance):
```
scroll event → motion value updates → DOM update (directly)
```

No `useState`, no re-renders, no reconciliation. The component function only runs once. All updates happen behind the scenes through Framer Motion's internal system.

### 💡 Insight

This is why `useTransform` returns a motion value and why you use `style` instead of `animate`. Everything stays in Framer Motion's internal pipeline, keeping scroll animations at 60fps.

---

## ✅ Key Takeaways

- `useScroll` tracks scroll position as motion values (no re-renders)
- `useTransform` maps scroll position to animation values with breakpoints and interpolation
- Apply transformed values via the `style` prop, not `animate`
- Parallax = mapping the same scroll to different movement ranges for different elements
- Motion values bypass React's render cycle for optimal scroll performance

## ⚠️ Common Mistakes

- Using `animate` instead of `style` with motion values — `animate` won't work with motion values from `useTransform`
- Using `useState` to track scroll position — this causes re-renders on every scroll event
- Not providing enough breakpoints in `useTransform` — you need at least two input/output pairs

## 💡 Pro Tips

- Use `scrollYProgress` (0–1) instead of `scrollY` for responsive animations that work regardless of page height
- Create "pause" ranges by repeating the same output value for consecutive breakpoints
- You can chain `useTransform` — transform a transformed value for complex mappings
- Inspect with DevTools to verify your opacity/position values are changing correctly as you scroll
