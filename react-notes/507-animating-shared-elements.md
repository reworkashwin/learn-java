# Animating Shared Elements with `layoutId`

## Introduction

Have you ever seen a UI where an indicator bar smoothly slides between tabs, or a selected item's thumbnail expands into a full-size view? These are **shared element transitions** — where the same visual element appears to move seamlessly between different positions on the page. Under the hood, they might actually be different DOM elements! Framer Motion makes this incredibly easy with a single prop: `layoutId`.

---

## Concept 1: The Shared Element Problem

### 🧠 What is it?

In many UIs, you have an element that appears in different positions depending on state — like an active tab indicator bar. Technically, it's not one DOM element moving. It's multiple elements, conditionally rendered based on which tab is selected. Each tab has its own bar that shows or hides.

### ❓ Why is this tricky?

Since these are **separate DOM elements**, there's no built-in way to animate between them. When tab 1 deselects, its bar disappears. When tab 2 selects, a new bar appears. No transition — just a swap.

### 💡 Insight

It's like having three light switches in different rooms. When you turn one off and another on, there's no "movement" — they're independent. But what if you could make it *look* like the light slides from one room to the next?

---

## Concept 2: The `layoutId` Prop

### 🧠 What is it?

The `layoutId` prop tells Framer Motion: "These are the same conceptual element, even though they're different DOM nodes. Animate between them as if one is moving to the other's position."

### ⚙️ How it works

1. Convert the shared element to a motion component
2. Add `layoutId` with the **same string value** on each instance
3. Framer Motion detects when one instance unmounts and another with the same `layoutId` mounts
4. It automatically plays a smooth position/size animation between them

### 🧪 Example

```jsx
function Tab({ label, isSelected }) {
  return (
    <button>
      {label}
      {isSelected && (
        <motion.div className="tab-indicator" layoutId="tab-indicator" />
      )}
    </button>
  );
}
```

Each tab conditionally renders its own indicator `div`. But because they all share `layoutId="tab-indicator"`, Framer Motion animates the indicator sliding from one tab to the next.

### 💡 Insight

From React's perspective, these are different elements being mounted and unmounted. But Framer Motion performs magic behind the scenes — it captures the position of the old element, renders the new one, and animates between the two positions. The user sees one element moving smoothly.

---

## Concept 3: Why `layoutId` and Not Just `layout`?

### 🧠 What is it?

- **`layout`** — Animates position/size changes on a **single persistent** element
- **`layoutId`** — Connects **different elements** with the same conceptual identity and animates between them

### ❓ When to use which?

| Scenario | Use |
|----------|-----|
| A list item moves to a new position in the same list | `layout` |
| A tab indicator slides between different tabs | `layoutId` |
| A card reflows when its neighbors change | `layout` |
| A thumbnail expands into a full-screen modal | `layoutId` |

### 💡 Insight

Think of `layout` as "animate ME when I move" and `layoutId` as "animate between ME and that OTHER element that's actually the same thing."

---

## Concept 4: Setting It Up — Minimal Code

### 🧠 What is it?

The beauty of `layoutId` is how little code it requires.

### ⚙️ How it works

The entire implementation is:

1. `import { motion } from "framer-motion"`
2. Convert the element: `<div>` → `<motion.div>`
3. Add `layoutId="unique-id"`

That's it. Three steps. No animation objects, no variants, no state management. Framer Motion handles the animation automatically.

### 🧪 Example

```jsx
// Before — no animation
{isSelected && <div className="indicator" />}

// After — smooth shared element transition
{isSelected && <motion.div className="indicator" layoutId="tab-indicator" />}
```

---

## ✅ Key Takeaways

- `layoutId` connects separate DOM elements that represent the same conceptual element
- Framer Motion automatically animates position and size between elements sharing a `layoutId`
- It's different from `layout` — which animates a single element's own position changes
- The implementation is minimal: just add `layoutId="some-id"` to a motion component
- Perfect for tab indicators, shared thumbnails, and any "element appears to move" pattern

## ⚠️ Common Mistakes

- Using `layout` when you need `layoutId` — `layout` only works on a single persistent element
- Using different `layoutId` values on elements that should be connected — they must match exactly
- Forgetting to import `motion` and convert the element to a motion component

## 💡 Pro Tips

- `layoutId` is one of Framer Motion's most impressive features for the least amount of code
- Combine `layoutId` with custom transition settings for control over the animation style
- This pattern works beautifully for tab bars, navigation highlights, and content switching UIs
