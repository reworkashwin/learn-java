# A Closer Look at JSX

## Introduction

We've been writing JSX all along — that HTML-like syntax inside our component functions. But what *is* JSX really? What happens to it behind the scenes? Understanding this gives you a deeper appreciation for why certain rules exist (like needing one root element). Let's peek under the hood.

---

## Concept 1: JSX is Syntactic Sugar

### 🧠 What is it?

JSX is **not** HTML. It's not understood by browsers. It's a convenient syntax that gets **transformed** into regular JavaScript function calls before it reaches the browser.

### ⚙️ How it works

When you write:
```jsx
<div>
  <h2>Let's get started!</h2>
  <Expenses items={expenses} />
</div>
```

Behind the scenes, it's transformed into:
```js
React.createElement(
  'div',
  {},
  React.createElement('h2', {}, "Let's get started!"),
  React.createElement(Expenses, { items: expenses })
);
```

Every JSX element becomes a `React.createElement()` call.

### 💡 Insight

This is why you used to need `import React from 'react'` in every file with JSX — because the transformed code calls `React.createElement()`. Modern React project setups handle this automatically, but older projects still have this import everywhere.

---

## Concept 2: The `React.createElement` Method

### 🧠 What is it?

`React.createElement` is the actual function that React uses to create elements. JSX is just a nicer way to write these calls.

### ⚙️ How it works

It takes three (or more) arguments:

1. **Element type**: A string for HTML elements (`'div'`, `'h2'`) or a reference to a component function (`Expenses`)
2. **Props object**: An object of attributes/properties (or `{}` if none)
3. **Children**: Any number of additional arguments representing the content between opening and closing tags

```js
React.createElement(
  'div',                    // element type
  {},                       // props/attributes
  React.createElement(      // first child
    'h2',
    {},
    "Let's get started!"
  ),
  React.createElement(      // second child
    Expenses,
    { items: expenses }     // props passed to Expenses
  )
);
```

### 🧪 Example

For custom components, instead of a string, you pass the function reference:
```js
// String for built-in elements
React.createElement('div', {}, ...)

// Function reference for custom components
React.createElement(Expenses, { items: expenses })
```

This is why component names must start with a capital letter — it's how React distinguishes between `'div'` (a string, built-in) and `Expenses` (a reference, custom).

---

## Concept 3: Why You Need One Root Element

### 🧠 What is it?

JSX requires a single root element wrapping everything in the `return` statement. You can't return two sibling elements side by side.

### ❓ Why?

Because `return` can only return **one value**. In `createElement` world, you're returning one function call. You can't return two separate `createElement` calls — that's two values, and JavaScript doesn't allow that.

```js
// This is INVALID — two return values
return React.createElement('h2', {}, 'Hello')
       React.createElement('p', {}, 'World')   // ← unreachable
```

```js
// This is VALID — one root wrapping both
return React.createElement('div', {},
  React.createElement('h2', {}, 'Hello'),
  React.createElement('p', {}, 'World')
);
```

### 💡 Insight

Now the single-root-element rule makes perfect sense. It's not an arbitrary restriction — it's a fundamental JavaScript limitation. JSX just hides this behind its friendlier syntax.

---

## Concept 4: The React Import — Past vs Present

### 🧠 What is it?

In older React projects, every file with JSX had `import React from 'react'` at the top. In modern projects (created with Create React App or similar), this import is no longer required.

### ⚙️ How it works

- **Past**: The JSX-to-JavaScript transformation explicitly called `React.createElement()`, so `React` had to be in scope
- **Present**: Modern build tools handle the transformation differently, injecting the necessary imports automatically

### 💡 Insight

If you see `import React from 'react'` in someone's code, it's not wrong — it's just either an older project or a developer who likes being explicit. It still works perfectly fine to include it.

---

## ✅ Key Takeaways

- JSX is syntactic sugar for `React.createElement()` calls
- Each JSX element becomes a `createElement(type, props, ...children)` call
- Built-in elements use strings (`'div'`), custom components use function references (`Expenses`)
- The single root element rule exists because `return` can only return one value
- The `import React` statement was required in older setups but is now optional in modern ones

## ⚠️ Common Mistakes

- Thinking JSX is HTML — it's not. It's JavaScript that *looks* like HTML
- Trying to return multiple root elements without a wrapper

## 💡 Pro Tips

- You'll almost never write `React.createElement` manually — JSX is the way to go
- Understanding the transformation helps you debug confusing error messages
- If you encounter `React must be in scope when using JSX`, add `import React from 'react'`
