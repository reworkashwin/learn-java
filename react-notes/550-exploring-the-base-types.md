# Exploring the Base Types

## Introduction

Now it's time to get hands-on with TypeScript's core types. These are the building blocks you'll use constantly — in every variable, every function parameter, and every return value. If you understand these primitives, everything else in TypeScript becomes much easier to grasp.

---

### Concept 1: Primitive Types — number, string, boolean

#### 🧠 What is it?

TypeScript has the same primitive types as JavaScript: `number`, `string`, `boolean`, as well as `null` and `undefined`. The difference is that TypeScript lets you **explicitly declare** which type a variable should hold.

#### ⚙️ How it works

You declare a type by adding a **colon** after the variable name, followed by the type:

```typescript
let age: number;
age = 30;     // ✅ Works
age = "30";   // ❌ Error: Type 'string' is not assignable to type 'number'
```

The same works for strings and booleans:

```typescript
let username: string;
username = "Ashwin";  // ✅

let isInstructor: boolean;
isInstructor = true;  // ✅
```

#### 🧪 Example

```typescript
let age: number;
age = 30;       // ✅
age = 30.5;     // ✅ — floats are also numbers

let username: string = "Ashwin";
let isInstructor: boolean = true;
```

#### 💡 Insight

You can declare and assign in one step — you don't need to separate declaration and assignment. Both approaches are valid.

---

### Concept 2: Lowercase Types Matter!

#### 🧠 What is it?

A very common beginner mistake: always use **lowercase** type names in TypeScript.

#### ⚠️ Why does this matter?

```typescript
let age: number;   // ✅ Correct — primitive type
let age: Number;   // ❌ Wrong — this refers to the JavaScript Number OBJECT
```

`Number` (capitalized) refers to the JavaScript `Number` wrapper object, not the primitive `number` type. TypeScript won't throw an error, but it's semantically wrong and can cause subtle issues.

The same applies to `string` vs `String` and `boolean` vs `Boolean`.

#### 💡 Insight

**Rule of thumb**: Always use lowercase — `number`, `string`, `boolean`. Never use the capitalized versions in type annotations.

---

### Concept 3: null and undefined

#### 🧠 What is it?

TypeScript also has `null` and `undefined` as types, but you rarely use them as standalone type annotations.

#### ⚙️ How it works

```typescript
let hobbies: null;
hobbies = null;     // ✅
hobbies = "coding"; // ❌ — can only ever be null
```

Setting a variable's type to `null` means it can *only* hold `null` — which isn't useful on its own.

#### 💡 Insight

You'll encounter `null` and `undefined` later when combined with **union types** (e.g., `string | null`). On their own, they're not practical as type assignments. But they become very useful in combination with other types.

---

## ✅ Key Takeaways

- The core primitive types are: `number`, `string`, `boolean`
- Always use **lowercase** type names (`number`, not `Number`)
- Type annotations go after a colon: `let age: number`
- `null` and `undefined` exist as types but are rarely used alone
- You can declare and assign a value in one step, or declare first and assign later

## ⚠️ Common Mistakes

- Using `Number` instead of `number` — the capitalized version is the wrapper object
- Setting a variable's type to `null` or `undefined` alone — that's almost never what you want
- Forgetting the colon syntax: it's `let x: number`, not `let x number`

## 💡 Pro Tips

- Later, when we learn about **type inference**, you'll see that you don't always need to write these type annotations manually — TypeScript can figure them out for you
- Think of type annotations as **contracts**: "I promise this variable will always hold a number"
