# Passing Data to Components with Props

## Introduction

We can reuse components, but right now every instance is basically the same (aside from random values). What if we want each Post to show a *different* author and *different* text? Just like you can pass different arguments to a function, React lets you pass different data to component instances. This feature is called **Props**, and it's one of the most fundamental concepts in React.

---

## Concept 1: What Are Props?

### 🧠 What is it?

**Props** (short for "properties") are custom attributes you add to your component elements in JSX. They allow you to pass data *into* a component from the place where it's being used — making each instance configurable with different values.

### ❓ Why do we need it?

Without props, every instance of a component renders the exact same content. That's useless for real applications. Imagine a product list where every product card shows the same name and price — pointless! Props make components truly reusable by letting you customize each instance.

Think of it like function arguments:
- A regular function: `add(2, 3)` — you pass different numbers each time
- A React component: `<Post author="Max" body="Hello!" />` — you pass different data each time

### ⚙️ How it works

**Step 1: Pass props where you use the component**

```jsx
// App.jsx
function App() {
  return (
    <main>
      <Post author="Maximilian" body="React.js is awesome!" />
      <Post author="Manuel" body="Check out the full course." />
    </main>
  );
}
```

**Step 2: Receive props inside the component function**

```jsx
// Post.jsx
function Post(props) {
  return (
    <div>
      <p>{props.author}</p>
      <p>{props.body}</p>
    </div>
  );
}
```

### 🧪 Example

The flow:

1. In `App.jsx`, you use `<Post author="Maximilian" body="React.js is awesome!" />`
2. React sees two custom attributes: `author` and `body`
3. React creates an object: `{ author: "Maximilian", body: "React.js is awesome!" }`
4. React calls the `Post` function and passes that object as the first argument
5. Inside `Post`, you access `props.author` and `props.body` to render the values

### 💡 Insight

Props flow in **one direction only** — from parent to child. The App component passes data *down* to the Post component. The Post component cannot send data back up through props. This one-way data flow is a core React principle that keeps your app predictable.

---

## Concept 2: The Props Object

### 🧠 What is it?

Every component function receives **exactly one parameter** from React — an object containing all the props that were set on the component. By convention, this parameter is named `props`, but you can name it anything.

### ⚙️ How it works

The props object has:
- **Keys** = the attribute names you used in JSX (`author`, `body`)
- **Values** = the attribute values you passed (`"Maximilian"`, `"React.js is awesome!"`)

```jsx
// What React passes to your function:
{
  author: "Maximilian",
  body: "React.js is awesome!"
}
```

You access individual props using dot notation: `props.author`, `props.body`.

### 🧪 Example

You can also destructure the props object for cleaner code:

```jsx
function Post({ author, body }) {
  return (
    <div>
      <p>{author}</p>
      <p>{body}</p>
    </div>
  );
}
```

This is the same thing — just more concise. Destructuring is widely used in real React projects.

### 💡 Insight

Props can be **any JavaScript value** — strings, numbers, booleans, arrays, objects, even functions. They're not limited to strings. This makes props incredibly flexible for passing all kinds of data into components.

---

## Concept 3: Not All Components Need Props

### 🧠 What is it?

Props are optional. Some components don't need any external data — they're self-contained. That's perfectly fine.

### ⚙️ How it works

```jsx
// Component WITHOUT props — totally valid
function Header() {
  return <h1>My Application</h1>;
}

// Component WITH props — when it needs external data
function Post({ author, body }) {
  return (
    <div>
      <p>{author}</p>
      <p>{body}</p>
    </div>
  );
}
```

### 💡 Insight

Whether a component needs props depends on its purpose. A main navigation bar might always show the same links — no props needed. A product card needs to display different products — props are essential. It's a design decision you make as a developer.

---

## ✅ Key Takeaways

- **Props** are custom attributes you set on components to pass data into them
- React collects all props into a **single object** and passes it to the component function
- Access props via `props.author` or destructure them: `{ author, body }`
- Props enable **reusability** — the same component with different configurations
- Props flow **one direction**: parent → child
- Not every component needs props — it depends on the use case

## ⚠️ Common Mistakes

- Setting props on the component but forgetting to use them inside the component function (you'll see blank content)
- Forgetting to accept the `props` parameter in the component function
- Trying to modify props inside the component — props are **read-only**

## 💡 Pro Tips

- **Destructure props** in the function signature for cleaner, more readable code
- Name your props descriptively — `author` is better than `a`, `body` is better than `b`
- Props can carry any data type: strings, numbers, objects, arrays, and even functions
