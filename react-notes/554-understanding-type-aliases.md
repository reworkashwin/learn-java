# Understanding Type Aliases

## Introduction

As your TypeScript code grows, you'll notice something: you start repeating the same type definitions in multiple places. An object with `name: string` and `age: number` might appear in three different variables. Copy-pasting type definitions is messy and hard to maintain. **Type aliases** solve this by letting you define a type once and reuse it everywhere.

---

### Concept 1: The Duplication Problem

#### 🧠 What is it?

When you define the same complex type in multiple places, you create duplication — and duplication means more maintenance work and more room for errors.

#### 🧪 Example

```typescript
let person: {
  name: string;
  age: number;
};

let people: {
  name: string;
  age: number;
}[];
```

Both `person` and `people` use the exact same object structure. If you later add an `email` field, you'd have to update it in both places.

#### 💡 Insight

This is the classic DRY (Don't Repeat Yourself) principle applied to types. Type aliases are TypeScript's answer to type duplication.

---

### Concept 2: Creating a Type Alias

#### 🧠 What is it?

A type alias is a custom name you give to a type definition. You define it once, and then use the alias wherever you need that type.

#### ⚙️ How it works

Use the `type` keyword (a TypeScript-specific keyword that doesn't exist in plain JavaScript):

```typescript
type Person = {
  name: string;
  age: number;
};
```

Now you can use `Person` anywhere instead of repeating the full object definition:

```typescript
let person: Person;
person = { name: "Ashwin", age: 30 }; // ✅

let people: Person[];
people = [
  { name: "Ashwin", age: 30 },
  { name: "Alex", age: 25 }
]; // ✅
```

#### 💡 Insight

Notice how `Person` works as a single type for one object, and `Person[]` works for an array of those objects. The alias is flexible — you define the base type once and compose it however you need.

---

### Concept 3: What Happens During Compilation?

#### 🧠 What is it?

Type aliases are a **pure TypeScript feature**. They exist only at compile time and are completely removed when TypeScript compiles to JavaScript.

#### ⚙️ How it works

```typescript
// TypeScript
type Person = {
  name: string;
  age: number;
};
let person: Person = { name: "Ashwin", age: 30 };

// Compiled JavaScript — no trace of the type alias
var person = { name: "Ashwin", age: 30 };
```

#### 💡 Insight

Type aliases add **zero overhead** to your runtime code. They only exist to help you and TypeScript during development. The browser never sees them.

---

### Concept 4: Type Aliases for Any Type

#### 🧠 What is it?

Type aliases aren't limited to objects. You can alias **any** type definition — unions, primitives, tuples, etc.

#### 🧪 Example

```typescript
type ID = string | number;

let userId: ID = "abc123";   // ✅
let productId: ID = 42;      // ✅

type StringArray = string[];
let hobbies: StringArray = ["coding", "reading"]; // ✅
```

#### 💡 Insight

Type aliases really shine when you combine them with complex types like unions or nested objects. They make your code **self-documenting** — `ID` is more meaningful than `string | number` repeated everywhere.

---

## ✅ Key Takeaways

- Use the `type` keyword to create reusable type aliases
- Type aliases eliminate duplication — define once, use everywhere
- They work with any type: objects, primitives, unions, arrays
- Type aliases are removed during compilation — zero runtime cost
- They make your code more readable and maintainable

## ⚠️ Common Mistakes

- Repeating the same object type definition instead of extracting it into an alias
- Confusing `type` (TypeScript keyword) with `typeof` (JavaScript operator) — they're different
- Overthinking alias names — keep them clear and descriptive (like `Person`, `ID`, `Todo`)

## 💡 Pro Tips

- In React, type aliases are commonly used for props types: `type TodoProps = { text: string; id: number; }`
- Convention: capitalize type alias names (PascalCase) to distinguish them from variables
- Type aliases and interfaces are often interchangeable for objects — but type aliases are more flexible because they can also alias unions, primitives, etc.
