# Creating Flexible Components with Styled Components

## Introduction

In the previous lecture, you created your first styled component—a styled `div`. But what about labels, inputs, buttons? And how do props like `onChange`, `type`, and `className` work with styled components? The great news: **styled components automatically forward all props** to the underlying HTML element, making them incredibly flexible and easy to adopt.

---

## Building More Styled Components

### Styled Label

```jsx
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
`;
```

### Styled Input

```jsx
const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  line-height: 1.5;
  background-color: #d1d5db;
  color: #374151;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;
```

---

## Using Styled Components as Replacements

Simply swap out the HTML elements for your styled components:

```jsx
// Before
<label className="...">Email</label>
<input type="email" onChange={handleEmailChange} />

// After
<Label>Email</Label>
<Input type="email" onChange={handleEmailChange} />
```

Notice that `type="email"` and `onChange={handleEmailChange}` are still set on the `<Input>` component. This works because...

---

## Prop Forwarding

This is one of the most important features of styled components: **every prop you set on a styled component gets forwarded to the underlying HTML element.**

```jsx
<Input
  type="email"              // → forwarded to <input type="email">
  onChange={handleChange}    // → forwarded to <input onChange={...}>
  value={email}             // → forwarded to <input value={...}>
  placeholder="Enter email" // → forwarded to <input placeholder="...">
/>
```

Under the hood, the styled component renders something like:

```html
<input
  type="email"
  class="sc-xyz123 abc456"
  ... all other forwarded props
/>
```

This means you don't have to change **any** of your existing prop logic when migrating to styled components. Event handlers, values, types, ARIA attributes—everything just works.

---

## Styled Component = Component + Styles

Think of a styled component as a thin wrapper:

| Feature | Regular Element | Styled Component |
|---------|----------------|-----------------|
| Renders HTML | Directly | Via wrapper |
| Accepts props | Yes | Yes (forwarded) |
| Supports `children` | Yes | Yes |
| Has styles | Via className/inline | Built-in |
| Scoped styles | No | Yes (auto-generated class) |

The only difference is that the styled component comes with styles pre-applied. Everything else behaves identically.

---

## Keeping Styled Components in the Same File

For components that are only used in one place, define them at the top of the same file:

```jsx
// AuthInputs.jsx
import styled from 'styled-components';

const Label = styled.label`...`;
const Input = styled.input`...`;
const ControlContainer = styled.div`...`;

export default function AuthInputs() {
  return (
    <ControlContainer>
      <Label>Email</Label>
      <Input type="email" onChange={...} />
    </ControlContainer>
  );
}
```

If you reuse a styled component across multiple files, extract it into a shared file.

---

## Mixing Approaches

You can absolutely mix styled components with CSS Modules or Vanilla CSS in the same project. For example, the `Header` might use CSS Modules while `AuthInputs` uses styled components. Teams typically settle on one approach, but mixing is technically fine.

---

## ✅ Key Takeaways

- Styled components **forward all props** to the underlying HTML element automatically
- `type`, `onChange`, `value`, `placeholder`—every prop works as expected
- The `children` prop works too, so styled components can wrap other content
- You can define multiple styled components in the same file for convenience

## ⚠️ Common Mistakes

- Thinking you need to manually handle prop forwarding—styled components do it for you
- Creating a styled component with `styled.div` when you need `styled.input` (the HTML element matters!)
- Defining styled components *inside* the component function—define them outside to avoid re-creation on every render

## 💡 Pro Tips

- `styled.element` maps to the corresponding HTML element: `styled.button` → `<button>`, `styled.section` → `<section>`, etc.
- You can also extend existing styled components: `const SpecialButton = styled(Button)`...`` to add more styles
- Since styled components are just React components, they work with all React features: refs, context, etc.
