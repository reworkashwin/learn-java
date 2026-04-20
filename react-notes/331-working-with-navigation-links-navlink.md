# Working with Navigation Links (NavLink)

## Introduction

You've got your routes set up, your pages rendering, and your links working. But something feels off — when you click a link and land on a page, there's **no visual indication** of which link is currently active. The user has to look at the URL bar or the page content to figure out where they are. That's a terrible user experience, and it's such a common need that React Router provides a dedicated component for it: **NavLink**.

---

## The Problem: No Active Link Feedback

With the regular `Link` component, you get navigation — but you don't get any visual feedback about the **currently active** link. In most real-world applications, the active navigation link is highlighted (different color, underline, bold, etc.) to orient the user.

Think about any website you use — Amazon, GitHub, YouTube — they all highlight the active section in the nav bar. It's a fundamental UX pattern.

---

## Setting Up Hover and Active Styles

Before we even switch components, we can prepare our CSS. In a CSS module file (e.g., `MainNavigation.module.css`), we can define styles for both hover effects and an `.active` class:

```css
.list a:hover,
.list a.active {
  color: var(--color-primary-800);
  text-decoration: underline;
}
```

Since the `Link` component (and `NavLink`) renders a regular `<a>` element under the hood, we target anchor tags directly. The hover gives immediate feedback on mouseover, and the `.active` class will be applied conditionally based on the current route.

---

## Enter NavLink: The Active-Aware Link

React Router provides `NavLink` as a drop-in replacement for `Link`. It works exactly like `Link`, but with one key superpower: **it knows whether it's active**.

```jsx
import { NavLink } from 'react-router-dom';
```

### How className Works on NavLink

Here's where it gets interesting. On a regular element, `className` takes a string. On `NavLink`, **`className` takes a function**:

```jsx
<NavLink
  to="/"
  className={({ isActive }) =>
    isActive ? classes.active : undefined
  }
>
  Home
</NavLink>
```

React Router automatically calls this function and passes an object with an `isActive` boolean. If the link's path matches the currently active route, `isActive` is `true`. You use that to conditionally apply CSS classes.

### Why a Function Instead of a String?

Because the active state is **dynamic** — it changes as the user navigates. A static string can't express conditional logic. The function pattern lets you compute the class name based on the current routing state.

---

## The `end` Prop: Fixing the "Always Active" Problem

There's a subtle gotcha. By default, `NavLink` considers a link active if the **current route starts with** the link's path. This means a link to `/` (the root) is considered active for **every** route — because every URL starts with `/`.

```jsx
{/* This would ALWAYS be active */}
<NavLink to="/">Home</NavLink>

{/* Fix: add the end prop */}
<NavLink to="/" end>Home</NavLink>
```

The `end` prop tells React Router: "Only consider this link active if the current route **ends** with this path." So `/` is only active when you're on exactly `/`, not on `/products` or `/about`.

You typically only need `end` on the root (`/`) link. Other links like `/products` don't need it because you usually don't have other routes that start with `/products` (unless you have nested routes, in which case the default start-with behavior is actually desirable).

---

## Inline Styles Also Supported

If you prefer inline styles over CSS classes, `NavLink` supports the same function pattern on the `style` prop:

```jsx
<NavLink
  to="/products"
  style={({ isActive }) => ({
    textDecoration: isActive ? 'underline' : 'none',
    color: isActive ? '#1a8fff' : 'white',
  })}
>
  Products
</NavLink>
```

Same concept — you get `isActive` and return a style object conditionally.

---

## ✅ Key Takeaways

- `NavLink` is a drop-in replacement for `Link` that supports active state detection
- `className` on `NavLink` takes a **function** that receives `{ isActive }`
- The `end` prop ensures a link is only active when the URL **exactly** matches (critical for root paths)
- Inline `style` also supports the same function pattern

## ⚠️ Common Mistakes

- Forgetting to add `end` on the root `/` NavLink — this makes it always appear active
- Using `className` as a string on `NavLink` instead of a function — it won't break but you lose the active-state feature
- Trying to manually track active state with `useLocation` when `NavLink` already handles it

## 💡 Pro Tip

The default "starts with" matching behavior exists intentionally — for **nested routes**. If you have `/settings` and `/settings/profile` and `/settings/security`, a `NavLink` to `/settings` will stay highlighted across all sub-pages. That's usually exactly what you want for section-level navigation.
