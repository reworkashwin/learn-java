# Reusing Animation States with Variants in Framer Motion

## Introduction

As your Framer Motion animations grow, you'll notice a common problem — **duplicated animation objects**. Your `initial` and `exit` states often share the exact same values. Wouldn't it be great to define them once and reuse them everywhere? That's exactly what **variants** let you do. But variants aren't just about code reuse — they unlock a much more powerful pattern we'll explore in the next lesson. For now, let's master the basics.

---

## Concept 1: The Duplication Problem

### 🧠 What is it?

When you define `initial` and `exit` props on a motion component, they often contain identical animation objects. For example, a modal that fades and slides in will need to fade and slide out the same way.

### ❓ Why do we need to fix it?

Duplicated objects mean duplicated maintenance. If you change the exit animation, you need to remember to update the initial animation too. That's error-prone and messy.

### ⚙️ How it works

The simplest fix is basic JavaScript — extract the shared animation object into a constant:

```jsx
const hiddenState = { opacity: 0, y: 30 };

<motion.dialog
  initial={hiddenState}
  animate={{ opacity: 1, y: 0 }}
  exit={hiddenState}
/>
```

Now changes only need to happen in one place. But Framer Motion offers an even better approach...

---

## Concept 2: Introducing Variants

### 🧠 What is it?

The `variants` prop lets you define **named animation states** on a motion component. Instead of passing raw animation objects to `initial`, `animate`, and `exit`, you pass **string identifiers** that reference your named states.

### ❓ Why do we need it?

- Cleaner, more readable JSX
- Reusable animation states referenced by name
- Foundation for a much more powerful feature — **nested animation propagation** (next lesson)

### ⚙️ How it works

1. Add the `variants` prop to your motion component with an object of named states
2. Each key is a custom identifier (any name you choose)
3. Each value is the animation object for that state
4. Reference the identifiers by name in `initial`, `animate`, `exit`, `whileHover`, etc.

### 🧪 Example

```jsx
<motion.dialog
  variants={{
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }}
  initial="hidden"
  animate="visible"
  exit="hidden"
/>
```

Instead of passing objects directly, you just pass the string `"hidden"` or `"visible"`. Framer Motion looks up the corresponding animation object from `variants`.

### 💡 Insight

The variant names are completely up to you — `hidden`/`visible`, `off`/`on`, `closed`/`open` — whatever makes semantic sense. Just make sure the string identifiers match exactly (watch for typos!).

---

## Concept 3: Variants with Other Props

### 🧠 What is it?

Variants aren't limited to `initial`, `animate`, and `exit`. You can also use variant names with props like `whileHover`, `whileTap`, `whileFocus`, and more.

### ⚙️ How it works

Simply add the desired state to your `variants` object and reference it:

```jsx
<motion.button
  variants={{
    idle: { scale: 1 },
    hovered: { scale: 1.1 },
    pressed: { scale: 0.95 }
  }}
  initial="idle"
  whileHover="hovered"
  whileTap="pressed"
/>
```

### 💡 Insight

This makes your animation code extremely declarative. You define the "what" (named states) in one place, and the "when" (which prop triggers which state) becomes a simple mapping.

---

## ✅ Key Takeaways

- Extract duplicated animation objects into **variants** for cleaner, DRY code
- `variants` takes an object of named animation states with custom identifiers
- Reference variant names as strings in `initial`, `animate`, `exit`, `whileHover`, etc.
- Variant names must match exactly — watch for typos
- The real power of variants goes beyond reuse — it enables **nested animation propagation** (next lesson)

## ⚠️ Common Mistakes

- Typos in variant names — if `initial="hiden"` doesn't match a key in `variants`, nothing happens and there's no error
- Forgetting that variant names are case-sensitive

## 💡 Pro Tips

- Use descriptive variant names that describe the visual state (`hidden`, `visible`, `expanded`) rather than the trigger (`onEnter`, `onExit`)
- Variants are the foundation for powerful nested animations — mastering them here pays off big in the next lesson
