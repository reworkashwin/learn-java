# Module Introduction — Handling Side Effects & useEffect

## Introduction

You've mastered state, context, and reducers. Now it's time to tackle another fundamental React concept: **side effects**. Almost every real React app has them — fetching data, accessing browser APIs, setting timers, interacting with local storage. Understanding how to handle them correctly is essential.

---

## What You'll Learn

In this section, you'll work on a **PlacePicker** application — a tool for selecting places you'd like to visit. While building and enhancing this app, you'll learn:

### 1. What Side Effects Are
Tasks that your app needs to perform but that aren't directly related to rendering UI. They don't fit neatly into the "return JSX" flow of a component function.

### 2. The `useEffect` Hook
React's built-in hook for managing side effects — when to use it, how to configure its dependencies, and how it fits into the component lifecycle.

### 3. When NOT to Use `useEffect`
Just as important as knowing when to use it. Not every side effect needs `useEffect`, and overusing it is a common mistake.

---

## The Starting Project

The PlacePicker app allows you to:
- View a list of available places
- Select places you'd like to visit
- Remove places from your selection

The project uses features you already know — `useState`, refs, and `useImperativeHandle`. The components are straightforward, and there's a `data.js` file with place data and a `loc.js` file with location calculation utilities.

---

## Why This Section Matters

Side effects show up everywhere:
- **Fetch data** from an API when a component loads
- **Read from localStorage** to restore saved state
- **Get the user's geolocation** from the browser
- **Set up timers** or intervals
- **Interact with third-party libraries** that manipulate the DOM

Without proper side effect management, you'll run into infinite loops, stale data, memory leaks, or components that don't update when they should. `useEffect` is your primary tool for handling these scenarios correctly.

---

## ✅ Key Takeaways

- **Side effects** are essential tasks that don't directly relate to rendering
- **`useEffect`** is React's hook for managing side effects
- Knowing when **not** to use `useEffect` is equally important
- This section builds a PlacePicker app to explore side effects hands-on
