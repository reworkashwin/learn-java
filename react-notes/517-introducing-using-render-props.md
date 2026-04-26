# Introducing & Using Render Props

## Introduction

You've mastered Compound Components — now it's time for another powerful pattern: **Render Props**. This pattern solves a very specific problem: what do you do when a component is great at *logic* but shouldn't dictate *how things look*?

Imagine you build a component that knows how to search and filter data. But the data could be anything — places, users, products, simple strings. How do you let the parent decide what each item looks like? That's where Render Props come in.

---

## Concept 1: What Are Render Props?

### 🧠 What is it?

The **Render Props pattern** is when you pass a **function** as a prop (typically `children`) to a component. That function returns JSX, and the receiving component calls it to render content.

In other words: the child tells the parent "give me a function, and I'll call it with data — you decide what to render."

### ❓ Why do we need it?

Consider this scenario:
- You build a `SearchableList` component that handles filtering logic
- You want to reuse it for different types of data (objects, strings, complex structures)
- You **don't** want the SearchableList to know how to render each type of data

Without Render Props, you'd have to build separate list components for each data type. With Render Props, you build the logic **once** and let the consumer decide how to render.

### ⚙️ How it works

The core idea in three steps:

1. **Component A** (the consumer) passes a function between the tags of **Component B**
2. **Component B** (the logic component) calls that function with data
3. The function returns JSX that Component B renders

```
Parent (defines the render function)
  └─→ passes function as `children`
        └─→ Child (calls the function with data)
              └─→ Function returns JSX → rendered!
```

### 💡 Insight

The name "Render Props" comes from the fact that you're passing a prop (usually `children`) whose value is a **function that renders something**. Before hooks existed, this was one of the primary ways to share logic between components.

---

## Concept 2: Building a SearchableList Component

### 🧠 What is it?

A reusable component that:
- Accepts a list of items
- Provides a search input
- Filters items based on the search term
- Delegates *rendering* of each item to the consumer

### ⚙️ How it works

```jsx
export default function SearchableList({ items, children }) {
  const [searchTerm, setSearchTerm] = useState('');

  function handleChange(event) {
    setSearchTerm(event.target.value);
  }

  const searchResults = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="searchable-list">
      <input type="search" placeholder="Search" onChange={handleChange} />
      <ul>
        {searchResults.map((item, index) => (
          <li key={index}>{children(item)}</li>
        ))}
      </ul>
    </div>
  );
}
```

**The magic line:** `{children(item)}`

This is where Render Props happen. Instead of rendering `item` directly (which won't work for complex objects), we **call `children` as a function**, passing the current `item`. Whatever the function returns becomes the rendered content.

### 💡 Insight

Notice how `SearchableList` has **zero knowledge** of what the items look like. It only knows how to filter them. The rendering is completely delegated to whoever uses the component.

---

## Concept 3: Using Render Props in the Consumer

### 🧠 What is it?

The consumer (App component) passes a function between the `SearchableList` tags. This function receives each item and returns the JSX for that item.

### ⚙️ How it works

**For complex objects (places with images, titles, etc.):**
```jsx
<SearchableList items={PLACES}>
  {(item) => <Place item={item} />}
</SearchableList>
```

**For simple strings:**
```jsx
<SearchableList items={['item one', 'item two', 'item three']}>
  {(item) => item}
</SearchableList>
```

### 🧪 Example

The same `SearchableList` component renders both complex place cards and simple text — all because the rendering logic is externalized through Render Props:

```jsx
{/* Renders Place cards */}
<SearchableList items={PLACES}>
  {(item) => <Place item={item} />}
</SearchableList>

{/* Renders plain text */}
<SearchableList items={['item one', 'item two', 'item three']}>
  {(item) => item}
</SearchableList>
```

### 💡 Insight

This is remarkably similar to how `Array.map()` works in JavaScript. You pass a function to `.map()`, and it calls that function for each element, using the return value. Render Props apply the same principle to React components.

---

## ✅ Key Takeaways

- **Render Props** = passing a function as `children` (or another prop) that returns JSX
- The receiving component calls that function with data — the consumer decides what to render
- This pattern separates **logic** (filtering, sorting, fetching) from **presentation** (how items look)
- The same component can render completely different UI for different data types
- `children(item)` is the key syntax — calling `children` as a function

## ⚠️ Common Mistakes

- Forgetting that `children` must be a **function**, not JSX markup — `<SearchableList><p>hello</p></SearchableList>` won't work with this pattern
- Not handling the case where `children` might not be a function — add validation if the component is part of a shared library
- Using `toString()` to display complex objects — that's a code smell indicating you need Render Props

## 💡 Pro Tips

- Render Props are less common now that we have hooks, but they're still the right tool when the *rendering* is what needs to be externalized
- You can use Render Props with any prop name, not just `children` — but `children` is the most ergonomic
- Think of Render Props as "inversion of control" — you're letting the consumer control what gets rendered
