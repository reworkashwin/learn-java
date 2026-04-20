# Defining Functions Inside Of Functions

## Introduction

Here's something that might seem unusual if you're coming from other languages: in JavaScript, you can **define functions inside other functions**. The inner function is "scoped" to the outer function — it exists and can be used only inside it. While this might not seem useful in plain JavaScript, it's a core pattern in React, where every component is a function that often contains other functions.

---

## How It Works

```javascript
function init() {
  function greet() {
    console.log("Hi!");
  }

  greet(); // ✅ Works — greet is defined in this scope
}

init(); // Executes init, which internally calls greet
// Output: "Hi!"
```

The function `greet` is defined **inside** `init`. It only exists within `init`'s scope.

---

## Scope Restrictions

The inner function is **not accessible** outside the outer function:

```javascript
function init() {
  function greet() {
    console.log("Hi!");
  }

  greet(); // ✅ Works
}

greet(); // ❌ Error! greet is not defined outside init
```

This follows the same scoping rules as variables — if you declare something inside a function (whether it's a variable or another function), it's only available inside that function.

---

## Why This Matters in React

In React, every component is a function. Inside that component function, you'll regularly define:

- **Event handler functions**
- **Helper/utility functions**
- **Functions returned by hooks**

```jsx
function App() {
  function handleClick() {
    console.log("Button clicked!");
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

Here, `handleClick` is defined inside `App` — a function inside a function. This is the standard React pattern. Every time `App` re-renders, `handleClick` is re-created inside it.

---

## Real-World Analogy

Think of it like a company department. The department (`init`) has employees (`greet`) that work inside it. Those employees are known within the department, but outsiders can't directly access them — they go through the department.

---

## ✅ Key Takeaways

- JavaScript allows defining functions inside other functions
- Inner functions are scoped to the outer function — they can't be accessed outside
- This follows the same scoping rules as variables declared inside functions
- In React, this is the standard pattern — event handlers and helpers are defined inside component functions

## ⚠️ Common Mistakes

- Trying to call an inner function from outside the outer function — it's out of scope
- Being surprised when React re-creates inner functions on every render — that's expected behavior

## 💡 Pro Tips

- While functions inside functions are re-created on each call (or each render in React), this is usually fine for performance
- In advanced React, `useCallback` can be used to memoize inner functions if performance becomes a concern — but don't optimize prematurely
