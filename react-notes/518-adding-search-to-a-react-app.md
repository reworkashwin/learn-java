# Adding Search to a React App

## Introduction

Search is one of the most common features in web applications. Whether it's filtering a product catalog, searching through user profiles, or narrowing down a list of places — the core logic is the same. In this lesson, you'll build the search functionality for the `SearchableList` component, learning how to manage the search term state and derive filtered results.

---

## Concept 1: Managing the Search Term State

### 🧠 What is it?

The search term is a piece of **UI state** that represents what the user has typed into the search input. Every keystroke updates this state, and the filtered results are derived from it.

### ⚙️ How it works

```jsx
const [searchTerm, setSearchTerm] = useState('');

function handleChange(event) {
  setSearchTerm(event.target.value);
}
```

- `searchTerm` starts as an empty string
- Every time the user types, `handleChange` fires via the `onChange` event
- `event.target.value` gives us the current text in the input
- The state is updated, triggering a re-render

### 💡 Insight

This is a **controlled input** pattern — React owns the state, and the input reflects that state. It's the standard approach for form inputs in React.

---

## Concept 2: Deriving Search Results

### 🧠 What is it?

Instead of storing the filtered results in a separate state variable, you **derive** them from the existing `items` and `searchTerm`. This is called **derived state** — and it's a fundamental React pattern.

### ❓ Why do we need it?

Why not store filtered results in another `useState`? Because:
- It creates **redundant state** — the filtered results can always be computed from `items` + `searchTerm`
- It leads to **sync issues** — you'd have to remember to update the filtered results every time items or the search term changes
- It's **unnecessary work** — React re-renders when state changes anyway, so deriving is free

### ⚙️ How it works

```jsx
const searchResults = items.filter((item) =>
  JSON.stringify(item)
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
```

**Step by step:**
1. Take all `items` received via props
2. Call `.filter()` to keep only matching items
3. For each item, convert it to a string with `JSON.stringify()` — this works for both simple strings and complex objects
4. Convert to lowercase for case-insensitive matching
5. Check if the stringified item `.includes()` the lowercase search term

### 🧪 Example

If `items` is:
```js
[
  { title: "African Safari", description: "..." },
  { title: "Paris Tour", description: "..." }
]
```

And `searchTerm` is `"african"`:
- `JSON.stringify(item1)` → `'{"title":"African Safari","description":"..."}'`
- `.toLowerCase()` → `'{"title":"african safari","description":"..."}'`
- `.includes("african")` → `true` ✅
- Item 1 is kept, Item 2 is filtered out

### 💡 Insight

`JSON.stringify()` is a clever trick for universal search — it lets you search across *all* fields of an object without knowing the object's structure. For production apps, you might want a more refined approach (like searching specific fields), but this is a great starting point.

---

## Concept 3: Rendering the Results

### 🧠 What is it?

The filtered results are mapped to list items and rendered inside a `<ul>`. At this point, the rendering is basic — you'll improve it with Render Props.

### ⚙️ How it works

```jsx
<ul>
  {searchResults.map((item, index) => (
    <li key={index}>{children(item)}</li>
  ))}
</ul>
```

The search results replace the original items array — only matching items are displayed.

---

## ✅ Key Takeaways

- Search term is managed as **UI state** with `useState`
- Filtered results are **derived**, not stored in separate state
- `JSON.stringify()` enables searching across all fields of any object
- Case-insensitive search is achieved by converting both sides to lowercase
- Derived state is recalculated on every render — no manual syncing needed

## ⚠️ Common Mistakes

- Storing filtered results in a separate `useState` — this creates redundant, hard-to-sync state
- Forgetting case-insensitive comparison — users expect "African" and "african" to match
- Not handling non-string items — `JSON.stringify()` solves this by converting everything to a string

## 💡 Pro Tips

- `JSON.stringify()` is great for prototypes; for production, consider libraries like Fuse.js for fuzzy search
- Always derive state when possible — it's simpler, less buggy, and more performant
- The `type="search"` input gives you a built-in clear button in most browsers — use it!
