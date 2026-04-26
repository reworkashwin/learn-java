# Implementing Search Functionality with Render Props

## Introduction

The search logic works — but the rendering is ugly. Complex objects show up as `[object Object]`, and there's no way for the `SearchableList` to know how each type of data should be displayed. This is exactly the problem **Render Props** solve. In this lesson, you'll wire up Render Props to let the consumer decide how each search result is rendered.

---

## Concept 1: The Rendering Problem

### 🧠 What is it?

The `SearchableList` component is data-agnostic — it works with any type of data (strings, objects, arrays). But that means it also doesn't know *how* to display that data. Calling `item.toString()` on an object gives you `[object Object]`, which is useless.

### ❓ Why do we need Render Props here?

The component that *uses* `SearchableList` knows what the data looks like. The parent knows that places have titles and images, and that strings should be displayed as-is. So the **parent** should decide how to render — not the list.

---

## Concept 2: Using `children` as a Render Function

### 🧠 What is it?

Instead of outputting `children` as static markup, you call it **as a function**, passing each item to it. The function returns the JSX for that specific item.

### ⚙️ How it works

Inside `SearchableList`:

```jsx
<ul>
  {searchResults.map((item, index) => (
    <li key={index}>
      {children(item)}  {/* Call children as a function! */}
    </li>
  ))}
</ul>
```

The `children` prop is no longer JSX — it's a function that:
1. Receives an `item` argument
2. Returns JSX specific to that item
3. Gets called once per item in the filtered results

### 💡 Insight

This flips the normal usage of `children` on its head. Normally, `children` is static content. With Render Props, `children` becomes a **callback function** that the component invokes with data.

---

## Concept 3: Passing the Render Function from the Consumer

### 🧠 What is it?

The consumer (App component) defines what each item should look like by passing a function between the `SearchableList` tags.

### ⚙️ How it works

**For places (complex objects):**
```jsx
import Place from './Place';

<SearchableList items={PLACES}>
  {(item) => <Place item={item} />}
</SearchableList>
```

The `Place` component knows how to render a place — it displays the image, title, and description. The `SearchableList` doesn't need to know any of that.

**For plain strings:**
```jsx
<SearchableList items={['item one', 'item two', 'item three']}>
  {(item) => item}
</SearchableList>
```

For strings, the render function simply returns the string itself. No wrapping component needed.

### 🧪 Example

With both lists on the same page:

```jsx
<section>
  {/* Complex data with custom rendering */}
  <SearchableList items={PLACES}>
    {(item) => <Place item={item} />}
  </SearchableList>

  {/* Simple data with minimal rendering */}
  <SearchableList items={['item one', 'item two', 'item three']}>
    {(item) => item}
  </SearchableList>
</section>
```

Now searching "african" in the first list shows only the African Safari card (with full image and description), while searching "one" in the second list shows just "item one" as plain text.

### 💡 Insight

This is the beauty of Render Props — the **same component** handles two completely different rendering scenarios. The logic (searching/filtering) is reused; only the presentation changes.

---

## ✅ Key Takeaways

- Render Props solve the "data-agnostic rendering" problem — the component handles logic, the consumer handles presentation
- `children(item)` is the key syntax — you call `children` as a function and pass data to it
- The consumer defines the render function between the component's opening and closing tags
- The same `SearchableList` can render complex card layouts and simple text — all through Render Props
- This pattern enables true **separation of concerns**: logic vs. presentation

## ⚠️ Common Mistakes

- Passing JSX markup instead of a function as `children` — this will crash when the component tries to call `children(item)`
- Forgetting to return JSX from the render function — the function must return something renderable
- Trying to make the list component handle rendering for all data types — that defeats the purpose of Render Props

## 💡 Pro Tips

- Render Props + TypeScript is a great combo — you can type the render function to ensure type safety: `children: (item: T) => ReactNode`
- If you find yourself writing `if (dataType === 'place') renderPlace()` inside a component, you need Render Props
- This pattern is the foundation of many headless component libraries
