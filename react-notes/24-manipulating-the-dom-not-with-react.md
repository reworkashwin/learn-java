# Manipulating the DOM — Not With React!

## Introduction

If you've written vanilla JavaScript before, you're probably used to reaching into the webpage (the **DOM** — Document Object Model), selecting elements, and manipulating them directly. Things like `document.querySelector()`, `element.remove()`, or `element.textContent = "new text"`.

Here's the key insight for this course: **you won't do that in React.**

---

## The Traditional (Imperative) Approach

In plain JavaScript, you interact with the DOM manually:

```javascript
const paragraph = document.querySelector("p");
paragraph.textContent = "Updated text!";
paragraph.remove();
```

This is called **imperative programming** — you're giving the browser step-by-step instructions for what to do. "Find this element. Change its text. Remove it."

---

## Why React Doesn't Do This

React uses a **declarative approach**. Instead of manually finding and changing DOM elements, you describe *what* the UI should look like based on your data, and React figures out the DOM changes for you.

```jsx
// You declare what the UI should be:
function App() {
  return <p>This is managed by React!</p>;
}
```

React takes your component output and handles all the DOM updates behind the scenes. You never need to call `querySelector`, `appendChild`, or `remove()`.

---

## The One Rule

> **Do not manually manipulate the DOM when using React.**

React manages the DOM for you. If you bypass React and change the DOM directly, you'll create conflicts between what React *thinks* the DOM looks like and what it *actually* looks like — leading to bugs and unpredictable behavior.

---

## ✅ Key Takeaways

- Traditional JavaScript uses `querySelector`, `textContent`, `remove()`, etc., to manipulate the DOM directly
- React handles all DOM updates for you — you describe *what* to render, not *how* to change the DOM
- Direct DOM manipulation in a React app creates conflicts and bugs
- This course will focus on React's declarative approach, not manual DOM manipulation

## 💡 Pro Tips

- If you come from vanilla JS, the biggest mindset shift with React is moving from "tell the DOM what to do" to "describe what the UI should look like"
- There *are* rare cases where you need to touch the DOM directly in React (using `refs`), but those are exceptions, not the rule — and you'll learn about them later
