# Re-Triggering Animations via Keys

## Introduction

Here's a scenario: you have a badge that bumps (scales up then back down) when the component first appears. Great. But what happens when the number inside the badge changes? Nothing — because the component already appeared. The entry animation already played. How do you make it play **again**? The answer is a fundamental React pattern that works beautifully with Framer Motion: **changing the `key` prop**.

---

## Concept 1: The Problem — One-Time Entry Animations

### 🧠 What is it?

When you define an entry animation with `animate` (or `initial` + `animate`), it plays **once** when the component first mounts. After that, the component persists in the DOM, and the animation won't replay — even if the component's content (like a number) changes.

### ❓ Why is this a problem?

Imagine a badge showing the count of items in a list. When an item moves between lists, the count changes. A subtle "bump" animation on the badge would provide great visual feedback — but it only plays on initial mount, not on subsequent updates.

### 💡 Insight

React doesn't destroy and recreate a component just because its props change. It re-renders it in place. So the component never "re-mounts" and the entry animation never re-triggers.

---

## Concept 2: The Key Prop as a Reset Mechanism

### 🧠 What is it?

In React, the `key` prop has a special behavior beyond list rendering. When you change the `key` on a component, React **destroys the old instance** and **creates a brand new one**. This means:
- All internal state resets
- The component re-mounts from scratch
- Entry animations play again

### ❓ Why do we need it?

It's the cleanest way to force React to treat a component as "new" — even if it's the same component in the same position in the JSX tree. By tying the key to a changing value, you trigger a full re-mount whenever that value changes.

### ⚙️ How it works

1. Define an entry animation on your component
2. Add a `key` prop tied to a value that changes when you want the animation to replay
3. When the key changes, React destroys and recreates the component → animation replays

### 🧪 Example

```jsx
function Badge({ count }) {
  return (
    <motion.span
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
    >
      {count}
    </motion.span>
  );
}

// Usage — key changes whenever count changes
<Badge key={count} count={count} />
```

Every time `count` changes, React unmounts the old `Badge` and mounts a new one. The scale animation plays again.

### 💡 Insight

Notice that you can define the animation with just `animate` and keyframes — no `initial` needed. The keyframe array `[1, 1.2, 1]` starts at the current size, scales up 20%, and returns to normal. The key change ensures this plays on every count update.

---

## Concept 3: Using Keyframes for Bump Effects

### 🧠 What is it?

A "bump" animation is a quick scale-up-and-back effect that draws attention to a change. Keyframe arrays make this trivial.

### ⚙️ How it works

```jsx
<motion.span
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 0.3 }}
>
  {value}
</motion.span>
```

The keyframe array `[1, 1.2, 1]` means:
1. Start at normal size (1)
2. Scale up to 120% (1.2)
3. Return to normal size (1)

All within 300ms. Quick, subtle, and effective.

---

## Concept 4: Keys Beyond Lists

### 🧠 What is it?

Most React developers only know `key` from list rendering (`.map()`). But `key` is actually a general-purpose React feature for controlling component identity.

### ⚙️ Three uses of `key` in React

| Use Case | Purpose |
|----------|---------|
| **Lists** (`.map()`) | Help React efficiently update list items |
| **AnimatePresence with multiple children** | Help Framer Motion distinguish between elements |
| **Forcing re-mount** | Destroy and recreate a component to reset state/animations |

### 💡 Insight

This is a pure React pattern, not a Framer Motion feature. Framer Motion benefits from it because re-mounting triggers entry animations, but the mechanism is all React. You can use this same pattern to reset form state, clear timers, or restart any initialization logic.

---

## ✅ Key Takeaways

- Entry animations only play once — when the component first mounts
- Changing the `key` prop forces React to **destroy and recreate** the component
- This re-mount triggers the entry animation again — perfect for "bump" effects on badges, counters, etc.
- Tie the `key` to whatever value should trigger the re-animation (e.g., a count)
- The `key` pattern is a React feature that works with any framework or library, not just Framer Motion

## ⚠️ Common Mistakes

- Adding `key` on the component definition instead of where it's used — `key` must be on the JSX element at the call site
- Using a key that doesn't actually change — the animation won't replay
- Overusing key-based re-mounts — it destroys ALL internal state, which may have unintended side effects

## 💡 Pro Tips

- Combine `key` changes with `AnimatePresence` to also play exit animations on the old instance before the new one mounts
- Use keyframe arrays like `[1, 1.2, 1]` for quick, self-contained bump animations that don't need `initial`
- This pattern is perfect for notification badges, counters, and any element that should "react" to data changes
