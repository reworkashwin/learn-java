# Working with Multiple JSX Slots

## Introduction

The `children` prop gives you one "slot" to pass JSX content into a component. But what if your component needs **two or more separate areas** for custom content? Think of a tabs component: it needs one slot for the tab buttons and another for the tab content. React handles this beautifully through **custom props that accept JSX values**.

---

## Building a Reusable Tabs Component

Imagine a `Tabs` component that enforces this structure:
- A `<menu>` wrapping the tab buttons
- Below that, the tab content

```jsx
export default function Tabs({ children, buttons }) {
  return (
    <>
      <menu>{buttons}</menu>
      {children}
    </>
  );
}
```

Two slots:
- `buttons` — a **custom prop** that receives JSX for the tab buttons
- `children` — the **special built-in prop** that receives the content between the opening and closing tags

---

## Using the Component

```jsx
<Tabs
  buttons={
    <>
      <TabButton isSelected={selectedTopic === 'components'} onClick={() => handleSelect('components')}>
        Components
      </TabButton>
      <TabButton isSelected={selectedTopic === 'jsx'} onClick={() => handleSelect('jsx')}>
        JSX
      </TabButton>
      {/* more buttons */}
    </>
  }
>
  {tabContent}
</Tabs>
```

### What's Happening Here:

1. **`buttons` prop**: We pass all our `TabButton` components as the value. Since we're passing multiple sibling elements, we wrap them in a Fragment (`<>...</>`)
2. **`children`**: The `{tabContent}` variable (our conditionally-determined content) goes between the opening and closing `<Tabs>` tags

---

## Why Not Just Use `children` for Everything?

You might wonder — can't we just put everything between the tags? The problem is that `children` is a **single slot**. If our component needs to place different content in different locations within its JSX structure (buttons inside `<menu>`, content outside of it), one slot isn't enough.

### Alternative: Manage Inside the Component?

We could move the tab buttons and their logic inside `Tabs`, but that would mean:
- `Tabs` would need to know about topics, selected states, and click handlers
- It would lose reusability — you couldn't use it for non-topic tabs
- The component that owns the state would be separated from the components that use it

Keeping `Tabs` "dumb" (it only enforces structure) makes it reusable anywhere.

---

## The Key Insight: JSX Is Just a Value

This pattern works because **JSX elements are regular JavaScript values**. You can:
- Store them in variables: `let content = <p>Hello</p>;`
- Pass them as props: `<Tabs buttons={<Button>Click</Button>} />`
- Return them from functions
- Put them in arrays

There's nothing special about `children` — it's just a prop whose value happens to come from between your tags. Any other prop can receive JSX too!

---

## Scaling to More Slots

You're not limited to two slots. A complex layout component might have several:

```jsx
function PageLayout({ header, sidebar, children, footer }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}
```

Each prop is an independent "slot" for JSX content.

---

## ✅ Key Takeaways

- `children` gives you one slot; **custom props** give you as many additional slots as you need
- JSX elements are regular values — they can be passed as props just like strings or numbers
- When passing multiple sibling elements as a prop value, wrap them in a **Fragment** (`<>...</>`)
- "Dumb" wrapper components that only enforce structure (without managing data) are highly reusable

## ⚠️ Common Mistakes

- **Passing sibling elements without a wrapper**: Multiple JSX siblings as a single prop value need a Fragment wrapper — the one-root-element rule applies here too
- **Overcomplicating with too many slots**: If your component needs 5+ slots, consider if it should be split into smaller components instead
- **Confusing props with children**: Remember, `children` comes from content between tags; everything else must be set as an explicit prop

## 💡 Pro Tips

- This "multiple slots" pattern is how component libraries build flexible layouts — think of card headers, body, and footers in UI frameworks
- Named slots through props are more explicit and readable than trying to parse `children` into multiple parts
- If you're coming from Vue, this is React's equivalent of named slots
