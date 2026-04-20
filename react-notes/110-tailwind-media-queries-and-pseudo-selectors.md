# Tailwind: Media Queries & Pseudo Selectors

## Introduction

Two essential CSS features you need in every real app: **responsive design** (media queries) and **interactive states** (pseudo selectors like `:hover`). How does Tailwind handle these? With elegant **prefix modifiers** that you can add to any utility class.

---

## Responsive Design with Breakpoint Prefixes

In standard CSS, you'd write a media query block:

```css
@media (min-width: 768px) {
  .header { margin-bottom: 4rem; }
}
```

In Tailwind, you just **prefix** the utility class with a breakpoint name:

```jsx
<header className="mb-8 md:mb-16">
```

This reads as:
- `mb-8` → margin-bottom of 2rem (always applied, the default)
- `md:mb-16` → margin-bottom of 4rem (only on medium screens and up)

### How It Works

Tailwind uses a **mobile-first** approach. The base classes (no prefix) apply to all screen sizes. Prefixed classes kick in at that breakpoint and above:

| Prefix | Min Width | Meaning |
|--------|-----------|---------|
| `sm:` | 640px | Small screens |
| `md:` | 768px | Medium screens |
| `lg:` | 1024px | Large screens |
| `xl:` | 1280px | Extra large |
| `2xl:` | 1536px | 2x extra large |

### Practical Example

```jsx
<header className="flex flex-col items-center mt-8 mb-8 md:mb-16">
  <h1 className="text-xl md:text-4xl font-semibold text-amber-800">
    ReactArt
  </h1>
</header>
```

- On small screens: `text-xl` (smaller text) and `mb-8` (less margin)
- On medium+ screens: `text-4xl` (bigger text) and `mb-16` (more margin)

The pattern is always: **default first, then override with the breakpoint prefix**.

---

## Pseudo Selectors with State Prefixes

The same prefix pattern works for interactive states like hover, focus, and active:

```jsx
<button className="bg-amber-400 hover:bg-amber-500">
  Sign In
</button>
```

- `bg-amber-400` → default background color
- `hover:bg-amber-500` → darker background when hovering

### Common State Prefixes

| Prefix | Pseudo Selector | Usage |
|--------|----------------|-------|
| `hover:` | `:hover` | Mouse over |
| `focus:` | `:focus` | Element focused (keyboard/click) |
| `active:` | `:active` | Being clicked |
| `disabled:` | `:disabled` | Disabled state |
| `first:` | `:first-child` | First child element |
| `last:` | `:last-child` | Last child element |

---

## Building a Button Component with Tailwind

Here's a complete reusable button with hover styling:

```jsx
// Button.jsx
export default function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 font-semibold uppercase rounded text-stone-900 bg-amber-400 hover:bg-amber-500"
      {...props}
    >
      {children}
    </button>
  );
}
```

Breaking down each class:
- `px-4` → `padding-left: 1rem; padding-right: 1rem`
- `py-2` → `padding-top: 0.5rem; padding-bottom: 0.5rem`
- `font-semibold` → `font-weight: 600`
- `uppercase` → `text-transform: uppercase`
- `rounded` → `border-radius: 0.25rem`
- `text-stone-900` → dark text color
- `bg-amber-400` → amber background
- `hover:bg-amber-500` → darker amber on hover

---

## The Pattern: Prefix + Utility Class

Both responsive breakpoints and pseudo selectors follow the same mental model:

```
{condition}:{utility-class}
```

- `md:text-4xl` → apply `text-4xl` at medium breakpoint
- `hover:bg-amber-500` → apply `bg-amber-500` on hover
- `focus:ring-2` → apply `ring-2` on focus
- `lg:hover:bg-red-500` → on large screens, apply red background on hover

You can even **chain** prefixes for more specific conditions.

---

## ✅ Key Takeaways

- Use **breakpoint prefixes** (`sm:`, `md:`, `lg:`, etc.) for responsive design
- Tailwind is **mobile-first**: unprefixed classes apply everywhere, prefixed classes apply at that breakpoint and up
- Use **state prefixes** (`hover:`, `focus:`, `active:`, etc.) for pseudo selectors
- The pattern is consistent: `{prefix}:{utility-class}`
- Prefixes can be **chained**: `md:hover:bg-red-500`
- Wrap Tailwind-styled elements in reusable components to avoid repeating long class lists

## ⚠️ Common Mistake

Setting the "default" style as the large-screen style and then trying to override for mobile. Tailwind is **mobile-first** — always start with the base (mobile) style and then add breakpoint prefixes for larger screens.
