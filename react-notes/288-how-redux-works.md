# How Redux Works

## Introduction

Now that we understand *what* Redux is and *why* we might use it, the burning question is: **how does it actually work?** Redux has a very specific data flow architecture, and understanding it conceptually before writing code will save you a lot of confusion.

---

## The Central Data Store

Redux revolves around **one Central Data Store** for your entire application. This is the single source of truth for all your cross-component and app-wide state.

One store. Not two. Not ten. **Exactly one.**

Everything goes in there — authentication state, theme, user input, UI state — all of it lives in this single store.

> "But won't a single store become unmanageable?"

Great question. The answer is: you don't directly manage the entire store at once. Redux provides patterns for organizing and splitting your logic while still having a single store. We'll explore this as we go.

---

## The Core Data Flow

Redux has a strict, predictable data flow with four key players:

### 1. The Store (Central Data)
Holds all your application state in one place.

### 2. Components (Subscribers)
Components need data from the store to render the UI. They **subscribe** to the store. When data in the store changes, Redux notifies subscribed components, and they can grab the slice of data they need (e.g., the current authentication status).

Think of it like subscribing to a newsletter — you sign up once, and whenever there's new content, it arrives automatically.

### 3. Reducers (State Updaters)
Here's a critical rule: **Components NEVER directly manipulate store data.** There's no two-way binding.

Instead, a **Reducer function** is responsible for changing the store data. You write this function, and it takes some input and produces a new state as output.

> The term "reducer" is a general programming concept — a function that takes inputs and transforms them into a new output (like reducing a list of numbers to their sum). It's the same concept behind `useReducer`, but this is a different, separate reducer for Redux.

### 4. Actions (Triggers)
If components can't change the store directly but reducers can, how do components tell reducers what to do? Through **Actions**.

An action is a simple JavaScript object that **describes** what operation should happen. Components **dispatch** actions. Redux then **forwards** those actions to the reducer. The reducer reads the action, performs the appropriate operation, and produces a new state.

---

## The Complete Flow

Here's the full cycle, step by step:

```
Component dispatches an Action
       ↓
Action is forwarded to the Reducer
       ↓
Reducer reads the action, performs the operation
       ↓
Reducer returns a NEW state object
       ↓
Store is updated with the new state
       ↓
Subscribed components are notified
       ↓
Components re-render with the updated data
```

This is a **one-direction flow**. Data always moves in this cycle. Components never reach into the store and mutate things. They dispatch actions, reducers process them, and the store updates.

---

## An Analogy

Think of Redux like a restaurant:

- **The Store** is the kitchen where all the food (state) is prepared
- **Components** are the customers at tables — they receive food but never walk into the kitchen
- **Actions** are the order slips — they describe what the customer wants
- **The Reducer** is the chef — they read the order, prepare the food, and send it out

A customer doesn't cook their own meal. They place an order. The chef processes it. The food arrives. That's the flow.

---

## ✅ Key Takeaways

- Redux uses **one central store** for all application state
- Components **subscribe** to the store to receive data
- Components **never directly modify** the store
- **Reducer functions** are responsible for producing new state
- Components **dispatch actions** — simple objects describing what should happen
- Redux forwards actions to reducers, which update the store, which notifies components

## 💡 Pro Tip

The unidirectional data flow is what makes Redux predictable and debuggable. Because state changes always follow the same path (Action → Reducer → Store → UI), you can trace exactly how and why your state changed at any point.
