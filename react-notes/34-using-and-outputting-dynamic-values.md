# Using & Outputting Dynamic Values

## Introduction

So far, every component we've built outputs **static content** — the same text every time. But what if you want a component to display *different* content each time the page loads? That's where **dynamic values** come in — and it's something you'll use constantly in React.

---

## The Goal

In our `Header` component, instead of always showing "Fundamental React Concepts," we want to **randomly switch** between:

- "Fundamental React Concepts"
- "Crucial React Concepts"  
- "Core React Concepts"

To do this, we need to output content **dynamically** inside JSX.

---

## The Curly Brace Syntax `{ }`

JSX lets you embed **any JavaScript expression** using a single pair of curly braces `{ }`.

```jsx
<h1>{1 + 1}</h1>   // Renders: 2
```

Whatever JavaScript expression you put between the curly braces gets **evaluated**, and the result is rendered on the screen.

> Think of curly braces as "escape hatches" from HTML back into JavaScript land.

### Where Can You Use Curly Braces?

1. **Between element tags** — to output dynamic text or values
2. **As attribute values** — to set dynamic attributes (more on this later)

---

## Building the Random Word Feature

### Step 1: Define the Data

```jsx
const reactDescriptions = ['Fundamental', 'Crucial', 'Core'];

function genRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}
```

### Step 2: Use It in JSX

You can use the expression directly in the JSX:

```jsx
<h1>{reactDescriptions[genRandomInt(2)]} React Concepts</h1>
```

This works — but it makes your JSX a bit cluttered.

### Step 3: Extract to a Variable (Best Practice)

A cleaner approach is to **compute the value first**, then reference it:

```jsx
function Header() {
  const description = reactDescriptions[genRandomInt(2)];
  
  return (
    <header>
      <h1>{description} React Concepts</h1>
    </header>
  );
}
```

This keeps your JSX **lean and readable** — which is considered a best practice in React.

---

## When Does the Dynamic Value Update?

The random word is generated when the `Header` component function **executes**. That happens when the page first loads (or when the component re-renders).

If you reload the page, you'll get a new random word. But without reloading, the word stays the same — because the component function only runs once initially.

> We'll learn how to trigger re-renders and make things truly interactive when we cover **State** later.

---

## ✅ Key Takeaways

- Use **curly braces `{ }`** in JSX to output dynamic JavaScript values
- Any valid **JavaScript expression** can go inside curly braces (variables, function calls, math, ternaries)
- Extract complex expressions into **variables above the return** to keep JSX clean
- Dynamic values are computed when the component function executes

## ⚠️ Common Mistakes

- Using **double curly braces** `{{ }}` when you only need single — double curly braces create a JavaScript object, not a dynamic expression
- Putting **statements** (like `if/else` or `for` loops) inside curly braces — only expressions are allowed
- Forgetting that the value only updates when the component re-renders

## 💡 Pro Tips

- Keep JSX lean: compute values in the function body, then just reference them in the return
- You can call functions, access array elements, use ternary operators — anything that's a JavaScript **expression**
- This curly brace syntax is one of the most frequently used features in React — master it early
