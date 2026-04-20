# Passing Custom Arguments to Event Functions

## Introduction

We can now handle clicks in the parent component — but there's a problem. We have **four** tab buttons, and the same handler runs for all of them. How do we know *which* button was clicked? We need to pass **custom arguments** to our event handler function.

---

## The Problem

Right now, `handleSelect` runs when any button is clicked, but it has no idea which button triggered it:

```jsx
function handleSelect() {
  console.log('A button was clicked');  // But which one?
}
```

We want to receive an **identifier** — like `"components"`, `"jsx"`, `"props"`, or `"state"` — so we can show the right content.

---

## Why `handleSelect("components")` Won't Work

Your first instinct might be to write:

```jsx
<TabButton onSelect={handleSelect("components")}>  ❌
```

But this **calls the function immediately** when the JSX renders! The parentheses execute the function right then and there — before any click happens.

---

## The Solution: Wrap in an Arrow Function

Instead of passing `handleSelect` directly, wrap it in an **anonymous arrow function**:

```jsx
<TabButton onSelect={() => handleSelect('components')}>Components</TabButton>
<TabButton onSelect={() => handleSelect('jsx')}>JSX</TabButton>
<TabButton onSelect={() => handleSelect('props')}>Props</TabButton>
<TabButton onSelect={() => handleSelect('state')}>State</TabButton>
```

### How This Works

1. When JSX renders, only the **arrow function is defined** — not executed
2. The arrow function is passed as the value of `onSelect`
3. When the button is clicked, the arrow function **executes**
4. Inside the arrow function, `handleSelect('components')` is called **with your custom argument**

```
Render time:  () => handleSelect('components')   ← Just a definition
Click time:   handleSelect('components')          ← Now it executes
```

> Think of the arrow function as a **wrapper** that delays execution until the right moment.

---

## Using the Identifier

Now `handleSelect` can receive the identifier and use it:

```jsx
function handleSelect(selectedButton) {
  console.log(selectedButton);  // "components", "jsx", "props", or "state"
}
```

Clicking different buttons now produces different outputs — we know exactly which button was pressed.

---

## This Is a Very Common Pattern

You'll see this pattern constantly in React:

```jsx
// Need to pass arguments to an event handler?
// Wrap it in an arrow function:
onClick={() => doSomething(myArgument)}
```

It works because:
- Without `()` → pass a function reference (React calls it later)
- With arrow function wrapper → you control *how* the function is called when the event fires

---

## ✅ Key Takeaways

- Use **arrow functions** to pass custom arguments to event handlers: `() => handleClick(arg)`
- The arrow function **defers execution** until the event actually fires
- Never call a function directly in a prop: `onClick={fn()}` executes immediately
- This pattern lets you differentiate between multiple instances of the same component

## ⚠️ Common Mistakes

- Writing `onSelect={handleSelect('components')}` — this calls the function during render
- Forgetting the arrow `=>` in the arrow function syntax
- Confusing when the function is *defined* vs. when it's *executed*

## 💡 Pro Tips

- This pattern is sometimes called the "callback wrapper" or "inline handler" pattern
- Arrow functions in JSX create a new function on every render — this is fine for most cases
- You can also pass the **event object** alongside custom args: `(event) => handleSelect('jsx', event)`
