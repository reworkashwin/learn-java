# Another Look At State In React Apps

## Introduction

Before diving headfirst into Redux, we need to revisit something we've been working with all along — **state**. Why? Because Redux is a state management tool, and to understand *why* it exists, we need a crystal-clear picture of the different *kinds* of state in React applications and where traditional state management starts to struggle.

Think of this as zooming out before zooming in — understanding the landscape before we build on it.

---

## The Three Kinds of State

State is data that changes over time and affects what we display on the screen. When something changes — a user clicks a button, submits a form, logs in — that's state at work. React's hooks like `useState` and `useReducer` let us manage this state and tell React to re-render accordingly.

But not all state is created equal. We can split state into three distinct categories:

### 1. Local State

Local state belongs to a **single component**. It lives there, it dies there, and no other component cares about it.

**Examples:**
- Tracking user input in a text field keystroke by keystroke
- Toggling a details section open/closed with a button

**How we manage it:** `useState` or `useReducer` — right inside the component. Simple and clean.

### 2. Cross-Component State

This is state that **affects multiple components** working together. No single component owns it — several need to read it or change it.

**Example:** A modal overlay. The *trigger* to open the modal lives in one component (maybe a button on a page). The modal itself is a separate component. The *close* button lives inside the modal. Multiple components need to coordinate to show and hide this modal.

**How we manage it:** Still `useState` or `useReducer`, but now we need **prop chains** — passing state values and updating functions through layers of components. This is also called **prop drilling**, and while it works perfectly fine, it adds complexity.

### 3. App-Wide State

When state affects **virtually every component** in your application, that's app-wide state.

**Example:** User authentication. When a user logs in, the navigation bar changes, protected routes become accessible, data displays differently across dozens of components. This isn't about two or three components coordinating — it's the entire app reacting to a single piece of data.

**How we manage it:** Again, `useState`/`useReducer` with props — but passing state through your *entire* component tree? That gets cumbersome fast.

---

## The Problem with Prop Drilling

For local state, React's built-in tools are perfect. But for cross-component and app-wide state, **passing data and updating functions through props** becomes increasingly painful as your app grows. You end up passing props through components that don't even use them, just so a deeply nested child can access some state.

That's why we learned about **React Context** earlier in the course — it's a built-in React feature that eliminates prop chains by letting components access shared state directly.

---

## Enter Redux

Redux solves the **exact same problem** as React Context — managing cross-component and app-wide state without prop drilling.

So both React Context and Redux exist to make state management across multiple components easier.

Which naturally raises an important question: **Why would we need Redux if React Context already does the job?**

That's exactly what we'll explore next.

---

## ✅ Key Takeaways

- State in React falls into three categories: **local**, **cross-component**, and **app-wide**
- Local state is managed easily with `useState` or `useReducer`
- Cross-component and app-wide state require passing props through many layers (prop drilling)
- React Context and Redux both solve the prop drilling problem
- Redux is an **alternative** to React Context for managing shared state

## 💡 Pro Tip

Don't reach for Redux (or even Context) when `useState` is enough. If state only matters to one component, keep it local. Overcomplicating state management is one of the most common mistakes in React apps.
