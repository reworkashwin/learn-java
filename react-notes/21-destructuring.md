# Destructuring

## Introduction

When working with arrays and objects, you'll often need to pull out individual values and store them in separate variables. JavaScript has a clean, modern syntax for this called **destructuring**. It's a shorthand that saves you from repetitive code — and you'll see it used *heavily* throughout React.

---

## Array Destructuring

### The Long Way

Say you have an array of user data:

```javascript
const userNameData = ["Max", "Schwarzmuller"];
```

To extract the first and last name into separate variables, you *could* do this:

```javascript
const firstName = userNameData[0];
const lastName = userNameData[1];
```

It works, but it's verbose.

### The Destructuring Way

Instead, use square brackets on the **left side** of the assignment:

```javascript
const [firstName, lastName] = ["Max", "Schwarzmuller"];

console.log(firstName); // "Max"
console.log(lastName);  // "Schwarzmuller"
```

### How it works:

- Square brackets on the **right** = creating an array
- Square brackets on the **left** = destructuring an array
- The first variable maps to the first array element, the second to the second, and so on
- The variable names are **up to you** — elements are matched by **position**

💡 **Pro Tip:** You can skip elements you don't need by leaving an empty slot: `const [, lastName] = userNameData;`

---

## Object Destructuring

### The Long Way

Given an object:

```javascript
const user = { name: "Max", age: 34 };
```

You *could* extract values like this:

```javascript
const name = user.name;
const age = user.age;
```

### The Destructuring Way

Use curly braces on the **left side**:

```javascript
const { name, age } = { name: "Max", age: 34 };

console.log(name); // "Max"
console.log(age);  // 34
```

### Key difference from array destructuring:

| Feature | Array Destructuring | Object Destructuring |
|---------|-------------------|---------------------|
| Syntax | `[ ]` on the left | `{ }` on the left |
| Matching | By **position** | By **property name** |
| Variable names | Your choice | Must match property names* |

*Unless you use aliases (see below).

---

## Aliases in Object Destructuring

What if you want a different variable name than the property name? Use a **colon** to create an alias:

```javascript
const { name: userName, age } = { name: "Max", age: 34 };

console.log(userName); // "Max"
console.log(age);      // 34
```

### The colon means different things depending on context:

| Context | What `:` does |
|---------|--------------|
| Creating an object (`{ name: "Max" }`) | Separates key from value |
| Destructuring an object (`{ name: userName }`) | Separates property name from alias |

---

## Why Destructuring Matters in React

Destructuring is everywhere in React. Here are the most common patterns you'll encounter:

### Destructuring props:
```jsx
function UserCard({ name, age }) {
  return <p>{name} is {age} years old</p>;
}
```

### Destructuring state from hooks:
```jsx
const [count, setCount] = useState(0);
```

That `useState` line? That's array destructuring! `useState` returns an array of two elements, and you're pulling them out into `count` and `setCount`.

---

## ✅ Key Takeaways

- Array destructuring uses `[]` on the left and matches by **position**
- Object destructuring uses `{}` on the left and matches by **property name**
- Use `:` in object destructuring to assign an **alias** (a different variable name)
- Destructuring is shorter, cleaner, and more readable than manual extraction
- React uses destructuring constantly — for props, state, and more

## ⚠️ Common Mistakes

- Using `{}` for array destructuring or `[]` for object destructuring — use the right brackets for the right type
- Forgetting that object destructuring requires property names to match (or using aliases)
- Confusing the `:` in destructuring (alias) with `:` in object creation (key-value separator)

## 💡 Pro Tips

- You can set **default values** in destructuring: `const { name = "Unknown" } = user;`
- You can destructure nested objects: `const { address: { city } } = user;`
- In React, always destructure props at the top of your component for cleaner code
