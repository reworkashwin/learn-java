# Rendering Content Conditionally

## Introduction

What if we don't want to show any topic data when the page first loads? What if, instead, we want to display a message like "Please select a topic" — and only show the actual content once the user clicks a button?

This is **conditional rendering**, and it's one of the most fundamental patterns in React. You'll use it constantly. Let's explore all the different ways to do it.

---

## The Problem

If we set the initial state to an empty value (or don't set one at all), our previous code breaks:

```jsx
const [selectedTopic, setSelectedTopic] = useState(); // undefined!
```

Why? Because `EXAMPLES[undefined]` doesn't exist — crash!

We need a way to show **different content** depending on whether a topic has been selected or not.

---

## Approach 1: Ternary Expression

The ternary operator (`condition ? valueIfTrue : valueIfFalse`) works directly inside JSX:

```jsx
{!selectedTopic ? (
  <p>Please select a topic.</p>
) : (
  <div id="tab-content">
    <h3>{EXAMPLES[selectedTopic].title}</h3>
    <p>{EXAMPLES[selectedTopic].description}</p>
    <pre><code>{EXAMPLES[selectedTopic].code}</code></pre>
  </div>
)}
```

This is a **single expression** that evaluates to either the fallback paragraph or the content div. It's compact but can get hard to read when the JSX blocks are large.

---

## Approach 2: Logical AND Operator (`&&`)

Instead of one combined ternary, you can use two separate dynamic segments with the `&&` operator:

```jsx
{!selectedTopic && <p>Please select a topic.</p>}
{selectedTopic && (
  <div id="tab-content">
    <h3>{EXAMPLES[selectedTopic].title}</h3>
    <p>{EXAMPLES[selectedTopic].description}</p>
    <pre><code>{EXAMPLES[selectedTopic].code}</code></pre>
  </div>
)}
```

How does this work? In JavaScript, `true && <SomeJSX />` returns `<SomeJSX />`, while `false && <SomeJSX />` returns `false` (which React ignores — it renders nothing).

This approach is often **more readable** because each condition is self-contained.

---

## Approach 3: Variable + `if` Statement (Recommended)

This is the cleanest approach and separates logic from JSX:

```jsx
let tabContent = <p>Please select a topic.</p>;

if (selectedTopic) {
  tabContent = (
    <div id="tab-content">
      <h3>{EXAMPLES[selectedTopic].title}</h3>
      <p>{EXAMPLES[selectedTopic].description}</p>
      <pre><code>{EXAMPLES[selectedTopic].code}</code></pre>
    </div>
  );
}

return (
  // ... other JSX
  {tabContent}
);
```

Why is this great?

1. **JSX stays lean** — your return block is clean and easy to read
2. **Logic is explicit** — a regular `if` statement is instantly understandable
3. **JSX is just a value** — you can store it in variables, pass it around, conditionally assign it

> Remember: JSX code is just a value in JavaScript. You can store it in variables, arrays, pass it as props — it's not magic, it's just syntax.

---

## Comparing All Three Approaches

| Approach | Best For | Readability |
|----------|----------|-------------|
| Ternary (`? :`) | Simple either/or with short JSX blocks | Medium |
| Logical AND (`&&`) | Show-or-hide a single block | Good for simple cases |
| Variable + `if` | Complex conditions, multiple branches | Best for complex logic |

All three are valid. You'll see all three in real-world React codebases, so you need to recognize and understand each one.

---

## ✅ Key Takeaways

- Conditional rendering lets you show different UI based on your app's state
- JSX is just a value — you can store it in variables, return it conditionally, or skip rendering entirely
- `null`, `false`, and `undefined` all render as **nothing** in JSX
- The variable + `if` approach keeps your JSX return block cleanest

## ⚠️ Common Mistakes

- **Using `if` directly inside JSX**: You can't! `if` is a statement, not an expression. Use ternary, `&&`, or extract to a variable
- **Forgetting that `0` is falsy but renders**: `{0 && <Something />}` will render `0` on screen, not nothing — watch out with numeric conditions
- **Overcomplicating**: If you have more than two branches, extract to a variable — don't nest ternaries

## 💡 Pro Tips

- Start with the variable + `if` approach as a beginner — it's the most intuitive
- As you get comfortable, use `&&` for simple show/hide and ternary for simple either/or
- You can combine approaches — use a variable for complex logic, then a ternary for a simple toggle within the return
