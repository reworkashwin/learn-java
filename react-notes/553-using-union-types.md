# Using Union Types

## Introduction

So far, every variable we've typed has accepted exactly **one** type — a number, a string, or a boolean. But what if a variable should legitimately hold *more than one* type? Maybe an ID can be either a string or a number. Maybe a value could be a string or `null`. That's where **union types** come in — one of TypeScript's most flexible and commonly used features.

---

### Concept 1: What are Union Types?

#### 🧠 What is it?

A union type is a type definition that allows a variable to hold **more than one type**. You create it using the **pipe operator** (`|`) between the allowed types.

#### ❓ Why do we need it?

In real applications, it's common for values to have multiple valid types:
- A user ID might be a `string` or a `number`
- An API response field might be a `string` or `null`
- A form input value might be `string | number`

Without union types, you'd have to use `any` — which removes all type safety.

#### ⚙️ How it works

```typescript
let course: string | number;

course = "React - The Complete Guide"; // ✅
course = 42;                           // ✅
course = true;                         // ❌ — boolean is not allowed
```

The pipe `|` means "or" — this variable can hold a `string` **or** a `number`, but nothing else.

#### 🧪 Example

```typescript
// A user ID that could be either format
let userId: string | number;
userId = "abc123";  // ✅
userId = 12345;     // ✅

// A username that could be a single string or an array of strings
let username: string | string[];
username = "Ashwin";              // ✅
username = ["Ashwin", "Kumar"];   // ✅
```

#### 💡 Insight

Union types are the TypeScript way of saying: "I want flexibility, but not *unlimited* flexibility." You're still constraining the possible types — just allowing more than one.

---

### Concept 2: Union Types and Type Inference

#### 🧠 What is it?

An important nuance: if you assign an initial value, TypeScript infers a **single type**, not a union. To get a union type, you need to **explicitly declare** it.

#### ⚙️ How it works

```typescript
// Type inference gives you just 'string'
let course = "React Guide";
course = 42; // ❌ — inferred as string only

// Explicit union type allows both
let course: string | number = "React Guide";
course = 42; // ✅
```

#### 💡 Insight

This is one scenario where explicit typing is **not** redundant. Type inference can't know that you *intended* to allow multiple types. You have to tell TypeScript explicitly.

---

### Concept 3: Where Can You Use Union Types?

#### 🧠 What is it?

Union types work anywhere you can place a type annotation — variables, function parameters, return types, object properties, and more.

#### 🧪 Example

```typescript
// Function parameter
function printId(id: string | number) {
  console.log(id);
}

// Object property
let user: {
  name: string;
  age: number | string;
};
```

#### 💡 Insight

You can chain as many types as you need in a union: `string | number | boolean | null`. Just keep it readable — if you're chaining too many types, consider whether a type alias or a redesign might be cleaner.

---

## ✅ Key Takeaways

- Union types allow a variable to accept **multiple types** using the `|` (pipe) operator
- Syntax: `let x: string | number`
- Union types work with variables, parameters, return types, and object properties
- Type inference infers a single type — use explicit unions when you need multiple types
- Union types give you **controlled flexibility** without resorting to `any`

## ⚠️ Common Mistakes

- Relying on type inference when you actually want a union type — inference won't add a union for you
- Using `any` when a union type would be more appropriate and safer
- Forgetting that you need to handle each possible type when consuming a union value

## 💡 Pro Tips

- Union types are extremely common in React — think of state that can be `Data | null` (before data is loaded) or event handlers that accept multiple event types
- You can combine union types with type aliases for clean, reusable definitions
