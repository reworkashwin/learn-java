# Wrap Up & Next Steps

## Introduction

The expense tracker demo app is complete — and with it, you've covered a huge chunk of React's core concepts. This lesson takes a moment to reflect on what was built, acknowledge what's still ahead, and set the stage for deeper React learning.

---

## What We Built

### 🧠 What is it?

A fully functional **Expense Tracker** application featuring:
- Adding new expenses via a form
- Filtering expenses by year
- Displaying a dynamic chart with monthly expense bars
- Conditional content when no expenses match the filter
- Efficient list rendering with keys

### 💡 Insight

This single project touched nearly every core React concept: components, props, state, event handling, two-way binding, lifting state up, conditional rendering, list rendering, keys, and dynamic styles.

---

## What's Coming Next

### ⚙️ Topics ahead

- **Scoped styling** — Right now, all CSS styles are global. A class defined in `ChartBar.css` could be used in any component. Future modules cover CSS Modules, styled-components, and other approaches to scope styles to specific components.
- **More core React features** — Hooks beyond `useState`, effects, context, refs, and more
- **Practice projects** — Hands-on projects to reinforce everything learned so far

---

## An Important Note About CSS

### ⚠️ Current limitation

All CSS files in the project have component-specific **file names**, but the styles themselves are **globally scoped**. If you define a `.chart-bar` class in `ChartBar.css`, that class is available everywhere in the app — not just in the `ChartBar` component.

This works fine for small projects but becomes a maintenance headache as apps grow. Scoped styling solutions solve this problem.

---

## ✅ Key Takeaways

- The expense tracker covered **all core React concepts** you need as a foundation
- CSS in React is **globally scoped by default** — scoping solutions come in later modules
- Practice is essential — try tweaking the app, adding features, or rebuilding it from scratch
- The next sections dive deeper into styling, hooks, and more advanced patterns

## 💡 Pro Tips

- Before moving on, try adding a feature to the expense tracker on your own — editing expenses, deleting them, or persisting data to `localStorage`
- Revisit the app later after learning new concepts (like `useEffect` or context) and refactor it — that's one of the best ways to solidify your understanding
