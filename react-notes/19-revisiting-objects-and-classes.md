# Revisiting Objects & Classes

## Introduction

So far, we've worked with simple values like strings and numbers. But real applications deal with complex, structured data — a user has a name, an age, a role, and maybe some actions they can perform. That's where **objects** come in. They let you group related data (and functionality) together into a single unit.

---

## Creating Objects

You create an object using curly braces `{}` with **key-value pairs** inside:

```javascript
const user = {
  name: "Max",
  age: 34,
};
```

Each key (also called a **property name**) is followed by a colon and its value. Multiple properties are separated by commas.

Think of an object as a labeled container — each label (key) points to a specific piece of data (value).

---

## Accessing Object Properties

You access properties using **dot notation**:

```javascript
console.log(user.name); // "Max"
console.log(user.age);  // 34
```

The dot (`.`) is your key to reaching inside an object and pulling out the value you need.

---

## Methods — Functions Inside Objects

Objects can also contain functions. When a function lives inside an object, we call it a **method**:

```javascript
const user = {
  name: "Max",
  age: 34,
  greet() {
    console.log("Hello!");
    console.log(this.age);  // Access other properties with 'this'
  },
};

user.greet(); // "Hello!" followed by 34
```

### The `this` Keyword

Inside a method, `this` refers to the object the method belongs to. It lets you access other properties and methods of the same object:

```javascript
greet() {
  console.log(this.age); // 'this' points to the 'user' object
}
```

💡 **Pro Tip:** The `this` keyword won't be heavily used in this React course since we'll primarily work with functional components, not classes. But it's good to know about it.

---

## Classes — Blueprints for Objects

What if you need to create many objects with the same structure? Instead of writing each one by hand, you can create a **class** — a blueprint for objects:

```javascript
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log("Hi!");
  }
}
```

### Key rules for classes:
- Class names should start with a **capital letter** (`User`, not `user`)
- The `constructor` is a special method that runs when you create a new object
- Use `this` to assign properties to the object being created

---

## Instantiating a Class

You create an object from a class using the `new` keyword:

```javascript
const user1 = new User("Manuel", 35);

console.log(user1);       // User { name: "Manuel", age: 35 }
console.log(user1.name);  // "Manuel"
user1.greet();             // "Hi!"
```

The `new` keyword:
1. Creates a new empty object
2. Runs the `constructor` method with the provided arguments
3. Returns the newly created object

Every object created from the class automatically gets all the methods defined in the class (like `greet`).

---

## Objects vs. Classes — When to Use What?

| Approach | Use When |
|----------|----------|
| Object literal `{}` | You need a one-off grouping of data |
| Class | You need to create multiple objects with the same structure |

In React, you'll use **object literals** constantly (for props, state, configuration). Classes are less common in modern React but still good to understand.

---

## ✅ Key Takeaways

- Objects group related data using key-value pairs: `{ name: "Max", age: 34 }`
- Access properties with dot notation: `user.name`
- Methods are functions defined inside objects
- `this` inside a method refers to the owning object
- Classes are blueprints for creating multiple objects with the same structure
- Use `new ClassName()` to instantiate an object from a class

## ⚠️ Common Mistakes

- Forgetting the comma between object properties
- Using `this` outside of a method context where it doesn't point to what you expect
- Naming classes with lowercase (convention is `PascalCase` for classes)

## 💡 Pro Tips

- In React, you'll use objects everywhere — props, state, inline styles, and configuration are all objects
- Modern React favors functional components over class components, so you'll mostly use object literals rather than classes
- Class names use `PascalCase` — this same convention applies to React component names
