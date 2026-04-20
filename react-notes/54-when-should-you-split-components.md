# When Should You Split Components?

## Introduction

Our app works perfectly. But the `App` component is doing a lot — managing state, rendering the core concepts section, rendering the interactive tabs area, importing data from multiple sources. Is it too much? How do you know when a component should be split? Let's explore the **signals** that tell you it's time to break things apart.

---

## Signs That a Component Is Too Big

### 1. Multiple Responsibilities

Our `App` component currently handles:
- Rendering the core concepts list (a static feature)
- Managing the tab buttons and selected topic (an interactive feature)
- Importing and organizing data from the data file

These are **different features** living in one component. Each feature could (and probably should) be its own component.

### 2. Unrelated State Causing Unnecessary Re-Renders

Here's a subtle but important issue: when we click a tab button, `selectedTopic` state updates. This causes the **entire** `App` component to re-execute — including the `Header` component within it.

The `Header` contains a `genRandomInt` function that generates a random number for the title text. Every time we click a tab button, the header re-renders with a new random number!

```
Click "JSX" tab → selectedTopic updates → App re-renders
→ Header re-renders → new random number → title text changes!
```

The header has **nothing to do** with the tabs — but because they share the same component, the header is affected by tab state changes.

### 3. Too Many Imports

If a single component file imports from many unrelated sources (data files, multiple child components, hooks), it's often a sign that the component is handling too many things.

---

## The Guiding Principle

> **Each component should have a single, clear responsibility.**

Ask yourself:
- Can I describe what this component does in one sentence?
- If I change one feature, will it break something unrelated?
- Are there parts of this component that don't need to re-render together?

If you answer "yes" to the last two questions, it's time to split.

---

## How to Identify Split Points

Think about your UI in terms of **features**:

- The core concepts section → one component
- The interactive examples/tabs area → another component
- Each individual tab button → its own component (already done)

Each feature gets its own component with its own state, its own imports, and its own responsibilities.

---

## ✅ Key Takeaways

- Split components when they have **multiple unrelated responsibilities**
- Split when state changes in one area cause **unnecessary re-renders** in unrelated areas
- Split when a component has **too many imports** from unrelated sources
- Each component should have a **single, focused purpose**

## ⚠️ Common Mistakes

- **Splitting too early**: Don't create a new component for every single element. Split when there's a clear reason
- **Splitting too late**: Don't wait until a component is 500 lines long. Watch for the signals early
- **Ignoring re-render implications**: State updates re-render the entire component tree from that point down — placing state too high up causes unnecessary work

## 💡 Pro Tips

- A good test: if you can name a component clearly (like `CoreConcepts` or `Examples`), it probably deserves to be its own component
- In larger apps, component splitting isn't just about clean code — it's a **performance optimization** because it limits which parts of the UI re-render
- Think of React components like functions: each should do one thing well
