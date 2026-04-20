# Preparing a New Project

## Introduction

We've explored Redux in isolation using plain Node.js. Now it's time to apply everything we've learned inside an actual **React application**. This lecture is about setting up the project and installing the right packages.

---

## The Project Setup

The starting project is a simple React app with a few prepared components — primarily a counter display on screen. Nothing fancy, but it gives us the structure we need to practice Redux integration.

After downloading (or creating) the project:

```bash
npm install
npm start
```

This brings up the dev server and a basic UI with a counter display area.

---

## Installing Redux Packages

We need **two** packages:

### 1. `redux`
The core Redux library. This is the same package we used in our Node.js demo — it handles `createStore`, reducers, dispatching, and subscriptions.

### 2. `react-redux`
This is the **bridge** between Redux and React. Redux itself knows nothing about React. It doesn't care about components, hooks, or JSX. The `react-redux` package provides the tools that make connecting React components to a Redux store simple — things like subscribing components to store data and dispatching actions from inside components.

Install both:

```bash
npm install redux react-redux
```

---

## Why Two Packages?

Think of it this way:

- **Redux** = the engine (manages state, reducers, actions)
- **react-redux** = the steering wheel (lets React components drive that engine)

You need both. Redux handles the state logic. React-Redux handles the React integration.

---

## ✅ Key Takeaways

- To use Redux in React, install both `redux` and `react-redux`
- `redux` is the core library — framework-agnostic state management
- `react-redux` provides React-specific bindings (hooks, Provider component)
- You need both working together to use Redux in a React app

## 💡 Pro Tip

In modern projects, you'll often install `@reduxjs/toolkit` instead of (or in addition to) the bare `redux` package. Redux Toolkit includes Redux and adds convenience utilities. We'll explore this later in the course.
