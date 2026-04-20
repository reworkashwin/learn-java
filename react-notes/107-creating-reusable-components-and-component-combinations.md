# Creating Reusable Components & Component Combinations

## Introduction

When building React apps with styled components, you quickly end up creating lots of small styled components — a `StyledLabel`, a `StyledInput`, a `StyledButton`. But should all of them live in the same file? And when should you extract them into their own files?

This lecture is about a **core React principle**: identifying opportunities to create **reusable components** and smart **component combinations** that reduce repetition and improve your codebase.

---

## When to Keep Styled Components in the Same File

If a styled component is **only used in one file** and is tightly coupled to that specific component, keep it right there.

```jsx
// AuthInputs.jsx
const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;
```

This `ControlContainer` is specific to `AuthInputs` — it's unlikely you'd reuse it elsewhere. Keeping it in the same file is perfectly fine.

---

## When to Extract into Separate Files

For UI elements like **buttons**, **inputs**, and **labels** — elements that appear across multiple parts of your app — you should extract them into their own files.

### Example: Extracting a Button

```jsx
// Button.jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f0b132;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #d49b28;
  }
`;

export default Button;
```

Now any component can import and use this `Button`:

```jsx
import Button from './Button';
```

This doesn't matter for tiny demo apps, but in **real-world applications** where the same button style appears on 10 different screens, this keeps you DRY.

---

## Component Combinations: Merging Related Elements

Here's where things get really interesting. Some elements almost **always appear together** — like a label and an input. Why not combine them into a single reusable component?

### Building a Custom Input Component

```jsx
// Input.jsx
import styled from 'styled-components';

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $invalid }) => ($invalid ? '#f87171' : '#6b7280')};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $invalid }) => ($invalid ? '#f87171' : '#d1d5db')};
  background-color: ${({ $invalid }) => ($invalid ? '#fef2f2' : '#d1d5db')};
  border-radius: 0.25rem;
`;

export default function CustomInput({ label, invalid, ...props }) {
  return (
    <p>
      <Label $invalid={invalid}>{label}</Label>
      <StyledInput $invalid={invalid} {...props} />
    </p>
  );
}
```

Let's break down what's happening:

1. **`label` prop** — The text for the label
2. **`invalid` prop** — Controls conditional styling on both the label and input
3. **`...props`** — Collects everything else (like `type`, `onChange`, `value`) and forwards it to the `<input>`

### Using It

```jsx
import Input from './Input';

// Clean, readable usage
<Input label="Email" invalid={emailInvalid} type="email" onChange={handleEmailChange} />
<Input label="Password" invalid={passwordInvalid} type="password" onChange={handlePasswordChange} />
```

Compare this to the alternative — separately rendering a `<Label>`, a `<StyledInput>`, wrapping them in a `<p>`, and passing `$invalid` to each one. Every. Single. Time.

The component combination approach gives you a **clean API** while hiding the complexity inside.

---

## The Bigger Lesson

This pattern isn't exclusive to styled components. Whether you use Vanilla CSS, CSS Modules, or Tailwind, the principle is the same:

**Always look for opportunities to:**
1. **Outsource** reusable styled elements into their own files
2. **Combine** elements that naturally go together into a single component with a clean API

This is what good React architecture looks like. Components aren't just about splitting your UI — they're about creating **reusable, composable building blocks**.

---

## Styled Components: Summary of Pros & Cons

| Pros | Cons |
|------|------|
| Quick and easy to set up | No separation between CSS and JSX |
| Styles are automatically scoped | You need to know CSS |
| Feels like working with React components | Lots of small wrapper components |
| Supports conditional/dynamic styling | Can feel like boilerplate for simple cases |

---

## ✅ Key Takeaways

- Keep styled components **in the same file** if they're only used there
- **Extract** styled components into separate files if they'll be reused across the app
- **Combine** related elements (like label + input) into a single component with a clean props API
- Use the **spread operator** (`...props`) to forward unknown props to underlying elements
- This pattern works regardless of your styling approach — it's a **React architecture** concept

## 💡 Pro Tip

When building your custom combined components, think about the **API** you're creating. What props does the consumer need to pass? Keep it minimal and intuitive. Hide the styling complexity inside the component.
