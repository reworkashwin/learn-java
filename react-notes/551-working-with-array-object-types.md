# Working with Array & Object Types

## Introduction

Primitives are great, but real-world applications deal with **arrays** and **objects** constantly. How do you tell TypeScript what kind of array you want? How do you define the exact shape of an object? That's what we'll cover here — and these concepts are essential for working with React props and state.

---

### Concept 1: Array Types

#### 🧠 What is it?

An array type tells TypeScript that a variable should hold an **array of a specific type** — not just any array, but one where every element matches a particular type.

#### ⚙️ How it works

You define an array type by adding `[]` after the element type:

```typescript
let hobbies: string[];
hobbies = ["Sports", "Cooking"]; // ✅
hobbies = ["Sports", 42];        // ❌ — 42 is not a string
```

This works with any type:

```typescript
let scores: number[];
scores = [100, 95, 88]; // ✅
```

#### 💡 Insight

The syntax `string[]` reads as "an array of strings." Similarly, `number[]` is "an array of numbers." You're combining the element type with the array notation.

---

### Concept 2: Object Types

#### 🧠 What is it?

An object type defines the **exact structure** an object must have — which properties it has, and what types those properties hold.

#### ❓ Why do we need it?

Without an object type, TypeScript assigns the `any` type to your object, meaning any property structure is accepted. That defeats the purpose of TypeScript.

#### ⚙️ How it works

You define an object type using curly braces with property names and their types:

```typescript
let person: {
  name: string;
  age: number;
};

person = { name: "Ashwin", age: 30 };  // ✅
person = { isEmployee: true };          // ❌ — wrong structure
```

Notice: this looks similar to creating an object, but it's in the **type position** (after the colon, before the equals sign). You're defining a type, not a value.

#### 🧪 Example

```typescript
let person: {
  name: string;
  age: number;
};

// ✅ Valid — matches the type definition
person = {
  name: "Ashwin",
  age: 30
};

// ❌ Invalid — wrong properties
person = {
  isEmployee: true
};
```

#### 💡 Insight

The object type definition uses **semicolons** (not commas) to separate properties — another clue that it's a type definition, not an actual object literal.

---

### Concept 3: The `any` Type (and Why to Avoid It)

#### 🧠 What is it?

By default, if you don't assign a type, TypeScript uses the `any` type. This means **anything goes** — any value, any structure, no checks.

```typescript
let person: any;
person = { name: "Ashwin" };   // ✅
person = 42;                   // ✅
person = "hello";              // ✅ — anything is accepted
```

#### ❓ Why do we need it?

You don't, really. Using `any` is essentially opting out of TypeScript. It's a fallback that exists for migration scenarios (converting JS to TS gradually), but in new code, you should almost never use it.

#### 💡 Insight

> Using `any` is like having a security system and leaving the door unlocked. It's there, but it's not doing anything.

---

### Concept 4: Combining Arrays and Objects

#### 🧠 What is it?

You can combine array and object types to define collections of structured data — like an array of person objects.

#### ⚙️ How it works

```typescript
let people: {
  name: string;
  age: number;
}[];
```

The `[]` at the end turns the entire object type into an array type. Now `people` must be an array where every element has a `name` (string) and `age` (number).

#### 🧪 Example

```typescript
let people: {
  name: string;
  age: number;
}[];

people = [
  { name: "Ashwin", age: 30 },
  { name: "Alex", age: 25 }
]; // ✅

people = [
  { name: "Ashwin", age: 30 },
  { isEmployee: true }         // ❌ — doesn't match the type
];
```

#### 💡 Insight

This pattern — arrays of typed objects — is something you'll use *constantly* in React. Think of a list of todos, a list of users, a list of products. Each is an array of objects with a defined shape.

---

## ✅ Key Takeaways

- Array types use the `type[]` syntax: `string[]`, `number[]`, etc.
- Object types define the exact structure using `{ property: type; }` notation
- The `any` type is the default fallback — avoid it in new TypeScript code
- You can combine arrays and objects: `{ name: string; age: number }[]`
- Object type definitions use semicolons, not commas

## ⚠️ Common Mistakes

- Confusing object type definitions with actual object creation — they look similar but serve different purposes
- Using `any` when you could define a proper type
- Forgetting `[]` when you want an array of objects (getting a single object type instead)

## 💡 Pro Tips

- If you're defining the same object structure in multiple places, you'll want **type aliases** — we'll cover those soon
- React props are essentially typed objects, so mastering object types is directly applicable
