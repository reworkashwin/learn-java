# Outputting List Data Dynamically

## Introduction

Our app works great, but there's a sneaky problem in the code. We're manually repeating `<CoreConcept />` four times — once for each item in our data array. What happens if someone adds a fifth item? Or removes one? The UI would break or be incomplete. In React, **you should derive your UI from data**, not hardcode it.

This is where dynamic list rendering with `.map()` comes in — one of the most commonly used patterns in React.

---

## The Problem with Hardcoding

```jsx
<CoreConcept
  image={CORE_CONCEPTS[0].image}
  title={CORE_CONCEPTS[0].title}
  description={CORE_CONCEPTS[0].description}
/>
<CoreConcept
  image={CORE_CONCEPTS[1].image}
  title={CORE_CONCEPTS[1].title}
  description={CORE_CONCEPTS[1].description}
/>
{/* ... and so on */}
```

Two problems:
1. **Repetitive code** — you're writing the same thing four times
2. **Fragile** — if the data changes (items added/removed), the UI doesn't adapt

---

## JSX Can Render Arrays

Before jumping to the solution, here's a key insight: **JSX can render arrays**.

```jsx
{["Hello", " ", "World"]}  // Renders: Hello World

{[<p>Hello</p>, <p>World</p>]}  // Renders two paragraphs
```

If JSX can render an array of elements, and we have an array of data... we just need to **transform** our data array into an array of JSX elements!

---

## The `.map()` Solution

JavaScript's `Array.map()` method creates a new array by transforming each item in the original array:

```jsx
<ul>
  {CORE_CONCEPTS.map((conceptItem) => (
    <CoreConcept key={conceptItem.title} {...conceptItem} />
  ))}
</ul>
```

Here's what's happening:
1. `.map()` iterates over every item in `CORE_CONCEPTS`
2. For each item, it calls our arrow function, passing the item as `conceptItem`
3. We return a `<CoreConcept />` element configured with that item's data
4. `.map()` collects all the returned elements into a new array
5. JSX renders that array of elements

Now if someone adds or removes items from `CORE_CONCEPTS`, the UI automatically adjusts. No code changes needed.

---

## The `key` Prop — A Must-Have for Lists

When rendering lists, React gives you a warning:

> "Each child in a list should have a unique `key` prop."

The `key` prop is a **special prop understood by React** — you don't use it inside your component. React uses it internally to efficiently track, update, and reorder list items.

```jsx
<CoreConcept key={conceptItem.title} {...conceptItem} />
```

### Rules for Keys:
- Must be **unique** among siblings (not globally, just within the same list)
- Should be **stable** — don't use array index if items can be reordered or removed
- A unique identifier from your data (like `title`, `id`, or `slug`) is ideal

---

## The Full Pattern

```jsx
// Before: Manual, repetitive, fragile
<CoreConcept image={CORE_CONCEPTS[0].image} title={CORE_CONCEPTS[0].title} ... />
<CoreConcept image={CORE_CONCEPTS[1].image} title={CORE_CONCEPTS[1].title} ... />
<CoreConcept image={CORE_CONCEPTS[2].image} title={CORE_CONCEPTS[2].title} ... />
<CoreConcept image={CORE_CONCEPTS[3].image} title={CORE_CONCEPTS[3].title} ... />

// After: Dynamic, clean, resilient
{CORE_CONCEPTS.map((item) => (
  <CoreConcept key={item.title} {...item} />
))}
```

---

## ✅ Key Takeaways

- Use `.map()` to transform data arrays into arrays of JSX elements — this is the standard React pattern for rendering lists
- JSX can natively render arrays of elements
- Always add a `key` prop to list items — React needs it for efficient rendering
- Keys should be unique and stable (ideally from your data, not array indices)
- Dynamic lists automatically adapt when the underlying data changes

## ⚠️ Common Mistakes

- **Forgetting the `key` prop**: React won't crash, but you'll get a console warning and potentially buggy behavior with state in list items
- **Using array index as key**: `key={index}` works for static lists but causes bugs if items can be reordered, inserted, or removed
- **Not returning JSX from `.map()`**: If you use curly braces `{}` in your arrow function instead of parentheses `()`, you need an explicit `return` statement

## 💡 Pro Tips

- The spread operator (`{...item}`) is perfect when your data object properties match your component's expected props — it saves you from writing out each prop individually
- You'll use `.map()` in almost every React project — for navigation items, card lists, table rows, dropdown options, and much more
- If you need to filter AND map, chain them: `data.filter(...).map(...)`
