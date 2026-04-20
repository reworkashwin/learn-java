# Dynamic & Conditional Styling with Styled Components

## Introduction

Styled components don't just apply static styles—they can dynamically change styles based on props. This is where styled components truly shine: you pass a prop to your styled component, and inside the style definition, you use that prop to compute CSS values. No CSS classes to toggle, no ternary expressions in `className`—just clean, prop-driven styles.

---

## The Concept

Instead of conditionally adding a CSS class:

```jsx
// Vanilla CSS approach
<label className={emailNotValid ? 'invalid' : ''}>Email</label>
```

With styled components, you pass a **custom prop** and use it inside the style definition:

```jsx
// Styled Components approach
<Label $invalid={emailNotValid}>Email</Label>
```

The `$invalid` prop drives the styling from within the styled component itself.

---

## How to Use Props in Styled Components

### Step 1: Pass a Prop

```jsx
<Label $invalid={emailNotValid}>Email</Label>
<Input $invalid={emailNotValid} type="email" onChange={...} />
```

### Step 2: Use the Prop Inside the Styles

Inside the tagged template literal, you inject a **function** that receives the component's props:

```jsx
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $invalid }) => ($invalid ? '#f87171' : '#6b7280')};
`;
```

Let's unpack this:

1. **`${...}`** — Template literal injection syntax
2. **`({ $invalid }) => ...`** — An arrow function that destructures the `props` object to get `$invalid`
3. The styled-components package **calls this function** with the component's props
4. The function returns the CSS value to use based on the prop

### Step 3: Apply the Same Pattern for Multiple Properties

```jsx
const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${({ $invalid }) => ($invalid ? '#fed2d2' : '#d1d5db')};
  color: ${({ $invalid }) => ($invalid ? '#ef4444' : '#374151')};
  border: 1px solid ${({ $invalid }) => ($invalid ? '#f87171' : 'transparent')};
  border-radius: 0.25rem;
`;
```

Each CSS property can independently check the prop and return the appropriate value.

---

## Why the `$` Prefix?

Notice the dollar sign on `$invalid`:

```jsx
<Input $invalid={emailNotValid} />
```

This is a **styled-components convention**. The `$` prefix tells the package: "This prop is for styling only—don't forward it to the underlying HTML element."

Without the `$`, the prop would be forwarded to the `<input>` element:

```html
<!-- Without $ prefix: prop leaks to the DOM -->
<input invalid="true" ...>  <!-- ⚠️ React warning: "invalid" is a built-in prop -->

<!-- With $ prefix: prop stays in styled-components -->
<input ...>  <!-- ✅ Clean DOM, no warnings -->
```

This is especially important for the word "invalid" because HTML inputs have a built-in `invalid` attribute.

---

## Reusing Styled Components with Different Props

The same styled component works for both email and password fields—just pass different prop values:

```jsx
{/* Email */}
<Label $invalid={emailNotValid}>Email</Label>
<Input $invalid={emailNotValid} type="email" onChange={...} />

{/* Password */}
<Label $invalid={passwordNotValid}>Password</Label>
<Input $invalid={passwordNotValid} type="password" onChange={...} />
```

Same components, same styles, different conditions. No duplication of CSS logic.

---

## How It Works Under the Hood

When a prop changes, styled-components:
1. Re-executes the injected functions with the new props
2. Generates a new CSS class with the updated values
3. Swaps the class on the element

This happens efficiently—only the changed styles are recalculated.

---

## Compared to Other Approaches

| Feature | Inline Styles | Vanilla CSS Classes | Styled Components |
|---------|--------------|-------------------|------------------|
| Scoped | ✅ Per element | ❌ Global | ✅ Per component |
| Dynamic | ✅ Easy | 🟡 Class toggling | ✅ Prop-driven |
| Reusable | ❌ Copy-paste | ✅ Via classes | ✅ Via components |
| CSS features | ❌ Limited | ✅ Full | ✅ Full |
| Separation | ❌ Mixed in JSX | ✅ Separate files | 🟡 Same file, outside JSX |

---

## ✅ Key Takeaways

- Pass custom props (prefixed with `$`) to styled components for dynamic styling
- Inside the style definition, use `${(props) => ...}` to compute CSS values based on props
- Styled-components re-evaluates these functions on every render with new prop values
- The `$` prefix prevents props from leaking to the DOM

## ⚠️ Common Mistakes

- Forgetting the `$` prefix and getting DOM warnings about unknown attributes
- Injecting a static value instead of a function—styled-components needs a function to access props
- Using `props.invalid` without destructuring—it works but `({ $invalid }) =>` is cleaner

## 💡 Pro Tips

- You can inject multiple functions in the same template literal—one for each dynamic property
- Styled components support pseudo-classes and media queries: use `&:hover`, `&:focus`, `@media (...)` etc. inside the backticks
- For complex conditional logic, extract the function: `const getColor = ({ $invalid }) => $invalid ? 'red' : 'gray'`
- The `&` symbol refers to the component itself, just like in SCSS/Sass
