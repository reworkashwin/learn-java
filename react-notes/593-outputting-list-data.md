# Outputting List Data

## Introduction

We can add posts to our state array. But how do we actually *display* them? We need to transform an array of JavaScript objects into an array of JSX elements — one `<Post>` component for each post object. This is one of the most common patterns in React, and it uses JavaScript's built-in `map` method. We'll also cover the important `key` prop and how to conditionally show fallback content when the list is empty.

---

## Concept 1: Rendering Arrays in JSX

### 🧠 What is it?

React can render **arrays of JSX elements** directly. If you place an array of JSX elements inside curly braces in your JSX, React will render each element in the array.

### ❓ Why do we need it?

Our posts are stored as an array of objects. We need to convert that array into an array of visible components on the screen.

### ⚙️ How it works

```jsx
// React can render arrays of JSX:
{[<p>First</p>, <p>Second</p>, <p>Third</p>]}
// This renders three paragraphs on the screen
```

Since React can render JSX arrays, the challenge becomes: how do we transform our data array into a JSX array?

### 💡 Insight

This is the key insight — React doesn't render data objects, it renders JSX elements. Your job is to transform one into the other.

---

## Concept 2: The `map` Method

### 🧠 What is it?

`Array.map()` is a standard JavaScript method that creates a **new array** by transforming each item in the original array using a provided function.

### ❓ Why do we need it?

We have an array of post objects (`[{body, author}, ...]`). We need an array of `<Post>` components. `map` does exactly this transformation.

### ⚙️ How it works

```jsx
<ul className={classes.posts}>
  {posts.map((post) => (
    <Post key={post.body} author={post.author} body={post.body} />
  ))}
</ul>
```

For each `post` object in the `posts` array, `map` returns a `<Post>` JSX element with the appropriate props. The result is an array of JSX elements that React renders.

### 🧪 Example

If `posts = [{body: "Hello", author: "Max"}, {body: "World", author: "Anna"}]`:

```jsx
// map transforms this into:
[
  <Post key="Hello" author="Max" body="Hello" />,
  <Post key="World" author="Anna" body="World" />
]
```

React renders both `Post` components on the screen.

### 💡 Insight

`map` doesn't modify the original array — it creates a new one. This aligns perfectly with React's immutability principles.

---

## Concept 3: The `key` Prop

### 🧠 What is it?

`key` is a **special built-in prop** that React requires when rendering lists. Each item in a rendered list must have a unique `key` so React can efficiently track, update, and reorder list items.

### ❓ Why do we need it?

Without keys, React has to re-render the entire list whenever anything changes. With keys, React can identify *which* items changed, were added, or were removed — and update only those.

### ⚙️ How it works

```jsx
{posts.map((post) => (
  <Post key={post.body} author={post.author} body={post.body} />
))}
```

- `key` must be **unique** among siblings
- It should be **stable** — the same item should always get the same key
- It's not a prop you access inside the `Post` component — it's used internally by React

### 💡 Insight

Ideally, use a unique ID (like a database ID) as the key. Using `post.body` works for demos but could fail if two posts have the same text. Never use array indices as keys if the list can be reordered.

---

## Concept 4: Conditional Fallback Content

### 🧠 What is it?

When the list is empty, instead of showing a blank space, we display a **fallback message** telling the user there are no posts yet.

### ❓ Why do we need it?

Good UX means never leaving the user staring at a blank screen. A helpful message tells them the list is empty and invites action.

### ⚙️ How it works

```jsx
{posts.length > 0 && (
  <ul className={classes.posts}>
    {posts.map((post) => (
      <Post key={post.body} author={post.author} body={post.body} />
    ))}
  </ul>
)}

{posts.length === 0 && (
  <div style={{ textAlign: 'center', color: 'white' }}>
    <h2>There are no posts yet.</h2>
    <p>Start adding some!</p>
  </div>
)}
```

- If `posts.length > 0` → show the list
- If `posts.length === 0` → show the fallback message
- These are mutually exclusive — only one renders at a time

### 💡 Insight

Notice the inline styles use camelCase (`textAlign` not `text-align`). In JSX, inline styles are JavaScript objects, so CSS property names must be valid JS identifiers.

---

## Concept 5: Inline Styles in JSX

### 🧠 What is it?

React supports inline styles via the `style` prop, which accepts a JavaScript object where CSS property names are camelCased.

### ❓ Why do we need it?

For quick, one-off styling (like our fallback message), inline styles are convenient. For reusable styles, CSS modules are preferred.

### ⚙️ How it works

```jsx
<div style={{ textAlign: 'center', color: 'white' }}>
```

The double curly braces are:
- Outer `{}` — dynamic expression in JSX
- Inner `{}` — JavaScript object literal

CSS → JSX style mapping:
- `text-align` → `textAlign`
- `background-color` → `backgroundColor`
- `font-size` → `fontSize`

### 💡 Insight

Inline styles in JSX are just JavaScript objects. Any valid CSS property can be used — just convert it to camelCase.

---

## ✅ Key Takeaways

- Use `Array.map()` to transform data arrays into JSX element arrays
- Every list item needs a unique `key` prop for efficient rendering
- `key` is a built-in React prop — you don't access it inside the component
- Use conditional rendering (`&&`) to show either the list or a fallback message
- Inline styles in JSX use camelCase property names and double curly braces

## ⚠️ Common Mistakes

- Forgetting the `key` prop — React will show a console warning and may render inefficiently
- Using array indices as keys when items can be added/removed/reordered
- Using `text-align` instead of `textAlign` in inline styles — JavaScript doesn't allow hyphens in object keys without quotes
- Not checking for the empty list case — leaving a blank area with no user guidance

## 💡 Pro Tips

- Prefer database IDs or other truly unique identifiers as keys
- The `map` callback can also receive the index as a second argument: `(post, index)` — but avoid using index as the key
- Extract the list rendering and fallback into separate components if the logic grows complex
- Always test your lists with 0, 1, and many items
