# Module Introduction: Building Custom React Hooks

## Introduction

Throughout this course, we've used a lot of React hooks — `useState`, `useEffect`, `useRef`, `useCallback`, and more. These are all **built-in** hooks provided by React.

But what if you could **build your own hooks**? What if you could package up reusable logic — like data fetching, form handling, or animation state — into a clean, shareable function that any component can use?

That's exactly what **custom hooks** let you do, and that's what this section is all about.

---

## What We'll Cover

1. **The Rules of Hooks** — revisited, with an important update
2. **Why custom hooks exist** — what problem they solve
3. **Building custom hooks** — step by step
4. **Using custom hooks** across multiple components

---

## Prerequisites

This section builds on the **data fetching** section. The starting project is actually the finished project from that section — it includes a dummy backend and React code that sends HTTP requests. Make sure you're comfortable with:

- Sending HTTP requests with `fetch()`
- Managing loading/error states
- Using `useEffect` for side effects

---

## Project Setup

If following locally:

```bash
# Frontend
npm install
npm run dev

# Backend (in the backend/ folder)
npm install
node app.js
```

You need **Node.js** installed from [nodejs.org](https://nodejs.org) to run the backend.

---

## ✅ Key Takeaway

Custom hooks are one of React's most powerful features for code reuse. They let you extract and share stateful logic between components without changing your component hierarchy. This section will transform how you think about organizing React code.
