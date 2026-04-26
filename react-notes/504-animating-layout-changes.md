# Animating Layout Changes

## Introduction

When items get added to or removed from a list, the remaining items snap instantly into their new positions. It works, but it looks jarring. What if the remaining items could **smoothly slide** into place? That's exactly what Framer Motion's `layout` prop does — it automatically detects layout changes and animates elements to their new positions. One prop. That's it.

---

## Concept 1: The Problem — Instant Layout Snapping

### 🧠 What is it?

When a DOM element is removed (e.g., an item marked as completed leaves a list), the browser instantly recalculates the layout. Remaining items jump to their new positions with no transition.

### ❓ Why is this a problem?

- It's disorienting — users lose track of which item went where
- It feels cheap compared to smooth, animated transitions
- It breaks the sense of spatial continuity in your UI

### 💡 Insight

Think about rearranging books on a shelf. In real life, the remaining books don't teleport — they slide over. That's the feeling you want in your UI.

---

## Concept 2: The `layout` Prop

### 🧠 What is it?

Adding the `layout` prop to a motion component tells Framer Motion: "Watch this element for layout changes, and animate smoothly to its new position whenever the layout shifts."

### ⚙️ How it works

1. Convert your element to a motion component (e.g., `<li>` → `<motion.li>`)
2. Add the `layout` prop
3. Done. Framer Motion handles the rest.

### 🧪 Example

```jsx
<motion.li layout>
  {/* Challenge item content */}
</motion.li>
```

When another item is removed from the list, this item smoothly slides to its new position instead of snapping.

### 💡 Insight

The `layout` prop detects **any** layout change — position, size, or both. It doesn't care *why* the layout changed. Whether an item was removed, added, or the container resized, the animation plays.

---

## Concept 3: Combining `layout` with Exit Animations

### 🧠 What is it?

You can combine the `layout` prop with `AnimatePresence` and `exit` animations so that:
1. The removed item animates **out** (e.g., fades and slides up)
2. The remaining items animate **into** their new positions

### ⚙️ How it works

Wrap the list items with `AnimatePresence`, and on each motion list item, add both `layout` and `exit`:

```jsx
<AnimatePresence>
  {items.map(item => (
    <motion.li
      key={item.id}
      layout
      exit={{ y: -30, opacity: 0 }}
    >
      {item.title}
    </motion.li>
  ))}
</AnimatePresence>
```

Framer Motion sequences these naturally — the removed item animates out first, then the remaining items slide into place.

### 💡 Insight

The `layout` animation waits for the exit animation to finish before starting. So you get a clean two-phase animation: exit → reflow.

---

## Concept 4: Handling the Last Item and Full List Removal

### 🧠 What is it?

Sometimes removing the last item in a list causes the **entire list element** to be removed from the DOM (via conditional rendering). In that case, you need a separate `AnimatePresence` wrapping the list itself.

### ⚙️ How it works

```jsx
<AnimatePresence mode="wait">
  {items.length > 0 ? (
    <motion.ol
      key="list"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <AnimatePresence>
        {items.map(item => (
          <motion.li key={item.id} layout exit={{ y: -30, opacity: 0 }}>
            {item.title}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ol>
  ) : (
    <motion.p
      key="fallback"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      No challenges found.
    </motion.p>
  )}
</AnimatePresence>
```

### 💡 Insight

When `AnimatePresence` wraps **multiple** elements (list + fallback), you must add a `key` to each so Framer Motion can track them. Use `mode="wait"` to ensure the exit animation finishes before the enter animation starts.

---

## Concept 5: `AnimatePresence` Mode — `sync` vs `wait`

### 🧠 What is it?

The `mode` prop on `AnimatePresence` controls how enter and exit animations overlap:

| Mode | Behavior |
|------|----------|
| `"sync"` (default) | Exit and enter animations play simultaneously |
| `"wait"` | Exit animation finishes first, then enter plays |

### ❓ Why do we need `wait`?

Without `mode="wait"`, the fallback text appears at the same time the last item is animating out — they overlap and it looks messy. With `wait`, the list fully animates out before the fallback text fades in.

---

## ✅ Key Takeaways

- Add `layout` to motion components to auto-animate position/size changes
- Combine `layout` with `exit` for smooth remove-and-reflow animations
- Wrap conditionally rendered groups with `AnimatePresence` and add `key` props
- Use `mode="wait"` on `AnimatePresence` to sequence exit-before-enter
- You may need nested `AnimatePresence` — one for individual items, one for the list vs. fallback

## ⚠️ Common Mistakes

- Forgetting `key` on elements inside `AnimatePresence` with multiple children
- Not wrapping the overall list + fallback in its own `AnimatePresence`
- Using `mode="sync"` (default) when you actually want sequential exit → enter

## 💡 Pro Tips

- The `layout` prop works on any motion component, not just list items — use it for dashboards, grids, or any rearrangeable UI
- `mode="wait"` is essential whenever you're switching between two different content blocks
- Hardcoded keys (like `"list"` and `"fallback"`) work fine when elements aren't dynamic
