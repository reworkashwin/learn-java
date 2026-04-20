# CSS Styling & Dynamic Styling

## Introduction

We can now select different tabs and see different content — but there's no visual indicator of **which tab is currently active**. The user can tell from the content, sure, but a highlighted button would be much better UX. This is where **dynamic styling** comes in — setting CSS classes conditionally based on state.

---

## Setting Classes in JSX: `className`

In regular HTML, you add classes with the `class` attribute. In JSX, you use `className` instead:

```jsx
<button className="active">Components</button>
```

Why the difference? Because `class` is a reserved keyword in JavaScript. Since JSX is JavaScript under the hood, React uses `className` to avoid conflicts.

> Most HTML attributes work the same in JSX (`id`, `src`, `alt`, etc.), but `class` → `className` is the notable exception you must remember.

If you hardcode `className="active"` on every button, they'll all look selected — not what we want!

---

## Making Styling Dynamic

### Step 1: Accept a Prop

In the `TabButton` component, accept an `isSelected` prop:

```jsx
export default function TabButton({ children, onSelect, isSelected }) {
  return (
    <li>
      <button className={isSelected ? "active" : undefined} onClick={onSelect}>
        {children}
      </button>
    </li>
  );
}
```

The ternary expression sets `className` to `"active"` when the button is selected, and `undefined` (no class) when it's not.

### Step 2: Pass the Prop Based on State

In the parent component where we manage state, compare each button's identifier to the current `selectedTopic`:

```jsx
<TabButton
  isSelected={selectedTopic === "components"}
  onSelect={() => handleSelect("components")}
>
  Components
</TabButton>

<TabButton
  isSelected={selectedTopic === "jsx"}
  onSelect={() => handleSelect("jsx")}
>
  JSX
</TabButton>
```

The expression `selectedTopic === "components"` evaluates to `true` or `false`, which gets passed as the `isSelected` prop.

### How It All Connects

1. User clicks "JSX" button → `handleSelect("jsx")` runs → state updates to `"jsx"`
2. Component re-renders → `selectedTopic === "jsx"` is `true` for the JSX button, `false` for all others
3. The JSX button gets `className="active"`, others get no class
4. CSS styles kick in → selected button is visually highlighted

---

## The Re-Render Chain

This is really the same conditional rendering concept applied to attributes:

- **Conditional content**: Show different JSX blocks based on state
- **Conditional styling**: Set different attributes based on state

Both work because React re-evaluates all JSX expressions whenever state changes.

---

## ✅ Key Takeaways

- Use `className` (not `class`) to set CSS classes in JSX
- Dynamic styling follows the same pattern as conditional rendering — use ternary expressions or variables
- Props like `isSelected` make components flexible — the component doesn't decide its own state; the parent tells it
- Comparing state values to identifiers (`selectedTopic === "jsx"`) is a clean way to derive boolean props

## ⚠️ Common Mistakes

- **Using `class` instead of `className`**: This is one of the most common JSX errors for beginners
- **Setting `className=""` instead of `undefined`**: An empty string still adds a `class` attribute to the DOM — use `undefined` for truly no class
- **Forgetting to pass `isSelected` to all buttons**: If you only add it to one button, the others won't respond to state changes

## 💡 Pro Tips

- You can combine multiple conditional classes: `` className={`btn ${isSelected ? "active" : ""} ${isDisabled ? "disabled" : ""}`} ``
- For complex class logic, consider libraries like `clsx` or `classnames`
- The pattern of deriving visual state from data state (rather than tracking "which button looks active" separately) is a core React principle
