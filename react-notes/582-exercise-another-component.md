# Exercise — Another Component (PostsList)

## Introduction

Time to practice what we've learned! The best way to solidify React concepts is to apply them. In this exercise, we build a **PostsList** component — a new custom component that wraps multiple Post instances in an unordered list. This exercise reinforces component creation, composition, props, and CSS Modules.

---

## Concept 1: The Exercise

### 🧠 What is it?

Build a `PostsList` component that:
1. Renders an **unordered list** (`<ul>`) containing the Post components
2. Update the `Post` component to use `<li>` instead of `<div>` (for semantic correctness)
3. Use the `PostsList` component in the `App` component, replacing the direct Post usage

### ❓ Why do we need it?

This exercise demonstrates a fundamental React pattern: **component composition**. Your app has a hierarchy:
- `App` → uses `PostsList`
- `PostsList` → uses multiple `Post` instances
- Each `Post` → renders individual post content

This is exactly how real React apps are structured — layers of components, each responsible for one piece of the UI.

---

## Concept 2: The Solution

### ⚙️ How it works

**Step 1: Create the PostsList component file**

Create `src/components/PostsList.jsx`:

```jsx
import Post from './Post';
import classes from './PostsList.module.css';

function PostsList() {
  return (
    <ul className={classes.posts}>
      <Post author="Maximilian" body="React.js is awesome!" />
      <Post author="Manuel" body="Check out the full course." />
    </ul>
  );
}

export default PostsList;
```

**Step 2: Update the Post component to use `<li>`**

In `Post.jsx`, change the root element from `<div>` to `<li>`:

```jsx
function Post({ author, body }) {
  return (
    <li className={classes.post}>
      <p className={classes.author}>{author}</p>
      <p className={classes.text}>{body}</p>
    </li>
  );
}
```

This change makes the HTML semantically correct — `<li>` elements inside a `<ul>`.

**Step 3: Use PostsList in App**

Update `App.jsx`:

```jsx
import PostsList from './components/PostsList';

function App() {
  return (
    <main>
      <PostsList />
    </main>
  );
}

export default App;
```

**Step 4: Add CSS Modules styling**

Create `PostsList.module.css` next to the component file and add your styles with a `.posts` class for the `<ul>` element.

### 💡 Insight

Notice the **clean separation of concerns** here:
- `App` doesn't know about individual posts — it just renders the list
- `PostsList` doesn't know about post styling — it just arranges posts in a list
- `Post` doesn't know it's inside a list — it just renders its content

Each component has one job. This is the power of composition.

---

## Concept 3: The Component Tree

### 🧠 What is it?

We now have a clear **component hierarchy** or "component tree":

```
main.jsx
  └── App
        └── PostsList
              ├── Post (author="Maximilian")
              └── Post (author="Manuel")
```

### ❓ Why do we need it?

Understanding the component tree helps you:
- Trace data flow (props flow downward through the tree)
- Understand what renders what
- Debug issues (if something's wrong, you know which component to check)

### ⚙️ How it works

- `main.jsx` renders `<App />`
- `App` renders `<PostsList />`
- `PostsList` renders multiple `<Post />` instances with different props
- Each `Post` renders its content (`<li>` with author and body text)

React executes each component function in order, building up the final HTML tree that gets rendered to the browser.

### 💡 Insight

This is the fundamental pattern of React development. You build your entire application this way — composing smaller components into larger ones, passing data down through props, and keeping each component focused on a single responsibility.

---

## Concept 4: Best Practices Reinforced

### 🧠 What is it?

This exercise reinforced several best practices:

- **One component per file** — `PostsList.jsx` gets its own file
- **Descriptive naming** — `PostsList` clearly describes what the component does
- **PascalCase naming** — `PostsList`, not `postsList` or `posts-list`
- **Co-located CSS Modules** — `PostsList.module.css` sits next to `PostsList.jsx`
- **Semantic HTML** — Using `<ul>` and `<li>` instead of generic `<div>` elements
- **Clean imports** — Import only what you need, from the correct relative paths

---

## ✅ Key Takeaways

- Component composition = building UIs by nesting components inside each other
- Each component should have a **single responsibility**
- The component tree flows from `App` → feature components → individual UI pieces
- Use **semantic HTML elements** (`<ul>`, `<li>`, `<main>`) in your JSX
- Keep CSS Module files co-located with their component files
- React apps are built by combining many small, focused components

## ⚠️ Common Mistakes

- Forgetting to import the Post component in PostsList
- Forgetting to import PostsList in App
- Not updating the import path when moving components between files
- Using `<div>` everywhere instead of semantic HTML elements

## 💡 Pro Tips

- Always think about your component tree before coding — sketch it out if needed
- If a component is getting too large, it's probably time to break it into smaller components
- The component hierarchy also represents your **data flow** — props flow down from parent to child
