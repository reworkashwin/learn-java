# Revisiting Functions & Parameters

## Introduction

If variables are the "nouns" of JavaScript, then **functions** are the "verbs." They let you define reusable blocks of code that execute only when you call them. Functions are absolutely everywhere in JavaScript — and in React, they're even more central because **React components are essentially functions**.

Let's walk through everything you need to know about functions before diving into React.

---

## Defining a Function

You create a function using the `function` keyword, followed by a name, parentheses, and curly braces:

```javascript
function greet() {
  console.log("Hello!");
}
```

This **defines** the function but does NOT execute it. The code inside the curly braces just sits there, waiting.

---

## Calling (Invoking) a Function

To actually run the code inside a function, you **call** it by using its name followed by parentheses:

```javascript
greet(); // "Hello!"
greet(); // "Hello!"
greet(); // "Hello!"
```

You can call a function as many times as you want. Each call executes the code inside it from scratch.

💡 **Pro Tip:** Think of defining a function like writing a recipe, and calling it like actually cooking the dish. You write the recipe once, but you can cook from it many times.

---

## Parameters — Making Functions Flexible

Functions become truly powerful when they accept **parameters** — input values that customize what the function does each time it's called.

```javascript
function greet(userName, message) {
  console.log(userName);
  console.log(message);
}

greet("Max", "Hello!");       // Max, Hello!
greet("Manuel", "What's up?"); // Manuel, What's up?
```

Here, `userName` and `message` are parameters. When you call the function, you provide **arguments** (the actual values) for those parameters.

### How it works:
1. You define parameter names in the parentheses — these are like placeholder variables
2. When calling the function, you pass actual values in the same order
3. Inside the function, those values are available through the parameter names

---

## Default Parameter Values

You can assign a **default value** to a parameter. If the caller doesn't provide a value for that parameter, the default kicks in:

```javascript
function greet(userName, message = "Hello!") {
  console.log(userName + " " + message);
}

greet("Max");                  // "Max Hello!" (default used)
greet("Manuel", "What's up?"); // "Manuel What's up?" (default overridden)
```

This is handy when a parameter has a sensible fallback — you don't force the caller to always provide it.

---

## Returning Values

Functions don't just *do* things — they can also **produce** values using the `return` keyword:

```javascript
function createGreeting(userName, message = "Hello!") {
  return "Hi, I am " + userName + ". " + message;
}

const greeting1 = createGreeting("Max");
const greeting2 = createGreeting("Manuel", "What's up?");

console.log(greeting1); // "Hi, I am Max. Hello!"
console.log(greeting2); // "Hi, I am Manuel. What's up?"
```

### Key points about `return`:
- It sends a value back to wherever the function was called
- The function **stops executing** after a `return` statement
- The returned value can be stored in a variable, passed to another function, or used in an expression
- Parameters and `return` are independent — a function can have one, both, or neither

---

## Naming Functions Well

A function's name should clearly describe **what it does**:

- ❌ `greet` — if it doesn't actually greet but creates a greeting string
- ✅ `createGreeting` — clearly says it *creates* a greeting

Good naming makes your code self-documenting and much easier to maintain, especially in large React projects with dozens of components and utility functions.

---

## ✅ Key Takeaways

- Functions define reusable code that runs only when called
- Define with `function name() { }`, call with `name()`
- Parameters allow functions to accept input values for flexibility
- Default parameter values provide fallbacks when arguments aren't passed
- `return` lets functions produce output values
- In React, components are defined as functions — this concept is foundational

## ⚠️ Common Mistakes

- Forgetting to call a function (just defining it does nothing)
- Confusing defining (`function greet() {}`) with calling (`greet()`)
- Not returning a value when you need the function to produce output
- Using vague or misleading function names

## 💡 Pro Tips

- Name functions as verbs or verb phrases: `createUser`, `calculateTotal`, `formatDate`
- In React, you'll define components as functions that `return` JSX — the connection between functions and React is direct and deep
- Parameters and `return` work independently, but they're most powerful when combined
