# Revisiting Operators

## Introduction

Now that we understand variables and constants, it's time to explore another fundamental building block of JavaScript — **operators**. Operators let you perform operations on values: math, comparisons, string manipulation, and more. They're the verbs of your code — they *do* things with data.

Why does this matter for React? Because React apps are full of expressions, conditions, and dynamic calculations. Understanding operators is essential to writing any meaningful JavaScript (and React) code.

---

## Arithmetic Operators

JavaScript gives you the standard math operators you'd expect:

| Operator | Meaning        | Example     | Result |
|----------|----------------|-------------|--------|
| `+`      | Addition       | `10 + 5`    | `15`   |
| `-`      | Subtraction    | `10 - 5`    | `5`    |
| `*`      | Multiplication | `10 * 5`    | `50`   |
| `/`      | Division       | `10 / 5`    | `2`    |

```javascript
console.log(10 / 5); // 2
```

These work just like math class — nothing surprising here.

---

## The `+` Operator Does Double Duty

Here's something important: the `+` operator doesn't only add numbers. It can also **concatenate strings** (join them together).

```javascript
console.log("Hello" + " World"); // "Hello World"
```

When you use `+` with two strings, JavaScript glues them together instead of doing math. This is extremely useful when building dynamic text in your React apps.

⚠️ **Common Mistake:** If you accidentally mix a string and a number with `+`, JavaScript will concatenate instead of adding:
```javascript
console.log("5" + 3); // "53" (not 8!)
```

---

## Comparison Operators

Comparison operators let you compare two values and get back a **boolean** (`true` or `false`).

| Operator | Meaning                | Example     | Result  |
|----------|------------------------|-------------|---------|
| `===`    | Strict equality        | `10 === 10` | `true`  |
| `!==`    | Strict inequality      | `10 !== 5`  | `true`  |
| `>`      | Greater than           | `10 > 5`    | `true`  |
| `<`      | Less than              | `10 < 5`    | `false` |
| `>=`     | Greater than or equal  | `10 >= 10`  | `true`  |
| `<=`     | Less than or equal     | `5 <= 10`   | `true`  |

```javascript
console.log(10 === 5);  // false
console.log(10 === 10); // true
```

💡 **Pro Tip:** Always use `===` (triple equals) instead of `==` (double equals). Triple equals checks both value *and* type, which prevents subtle bugs. For example, `"5" == 5` is `true` (type coercion), but `"5" === 5` is `false` (different types).

---

## Operators + `if` Statements

Comparison operators become truly powerful when paired with `if` statements — they let you execute code **conditionally**.

```javascript
if (10 === 10) {
  console.log("This will execute!");
}
```

Of course, comparing two hard-coded values like this is pointless. In real React apps, you'll compare dynamic values — user input, state, props — to decide what to render or how to respond.

---

## ✅ Key Takeaways

- Arithmetic operators (`+`, `-`, `*`, `/`) perform math on numbers
- The `+` operator also concatenates strings — be careful with mixed types
- Comparison operators (`===`, `!==`, `>`, `<`, `>=`, `<=`) return booleans
- Always prefer `===` over `==` for strict, type-safe comparisons
- Comparison operators are typically used with `if` statements to control code flow

## ⚠️ Common Mistakes

- Using `==` instead of `===` — this allows type coercion and can produce unexpected results
- Forgetting that `+` concatenates strings, leading to `"5" + 3` becoming `"53"` instead of `8`

## 💡 Pro Tips

- In React, you'll use comparison operators constantly — for conditional rendering, input validation, and state checks
- When you need to convert a string to a number before doing math, use `Number("5")` or the `+` unary operator: `+"5"` gives you the number `5`
