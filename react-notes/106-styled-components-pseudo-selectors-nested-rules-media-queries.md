# Styled Components: Pseudo Selectors, Nested Rules & Media Queries

## Introduction

So far you've seen how styled components let you write CSS-in-JS and scope styles to individual components. But what about **media queries**, **pseudo selectors** like `:hover`, and **nested rules** that target child elements? Can styled components handle all of that?

Absolutely — and it's surprisingly elegant. Let's walk through each one.

---

## Nested Rules: Styling Child Elements

### The Problem

Imagine you have a `<header>` component that contains an `<img>`, an `<h1>`, and a `<p>`. You could create a separate styled component for each one — `StyledImage`, `StyledTitle`, `StyledParagraph`... but that's a lot of boilerplate.

### The Solution: The `&` Symbol

Styled components let you **nest CSS rules** inside a single styled component using the `&` (ampersand) symbol.

```jsx
import styled from 'styled-components';

const StyledHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;

  & img {
    width: 11rem;
    height: 11rem;
    object-fit: contain;
    margin-bottom: 2rem;
  }

  & h1 {
    font-size: 1.5rem;
    color: #a78d5e;
    text-transform: uppercase;
  }

  & p {
    color: #8b8b8b;
  }
`;
```

Here's what's happening:

- `& img` means "target any `<img>` inside **this** styled header"
- The `&` refers to the component itself (the `<header>`)
- The **space** between `&` and `img` means "child element" — just like in regular CSS

So instead of creating a separate styled component for every nested element, you write one styled component for the **parent** and target children using `&`.

💡 **Pro Tip:** This approach is especially useful when the child elements (`img`, `h1`, `p`) don't need to be reused elsewhere. You keep everything clean in one styled component.

---

## Media Queries Inside Styled Components

Media queries work exactly as you'd expect — you write them inside the styled component's template literal just like normal CSS:

```jsx
const StyledHeader = styled.header`
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    margin-bottom: 4rem;

    & h1 {
      font-size: 2rem;
    }
  }
`;
```

- On smaller screens, the header has `margin-bottom: 2rem`
- On screens 768px or wider, it changes to `4rem` and the `h1` gets bigger
- Inside the media query, `&` still refers to "this component"

There's **no special syntax** — it's standard CSS. Styled components just wraps it and scopes it for you.

---

## Pseudo Selectors: Hover, Focus, etc.

For pseudo selectors, you also use `&` — but **without a space**:

```jsx
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
```

### Why No Space?

- `& img` (with space) = "an `img` **inside** this element"
- `&:hover` (no space) = "**this element** when hovered"

The space matters! With a space, you'd be targeting child elements that are in a hover state. Without a space, you're styling **the element itself** in that state.

⚠️ **Common Mistake:** Writing `& :hover` (with a space) instead of `&:hover`. The space changes the meaning entirely — one targets hovering over children, the other targets hovering over the component itself.

---

## Putting It All Together

Here's a complete example combining all three concepts:

```jsx
const StyledHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 2rem;

  & img {
    width: 11rem;
    object-fit: contain;
  }

  & h1 {
    color: #a78d5e;
    text-transform: uppercase;
  }

  & p {
    color: #8b8b8b;
  }

  @media (min-width: 768px) {
    margin-bottom: 4rem;

    & h1 {
      font-size: 2rem;
    }
  }
`;
```

You don't have to convert **every** element into a styled component. One well-structured parent styled component can handle styles for all its children.

---

## ✅ Key Takeaways

- Use `&` with a **space** to target **child elements** inside a styled component
- Use `&` **without a space** for **pseudo selectors** like `:hover`, `:focus`, `:active`
- **Media queries** work exactly like standard CSS inside styled components
- You don't need a separate styled component for every single element — nest rules in a parent instead
- It's all standard CSS syntax — styled components just scopes it automatically

## 💡 Pro Tips

- Only create separate styled components for elements you plan to **reuse** across files
- For elements tightly coupled to one component, nesting with `&` keeps things clean
- Combining pseudo selectors, media queries, and nested rules in one styled component gives you a powerful, self-contained styling block
