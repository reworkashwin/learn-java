# Animating with CSS Animations

## Introduction

CSS transitions are great when you're animating between two states of an element that's already in the DOM. But what about elements that **appear dynamically** — like modals? They aren't in the DOM initially, so there's no "starting state" to transition from. That's where **CSS animations** come in — they let you define the entire animation sequence yourself, including the starting state.

---

## Concept 1: The Limitation of CSS Transitions for Dynamic Elements

### 🧠 What is it?

CSS transitions animate changes to CSS properties. But they need a **before** and **after** state — the element must already exist in the DOM with some initial CSS values before transitioning to new ones.

### ❓ Why do we need something else?

In our Challenges app, the modal for adding a new challenge is rendered **conditionally**. When `isCreatingNewChallenge` is `false`, the `<NewChallenge>` component (and the modal it contains) simply doesn't exist in the DOM at all.

```jsx
{isCreatingNewChallenge && <NewChallenge />}
```

Since the element isn't in the DOM before it appears, there's no starting state for a CSS transition to animate from. The element just *pops* into existence.

### 💡 Insight

This is a fundamental distinction: **CSS transitions** animate property *changes* on existing elements. **CSS animations** define the full animation *sequence* — including what happens at the very start, even if the element just appeared.

---

## Concept 2: CSS `@keyframes` Animations

### 🧠 What is it?

CSS animations use the `@keyframes` rule to define a sequence of animation steps. You give the animation a name and define what CSS properties should look like at different points in time.

### ⚙️ How it works

1. **Define the animation** with `@keyframes`:

```css
@keyframes slide-up-fade-in {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

- `0%` — The starting state (pushed down 30px, invisible)
- `100%` — The ending state (normal position, fully visible)
- You can also use `from` and `to` instead of percentages
- You can add as many intermediate steps as you want (e.g., `25%`, `50%`, `75%`)

2. **Attach the animation** to a CSS selector using the `animation` property:

```css
.modal {
  animation: slide-up-fade-in 0.3s ease-out forwards;
}
```

### 🧪 Example

Breaking down the `animation` shorthand:

| Value | Meaning |
|-------|---------|
| `slide-up-fade-in` | The name of the `@keyframes` animation |
| `0.3s` | Duration — how long the animation takes |
| `ease-out` | Easing function — fast start, slow finish |
| `forwards` | Keep the end state after the animation finishes |

The `forwards` keyword is important — without it, the element would snap back to its pre-animation state once the animation completes.

### 💡 Insight

CSS animations are triggered **automatically** whenever an element with the animation property appears in the DOM. That's exactly what makes them perfect for entry animations — the moment React conditionally renders the modal, CSS immediately plays the animation.

---

## Concept 3: `@keyframes` vs CSS Transitions

### 🧠 What is it?

Both are CSS animation features, but they serve different purposes:

| Feature | CSS Transitions | CSS Animations |
|---------|----------------|----------------|
| **Trigger** | Property value change | Element appears / class added |
| **States** | Before → After | Any number of keyframe steps |
| **Element must exist?** | Yes, needs initial state | No, defines its own initial state |
| **Use case** | Hover effects, toggles | Entry animations, complex sequences |
| **Looping** | Not built-in | Supports infinite loops |

### ❓ Why do we need both?

They complement each other:
- Use **transitions** for simple state changes on existing elements (like the arrow rotation)
- Use **animations** for entry effects, multi-step sequences, or when you need to define the starting state yourself

### 💡 Insight

Together, CSS transitions and animations cover a huge range of animation needs. For many projects, you might never need an animation library at all. But as we'll see in the next lecture, they do have their limits.

---

## ✅ Key Takeaways

- **CSS `@keyframes` animations** let you define multi-step animation sequences with full control over starting and ending states
- They're perfect for **entry animations** — animating elements as they appear in the DOM
- The `animation` shorthand takes: name, duration, easing, and fill mode (`forwards` to keep the end state)
- CSS transitions animate property *changes*; CSS animations define the full *sequence*
- Use `0%` / `100%` (or `from` / `to`) to define animation steps

## ⚠️ Common Mistakes

- Forgetting the `forwards` keyword — the element snaps back to its initial state after the animation
- Using negative `translateY` when you want to push an element **down** (negative Y moves up, positive Y moves down)
- Trying to use CSS transitions for elements that don't exist in the DOM yet

## 💡 Pro Tips

- You can add intermediate steps like `50%` to create more complex multi-phase animations
- CSS animations can be set to loop with `animation-iteration-count: infinite`
- Check out [MDN's CSS Animations documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations) for all configuration options
