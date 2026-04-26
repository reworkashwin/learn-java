# Reusing Components

## Introduction

We've built our first custom component and made it dynamic. But so far, we're only using it once. What good is a "Post" component if we can only show one post? The whole point of components is **reusability** — use the same blueprint to create multiple instances. Let's explore how to reuse components and learn some critical JSX rules along the way.

---

## Concept 1: Using a Component Multiple Times

### 🧠 What is it?

You can use the same component **as many times as you want** in your JSX code. Each usage creates a separate **instance** of that component.

### ❓ Why do we need it?

Think about it — a social media feed has dozens of posts, a product page has multiple product cards, a navigation bar has several menu items. All of these are the same component used repeatedly with different data.

### ⚙️ How it works

```jsx
function App() {
  return (
    <main>
      <Post />
      <Post />
      <Post />
      <Post />
    </main>
  );
}
```

Each `<Post />` causes React to execute the `Post` function **independently**. If your component has random logic (like our random name picker), each instance runs that logic separately — so you might get different results for each one.

### 🧪 Example

With our random name component, four `<Post />` instances might render:
- Maximilian
- Manuel
- Maximilian
- Manuel

Each instance is independent. The function runs once per usage, with its own execution context.

### 💡 Insight

This is one of the most powerful aspects of the component model. You define the blueprint once, and React stamps out as many copies as you need. Later, when we add **props**, each copy can be configured differently — making reusability truly practical.

---

## Concept 2: The Single Root Element Rule

### 🧠 What is it?

In any place where you use JSX (like a component's `return` statement), you **must return a single root element**. Multiple sibling elements at the top level are not allowed.

### ❓ Why do we need it?

This is a technical requirement of how JSX is compiled. A function can only return one value, and JSX must compile to a single function call. Multiple top-level elements would mean multiple return values — which JavaScript doesn't support.

### ⚙️ How it works

```jsx
// ❌ INVALID — multiple root elements
function App() {
  return (
    <Post />
    <Post />
  );
}

// ✅ VALID — wrapped in a single root element
function App() {
  return (
    <main>
      <Post />
      <Post />
    </main>
  );
}

// ✅ ALSO VALID — using a Fragment (empty tags)
function App() {
  return (
    <>
      <Post />
      <Post />
    </>
  );
}
```

### 💡 Insight

The empty tags `<> </>` are called **React Fragments**. They let you group elements without adding an extra DOM node. Use them when there's no semantically appropriate HTML wrapper element. Use a real element (like `<main>`, `<div>`, `<section>`) when it makes semantic sense.

---

## Concept 3: Self-Closing Tags in JSX

### 🧠 What is it?

In JSX, elements with no content between their opening and closing tags **must** either use a self-closing tag or have an explicit closing tag. "Void" tags (opening tag only, no closing) are **not allowed**.

### ⚙️ How it works

```jsx
// ✅ Self-closing tag
<Post />

// ✅ Opening and closing tags (no content between)
<Post></Post>

// ❌ INVALID — void tag without closing
<Post>
```

This rule applies to **all** elements in JSX — both custom components and built-in HTML elements. Even elements like `<img>` and `<br>` must be written as `<img />` and `<br />` in JSX.

### 💡 Insight

This is stricter than regular HTML, where void elements like `<img>` and `<input>` don't need closing tags. JSX is essentially XML-flavored HTML — every element must be properly closed.

---

## ✅ Key Takeaways

- Use the same component multiple times by repeating it in JSX — each creates an independent instance
- React executes the component function **separately for each instance** — they don't share state
- **Single root element rule**: You can only return one top-level element from a component
- Use `<main>`, `<div>`, or React Fragments (`<> </>`) to wrap multiple sibling elements
- **Self-closing tags** are required for elements with no content — void tags are invalid in JSX
- All elements (custom and built-in) must be properly closed in JSX

## ⚠️ Common Mistakes

- Returning multiple sibling elements without a wrapper — React will throw an error
- Forgetting the `/` in self-closing tags — `<Post>` without closing is invalid
- Assuming multiple component instances share state or execution — they're fully independent

## 💡 Pro Tips

- Use semantic HTML elements as wrappers when possible (`<main>`, `<section>`, `<nav>`) — it improves accessibility
- React Fragments (`<> </>`) are perfect when you don't want to add unnecessary DOM nodes
- If you see "Adjacent JSX elements must be wrapped" error — you forgot the root wrapper
