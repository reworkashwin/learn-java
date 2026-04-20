# Arrow Functions

## Introduction

You've seen how to create functions using the `function` keyword. But JavaScript has a second way to define functions — the **arrow function** syntax. Arrow functions are shorter, sleeker, and especially popular in situations where you need anonymous (unnamed) functions. You'll see them *everywhere* in React code.

---

## The Traditional Way vs. Arrow Functions

Here's a traditional function:

```javascript
function greet(userName, message) {
  return "Hi, I am " + userName + ". " + message;
}
```

And here's the same function written as an **arrow function**:

```javascript
const greet = (userName, message) => {
  return "Hi, I am " + userName + ". " + message;
};
```

### What changed?

1. **No `function` keyword** — you drop it entirely
2. **Arrow (`=>`)** — goes between the parameter list and the function body
3. **Stored in a variable/constant** — since arrow functions don't have their own name, you store them in a `const` or `let` to give them a name

---

## Anonymous Functions

Arrow functions are especially handy for **anonymous functions** — functions that don't need a name because they're used right where they're defined.

A common example in React:

```jsx
<button onClick={() => console.log("Clicked!")}>Click Me</button>
```

Here, the arrow function is defined *inline* as the click handler. There's no need to give it a name — it's used once, right there.

You *could* do the same with the `function` keyword:

```javascript
export default function() {
  console.log("Hello");
}
```

But the arrow function syntax is shorter and more common in the React ecosystem:

```javascript
export default () => {
  console.log("Hello");
};
```

---

## When to Use Which?

| Feature | `function` keyword | Arrow function |
|---------|-------------------|---------------|
| Named functions | ✅ Natural fit | Stored in a variable |
| Anonymous functions | ✅ Works | ✅ Shorter & preferred |
| React components | ✅ Common | ✅ Also common |
| Event handlers (inline) | Verbose | ✅ Concise |

In this course, you'll see both styles. Ultimately, it's a matter of preference — but you need to **know both** because the React ecosystem uses both extensively.

---

## ✅ Key Takeaways

- Arrow functions are an alternative syntax: `(params) => { body }`
- They omit the `function` keyword and use `=>` instead
- Especially useful for anonymous functions (functions without names)
- Both function styles work in React — know and recognize both
- Arrow functions stored in a `const` effectively get a name through the variable

## ⚠️ Common Mistakes

- Writing `function` before an arrow function — you must not use the `function` keyword with arrow syntax
- Forgetting the `=>` arrow between the parameter list and the function body

## 💡 Pro Tips

- In React, you'll frequently define inline event handlers as arrow functions
- Arrow functions have a shorter syntax for single-expression returns (covered in later lectures)
- Arrow functions also behave slightly differently with `this` — but in React with functional components, this rarely matters
