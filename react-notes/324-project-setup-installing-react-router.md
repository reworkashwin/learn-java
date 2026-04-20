# Project Setup & Installing React Router

## Introduction

Time to get our hands dirty. We're starting with a fresh, minimal React project and installing the package that makes client-side routing possible: `react-router-dom`.

---

## The Starting Project

The project is a basic React app (created with Create React App) with:
- Some starter CSS
- An empty `App` component
- Nothing else — no pages, no routing, no complex structure

This is intentional. We'll build routing from scratch to understand every piece.

---

## Installing React Router

In your terminal, inside the project folder:

```bash
npm install react-router-dom
```

This installs the `react-router-dom` package — the DOM-specific version of React Router designed for web applications (as opposed to `react-router-native` for React Native).

You can learn more at [reactrouter.com](https://reactrouter.com), which has comprehensive API docs and guides.

---

## The Three Steps to Add Routing

Adding routing to a React app is a **three-step process**:

### Step 1: Define Your Routes
Specify which URL paths your app supports and which components should load for each path.

```
/           → HomePage component
/products   → ProductsPage component
/about      → AboutPage component
```

### Step 2: Activate the Router
Create a router instance and render it so React knows about your route definitions.

### Step 3: Build Page Components & Navigation
Create the actual components that represent your pages, and add links so users can navigate between them without manually editing the URL bar.

We'll tackle each step in the following lectures.

---

## ✅ Key Takeaways

- `react-router-dom` is the standard routing library for React web applications
- Install it with `npm install react-router-dom`
- Adding routing is a three-step process: define routes → activate the router → provide navigation
- Start with a clean project to understand each piece before building complexity

## 💡 Pro Tips

- Always check the React Router documentation for version-specific APIs — the library has changed significantly between major versions
- The `react-router-dom` package includes everything from `react-router` plus DOM-specific components, so you only need to install `react-router-dom`
