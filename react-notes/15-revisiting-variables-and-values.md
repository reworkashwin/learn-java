# Revisiting Variables & Values

## Introduction

At the heart of every application — whether React, vanilla JavaScript, or anything else — is **data**. Think about apps like Twitter or Google Maps: tweets, locations, search queries — they're all data. And in JavaScript, data is stored and manipulated using **variables** and **values**.

Let's revisit these foundational concepts because you'll use them in every single React component you write.

---

## Types of Values in JavaScript

JavaScript handles several types of values:

| Type | Example | Description |
|---|---|---|
| **String** | `"Hello World"` | Text, wrapped in single or double quotes |
| **Number** | `42`, `3.14` | Integers and decimals |
| **Boolean** | `true`, `false` | Logical values for conditions |
| **Null** | `null` | Intentionally empty — "no value" |
| **Undefined** | `undefined` | Variable declared but not assigned a value yet |
| **Object** | `{ name: "React" }` | Complex data structures (covered later) |

---

## Creating Values Inline

You can create a value right where you need it:

```javascript
console.log("Hello World");
```

This creates a string `"Hello World"` and immediately passes it to `console.log`. No variable needed.

---

## Storing Values in Variables

But often, you want to **store** a value so you can reuse it:

```javascript
let userMessage = "Hello World";
console.log(userMessage);
console.log(userMessage); // Reuse without repeating the value
```

### Why Use Variables?

1. **Reusability** — define once, use many times
2. **Readability** — a descriptive name explains *what* the value represents
3. **Maintainability** — if the value changes, update it in one place

---

## `let` vs `const`

JavaScript provides two main keywords for creating data containers:

### `let` — For Values That May Change

```javascript
let userMessage = "Hello World";
userMessage = "New Message"; // ✅ This works
```

`let` creates a variable that can be **reassigned** to a new value later.

### `const` — For Values That Should Never Change

```javascript
const apiKey = "abc123";
apiKey = "xyz789"; // ❌ Error! Assignment to constant variable
```

`const` creates a **constant** — once assigned, the value cannot be replaced.

### Which Should You Use?

| Situation | Use |
|---|---|
| Value will be reassigned later | `let` |
| Value should never change | `const` |
| Not sure? | Default to `const` |

Many developers (and this course) prefer **`const` by default**. It makes your intentions clear: "This value is not meant to change." Only use `let` when you specifically need reassignment.

---

## Variable Naming Rules

JavaScript variable names must follow these rules:

| Rule | Valid | Invalid |
|---|---|---|
| Use camelCase | `userMessage` | `user-message` |
| Start with a letter | `count` | `1count` |
| No spaces | `firstName` | `first name` |
| No special characters (except `$` and `_`) | `$price`, `_temp` | `user!name` |
| Case-sensitive | `userName` ≠ `username` | — |

### Convention

- Use **camelCase** for variables and functions: `userMessage`, `isLoggedIn`
- Start with a **lowercase letter**
- Multiple words: capitalize the first letter of each subsequent word

---

## ✅ Key Takeaways

- JavaScript works with several value types: strings, numbers, booleans, null, undefined, and objects
- **Variables** (`let`) store values that might change
- **Constants** (`const`) store values that must not be reassigned
- Prefer `const` by default — it communicates intent clearly
- Use **camelCase** for naming variables and follow JavaScript naming conventions
- Variables enable reusability, readability, and easier maintenance

---

## ⚠️ Common Mistake

Using `let` for everything out of habit. While it works, it hides your intention. If a value is never meant to change, using `const` makes that explicit — both for you and anyone reading your code later.

---

## 💡 Pro Tip

In React, you'll use `const` far more often than `let`. Component functions, imported modules, state variables (from `useState`), refs, and most other values are declared with `const`. Get comfortable with it — it will be your go-to keyword.
