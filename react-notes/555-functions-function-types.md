# Functions & Function Types

## Introduction

Functions are the workhorses of JavaScript (and React). When we add TypeScript to the mix, we don't just type the inputs — we also get to type the **outputs**. Understanding how TypeScript handles function parameter types, return types, and the special `void` type is essential before we start writing typed React components.

---

### Concept 1: Typing Function Parameters

#### 🧠 What is it?

Just like variables, function parameters can have type annotations. This tells TypeScript exactly what types of values the function accepts.

#### ⚙️ How it works

Add a colon and the type after each parameter name:

```typescript
function add(a: number, b: number) {
  return a + b;
}

add(2, 5);      // ✅
add("2", "5");  // ❌ — strings not allowed
```

#### 💡 Insight

This is the same pattern we've been seeing — the colon-type syntax works identically for variables, parameters, and other places where types can be assigned.

---

### Concept 2: Return Type Inference

#### 🧠 What is it?

When a function has a `return` statement, TypeScript **infers the return type** automatically by analyzing what the function returns.

#### ⚙️ How it works

```typescript
function add(a: number, b: number) {
  return a + b;
}
```

Hover over `add` in your IDE, and you'll see:

```
function add(a: number, b: number): number
```

TypeScript figured out that `number + number = number`, so the return type is `number`.

#### 💡 Insight

TypeScript is smart enough to trace through your function logic and determine the output type. You don't need to tell it — it already knows.

---

### Concept 3: Explicit Return Types

#### 🧠 What is it?

You *can* explicitly set a function's return type by adding a colon and type after the parameter list:

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

#### ❓ Why do we need it?

In most cases, you **don't** — inference handles it. But there are scenarios where explicit return types are useful:

- When you want to ensure a function returns a specific type (as a contract)
- When the function is complex and inference might not catch your intent
- When you want your code to be more self-documenting

#### ⚙️ How it works

```typescript
// Explicit return type — also allows union types
function getResult(a: number, b: number): number | string {
  if (a > b) return a - b;
  return "b is larger";
}
```

#### 💡 Insight

The general rule: **let TypeScript infer the return type** unless you have a specific reason to set it explicitly. Just like with variables, redundant annotations add clutter without adding value.

---

### Concept 4: The `void` Return Type

#### 🧠 What is it?

Some functions don't return anything — they just perform an action (like logging to the console). These functions have a special return type: **`void`**.

#### ⚙️ How it works

```typescript
function printOutput(value: any): void {
  console.log(value);
}
```

`void` means: "this function intentionally does not return a value."

#### ❓ Why do we need it?

It signals to other developers (and TypeScript) that the function's purpose is a **side effect**, not a computation. You shouldn't try to use the return value of a `void` function.

#### 🧪 Example

```typescript
function printOutput(value: any): void {
  console.log(value);
}

const result = printOutput("hello"); // result is undefined
```

#### 💡 Insight

`void` is comparable to `null` or `undefined`, but it's specifically used for function return types. If you try to use the return value of a `void` function, you'll get `undefined` — but the `void` annotation makes the intent clear: **don't use the return value**.

---

## ✅ Key Takeaways

- Function parameters use the same colon-type syntax as variables: `(a: number, b: number)`
- TypeScript **infers the return type** automatically from the function body
- You can explicitly set a return type after the parameter list: `function add(...): number`
- Use **`void`** as the return type for functions that don't return anything
- Let TypeScript infer return types unless you have a reason to be explicit

## ⚠️ Common Mistakes

- Naming your function `print` — it clashes with JavaScript's built-in `print` (which triggers the browser's print dialog). Use `printOutput` or similar instead
- Explicitly setting return types that TypeScript already infers — adds clutter without value
- Using `undefined` instead of `void` for functions with no return — use `void` for function return types

## 💡 Pro Tips

- In React, event handler functions typically return `void` — they perform side effects (like updating state) without returning anything
- `any` as a parameter type is acceptable in rare cases (like a generic logging function), but prefer specific types when possible
