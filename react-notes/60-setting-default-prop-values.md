# Setting Default Prop Values

## Introduction

Our `Tabs` component accepts a `ButtonsContainer` prop so the consumer can choose which wrapper element to use. But in practice, most of the time, we probably want `<menu>`. Wouldn't it be nice to make that the **default** so we don't have to specify it every time? JavaScript destructuring makes this effortless.

---

## Default Values with Destructuring

When destructuring props, you can assign a **default value** using the `=` syntax:

```jsx
export default function Tabs({ buttons, children, ButtonsContainer = "menu" }) {
  return (
    <>
      <ButtonsContainer>{buttons}</ButtonsContainer>
      {children}
    </>
  );
}
```

Now:
- If the consumer sets `ButtonsContainer`, that value is used
- If the consumer **doesn't set it**, `"menu"` is used automatically

---

## Using the Component With and Without the Prop

```jsx
// Without specifying ButtonsContainer → uses "menu" by default
<Tabs buttons={...}>
  {tabContent}
</Tabs>

// Explicitly overriding to use a div
<Tabs ButtonsContainer="div" buttons={...}>
  {tabContent}
</Tabs>

// Using a custom component (if needed)
<Tabs ButtonsContainer={Section} buttons={...}>
  {tabContent}
</Tabs>
```

The component is easier to use in the common case but still fully flexible when needed.

---

## Default Values for Other Prop Types

This pattern works for any prop, not just component identifiers:

```jsx
function Button({ variant = "primary", size = "medium", children, ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...props}>
      {children}
    </button>
  );
}

// Usage
<Button>Click me</Button>                    // primary, medium
<Button variant="secondary">Cancel</Button>  // secondary, medium
<Button size="large">Submit</Button>          // primary, large
```

---

## When Default Values Apply

Default values kick in when a prop is `undefined` — which happens when:
- The prop isn't passed at all
- The prop is explicitly set to `undefined`

Note: Default values do **not** apply when a prop is `null`, `0`, `""`, or `false`. These are valid values, not "missing" values.

---

## ✅ Key Takeaways

- Use `= defaultValue` in prop destructuring to set defaults for optional props
- Default values make components **easier to use** in the common case while remaining configurable
- Defaults only apply when the prop is `undefined` (not passed or explicitly `undefined`)
- This is a standard JavaScript feature (default parameters), not a React-specific thing

## ⚠️ Common Mistakes

- **Expecting defaults for `null` or `false`**: These are intentional values, not the absence of a value — defaults won't override them
- **Setting defaults for required props**: If a prop is truly required, don't give it a default — let it fail visibly so the developer knows they forgot it

## 💡 Pro Tips

- Good defaults reduce the "props surface area" of your component — the fewer props someone needs to set, the easier the component is to use
- Consider which value is most commonly needed and make that the default
- Combine default props with TypeScript for even better developer experience — you get autocomplete AND sensible defaults
