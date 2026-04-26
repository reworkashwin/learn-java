# Writing More Complex JSX Code

## Introduction

Our first custom component returned just a single `<h2>` tag — not exactly impressive. Real components need richer HTML structures with multiple elements. But as you'll discover, JSX has an important rule about how you structure your returned code. Let's build out a more realistic component and learn the rules along the way.

---

### Concept 1: Building a More Realistic Component

#### 🧠 What is it?

An expense item needs to display three pieces of information:
- **Date** — when the expense occurred
- **Title** — what the expense was for
- **Amount** — how much it cost

So we need a more complex HTML structure to display all of this.

#### 🧪 Example

```jsx
function ExpenseItem() {
  return (
    <div>
      <div>March 28th, 2021</div>
      <div>
        <h2>Car Insurance</h2>
        <div>$249.67</div>
      </div>
    </div>
  );
}
```

---

### Concept 2: The One Root Element Rule

#### 🧠 What is it?

In React, your returned JSX **must have exactly one root element**. You cannot return multiple sibling elements side by side.

#### ❓ Why do we need it?

This is a fundamental JSX rule. Under the hood, each JSX expression gets converted to a single `React.createElement()` call, which can only create one element at a time.

#### 🧪 Example

**❌ This will NOT work:**
```jsx
return (
  <div>Date</div>
  <div>Title</div>
);
```

Two sibling elements at the root level — React doesn't know which one to return.

**✅ This WILL work:**
```jsx
return (
  <div>
    <div>Date</div>
    <div>Title</div>
  </div>
);
```

Wrap everything in a single parent element (a `<div>` is the simplest solution).

#### 💡 Insight

There are other workarounds for this rule (like React Fragments — `<>...</>`) that you'll learn about later. For now, wrapping in a `<div>` is the simplest approach.

---

### Concept 3: Multi-Line JSX with Parentheses

#### 🧠 What is it?

When your JSX spans multiple lines (which it almost always will for complex components), you need to wrap it in **parentheses** `()` after the `return` keyword.

#### ❓ Why do we need it?

Without parentheses, JavaScript's automatic semicolon insertion might interpret `return` on its own line as `return;` (returning `undefined`), cutting off your JSX.

#### 🧪 Example

**❌ Risky:**
```jsx
return
  <div>
    <h2>Title</h2>
  </div>
```
JavaScript may interpret this as `return;` followed by orphaned JSX.

**✅ Safe:**
```jsx
return (
  <div>
    <h2>Title</h2>
  </div>
);
```

The parentheses tell JavaScript: "This entire block is one expression being returned."

---

### Concept 4: Nesting Elements Inside the Root

#### 🧠 What is it?

While you can only have **one root element**, you can nest as many elements as you want **inside** that root.

#### ⚙️ How it works

```jsx
return (
  <div>                          {/* Root element */}
    <div>March 28th, 2021</div>  {/* Child 1 */}
    <div>                         {/* Child 2 */}
      <h2>Car Insurance</h2>     {/* Nested child */}
      <div>$249.67</div>          {/* Nested child */}
    </div>
  </div>
);
```

Inside the root `<div>`, you can have siblings, nested elements, and any HTML structure you need.

---

### Concept 5: Auto-Formatting Your Code

#### 🧠 What is it?

As JSX gets more complex, keeping it readable is crucial. Use your IDE's **auto-format** feature to keep things clean.

#### ⚙️ How it works

- In VS Code: Use the "Format Document" shortcut (find it under Preferences → Keyboard Shortcuts)
- It automatically indents and structures your JSX for readability
- Use it frequently — especially after restructuring JSX

#### 💡 Insight

Clean, well-formatted code isn't just about aesthetics — it helps you spot structural issues (like missing closing tags) at a glance.

---

## ✅ Key Takeaways

- Components can have complex, nested HTML structures
- JSX **must** have exactly one root element per return statement
- Wrap multi-line JSX in parentheses `()` to avoid JavaScript pitfalls
- Inside the root element, you can nest as many elements as you want
- Use auto-formatting to keep your JSX readable

---

## ⚠️ Common Mistakes

- Returning multiple sibling elements without a wrapper — this will cause an error
- Forgetting parentheses around multi-line JSX — may silently return `undefined`
- Making components too flat — don't be afraid to nest elements for proper structure

---

## 💡 Pro Tips

- If you don't want an extra `<div>` in your DOM, you'll learn about **React Fragments** (`<>...</>`) later — they solve this cleanly
- Keep your component's JSX focused — if it's getting too long, it might be time to extract child components
