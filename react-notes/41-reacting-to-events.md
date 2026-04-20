# Reacting to Events

## Introduction

We have buttons on screen — but clicking them does nothing. Time to make our app **interactive**. In React, handling user events (clicks, inputs, hovers) works differently from vanilla JavaScript. Let's learn the React way.

---

## Vanilla JavaScript vs. React

In traditional JavaScript, you'd do something like this:

```javascript
document.querySelector('button').addEventListener('click', () => {
  console.log('Clicked!');
});
```

You **select** an element, then **attach** a listener. This is **imperative** code — you're telling the browser step by step what to do.

But React is **declarative**. You don't interact with the DOM directly. Instead, you tell React *what* should happen, and React handles the DOM.

---

## Event Handling in React

React uses special **event props** on elements. They start with `on` followed by the event name:

```jsx
<button onClick={handleClick}>Click Me</button>
```

### Available Event Props

There are many — here are the most common:

| Event Prop | Triggers When... |
|------------|-------------------|
| `onClick` | Element is clicked |
| `onChange` | Input value changes |
| `onSubmit` | Form is submitted |
| `onMouseEnter` | Mouse enters element |
| `onKeyDown` | Key is pressed down |

You can use `on` props on **any** element, not just buttons.

---

## Creating an Event Handler

Define the function inside your component, then **reference** it (don't call it!) in the prop:

```jsx
function TabButton({ children }) {
  function handleClick() {
    console.log('Hello World!');
  }

  return (
    <li>
      <button onClick={handleClick}>{children}</button>
    </li>
  );
}
```

### The Critical Rule: Don't Add Parentheses!

```jsx
<button onClick={handleClick}>   ✅ Pass the function reference
<button onClick={handleClick()}> ❌ EXECUTES immediately on render!
```

Why? Adding `()` **calls** the function right when the JSX renders. You want React to call it **later**, when the event actually happens.

> Think of it like setting an alarm: you *set* it now, but it *triggers* in the future. You don't want the alarm to go off the moment you set it.

---

## Naming Convention

While you can name handler functions anything, the community convention is:

- `handle` + EventName: `handleClick`, `handleChange`, `handleSubmit`
- Or EventName + `Handler`: `clickHandler`, `changeHandler`

The first pattern is more common:

```jsx
function handleClick() { ... }
function handleSubmit() { ... }
function handleMouseEnter() { ... }
```

---

## Why Define Handlers Inside Components?

Defining handler functions inside the component function is intentional:

1. They have access to the component's **props and state** (via closure)
2. They stay **colocated** with the JSX that uses them
3. They're **scoped** to the component — not polluting the global namespace

---

## ✅ Key Takeaways

- React handles events with special `on` props: `onClick`, `onChange`, `onSubmit`, etc.
- Pass a **function reference** — not a function call — to the event prop
- Define handler functions **inside** the component function
- Use naming conventions like `handleClick` or `clickHandler`
- This approach is **declarative** — you describe *what* happens, React handles the DOM

## ⚠️ Common Mistakes

- Adding parentheses: `onClick={handleClick()}` — this calls the function immediately instead of on click
- Forgetting to define the handler function before using it
- Trying to use `addEventListener` inside React components — this bypasses React's event system

## 💡 Pro Tips

- React's event system uses **synthetic events** — they behave like native events but are cross-browser compatible
- Event handler functions automatically receive an **event object** as a parameter: `function handleClick(event) { ... }`
- You can add `onClick` to any element (even `<div>`), though for accessibility, prefer semantic elements like `<button>`
