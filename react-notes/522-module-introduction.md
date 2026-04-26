# Replacing Redux with React Hooks & Context API

## Introduction

Redux is a powerful, widely-used state management library — but what if you didn't need it at all? What if React itself gave you enough tools to manage global state without any third-party dependency?

That's exactly what this module explores. We'll dive into two alternative approaches to replacing Redux using **React's Context API** and **custom React Hooks**. This isn't about Redux being "bad" — it's about understanding your options and getting creative with what React already gives you.

Even if you decide to keep Redux, this module will deepen your understanding of the Context API and hooks in ways that make you a better React developer overall.

---

### Concept 1: Why Explore Redux Alternatives?

#### 🧠 What is it?

This module is a bonus deep-dive into replacing Redux — the application-wide state management system — with React-only tools: the **Context API** and **React Hooks**.

#### ❓ Why do we need it?

- You might want to stay in the "React-only" world and avoid learning or depending on an extra library
- Removing Redux and `react-redux` from your project means a **smaller bundle size** — less code shipped to the browser
- You might simply be curious about what's possible with React's built-in features

#### ⚙️ How it works

We'll explore **two approaches** in this module:
1. **Context API** — a built-in React feature for passing data through the component tree without props
2. **Custom Hook Store** — a creative pattern that builds a Redux-like global store using only React hooks and plain JavaScript

#### 💡 Insight

This module isn't just about replacing Redux — it's about understanding the **limits and power** of React's own tools. By the end, you'll have a much deeper intuition for when to reach for a third-party library and when React itself is enough.

---

## ✅ Key Takeaways

- Redux is great, but it's not the only option for global state management
- React's Context API and custom hooks can be combined creatively to replace Redux
- This module is **optional** — you don't *have* to replace Redux, but understanding alternatives makes you a stronger developer

## 💡 Pro Tips

- Even if you keep using Redux in production, understanding these patterns helps you write better hooks and context-based code
- The concepts here apply broadly — custom hooks that share data across components are useful in many scenarios beyond state management
