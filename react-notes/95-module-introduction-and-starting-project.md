# Module Introduction & Starting Project

## Introduction

You now have a solid understanding of building components, managing state, and handling user interactions. But there's a whole dimension of React development we haven't explored yet: **styling**. How do you actually make your React apps look good? As it turns out, there's no single "right" answer—React gives you multiple approaches, each with its own trade-offs.

---

## What This Section Covers

This section is **not** about teaching CSS itself. It's about understanding the different *ways* you can apply CSS to React components. Each approach has distinct advantages and disadvantages, and knowing when to use which one is an important skill for any React developer.

### The Four Approaches

1. **Vanilla CSS** — Plain CSS files imported into your components. The simplest approach, and the one you've already been using.

2. **CSS Modules** — A way to *scope* your CSS rules to specific components so styles don't accidentally leak across your app.

3. **Styled Components** — A popular third-party package that lets you write CSS directly in your JavaScript files, attached to specific components.

4. **Tailwind CSS** — A utility-first CSS framework where you style elements by adding pre-defined CSS classes directly in your JSX.

For each approach, you'll learn:
- How to apply **static styles** (styles that never change)
- How to apply **dynamic/conditional styles** (styles that change based on state or conditions)

---

## The Starting Project

The starting project is a simple login page with:
- Email and password input fields
- A "Sign In" button
- A "Create a new account" link (non-functional—it's just for styling practice)

What it already does:
- Entering **invalid** credentials and clicking "Sign In" highlights the inputs with red backgrounds and borders
- The page already has styles applied via a single vanilla CSS file

What it doesn't do:
- Actually authenticate anyone (this is purely a styling exercise)

---

## Setting Up

If using the local version:
1. Download and extract the starting project
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

If using CodeSandbox, no setup required—just open the link.

---

## ✅ Key Takeaways

- React doesn't enforce a single styling approach—you choose what fits your project
- You'll learn four approaches: Vanilla CSS, CSS Modules, Styled Components, and Tailwind CSS
- Each approach has trade-offs in terms of scoping, separation of concerns, and developer experience
- This section focuses on *how to apply CSS in React*, not on CSS fundamentals

## 💡 Pro Tips

- In real projects, teams typically pick **one** styling approach and use it consistently throughout the app
- There's no universally "best" approach—it depends on team preferences, project size, and tooling
- Understanding all four approaches makes you versatile and lets you adapt to any React codebase
