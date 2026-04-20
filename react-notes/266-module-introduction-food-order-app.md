# Module Introduction: Building a Food Order App

## Introduction

Theory is great. Practice is better. Now it's time to take **everything** you've learned in this course — components, state, context, effects, HTTP requests, forms — and build a complete application from scratch.

The project: a **Food Order App** where users can browse meals, add them to a cart, edit the cart, and submit an order through a checkout form to a backend.

---

## What We're Building

The finished app includes:

1. **A header** with a logo and a cart button showing the item count
2. **A meals list** loaded from a backend API
3. **Meal cards** with images, descriptions, prices, and "Add to Cart" buttons
4. **A cart modal** showing selected items with quantity controls
5. **A checkout form** for submitting the order with user details
6. **Backend communication** for fetching meals and submitting orders

This is a realistic, medium-complexity React project — the kind of thing you'd build in a real job or portfolio.

---

## The Project Structure

### Backend (provided)
- A Node/Express server with a `db.json` file simulating a database
- Endpoints for fetching meals and submitting orders
- You don't need to modify the backend — just run it

### Frontend (what you'll build)
- Components, state management, context, HTTP requests, forms
- Everything from the ground up

### Getting it running:

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend  
npm install
npm run dev
```

Both processes must stay running simultaneously.

---

## The Challenge

Before following along with the solution, try building it yourself. Here's what you need to implement:

- **Components**: Header, Meals list, individual MealItem, Cart (modal), Checkout form
- **Data fetching**: GET request to load meals from the backend
- **Cart management**: Add/remove items, track quantities, calculate totals
- **Order submission**: POST request to send the order to the backend
- **State management**: Decide when to use local state vs context

The `index.css` file included in the starting project gives you hints about component structure through its CSS selectors.

---

## Why This Matters

This is where the rubber meets the road. Individual concepts are easy in isolation. The real skill is knowing:

- **When** to create a new component vs keeping things in one component
- **Where** to manage state (local vs lifted vs context)
- **How** to structure data flow between components
- **What** to put in effects vs event handlers

Building a complete project forces you to make all these decisions together.

---

## Multiple Solutions Exist

There is no single "correct" solution. You might:
- Use `useReducer` where someone else uses `useState`
- Create more or fewer components
- Structure your folders differently
- Handle errors differently

All of these are valid. The upcoming lectures show **one** solution — use it as a comparison point, not a checklist.

---

## ✅ Key Takeaways

- This project combines **all core React concepts**: components, state, context, effects, HTTP, forms
- Both the frontend dev server and backend server must be running simultaneously
- Try building it yourself first — the struggle is where the real learning happens
- There's no single right answer; the solution shown is one of many valid approaches

## 💡 Pro Tip

If the full challenge feels overwhelming, break it into smaller pieces:
1. First, just render the header
2. Then fetch and display meals
3. Then add cart functionality
4. Then add the checkout form
5. Finally, wire up backend communication

One step at a time. Each step is manageable on its own.
