# Creating a Configurable & Flexible Custom Button Component

## Introduction

Every real application needs buttons — lots of them. Some are big and colorful, some are subtle text links, and some need custom styles depending on where they live. Rather than styling raw `<button>` elements everywhere, building a **reusable, configurable Button component** is one of the smartest early investments you can make in any React project.

This lesson walks through building a Button component that supports multiple visual styles, accepts external class names, and forwards all remaining props to the underlying native button — making it just as flexible as the built-in one.

---

## Organizing UI Components

Before diving into the button itself, there's a useful convention worth adopting: creating a **UI subfolder** inside your `components` directory for generic, reusable building blocks.

Why? Because components like buttons, modals, and inputs aren't tied to any specific feature — they're used *everywhere*. Grouping them into a `UI/` folder keeps your project organized as it grows.

```
src/
  components/
    UI/
      Button.jsx
    Header.jsx
    MealItem.jsx
```

This is purely a convention — not a rule. But it pays dividends in larger projects where you'd otherwise be scrolling through dozens of component files.

---

## Building the Custom Button

### The Foundation: Children Prop

The most basic requirement is that the custom button should behave like the built-in `<button>` — you wrap text or JSX around it, and it renders inside:

```jsx
export default function Button({ children }) {
  return <button>{children}</button>;
}
```

The `children` prop is React's built-in mechanism for receiving whatever content is placed between a component's opening and closing tags.

---

### Supporting Multiple Styles with `textOnly`

The app needs two distinct button styles:
- **Standard buttons** — with a background color, looking like proper clickable buttons
- **Text-only buttons** — just styled text, no background

To handle this, we accept a `textOnly` prop and toggle the CSS class accordingly:

```jsx
export default function Button({ children, textOnly, className, ...props }) {
  let cssClasses = textOnly ? 'text-button' : 'button';
  cssClasses += ' ' + className;

  return (
    <button className={cssClasses} {...props}>
      {children}
    </button>
  );
}
```

When `textOnly` is truthy, the button gets the `text-button` class. Otherwise, it gets the standard `button` class.

---

### Merging External Class Names

What if a parent component wants to add *additional* styling? We accept a `className` prop and merge it with our internal classes:

```jsx
let cssClasses = textOnly ? 'text-button' : 'button';
cssClasses += ' ' + className;
```

This ensures our internal styling is always applied, but external customization is also possible.

---

### Forwarding All Remaining Props with Rest Syntax

Here's where the real magic happens. A native `<button>` accepts `type`, `onClick`, `disabled`, `aria-label`, and dozens of other attributes. Do we really want to explicitly destructure every single one?

Absolutely not. Instead, we use **rest properties**:

```jsx
export default function Button({ children, textOnly, className, ...props }) {
  // ...
  return (
    <button className={cssClasses} {...props}>
      {children}
    </button>
  );
}
```

The `...props` syntax **collects every prop we haven't explicitly destructured** into a single object. Then `{...props}` on the `<button>` **spreads them all** onto the native element.

This means any prop you set on `<Button>` — `onClick`, `type`, `disabled`, anything — gets forwarded automatically.

---

## Using the Custom Button

### Text-Only Style in the Header

```jsx
import Button from './UI/Button.jsx';

// In Header component:
<Button textOnly>Cart (0)</Button>
```

Simply adding `textOnly` as a prop (without `={true}`) automatically sets it to `true` in React. This gives us that subtle, text-link style.

### Standard Style on Meal Items

```jsx
import Button from './UI/Button.jsx';

// In MealItem component:
<Button>Add to Cart</Button>
```

Without `textOnly`, the button defaults to the full background-color style — perfect for action buttons.

---

## Why This Pattern Matters

This isn't just about buttons. The pattern here — **accepting specific props for behavior, merging class names, and forwarding the rest** — is the foundation for building any reusable UI component in React. Inputs, links, cards, modals — they all benefit from the same approach.

---

## ✅ Key Takeaways

- Create a `UI/` folder for generic, reusable components — it's a clean organizational pattern
- Use the `children` prop to make custom components wrappable like native elements
- Toggle CSS classes based on props (like `textOnly`) to support multiple visual variants
- Accept and merge `className` from outside so parent components can add styling
- Use `...props` (rest syntax) + `{...props}` (spread) to forward all remaining props to the native element — no need to list every possible attribute

## ⚠️ Common Mistakes

- Forgetting to spread remaining props onto the native element, making the custom button less flexible than the built-in one
- Hardcoding all possible props instead of using rest/spread — this leads to brittle components that break when new requirements appear

## 💡 Pro Tips

- Adding a prop like `textOnly` without `={true}` automatically sets it to `true` in React — it's a nice shorthand
- The rest/spread pattern (`...props`) works for *any* wrapper component, not just buttons — use it for inputs, links, and more
