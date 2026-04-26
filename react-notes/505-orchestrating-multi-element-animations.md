# Orchestrating Multi-Element Animations

## Introduction

We've animated individual items, staggered lists, and handled layout changes. But what happens when you combine **exit animations on individual items** with **layout animations** on remaining items? Things can get... wobbly. This lesson tackles a subtle bug caused by the `layout` prop and shows how to fix it by explicitly animating expanding/collapsing content. It also covers animating list appearance when switching tabs.

---

## Concept 1: The Layout Animation Distortion Bug

### 🧠 What is it?

When you add the `layout` prop to a component, Framer Motion animates **all** layout changes — including changes you didn't intend to animate, like a height change when expanding a details section inside a list item.

### ❓ Why does it happen?

If a list item has `layout` and you toggle a details panel inside it (expanding its height), Framer Motion sees that as a layout change and tries to animate it. This causes the content to wobble and distort as the height transitions — images stretch, text jumps around.

### ⚙️ How to fix it

Instead of letting Framer Motion auto-animate the height change, **explicitly animate the expanding content** with a proper entry/exit animation. This way, the height change happens smoothly as part of a controlled animation rather than being caught by the generic `layout` handler.

### 🧪 Example

```jsx
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <p>{details}</p>
    </motion.div>
  )}
</AnimatePresence>
```

Key points:
- Wrap with `AnimatePresence` so the exit animation plays
- Animate `height` from `0` to `"auto"` — Framer Motion supports animating to `auto`
- The explicit animation prevents the `layout` prop from creating distortion

### 💡 Insight

You can animate to `height: "auto"` in Framer Motion! This is incredibly useful because you rarely know the exact pixel height of dynamic content. Framer Motion figures it out for you.

---

## Concept 2: Animating List Appearance on Tab Switch

### 🧠 What is it?

When switching from an empty tab (no items) to a tab with items, the list pops in instantly. Adding entry animations to the list element itself makes this transition smoother.

### ⚙️ How it works

On the `<motion.ol>` that renders the list, add `initial` and `animate` props:

```jsx
<motion.ol
  key="list"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -30 }}
>
  {/* list items */}
</motion.ol>
```

Now when switching to a tab with items, the list fades and slides in rather than appearing instantly.

### 💡 Insight

This is the same `initial`/`animate` pattern you already know — it's just applied at the list container level rather than on individual items. Animations at different levels of the hierarchy complement each other.

---

## Concept 3: Animating Fallback Text

### 🧠 What is it?

The "No challenges found" fallback text can also benefit from entry and exit animations, so switching between content and empty states feels polished.

### ⚙️ How it works

Convert the fallback `<p>` to `<motion.p>` and add animation props:

```jsx
<motion.p
  key="fallback"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  No challenges found.
</motion.p>
```

Combined with `AnimatePresence mode="wait"`, the list animates out → then the fallback text animates in. Clean and sequential.

---

## ✅ Key Takeaways

- The `layout` prop animates **all** layout changes — including ones you didn't intend
- Fix distortion by explicitly animating expanding/collapsing content with `AnimatePresence` and `height: "auto"`
- Add entry/exit animations to list containers for smooth tab-switch transitions
- Animate fallback text for polished empty-state transitions
- Use `AnimatePresence mode="wait"` to sequence exit → enter between list and fallback

## ⚠️ Common Mistakes

- Relying solely on `layout` for height changes in expandable sections — it causes distortion
- Not wrapping expandable content in `AnimatePresence` — the exit animation won't play
- Forgetting that `height: "auto"` is a valid animation target in Framer Motion

## 💡 Pro Tips

- When you see weird wobbling with the `layout` prop, the fix is usually to explicitly animate the content that's causing the layout shift
- `height: "auto"` eliminates the need to measure elements or hardcode pixel values
- Layer your animations — container-level, list-level, and item-level animations all work together for a cohesive feel
