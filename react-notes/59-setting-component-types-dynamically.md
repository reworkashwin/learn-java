# Setting Component Types Dynamically

## Introduction

Our `Tabs` component wraps buttons in a `<menu>` element. But what if, in different parts of the app, we wanted to use a `<div>`, `<ul>`, or even a custom component as the wrapper? Hardcoding `<menu>` isn't flexible enough. React lets you **dynamically choose which element or component to render** using a powerful pattern.

---

## The Goal

We want the developer using `Tabs` to choose the wrapper element:

```jsx
// Use a menu element
<Tabs ButtonsContainer="menu" buttons={...}>{content}</Tabs>

// Use a div element
<Tabs ButtonsContainer="div" buttons={...}>{content}</Tabs>

// Use a custom component
<Tabs ButtonsContainer={Section} buttons={...}>{content}</Tabs>
```

---

## How to Accept a Component Identifier as a Prop

### Important: Built-In vs Custom Components

There's a critical difference in how you pass the identifier:

- **Built-in elements** (`div`, `menu`, `ul`): Pass as a **string** → `"menu"`
- **Custom components** (`Section`, `Card`): Pass as a **reference** → `{Section}` (no quotes, no angle brackets)

Why? Because `"menu"` is a string that React maps to the HTML `<menu>` element. But `Section` is a variable — a function — that React can call to render your custom component.

---

## Using the Prop Inside the Component

Here's the tricky part. You can't just do this:

```jsx
// ❌ This doesn't work!
function Tabs({ buttons, children, buttonsContainer }) {
  return (
    <>
      <buttonsContainer>{buttons}</buttonsContainer>
      {children}
    </>
  );
}
```

Why not? Because `buttonsContainer` starts with a **lowercase letter**, so React treats it as a built-in HTML element named "buttonscontainer" — which doesn't exist.

### The Solution: Uppercase Variable

Assign it to a constant that starts with an uppercase character:

```jsx
function Tabs({ buttons, children, buttonsContainer }) {
  const ButtonsContainer = buttonsContainer;

  return (
    <>
      <ButtonsContainer>{buttons}</ButtonsContainer>
      {children}
    </>
  );
}
```

Now React sees `ButtonsContainer` with an uppercase first letter and treats it as a **component**. It then looks at the value:
- If it's a string like `"menu"` → renders the built-in `<menu>` element
- If it's a function like `Section` → calls that function and renders the result

### Even Simpler: Name the Prop with Uppercase

You can skip the remapping by accepting the prop with an uppercase name directly:

```jsx
function Tabs({ buttons, children, ButtonsContainer }) {
  return (
    <>
      <ButtonsContainer>{buttons}</ButtonsContainer>
      {children}
    </>
  );
}
```

Just make sure to set it with the same uppercase name where you use the component:

```jsx
<Tabs ButtonsContainer="menu" buttons={...}>{content}</Tabs>
```

---

## The Complete Picture

```jsx
// Tabs.jsx
export default function Tabs({ buttons, children, ButtonsContainer }) {
  return (
    <>
      <ButtonsContainer>{buttons}</ButtonsContainer>
      {children}
    </>
  );
}

// Examples.jsx — using a built-in element
<Tabs ButtonsContainer="menu" buttons={...}>
  {tabContent}
</Tabs>

// SomeOtherPage.jsx — using a custom component
<Tabs ButtonsContainer={CustomWrapper} buttons={...}>
  {otherContent}
</Tabs>
```

---

## Two Things to Remember

1. **The prop must be usable as a component** — it must start with uppercase, or be remapped to an uppercase variable
2. **Built-in elements use string identifiers** (`"div"`, `"menu"`, `"ul"`), **custom components use the function reference** (`Section`, `Card`) — no angle brackets, no function calls

---

## ✅ Key Takeaways

- You can pass component identifiers (strings for built-in, function references for custom) as prop values
- The variable used in JSX must start with an **uppercase character** for React to treat it as a component
- This pattern makes wrapper components **highly configurable** — the consumer decides what element to use
- React automatically handles the difference between string identifiers and component functions

## ⚠️ Common Mistakes

- **Using lowercase for the component variable**: `<buttonsContainer>` tells React to look for a built-in HTML element, which fails
- **Passing built-in elements without quotes**: `ButtonsContainer={menu}` looks for a variable called `menu` — use `ButtonsContainer="menu"` instead
- **Using angle brackets when passing custom components**: Don't write `ButtonsContainer={<Section />}` — just write `ButtonsContainer={Section}`

## 💡 Pro Tips

- This pattern is used by popular libraries: React Router's `component` prop, Material UI's `component` prop, etc.
- It's sometimes called the "polymorphic component" pattern — one component that can render as different element types
- Combine this with forwarded props (`...props`) for maximum flexibility — the consumer chooses the element type AND passes any attributes they want
