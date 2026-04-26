# Animating Element Disappearances / Removal

## Introduction

This is the lesson where Framer Motion truly earns its place. Remember the biggest limitation of CSS animations? **You can't animate an element being removed from the DOM.** React just deletes it — instantly, no questions asked. Framer Motion's `exit` prop and `AnimatePresence` component solve this problem elegantly. Let's see how.

---

## Concept 1: The Problem — Instant Removal

### 🧠 What is it?

When React conditionally renders an element and the condition becomes `false`, the element is removed from the DOM **immediately**. There's no hook, no delay, no chance to play a "goodbye" animation.

### ❓ Why is this a problem?

Think about our modal. We have a beautiful entry animation — it slides up and fades in. But when the user closes it? *Poof.* Gone. Instantly. It feels jarring and inconsistent. If elements animate *in*, they should animate *out* too.

```jsx
// In Header.jsx
{isCreatingNewChallenge && <NewChallenge />}
```

When `isCreatingNewChallenge` becomes `false`, React removes `<NewChallenge>` (and the modal it contains) immediately. CSS can't help us here. Framer Motion can.

### 💡 Insight

This is arguably the #1 reason to use Framer Motion. CSS covers most animation needs, but this one gap — exit animations — is significant enough to justify an entire library.

---

## Concept 2: The `exit` Prop

### 🧠 What is it?

The `exit` prop defines the state a motion component should animate **to** before it's removed from the DOM. Think of it as the mirror image of `initial`:

- `initial` = "Starting state when appearing"
- `animate` = "Target state to animate to"
- `exit` = "Target state when disappearing"

### ⚙️ How it works

```jsx
<motion.dialog
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 30 }}
>
  {/* modal content */}
</motion.dialog>
```

The `exit` prop says: "Before removing me, animate my opacity to 0 and push me down by 30 pixels." The element doesn't just use these values as its final state — they can be completely different from the initial values if you want a different exit animation.

### 💡 Insight

A common pattern is to make `exit` the same as `initial` — the element animates in from a state and reverses back to that same state when leaving. But this isn't required — you could have it slide in from the left and exit to the right, for example.

---

## Concept 3: `AnimatePresence` — The Missing Piece

### 🧠 What is it?

Just adding `exit` to a motion component isn't enough. You **also** need to wrap the conditionally rendered code in Framer Motion's `AnimatePresence` component. Without it, React still removes the element instantly, and the `exit` animation never plays.

### ❓ Why do we need it?

React's reconciliation engine doesn't know or care about animations. When a condition becomes `false`, React removes the element from its virtual DOM, and the real DOM follows immediately. `AnimatePresence` intercepts this process — it tells React: "Hold on, let me check if any children have exit animations. If they do, keep them in the DOM until the animation finishes."

### ⚙️ How it works

**Step 1:** Import `AnimatePresence` (not `motion` — it's a separate import):

```jsx
import { AnimatePresence } from 'framer-motion';
```

**Step 2:** Wrap the conditional rendering:

```jsx
// In Header.jsx
<AnimatePresence>
  {isCreatingNewChallenge && <NewChallenge />}
</AnimatePresence>
```

**Step 3:** Make sure the rendered component (or an element inside it) has the `exit` prop on a motion component.

### 🧪 Example

The complete setup across two files:

**Header.jsx:**
```jsx
import { AnimatePresence } from 'framer-motion';

function Header() {
  const [isCreatingNewChallenge, setIsCreatingNewChallenge] = useState(false);

  return (
    <header>
      <AnimatePresence>
        {isCreatingNewChallenge && <NewChallenge />}
      </AnimatePresence>
    </header>
  );
}
```

**Modal.jsx:**
```jsx
import { motion } from 'framer-motion';

function Modal({ children }) {
  return (
    <motion.dialog
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      open
    >
      {children}
    </motion.dialog>
  );
}
```

Now when the modal opens: slides up + fades in.  
When it closes (backdrop click): slides down + fades out.

### 💡 Insight

`AnimatePresence` is the bridge between React's component lifecycle and Framer Motion's animation system. React says "remove this element." AnimatePresence says "okay, but let me play the exit animation first." Once the animation completes, the element is actually removed from the DOM.

---

## Concept 4: How `initial`, `animate`, and `exit` Work Together

### 🧠 What is it?

These three props form a complete lifecycle animation system:

```
Element added to DOM → initial state → animate to target → [lives on screen] → exit animation → removed from DOM
```

### ⚙️ How it works

| Lifecycle Phase | Prop | When It Happens |
|----------------|------|-----------------|
| Mount | `initial` | Immediately when element enters the DOM |
| Mount → Animate | `animate` | Right after mount, animates from `initial` to `animate` |
| Unmount | `exit` | When element is about to be removed (requires `AnimatePresence`) |

### 💡 Insight

Without `AnimatePresence`, only `initial` → `animate` works. The `exit` prop is silently ignored because React removes the element before Framer Motion gets a chance to animate it. Always pair `exit` with `AnimatePresence`.

---

## ✅ Key Takeaways

- The **`exit` prop** defines the animation to play when an element is being removed from the DOM
- **`AnimatePresence`** must wrap conditionally rendered elements for exit animations to work
- `AnimatePresence` intercepts React's removal process, keeps the element alive until the exit animation completes
- The trio of `initial` → `animate` → `exit` covers the full lifecycle of an element's animations
- Import `AnimatePresence` separately: `import { AnimatePresence } from 'framer-motion'`

## ⚠️ Common Mistakes

- Adding `exit` without wrapping the parent in `AnimatePresence` — the exit animation will simply not play
- Importing `AnimatePresence` from the wrong place or confusing it with `motion`
- Wrapping too much code in `AnimatePresence` — only wrap the specific conditional rendering that needs exit animations

## 💡 Pro Tips

- `AnimatePresence` can also accept a `mode` prop (e.g., `mode="wait"`) to control how entering and exiting elements interact
- You can use different values for `exit` and `initial` to create asymmetric animations (e.g., slide in from left, slide out to right)
- `AnimatePresence` works with any number of conditional children — it tracks each one independently
