# Revisiting Control Structures

## Introduction

Control structures are the decision-makers and repeat-runners of your code. They let you execute code **conditionally** (do this *if* that's true) and **repeatedly** (do this for *every* item in a list). In React, conditional rendering and looping through data are daily tasks — so let's make sure you're solid on the JavaScript foundations.

---

## The `if` Statement

The `if` statement checks a condition and runs code only when that condition is `true`:

```javascript
if (10 === 10) {
  console.log("This will run!");
}
```

### Adding `else` and `else if`

You can handle multiple scenarios:

```javascript
const password = prompt("Enter your password:");

if (password === "Hello") {
  console.log("Hello works!");
} else if (password === "hello") {
  console.log("hello works too!");
} else {
  console.log("Access not granted.");
}
```

### How it flows:

1. JavaScript checks the first `if` condition
2. If `true`, it runs that block and **skips everything else**
3. If `false`, it moves to the next `else if` (if any) and checks that
4. If nothing matches, the `else` block runs as a fallback

### Rules:
- You can have **as many** `else if` branches as you want
- You can have **at most one** `else` branch (and it must come last)
- In real apps, you compare dynamic values (user input, state, props) — not hard-coded numbers

---

## The `for...of` Loop

When you need to execute code **for every item** in an array, use a `for...of` loop:

```javascript
const hobbies = ["Sports", "Cooking"];

for (const hobby of hobbies) {
  console.log(hobby);
}
// Output:
// "Sports"
// "Cooking"
```

### How it works:

1. JavaScript creates a new `hobby` constant for each iteration
2. `hobby` holds the current array element
3. The code inside the curly braces runs once for each element
4. After processing all elements, the loop ends

It's like saying: "For each item in this list, do this thing."

---

## Control Structures in React

In React, you won't use `if` statements and `for` loops in the same way as vanilla JavaScript — but the concepts directly translate:

| JavaScript | React Equivalent |
|-----------|-----------------|
| `if/else` | Conditional rendering with ternaries or `&&` |
| `for...of` | `array.map()` to render lists |

```jsx
// Conditional rendering:
{isLoggedIn ? <Dashboard /> : <Login />}

// List rendering:
{hobbies.map((hobby) => <li key={hobby}>{hobby}</li>)}
```

The foundations are the same — React just uses different syntax patterns to achieve the same goals.

---

## ✅ Key Takeaways

- `if` / `else if` / `else` execute code conditionally based on boolean expressions
- `for...of` iterates over every element in an array
- In real code, conditions check dynamic values — not hard-coded ones
- React uses ternary expressions and `map()` instead of traditional `if` and `for`, but the logic is identical

## ⚠️ Common Mistakes

- Using `=` (assignment) instead of `===` (comparison) in conditions
- Forgetting that `else if` is two words, not `elseif`
- Using `for...in` instead of `for...of` for arrays — `for...in` iterates over keys, not values

## 💡 Pro Tips

- `for...of` is great for arrays; `for...in` is for object keys — don't mix them up
- In React, you'll rarely write traditional `if` blocks inside JSX. Instead, use ternary operators (`? :`) or logical AND (`&&`) for inline conditionals
- The `prompt()` function used in the example is a browser-only feature — you won't use it in React apps (you'll use state and form inputs instead)
