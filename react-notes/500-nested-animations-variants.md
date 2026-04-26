# Nested Animations & Variant Propagation

## Introduction

Here's where variants truly shine. Beyond simple code reuse, variants have a superpower — they **propagate down the component tree**. When you activate a variant on a parent component, Framer Motion automatically activates the same-named variant on all child motion components. This means you can orchestrate complex, multi-element animations just by setting a single variant on a wrapper. Let's see how this works and what gotchas to watch out for.

---

## Concept 1: Variant Propagation — The Core Idea

### 🧠 What is it?

When a parent motion component activates a variant (e.g., sets `animate="visible"`), Framer Motion automatically passes that information down to all nested motion components. If those children have a variant with the **same name** defined in their `variants` prop, that variant gets activated too — **without** you needing to set `initial` or `animate` on the children.

### ❓ Why do we need it?

Imagine a modal that wraps a form with images. You want the modal to fade in, AND you want the images inside to scale up. Without variant propagation, you'd need to manually wire up animations on every single child. With it, you just define matching variant names and let Framer Motion handle the rest.

### ⚙️ How it works

1. Parent component defines variants and activates them via `initial`, `animate`, `exit`
2. Child components define variants **with the same names**
3. Children don't need `initial` or `animate` — they inherit the active variant from the parent

### 🧪 Example

**Parent (Modal):**
```jsx
<motion.dialog
  variants={{
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }}
  initial="hidden"
  animate="visible"
  exit="hidden"
>
  {children}
</motion.dialog>
```

**Child (list item inside the modal):**
```jsx
<motion.li
  variants={{
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 }
  }}
  transition={{ type: "spring" }}
/>
```

Notice — the child has **no** `initial` or `animate` prop. It just defines `hidden` and `visible` variants with the same names as the parent. Framer Motion activates them automatically.

### 💡 Insight

Think of it like CSS inheritance — the parent says "we're now in the `visible` state" and all children that understand that state respond accordingly. Each child can define completely different animations for the same variant name.

---

## Concept 2: The Exit Animation Gotcha

### 🧠 What is it?

When the parent has `exit="hidden"`, that variant propagates to children too. This means children will also play their exit animations, and **Framer Motion waits for ALL child animations to finish** before removing elements from the DOM.

### ❓ Why is this a problem?

If your modal has `exit="hidden"` and child images also have a `hidden` variant, those images will animate out (e.g., shrink) before the modal disappears. This causes a noticeable delay — the backdrop stays visible while waiting for child animations to complete.

### ⚙️ How to fix it

Override the `exit` prop on the child component. But here's the catch — you can't just set `exit="visible"` (using a variant name). At the time of recording, you must set `exit` to the **actual animation object**, not a variant name:

```jsx
<motion.li
  variants={{
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 }
  }}
  exit={{ opacity: 1, scale: 1 }}  // ← Use the object, not "visible"
  transition={{ type: "spring" }}
/>
```

### 💡 Insight

This is a known quirk. If you set `exit="visible"` (the string), the entry animation breaks. The workaround is to copy the values from the variant and pass them as an inline object. This may be fixed in future Framer Motion versions, but for now — inline object it is.

---

## Concept 3: The Workaround in Practice

### 🧠 What is it?

The complete pattern for nested animations with proper exit handling.

### ⚙️ How it works

- Parent: defines and activates variants normally (`initial`, `animate`, `exit`)
- Child: defines matching variants for entry animation propagation
- Child: overrides `exit` with an inline object (not a variant name) to prevent unwanted exit delays

### 🧪 Example

```jsx
// Parent
<motion.dialog
  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
  initial="hidden"
  animate="visible"
  exit="hidden"
>
  {/* Child */}
  <motion.li
    variants={{
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1 }
    }}
    exit={{ opacity: 1, scale: 1 }}
  />
</motion.dialog>
```

Result: Images animate in when the modal opens, but don't cause a delay when the modal closes.

---

## ✅ Key Takeaways

- Variants **propagate** from parent to child motion components automatically
- Children only need to define variants with **matching names** — no `initial`/`animate` needed
- The `exit` variant also propagates, which can cause unwanted delays
- To prevent exit delays on children, override `exit` with an **inline animation object**, not a variant name
- Each child can define completely different animations for the same variant name

## ⚠️ Common Mistakes

- Setting `exit="visible"` (string) on a child — this breaks the entry animation due to a current Framer Motion quirk
- Forgetting that variant names must match exactly between parent and child
- Not accounting for the fact that Framer Motion waits for all child exit animations before removing the parent

## 💡 Pro Tips

- Variant propagation works through any depth of nesting — grandchildren get it too
- You can have children define only some of the parent's variant names — they'll only respond to the ones they recognize
- This pattern is perfect for modals, drawers, and any component that wraps dynamic content
