# Listening to Events & Working with Event Handlers

## Introduction

How do you make a React app respond when a user clicks a button? It turns out, it's remarkably simple. React gives you access to all native DOM events through special **props** that start with `on`. This lesson walks through adding event listeners to elements, defining handler functions, and understanding the crucial difference between *pointing at* a function and *calling* it.

---

## Concept 1: Adding Event Listeners in React

### 🧠 What is it?

In React, you add event listeners by attaching special props to JSX elements. These props follow the pattern `on` + event name (with a capital first letter). For example, `onClick`, `onChange`, `onSubmit`.

### ❓ Why do we need it?

In vanilla JavaScript, you'd select an element with `document.getElementById()` and call `addEventListener()`. That's the **imperative** way. React takes a **declarative** approach — you attach the listener directly in JSX, right where the element is defined. It's cleaner, more readable, and React manages the lifecycle for you.

### ⚙️ How it works

1. Pick the element you want to listen on (e.g., a `<button>`).
2. Add an `on`-prefixed prop for the event you want to handle (e.g., `onClick`).
3. Pass a **function** as the value — this function will execute when the event occurs.

### 🧪 Example

```jsx
<button onClick={() => console.log('Clicked!')}>Change Title</button>
```

This adds a click event listener to the button. When clicked, it logs "Clicked!" to the console.

### 💡 Insight

React exposes **all native DOM events** as props. If an HTML element supports an event in the browser, React has a corresponding `on` prop for it. `onClick` works on virtually any element. Some events like `onChange` or `onSubmit` are specific to certain elements.

---

## Concept 2: Defining Handler Functions

### 🧠 What is it?

Instead of writing inline anonymous functions in your JSX, you typically define a **named function** before the `return` statement and then reference it in your JSX. This keeps your JSX clean and your logic organized.

### ❓ Why do we need it?

Inline functions work fine for tiny one-liners, but they clutter your JSX when the logic grows. Defining handler functions upfront keeps your JSX readable and makes the handler easy to find and modify.

### ⚙️ How it works

1. Define a function (arrow function or regular function) inside your component, before the `return`.
2. Name it descriptively — a common convention is to end with `Handler` (e.g., `clickHandler`).
3. In your JSX, reference the function **by name** — don't call it.

### 🧪 Example

```jsx
function ExpenseItem(props) {
  const clickHandler = () => {
    console.log('Clicked!!!');
  };

  return (
    <div>
      <h2>{props.title}</h2>
      <button onClick={clickHandler}>Change Title</button>
    </div>
  );
}
```

### 💡 Insight

The `Handler` suffix is a naming convention, not a requirement. It signals that this function isn't called manually by your code — it's triggered by an event, and React calls it for you. You'll see this pattern in many React projects.

---

## Concept 3: Pointing at a Function vs. Calling It

### 🧠 What is it?

This is one of the most critical things to understand about event handlers in React. You **pass the function itself** (a pointer/reference), not the **result of calling it**.

### ❓ Why do we need it?

If you accidentally add parentheses — `onClick={clickHandler()}` — JavaScript will execute the function immediately when the JSX is being parsed, not when the click occurs. Your handler fires during rendering instead of during the event. That's almost never what you want.

### ⚙️ How it works

- ✅ `onClick={clickHandler}` — Passes a reference to the function. React stores it and calls it when a click happens.
- ❌ `onClick={clickHandler()}` — **Calls** the function immediately and passes its return value (likely `undefined`) to `onClick`.

### 🧪 Example

```jsx
// ✅ Correct — function executes on click
<button onClick={clickHandler}>Click Me</button>

// ❌ Wrong — function executes immediately during render
<button onClick={clickHandler()}>Click Me</button>
```

### 💡 Insight

Think of it like handing someone a phone number vs. calling the number yourself. `onClick={clickHandler}` says "here's the number, call it when you need to." `onClick={clickHandler()}` says "I'm calling it right now and handing you whatever they said" — which is rarely useful.

---

## ✅ Key Takeaways

- React uses `on`-prefixed props (e.g., `onClick`, `onChange`) to add event listeners
- Define handler functions before the `return` statement to keep JSX clean
- **Pass the function reference** (`clickHandler`), don't call it (`clickHandler()`)
- React calls the function for you when the event occurs
- All native DOM events have corresponding React prop equivalents

## ⚠️ Common Mistakes

- Adding parentheses to the handler function in JSX — `onClick={clickHandler()}` fires immediately
- Defining event handlers outside the component function — they won't have access to props or state
- Forgetting that the event name must start with a capital letter after `on` — it's `onClick`, not `onclick`

## 💡 Pro Tips

- Naming convention: `clickHandler`, `submitHandler`, `titleChangeHandler` — the `Handler` suffix makes the purpose clear
- You can use either arrow functions or the `function` keyword to define handlers — both work identically
- For quick debugging, inline arrow functions are fine: `onClick={() => console.log('test')}`
- Start simple with `console.log` to verify your handler is wired up correctly before adding real logic
