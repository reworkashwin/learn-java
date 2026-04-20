# Problem: Props Are Not Forwarded To Inner Elements

## Introduction

Our app is working well with its clean component structure. Now let's build a **reusable wrapper component** — and in doing so, discover an important React behavior: **props set on a custom component are NOT automatically forwarded to the elements inside it**.

---

## Building a Reusable Section Component

Both our `CoreConcepts` and `Examples` components follow the same JSX pattern:

```jsx
<section id="...">
  <h2>Title</h2>
  {/* content */}
</section>
```

Why not create a reusable `Section` component that enforces this structure?

```jsx
export default function Section({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

Now we can use it:

```jsx
<Section title="Examples" id="examples">
  {/* tab buttons and content */}
</Section>
```

---

## The Problem: Styling Breaks!

After replacing `<section>` with our custom `<Section>`, the styling breaks. The tabs look wrong, the layout is off.

Why? Because in our CSS, we have rules targeting `#examples`:

```css
#examples h2 { /* styling */ }
#examples menu { /* styling */ }
```

We're setting `id="examples"` on our `<Section>` component — but that `id` **never reaches the actual `<section>` element** in the DOM!

---

## Why Props Don't Forward Automatically

This is a fundamental React principle:

> **React does NOT automatically forward props from a custom component to its inner elements.**

When you write:

```jsx
<Section title="Examples" id="examples">
```

React passes `title`, `id`, and `children` as props to the `Section` **function**. But inside that function, we only destructure and use `title` and `children`. The `id` prop is simply **ignored and lost**.

There's no magic connection between `<Section id="examples">` and the `<section>` element inside the component. You, the developer, must explicitly pass every prop you want to appear on inner elements.

---

## The Manual Fix (Not Scalable)

You could manually destructure and apply each prop:

```jsx
export default function Section({ title, children, id, className }) {
  return (
    <section id={id} className={className}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

This works, but every time you want to support a new attribute (`style`, `onClick`, `data-*`, etc.), you'd have to add it to the destructuring AND to the element. Not scalable.

---

## ✅ Key Takeaways

- Custom component props are **not forwarded** to inner DOM elements — this is by design, not a bug
- You must explicitly pass every prop to the inner element where it should appear
- Manually forwarding each prop works but doesn't scale
- The solution is a pattern called "forwarded props" (covered in the next lecture)

## ⚠️ Common Mistakes

- **Assuming props "pass through"**: Setting `className` on a custom component doesn't add that class to anything in the DOM unless you explicitly use it
- **Debugging styling issues without checking props**: If your CSS targeting element IDs or classes stops working after refactoring to custom components, check if the props are actually being applied to the DOM elements

## 💡 Pro Tips

- This behavior makes React **predictable** — you always know exactly where each prop goes
- Think of custom components as a **boundary** — nothing crosses that boundary automatically
- The next lecture introduces the "forwarding props" pattern that solves this elegantly
