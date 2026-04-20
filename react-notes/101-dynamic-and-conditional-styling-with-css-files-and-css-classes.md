# Dynamic & Conditional Styling with CSS Files & CSS Classes

## Introduction

Inline styles give you easy conditional styling but come with duplication and no separation of concerns. What if you could get conditional styling while keeping your CSS in separate files? You can—by **dynamically adding and removing CSS class names**. This is how most React apps handle conditional styling when using Vanilla CSS.

---

## Adding a Class Conditionally

### The Ternary Approach (Recommended)

```jsx
<input
  className={emailNotValid ? 'invalid' : undefined}
/>
```

- If `emailNotValid` is `true` → the `invalid` class is applied
- If `emailNotValid` is `false` → `className` gets `undefined`, which means no class is added

### Why NOT Use `&&`?

You might be tempted to use:

```jsx
<input className={emailNotValid && 'invalid'} />
```

This *technically* works, but when `emailNotValid` is `false`, the expression evaluates to `false` (a boolean), not `undefined` or an empty string. React will set `className="false"` on the element—which is invalid and triggers a console warning.

**Always use the ternary expression for conditional class names.**

---

## Combining Permanent and Conditional Classes

What if an element needs a class that's *always* applied AND a class that's *conditionally* applied?

### Using Template Literals

```jsx
<label className={`label ${emailNotValid ? 'invalid' : ''}`}>
  Email
</label>
```

Breaking this down:
- **Back ticks** (`` ` ``) create a template literal (a special kind of JavaScript string)
- `label` is always included in the string
- `${...}` injects a dynamic value
- If `emailNotValid` is `true` → the string becomes `"label invalid"`
- If `emailNotValid` is `false` → the string becomes `"label "` (just `label` with a trailing space, which is harmless)

### The CSS Side

```css
.label.invalid {
  color: #ef4444;
}
```

This rule targets elements that have **both** the `label` class AND the `invalid` class. Without `invalid`, only the default label styles apply.

---

## Applying to Multiple Elements

You can reuse the same pattern for different elements with different conditions:

```jsx
{/* Email */}
<label className={`label ${emailNotValid ? 'invalid' : ''}`}>Email</label>
<input className={emailNotValid ? 'invalid' : undefined} />

{/* Password */}
<label className={`label ${passwordNotValid ? 'invalid' : ''}`}>Password</label>
<input className={passwordNotValid ? 'invalid' : undefined} />
```

Each element independently checks its own condition and applies (or removes) the `invalid` class.

---

## How It Works in Practice

1. User submits the form → `emailNotValid` and `passwordNotValid` are computed
2. React re-renders the component with the new class names
3. The CSS rules for `.invalid` kick in (red text, red border, red background)
4. User corrects the input → the condition becomes `false` → the `invalid` class is removed → styles return to normal

---

## ✅ Key Takeaways

- Use **ternary expressions** to conditionally add class names: `condition ? 'class' : undefined`
- Use **template literals** to combine permanent and conditional classes: `` `permanent ${condition ? 'conditional' : ''}` ``
- The `&&` operator for class names can produce warnings—prefer ternary
- CSS classes are the most common way to handle conditional styling in Vanilla CSS React apps

## ⚠️ Common Mistakes

- Using `&&` for conditional class names—it can assign `false` as a class value
- Forgetting the `${}` syntax inside template literals
- Not providing the `else` branch of the ternary (always include the fallback, even if it's an empty string)

## 💡 Pro Tips

- For complex class name logic with many conditions, consider the `classnames` or `clsx` utility libraries—they let you write: `clsx('label', { invalid: emailNotValid })`
- Template literals are a JavaScript feature, not a React feature—learn them well, they're used everywhere
- Keep your conditional class names simple—if the logic gets complex, extract it into a variable above the JSX
