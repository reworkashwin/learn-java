# Adding Event Listeners

## Introduction

Before we can use state to make our UI dynamic, we need to know **when** something happens — when a user types, clicks, or interacts with our app. That's where **event listeners** come in. In vanilla JavaScript, you'd use `addEventListener`. In React, it's much more declarative and elegant. This section covers how React handles events — a critical prerequisite for working with state.

---

## Concept 1: Events in Vanilla JS vs React

### 🧠 What is it?

In vanilla JavaScript, you set up event listeners **imperatively** — you grab an element with `querySelector`, then call `addEventListener` on it. In React, you take a **declarative approach** by adding special props directly on JSX elements.

### ❓ Why do we need it?

React's philosophy is declarative: you describe *what* the UI should look like, not *how* to build it step by step. Event listeners follow this same pattern — instead of reaching into the DOM, you declare your intent right in the JSX.

### ⚙️ How it works

**Vanilla JS (imperative):**
```javascript
const textarea = document.querySelector('textarea');
textarea.addEventListener('change', function(event) {
  console.log(event.target.value);
});
```

**React (declarative):**
```jsx
<textarea onChange={changeBodyHandler} />
```

The key difference? In React, you don't manually query the DOM. You add the event listener as a prop directly on the element.

### 💡 Insight

Think of it like the difference between giving someone turn-by-turn directions (imperative) versus just telling them the destination and letting GPS figure out the route (declarative). React handles the "how" for you.

---

## Concept 2: The `on` Props Pattern

### 🧠 What is it?

React provides special props that start with `on` followed by the event name in **camelCase**. These props let you attach event listeners to any JSX element.

### ❓ Why do we need it?

Every interactive UI needs to respond to user actions — clicks, key presses, form changes, etc. The `on` props are React's way of wiring these up.

### ⚙️ How it works

- `onChange` — fires when the value of an input/textarea changes
- `onClick` — fires when an element is clicked
- `onKeyDown` — fires on every key press
- `onSubmit` — fires when a form is submitted

The naming convention is always: `on` + event name in PascalCase.

```jsx
<textarea onChange={changeBodyHandler} />
<button onClick={clickHandler} />
<input onKeyDown={keyHandler} />
```

### 💡 Insight

Notice the **camelCase** — it's `onChange`, not `onchange`. This is a JSX requirement, not HTML. React needs camelCase to distinguish its props from standard HTML attributes.

---

## Concept 3: Defining and Connecting Handler Functions

### 🧠 What is it?

A **handler function** is a regular JavaScript function defined inside your component that gets executed when an event occurs. You pass it as a value to an event prop.

### ❓ Why do we need it?

You need to tell React *what code to run* when the event happens. Handler functions are that code.

### ⚙️ How it works

1. Define a function inside your component function (yes, functions inside functions — standard JS!)
2. Pass the function **by name** (no parentheses!) to the event prop
3. React automatically passes an `event` object to your handler

```jsx
function NewPost() {
  function changeBodyHandler(event) {
    console.log(event.target.value);
  }

  return (
    <form>
      <textarea onChange={changeBodyHandler} />
    </form>
  );
}
```

### 🧪 Example

When you type into the textarea, every keystroke triggers `changeBodyHandler`. The `event.target.value` gives you the current content of the textarea — including pasted text, not just typed characters.

### 💡 Insight

The `change` event on a textarea fires on every keystroke *and* on paste. So `event.target.value` always contains the complete current value, not just the latest character.

---

## Concept 4: Why No Parentheses?

### 🧠 What is it?

When passing a function to an event prop, you use just the function name — **without parentheses**. Writing `onChange={changeBodyHandler}` passes the function itself. Writing `onChange={changeBodyHandler()}` would **execute** the function immediately and pass its return value.

### ❓ Why do we need it?

This distinction is critical. You want React to call your function *when the event happens*, not immediately when the component renders.

### ⚙️ How it works

```jsx
// ✅ Correct — passes the function as a value
<textarea onChange={changeBodyHandler} />

// ❌ Wrong — executes the function immediately
<textarea onChange={changeBodyHandler()} />
```

In JavaScript, functions are first-class values — they can be passed around like strings, numbers, or objects. That's exactly what we're doing here: passing the function as a value to a prop.

### 💡 Insight

Think of it like handing someone a recipe card (the function itself) vs. cooking the meal and handing them the plate (the function's return value). React needs the recipe card — it'll do the cooking when the time is right.

---

## Concept 5: The Event Object

### 🧠 What is it?

When an event handler is triggered, React automatically passes an **event object** as the first argument to your handler function. This object contains information about the event — what triggered it, the target element, and more.

### ❓ Why do we need it?

The event object lets you access details about what happened. For form inputs, the most common use is `event.target.value` — the current value of the input element.

### ⚙️ How it works

```jsx
function changeBodyHandler(event) {
  // event.target = the textarea element
  // event.target.value = the text entered by the user
  console.log(event.target.value);
}
```

This is the same behavior as vanilla JavaScript's `addEventListener` — the browser passes an event object to the callback. React simply forwards it.

### 💡 Insight

While events are a separate concept from state, they're deeply connected in practice. Almost every state change is triggered by an event — a click, a form input, a key press. That's why mastering events is a prerequisite for mastering state.

---

## ✅ Key Takeaways

- React uses declarative `on` props (like `onChange`, `onClick`) instead of imperative `addEventListener`
- Event prop names use camelCase: `onChange`, not `onchange`
- Pass handler functions **by name** — no parentheses
- Handler functions automatically receive an `event` object from React
- `event.target.value` gives you the current value of an input or textarea
- It's convention (not required) to name handlers with a `Handler` suffix

## ⚠️ Common Mistakes

- Adding parentheses when passing a function to an event prop — this executes the function immediately
- Using lowercase event names like `onchange` instead of `onChange`
- Forgetting that functions are values in JavaScript — they can be passed around just like strings or numbers

## 💡 Pro Tips

- Name your handler functions descriptively: `changeBodyHandler`, `submitFormHandler`, etc.
- The `Handler` suffix convention makes it clear a function is meant for an event listener
- Use `onChange` for inputs/textareas — it covers both typing and pasting
