# Animating Between Conditional Values

## Introduction

Now that we know the basics of Framer Motion, let's apply them to the real project. Remember that arrow icon we animated with CSS transitions earlier? Let's upgrade it to use Framer Motion for a more natural, spring-based animation. This lesson shows how to animate between conditional values — a pattern you'll use constantly in React.

---

## Concept 1: Replacing CSS Animations with Framer Motion

### 🧠 What is it?

We're migrating the arrow icon animation from CSS transitions to Framer Motion. The icon should rotate 180 degrees when challenge details are expanded, and rotate back to 0 when collapsed.

### ❓ Why do we need it?

The CSS version works fine, but Framer Motion gives us:
- **Spring-based animation** — a subtle bounce that feels more natural
- **Consistency** — as we add more Framer Motion animations, it makes sense to use one animation system
- **Fine-grained control** — easier to tweak the feel without digging through CSS

### ⚙️ How it works

**Step 1: Clean up the CSS approach**

Remove the CSS transition and the conditional `expanded` class logic:
- Remove the `transition` property from the icon's CSS rule
- Remove the CSS rule that applies `rotate(180deg)` when `expanded` is present
- Remove the dynamic `expanded` class from the JSX

**Step 2: Set up Framer Motion**

In `ChallengeItem.jsx`:

```jsx
import { motion } from 'framer-motion';
```

Replace the `<span>` icon element with `<motion.span>`:

```jsx
<motion.span
  animate={{ rotate: isExpanded ? 180 : 0 }}
  className="challenge-item-details-icon"
>
  ▼
</motion.span>
```

### 🧪 Example

The complete pattern:

```jsx
function ChallengeItem({ isExpanded, ...otherProps }) {
  return (
    <div className="challenge-item-details">
      <button onClick={toggleDetails}>
        View Details
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="challenge-item-details-icon"
        >
          ▼
        </motion.span>
      </button>
    </div>
  );
}
```

When `isExpanded` is `true` → animate to 180 degrees.  
When `isExpanded` is `false` → animate back to 0 degrees.

Framer Motion handles the smooth transition in both directions automatically.

### 💡 Insight

Notice how clean this is compared to the CSS approach. No conditional class names, no separate CSS transition rules, no multiple CSS selectors. It's all in one place, in the JSX, right where the element is defined.

---

## Concept 2: The Conditional Value Pattern

### 🧠 What is it?

The pattern of using a ternary expression inside `animate` to switch between two values based on a condition:

```jsx
animate={{ rotate: condition ? valueA : valueB }}
```

This is one of the most common patterns in Framer Motion.

### ⚙️ How it works

Whenever the condition changes (from `true` to `false` or vice versa), Framer Motion detects the new target value and plays an animation to reach it. You don't need to manage any animation state yourself — just set the target, and Framer Motion does the rest.

### 🧪 Example

Some other examples of this pattern:

```jsx
// Fade based on visibility
animate={{ opacity: isVisible ? 1 : 0 }}

// Scale based on selection
animate={{ scale: isSelected ? 1.2 : 1 }}

// Slide based on open/close
animate={{ x: isOpen ? 0 : -300 }}
```

### 💡 Insight

This pattern works because Framer Motion's `animate` prop is reactive. Every time the component re-renders with a new value for `animate`, Framer Motion compares the new target with the current state and plays a smooth animation between them. It's declarative animation at its finest.

---

## Concept 3: Comparing CSS vs Framer Motion Results

### 🧠 What is it?

The visual difference between the CSS transition version and the Framer Motion version is subtle but meaningful.

### ⚙️ How it works

| Aspect | CSS Transition | Framer Motion |
|--------|---------------|---------------|
| Animation type | `ease-out` | `spring` (default) |
| Feel | Smooth but mechanical | Natural with slight bounce |
| Code location | Split between CSS and JSX | All in JSX |
| Customizability | Duration + easing | Duration, bounce, stiffness, damping |

### 💡 Insight

It's the small things that add up. One bouncy arrow might not seem like much, but when every animation across your entire app has that natural, physics-based feel, the overall experience is dramatically better. Death by a thousand tiny improvements — in a good way.

---

## ✅ Key Takeaways

- Use `animate={{ prop: condition ? valueA : valueB }}` to animate between two states
- Framer Motion automatically detects value changes and plays smooth animations
- Spring-based animations (Framer Motion's default) feel more natural than CSS ease-based animations
- Migrating from CSS to Framer Motion simplifies the code — no more conditional class toggling

## ⚠️ Common Mistakes

- Forgetting to remove the old CSS transition/animation rules after migrating to Framer Motion — they can conflict
- Not removing the conditional class logic from JSX — it's no longer needed with Framer Motion

## 💡 Pro Tips

- This conditional value pattern is your bread and butter for Framer Motion — get comfortable with it
- You can animate multiple properties at once: `animate={{ rotate: isExpanded ? 180 : 0, scale: isExpanded ? 1.1 : 1 }}`
