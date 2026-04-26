# Combining Animations with Layout Animations

## Introduction

We've been building up a layered animation system — exit animations, layout shifts, staggered lists, expanding sections. Now it's time to tie everything together and handle the edge cases that arise when mixing `AnimatePresence`, `layout`, and conditional rendering. This lesson focuses on the orchestration: making sure list items animate out, remaining items slide into place, empty-state fallbacks animate in, and tab switches feel smooth.

---

## Concept 1: The Complete Animation Stack for Lists

### 🧠 What is it?

A fully animated list involves multiple animation layers working in concert:

1. **Individual item exit** — removed items fade/slide out
2. **Layout reflow** — remaining items smoothly slide into new positions
3. **List container exit** — the whole list animates out when empty
4. **Fallback enter** — "No items" text animates in after the list is gone
5. **List container enter** — the list animates in when switching to a populated tab

### ⚙️ How it works

You need **two levels** of `AnimatePresence`:

```jsx
{/* Outer: handles list vs fallback switching */}
<AnimatePresence mode="wait">
  {items.length > 0 ? (
    <motion.ol
      key="list"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      {/* Inner: handles individual item removal */}
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

Each `AnimatePresence` handles a different concern:
- **Outer**: Toggles between the list and the fallback text
- **Inner**: Handles individual item exits within the list

---

## Concept 2: Keys for Multiple Children in AnimatePresence

### 🧠 What is it?

When `AnimatePresence` wraps multiple possible children (like a list OR a fallback paragraph), each child **must** have a unique `key` prop so Framer Motion can distinguish between them.

### ❓ Why do we need it?

Without keys, Framer Motion can't tell that the list disappeared and the paragraph appeared — it might think it's the same element. Keys let it correctly detect mounting/unmounting and play the right animations.

### ⚙️ How it works

Use hardcoded, descriptive keys since these aren't dynamic list items:

```jsx
<motion.ol key="list">...</motion.ol>
<motion.p key="fallback">...</motion.p>
```

### 💡 Insight

You already use keys in lists (from `.map()`). This is the same concept, just applied to conditional rendering blocks inside `AnimatePresence`.

---

## Concept 3: The `mode="wait"` Pattern

### 🧠 What is it?

By default, `AnimatePresence` uses `mode="sync"` — exit and enter animations play at the same time. With `mode="wait"`, the exiting element fully completes its animation before the entering element begins.

### ⚙️ How it works

```jsx
<AnimatePresence mode="wait">
  {showList ? (
    <motion.ol key="list" exit={{ opacity: 0 }}>...</motion.ol>
  ) : (
    <motion.p key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      No items
    </motion.p>
  )}
</AnimatePresence>
```

Timeline:
1. List fades out completely
2. *Then* fallback text fades in

Without `mode="wait"`, both would happen simultaneously — the fallback text would appear while the list is still fading out.

---

## Concept 4: Expanding Content Without Distortion

### 🧠 What is it?

When list items have the `layout` prop and contain expandable content (like a details panel), toggling the panel changes the item's height. The `layout` prop tries to animate this height change, causing visual distortion.

### ⚙️ The Fix

Explicitly animate the expanding content so `layout` doesn't need to handle it:

```jsx
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      {details}
    </motion.div>
  )}
</AnimatePresence>
```

---

## ✅ Key Takeaways

- Complex list animations require **nested `AnimatePresence`** — one for items, one for list vs. fallback
- Add `key` props to all children inside `AnimatePresence` when you have multiple possible children
- Use `mode="wait"` to sequence exit → enter when switching between content blocks
- Explicitly animate expandable content to prevent `layout` prop distortion
- Layer animations at different levels (item, list, container) for a cohesive experience

## ⚠️ Common Mistakes

- Using only one `AnimatePresence` for both individual item exits and list/fallback switching
- Forgetting keys on elements inside `AnimatePresence` with conditional rendering
- Leaving `mode` as default (`"sync"`) when you want sequential transitions

## 💡 Pro Tips

- Think of animations in layers: item-level, container-level, and page-level
- `mode="wait"` is your go-to for any "swap one thing for another" animation
- Test your animations by slowly stepping through — remove one item at a time and verify each phase looks correct
