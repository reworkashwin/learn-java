# Using Functions as Values

## Introduction

Here's a concept that can be tricky at first but is absolutely fundamental to React: **functions can be passed around as values**, just like strings or numbers. You can store them in variables, pass them as arguments to other functions, and return them from functions. This is what makes JavaScript a language with "first-class functions" — and it's the backbone of how React handles events, callbacks, and much more.

---

## Passing Functions to Built-in Functions

Let's start with a familiar example — `setTimeout`. This built-in function takes **two arguments**:

1. A **function** to execute later
2. A **number** (milliseconds to wait)

```javascript
setTimeout(() => {
  console.log("Timed out!");
}, 2000);
```

Here, you're defining an anonymous arrow function *right where it's needed* and passing it to `setTimeout`. After 2000 milliseconds, `setTimeout` calls that function for you.

---

## Defining Functions in Advance

You don't have to define the function inline. You can define it beforehand and pass it **by name**:

```javascript
function handleTimeout() {
  console.log("Timed out!");
}

setTimeout(handleTimeout, 2000);
```

Or using an arrow function stored in a constant:

```javascript
const handleTimeout2 = () => {
  console.log("Timed out again!");
};

setTimeout(handleTimeout2, 3000);
```

### ⚠️ The Critical Detail: No Parentheses!

When passing a function as a value, you use **just the name** — no parentheses:

```javascript
// ✅ CORRECT — passes the function itself
setTimeout(handleTimeout, 2000);

// ❌ WRONG — EXECUTES the function immediately and passes its return value
setTimeout(handleTimeout(), 2000);
```

| Syntax | What Happens |
|--------|-------------|
| `handleTimeout` | Passes the function as a value (doesn't execute it) |
| `handleTimeout()` | Executes the function immediately and passes the **return value** |

This distinction is crucial. When you pass a function to `setTimeout` (or to a React event handler), you want to pass the function *itself*, not execute it right away.

---

## Building Your Own Functions That Accept Functions

This concept isn't limited to built-in functions like `setTimeout`. You can write your own functions that accept functions as input:

```javascript
function greeter(greetFn) {
  greetFn();
}

greeter(() => console.log("Hi!"));
// Output: "Hi!"
```

### What's happening here:

1. `greeter` is a function that accepts a parameter called `greetFn`
2. Inside `greeter`, it **calls** `greetFn()` — executing whatever function was passed in
3. We call `greeter` and pass an arrow function that logs `"Hi!"`
4. `greeter` receives that arrow function as `greetFn` and executes it

This is the exact same pattern React uses internally! When you pass an `onClick` handler to a button, React stores that function and calls it when the button is clicked.

---

## Why This Matters in React

In React, you'll pass functions as values *constantly*:

```jsx
function App() {
  function handleClick() {
    console.log("Button clicked!");
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

Notice: `onClick={handleClick}` — **no parentheses**. You're passing the function as a value, not executing it. React will call it when the click happens.

If you wrote `onClick={handleClick()}`, the function would execute **immediately** when the component renders — not when the button is clicked. That's a very common bug.

---

## Three Ways to Pass Functions

| Style | Example | When to Use |
|-------|---------|------------|
| Inline anonymous | `onClick={() => console.log("Hi")}` | Short, one-off handlers |
| Named function reference | `onClick={handleClick}` | Reusable, readable handlers |
| Inline with arguments | `onClick={() => handleClick(id)}` | When you need to pass arguments |

---

## ✅ Key Takeaways

- Functions are values in JavaScript — they can be passed as arguments, stored in variables, and returned
- Pass functions **by name without parentheses** to avoid executing them immediately
- Adding `()` executes the function and passes its return value — usually not what you want
- You can build your own functions that accept functions as parameters
- This is the exact pattern React uses for event handlers (`onClick`, `onChange`, etc.)

## ⚠️ Common Mistakes

- Adding parentheses when passing a function as a value: `onClick={handleClick()}` ← executes immediately!
- Confusing *defining* a function with *executing* it
- Forgetting that anonymous functions defined inline are also just function values being passed

## 💡 Pro Tips

- If your handler needs to receive arguments, wrap it in an arrow function: `onClick={() => deleteItem(id)}`
- This "functions as values" concept is also called "higher-order functions" or "callbacks"
- In React, almost every interactive feature relies on this pattern — master it early
